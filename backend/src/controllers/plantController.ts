import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { awardEconomyRewardsTx } from '../services/economyService.js';

const createPlantSchema = z.object({
  name: z.string().min(1, 'Plant name is required'),
  species: z.string().min(1, 'Species is required'),
  scientificName: z.string().optional(),
  family: z.string().optional(),
  acquiredDate: z.string().optional(),
  primaryPhotoUrl: z.string().optional(),
  initialPhoto: z.string().optional(),
  location: z.string().default('indoor'),
  sunlightNeeds: z.string().default('indirect_bright'),
  waterFrequencyDays: z.number().int().positive().default(7),
  notes: z.string().optional(),
  isCustom: z.boolean().default(false),
});

const careLogSchema = z.object({
  type: z.enum(['water', 'fertilize', 'prune', 'repot', 'mist', 'sunlight_adjust', 'observation']),
  notes: z.string().optional(),
});

const growthPhotoSchema = z.object({
  photoUrl: z.string().min(1, 'Photo URL is required'),
  stageLabel: z.string().optional(),
  notes: z.string().optional(),
  takenAt: z.string().optional(),
});

export async function getPlants(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const plants = await prisma.plant.findMany({
      where: { userId },
      include: {
        growthPhotos: {
          orderBy: { takenAt: 'asc' },
        },
        careLogs: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { plants },
    });
  } catch (err) {
    next(err);
  }
}

export async function getPlantById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const plant = await prisma.plant.findFirst({
      where: { id, userId },
      include: {
        growthPhotos: {
          orderBy: { takenAt: 'asc' },
        },
        careLogs: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!plant) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Plant not found or access denied.' },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { plant },
    });
  } catch (err) {
    next(err);
  }
}

export async function createPlant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const data = createPlantSchema.parse(req.body);

    const primaryPhotoUrl =
      data.initialPhoto ||
      data.primaryPhotoUrl ||
      'https://images.unsplash.com/photo-1596724817757-9755f78c50c6?w=600&q=80';

    const result = await prisma.$transaction(async (tx) => {
      const plant = await tx.plant.create({
        data: {
          userId,
          name: data.name,
          species: data.species,
          scientificName: data.scientificName,
          family: data.family,
          acquiredDate: data.acquiredDate ? new Date(data.acquiredDate) : new Date(),
          primaryPhotoUrl,
          location: data.location,
          sunlightNeeds: data.sunlightNeeds,
          waterFrequencyDays: data.waterFrequencyDays,
          notes: data.notes || '',
          isCustom: data.isCustom,
          growthPhotos: {
            create: {
              userId,
              photoUrl: primaryPhotoUrl,
              takenAt: new Date(),
              stageLabel: 'Day 1 Entry',
              notes: 'Plant adopted and registered into My Garden World.',
            },
          },
        },
        include: {
          growthPhotos: true,
          careLogs: true,
        },
      });

      // Award adoption reward (15 coins, 20 XP)
      const rewardResult = await awardEconomyRewardsTx(tx, {
        userId,
        coins: 15,
        xp: 20,
        description: `Added ${plant.name} (${plant.species}) to My Plants`,
        type: 'quest_reward',
        referenceId: plant.id,
      });

      // Check first plant achievement
      const plantCount = await tx.plant.count({ where: { userId } });
      if (plantCount === 1) {
        await tx.userAchievement.upsert({
          where: { userId_achievementId: { userId, achievementId: 'ach-first-leaf' } },
          update: {},
          create: {
            userId,
            achievementId: 'ach-first-leaf',
            unlockedAt: new Date(),
          },
        });
      }

      return { plant, rewardResult };
    });

    res.status(201).json({
      success: true,
      data: {
        plant: result.plant,
        user: result.rewardResult.user,
        levelUp: result.rewardResult.levelUp,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deletePlant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const plant = await prisma.plant.findFirst({
      where: { id, userId },
    });

    if (!plant) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Plant not found or access denied.' },
      });
      return;
    }

    await prisma.plant.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Plant deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

export async function logPlantCare(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id: plantId } = req.params;
    const data = careLogSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const plant = await tx.plant.findFirst({
        where: { id: plantId, userId },
      });

      if (!plant) {
        throw new Error('Plant not found or access denied.');
      }

      const updateData: any = {};
      if (data.type === 'water') {
        updateData.lastWateredDate = new Date();
      } else if (data.type === 'fertilize') {
        updateData.lastFertilizedDate = new Date();
      }

      if (Object.keys(updateData).length > 0) {
        await tx.plant.update({
          where: { id: plantId },
          data: updateData,
        });
      }

      const careLog = await tx.careLog.create({
        data: {
          plantId,
          userId,
          type: data.type,
          timestamp: new Date(),
          notes: data.notes || `Care task: ${data.type}`,
          xpAwarded: 10,
        },
      });

      // Award Care task economy rewards: 10 coins, 15 XP
      const rewardResult = await awardEconomyRewardsTx(tx, {
        userId,
        coins: 10,
        xp: 15,
        description: `Cared for ${plant.name} (${data.type})`,
        type: 'care_reward',
        referenceId: careLog.id,
      });

      // Check care count achievement
      const totalCareCount = await tx.careLog.count({ where: { userId } });
      if (totalCareCount >= 10) {
        await tx.userAchievement.upsert({
          where: { userId_achievementId: { userId, achievementId: 'ach-plant-whisperer' } },
          update: {},
          create: {
            userId,
            achievementId: 'ach-plant-whisperer',
            unlockedAt: new Date(),
          },
        });
      }

      return { careLog, rewardResult };
    });

    res.status(201).json({
      success: true,
      data: {
        careLog: result.careLog,
        user: result.rewardResult.user,
        levelUp: result.rewardResult.levelUp,
      },
    });
  } catch (err: any) {
    if (err.message === 'Plant not found or access denied.') {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: err.message },
      });
      return;
    }
    next(err);
  }
}

export async function addGrowthPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id: plantId } = req.params;
    const data = growthPhotoSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const plant = await tx.plant.findFirst({
        where: { id: plantId, userId },
      });

      if (!plant) {
        throw new Error('Plant not found or access denied.');
      }

      const growthEntry = await tx.growthEntry.create({
        data: {
          plantId,
          userId,
          photoUrl: data.photoUrl,
          takenAt: data.takenAt ? new Date(data.takenAt) : new Date(),
          stageLabel: data.stageLabel || 'Growth Update',
          notes: data.notes || '',
        },
      });

      // Update plant's primary photo
      await tx.plant.update({
        where: { id: plantId },
        data: { primaryPhotoUrl: data.photoUrl },
      });

      // Award Growth Photo reward: 20 coins, 30 XP
      const rewardResult = await awardEconomyRewardsTx(tx, {
        userId,
        coins: 20,
        xp: 30,
        description: `Logged growth photo for ${plant.name}`,
        type: 'quest_reward',
        referenceId: growthEntry.id,
      });

      return { growthEntry, rewardResult };
    });

    res.status(201).json({
      success: true,
      data: {
        growthEntry: result.growthEntry,
        user: result.rewardResult.user,
        levelUp: result.rewardResult.levelUp,
      },
    });
  } catch (err: any) {
    if (err.message === 'Plant not found or access denied.') {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: err.message },
      });
      return;
    }
    next(err);
  }
}
