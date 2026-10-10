/**
 * Centralized Garden Simulation Game Rules Engine.
 * Manages plant growth stages, hydration mechanics, harvesting, expansion, and weather.
 */

export type PlantGrowthStage = 'seed' | 'sprout' | 'growing' | 'bloom';
export type SoilMoistureLevel = 'moist' | 'normal' | 'dry';
export type WeatherAtmosphere = 'sunny' | 'golden_hour' | 'twilight' | 'rain';

export interface SimulatedPlantState {
  instanceId: string;
  itemId: string; // e.g., 'seed-marigold', 'vp-sunflower'
  speciesId: string;
  stage: PlantGrowthStage;
  growthProgress: number; // 0 to 100%
  plantedAt: number; // timestamp
  lastWateredAt: number;
  waterCount: number;
  moisture: SoilMoistureLevel;
  isHarvestable: boolean;
  gridX: number;
  gridY: number;
  rotation: number;
}

export interface GardenExpansionTier {
  size: number; // e.g. 6, 8, 10, 12
  label: string;
  requiredLevel: number;
  coinCost: number;
}

export const GARDEN_EXPANSION_TIERS: GardenExpansionTier[] = [
  { size: 6, label: 'Cozy Starter Plot (6x6)', requiredLevel: 1, coinCost: 0 },
  { size: 8, label: 'Blossom Meadow (8x8)', requiredLevel: 2, coinCost: 150 },
  { size: 10, label: 'Botanical Sanctuary (10x10)', requiredLevel: 4, coinCost: 350 },
  { size: 12, label: 'Grand Flora Estate (12x12)', requiredLevel: 6, coinCost: 750 }
];

export interface SpeciesGrowthRule {
  speciesId: string;
  commonName: string;
  scientificName: string;
  seedItemId: string;
  plantItemId: string;
  baseGrowthMinutes: number;
  waterGrowthBoostPercent: number;
  coinHarvestYield: number;
  xpHarvestYield: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic';
  color: string;
  description: string;
  bloomDaysRequired: number; // Daily care streak days required
}

export const SPECIES_GROWTH_RULES: Record<string, SpeciesGrowthRule> = {
  marigold: {
    speciesId: 'marigold',
    commonName: 'Golden Velvet Marigold',
    scientificName: 'Calendula officinalis',
    seedItemId: 'seed-marigold',
    plantItemId: 'vp-marigold',
    baseGrowthMinutes: 2,
    waterGrowthBoostPercent: 35,
    coinHarvestYield: 40,
    xpHarvestYield: 50,
    rarity: 'common',
    color: '#f59e0b',
    description: 'Radiant golden blossom that repels garden pests and protects surrounding soil.',
    bloomDaysRequired: 1
  },
  sunflower: {
    speciesId: 'sunflower',
    commonName: 'Solar Sunburst Helianthus',
    scientificName: 'Helianthus annuus',
    seedItemId: 'seed-sunflower',
    plantItemId: 'vp-sunflower',
    baseGrowthMinutes: 3,
    waterGrowthBoostPercent: 30,
    coinHarvestYield: 60,
    xpHarvestYield: 75,
    rarity: 'common',
    color: '#eab308',
    description: 'Majestic giant solar blossom that tracks the morning daylight.',
    bloomDaysRequired: 2
  },
  rose: {
    speciesId: 'rose',
    commonName: 'Velvet Crimson Rose',
    scientificName: 'Rosa damascena',
    seedItemId: 'seed-rose',
    plantItemId: 'vp-rose',
    baseGrowthMinutes: 4,
    waterGrowthBoostPercent: 25,
    coinHarvestYield: 85,
    xpHarvestYield: 100,
    rarity: 'uncommon',
    color: '#e11d48',
    description: 'Deep crimson fragrant petals prized by master botanists and garden enthusiasts.',
    bloomDaysRequired: 2
  },
  daisy: {
    speciesId: 'daisy',
    commonName: 'Fairy Meadow Daisy',
    scientificName: 'Bellis perennis',
    seedItemId: 'seed-daisy',
    plantItemId: 'vp-daisy',
    baseGrowthMinutes: 2,
    waterGrowthBoostPercent: 35,
    coinHarvestYield: 35,
    xpHarvestYield: 45,
    rarity: 'common',
    color: '#ffffff',
    description: 'Cheerful white petals with sunny golden center that bloom in playful clusters.',
    bloomDaysRequired: 1
  },
  lavender: {
    speciesId: 'lavender',
    commonName: 'Royal Provence Lavender',
    scientificName: 'Lavandula angustifolia',
    seedItemId: 'seed-lavender',
    plantItemId: 'vp-lavender',
    baseGrowthMinutes: 4,
    waterGrowthBoostPercent: 30,
    coinHarvestYield: 90,
    xpHarvestYield: 110,
    rarity: 'rare',
    color: '#a855f7',
    description: 'Fragrant purple spires that attract honeybees and calm the garden breeze.',
    bloomDaysRequired: 2
  },
  orchid: {
    speciesId: 'orchid',
    commonName: 'Midnight Royal Orchid',
    scientificName: 'Phalaenopsis violacea',
    seedItemId: 'seed-orchid',
    plantItemId: 'vp-orchid',
    baseGrowthMinutes: 5,
    waterGrowthBoostPercent: 25,
    coinHarvestYield: 150,
    xpHarvestYield: 200,
    rarity: 'legendary',
    color: '#7c3aed',
    description: 'Luminous deep violet tropical petals that radiate soft night glow.',
    bloomDaysRequired: 3
  },
  lotus: {
    speciesId: 'lotus',
    commonName: 'Mystic Lotus Blossom',
    scientificName: 'Nelumbo nucifera',
    seedItemId: 'seed-lotus',
    plantItemId: 'vp-lotus',
    baseGrowthMinutes: 4,
    waterGrowthBoostPercent: 30,
    coinHarvestYield: 120,
    xpHarvestYield: 160,
    rarity: 'rare',
    color: '#ec4899',
    description: 'Sacred water flower that floats peacefully on calm morning pools.',
    bloomDaysRequired: 2
  },
  hydrangea: {
    speciesId: 'hydrangea',
    commonName: 'Starlight Blue Hydrangea',
    scientificName: 'Hydrangea macrophylla',
    seedItemId: 'seed-hydrangea',
    plantItemId: 'vp-hydrangea',
    baseGrowthMinutes: 4,
    waterGrowthBoostPercent: 30,
    coinHarvestYield: 100,
    xpHarvestYield: 130,
    rarity: 'uncommon',
    color: '#38bdf8',
    description: 'Abundant lush spheres of sky-blue florets that change hue with soil pH.',
    bloomDaysRequired: 2
  },
  camellia: {
    speciesId: 'camellia',
    commonName: 'Cherry Blossom Camellia',
    scientificName: 'Camellia japonica',
    seedItemId: 'seed-camellia',
    plantItemId: 'vp-camellia',
    baseGrowthMinutes: 6,
    waterGrowthBoostPercent: 20,
    coinHarvestYield: 220,
    xpHarvestYield: 300,
    rarity: 'mythic',
    color: '#f43f5e',
    description: 'Legendary multi-layered pink blossoms that bloom once per season in peak health.',
    bloomDaysRequired: 3
  },
  monstera: {
    speciesId: 'monstera',
    commonName: 'Swiss Cheese Plant',
    scientificName: 'Monstera deliciosa',
    seedItemId: 'seed-monstera',
    plantItemId: 'vp-monstera',
    baseGrowthMinutes: 5,
    waterGrowthBoostPercent: 20,
    coinHarvestYield: 90,
    xpHarvestYield: 110,
    rarity: 'rare',
    color: '#16a34a',
    description: 'Lush tropical foliage with dramatic natural leaf perforations.',
    bloomDaysRequired: 2
  },
  pothos: {
    speciesId: 'pothos',
    commonName: 'Golden Pothos',
    scientificName: 'Epipremnum aureum',
    seedItemId: 'seed-pothos',
    plantItemId: 'vp-pothos',
    baseGrowthMinutes: 3,
    waterGrowthBoostPercent: 25,
    coinHarvestYield: 45,
    xpHarvestYield: 55,
    rarity: 'common',
    color: '#84cc16',
    description: 'Heart-shaped variegated green foliage trailing with golden ribbons.',
    bloomDaysRequired: 1
  },
  hibiscus: {
    speciesId: 'hibiscus',
    commonName: 'Tropical Hibiscus',
    scientificName: 'Hibiscus rosa-sinensis',
    seedItemId: 'seed-hibiscus',
    plantItemId: 'vp-hibiscus',
    baseGrowthMinutes: 4.5,
    waterGrowthBoostPercent: 25,
    coinHarvestYield: 80,
    xpHarvestYield: 95,
    rarity: 'rare',
    color: '#ef4444',
    description: 'Vibrant scarlet tropical petals with prominent golden nectar stamen.',
    bloomDaysRequired: 2
  }
};

/**
 * Calculates dynamic growth stage based on progress percentage.
 */
export function calculateGrowthStage(progress: number): PlantGrowthStage {
  if (progress >= 100) return 'bloom';
  if (progress >= 60) return 'growing';
  if (progress >= 25) return 'sprout';
  return 'seed';
}

/**
 * Calculates current moisture state based on elapsed time since last watering.
 */
export function calculateSoilMoisture(lastWateredAt: number): SoilMoistureLevel {
  const elapsedSeconds = (Date.now() - lastWateredAt) / 1000;
  if (elapsedSeconds < 90) return 'moist'; // 0 - 90s is moist
  if (elapsedSeconds < 240) return 'normal'; // 90s - 4 min is normal
  return 'dry'; // > 4 min is dry
}

/**
 * Advances plant growth progress over real time and watering events.
 */
export function advancePlantGrowth(
  plant: SimulatedPlantState,
  currentTime: number = Date.now()
): SimulatedPlantState {
  const rule = SPECIES_GROWTH_RULES[plant.speciesId] || SPECIES_GROWTH_RULES['marigold'];
  const totalGrowthMs = rule.baseGrowthMinutes * 60 * 1000;
  
  // Calculate raw time progression
  const elapsedMs = currentTime - plant.plantedAt;
  let rawProgress = (elapsedMs / totalGrowthMs) * 100;

  // Add bonus boost from watering
  const waterBonus = plant.waterCount * rule.waterGrowthBoostPercent;
  const totalProgress = Math.min(100, Math.max(0, rawProgress + waterBonus));

  const stage = calculateGrowthStage(totalProgress);
  const moisture = calculateSoilMoisture(plant.lastWateredAt);

  return {
    ...plant,
    growthProgress: Math.round(totalProgress),
    stage,
    moisture,
    isHarvestable: totalProgress >= 100
  };
}
