import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

// Mock prisma for isolated unit and integration testing
vi.mock('../lib/prisma.js', () => {
  const mockUsers: any[] = [];
  const mockPlants: any[] = [];
  const mockShopItems: any[] = [
    {
      id: 'vp-monstera',
      name: 'Verdant Monstera',
      price: 40,
      requiredLevel: 1,
      isAvailable: true,
    },
    {
      id: 'vp-bonsai',
      name: 'Ancient Juniper Bonsai',
      price: 150,
      requiredLevel: 5,
      isAvailable: true,
    },
  ];
  const mockInventory: any[] = [];
  const mockTransactions: any[] = [];
  const mockPlacements: any[] = [];
  const mockQuests: any[] = [
    {
      id: 'quest-daily-discover',
      title: 'Daily Flora Scout',
      category: 'discovery',
      coinsReward: 30,
      xpReward: 50,
      isDaily: true,
      targetCount: 1,
      isActive: true,
    },
  ];
  const mockClaims: any[] = [];
  const mockDiscoveries: any[] = [];
  const mockCareLogs: any[] = [];
  const mockGrowthEntries: any[] = [];
  const mockObservations: any[] = [];
  const mockAchievements: any[] = [];
  const mockUserAchievements: any[] = [];

  const client = {
    $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
    $transaction: vi.fn(async (cb: any) => cb(client)),
    user: {
      findFirst: vi.fn(async ({ where }: any) => {
        if (where.OR) {
          const email = where.OR[0]?.email;
          const username = where.OR[1]?.username || where.OR[0]?.username;
          return mockUsers.find(
            (u) => u.email === email || u.username === username || u.username === email
          ) || null;
        }
        return null;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        return mockUsers.find((u) => u.id === where.id) || null;
      }),
      create: vi.fn(async ({ data }: any) => {
        const newUser = {
          id: `user-${Date.now()}-${Math.random()}`,
          email: data.email,
          username: data.username,
          passwordHash: data.passwordHash,
          level: data.level || 1,
          xp: data.xp || 0,
          coins: data.coins || 100,
          streakDays: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockUsers.push(newUser);
        return newUser;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const u = mockUsers.find((user) => user.id === where.id);
        if (u) {
          Object.assign(u, data);
          return u;
        }
        return null;
      }),
    },
    plant: {
      findMany: vi.fn(async ({ where }: any) => {
        return mockPlants
          .filter((p) => p.userId === where.userId)
          .map((p) => ({
            ...p,
            growthPhotos: mockGrowthEntries.filter((g) => g.plantId === p.id),
            careLogs: mockCareLogs.filter((c) => c.plantId === p.id),
          }));
      }),
      findFirst: vi.fn(async ({ where }: any) => {
        const p = mockPlants.find((plant) => plant.id === where.id && plant.userId === where.userId);
        if (!p) return null;
        return {
          ...p,
          growthPhotos: mockGrowthEntries.filter((g) => g.plantId === p.id),
          careLogs: mockCareLogs.filter((c) => c.plantId === p.id),
        };
      }),
      create: vi.fn(async ({ data }: any) => {
        const newPlant = {
          id: `plant-${Date.now()}`,
          userId: data.userId,
          name: data.name,
          species: data.species,
          scientificName: data.scientificName,
          family: data.family,
          acquiredDate: data.acquiredDate,
          primaryPhotoUrl: data.primaryPhotoUrl,
          location: data.location,
          sunlightNeeds: data.sunlightNeeds,
          waterFrequencyDays: data.waterFrequencyDays,
          notes: data.notes,
          isCustom: data.isCustom,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockPlants.push(newPlant);
        return {
          ...newPlant,
          growthPhotos: [],
          careLogs: [],
        };
      }),
      delete: vi.fn(async ({ where }: any) => {
        const idx = mockPlants.findIndex((p) => p.id === where.id);
        if (idx !== -1) mockPlants.splice(idx, 1);
        return { id: where.id };
      }),
      count: vi.fn(async ({ where }: any) => mockPlants.filter((p) => p.userId === where.userId).length),
    },
    growthEntry: {
      create: vi.fn(async ({ data }: any) => {
        const entry = { id: `gp-${Date.now()}`, ...data, createdAt: new Date() };
        mockGrowthEntries.push(entry);
        return entry;
      }),
      count: vi.fn(async ({ where }: any) => mockGrowthEntries.filter((g) => g.userId === where.userId).length),
    },
    careLog: {
      create: vi.fn(async ({ data }: any) => {
        const log = { id: `care-${Date.now()}`, ...data, createdAt: new Date() };
        mockCareLogs.push(log);
        return log;
      }),
      count: vi.fn(async ({ where }: any) => mockCareLogs.filter((c) => c.userId === where.userId).length),
    },
    discovery: {
      findMany: vi.fn(async () => mockDiscoveries),
      create: vi.fn(async ({ data }: any) => {
        const disc = { id: `disc-${Date.now()}`, ...data, createdAt: new Date() };
        mockDiscoveries.push(disc);
        return disc;
      }),
      count: vi.fn(async ({ where }: any) => mockDiscoveries.filter((d) => d.userId === where.userId).length),
    },
    observation: {
      findMany: vi.fn(async () => mockObservations),
      create: vi.fn(async ({ data }: any) => {
        const obs = { id: `obs-${Date.now()}`, ...data, createdAt: new Date() };
        mockObservations.push(obs);
        return obs;
      }),
      count: vi.fn(async ({ where }: any) => mockObservations.filter((o) => o.userId === where.userId).length),
    },
    quest: {
      findMany: vi.fn(async () => mockQuests),
      findUnique: vi.fn(async ({ where }: any) => mockQuests.find((q) => q.id === where.id) || null),
    },
    questClaim: {
      findMany: vi.fn(async () => mockClaims),
      findUnique: vi.fn(async ({ where }: any) => {
        const key = where.userId_questId_periodKey;
        if (key) {
          return (
            mockClaims.find(
              (c) =>
                c.userId === key.userId &&
                c.questId === key.questId &&
                c.periodKey === key.periodKey
            ) || null
          );
        }
        return null;
      }),
      create: vi.fn(async ({ data }: any) => {
        const claim = { id: `claim-${Date.now()}`, ...data, claimedAt: new Date() };
        mockClaims.push(claim);
        return claim;
      }),
    },
    shopItem: {
      findMany: vi.fn(async () => mockShopItems),
      findUnique: vi.fn(async ({ where }: any) => mockShopItems.find((s) => s.id === where.id) || null),
      count: vi.fn(async () => mockShopItems.length),
    },
    userInventory: {
      findMany: vi.fn(async ({ where }: any) => mockInventory.filter((i) => i.userId === where.userId)),
      findUnique: vi.fn(async ({ where }: any) => {
        const key = where.userId_itemId;
        return mockInventory.find((i) => i.userId === key.userId && i.itemId === key.itemId) || null;
      }),
      create: vi.fn(async ({ data }: any) => {
        const inv = { id: `inv-${Date.now()}`, ...data, acquiredAt: new Date() };
        mockInventory.push(inv);
        return inv;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const inv = mockInventory.find((i) => i.id === where.id);
        if (inv) Object.assign(inv, data);
        return inv;
      }),
    },
    gardenPlacement: {
      findMany: vi.fn(async ({ where }: any) =>
        mockPlacements.filter((p) => p.userId === where.userId).map((p) => ({
          ...p,
          shopItem: mockShopItems.find((s) => s.id === p.itemId),
        }))
      ),
      findFirst: vi.fn(async ({ where }: any) => {
        return (
          mockPlacements.find((p) => {
            if (p.userId !== where.userId) return false;
            if (where.id && p.id !== where.id) return false;
            if (where.gridX !== undefined && p.gridX !== where.gridX) return false;
            if (where.gridY !== undefined && p.gridY !== where.gridY) return false;
            return true;
          }) || null
        );
      }),
      create: vi.fn(async ({ data }: any) => {
        const pl = { id: `pl-${Date.now()}`, ...data, placedAt: new Date() };
        mockPlacements.push(pl);
        return { ...pl, shopItem: mockShopItems.find((s) => s.id === pl.itemId) };
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const pl = mockPlacements.find((p) => p.id === where.id);
        if (pl) Object.assign(pl, data);
        return pl;
      }),
      delete: vi.fn(async ({ where }: any) => {
        const idx = mockPlacements.findIndex((p) => p.id === where.id);
        if (idx !== -1) mockPlacements.splice(idx, 1);
        return { id: where.id };
      }),
      count: vi.fn(async () => mockPlacements.length),
    },
    coinTransaction: {
      create: vi.fn(async ({ data }: any) => {
        const tx = { id: `tx-${Date.now()}`, ...data, createdAt: new Date() };
        mockTransactions.push(tx);
        return tx;
      }),
      findMany: vi.fn(async () => mockTransactions),
    },
    achievement: {
      findMany: vi.fn(async () => mockAchievements),
      upsert: vi.fn(async () => ({})),
    },
    userAchievement: {
      upsert: vi.fn(async () => ({})),
    },
  };

  return { prisma: client };
});

describe('FloraQuest Backend REST API Test Suite', () => {
  let authToken: string;
  let testUserId: string;

  beforeEach(async () => {
    // Register a test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `botanist_${Date.now()}@example.com`,
        username: `botanist_${Date.now()}`,
        password: 'SecurePassword123!',
      });

    if (res.status === 201) {
      authToken = res.body.data.token;
      testUserId = res.body.data.user.id;
    }
  });

  describe('1. Health Check Endpoint', () => {
    it('GET /api/health should return status healthy and 200', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database).toBe('connected');
    });
  });

  describe('2. Authentication & Authorization Security', () => {
    it('POST /api/auth/register should create user and return token + 100 starter coins', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: `new_user_${Date.now()}@example.com`,
          username: `new_user_${Date.now()}`,
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.coins).toBe(100);
      expect(res.body.data.token).toBeDefined();
    });

    it('GET /api/plants without auth header or cookie should be rejected with 401', async () => {
      const res = await request(app).get('/api/plants');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/auth/me with valid Bearer token should return user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe(testUserId);
    });
  });

  describe('3. Plant Records & Growth Journey', () => {
    it('POST /api/plants should create plant and award adoption rewards', async () => {
      const res = await request(app)
        .post('/api/plants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'My Monstera',
          species: 'Monstera deliciosa',
          location: 'indoor',
          sunlightNeeds: 'indirect_bright',
          waterFrequencyDays: 7,
          primaryPhotoUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.plant.name).toBe('My Monstera');
      expect(res.body.data.user.coins).toBeGreaterThanOrEqual(100);
    });

    it('GET /api/plants should list authenticated user plants', async () => {
      const res = await request(app)
        .get('/api/plants')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.plants)).toBe(true);
    });
  });

  describe('4. Economy & Shop Purchasing Integrity', () => {
    it('POST /api/shop/buy should validate balance and deduct coins atomically', async () => {
      const res = await request(app)
        .post('/api/shop/buy')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ itemId: 'vp-monstera' }); // 40 coins

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.coins).toBe(60); // 100 - 40
    });

    it('POST /api/shop/buy should reject item when level requirement is not met', async () => {
      const res = await request(app)
        .post('/api/shop/buy')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ itemId: 'vp-bonsai' }); // Level 5 required, user is level 1

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('LEVEL_TOO_LOW');
    });
  });

  describe('5. Virtual Garden Grid Sanctuary', () => {
    it('POST /api/garden/place should place item on valid grid coordinate', async () => {
      const res = await request(app)
        .post('/api/garden/place')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: 'vp-monstera',
          gridX: 2,
          gridY: 3,
          rotation: 0,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.item.gridX).toBe(2);
      expect(res.body.data.item.gridY).toBe(3);
    });

    it('POST /api/garden/place should reject placing on occupied coordinate (collision check)', async () => {
      // Place first item at (2, 3)
      await request(app)
        .post('/api/garden/place')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: 'vp-monstera',
          gridX: 2,
          gridY: 3,
        });

      // Attempt to place second item at same (2, 3)
      const res = await request(app)
        .post('/api/garden/place')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          itemId: 'vp-monstera',
          gridX: 2,
          gridY: 3,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CELL_OCCUPIED');
    });
  });

  describe('6. Discoveries & AI Vision Integration', () => {
    it('POST /api/discoveries should save botanical identification and award rewards', async () => {
      const res = await request(app)
        .post('/api/discoveries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageUrl: 'https://images.unsplash.com/photo-1596724817757-9755f78c50c6',
          topPrediction: {
            label: 'daisy',
            score: 0.9996,
            botanicalInfo: {
              speciesName: 'Daisy',
              scientificName: 'Bellis perennis',
            },
          },
          confidenceTier: 'high',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.discovery.topLabel).toBe('daisy');
      expect(res.body.data.user.xp).toBeGreaterThan(0);
    });
  });
});

