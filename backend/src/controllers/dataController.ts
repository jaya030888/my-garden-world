import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

export async function getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;

    const [user, transactions, achievements, plantsCount, discoveriesCount, observationsCount] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            username: true,
            level: true,
            xp: true,
            coins: true,
            streakDays: true,
            createdAt: true,
            lastActiveAt: true,
          },
        }),
        prisma.coinTransaction.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 25,
        }),
        prisma.achievement.findMany({
          include: {
            users: {
              where: { userId },
            },
          },
        }),
        prisma.plant.count({ where: { userId } }),
        prisma.discovery.count({ where: { userId } }),
        prisma.observation.count({ where: { userId } }),
      ]);

    const formattedAchievements = achievements.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      icon: a.icon,
      category: a.category,
      xpReward: a.xpReward,
      coinReward: a.coinReward,
      unlocked: a.users.length > 0,
      unlockedAt: a.users[0]?.unlockedAt?.toISOString(),
    }));

    res.status(200).json({
      success: true,
      data: {
        profile: user,
        stats: {
          totalPlants: plantsCount,
          totalDiscoveries: discoveriesCount,
          totalObservations: observationsCount,
        },
        transactions: transactions.map((t) => ({
          id: t.id,
          timestamp: t.createdAt.toISOString(),
          type: t.type,
          amount: t.amount,
          currency: t.currency,
          description: t.description,
        })),
        achievements: formattedAchievements,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function exportUserData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;

    const [user, plants, discoveries, observations, gardenLayout, transactions] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            username: true,
            level: true,
            xp: true,
            coins: true,
            streakDays: true,
            createdAt: true,
          },
        }),
        prisma.plant.findMany({
          where: { userId },
          include: { growthPhotos: true, careLogs: true },
        }),
        prisma.discovery.findMany({ where: { userId } }),
        prisma.observation.findMany({ where: { userId } }),
        prisma.gardenPlacement.findMany({ where: { userId } }),
        prisma.coinTransaction.findMany({ where: { userId } }),
      ]);

    const exportPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user,
      plants,
      discoveries,
      observations,
      gardenLayout,
      transactions,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="my-garden-world-backup-${new Date().toISOString().split('T')[0]}.json"`
    );
    res.status(200).json(exportPayload);
  } catch (err) {
    next(err);
  }
}

export async function importUserData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const backup = req.body;

    if (!backup || !backup.plants || !Array.isArray(backup.plants)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_BACKUP_FORMAT', message: 'Invalid backup file structure.' },
      });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Import plants and their sub-entries
      for (const p of backup.plants) {
        const createdPlant = await tx.plant.create({
          data: {
            userId,
            name: p.name,
            species: p.species,
            scientificName: p.scientificName,
            family: p.family,
            acquiredDate: p.acquiredDate ? new Date(p.acquiredDate) : new Date(),
            primaryPhotoUrl: p.primaryPhotoUrl || p.initialPhoto || '',
            location: p.location || 'indoor',
            sunlightNeeds: p.sunlightNeeds || 'indirect_bright',
            waterFrequencyDays: p.waterFrequencyDays || 7,
            notes: p.notes || '',
          },
        });

        if (p.growthPhotos && Array.isArray(p.growthPhotos)) {
          for (const gp of p.growthPhotos) {
            await tx.growthEntry.create({
              data: {
                plantId: createdPlant.id,
                userId,
                photoUrl: gp.photoUrl,
                takenAt: gp.takenAt ? new Date(gp.takenAt) : new Date(),
                stageLabel: gp.stageLabel || 'Growth Update',
                notes: gp.notes || '',
              },
            });
          }
        }

        if (p.careLogs && Array.isArray(p.careLogs)) {
          for (const cl of p.careLogs) {
            await tx.careLog.create({
              data: {
                plantId: createdPlant.id,
                userId,
                type: cl.type,
                timestamp: cl.timestamp ? new Date(cl.timestamp) : new Date(),
                notes: cl.notes || '',
                xpAwarded: cl.xpAwarded || 10,
              },
            });
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Backup data successfully imported into your account.',
    });
  } catch (err) {
    next(err);
  }
}
