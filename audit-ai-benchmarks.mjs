import { pipeline, env } from '@xenova/transformers';
import fs from 'fs';
import os from 'os';

env.allowLocalModels = false;
env.useBrowserCache = false;

// Diverse real plant photos testing varied angles, backgrounds, and conditions
const realWorldTestPhotos = [
  {
    name: 'Wild Daisy (Field View)',
    url: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=600&q=80',
    expectedBotanicalGroup: 'Daisy / Asteraceae'
  },
  {
    name: 'Garden Sunflower (Direct Bloom)',
    url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&q=80',
    expectedBotanicalGroup: 'Sunflower / Helianthus'
  },
  {
    name: 'Potted Monstera (Indoor Living Room)',
    url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80',
    expectedBotanicalGroup: 'Houseplant / Pot / Aroid'
  },
  {
    name: 'Rose Blossom with Rosehips (Outdoor Shrub)',
    url: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=600&q=80',
    expectedBotanicalGroup: 'Rose / Rosaceae'
  },
  {
    name: 'Woodland Mushroom (Damp Forest Floor)',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80',
    expectedBotanicalGroup: 'Fungi / Mushroom'
  },
  {
    name: 'Fern Fronds (Macro Leaf Texture)',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&q=80',
    expectedBotanicalGroup: 'Fern / Foliage'
  },
  {
    name: 'Succulent Rosette (Desk Planter)',
    url: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600&q=80',
    expectedBotanicalGroup: 'Succulent / Crassulaceae'
  }
];

async function runAudit() {
  console.log('===============================================================');
  console.log('TASK 1 & 2: EMPIRICAL AI MODEL AUDIT & REPRODUCIBILITY BENCHMARK');
  console.log('===============================================================');
  console.log(`Device CPU: ${os.cpus()[0]?.model || 'Unknown'} (${os.cpus().length} cores)`);
  console.log(`OS: ${os.type()} ${os.release()} ${os.arch()}`);
  console.log(`Node Runtime: ${process.version}`);
  console.log('---------------------------------------------------------------');

  const modelId = 'Xenova/vit-base-patch16-224';
  console.log(`Target Model: ${modelId}`);
  console.log(`Model Source: Hugging Face (google/vit-base-patch16-224 converted to ONNX by Xenova)`);
  console.log(`Quantization: INT8 Quantized (quantized: true)`);
  console.log(`License: Apache-2.0`);
  console.log('---------------------------------------------------------------');

  // Cold Start Measurement
  console.log('\n[1] Measuring Cold-Start Initialization & Weights Download...');
  const initStart = performance.now();
  const classifier = await pipeline('image-classification', modelId, { quantized: true });
  const coldInitMs = performance.now() - initStart;
  console.log(`✓ Cold Initialization Time: ${coldInitMs.toFixed(2)} ms`);

  // Warm-up inference
  console.log('\n[2] Executing Warm-Up Run...');
  const warmupStart = performance.now();
  await classifier(realWorldTestPhotos[0].url, { topk: 5 });
  const warmupMs = performance.now() - warmupStart;
  console.log(`✓ Warm-Up Latency: ${warmupMs.toFixed(2)} ms`);

  // Multi-Trial Inference Latency & Accuracy Audit
  console.log('\n[3] Evaluating Real-World Photographic Dataset (7 diverse specimens)...');
  const evaluationResults = [];
  const warmLatencies = [];

  for (let i = 0; i < realWorldTestPhotos.length; i++) {
    const item = realWorldTestPhotos[i];
    const trialLatencies = [];
    let topPredictions = [];

    // Run 3 consecutive trials per image to measure latency stability
    for (let t = 0; t < 3; t++) {
      const start = performance.now();
      topPredictions = await classifier(item.url, { topk: 5 });
      const elapsed = performance.now() - start;
      trialLatencies.push(elapsed);
      warmLatencies.push(elapsed);
    }

    const avgLatency = trialLatencies.reduce((a, b) => a + b, 0) / trialLatencies.length;
    const top1 = topPredictions[0];

    evaluationResults.push({
      photoName: item.name,
      expectedGroup: item.expectedBotanicalGroup,
      top1PredictedClass: top1.label,
      confidence: (top1.score * 100).toFixed(2) + '%',
      avgLatencyMs: avgLatency.toFixed(1),
      allTop3: topPredictions.slice(0, 3).map(p => `${p.label} (${(p.score * 100).toFixed(1)}%)`).join(' | ')
    });
  }

  console.log('\n===============================================================');
  console.log('EVALUATION RESULTS TABLE');
  console.log('===============================================================');
  console.table(evaluationResults);

  const meanWarmLatency = warmLatencies.reduce((a, b) => a + b, 0) / warmLatencies.length;
  const variance = warmLatencies.reduce((acc, val) => acc + Math.pow(val - meanWarmLatency, 2), 0) / warmLatencies.length;
  const stdDev = Math.sqrt(variance);

  console.log('\n===============================================================');
  console.log('AUDIT SUMMARY METRICS');
  console.log('===============================================================');
  console.log(`- Cold Initialization Time: ${coldInitMs.toFixed(1)} ms`);
  console.log(`- Warm-Up Inference Latency: ${warmupMs.toFixed(1)} ms`);
  console.log(`- Total Warm Inference Runs: ${warmLatencies.length}`);
  console.log(`- Mean Warm Inference Latency: ${meanWarmLatency.toFixed(2)} ms`);
  console.log(`- Latency Standard Deviation: ±${stdDev.toFixed(2)} ms`);
  console.log(`- Min Latency: ${Math.min(...warmLatencies).toFixed(1)} ms | Max Latency: ${Math.max(...warmLatencies).toFixed(1)} ms`);
  console.log('===============================================================');
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
