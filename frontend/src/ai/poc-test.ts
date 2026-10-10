import { pipeline, env } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';

// Disable local model check to allow downloading from Hugging Face hub, or cache locally
env.allowLocalModels = false;
env.useBrowserCache = true;

export interface ClassificationPrediction {
  label: string;
  score: number;
}

export interface PlantClassificationResult {
  topPrediction: ClassificationPrediction;
  allPredictions: ClassificationPrediction[];
  inferenceTimeMs: number;
  modelInitTimeMs: number;
  modelName: string;
}

let classifierInstance: any = null;
let initDurationMs = 0;

export async function initClassifier(modelName = 'Xenova/mobilenet_v2_1.0_224'): Promise<number> {
  if (classifierInstance) return initDurationMs;
  const start = performance.now();
  console.log(`[AI POC] Initializing open-weight model: ${modelName}...`);
  classifierInstance = await pipeline('image-classification', modelName);
  initDurationMs = performance.now() - start;
  console.log(`[AI POC] Model initialized successfully in ${initDurationMs.toFixed(1)}ms`);
  return initDurationMs;
}

export async function runInference(imageSource: string | Blob | ArrayBuffer): Promise<PlantClassificationResult> {
  const modelName = 'Xenova/mobilenet_v2_1.0_224';
  const initTime = await initClassifier(modelName);
  
  const start = performance.now();
  console.log(`[AI POC] Running genuine inference on input image...`);
  const output = await classifierInstance(imageSource, { topk: 5 });
  const inferenceTimeMs = performance.now() - start;
  
  const predictions: ClassificationPrediction[] = output.map((item: any) => ({
    label: item.label,
    score: item.score
  }));
  
  return {
    topPrediction: predictions[0] || { label: 'Unknown', score: 0 },
    allPredictions: predictions,
    inferenceTimeMs,
    modelInitTimeMs: initTime,
    modelName
  };
}
