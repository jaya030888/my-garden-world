import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = false;

const candidateModels = [
  'Xenova/vit-base-patch16-224',
  'Xenova/resnet-50',
  'Xenova/swin-tiny-patch4-window7-224',
  'Xenova/convnext-tiny-224'
];

async function checkCandidates() {
  for (const model of candidateModels) {
    try {
      console.log(`\nTesting candidate model: ${model}...`);
      const start = Date.now();
      const classifier = await pipeline('image-classification', model, { quantized: true });
      console.log(` SUCCESS! ${model} loaded in ${Date.now() - start}ms`);
      
      const testUrl = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/tiger_lily.jpeg';
      const infStart = Date.now();
      const output = await classifier(testUrl, { topk: 5 });
      console.log(`Inference (${Date.now() - infStart}ms):`, output);
      return model;
    } catch (e) {
      console.log(` Failed ${model}:`, e.message);
    }
  }
}

checkCandidates();
