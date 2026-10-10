/**
 * Daily Nature Exercise & Outdoor Photo Quest System.
 * Generates daily rotating interactive outdoor exercises (e.g. Photograph 3 different leaves/birds)
 * and handles multi-photo task completion with Flora Coin & XP rewards.
 */

export interface NaturePhotoSlot {
  slotIndex: number;
  label: string; // e.g. "Leaf #1 (Serrated or Rounded)", "Bird #1"
  photoUrl?: string;
  notes?: string;
  capturedAt?: string;
}

export interface DailyNatureExercise {
  id: string;
  dateKey: string; // YYYY-MM-DD
  title: string;
  subtitle: string;
  description: string;
  category: 'leaves' | 'birds' | 'flowers' | 'textures' | 'water';
  targetCount: number;
  coinReward: number;
  xpReward: number;
  seedRewardItemId: string;
  seedRewardName: string;
  slots: NaturePhotoSlot[];
  isCompleted: boolean;
  completedAt?: string;
}

const EXERCISE_TEMPLATES = [
  {
    category: 'leaves' as const,
    title: 'Triple Leaf Explorer',
    subtitle: 'Find & photograph 3 distinct leaf shapes',
    description: 'Step outdoors into a nearby park, street, or yard. Find 3 completely different leaves (e.g., broad oval, serrated edge, lobed maple, or needle).',
    targetCount: 3,
    coinReward: 50,
    xpReward: 60,
    seedRewardItemId: 'seed-marigold',
    seedRewardName: 'English Marigold Seeds',
    slotLabels: [
      'Leaf #1: Broad or Oval Leaf',
      'Leaf #2: Serrated or Jagged Leaf',
      'Leaf #3: Lobed or Compound Leaf'
    ]
  },
  {
    category: 'birds' as const,
    title: 'Avian & Wildlife Watch',
    subtitle: 'Spot & photograph 2 birds or garden creatures',
    description: 'Breathe in the outdoor air and observe nature around you. Capture pictures of 2 different birds, butterflies, or friendly garden visitors.',
    targetCount: 2,
    coinReward: 60,
    xpReward: 75,
    seedRewardItemId: 'seed-sunflower',
    seedRewardName: 'Giant Sunflower Seeds',
    slotLabels: [
      'Creature #1: Perched Bird or Pollinator',
      'Creature #2: Second Wild Bird or Garden Visitor'
    ]
  },
  {
    category: 'flowers' as const,
    title: 'Wild Blossom Hunt',
    subtitle: 'Photograph 3 blooming flowers or buds in sunlight',
    description: 'Search for 3 blooming flowers or blossoming buds growing in gardens, sidewalks, or wild green patches.',
    targetCount: 3,
    coinReward: 55,
    xpReward: 70,
    seedRewardItemId: 'seed-rose',
    seedRewardName: 'Wild Rose Seeds',
    slotLabels: [
      'Blossom #1: Bright Colored Flower',
      'Blossom #2: Small Wildflower or Weed Bloom',
      'Blossom #3: Flower Bud Ready to Open'
    ]
  },
  {
    category: 'textures' as const,
    title: 'Tree Bark & Earth Textures',
    subtitle: 'Capture 2 tree bark or moss formations',
    description: 'Touch and observe tree trunks and rocks. Take photos of 2 distinct natural bark textures or soft moss carpets.',
    targetCount: 2,
    coinReward: 45,
    xpReward: 50,
    seedRewardItemId: 'seed-daisy',
    seedRewardName: 'Meadow Daisy Seeds',
    slotLabels: [
      'Texture #1: Weathered Tree Bark or Rings',
      'Texture #2: Vibrant Green Moss or Stone Pattern'
    ]
  },
  {
    category: 'water' as const,
    title: 'Morning Dew & Sunlight Drops',
    subtitle: 'Find water droplets on 2 natural surfaces',
    description: 'Search for glistening water droplets, morning dew, or rain reflections on green leaves or petals.',
    targetCount: 2,
    coinReward: 50,
    xpReward: 65,
    seedRewardItemId: 'seed-lavender',
    seedRewardName: 'English Lavender Seeds',
    slotLabels: [
      'Droplet #1: Dew on Foliage or Grass',
      'Droplet #2: Water Reflection or Wet Petal'
    ]
  }
];

const STORAGE_KEY = 'floraquest_daily_exercise_state';

/**
 * Gets or initializes today's active outdoor nature exercise.
 */
export function getTodaysNatureExercise(): DailyNatureExercise {
  const todayKey = new Date().toISOString().split('T')[0];

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: DailyNatureExercise = JSON.parse(saved);
        if (parsed.dateKey === todayKey) {
          return parsed;
        }
      } catch {
        // Fallback
      }
    }
  }

  // Deterministically pick today's template based on day number
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const template = EXERCISE_TEMPLATES[dayOfYear % EXERCISE_TEMPLATES.length];

  const initialExercise: DailyNatureExercise = {
    id: `exercise-${todayKey}-${template.category}`,
    dateKey: todayKey,
    title: template.title,
    subtitle: template.subtitle,
    description: template.description,
    category: template.category,
    targetCount: template.targetCount,
    coinReward: template.coinReward,
    xpReward: template.xpReward,
    seedRewardItemId: template.seedRewardItemId,
    seedRewardName: template.seedRewardName,
    slots: template.slotLabels.map((label, idx) => ({
      slotIndex: idx,
      label,
      photoUrl: undefined
    })),
    isCompleted: false
  };

  saveNatureExerciseState(initialExercise);
  return initialExercise;
}

/**
 * Saves current exercise progress to localStorage.
 */
export function saveNatureExerciseState(exercise: DailyNatureExercise): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exercise));
  }
}

/**
 * Updates a photo slot with a captured image base64/URL.
 */
export function updatePhotoSlot(
  exercise: DailyNatureExercise,
  slotIndex: number,
  photoUrl: string,
  notes?: string
): DailyNatureExercise {
  const updatedSlots = exercise.slots.map(slot => {
    if (slot.slotIndex === slotIndex) {
      return {
        ...slot,
        photoUrl,
        notes,
        capturedAt: new Date().toISOString()
      };
    }
    return slot;
  });

  const updated: DailyNatureExercise = {
    ...exercise,
    slots: updatedSlots
  };

  saveNatureExerciseState(updated);
  return updated;
}
