import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  gridToIso,
  isoToGrid,
  drawIsoDiamond,
  drawIsoBlock,
  drawScenicEnvironment,
  drawIsometricItem,
  ISO_TILE_WIDTH,
  ISO_TILE_HEIGHT,
  Particle,
  Butterfly,
  Point2D
} from './IsometricGardenEngine';
import { PlacedGardenItem, GardenShopItem } from '../../types';
import { SimulatedPlantState } from '../../services/gardenSimulation';

interface IsometricGardenCanvasProps {
  gridDimension: number;
  placedItems: PlacedGardenItem[];
  plantStates: Record<string, SimulatedPlantState>;
  selectedInventoryItem: GardenShopItem | null;
  selectedPlacedInstanceId: string | null;
  selectedTool: 'select' | 'water' | 'harvest' | 'rotate' | 'remove';
  weather: 'sunny' | 'golden_hour' | 'twilight' | 'rain';
  onTileClick: (x: number, y: number) => void;
  onItemClick: (item: PlacedGardenItem, screenPos: Point2D) => void;
  onWaterEffectTriggered?: (x: number, y: number) => void;
}

export const IsometricGardenCanvas: React.FC<IsometricGardenCanvasProps> = ({
  gridDimension,
  placedItems,
  plantStates,
  selectedInventoryItem,
  selectedPlacedInstanceId,
  selectedTool,
  weather,
  onTileClick,
  onItemClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Camera Pan & Zoom State
  const [cameraOffset, setCameraOffset] = useState<Point2D>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Point2D>({ x: 0, y: 0 });
  const [hoveredTile, setHoveredTile] = useState<Point2D | null>(null);

  // Particles & Animated Entities
  const particlesRef = useRef<Particle[]>([]);
  const butterfliesRef = useRef<Butterfly[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Initialize Butterflies
  useEffect(() => {
    const butterflies: Butterfly[] = [
      { x: 200, y: 180, baseX: 220, baseY: 200, color: '#f59e0b', wingSpan: 6, phase: 0, speed: 1.2, radius: 45 },
      { x: 380, y: 260, baseX: 360, baseY: 240, color: '#ec4899', wingSpan: 5, phase: 2, speed: 1.5, radius: 55 },
      { x: 280, y: 350, baseX: 300, baseY: 320, color: '#38bdf8', wingSpan: 6, phase: 4, speed: 1.1, radius: 50 },
      { x: 450, y: 180, baseX: 430, baseY: 190, color: '#a855f7', wingSpan: 5, phase: 1.5, speed: 1.4, radius: 40 }
    ];
    butterfliesRef.current = butterflies;
  }, []);

  // Spawn environmental particles
  const spawnParticles = useCallback((width: number, height: number) => {
    if (particlesRef.current.length < 25) {
      if (weather === 'twilight') {
        // Glowing Fireflies
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          alpha: 0.8,
          size: 3 + Math.random() * 2,
          color: '#fef08a',
          life: 0,
          maxLife: 200 + Math.random() * 150,
          type: 'firefly'
        });
      } else if (weather === 'rain') {
        // Raindrops & ground splashes
        particlesRef.current.push({
          x: Math.random() * width,
          y: -10,
          vx: 1.5,
          vy: 8 + Math.random() * 4,
          alpha: 0.6,
          size: 1.5,
          color: '#38bdf8',
          life: 0,
          maxLife: 60,
          type: 'water'
        });
      } else {
        // Drifting Blossom Petals
        particlesRef.current.push({
          x: Math.random() * width,
          y: -10,
          vx: 0.4 + Math.random() * 0.6,
          vy: 0.8 + Math.random() * 0.8,
          alpha: 0.7,
          size: 3.5,
          color: Math.random() > 0.5 ? '#fbcfe8' : '#fef08a',
          life: 0,
          maxLife: 300,
          type: 'petal'
        });
      }
    }
  }, [weather]);

  // Main 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const displayW = rect.width;
      const displayH = rect.height;

      if (canvas.width !== displayW * dpr || canvas.height !== displayH * dpr) {
        canvas.width = displayW * dpr;
        canvas.height = displayH * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const time = (Date.now() - startTimeRef.current) / 1000;

      // 1. Draw Scenic Natural Environment Background
      drawScenicEnvironment(ctx, displayW, displayH, time, weather);

      // 2. Setup Isometric Camera Transform
      const originX = displayW / 2 + cameraOffset.x;
      const originY = displayH * 0.35 + cameraOffset.y;

      ctx.save();
      ctx.translate(originX, originY);
      ctx.scale(zoom, zoom);

      // 3. Draw Isometric Terrain Base Block & Grid Tiles
      const tileW = ISO_TILE_WIDTH;
      const tileH = ISO_TILE_HEIGHT;

      // Draw raised island block base under the entire plot
      for (let x = 0; x < gridDimension; x++) {
        for (let y = 0; y < gridDimension; y++) {
          const iso = gridToIso(x, y, 0, 0, tileW, tileH);
          
          const isEdge = x === gridDimension - 1 || y === gridDimension - 1;
          const isTilled = (x >= 2 && x <= 5 && y >= 2 && y <= 5);
          
          const topColor = isTilled ? '#5d4037' : ((x + y) % 2 === 0 ? '#437d28' : '#4d8c2e');
          const leftColor = isTilled ? '#3e2723' : '#275214';
          const rightColor = isTilled ? '#4e342e' : '#32661c';

          if (isEdge) {
            drawIsoBlock(ctx, iso.x, iso.y, 14, topColor, leftColor, rightColor, tileW, tileH);
          } else {
            drawIsoDiamond(ctx, iso.x, iso.y, tileW, tileH, topColor, 'rgba(0,0,0,0.08)', 1);
          }

          // Subtle grass blade details
          if (!isTilled && (x + y) % 3 === 0) {
            ctx.fillStyle = '#86efac';
            ctx.fillRect(iso.x - 2, iso.y - 4, 1.5, 3);
            ctx.fillRect(iso.x + 2, iso.y - 3, 1.5, 3);
          }
        }
      }

      // 4. Highlight Hovered Tile (Emerald = Valid, Rose = Invalid)
      if (hoveredTile && hoveredTile.x >= 0 && hoveredTile.x < gridDimension && hoveredTile.y >= 0 && hoveredTile.y < gridDimension) {
        const hoverIso = gridToIso(hoveredTile.x, hoveredTile.y, 0, 0, tileW, tileH);
        const isOccupied = placedItems.some(i => i.gridX === hoveredTile.x && i.gridY === hoveredTile.y);
        
        const highlightFill = selectedInventoryItem
          ? (isOccupied ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)')
          : 'rgba(255, 255, 255, 0.25)';
        const highlightStroke = selectedInventoryItem
          ? (isOccupied ? '#f43f5e' : '#10b981')
          : '#ffffff';

        drawIsoDiamond(ctx, hoverIso.x, hoverIso.y, tileW, tileH, highlightFill, highlightStroke, 2);
      }

      // 5. Render Depth-Sorted Isometric Placed Items
      // Depth Sort Formula: x + y (painter's algorithm)
      const sortedItems = [...placedItems].sort((a, b) => (a.gridX + a.gridY) - (b.gridX + b.gridY));

      sortedItems.forEach(item => {
        const iso = gridToIso(item.gridX, item.gridY, 0, 0, tileW, tileH);
        const plant = plantStates[item.instanceId];
        const isSelected = item.instanceId === selectedPlacedInstanceId;
        const isHovered = hoveredTile?.x === item.gridX && hoveredTile?.y === item.gridY;

        drawIsometricItem(
          ctx,
          item.itemId,
          iso.x,
          iso.y,
          item.rotation,
          plant?.stage || 'bloom',
          plant?.moisture === 'dry' ? 20 : (plant?.moisture === 'moist' ? 100 : 70),
          time,
          isHovered,
          isSelected
        );
      });

      // 6. Render Ghost Placement Preview if item is selected from inventory
      if (selectedInventoryItem && hoveredTile && hoveredTile.x >= 0 && hoveredTile.x < gridDimension && hoveredTile.y >= 0 && hoveredTile.y < gridDimension) {
        const hoverIso = gridToIso(hoveredTile.x, hoveredTile.y, 0, 0, tileW, tileH);
        const isOccupied = placedItems.some(i => i.gridX === hoveredTile.x && i.gridY === hoveredTile.y);

        if (!isOccupied) {
          ctx.save();
          ctx.globalAlpha = 0.7;
          drawIsometricItem(
            ctx,
            selectedInventoryItem.id,
            hoverIso.x,
            hoverIso.y - 6 + Math.sin(time * 4) * 3,
            0,
            selectedInventoryItem.id.startsWith('seed-') ? 'seed' : 'bloom',
            100,
            time,
            true,
            false
          );
          ctx.restore();
        }
      }

      // 7. Update & Draw Butterflies in 2.5D space
      butterfliesRef.current.forEach(bf => {
        bf.phase += 0.05 * bf.speed;
        bf.x = bf.baseX + Math.sin(bf.phase) * bf.radius;
        bf.y = bf.baseY + Math.cos(bf.phase * 0.7) * (bf.radius * 0.6);

        // Flapping wings
        const flap = Math.sin(time * 18 * bf.speed);
        ctx.save();
        ctx.translate(bf.x, bf.y);
        ctx.fillStyle = bf.color;
        // Left Wing
        ctx.beginPath();
        ctx.ellipse(-3 * flap, -2, bf.wingSpan, bf.wingSpan * 0.6, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Right Wing
        ctx.beginPath();
        ctx.ellipse(3 * flap, -2, bf.wingSpan, bf.wingSpan * 0.6, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Body
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-0.8, -3, 1.6, 6);
        ctx.restore();
      });

      ctx.restore(); // restore camera transform

      // 8. Update & Draw Ambient Environmental Particles (Petals / Rain / Fireflies)
      spawnParticles(displayW, displayH);

      particlesRef.current = particlesRef.current.filter(p => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        if (p.type === 'petal') {
          p.vx += Math.sin(time + p.y * 0.01) * 0.05;
        }

        const alpha = Math.max(0, p.alpha * (1 - p.life / p.maxLife));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;

        if (p.type === 'firefly') {
          // Firefly with soft glow aura
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.8 + Math.sin(time * 6 + p.life) * 0.3), 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'water') {
          ctx.fillRect(p.x, p.y, p.size, p.size * 3);
        } else {
          // Blossom petal
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size, p.size * 0.6, p.x * 0.02, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        return p.life < p.maxLife && p.y < displayH + 20 && p.x > -20 && p.x < displayW + 20;
      });

      ctx.restore(); // restore dpr scale

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    gridDimension,
    placedItems,
    plantStates,
    selectedInventoryItem,
    selectedPlacedInstanceId,
    hoveredTile,
    cameraOffset,
    zoom,
    weather,
    spawnParticles
  ]);

  // Handle Pointer Movement & Isometric Raycasting
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (isDragging) {
      setCameraOffset({
        x: screenX - dragStart.x,
        y: screenY - dragStart.y
      });
      return;
    }

    const originX = rect.width / 2 + cameraOffset.x;
    const originY = rect.height * 0.35 + cameraOffset.y;

    const canvasRelX = (screenX - originX) / zoom;
    const canvasRelY = (screenY - originY) / zoom;

    const grid = isoToGrid(canvasRelX, canvasRelY, 0, 0, ISO_TILE_WIDTH, ISO_TILE_HEIGHT);
    setHoveredTile(grid);
  };

  // Pointer Down (Start Drag / Tap)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({
      x: screenX - cameraOffset.x,
      y: screenY - cameraOffset.y
    });
  };

  // Pointer Up (Complete Click or End Drag)
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // If movement was minimal, treat as click
    const moveDist = Math.hypot(screenX - (dragStart.x + cameraOffset.x), screenY - (dragStart.y + cameraOffset.y));
    if (moveDist < 8) {
      const originX = rect.width / 2 + cameraOffset.x;
      const originY = rect.height * 0.35 + cameraOffset.y;

      const canvasRelX = (screenX - originX) / zoom;
      const canvasRelY = (screenY - originY) / zoom;

      const grid = isoToGrid(canvasRelX, canvasRelY, 0, 0, ISO_TILE_WIDTH, ISO_TILE_HEIGHT);

      if (grid.x >= 0 && grid.x < gridDimension && grid.y >= 0 && grid.y < gridDimension) {
        const clickedItem = placedItems.find(i => i.gridX === grid.x && i.gridY === grid.y);
        if (clickedItem) {
          onItemClick(clickedItem, { x: screenX, y: screenY });
        } else {
          onTileClick(grid.x, grid.y);
        }
      }
    }
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.min(1.8, Math.max(0.65, prev + delta)));
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden touch-none flex items-center justify-center">
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setIsDragging(false);
          setHoveredTile(null);
        }}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating Canvas Controls (Reset View & Zoom) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 p-1.5 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/80 dark:border-stone-800 shadow-md">
        <button
          onClick={() => {
            setCameraOffset({ x: 0, y: 0 });
            setZoom(1.0);
          }}
          title="Reset Garden View"
          className="p-1.5 text-stone-600 hover:text-emerald-600 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold transition-all cursor-pointer"
        >
          🎯 Recenter
        </button>
        <button
          onClick={() => setZoom(z => Math.min(1.8, z + 0.15))}
          title="Zoom In"
          className="p-1.5 text-stone-600 hover:text-emerald-600 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold transition-all cursor-pointer"
        >
          🔍+
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.65, z - 0.15))}
          title="Zoom Out"
          className="p-1.5 text-stone-600 hover:text-emerald-600 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold transition-all cursor-pointer"
        >
          🔍-
        </button>
      </div>
    </div>
  );
};
