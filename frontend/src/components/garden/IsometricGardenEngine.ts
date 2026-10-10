// Isometric Garden Engine & Vector Canvas Drawing Pipeline
// Supports 2.5D isometric projection, depth sorting, dynamic animations, and particle systems

export interface Point2D {
  x: number;
  y: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'water' | 'petal' | 'firefly' | 'ripple' | 'sparkle';
  extra?: number;
}

export interface Butterfly {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  color: string;
  wingSpan: number;
  phase: number;
  speed: number;
  radius: number;
}

export interface KoiFish {
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
  tailPhase: number;
}

export const ISO_TILE_WIDTH = 64;
export const ISO_TILE_HEIGHT = 32;

/**
 * Converts grid coordinates (col, row) to 2D isometric canvas coordinates
 */
export function gridToIso(gridX: number, gridY: number, originX: number, originY: number, tileW = ISO_TILE_WIDTH, tileH = ISO_TILE_HEIGHT): Point2D {
  return {
    x: originX + (gridX - gridY) * (tileW / 2),
    y: originY + (gridX + gridY) * (tileH / 2)
  };
}

/**
 * Converts 2D screen/canvas coordinates to discrete grid coordinates
 */
export function isoToGrid(canvasX: number, canvasY: number, originX: number, originY: number, tileW = ISO_TILE_WIDTH, tileH = ISO_TILE_HEIGHT): Point2D {
  const dx = canvasX - originX;
  const dy = canvasY - originY;
  const x = (dy / (tileH / 2) + dx / (tileW / 2)) / 2;
  const y = (dy / (tileH / 2) - dx / (tileW / 2)) / 2;
  return {
    x: Math.floor(x),
    y: Math.floor(y)
  };
}

/**
 * Draws an isometric diamond tile on canvas
 */
export function drawIsoDiamond(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  tileW = ISO_TILE_WIDTH,
  tileH = ISO_TILE_HEIGHT,
  fillColor?: string,
  strokeColor?: string,
  lineWidth = 1
) {
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - tileH / 2);
  ctx.lineTo(centerX + tileW / 2, centerY);
  ctx.lineTo(centerX, centerY + tileH / 2);
  ctx.lineTo(centerX - tileW / 2, centerY);
  ctx.closePath();

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

/**
 * Draws a 3D isometric raised soil/grass block with depth side walls
 */
export function drawIsoBlock(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  depth = 12,
  topColor = '#4a8505',
  leftSideColor = '#2d5a03',
  rightSideColor = '#3a6e04',
  tileW = ISO_TILE_WIDTH,
  tileH = ISO_TILE_HEIGHT
) {
  // Left side face
  ctx.beginPath();
  ctx.moveTo(centerX - tileW / 2, centerY);
  ctx.lineTo(centerX, centerY + tileH / 2);
  ctx.lineTo(centerX, centerY + tileH / 2 + depth);
  ctx.lineTo(centerX - tileW / 2, centerY + depth);
  ctx.closePath();
  ctx.fillStyle = leftSideColor;
  ctx.fill();

  // Right side face
  ctx.beginPath();
  ctx.moveTo(centerX, centerY + tileH / 2);
  ctx.lineTo(centerX + tileW / 2, centerY);
  ctx.lineTo(centerX + tileW / 2, centerY + depth);
  ctx.lineTo(centerX, centerY + tileH / 2 + depth);
  ctx.closePath();
  ctx.fillStyle = rightSideColor;
  ctx.fill();

  // Top diamond face
  drawIsoDiamond(ctx, centerX, centerY, tileW, tileH, topColor, undefined, 0);
}

/**
 * Render scenic natural environment around the garden
 */
export function drawScenicEnvironment(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  weather: 'sunny' | 'golden_hour' | 'twilight' | 'rain'
) {
  // 1. Lush rolling grass background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  if (weather === 'golden_hour') {
    bgGrad.addColorStop(0, '#fde68a');
    bgGrad.addColorStop(0.3, '#78a832');
    bgGrad.addColorStop(1, '#4d7a1e');
  } else if (weather === 'twilight') {
    bgGrad.addColorStop(0, '#1e1b4b');
    bgGrad.addColorStop(0.4, '#14382c');
    bgGrad.addColorStop(1, '#0f291e');
  } else if (weather === 'rain') {
    bgGrad.addColorStop(0, '#94a3b8');
    bgGrad.addColorStop(0.4, '#477a3d');
    bgGrad.addColorStop(1, '#2d5326');
  } else {
    // Sunny
    bgGrad.addColorStop(0, '#bbf7d0');
    bgGrad.addColorStop(0.25, '#86efac');
    bgGrad.addColorStop(0.6, '#5fa828');
    bgGrad.addColorStop(1, '#3d7418');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Scenic Meandering River / Stream on the Right & Top
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(width * 0.45, 0);
  ctx.bezierCurveTo(width * 0.55, height * 0.2, width * 0.7, height * 0.35, width * 0.85, height * 0.5);
  ctx.bezierCurveTo(width * 0.95, height * 0.65, width * 0.75, height * 0.85, width * 0.9, height);
  ctx.lineTo(width, height);
  ctx.lineTo(width, 0);
  ctx.closePath();

  // Riverbed gradient
  const riverGrad = ctx.createLinearGradient(width * 0.5, 0, width * 0.9, height);
  if (weather === 'twilight') {
    riverGrad.addColorStop(0, '#0c4a6e');
    riverGrad.addColorStop(0.5, '#075985');
    riverGrad.addColorStop(1, '#082f49');
  } else if (weather === 'golden_hour') {
    riverGrad.addColorStop(0, '#0284c7');
    riverGrad.addColorStop(0.4, '#38bdf8');
    riverGrad.addColorStop(0.8, '#f59e0b');
    riverGrad.addColorStop(1, '#0369a1');
  } else {
    riverGrad.addColorStop(0, '#0284c7');
    riverGrad.addColorStop(0.3, '#38bdf8');
    riverGrad.addColorStop(0.7, '#0ea5e9');
    riverGrad.addColorStop(1, '#0369a1');
  }
  ctx.fillStyle = riverGrad;
  ctx.fill();

  // River highlights & animated water shimmer
  ctx.lineWidth = 2;
  ctx.strokeStyle = weather === 'twilight' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.45)';
  for (let i = 0; i < 6; i++) {
    const offset = (time * 20 + i * 90) % (height * 0.9);
    const riverX = width * 0.65 + Math.sin(time * 1.5 + i) * 30;
    ctx.beginPath();
    ctx.arc(riverX, offset, 15 + Math.sin(time + i) * 8, 0, Math.PI * 0.8);
    ctx.stroke();
  }

  // Riverbed pebbles & stepping stones
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.ellipse(width * 0.72, height * 0.45, 14, 8, 0.3, 0, Math.PI * 2);
  ctx.ellipse(width * 0.76, height * 0.49, 12, 7, -0.2, 0, Math.PI * 2);
  ctx.ellipse(width * 0.81, height * 0.54, 15, 9, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.ellipse(width * 0.72, height * 0.44, 10, 5, 0.3, 0, Math.PI * 2);
  ctx.ellipse(width * 0.76, height * 0.48, 8, 4, -0.2, 0, Math.PI * 2);
  ctx.ellipse(width * 0.81, height * 0.53, 11, 6, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Lily pads on the river
  const lilyPads = [
    { x: width * 0.68, y: height * 0.28, r: 16 },
    { x: width * 0.74, y: height * 0.32, r: 12 },
    { x: width * 0.82, y: height * 0.65, r: 18 },
    { x: width * 0.88, y: height * 0.72, r: 14 }
  ];
  lilyPads.forEach((pad, idx) => {
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(pad.x, pad.y, pad.r, 0.3, Math.PI * 1.9);
    ctx.lineTo(pad.x, pad.y);
    ctx.closePath();
    ctx.fill();

    // Pink Lotus bloom on every second pad
    if (idx % 2 === 0) {
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(pad.x + 2, pad.y - 3, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(pad.x + 2, pad.y - 3, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  ctx.restore();

  // 3. Arched Wooden Footbridge across the stream
  ctx.save();
  const bridgeX = width * 0.62;
  const bridgeY = height * 0.38;
  // Bridge shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(bridgeX + 20, bridgeY + 35, 45, 18, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Bridge Arch Planks
  ctx.fillStyle = '#854d0e';
  ctx.beginPath();
  ctx.ellipse(bridgeX + 15, bridgeY + 20, 50, 20, 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.ellipse(bridgeX + 15, bridgeY + 16, 46, 17, 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Bridge White Railings & Lanterns
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bridgeX - 25, bridgeY + 10);
  ctx.quadraticCurveTo(bridgeX + 15, bridgeY - 5, bridgeX + 55, bridgeY + 25);
  ctx.stroke();

  // Posts
  for (let p = -20; p <= 50; p += 18) {
    ctx.beginPath();
    ctx.moveTo(bridgeX + p, bridgeY + 10 + p * 0.25);
    ctx.lineTo(bridgeX + p, bridgeY - 2 + p * 0.25);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Grand Weeping Willow Tree in upper-left
  ctx.save();
  const treeX = width * 0.16;
  const treeY = height * 0.22;

  // Tree shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(treeX + 10, treeY + 60, 75, 35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trunk
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(treeX, treeY + 60);
  ctx.quadraticCurveTo(treeX - 10, treeY + 20, treeX, treeY);
  ctx.stroke();

  // Branches
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(treeX, treeY);
  ctx.quadraticCurveTo(treeX - 35, treeY - 25, treeX - 55, treeY - 10);
  ctx.moveTo(treeX, treeY);
  ctx.quadraticCurveTo(treeX + 35, treeY - 30, treeX + 60, treeY - 15);
  ctx.stroke();

  // Lush Foliage & Hanging Weeping Vines
  ctx.fillStyle = '#166534';
  ctx.beginPath();
  ctx.arc(treeX - 30, treeY - 25, 42, 0, Math.PI * 2);
  ctx.arc(treeX + 30, treeY - 25, 45, 0, Math.PI * 2);
  ctx.arc(treeX, treeY - 45, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(treeX - 25, treeY - 28, 36, 0, Math.PI * 2);
  ctx.arc(treeX + 25, treeY - 28, 38, 0, Math.PI * 2);
  ctx.arc(treeX, treeY - 48, 40, 0, Math.PI * 2);
  ctx.fill();

  // Dangling Weeping Vines swaying in the breeze
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 2.5;
  for (let v = -50; v <= 50; v += 12) {
    const sway = Math.sin(time * 2 + v) * 5;
    ctx.beginPath();
    ctx.moveTo(treeX + v, treeY - 15);
    ctx.quadraticCurveTo(treeX + v + sway, treeY + 20, treeX + v + sway * 1.5, treeY + 45);
    ctx.stroke();
  }

  // Wooden Tree Swing
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(treeX - 18, treeY);
  ctx.lineTo(treeX - 22, treeY + 45);
  ctx.moveTo(treeX - 8, treeY);
  ctx.lineTo(treeX - 12, treeY + 45);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(treeX - 26, treeY + 44, 20, 4);
  ctx.restore();

  // 5. Victorian Gazebo / Pavilion in bottom-right
  ctx.save();
  const gazX = width * 0.86;
  const gazY = height * 0.82;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(gazX, gazY + 20, 45, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Base
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.ellipse(gazX, gazY + 12, 38, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Columns
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 4;
  for (let c = -25; c <= 25; c += 12) {
    ctx.beginPath();
    ctx.moveTo(gazX + c, gazY + 10);
    ctx.lineTo(gazX + c * 0.7, gazY - 25);
    ctx.stroke();
  }

  // Roof Dome
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.ellipse(gazX, gazY - 25, 34, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(gazX - 34, gazY - 25);
  ctx.quadraticCurveTo(gazX, gazY - 55, gazX + 34, gazY - 25);
  ctx.closePath();
  ctx.fill();

  // Golden Weathervane spire
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(gazX, gazY - 55);
  ctx.lineTo(gazX, gazY - 65);
  ctx.stroke();
  ctx.restore();

  // 6. Picnic Spot with checkered blanket in middle-right
  ctx.save();
  const picX = width * 0.52;
  const picY = height * 0.62;
  // Isometric Picnic Blanket
  ctx.beginPath();
  ctx.moveTo(picX, picY - 14);
  ctx.lineTo(picX + 30, picY);
  ctx.lineTo(picX, picY + 14);
  ctx.lineTo(picX - 30, picY);
  ctx.closePath();
  ctx.fillStyle = '#f43f5e';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Picnic Wicker Basket
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.ellipse(picX - 6, picY - 2, 8, 6, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.arc(picX + 8, picY - 2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draw 2.5D Isometric Plants & Decorations with Life Cycle Support
 */
export function drawIsometricItem(
  ctx: CanvasRenderingContext2D,
  itemId: string,
  isoX: number,
  isoY: number,
  rotation = 0,
  stage: 'seed' | 'sprout' | 'growing' | 'bloom' = 'bloom',
  hydration = 100,
  time = 0,
  isHovered = false,
  isSelected = false
) {
  ctx.save();
  ctx.translate(isoX, isoY);

  // Soft Isometric Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 18, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Selection or Hover Glow Ring
  if (isSelected) {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Radiant pulsing ring
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, 0, 28 + Math.sin(time * 4) * 2, 14 + Math.sin(time * 4), 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (isHovered) {
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 11, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Handle Plant Growth Stages (seed -> sprout -> growing -> bloom)
  const isPlant = itemId.startsWith('seed-') || itemId.startsWith('vp-') || itemId.startsWith('plant-');

  if (isPlant && (stage === 'seed' || itemId.startsWith('seed-') && stage !== 'bloom')) {
    // Stage 1: Seed / Tilled Soil Mound
    ctx.fillStyle = hydration > 30 ? '#3e2723' : '#5d4037';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tiny golden seed kernels
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(-3, -2, 2.5, 1.5, -0.3, 0, Math.PI * 2);
    ctx.ellipse(3, -1, 2.5, 1.5, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Seed growth aura
    ctx.fillStyle = 'rgba(253, 224, 71, 0.4)';
    ctx.beginPath();
    ctx.arc(0, -4, 4 + Math.sin(time * 3) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (isPlant && stage === 'sprout') {
    // Stage 2: Green Sprout
    // Soil base
    ctx.fillStyle = hydration > 30 ? '#3e2723' : '#5d4037';
    ctx.beginPath();
    ctx.ellipse(0, 2, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    const sway = Math.sin(time * 2) * 1.5;
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(sway, -8, sway * 1.2, -16);
    ctx.stroke();

    // Baby leaves
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(-5 + sway, -16, 5, 2.5, -0.4, 0, Math.PI * 2);
    ctx.ellipse(5 + sway, -16, 5, 2.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (isPlant && stage === 'growing') {
    // Stage 3: Developing Plant with leafy foliage
    ctx.fillStyle = hydration > 30 ? '#3e2723' : '#5d4037';
    ctx.beginPath();
    ctx.ellipse(0, 2, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const sway = Math.sin(time * 1.8) * 2;
    // Central stem
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(sway, -15, sway * 1.5, -28);
    ctx.stroke();

    // Lush leaves
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(-10 + sway, -16, 8, 4, -0.5, 0, Math.PI * 2);
    ctx.ellipse(10 + sway, -18, 8, 4, 0.5, 0, Math.PI * 2);
    ctx.ellipse(-8 + sway, -24, 7, 3.5, -0.3, 0, Math.PI * 2);
    ctx.ellipse(8 + sway, -26, 7, 3.5, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Unopened green flower bud
    ctx.fillStyle = '#84cc16';
    ctx.beginPath();
    ctx.ellipse(sway * 1.5, -30, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Stage 4: Mature Bloom & Full Decoration Renderers
  const sway = Math.sin(time * 1.5) * 1.5;

  if (itemId.includes('sunflower')) {
    // Giant Sunflower
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(sway, -20, sway * 1.3, -40);
    ctx.stroke();

    // Big heart leaves
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(-12 + sway, -18, 9, 5, -0.4, 0, Math.PI * 2);
    ctx.ellipse(12 + sway, -24, 9, 5, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Big golden sunflower head
    const flowerY = -42;
    ctx.fillStyle = '#eab308';
    for (let p = 0; p < 12; p++) {
      const angle = (p * Math.PI * 2) / 12;
      ctx.beginPath();
      ctx.ellipse(
        sway * 1.3 + Math.cos(angle) * 14,
        flowerY + Math.sin(angle) * 14,
        7,
        3.5,
        angle,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    // Sunflower dark seeded center
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(sway * 1.3, flowerY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(sway * 1.3, flowerY, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (itemId.includes('marigold')) {
    // English Marigold
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(sway, -12, sway, -24);
    ctx.stroke();

    // Feathery leaves
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(-8 + sway, -12, 6, 3, -0.4, 0, Math.PI * 2);
    ctx.ellipse(8 + sway, -14, 6, 3, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Layered ruffled velvet orange petals
    const fY = -26;
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(sway, fY, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(sway, fY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(sway, fY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(sway, fY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (itemId.includes('rose')) {
    // Wild Crimson Rose
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(sway, -15, sway, -28);
    ctx.stroke();

    // Leaves
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(-9 + sway, -14, 6, 3, -0.3, 0, Math.PI * 2);
    ctx.ellipse(9 + sway, -18, 6, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Layered scarlet rose petals
    const fY = -30;
    ctx.fillStyle = '#9f1239';
    ctx.beginPath();
    ctx.arc(sway, fY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(sway, fY, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(sway, fY, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (itemId.includes('daisy')) {
    // Meadow Daisy
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(sway, -10, sway, -20);
    ctx.stroke();

    const fY = -22;
    // White ray petals
    ctx.fillStyle = '#ffffff';
    for (let p = 0; p < 10; p++) {
      const angle = (p * Math.PI * 2) / 10;
      ctx.beginPath();
      ctx.ellipse(sway + Math.cos(angle) * 8, fY + Math.sin(angle) * 8, 5, 2.2, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    // Bright yellow disc center
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(sway, fY, 4.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (itemId.includes('lavender')) {
    // Lavender Spires
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(sway, -12, sway, -28);
    ctx.stroke();

    // Purple floral florets along spire
    ctx.fillStyle = '#9333ea';
    for (let f = -12; f >= -28; f -= 4) {
      ctx.beginPath();
      ctx.ellipse(sway - 3, f, 3.5, 2, -0.3, 0, Math.PI * 2);
      ctx.ellipse(sway + 3, f, 3.5, 2, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (itemId.includes('orchid')) {
    // Midnight Royal Orchid (Luminous Deep Violet)
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(sway, -15, sway * 1.2, -32);
    ctx.stroke();

    const fY = -34;
    // Glowing Orchid Petals
    ctx.fillStyle = '#6b21a8';
    ctx.beginPath();
    ctx.ellipse(sway * 1.2 - 10, fY - 2, 9, 6, -0.5, 0, Math.PI * 2);
    ctx.ellipse(sway * 1.2 + 10, fY - 2, 9, 6, 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.ellipse(sway * 1.2, fY - 8, 7, 10, 0, 0, Math.PI * 2);
    ctx.ellipse(sway * 1.2, fY + 4, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(sway * 1.2, fY, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (itemId.includes('lotus')) {
    // Mystic Pink Lotus
    const fY = -24;
    ctx.fillStyle = '#be185d';
    ctx.beginPath();
    ctx.ellipse(sway, fY, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f472b6';
    for (let p = 0; p < 8; p++) {
      const angle = (p * Math.PI * 2) / 8;
      ctx.beginPath();
      ctx.ellipse(sway + Math.cos(angle) * 8, fY + Math.sin(angle) * 5, 7, 4, angle, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(sway, fY, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (itemId.includes('hydrangea')) {
    // Starlight Blue Hydrangea (Spherical Florets)
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(sway, -12, sway, -26);
    ctx.stroke();

    const fY = -28;
    const colors = ['#0284c7', '#38bdf8', '#7dd3fc', '#bae6fd'];
    for (let f = 0; f < 16; f++) {
      const angle = (f * Math.PI * 2) / 16;
      const dist = 6 + (f % 3) * 3;
      ctx.fillStyle = colors[f % colors.length];
      ctx.beginPath();
      ctx.arc(sway + Math.cos(angle) * dist, fY + Math.sin(angle) * dist * 0.7, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (itemId.includes('camellia')) {
    // Mythic Cherry Blossom Camellia
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(sway, -14, sway, -28);
    ctx.stroke();

    const fY = -30;
    // Multi-layered delicate pink ruffles
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(sway, fY, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(sway, fY, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(sway, fY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(sway, fY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (itemId.includes('hibiscus')) {
    // Tropical Scarlet Hibiscus
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(sway, -12, sway, -26);
    ctx.stroke();

    const fY = -28;
    ctx.fillStyle = '#dc2626';
    for (let p = 0; p < 5; p++) {
      const angle = (p * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.ellipse(sway + Math.cos(angle) * 10, fY + Math.sin(angle) * 8, 9, 5.5, angle, 0, Math.PI * 2);
      ctx.fill();
    }

    // Long golden stamen
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sway, fY);
    ctx.lineTo(sway + 4, fY - 10);
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(sway + 4, fY - 10, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (itemId.includes('monstera') || itemId.includes('pothos')) {
    // Tropical Foliage
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(-10 + sway, -14, 12, 7, -0.6, 0, Math.PI * 2);
    ctx.ellipse(10 + sway, -16, 12, 7, 0.6, 0, Math.PI * 2);
    ctx.ellipse(0, -22, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (itemId.includes('fountain')) {
    // Tiered Stone Fountain
    // Lower stone basin
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.ellipse(0, -2, 19, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stone pedestal
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-4, -14, 8, 12);

    // Upper tier basin
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(0, -14, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(0, -15, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Splashing water spout & droplets
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.quadraticCurveTo(-6, -26, -10, -4);
    ctx.moveTo(0, -16);
    ctx.quadraticCurveTo(6, -26, 10, -4);
    ctx.stroke();
  } else if (itemId.includes('lantern')) {
    // Japanese Pagoda Stone Lantern
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-3, -16, 6, 16);
    // Lantern chamber
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-5, -24, 10, 8);
    // Pagoda roof
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(-12, -24);
    ctx.lineTo(12, -24);
    ctx.lineTo(0, -32);
    ctx.closePath();
    ctx.fill();
    // Warm candlelight glow
    ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.beginPath();
    ctx.arc(0, -20, 10 + Math.sin(time * 4) * 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (itemId.includes('bench')) {
    // Garden Oak Bench
    ctx.fillStyle = '#78350f';
    // Backrest
    ctx.fillRect(-14, -18, 28, 6);
    // Seat
    ctx.beginPath();
    ctx.moveTo(-16, -10);
    ctx.lineTo(16, -10);
    ctx.lineTo(12, -4);
    ctx.lineTo(-20, -4);
    ctx.closePath();
    ctx.fill();
    // Legs
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-16, -4, 3, 8);
    ctx.fillRect(13, -4, 3, 8);
  } else if (itemId.includes('path') || itemId.includes('stone')) {
    // Cobblestone Path / River Stepping Stones
    ctx.fillStyle = '#78716c';
    ctx.beginPath();
    ctx.ellipse(-6, -2, 6, 3.5, 0.2, 0, Math.PI * 2);
    ctx.ellipse(6, 1, 7, 4, -0.3, 0, Math.PI * 2);
    ctx.ellipse(0, 4, 6, 3, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a8a29e';
    ctx.beginPath();
    ctx.ellipse(-6, -3, 4, 2, 0.2, 0, Math.PI * 2);
    ctx.ellipse(6, 0, 5, 2.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (itemId.includes('deck')) {
    // Teak Wood Deck Tile
    ctx.fillStyle = '#b45309';
    drawIsoDiamond(ctx, 0, 0, ISO_TILE_WIDTH * 0.9, ISO_TILE_HEIGHT * 0.9, '#b45309', '#78350f', 1);
    // Planks
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-16, -8);
    ctx.lineTo(16, 8);
    ctx.moveTo(-8, -12);
    ctx.lineTo(24, 4);
    ctx.stroke();
  } else if (itemId.includes('fence')) {
    // White Picket Fence
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    for (let f = -14; f <= 14; f += 7) {
      ctx.beginPath();
      ctx.moveTo(f - 2, 2);
      ctx.lineTo(f - 2, -16);
      ctx.lineTo(f, -20);
      ctx.lineTo(f + 2, -16);
      ctx.lineTo(f + 2, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // Cross rails
    ctx.fillRect(-16, -12, 32, 2.5);
    ctx.fillRect(-16, -4, 32, 2.5);
  } else if (itemId.includes('birdbath')) {
    // Stone Birdbath with water
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-3, -12, 6, 12);
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(0, -12, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(0, -13, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tiny bluebird
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(6, -17, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Generic Botanical Planter
    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(0, -8, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Plant Hydration Waterdrop indicator if thirsty
  if (isPlant && hydration < 30) {
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(10, -32, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(9, -33, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
