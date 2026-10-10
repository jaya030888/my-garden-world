import { describe, it, expect } from 'vitest';
import { getBotanicalInfoForLabel, BOTANICAL_DATABASE } from '../ai/botanicalDatabase';

describe('Botanical Knowledge Base & Classifier Mapper', () => {
  it('correctly maps exact botanical labels like daisy', () => {
    const info = getBotanicalInfoForLabel('daisy');
    expect(info.speciesName).toBe('Common Daisy');
    expect(info.scientificName).toBe('Bellis perennis');
    expect(info.petSafe).toBe(true);
    expect(info.difficulty).toBe('Beginner');
  });

  it('correctly maps keyword matches like rosehip / rose', () => {
    const info = getBotanicalInfoForLabel('hip, rose hip, rosehip');
    expect(info.speciesName).toBe('Wild Rose / Rosehip');
    expect(info.family).toBe('Rosaceae');
  });

  it('correctly maps potted plants and houseplants', () => {
    const info = getBotanicalInfoForLabel('pot, flowerpot');
    expect(info.speciesName).toBe('Potted Botanical / Houseplant');
    expect(info.family).toBe('Araceae (Arum Family)');
  });

  it('provides safe fallback profiles for unrecognized visual labels', () => {
    const info = getBotanicalInfoForLabel('exotic wild fern branch');
    expect(info.speciesName).toBeDefined();
    expect(info.sunlight).toBeDefined();
    expect(info.ecologicalFact).toBeDefined();
  });
});
