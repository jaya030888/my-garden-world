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
  waterGrowthBoostPercent: number; // +25% per watering
  coinHarvestYield: number;
  xpHarvestYield: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'exotic';
}

export const SPECIES_GROWTH_RULES: Record<string, SpeciesGrowthRule> = {
  marigold: {
    speciesId: 'marigold',
    commonName: 'English Marigold',
    scientificName: 'Calendula officinalis',
    seedItemId: 'seed-marigold',
    plantItemId: 'vp-marigold',
    baseGrowthMinutes: 2, // fast cozy loop
    waterGrowthBoostPercent: 30,
    coinHarvestYield: 35,
    xpHarvestYield: 45,
    rarity: 'common'
  },
  sunflower: {
    speciesId: 'sunflower',
    commonName: 'Golden Sunflower',
    scientificName: 'Helianthus annuus',
    seedItemId: 'seed-sunflower',
    plantItemId: 'vp-sunflower',
    baseGrowthMinutes: 3,
    waterGrowthBoostPercent: 25,
    coinHarvestYield: 50,
    xpHarvestYield: 60,
    rarity: 'common'
  },
  rose: {
    speciesId: 'rose',
    commonName: 'Wild Rose',
    scientificName: 'Rosa canina',
    seedItemId: 'seed-rose',
    plantItemId: 'vp-rose',
    baseGrowthMinutes: 4,
    waterGrowthBoostPercent: 25,
    coinHarvestYield: 65,
    xpHarvestYield: 80,
    rarity: 'uncommon'
  },
  daisy: {
    speciesId: 'daisy',
    commonName: 'Common Daisy',
    scientificName: 'Bellis perennis',
    seedItemId: 'seed-daisy',
    plantItemId: 'vp-daisy',
    baseGrowthMinutes: 2,
    waterGrowthBoostPercent: 30,
    coinHarvestYield: 30,
    xpHarvestYield: 40,
    rarity: 'common'
  },
  lavender: {
    speciesId: 'lavender',
    commonName: 'English Lavender',
    scientificName: 'Lavandula angustifolia',
    seedItemId: 'seed-lavender',
    plantItemId: 'vp-lavender',
    baseGrowthMinutes: 3.5,
    waterGrowthBoostPercent: 25,
    coinHarvestYield: 55,
    xpHarvestYield: 70,
    rarity: 'uncommon'
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
    rarity: 'rare'
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
    rarity: 'common'
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
    rarity: 'rare'
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
