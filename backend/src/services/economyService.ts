import { PrismaClient } from '@prisma/client';

export function calculateLevel(xp: number): number {
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 450) return 3;
  if (xp < 700) return 4;
  if (xp < 1000) return 5;
  if (xp < 1400) return 6;
  if (xp < 1900) return 7;
  if (xp < 2500) return 8;
  if (xp < 3200) return 9;
  return Math.min(50, 10 + Math.floor((xp - 3200) / 800));
}

export function calculateXpForNextLevel(level: number): number {
  const thresholds: Record<number, number> = {
    1: 100,
    2: 250,
    3: 450,
    4: 700,
    5: 1000,
    6: 1400,
    7: 1900,
    8: 2500,
    9: 3200,
  };
  return thresholds[level] || 3200 + (level - 9) * 800;
}

export interface AwardRewardParams {
  userId: string;
  coins: number;
  xp: number;
  description: string;
  type: 'quest_reward' | 'care_reward' | 'discovery_reward' | 'level_reward' | 'shop_purchase';
  referenceId?: string;
}

export async function awardEconomyRewardsTx(
  tx: any,
  params: AwardRewardParams
): Promise<{ user: any; levelUp: boolean; bonusCoins: number }> {
  const user = await tx.user.findUnique({
    where: { id: params.userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const oldLevel = user.level;
  const newXp = user.xp + Math.max(0, params.xp);
  const calculatedNewLevel = calculateLevel(newXp);
  const levelUp = calculatedNewLevel > oldLevel;
  const bonusCoins = levelUp ? (calculatedNewLevel - oldLevel) * 50 : 0;

  const finalCoinBalance = Math.max(0, user.coins + params.coins + bonusCoins);

  const updatedUser = await tx.user.update({
    where: { id: params.userId },
    data: {
      xp: newXp,
      level: calculatedNewLevel,
      coins: finalCoinBalance,
      lastActiveAt: new Date(),
    },
  });

  // Record main transaction
  if (params.coins !== 0 || params.xp !== 0) {
    await tx.coinTransaction.create({
      data: {
        userId: params.userId,
        amount: params.coins,
        currency: 'coins',
        balanceAfter: finalCoinBalance - bonusCoins,
        type: params.type,
        description: params.description,
        referenceId: params.referenceId,
      },
    });
  }

  // Record level up bonus transaction if applicable
  if (levelUp && bonusCoins > 0) {
    await tx.coinTransaction.create({
      data: {
        userId: params.userId,
        amount: bonusCoins,
        currency: 'coins',
        balanceAfter: finalCoinBalance,
        type: 'level_reward',
        description: `Level Up Bonus! Reached Level ${calculatedNewLevel}`,
      },
    });
  }

  return { user: updatedUser, levelUp, bonusCoins };
}
