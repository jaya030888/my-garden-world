import { describe, it, expect, beforeEach } from 'vitest';
import { db, initializeDatabase } from '../db';
import {
  evaluateModelPrediction,
  VERIFIED_BOTANICAL_SPECIES,
  getPlantCareAndUses
} from '../ai/botanicalDatabase';
import { PlantRecord, GrowthPhoto, CareActivity } from '../types';

describe('Audit Matrix: AI Pipeline, Botanical Knowledge, and Persistence Quality Gates', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await initializeDatabase();
  });

  describe('1. Model Confidence Calibration & Uncertainty Tiers', () => {
    it('calibrates high confidence only for verified species above 0.55 score', () => {
      const daisyHigh = evaluateModelPrediction('daisy', 0.88);
      expect(daisyHigh.isVerifiedSpecies).toBe(true);
      expect(daisyHigh.score).toBe(0.88);
      expect(daisyHigh.detectionType).toBe('species');

      // Calibration rule verification
      const confidenceTier = (daisyHigh.isVerifiedSpecies && daisyHigh.score >= 0.55)
        ? 'high'
        : 'uncertain';
      expect(confidenceTier).toBe('high');
    });

    it('calibrates moderate confidence for verified species between 0.20 and 0.54', () => {
      const roseModerate = evaluateModelPrediction('rosehip', 0.35);
      expect(roseModerate.isVerifiedSpecies).toBe(true);

      const confidenceTier = (roseModerate.isVerifiedSpecies && roseModerate.score >= 0.55)
        ? 'high'
        : (roseModerate.isVerifiedSpecies && roseModerate.score >= 0.20)
        ? 'moderate'
        : 'uncertain';
      expect(confidenceTier).toBe('moderate');
    });

    it('calibrates uncertain state for low-scoring or unverified outputs', () => {
      const sunflowerLow = evaluateModelPrediction('sunflower', 0.08);
      const confidenceTier = (sunflowerLow.isVerifiedSpecies && sunflowerLow.score >= 0.55)
        ? 'high'
        : (sunflowerLow.isVerifiedSpecies && sunflowerLow.score >= 0.20)
        ? 'moderate'
        : 'uncertain';
      expect(confidenceTier).toBe('uncertain');
    });
  });

  describe('2. Container Object Decoupling & Non-Plant Handling', () => {
    it('flags flowerpot container as an inanimate object without fabricating species names', () => {
      const potPrediction = evaluateModelPrediction('pot, flowerpot', 0.94);
      expect(potPrediction.isVerifiedSpecies).toBe(false);
      expect(potPrediction.detectionType).toBe('container_object');
      expect(potPrediction.botanicalInfo).toBeUndefined();
      expect(potPrediction.statusExplanation).toContain('flowerpot container');
    });

    it('correctly handles non-plant objects as unidentified without hallucinating care', () => {
      const lighterPrediction = evaluateModelPrediction('lighter, light, igniter', 0.45);
      expect(lighterPrediction.isVerifiedSpecies).toBe(false);
      expect(lighterPrediction.detectionType).toBe('unidentified');
      expect(lighterPrediction.botanicalInfo).toBeUndefined();
    });
  });

  describe('3. Authoritative Botanical Attribution & ASPCA Safety Verification', () => {
    it('contains verified sources with organizations for all registered botanical species', () => {
      const speciesKeys = Object.keys(VERIFIED_BOTANICAL_SPECIES);
      expect(speciesKeys.length).toBeGreaterThanOrEqual(5);

      speciesKeys.forEach(key => {
        const bot = VERIFIED_BOTANICAL_SPECIES[key];
        expect(bot.sources).toBeDefined();
        const sources = bot.sources || [];
        expect(sources.length).toBeGreaterThanOrEqual(2);
        
        // Must contain official reputable authority in organization field
        const orgNames = sources.map(s => s.organization);
        const hasReputableAuthority = orgNames.some(org =>
          org && (
            org.includes('ASPCA') ||
            org.includes('Royal Horticultural Society') ||
            org.includes('USDA') ||
            org.includes('Kew') ||
            org.includes('Missouri Botanical Garden')
          )
        );
        expect(hasReputableAuthority).toBe(true);
      });
    });

    it('verifies clinical pet safety accuracy: Monstera is toxic, Daisy is pet safe', () => {
      const monstera = VERIFIED_BOTANICAL_SPECIES['monstera'];
      expect(monstera.petSafe).toBe(false);
      expect(monstera.toxicity).toContain('calcium oxalate');

      const daisy = VERIFIED_BOTANICAL_SPECIES['daisy'];
      expect(daisy.petSafe).toBe(true);

      const sunflower = VERIFIED_BOTANICAL_SPECIES['sunflower'];
      expect(sunflower.petSafe).toBe(true);
    });

    it('provides practical soil-moisture criteria rather than generic daily watering', () => {
      const care = getPlantCareAndUses('Monstera deliciosa');
      expect(care.treatment.wateringSchedule.toLowerCase()).toContain('dry out');
      expect(care.treatment.soilMix).toBeDefined();
      expect(care.treatment.sunlightRequirement).toBeDefined();
    });
  });

  describe('4. Plant Collection & Photologging Persistence End-to-End', () => {
    it('creates plant, adds nurturing care logs, and records growth photos with timestamps', async () => {
      const plantRecord: PlantRecord = {
        id: 'test-plant-monstera-lifecycle',
        name: 'Living Test Monstera',
        species: 'Monstera deliciosa',
        scientificName: 'Monstera deliciosa Liebm.',
        family: 'Araceae',
        acquiredDate: new Date().toISOString(),
        primaryPhotoUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80',
        location: 'indoor',
        sunlightNeeds: 'indirect_bright',
        waterFrequencyDays: 7,
        notes: 'Specimen in ceramic planter near north window.',
        careHistory: [],
        growthPhotos: []
      };

      await db.plants.add(plantRecord);

      // Log care activity
      const careLog: CareActivity = {
        id: 'care-1',
        plantId: plantRecord.id,
        type: 'water',
        timestamp: new Date().toISOString(),
        xpAwarded: 15,
        notes: 'Moistened rootball after top 2 inches dried.'
      };

      // Add growth photo
      const growthPhoto: GrowthPhoto = {
        id: 'photo-1',
        plantId: plantRecord.id,
        photoUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80',
        stageLabel: 'New Fenestrated Leaf',
        takenAt: new Date().toISOString(),
        notes: 'First fenestration unfurled.'
      };

      await db.plants.update(plantRecord.id, {
        careHistory: [careLog],
        growthPhotos: [growthPhoto]
      });

      // Verify retrieval from IndexedDB
      const retrieved = await db.plants.get(plantRecord.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Living Test Monstera');
      expect(retrieved?.careHistory?.length).toBe(1);
      expect(retrieved?.careHistory?.[0].type).toBe('water');
      expect(retrieved?.growthPhotos?.length).toBe(1);
      expect(retrieved?.growthPhotos?.[0].stageLabel).toBe('New Fenestrated Leaf');
    });
  });
});
