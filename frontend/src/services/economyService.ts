import { db } from '../db';
import { UserProfile, TransactionRecord, GardenShopItem } from '../types';
import confetti from 'canvas-confetti';

export const REWARD_VALUES = {
  IDENTIFY_PLANT: { coins: 20, xp: 25, label: 'Identified a new plant' },
  CARE_TASK: { coins: 10, xp: 10, label: 'Logged plant care activity' },
  GROWTH_PHOTO: { coins: 30, xp: 35, label: 'Added dated growth timeline photo' },
  NATURE_OBSERVATION: { coins: 25, xp: 30, label: 'Completed Go Outside nature observation' },
  LEVEL_UP_BONUS: { coins: 50, xp: 0, label: 'Level up bonus' }
};

export function calculateXpForNextLevel(level: number): number {
  return level * 100;
}

export interface AwardResult {
  newCoins: number;
  newXp: number;
  newLevel: number;
  didLevelUp: boolean;
  coinsEarned: number;
  xpEarned: number;
}

export function fireConfetti(): void {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    // Check if canvas 2D context is supported
    const testCanvas = document.createElement('canvas');
    if (!testCanvas.getContext || !testCanvas.getContext('2d')) return;

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#f59e0b', '#38bdf8', '#a855f7', '#ec4899']
    });
  } catch {
    // Ignore in non-DOM/test environments
  }
}

/**
 * Awards coins and XP to the user, checks for level-ups, unlocks applicable shop items, and logs the transaction.
 */
export async function awardEconomyRewards(
  coins: number,
  xp: number,
  reason: string,
  transactionType: TransactionRecord['type'] = 'quest_reward'
): Promise<AwardResult> {
  let profile = await db.profile.get('default-user');
  if (!profile) {
    profile = {
      id: 'default-user',
      username: 'Botanical Wanderer',
      floraCoins: 50,
      xp: 0,
      level: 1,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      streakDays: 1
    };
    await db.profile.put(profile);
  }

  let currentCoins = profile.floraCoins + coins;
  let currentXp = profile.xp + xp;
  let currentLevel = profile.level;
  let didLevelUp = false;

  let xpNeeded = calculateXpForNextLevel(currentLevel);
  while (currentXp >= xpNeeded) {
    currentXp -= xpNeeded;
    currentLevel += 1;
    currentCoins += REWARD_VALUES.LEVEL_UP_BONUS.coins;
    didLevelUp = true;
    xpNeeded = calculateXpForNextLevel(currentLevel);
  }

  // Update user profile in IndexedDB
  await db.profile.update('default-user', {
    floraCoins: currentCoins,
    xp: currentXp,
    level: currentLevel,
    lastActiveAt: new Date().toISOString()
  });

  // Record transaction log
  if (coins !== 0) {
    await db.transactions.add({
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: transactionType,
      amount: coins,
      currency: 'coins',
      description: `${reason} (+${coins} Flora Coins)`
    });
  }

  if (xp !== 0) {
    await db.transactions.add({
      id: `tx-xp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: transactionType,
      amount: xp,
      currency: 'xp',
      description: `${reason} (+${xp} XP)`
    });
  }

  if (didLevelUp) {
    fireConfetti();
    // Unlock shop items eligible for this level
    const lockedItems = await db.shopItems.where('unlocked').equals(0 as any).toArray();
    for (const item of lockedItems) {
      if (item.requiredLevel <= currentLevel) {
        await db.shopItems.update(item.id, { unlocked: true });
      }
    }
  }

  return {
    newCoins: currentCoins,
    newXp: currentXp,
    newLevel: currentLevel,
    didLevelUp,
    coinsEarned: coins,
    xpEarned: xp
  };
}

/**
 * Purchases an item from the virtual garden shop.
 */
export async function purchaseShopItem(itemId: string): Promise<{ success: boolean; message: string }> {
  const profile = await db.profile.get('default-user');
  const item = await db.shopItems.get(itemId);

  if (!profile || !item) {
    return { success: false, message: 'Item or profile not found.' };
  }

  if (profile.level < item.requiredLevel) {
    return { success: false, message: `Requires Level ${item.requiredLevel} to purchase.` };
  }

  if (profile.floraCoins < item.price) {
    return { success: false, message: `Insufficient Flora Coins. You need ${item.price} coins.` };
  }

  // Deduct coins
  const newCoins = profile.floraCoins - item.price;
  await db.profile.update('default-user', { floraCoins: newCoins });

  // Unlock item in shop
  await db.shopItems.update(itemId, { unlocked: true });

  // Log purchase transaction
  await db.transactions.add({
    id: `tx-buy-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'shop_purchase',
    amount: -item.price,
    currency: 'coins',
    description: `Purchased ${item.name} for ${item.price} Flora Coins`
  });

  fireConfetti();
  return { success: true, message: `Purchased ${item.name}! Added to your inventory.` };
}
