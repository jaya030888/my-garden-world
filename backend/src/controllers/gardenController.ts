import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const placeItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  gridX: z.number().int().min(0).max(7),
  gridY: z.number().int().min(0).max(7),
  rotation: z.number().int().default(0),
});

const moveItemSchema = z.object({
  gridX: z.number().int().min(0).max(7),
  gridY: z.number().int().min(0).max(7),
});

export async function getGardenLayout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const placements = await prisma.gardenPlacement.findMany({
      where: { userId },
      include: {
        shopItem: true,
      },
      orderBy: { placedAt: 'asc' },
    });

    const formatted = placements.map((p) => ({
      instanceId: p.id,
      itemId: p.itemId,
      gridX: p.gridX,
      gridY: p.gridY,
      rotation: p.rotation,
      placedAt: p.placedAt.toISOString(),
      itemDetails: p.shopItem,
    }));

    res.status(200).json({
      success: true,
      data: { layout: formatted },
    });
  } catch (err) {
    next(err);
  }
}

export async function placeGardenItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const data = placeItemSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      // Check collision on target coordinate
      const existingAtCoord = await tx.gardenPlacement.findFirst({
        where: {
          userId,
          gridX: data.gridX,
          gridY: data.gridY,
        },
      });

      if (existingAtCoord) {
        throw new Error(`CELL_OCCUPIED: Tile (${data.gridX}, ${data.gridY}) is already occupied.`);
      }

      const placement = await tx.gardenPlacement.create({
        data: {
          userId,
          itemId: data.itemId,
          gridX: data.gridX,
          gridY: data.gridY,
          rotation: data.rotation,
          placedAt: new Date(),
        },
        include: {
          shopItem: true,
        },
      });

      // Check sanctuary architect achievement (3 items placed)
      const count = await tx.gardenPlacement.count({ where: { userId } });
      if (count >= 3) {
        await tx.userAchievement.upsert({
          where: { userId_achievementId: { userId, achievementId: 'ach-sanctuary-architect' } },
          update: {},
          create: {
            userId,
            achievementId: 'ach-sanctuary-architect',
            unlockedAt: new Date(),
          },
        });
      }

      return placement;
    });

    res.status(201).json({
      success: true,
      data: {
        item: {
          instanceId: result.id,
          itemId: result.itemId,
          gridX: result.gridX,
          gridY: result.gridY,
          rotation: result.rotation,
          placedAt: result.placedAt.toISOString(),
          itemDetails: result.shopItem,
        },
      },
    });
  } catch (err: any) {
    if (err.message?.startsWith('CELL_OCCUPIED')) {
      res.status(409).json({
        success: false,
        error: { code: 'CELL_OCCUPIED', message: err.message.replace('CELL_OCCUPIED: ', '') },
      });
      return;
    }
    next(err);
  }
}

export async function moveGardenItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { instanceId } = req.params;
    const data = moveItemSchema.parse(req.body);

    const placement = await prisma.gardenPlacement.findFirst({
      where: { id: instanceId, userId },
    });

    if (!placement) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Garden item instance not found.' },
      });
      return;
    }

    // Check collision if moving to a different tile
    if (placement.gridX !== data.gridX || placement.gridY !== data.gridY) {
      const existingAtCoord = await prisma.gardenPlacement.findFirst({
        where: {
          userId,
          gridX: data.gridX,
          gridY: data.gridY,
          id: { not: instanceId },
        },
      });

      if (existingAtCoord) {
        res.status(409).json({
          success: false,
          error: { code: 'CELL_OCCUPIED', message: `Tile (${data.gridX}, ${data.gridY}) is already occupied.` },
        });
        return;
      }
    }

    const updated = await prisma.gardenPlacement.update({
      where: { id: instanceId },
      data: {
        gridX: data.gridX,
        gridY: data.gridY,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        instanceId: updated.id,
        gridX: updated.gridX,
        gridY: updated.gridY,
        rotation: updated.rotation,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function rotateGardenItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { instanceId } = req.params;

    const placement = await prisma.gardenPlacement.findFirst({
      where: { id: instanceId, userId },
    });

    if (!placement) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Garden item instance not found.' },
      });
      return;
    }

    const nextRotation = (placement.rotation + 90) % 360;

    const updated = await prisma.gardenPlacement.update({
      where: { id: instanceId },
      data: { rotation: nextRotation },
    });

    res.status(200).json({
      success: true,
      data: {
        instanceId: updated.id,
        rotation: updated.rotation,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function removeGardenItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { instanceId } = req.params;

    const placement = await prisma.gardenPlacement.findFirst({
      where: { id: instanceId, userId },
    });

    if (!placement) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Garden item instance not found.' },
      });
      return;
    }

    await prisma.gardenPlacement.delete({
      where: { id: instanceId },
    });

    res.status(200).json({
      success: true,
      message: 'Garden item removed from canvas.',
    });
  } catch (err) {
    next(err);
  }
}
