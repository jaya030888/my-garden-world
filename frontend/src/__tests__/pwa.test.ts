import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Progressive Web App (PWA) Configuration & Safety Integrity', () => {
  const publicDir = path.resolve(__dirname, '../../public');
  const manifestPath = path.join(publicDir, 'manifest.json');
  const swPath = path.join(publicDir, 'sw.js');

  it('should have a valid, well-formed web app manifest', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    expect(manifest.name).toBe('My Garden World — Open-Source AI Plant Companion');
    expect(manifest.short_name).toBe('Garden World');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toContain('pwa');
    expect(manifest.icons).toBeInstanceOf(Array);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);
  });

  it('should include all required standard and maskable icons', () => {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    const iconSrcs = manifest.icons.map((i: any) => i.src);
    expect(iconSrcs).toContain('/icons/icon-192.png');
    expect(iconSrcs).toContain('/icons/icon-512.png');
    expect(iconSrcs).toContain('/icons/icon-maskable-192.png');
    expect(iconSrcs).toContain('/icons/icon-maskable-512.png');

    for (const src of iconSrcs) {
      if (src.startsWith('/icons/')) {
        const filePath = path.join(publicDir, src);
        expect(fs.existsSync(filePath), `Icon file ${src} must exist on disk`).toBe(true);
      }
    }
  });

  it('should have a safe service worker excluding authenticated APIs and large neural weights', () => {
    expect(fs.existsSync(swPath)).toBe(true);
    const swCode = fs.readFileSync(swPath, 'utf-8');

    // Must exclude backend APIs
    expect(swCode).toContain('EXCLUDE_URL_PATTERNS');
    expect(swCode).toContain('api');
    // Must exclude HuggingFace CDN so @xenova/transformers manages model cache directly
    expect(swCode).toContain('huggingface');
    expect(swCode).toContain('.onnx');
    // Must provide offline navigation fallback to index.html
    expect(swCode).toContain("request.mode === 'navigate'");
    expect(swCode).toContain('/index.html');
  });
});
