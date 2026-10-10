import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = false;

async function testModel() {
  console.log("=== STARTING PHASE 2: REAL-INFERENCE PROOF OF CONCEPT ===");
  const modelName = 'Xenova/mobilenet_v2_1.0_224';
  console.log(`Testing open-weight model: ${modelName}`);
  
  const initStart = Date.now();
  const classifier = await pipeline('image-classification', modelName);
  const initTime = Date.now() - initStart;
  console.log(`Model loaded successfully in ${initTime}ms`);
  
  // Test image 1: A public sample plant/flower URL (daisy / sunflower)
  const testImages = [
    { name: 'Sunflower Test Image', url: 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/sunflower.jpg' },
    { name: 'Tiger Lily Test Image', url: 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/tiger_lily.jpeg' }
  ];

  for (const img of testImages) {
    console.log(`\nEvaluating: ${img.name} (${img.url})`);
    const infStart = Date.now();
    const results = await classifier(img.url, { topk: 5 });
    const infTime = Date.now() - infStart;
    console.log(`Inference completed in ${infTime}ms:`);
    results.forEach((res, i) => {
      console.log(`  ${i + 1}. ${res.label} (${(res.score * 100).toFixed(2)}%)`);
    });
  }

  console.log("\n=== REAL-INFERENCE PROOF OF CONCEPT PASSED ===");
}

testModel().catch(err => {
  console.error("AI POC Test error:", err);
  process.exit(1);
});
