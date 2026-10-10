import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { awardEconomyRewardsTx } from '../services/economyService.js';

function getPeriodKey(isDaily: boolean): string {
  const now = new Date();
  if (isDaily) {
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  } else {
    // Week format: YYYY-Www
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNum}`;
  }
}

export async function getQuests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const dailyPeriodKey = getPeriodKey(true);
    const weeklyPeriodKey = getPeriodKey(false);

    // Fetch all quests
    const quests = await prisma.quest.findMany({
      where: { isActive: true },
      orderBy: [{ isDaily: 'desc' }, { coinsReward: 'asc' }],
    });

    // Fetch user claims for current periods
    const claims = await prisma.questClaim.findMany({
      where: {
        userId,
        OR: [
          { periodKey: dailyPeriodKey },
          { periodKey: weeklyPeriodKey },
        ],
      },
    });

    const claimedQuestIds = new Set(claims.map((c) => c.questId));

    // Calculate user progress for active quests
    const [discoveryCount, careCount, growthCount, observationCount] = await Promise.all([
      prisma.discovery.count({ where: { userId } }),
      prisma.careLog.count({ where: { userId } }),
      prisma.growthEntry.count({ where: { userId } }),
      prisma.observation.count({ where: { userId } }),
    ]);

    const formattedQuests = quests.map((q) => {
      const isClaimed = claimedQuestIds.has(q.id);
      let currentCount = 0;

      if (q.category === 'discovery') currentCount = discoveryCount;
      else if (q.category === 'care') currentCount = careCount;
      else if (q.category === 'growth') currentCount = growthCount;
      else if (q.category === 'outdoor') currentCount = observationCount;

      const isCompleted = isClaimed || currentCount >= q.targetCount;

      return {
        id: q.id,
        title: q.title,
        description: q.description,
        category: q.category,
        coinsReward: q.coinsReward,
        xpReward: q.xpReward,
        isDaily: q.isDaily,
        targetCount: q.targetCount,
        currentCount: Math.min(q.targetCount, currentCount),
        iconName: q.iconName,
        isCompleted,
        isClaimed,
        completedAt: isClaimed ? claims.find((c) => c.questId === q.id)?.claimedAt : undefined,
      };
    });

    res.status(200).json({
      success: true,
      data: { quests: formattedQuests },
    });
  } catch (err) {
    next(err);
  }
}

export async function claimQuestReward(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id: questId } = req.params;

    const quest = await prisma.quest.findUnique({
      where: { id: questId },
    });

    if (!quest) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Quest not found.' },
      });
      return;
    }

    const periodKey = getPeriodKey(quest.isDaily);

    const result = await prisma.$transaction(async (tx) => {
      // Check if already claimed for this period
      const existingClaim = await tx.questClaim.findUnique({
        where: {
          userId_questId_periodKey: {
            userId,
            questId,
            periodKey,
          },
        },
      });

      if (existingClaim) {
        throw new Error('QUEST_ALREADY_CLAIMED');
      }

      // Check completion criteria on server
      let currentProgress = 0;
      if (quest.category === 'discovery') {
        currentProgress = await tx.discovery.count({ where: { userId } });
      } else if (quest.category === 'care') {
        currentProgress = await tx.careLog.count({ where: { userId } });
      } else if (quest.category === 'growth') {
        currentProgress = await tx.growthEntry.count({ where: { userId } });
      } else if (quest.category === 'outdoor') {
        currentProgress = await tx.observation.count({ where: { userId } });
      }

      if (currentProgress < quest.targetCount) {
        throw new Error('QUEST_REQUIREMENTS_NOT_MET');
      }

      // Create claim record
      const claim = await tx.questClaim.create({
        data: {
          questId,
          userId,
          periodKey,
        },
      });

      // Award rewards atomically
      const rewardResult = await awardEconomyRewardsTx(tx, {
        userId,
        coins: quest.coinsReward,
        xp: quest.xpReward,
        description: `Claimed Quest: ${quest.title}`,
        type: 'quest_reward',
        referenceId: claim.id,
      });

      return { claim, rewardResult };
    });

    res.status(200).json({
      success: true,
      data: {
        questId,
        coinsAwarded: quest.coinsReward,
        xpAwarded: quest.xpReward,
        user: result.rewardResult.user,
        levelUp: result.rewardResult.levelUp,
        bonusCoins: result.rewardResult.bonusCoins,
      },
    });
  } catch (err: any) {
    if (err.message === 'QUEST_ALREADY_CLAIMED') {
      res.status(400).json({
        success: false,
        error: {
          code: 'QUEST_ALREADY_CLAIMED',
          message: 'You have already claimed this quest reward for the current period.',
        },
      });
      return;
    }
    if (err.message === 'QUEST_REQUIREMENTS_NOT_MET') {
      res.status(400).json({
        success: false,
        error: {
          code: 'QUEST_REQUIREMENTS_NOT_MET',
          message: 'You have not completed the requirements for this quest yet.',
        },
      });
      return;
    }
    next(err);
  }
}
