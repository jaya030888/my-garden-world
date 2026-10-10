import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { awardEconomyRewardsTx } from '../services/economyService.js';

const createObservationSchema = z.object({
  durationMinutes: z.number().int().min(1).default(5),
  locationDescription: z.string().min(1, 'Location description is required'),
  floraObserved: z.array(z.string()).default([]),
  sensoryNotes: z.string().min(1, 'Sensory reflection notes are required'),
  weatherCondition: z.string().optional(),
});

export async function getObservations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const observations = await prisma.observation.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    res.status(200).json({
      success: true,
      data: { observations },
    });
  } catch (err) {
    next(err);
  }
}

export async function createObservation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const data = createObservationSchema.parse(req.body);

    const coinsEarned = 35;
    const xpEarned = 60;

    const result = await prisma.$transaction(async (tx) => {
      const observation = await tx.observation.create({
        data: {
          userId,
          timestamp: new Date(),
          durationMinutes: data.durationMinutes,
          locationDescription: data.locationDescription,
          floraObserved: data.floraObserved,
          sensoryNotes: data.sensoryNotes,
          weatherCondition: data.weatherCondition,
          coinsEarned,
          xpEarned,
        },
      });

      // Award Mindfulness reward: 35 coins, 60 XP
      const rewardResult = await awardEconomyRewardsTx(tx, {
        userId,
        coins: coinsEarned,
        xp: xpEarned,
        description: `Completed Go Outside Mode (${data.durationMinutes}m at ${data.locationDescription})`,
        type: 'quest_reward',
        referenceId: observation.id,
      });

      // Check outdoor mindfulness achievement
      const count = await tx.observation.count({ where: { userId } });
      if (count >= 3) {
        await tx.userAchievement.upsert({
          where: { userId_achievementId: { userId, achievementId: 'ach-grass-toucher' } },
          update: {},
          create: {
            userId,
            achievementId: 'ach-grass-toucher',
            unlockedAt: new Date(),
          },
        });
      }

      return { observation, rewardResult };
    });

    res.status(201).json({
      success: true,
      data: {
        observation: result.observation,
        user: result.rewardResult.user,
        levelUp: result.rewardResult.levelUp,
      },
    });
  } catch (err) {
    next(err);
  }
}
