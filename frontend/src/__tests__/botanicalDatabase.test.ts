import { describe, it, expect } from 'vitest';
import {
  evaluateModelPrediction,
  VERIFIED_BOTANICAL_SPECIES
} from '../ai/botanicalDatabase';

describe('Botanical Knowledge Base & Classifier Taxonomy Evaluation', () => {
  it('correctly maps verified plant species like daisy', () => {
    const result = evaluateModelPrediction('daisy', 0.95);
    expect(result.isVerifiedSpecies).toBe(true);
    expect(result.detectionType).toBe('species');
    expect(result.botanicalInfo?.speciesName).toBe('Common Daisy');
    expect(result.botanicalInfo?.scientificName).toBe('Bellis perennis');
    expect(result.botanicalInfo?.petSafe).toBe(true);
  });

  it('correctly maps verified plant species like sunflower and marigold', () => {
    const sunflowerResult = evaluateModelPrediction('sunflower', 0.98);
    expect(sunflowerResult.isVerifiedSpecies).toBe(true);
    expect(sunflowerResult.botanicalInfo?.scientificName).toBe('Helianthus annuus');

    const marigoldResult = evaluateModelPrediction('marigold', 0.88);
    expect(marigoldResult.isVerifiedSpecies).toBe(true);
    expect(marigoldResult.botanicalInfo?.scientificName).toBe('Tagetes patula');
  });

  it('correctly identifies flowerpot container as an inanimate object rather than a plant species', () => {
    const potResult = evaluateModelPrediction('pot, flowerpot', 0.9945);
    expect(potResult.isVerifiedSpecies).toBe(false);
    expect(potResult.detectionType).toBe('container_object');
    expect(potResult.botanicalInfo).toBeUndefined();
    expect(potResult.statusExplanation).toContain('flowerpot container');
  });

  it('correctly handles unrecognized non-botanical classes as unidentified', () => {
    const unkResult = evaluateModelPrediction('acoustic_guitar', 0.85);
    expect(unkResult.isVerifiedSpecies).toBe(false);
    expect(unkResult.detectionType).toBe('unidentified');
    expect(unkResult.botanicalInfo).toBeUndefined();
  });
});
