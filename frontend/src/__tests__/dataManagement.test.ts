import { describe, it, expect, beforeEach } from 'vitest';
import { db, initializeDatabase } from '../db';

describe('Data Management & Backup Export Schema', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await initializeDatabase();
  });

  it('exports valid JSON structure with all database tables', async () => {
    const [
      profile,
      plants,
      quests,
      discoveries,
      observations,
      gardenLayout,
      transactions,
      achievements
    ] = await Promise.all([
      db.profile.toArray(),
      db.plants.toArray(),
      db.quests.toArray(),
      db.discoveries.toArray(),
      db.observations.toArray(),
      db.gardenLayout.toArray(),
      db.transactions.toArray(),
      db.achievements.toArray()
    ]);

    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile,
      plants,
      quests,
      discoveries,
      observations,
      gardenLayout,
      transactions,
      achievements
    };

    expect(backup.version).toBe('1.0.0');
    expect(backup.profile.length).toBeGreaterThan(0);
    expect(backup.plants.length).toBeGreaterThan(0);
    expect(backup.quests.length).toBeGreaterThan(0);
    expect(backup.achievements.length).toBeGreaterThan(0);

    const jsonString = JSON.stringify(backup);
    const parsed = JSON.parse(jsonString);
    expect(parsed.version).toBe('1.0.0');
    expect(parsed.plants[0].name).toBeDefined();
  });

  it('resets database cleanly when wiped', async () => {
    await db.delete();
    await db.open();
    const count = await db.plants.count();
    expect(count).toBe(0);

    // Re-seed
    await initializeDatabase();
    const reseededCount = await db.plants.count();
    expect(reseededCount).toBeGreaterThan(0);
  });
});
