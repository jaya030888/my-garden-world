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
  // SEEDS (Real Botanical Growth Pipeline)
  {
    id: 'seed-marigold',
    name: 'English Marigold Seeds',
    category: 'plant',
    description: 'Sow Calendula seeds. Grows through seed, sprout, and radiant golden bloom stages.',
    price: 15,
    requiredLevel: 1,
    iconSvg: 'sparkles',
    previewColor: '#f59e0b',
    unlocked: true,
  },
  {
    id: 'seed-sunflower',
    name: 'Giant Sunflower Seeds',
    category: 'plant',
    description: 'Sow Helianthus seeds to grow tall solar blossoms that track the day.',
    price: 25,
    requiredLevel: 1,
    iconSvg: 'sun',
    previewColor: '#eab308',
    unlocked: true,
  },
  {
    id: 'seed-rose',
    name: 'Wild Rose Seeds',
    category: 'plant',
    description: 'Sow fragrant heirloom Rosa canina seeds.',
    price: 35,
    requiredLevel: 2,
    iconSvg: 'heart',
    previewColor: '#e11d48',
    unlocked: false,
  },
  {
    id: 'seed-daisy',
    name: 'Meadow Daisy Seeds',
    category: 'plant',
    description: 'Sow cheerful Bellis perennis seeds that create sweet white floral clusters.',
    price: 20,
    requiredLevel: 1,
    iconSvg: 'flower',
    previewColor: '#ffffff',
    unlocked: true,
  },
  {
    id: 'seed-lavender',
    name: 'English Lavender Seeds',
    category: 'plant',
    description: 'Aromatic purple lavender spires that soothe the garden breeze.',
    price: 40,
    requiredLevel: 2,
    iconSvg: 'sparkles',
    previewColor: '#a855f7',
    unlocked: false,
  },
  {
    id: 'seed-monstera',
    name: 'Tropical Monstera Cuttings',
    category: 'plant',
    description: 'Cultivate magnificent split-leaf tropical foliage.',
    price: 60,
    requiredLevel: 3,
    iconSvg: 'leaf',
    previewColor: '#16a34a',
    unlocked: false,
  },

  // FLORA & MATURE PLANTS
  {
    id: 'vp-marigold',
    name: 'English Marigold',
    category: 'plant',
    description: 'Velvety golden-orange blossoms that protect the soil.',
    price: 30,
    requiredLevel: 1,
    iconSvg: 'sparkles',
    previewColor: '#f59e0b',
    unlocked: true,
  },
  {
    id: 'vp-sunflower',
    name: 'Golden Sunflower',
    category: 'plant',
    description: 'Radiant heliotropic bloom celebrating the morning sun.',
    price: 50,
    requiredLevel: 2,
    iconSvg: 'sun',
    previewColor: '#eab308',
    unlocked: false,
  },
  {
    id: 'vp-rose',
    name: 'Wild Crimson Rose',
    category: 'plant',
    description: 'Deep scarlet petals with rich botanical fragrance.',
    price: 65,
    requiredLevel: 2,
    iconSvg: 'heart',
    previewColor: '#e11d48',
    unlocked: false,
  },
  {
    id: 'vp-daisy',
    name: 'Common Daisy',
    category: 'plant',
    description: 'Crisp white composite petals with a cheerful sunny center.',
    price: 35,
    requiredLevel: 1,
    iconSvg: 'flower',
    previewColor: '#ffffff',
    unlocked: true,
  },
  {
    id: 'vp-lavender',
    name: 'Fragrant Lavender Bush',
    category: 'plant',
    description: 'Soothing purple spires attracting friendly bumblebees.',
    price: 60,
    requiredLevel: 2,
    iconSvg: 'sparkles',
    previewColor: '#a855f7',
    unlocked: false,
  },
  {
    id: 'vp-monstera',
    name: 'Verdant Monstera',
    category: 'plant',
    description: 'Iconic split-leaf tropical beauty with lush rainforest energy.',
    price: 80,
    requiredLevel: 3,
    iconSvg: 'leaf',
    previewColor: '#22c55e',
    unlocked: false,
  },
  {
    id: 'vp-hibiscus',
    name: 'Tropical Red Hibiscus',
    category: 'plant',
    description: 'Vibrant exotic trumpet bloom with prominent golden stamen.',
    price: 75,
    requiredLevel: 3,
    iconSvg: 'flower',
    previewColor: '#dc2626',
    unlocked: false,
  },
  {
    id: 'vp-bonsai',
    name: 'Ancient Juniper Bonsai',
    category: 'plant',
    description: 'A miniature weathered tree symbolizing tranquility and patience.',
    price: 120,
    requiredLevel: 4,
    iconSvg: 'trees',
    previewColor: '#15803d',
    unlocked: false,
  },

  // TERRAIN & WATER FEATURES
  {
    id: 'tile-soil-bed',
    name: 'Rich Organic Soil Bed',
    category: 'path',
    description: 'Nutrient-rich tilled garden plot ideal for sowing botanical seeds.',
    price: 10,
    requiredLevel: 1,
    iconSvg: 'box',
    previewColor: '#5d4037',
    unlocked: true,
  },
  {
    id: 'tile-cobblestone',
    name: 'Cobblestone Path',
    category: 'path',
    description: 'Classic rustic stone pavers for winding garden walkways.',
    price: 20,
    requiredLevel: 1,
    iconSvg: 'footprints',
    previewColor: '#78716c',
    unlocked: true,
  },
  {
    id: 'tile-stepping-stone',
    name: 'River Stepping Stones',
    category: 'path',
    description: 'Smooth organic river stones nestled into the lawn.',
    price: 25,
    requiredLevel: 1,
    iconSvg: 'footprints',
    previewColor: '#a8a29e',
    unlocked: true,
  },
  {
    id: 'tile-pond',
    name: 'Crystal Lily Pond',
    category: 'path',
    description: 'Serene shimmering pond tile with floating water lilies.',
    price: 70,
    requiredLevel: 2,
    iconSvg: 'droplet',
    previewColor: '#0284c7',
    unlocked: false,
  },

  // COZY FURNITURE & DECORATIONS
  {
    id: 'dec-birdbath',
    name: 'Carved Stone Birdbath',
    category: 'decoration',
    description: 'Carved natural stone basin where wild songbirds come to drink.',
    price: 45,
    requiredLevel: 1,
    iconSvg: 'droplet',
    previewColor: '#64748b',
    unlocked: true,
  },
  {
    id: 'pot-ceramic-teal',
    name: 'Glazed Jade Ceramic Pot',
    category: 'pot',
    description: 'Artisan glazed teal planter with crackle finish.',
    price: 50,
    requiredLevel: 2,
    iconSvg: 'shield',
    previewColor: '#0d9488',
    unlocked: false,
  },
  {
    id: 'dec-fountain',
    name: 'Classical Tiered Fountain',
    category: 'decoration',
    description: 'Bubbling stone fountain that fills the sanctuary with gentle water sounds.',
    price: 90,
    requiredLevel: 2,
    iconSvg: 'waves',
    previewColor: '#38bdf8',
    unlocked: false,
  },
  {
    id: 'dec-bench',
    name: 'Rustic Oak Garden Bench',
    category: 'decoration',
    description: 'Handcrafted timber bench for resting and watching flowers bloom.',
    price: 45,
    requiredLevel: 1,
    iconSvg: 'box',
    previewColor: '#d97706',
    unlocked: true,
  },
  {
    id: 'dec-lantern',
    name: 'Stone Pagoda Lantern',
    category: 'decoration',
    description: 'Warm glowing stone beacon that illuminates twilight paths.',
    price: 55,
    requiredLevel: 2,
    iconSvg: 'flame',
    previewColor: '#f59e0b',
    unlocked: false,
  },
  {
    id: 'dec-cottage',
    name: 'Botanical Greenhouse Cottage',
    category: 'decoration',
    description: 'Charming thatched sanctuary cabin with terracotta pots and herb boxes.',
    price: 180,
    requiredLevel: 4,
    iconSvg: 'home',
    previewColor: '#ea580c',
    unlocked: false,
  },
  {
    id: 'dec-fence',
    name: 'Woven Willow Picket Fence',
    category: 'decoration',
    description: 'Delicate wooden border fencing to frame flower beds and pathways.',
    price: 15,
    requiredLevel: 1,
    iconSvg: 'shield',
    previewColor: '#b45309',
    unlocked: true,
  },
  {
    id: 'dec-pot-terracotta',
    name: 'Artisan Terracotta Planter',
    category: 'pot',
    description: 'Warm earthen clay vessel with breathable walls for root health.',
    price: 25,
    requiredLevel: 1,
    iconSvg: 'box',
    previewColor: '#c2410c',
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
