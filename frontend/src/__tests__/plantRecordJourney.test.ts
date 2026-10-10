import { describe, it, expect, beforeEach } from 'vitest';
import { db, initializeDatabase } from '../db';
import { PlantRecord, GrowthPhoto, CareActivity } from '../types';

describe('My Plants Collection & Growth Journal Lifecycle', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await initializeDatabase();
  });

  it('creates and persists a new plant record', async () => {
    const newPlant: PlantRecord = {
      id: 'test-plant-monstera',
      name: 'Verdant Monstera',
      species: 'Monstera Deliciosa',
      scientificName: 'Monstera deliciosa',
      acquiredDate: new Date().toISOString(),
      primaryPhotoUrl: 'https://example.com/monstera.jpg',
      location: 'indoor',
      sunlightNeeds: 'indirect_bright',
      waterFrequencyDays: 7,
      growthPhotos: [],
      careHistory: []
    };

    await db.plants.add(newPlant);
    const retrieved = await db.plants.get('test-plant-monstera');
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Verdant Monstera');
  });

  it('adds dated growth timeline photos and maintains sequential stages', async () => {
    const plant = await db.plants.get('starter-pothos');
    expect(plant).toBeDefined();
    if (!plant) return;

    const newPhoto: GrowthPhoto = {
      id: 'gp-new-stage',
      plantId: plant.id,
      photoUrl: 'https://example.com/pothos-stage3.jpg',
      takenAt: new Date().toISOString(),
      stageLabel: 'Vigorous Summer Vine Growth',
      notes: 'New 12-inch aerial roots developed.'
    };

    const updatedPhotos = [...plant.growthPhotos, newPhoto];
    await db.plants.update(plant.id, { growthPhotos: updatedPhotos });

    const updated = await db.plants.get(plant.id);
    expect(updated?.growthPhotos.length).toBe(3);
    expect(updated?.growthPhotos[2].stageLabel).toBe('Vigorous Summer Vine Growth');
  });

  it('logs care activities and updates lastWateredDate timestamp', async () => {
    const plant = await db.plants.get('starter-pothos');
    expect(plant).toBeDefined();
    if (!plant) return;

    const careEntry: CareActivity = {
      id: 'care-test-1',
      plantId: plant.id,
      type: 'water',
      timestamp: new Date().toISOString(),
      notes: 'Deep pot soak',
      xpAwarded: 10
    };

    const updatedCare = [careEntry, ...(plant.careHistory || [])];
    await db.plants.update(plant.id, {
      careHistory: updatedCare,
      lastWateredDate: careEntry.timestamp
    });

    const updated = await db.plants.get(plant.id);
    expect(updated?.careHistory.length).toBe(3);
    expect(updated?.lastWateredDate).toBe(careEntry.timestamp);
  });

  it('deletes plant records cleanly from collection', async () => {
    await db.plants.delete('starter-pothos');
    const deleted = await db.plants.get('starter-pothos');
    expect(deleted).toBeUndefined();
  });
});
