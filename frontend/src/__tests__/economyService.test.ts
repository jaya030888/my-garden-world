import { describe, it, expect, beforeEach } from 'vitest';
import { db, initializeDatabase } from '../db';
import {
  calculateXpForNextLevel,
  REWARD_VALUES,
  awardEconomyRewards,
  purchaseShopItem
} from '../services/economyService';

describe('Game Economy & Shop Transactions', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await initializeDatabase();
  });

  it('correctly calculates XP requirements across levels', () => {
    expect(calculateXpForNextLevel(1)).toBe(100);
    expect(calculateXpForNextLevel(2)).toBe(200);
    expect(calculateXpForNextLevel(5)).toBe(500);
  });

  it('awards rewards, accumulates XP and triggers level-up', async () => {
    // Starting with 0 XP, award 150 XP (exceeds Level 1 threshold of 100 XP)
    const result = await awardEconomyRewards(20, 150, 'Completed nature challenges');

    expect(result.didLevelUp).toBe(true);
    expect(result.newLevel).toBe(2);
    expect(result.newXp).toBe(50); // 150 - 100 = 50 remainder
    expect(result.newCoins).toBe(50 + 20 + REWARD_VALUES.LEVEL_UP_BONUS.coins); // 50 initial + 20 + 50 level-up bonus
  });

  it('successfully purchases an affordable and unlocked item', async () => {
    // Initial coins is 50. Birdbath costs 45 and is Level 1
    const res = await purchaseShopItem('dec-birdbath');
    expect(res.success).toBe(true);

    const profile = await db.profile.get('default-user');
    expect(profile?.floraCoins).toBe(5); // 50 - 45 = 5

    const tx = await db.transactions.where('type').equals('shop_purchase').first();
    expect(tx).toBeDefined();
    expect(tx?.amount).toBe(-45);
  });

  it('rejects purchase if coins are insufficient', async () => {
    // Bonsai costs 150, user only has 50
    const res = await purchaseShopItem('vp-bonsai');
    expect(res.success).toBe(false);
    expect(res.message).toContain('Requires Level'); // Bonsai is level 5

    // Lower level item that costs more than balance
    await db.profile.update('default-user', { floraCoins: 10, level: 2 });
    const cheapRes = await purchaseShopItem('pot-ceramic-teal'); // costs 50
    expect(cheapRes.success).toBe(false);
    expect(cheapRes.message).toContain('Insufficient Flora Coins');
  });
});
