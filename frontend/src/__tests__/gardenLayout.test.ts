import { describe, it, expect, beforeEach } from 'vitest';
import { db, initializeDatabase } from '../db';
import { PlacedGardenItem } from '../types';

describe('Virtual Garden Layout & Grid Placement', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await initializeDatabase();
  });

  it('loads starter layout on initial setup', async () => {
    const layout = await db.gardenLayout.toArray();
    expect(layout.length).toBeGreaterThanOrEqual(3);
  });

  it('correctly adds a new item within 8x8 grid bounds', async () => {
    const newItem: PlacedGardenItem = {
      instanceId: 'test-plant-item',
      itemId: 'vp-sunflower',
      gridX: 5,
      gridY: 5,
      rotation: 0,
      placedAt: new Date().toISOString()
    };

    await db.gardenLayout.add(newItem);
    const retrieved = await db.gardenLayout.get('test-plant-item');
    expect(retrieved).toBeDefined();
    expect(retrieved?.gridX).toBe(5);
    expect(retrieved?.gridY).toBe(5);
  });

  it('rotates an item in 90-degree increments', async () => {
    const item = await db.gardenLayout.toCollection().first();
    expect(item).toBeDefined();
    if (!item) return;

    const initialRot = item.rotation;
    const nextRot = (initialRot + 90) % 360;

    await db.gardenLayout.update(item.instanceId, { rotation: nextRot });
    const updated = await db.gardenLayout.get(item.instanceId);
    expect(updated?.rotation).toBe(nextRot);
  });

  it('removes placed items from grid', async () => {
    const item = await db.gardenLayout.toCollection().first();
    expect(item).toBeDefined();
    if (!item) return;

    await db.gardenLayout.delete(item.instanceId);
    const deleted = await db.gardenLayout.get(item.instanceId);
    expect(deleted).toBeUndefined();
  });
});
