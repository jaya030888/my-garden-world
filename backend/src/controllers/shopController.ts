import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const buyItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
});

export async function getShopItems(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const user = req.user!;

    const [items, inventory] = await Promise.all([
      prisma.shopItem.findMany({
        where: { isAvailable: true },
        orderBy: [{ category: 'asc' }, { price: 'asc' }],
      }),
      prisma.userInventory.findMany({
        where: { userId },
      }),
    ]);

    const inventoryMap = new Map(inventory.map((inv) => [inv.itemId, inv.quantity]));

    const catalog = items.map((item) => ({
      ...item,
      unlocked: user.level >= item.requiredLevel,
      ownedQuantity: inventoryMap.get(item.id) || 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        catalog,
        userBalance: {
          coins: user.coins,
          level: user.level,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function purchaseItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { itemId } = buyItemSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch user and item with locking
      const [user, shopItem] = await Promise.all([
        tx.user.findUnique({ where: { id: userId } }),
        tx.shopItem.findUnique({ where: { id: itemId } }),
      ]);

      if (!user) throw new Error('USER_NOT_FOUND');
      if (!shopItem) throw new Error('ITEM_NOT_FOUND');

      // 2. Validate level requirement
      if (user.level < shopItem.requiredLevel) {
        throw new Error(`LEVEL_TOO_LOW: Requires Botanist Level ${shopItem.requiredLevel}`);
      }

      // 3. Validate coin balance
      if (user.coins < shopItem.price) {
        throw new Error(`INSUFFICIENT_COINS: Costs ${shopItem.price} coins, but you only have ${user.coins}`);
      }

      const newBalance = user.coins - shopItem.price;

      // 4. Deduct coins
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { coins: newBalance },
      });

      // 5. Add or increment inventory
      const existingInv = await tx.userInventory.findUnique({
        where: { userId_itemId: { userId, itemId } },
      });

      let userInventory;
      if (existingInv) {
        userInventory = await tx.userInventory.update({
          where: { id: existingInv.id },
          data: { quantity: existingInv.quantity + 1 },
        });
      } else {
        userInventory = await tx.userInventory.create({
          data: {
            userId,
            itemId,
            quantity: 1,
          },
        });
      }

      // 6. Record purchase transaction
      const transaction = await tx.coinTransaction.create({
        data: {
          userId,
          amount: -shopItem.price,
          currency: 'coins',
          balanceAfter: newBalance,
          type: 'shop_purchase',
          description: `Purchased ${shopItem.name}`,
          referenceId: itemId,
        },
      });

      return { updatedUser, userInventory, shopItem, transaction };
    });

    res.status(200).json({
      success: true,
      message: `Successfully purchased ${result.shopItem.name}!`,
      data: {
        item: result.shopItem,
        inventory: result.userInventory,
        user: {
          id: result.updatedUser.id,
          coins: result.updatedUser.coins,
          level: result.updatedUser.level,
        },
      },
    });
  } catch (err: any) {
    if (err.message?.startsWith('LEVEL_TOO_LOW')) {
      res.status(403).json({
        success: false,
        error: { code: 'LEVEL_TOO_LOW', message: err.message.replace('LEVEL_TOO_LOW: ', '') },
      });
      return;
    }
    if (err.message?.startsWith('INSUFFICIENT_COINS')) {
      res.status(400).json({
        success: false,
        error: { code: 'INSUFFICIENT_COINS', message: err.message.replace('INSUFFICIENT_COINS: ', '') },
      });
      return;
    }
    if (err.message === 'ITEM_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: { code: 'ITEM_NOT_FOUND', message: 'Shop item not found.' },
      });
      return;
    }
    next(err);
  }
}
