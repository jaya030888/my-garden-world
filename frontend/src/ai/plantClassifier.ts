import { pipeline, env } from '@xenova/transformers';
import { IdentificationResult, ClassificationPrediction } from '../types';
import { evaluateModelPrediction } from './botanicalDatabase';

// Configure transformers.js environment for browser client execution
if (typeof window !== 'undefined') {
  env.allowLocalModels = false;
  env.useBrowserCache = true;
}

export interface ModelLoadingProgress {
  status: 'idle' | 'downloading' | 'loading' | 'ready' | 'error';
  progress?: number;
  message?: string;
}

const MODEL_ID = 'Xenova/vit-base-patch16-224';
let classifierPipeline: any = null;
let initPromise: Promise<any> | null = null;
let modelInitDurationMs = 0;

/**
 * Initializes the Vision Transformer model singleton with optional progress callback.
 */
export async function getOrInitClassifier(
  onProgress?: (progress: ModelLoadingProgress) => void
): Promise<any> {
  if (classifierPipeline) {
    if (onProgress) onProgress({ status: 'ready', message: 'AI Model ready in memory' });
    return classifierPipeline;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      if (onProgress) {
        onProgress({ status: 'downloading', message: 'Fetching open-weight Vision Transformer (ViT-Base)...' });
      }
      
      const start = performance.now();
      
      classifierPipeline = await pipeline('image-classification', MODEL_ID, {
        quantized: true,
        progress_callback: (item: any) => {
          if (onProgress && item.status === 'progress' && item.progress !== undefined) {
            onProgress({
              status: 'downloading',
              progress: Math.round(item.progress),
              message: `Loading neural weights: ${Math.round(item.progress)}%`
            });
          }
        }
      });
      
      modelInitDurationMs = performance.now() - start;
      if (onProgress) {
        onProgress({
          status: 'ready',
          message: `Model loaded in ${(modelInitDurationMs / 1000).toFixed(2)}s`
        });
      }
      
      return classifierPipeline;
    } catch (err: any) {
      initPromise = null;
      if (onProgress) {
        onProgress({
          status: 'error',
          message: `Failed to load AI model: ${err?.message || 'Network/WASM error'}`
        });
      }
      throw err;
    }
  })();

  return initPromise;
}

/**
 * Preprocesses an image and runs genuine open-weight model inference.
 * Evaluates predictions against verified botanical taxonomy with honest confidence calibration.
 */
export async function identifyPlant(
  imageSource: string | HTMLImageElement | Blob | File,
  onProgress?: (progress: ModelLoadingProgress) => void
): Promise<IdentificationResult> {
  const classifier = await getOrInitClassifier(onProgress);

  let inputData: any = imageSource;
  let imageUrl = '';

  if (typeof imageSource === 'string') {
    imageUrl = imageSource;
  } else if (imageSource instanceof Blob || imageSource instanceof File) {
    imageUrl = URL.createObjectURL(imageSource);
    inputData = imageUrl;
  } else if (imageSource instanceof HTMLImageElement) {
    imageUrl = imageSource.src;
  }

  if (onProgress) {
    onProgress({ status: 'loading', message: 'Running on-device neural inference...' });
  }

  const start = performance.now();
  let rawOutputs: any[] = [];
  
  try {
    rawOutputs = await classifier(inputData, { topk: 5 });
  } catch (inferenceErr: any) {
    console.error('[PlantClassifier] Inference error:', inferenceErr);
    throw new Error(`Inference computation failed: ${inferenceErr.message}`);
  }
  
  const inferenceTimeMs = performance.now() - start;

  if (!rawOutputs || rawOutputs.length === 0) {
    throw new Error('Model produced no prediction classes.');
  }

  // Map predictions to verified botanical taxonomy or container/unidentified status
  const predictions: ClassificationPrediction[] = rawOutputs.map((item: any) => {
    const rawLabel = String(item.label || 'Unknown');
    const score = Number(item.score || 0);
    return evaluateModelPrediction(rawLabel, score);
  });

  const top = predictions[0];
  
  // Honest confidence calibration:
  // Non-species object detections (like flowerpots) or unverified classes are always 'uncertain'
  let confidenceTier: 'high' | 'moderate' | 'uncertain' = 'uncertain';
  if (top.isVerifiedSpecies && top.score >= 0.70) {
    confidenceTier = 'high';
  } else if (top.isVerifiedSpecies && top.score >= 0.35) {
    confidenceTier = 'moderate';
  } else {
    confidenceTier = 'uncertain';
  }

  return {
    id: `id-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    imageUrl,
    topPrediction: top,
    alternativePredictions: predictions.slice(1),
    inferenceTimeMs,
    modelName: MODEL_ID,
    confidenceTier,
    isSaved: false,
    isUnidentified: !top.isVerifiedSpecies
  };
}
