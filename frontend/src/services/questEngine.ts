import { db } from '../db';
import { Quest, NatureObservation } from '../types';
import { awardEconomyRewards, REWARD_VALUES, AwardResult } from './economyService';

/**
 * Checks and updates quest progress for a specific category.
 * Prevents duplicate rewards within the same active cycle.
 */
export async function trackQuestAction(
  category: Quest['category'],
  increment = 1
): Promise<{ completedQuests: Quest[]; awardSummary?: AwardResult }> {
  const matchingQuests = await db.quests
    .where('category')
    .equals(category)
    .and(q => !q.isCompleted)
    .toArray();

  const completedQuests: Quest[] = [];
  let totalCoins = 0;
  let totalXp = 0;

  for (const quest of matchingQuests) {
    const newCount = quest.currentCount + increment;
    if (newCount >= quest.targetCount) {
      await db.quests.update(quest.id, {
        currentCount: quest.targetCount,
        isCompleted: true,
        completedAt: new Date().toISOString()
      });
      completedQuests.push(quest);
      totalCoins += quest.coinsReward;
      totalXp += quest.xpReward;
    } else {
      await db.quests.update(quest.id, { currentCount: newCount });
    }
  }

  let awardSummary: AwardResult | undefined;
  if (totalCoins > 0 || totalXp > 0) {
    awardSummary = await awardEconomyRewards(
      totalCoins,
      totalXp,
      `Completed quests: ${completedQuests.map(q => q.title).join(', ')}`,
      'quest_reward'
    );
  }

  await checkAchievementProgress();
  return { completedQuests, awardSummary };
}

/**
 * Submits a completed "Go Outside Mode" nature observation and awards Flora Coins + XP.
 */
export async function submitNatureObservation(data: {
  durationMinutes: number;
  locationDescription: string;
  floraObserved: string[];
  sensoryNotes: string;
  weatherCondition?: string;
}): Promise<{ observation: NatureObservation; reward: AwardResult }> {
  const coins = REWARD_VALUES.NATURE_OBSERVATION.coins;
  const xp = REWARD_VALUES.NATURE_OBSERVATION.xp;

  const observation: NatureObservation = {
    id: `obs-${Date.now()}`,
    timestamp: new Date().toISOString(),
    durationMinutes: Math.max(1, data.durationMinutes),
    locationDescription: data.locationDescription || 'Local Park / Outdoor Trail',
    floraObserved: data.floraObserved.length > 0 ? data.floraObserved : ['Wild Flora', 'Greenery'],
    sensoryNotes: data.sensoryNotes || 'Breathed fresh air and observed sunlight through the leaves.',
    weatherCondition: data.weatherCondition || 'Mild & Sunny',
    coinsEarned: coins,
    xpEarned: xp
  };

  await db.observations.add(observation);

  // Trigger quest progress for outdoor
  await trackQuestAction('outdoor', 1);

  // Award direct observation reward
  const reward = await awardEconomyRewards(
    coins,
    xp,
    `Nature Observation (${data.durationMinutes} min outdoor walk)`,
    'quest_reward'
  );

  await checkAchievementProgress();
  return { observation, reward };
}

/**
 * Evaluates achievement criteria and unlocks earned badges.
 */
export async function checkAchievementProgress(): Promise<void> {
  const discoveriesCount = await db.discoveries.count();
  const plants = await db.plants.toArray();
  const observationsCount = await db.observations.count();
  const gardenItemsCount = await db.gardenLayout.count();

  let totalCareCount = 0;
  let hasGrowthTimeline = false;
  for (const p of plants) {
    totalCareCount += (p.careHistory || []).length;
    if ((p.growthPhotos || []).length >= 2) {
      hasGrowthTimeline = true;
    }
  }

  // Check 1: First Discovery
  if (discoveriesCount >= 1) {
    await unlockAchievement('ach-first-discover');
  }

  // Check 2: Green Thumb (5 care logs)
  if (totalCareCount >= 5) {
    await unlockAchievement('ach-green-thumb');
  }

  // Check 3: Outside Explorer
  if (observationsCount >= 1) {
    await unlockAchievement('ach-outside-explorer');
  }

  // Check 4: Garden Designer
  if (gardenItemsCount >= 4) {
    await unlockAchievement('ach-garden-designer');
  }

  // Check 5: Timeline Keeper
  if (hasGrowthTimeline) {
    await unlockAchievement('ach-timeline-keeper');
  }
}

async function unlockAchievement(achievementId: string): Promise<void> {
  const ach = await db.achievements.get(achievementId);
  if (ach && !ach.unlocked) {
    await db.achievements.update(achievementId, {
      unlocked: true,
      unlockedAt: new Date().toISOString()
    });
    await awardEconomyRewards(
      ach.coinReward,
      ach.xpReward,
      `Achievement Unlocked: ${ach.title}`,
      'quest_reward'
    );
  }
}
