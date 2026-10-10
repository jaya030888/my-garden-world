// Strict types for My Garden World

export type PlantCareType = 'water' | 'fertilize' | 'prune' | 'repot' | 'mist' | 'sunlight_adjust' | 'observation';

export interface CareActivity {
  id: string;
  plantId: string;
  type: PlantCareType;
  timestamp: string; // ISO string
  notes?: string;
  xpAwarded: number;
}

export interface GrowthPhoto {
  id: string;
  plantId: string;
  photoUrl: string; // Base64 or object URL
  takenAt: string; // ISO string
  notes?: string;
  stageLabel?: string; // e.g., "Seedling", "Sprout", "Mature", "Flowering"
}

export interface PlantRecord {
  id: string;
  name: string;
  species: string;
  scientificName?: string;
  family?: string;
  acquiredDate: string; // ISO string
  primaryPhotoUrl: string;
  location?: 'indoor' | 'outdoor' | 'balcony' | 'greenhouse' | 'garden_bed';
  sunlightNeeds: 'full_sun' | 'partial_sun' | 'indirect_bright' | 'low_light';
  waterFrequencyDays: number;
  lastWateredDate?: string;
  lastFertilizedDate?: string;
  notes?: string;
  growthPhotos: GrowthPhoto[];
  careHistory: CareActivity[];
  isCustom?: boolean;
}

export interface BotanicalInfo {
  speciesName: string;
  commonNames: string[];
  scientificName: string;
  family: string;
  description: string;
  nativeRegion: string;
  sunlight: string;
  watering: string;
  soil: string;
  humidity: string;
  toxicity: string;
  petSafe: boolean;
  propagation: string;
  ecologicalFact: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  tags: string[];
}

export interface ClassificationPrediction {
  label: string;
  score: number; // 0.0 to 1.0
  botanicalInfo?: BotanicalInfo;
}

export interface IdentificationResult {
  id: string;
  timestamp: string;
  imageUrl: string;
  topPrediction: ClassificationPrediction;
  alternativePredictions: ClassificationPrediction[];
  inferenceTimeMs: number;
  modelName: string;
  confidenceTier: 'high' | 'moderate' | 'uncertain';
  notes?: string;
  isSaved: boolean;
}

export type QuestCategory = 'discovery' | 'care' | 'growth' | 'outdoor';

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  coinsReward: number;
  xpReward: number;
  isDaily: boolean;
  isCompleted: boolean;
  completedAt?: string;
  targetCount: number;
  currentCount: number;
  iconName: string;
}

export interface NatureObservation {
  id: string;
  timestamp: string;
  durationMinutes: number;
  locationDescription: string;
  floraObserved: string[];
  sensoryNotes: string;
  weatherCondition?: string;
  coinsEarned: number;
  xpEarned: number;
}

export interface UserProfile {
  id: string;
  username: string;
  floraCoins: number;
  xp: number;
  level: number;
  createdAt: string;
  lastActiveAt: string;
  streakDays: number;
}

export type GardenItemCategory = 'plant' | 'pot' | 'decoration' | 'path';

export interface GardenShopItem {
  id: string;
  name: string;
  category: GardenItemCategory;
  description: string;
  price: number;
  requiredLevel: number;
  iconSvg: string;
  previewColor: string;
  unlocked: boolean;
}

export interface PlacedGardenItem {
  instanceId: string;
  itemId: string;
  gridX: number; // 0 to 7
  gridY: number; // 0 to 7
  rotation: number; // 0, 90, 180, 270
  placedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'discover' | 'grow' | 'play' | 'special';
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
  coinReward: number;
}

export interface TransactionRecord {
  id: string;
  timestamp: string;
  type: 'quest_reward' | 'care_reward' | 'discovery_reward' | 'shop_purchase' | 'level_reward';
  amount: number; // positive or negative
  currency: 'coins' | 'xp';
  description: string;
}
