import Dexie, { type Table } from 'dexie';
import {
  PlantRecord,
  IdentificationResult,
  Quest,
  NatureObservation,
  UserProfile,
  GardenShopItem,
  PlacedGardenItem,
  TransactionRecord,
  Achievement
} from '../types';

export class GardenDatabase extends Dexie {
  plants!: Table<PlantRecord, string>;
  discoveries!: Table<IdentificationResult, string>;
  quests!: Table<Quest, string>;
  observations!: Table<NatureObservation, string>;
  profile!: Table<UserProfile, string>;
  gardenLayout!: Table<PlacedGardenItem, string>;
  shopItems!: Table<GardenShopItem, string>;
  transactions!: Table<TransactionRecord, string>;
  achievements!: Table<Achievement, string>;

  constructor() {
    super('MyGardenWorldDB');
    this.version(1).stores({
      plants: 'id, species, acquiredDate, location',
      discoveries: 'id, timestamp, confidenceTier, isSaved',
      quests: 'id, category, isDaily, isCompleted',
      observations: 'id, timestamp',
      profile: 'id',
      gardenLayout: 'instanceId, itemId, [gridX+gridY]',
      shopItems: 'id, category, price, requiredLevel, unlocked',
      transactions: 'id, timestamp, type',
      achievements: 'id, category, unlocked'
    });
  }
}

export const db = new GardenDatabase();

// Starter seed data for fresh installs
export const INITIAL_SHOP_ITEMS: GardenShopItem[] = [
  // Virtual Plants (At least 3)
  {
    id: 'vp-monstera',
    name: 'Verdant Monstera',
    category: 'plant',
    description: 'Iconic split-leaf tropical beauty that brings lush jungle energy.',
    price: 40,
    requiredLevel: 1,
    iconSvg: 'leaf',
    previewColor: '#22c55e',
    unlocked: true,
  },
  {
    id: 'vp-sunflower',
    name: 'Golden Solar Bloom',
    category: 'plant',
    description: 'Radiant heliotropic sunflower that tracks sunlight across the garden.',
    price: 60,
    requiredLevel: 2,
    iconSvg: 'sun',
    previewColor: '#eab308',
    unlocked: false,
  },
  {
    id: 'vp-lavender',
    name: 'Fragrant Lavender Bush',
    category: 'plant',
    description: 'Soothing purple spires that attract friendly virtual honeybees.',
    price: 75,
    requiredLevel: 3,
    iconSvg: 'sparkles',
    previewColor: '#a855f7',
    unlocked: false,
  },
  {
    id: 'vp-bonsai',
    name: 'Ancient Juniper Bonsai',
    category: 'plant',
    description: 'A 50-year-old miniature tree symbolizing patience and harmony.',
    price: 150,
    requiredLevel: 5,
    iconSvg: 'trees',
    previewColor: '#15803d',
    unlocked: false,
  },

  // Virtual Pots (At least 3)
  {
    id: 'pot-terracotta',
    name: 'Classic Terracotta Pot',
    category: 'pot',
    description: 'Earthy porous clay pot with warm Mediterranean charm.',
    price: 25,
    requiredLevel: 1,
    iconSvg: 'box',
    previewColor: '#b45309',
    unlocked: true,
  },
  {
    id: 'pot-ceramic-teal',
    name: 'Glazed Jade Ceramic',
    category: 'pot',
    description: 'Artisan glazed teal planter with crackle finish.',
    price: 50,
    requiredLevel: 2,
    iconSvg: 'shield',
    previewColor: '#0d9488',
    unlocked: false,
  },
  {
    id: 'pot-marble-gold',
    name: 'White Marble & Brass Pot',
    category: 'pot',
    description: 'Luxurious carved marble vessel with brushed gold accents.',
    price: 110,
    requiredLevel: 4,
    iconSvg: 'award',
    previewColor: '#d97706',
    unlocked: false,
  },

  // Virtual Decorations (At least 3)
  {
    id: 'dec-birdbath',
    name: 'Stone Birdbath',
    category: 'decoration',
    description: 'Carved natural stone basin where wild songbirds come to drink.',
    price: 45,
    requiredLevel: 1,
    iconSvg: 'droplet',
    previewColor: '#64748b',
    unlocked: true,
  },
  {
    id: 'dec-solar-lantern',
    name: 'Fairy Solar Lantern',
    category: 'decoration',
    description: 'Warm glowing garden lantern that lights up in evening twilight.',
    price: 70,
    requiredLevel: 2,
    iconSvg: 'flame',
    previewColor: '#f97316',
    unlocked: false,
  },
  {
    id: 'dec-zen-fountain',
    name: 'Bamboo Zen Waterwheel',
    category: 'decoration',
    description: 'Tranquil flowing water fountain creating soothing ambient sounds.',
    price: 120,
    requiredLevel: 3,
    iconSvg: 'waves',
    previewColor: '#0284c7',
    unlocked: false,
  },
  {
    id: 'dec-stepping-stones',
    name: 'River Pebble Pathway',
    category: 'decoration',
    description: 'Smooth river stone trail meandering through your botanical garden.',
    price: 35,
    requiredLevel: 1,
    iconSvg: 'footprints',
    previewColor: '#78716c',
    unlocked: true,
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-discover',
    title: 'First Botanical Lens',
    description: 'Use the open AI model to identify your first real-world plant.',
    icon: 'camera',
    category: 'discover',
    unlocked: false,
    xpReward: 50,
    coinReward: 30
  },
  {
    id: 'ach-green-thumb',
    title: 'Nurturing Soul',
    description: 'Log 5 care activities for your real plants.',
    icon: 'droplets',
    category: 'grow',
    unlocked: false,
    xpReward: 40,
    coinReward: 25
  },
  {
    id: 'ach-outside-explorer',
    title: 'Grass Toucher Master',
    description: 'Complete a 15+ minute Go Outside nature observation session.',
    icon: 'compass',
    category: 'play',
    unlocked: false,
    xpReward: 60,
    coinReward: 40
  },
  {
    id: 'ach-garden-designer',
    title: 'Master Landscaper',
    description: 'Place 5 items in your interactive virtual garden.',
    icon: 'sparkles',
    category: 'play',
    unlocked: false,
    xpReward: 50,
    coinReward: 35
  },
  {
    id: 'ach-timeline-keeper',
    title: 'Witness to Growth',
    description: 'Record dated growth comparison photographs for a plant.',
    icon: 'calendar',
    category: 'grow',
    unlocked: false,
    xpReward: 45,
    coinReward: 30
  }
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest-daily-discover',
    title: 'Wild Plant Discovery',
    description: 'Scan and identify any outdoor wild plant or blossom using AI.',
    category: 'discovery',
    coinsReward: 20,
    xpReward: 25,
    isDaily: true,
    isCompleted: false,
    targetCount: 1,
    currentCount: 0,
    iconName: 'scan'
  },
  {
    id: 'quest-daily-care',
    title: 'Mindful Caregiver',
    description: 'Check soil moisture and log care (water, mist, or sun) for your plants.',
    category: 'care',
    coinsReward: 10,
    xpReward: 10,
    isDaily: true,
    isCompleted: false,
    targetCount: 1,
    currentCount: 0,
    iconName: 'droplet'
  },
  {
    id: 'quest-go-outside',
    title: 'Touch Grass Observation',
    description: 'Step outside into nature for at least 10 minutes and record what you sensed.',
    category: 'outdoor',
    coinsReward: 25,
    xpReward: 30,
    isDaily: true,
    isCompleted: false,
    targetCount: 1,
    currentCount: 0,
    iconName: 'sun'
  },
  {
    id: 'quest-growth-snap',
    title: 'Weekly Growth Chronicle',
    description: 'Capture a fresh growth photo to compare against earlier timeline stages.',
    category: 'growth',
    coinsReward: 30,
    xpReward: 35,
    isDaily: false,
    isCompleted: false,
    targetCount: 1,
    currentCount: 0,
    iconName: 'camera'
  }
];

export const INITIAL_PLANTS: PlantRecord[] = [
  {
    id: 'starter-pothos',
    name: 'Aurelia the Golden Pothos',
    species: 'Golden Pothos',
    scientificName: 'Epipremnum aureum',
    family: 'Araceae',
    acquiredDate: '2026-08-15T09:00:00.000Z',
    primaryPhotoUrl: 'https://images.unsplash.com/photo-1596724817757-9755f78c50c6?w=600&q=80',
    location: 'indoor',
    sunlightNeeds: 'indirect_bright',
    waterFrequencyDays: 7,
    lastWateredDate: '2026-10-06T14:30:00.000Z',
    notes: 'Placed on the north windowsill. Produces 2 fresh leaves every week!',
    growthPhotos: [
      {
        id: 'gp-1',
        plantId: 'starter-pothos',
        photoUrl: 'https://images.unsplash.com/photo-1596724817757-9755f78c50c6?w=600&q=80',
        takenAt: '2026-08-15T09:00:00.000Z',
        stageLabel: 'Starter Cutting',
        notes: 'Just 3 small leaves when adopted.'
      },
      {
        id: 'gp-2',
        plantId: 'starter-pothos',
        photoUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80',
        takenAt: '2026-10-01T11:20:00.000Z',
        stageLabel: 'Lush Trailing Vine',
        notes: 'Vines have extended over 8 inches, deep golden variegation visible.'
      }
    ],
    careHistory: [
      {
        id: 'care-1',
        plantId: 'starter-pothos',
        type: 'water',
        timestamp: '2026-10-06T14:30:00.000Z',
        notes: 'Thorough soak after top 2 inches dried out.',
        xpAwarded: 10
      },
      {
        id: 'care-2',
        plantId: 'starter-pothos',
        type: 'mist',
        timestamp: '2026-10-08T08:15:00.000Z',
        notes: 'Morning misting on new shoot tips.',
        xpAwarded: 10
      }
    ]
  }
];

export const INITIAL_GARDEN_LAYOUT: PlacedGardenItem[] = [
  {
    instanceId: 'starter-item-1',
    itemId: 'vp-monstera',
    gridX: 2,
    gridY: 2,
    rotation: 0,
    placedAt: new Date().toISOString()
  },
  {
    instanceId: 'starter-item-2',
    itemId: 'pot-terracotta',
    gridX: 2,
    gridY: 3,
    rotation: 0,
    placedAt: new Date().toISOString()
  },
  {
    instanceId: 'starter-item-3',
    itemId: 'dec-birdbath',
    gridX: 4,
    gridY: 2,
    rotation: 0,
    placedAt: new Date().toISOString()
  }
];

/**
 * Initializes and seeds database on first launch.
 */
export async function initializeDatabase(): Promise<void> {
  const profileCount = await db.profile.count();
  if (profileCount === 0) {
    await db.profile.add({
      id: 'default-user',
      username: 'Botanical Wanderer',
      floraCoins: 50,
      xp: 0,
      level: 1,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      streakDays: 1
    });

    await db.shopItems.bulkAdd(INITIAL_SHOP_ITEMS);
    await db.achievements.bulkAdd(INITIAL_ACHIEVEMENTS);
    await db.quests.bulkAdd(INITIAL_QUESTS);
    await db.plants.bulkAdd(INITIAL_PLANTS);
    await db.gardenLayout.bulkAdd(INITIAL_GARDEN_LAYOUT);
    
    // Initial starter transaction log
    await db.transactions.add({
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'quest_reward',
      amount: 50,
      currency: 'coins',
      description: 'Welcome to My Garden World! Starter Flora Coins granted.'
    });
  }
}
