import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { awardEconomyRewardsTx } from '../services/economyService.js';

const identifyPlantSchema = z.object({
  imageBase64: z.string().min(1, 'Image base64 data is required'),
  topK: z.number().int().min(1).max(10).default(5),
  notes: z.string().optional(),
});

const saveDiscoverySchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().min(1, 'Image URL is required'),
  topPrediction: z.object({
    label: z.string(),
    score: z.number(),
    botanicalInfo: z
      .object({
        speciesName: z.string().optional(),
        scientificName: z.string().optional(),
        commonNames: z.array(z.string()).optional(),
        family: z.string().optional(),
        description: z.string().optional(),
      })
      .optional(),
  }),
  alternativePredictions: z
    .array(
      z.object({
        label: z.string(),
        score: z.number(),
      })
    )
    .optional(),
  confidenceTier: z.enum(['high', 'moderate', 'uncertain']).default('moderate'),
  notes: z.string().optional(),
});

export async function getDiscoveries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const discoveries = await prisma.discovery.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    res.status(200).json({
      success: true,
      data: { discoveries },
    });
  } catch (err) {
    next(err);
  }
}

export async function identifyWithAiService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const data = identifyPlantSchema.parse(req.body);

    const aiUrl = `${env.AI_SERVICE_URL.replace(/\/$/, '')}/classify/base64`;
    let aiResponse: any;

    try {
      const response = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: data.imageBase64,
          top_k: data.topK,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service responded with status ${response.status}`);
      }

      aiResponse = await response.json();
    } catch (aiErr: any) {
      console.warn('[DiscoveryController] Python AI service unreachable, returning error:', aiErr.message);
      res.status(503).json({
        success: false,
        error: {
          code: 'AI_SERVICE_UNAVAILABLE',
          message: 'The Python AI model service is currently unavailable. Please verify the AI microservice is running.',
        },
      });
      return;
    }

    const topPrediction = aiResponse.top_prediction;
    const botanicalInfo = topPrediction.botanical_info;
    const speciesName = botanicalInfo?.species_name || topPrediction.label;

    // Save discovery in PostgreSQL and award rewards
    const result = await prisma.$transaction(async (tx) => {
      const discovery = await tx.discovery.create({
        data: {
          userId,
          timestamp: new Date(),
          imageUrl: data.imageBase64.startsWith('data:') ? data.imageBase64.substring(0, 100) + '...' : 'Uploaded Photo',
          topLabel: topPrediction.label,
          topScore: topPrediction.score,
          confidenceTier: aiResponse.confidence_tier || 'moderate',
          scientificName: botanicalInfo?.scientific_name,
          commonNames: botanicalInfo?.common_names ? JSON.stringify(botanicalInfo.common_names) : undefined,
          alternativePredictions: (aiResponse.alternative_predictions as any) || undefined,
          notes: data.notes || '',
          isSaved: true,
        },
      });

      // Award Identification Reward: 25 coins, 35 XP
      const rewardResult = await awardEconomyRewardsTx(tx, {
        userId,
        coins: 25,
        xp: 35,
        description: `Identified & cataloged ${speciesName} via Python AI Service`,
        type: 'discovery_reward',
        referenceId: discovery.id,
      });

      return { discovery, rewardResult };
    });

    res.status(200).json({
      success: true,
      data: {
        aiResult: aiResponse,
        discovery: result.discovery,
        user: result.rewardResult.user,
        levelUp: result.rewardResult.levelUp,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function saveDiscovery(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const data = saveDiscoverySchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const topInfo = data.topPrediction.botanicalInfo;
      const speciesName = topInfo?.speciesName || data.topPrediction.label;

      const discovery = await tx.discovery.create({
        data: {
          ...(data.id ? { id: data.id } : {}),
          userId,
          timestamp: new Date(),
          imageUrl: data.imageUrl,
          topLabel: data.topPrediction.label,
          topScore: data.topPrediction.score,
          confidenceTier: data.confidenceTier,
          scientificName: topInfo?.scientificName,
          commonNames: topInfo?.commonNames ? JSON.stringify(topInfo.commonNames) : undefined,
          alternativePredictions: (data.alternativePredictions as any) || undefined,
          notes: data.notes || '',
          isSaved: true,
        },
      });

      // Award Identification Reward: 25 coins, 35 XP
      const rewardResult = await awardEconomyRewardsTx(tx, {
        userId,
        coins: 25,
        xp: 35,
        description: `Identified & cataloged ${speciesName}`,
        type: 'discovery_reward',
        referenceId: discovery.id,
      });

      // Check first discovery achievement
      const count = await tx.discovery.count({ where: { userId } });
      if (count === 1) {
        await tx.userAchievement.upsert({
          where: { userId_achievementId: { userId, achievementId: 'ach-ai-explorer' } },
          update: {},
          create: {
            userId,
            achievementId: 'ach-ai-explorer',
            unlockedAt: new Date(),
          },
        });
      }

      return { discovery, rewardResult };
    });

    res.status(201).json({
      success: true,
      data: {
        discovery: result.discovery,
        user: result.rewardResult.user,
        levelUp: result.rewardResult.levelUp,
      },
    });
  } catch (err) {
    next(err);
  }
}
