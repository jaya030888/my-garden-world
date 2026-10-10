import { describe, it, expect, beforeEach } from 'vitest';
import { db, initializeDatabase } from '../db';
import { trackQuestAction, submitNatureObservation } from '../services/questEngine';

describe('Quest Engine & Duplicate Protection', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await initializeDatabase();
  });

  it('initializes default daily and weekly quests', async () => {
    const quests = await db.quests.toArray();
    expect(quests.length).toBeGreaterThanOrEqual(4);
    const discoveryQuest = quests.find(q => q.category === 'discovery');
    expect(discoveryQuest).toBeDefined();
    expect(discoveryQuest?.isCompleted).toBe(false);
  });

  it('completes quest upon reaching target count and awards rewards', async () => {
    const profileBefore = await db.profile.get('default-user');
    const initialCoins = profileBefore?.floraCoins || 0;

    const result = await trackQuestAction('discovery', 1);
    expect(result.completedQuests.length).toBeGreaterThan(0);

    const profileAfter = await db.profile.get('default-user');
    expect(profileAfter?.floraCoins).toBeGreaterThan(initialCoins);

    const completedQuest = await db.quests.get('quest-daily-discover');
    expect(completedQuest?.isCompleted).toBe(true);
  });

  it('does not re-reward already completed quests (duplicate prevention)', async () => {
    // First trigger completes the quest
    await trackQuestAction('care', 1);
    const profileAfterFirst = await db.profile.get('default-user');
    const coinsAfterFirst = profileAfterFirst?.floraCoins || 0;

    // Second trigger on same category should NOT re-award
    const secondResult = await trackQuestAction('care', 1);
    expect(secondResult.completedQuests.length).toBe(0);

    const profileAfterSecond = await db.profile.get('default-user');
    expect(profileAfterSecond?.floraCoins).toBe(coinsAfterFirst);
  });

  it('records nature observations and awards outdoor rewards', async () => {
    const { observation, reward } = await submitNatureObservation({
      durationMinutes: 15,
      locationDescription: 'Forest Ridge Park',
      floraObserved: ['White Oak', 'Wild Daisy'],
      sensoryNotes: 'Crisp morning air and birds singing in the canopy.',
      weatherCondition: 'Sunny'
    });

    expect(observation.id).toBeDefined();
    expect(observation.durationMinutes).toBe(15);
    expect(reward.coinsEarned).toBe(25);
    expect(reward.xpEarned).toBe(30);

    const stored = await db.observations.get(observation.id);
    expect(stored).toBeDefined();
    expect(stored?.locationDescription).toBe('Forest Ridge Park');
  });
});
