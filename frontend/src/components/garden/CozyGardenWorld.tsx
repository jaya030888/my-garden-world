import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Droplets,
  RotateCw,
  Trash2,
  Plus,
  ShoppingBag,
  Camera,
  BookOpen,
  Volume2,
  VolumeX,
  Sun,
  Sunset,
  Moon,
  CloudRain,
  Maximize2,
  X,
  Compass,
  Undo2,
  Layers,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useGarden } from '../../context/GardenContext';
import { GardenShopItem, PlacedGardenItem } from '../../types';
import { GardenItemIllustration } from './GardenItemIllustrations';
import { IsometricGardenCanvas } from './IsometricGardenCanvas';
import { FlowerSelectionModal } from '../modals/FlowerSelectionModal';
import { GardenSpiritCompanion } from './GardenSpiritCompanion';
import { cozyAudio } from '../../services/audioService';
import {
  SimulatedPlantState,
  SPECIES_GROWTH_RULES,
  SpeciesGrowthRule,
  GARDEN_EXPANSION_TIERS,
  advancePlantGrowth,
  WeatherAtmosphere
} from '../../services/gardenSimulation';
import { fireConfetti } from '../../services/economyService';

interface CozyGardenWorldProps {
  onOpenShop: () => void;
  onOpenScanner: () => void;
  onOpenJournal: () => void;
  onOpenQuests: () => void;
  onOpenExercise?: () => void;
}

type ToolMode = 'select' | 'water' | 'harvest' | 'rotate' | 'remove';
type DockCategory = 'all' | 'seeds' | 'plant' | 'path' | 'decoration';

interface UndoAction {
  type: 'place' | 'remove' | 'move' | 'rotate';
  instanceId: string;
  itemId?: string;
  prevX?: number;
  prevY?: number;
  newX?: number;
  newY?: number;
  prevRot?: number;
}

export const CozyGardenWorld: React.FC<CozyGardenWorldProps> = ({
  onOpenShop,
  onOpenScanner,
  onOpenJournal,
  onOpenQuests,
  onOpenExercise
}) => {
  const {
    profile,
    gardenItems,
    shopCatalog,
    placeGardenItem,
    moveGardenItem,
    rotateGardenItem,
    removeGardenItem,
    logPlantCare
  } = useGarden();

  const [plantStates, setPlantStates] = useState<Record<string, SimulatedPlantState>>({});
  const [gridDimension, setGridDimension] = useState<number>(8);
  const [currentWeather, setCurrentWeather] = useState<WeatherAtmosphere>('sunny');
  const [selectedTool, setSelectedTool] = useState<ToolMode>('select');
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<GardenShopItem | null>(null);
  const [dockCategory, setDockCategory] = useState<DockCategory>('all');
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(cozyAudio.getIsMuted());
  const [showExpansionModal, setShowExpansionModal] = useState<boolean>(false);
  const [showFlowerModal, setShowFlowerModal] = useState<boolean>(false);
  const [targetPlantTile, setTargetPlantTile] = useState<{ x: number; y: number } | null>(null);
  const [harvestNotification, setHarvestNotification] = useState<{ text: string; coins: number } | null>(null);

  // Sync gardenItems into simulated plant states
  useEffect(() => {
    setPlantStates(prev => {
      const updated: Record<string, SimulatedPlantState> = { ...prev };
      const now = Date.now();

      gardenItems.forEach(item => {
        if (!updated[item.instanceId]) {
          const isSeed = item.itemId.startsWith('seed-');
          const isPlant = item.itemId.startsWith('vp-');
          let speciesId = 'marigold';
          if (item.itemId.includes('sunflower')) speciesId = 'sunflower';
          if (item.itemId.includes('rose')) speciesId = 'rose';
          if (item.itemId.includes('daisy')) speciesId = 'daisy';
          if (item.itemId.includes('lavender')) speciesId = 'lavender';
          if (item.itemId.includes('orchid')) speciesId = 'orchid';
          if (item.itemId.includes('lotus')) speciesId = 'lotus';
          if (item.itemId.includes('hydrangea')) speciesId = 'hydrangea';
          if (item.itemId.includes('camellia')) speciesId = 'camellia';
          if (item.itemId.includes('monstera')) speciesId = 'monstera';
          if (item.itemId.includes('pothos')) speciesId = 'pothos';
          if (item.itemId.includes('hibiscus')) speciesId = 'hibiscus';

          updated[item.instanceId] = {
            instanceId: item.instanceId,
            itemId: item.itemId,
            speciesId,
            stage: isSeed ? 'seed' : (isPlant ? 'bloom' : 'bloom'),
            growthProgress: isSeed ? 10 : 100,
            plantedAt: now - (isSeed ? 0 : 300000),
            lastWateredAt: now - 30000,
            waterCount: 0,
            moisture: 'moist',
            isHarvestable: !isSeed,
            gridX: item.gridX,
            gridY: item.gridY,
            rotation: item.rotation || 0
          };
        } else {
          updated[item.instanceId].gridX = item.gridX;
          updated[item.instanceId].gridY = item.gridY;
          updated[item.instanceId].rotation = item.rotation || 0;
        }
      });
      return updated;
    });
  }, [gardenItems]);

  // Periodic growth updater tick
  useEffect(() => {
    const timer = setInterval(() => {
      setPlantStates(prev => {
        const next: Record<string, SimulatedPlantState> = {};
        const now = Date.now();
        Object.entries(prev).forEach(([id, plant]) => {
          next[id] = advancePlantGrowth(plant, now);
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const ownedItems = shopCatalog.filter(i => i.unlocked);

  const filteredOwnedItems = ownedItems.filter(item => {
    if (dockCategory === 'all') return true;
    if (dockCategory === 'seeds') return item.id.startsWith('seed-');
    if (dockCategory === 'plant') return item.category === 'plant' && !item.id.startsWith('seed-');
    return item.category === dockCategory;
  });

  const getPlacedItemAt = (x: number, y: number): PlacedGardenItem | undefined => {
    return gardenItems.find(item => item.gridX === x && item.gridY === y);
  };

  const getShopItemById = (id: string): GardenShopItem | undefined => {
    return shopCatalog.find(item => item.id === id);
  };

  const handleCellClick = async (x: number, y: number) => {
    const existing = getPlacedItemAt(x, y);

    if (selectedTool === 'water') {
      if (existing) {
        cozyAudio.playWateringSound();
        setPlantStates(prev => {
          const curr = prev[existing.instanceId];
          if (!curr) return prev;
          const boosted = advancePlantGrowth({
            ...curr,
            lastWateredAt: Date.now(),
            waterCount: curr.waterCount + 1,
            moisture: 'moist'
          });
          return { ...prev, [existing.instanceId]: boosted };
        });
        try {
          await logPlantCare(existing.instanceId, 'water');
        } catch {
          // fallback
        }
      }
      return;
    }

    if (selectedTool === 'harvest') {
      if (existing) {
        const plant = plantStates[existing.instanceId];
        if (plant && (plant.stage === 'bloom' || plant.isHarvestable)) {
          cozyAudio.playHarvestChime();
          fireConfetti();
          const rule = SPECIES_GROWTH_RULES[plant.speciesId] || SPECIES_GROWTH_RULES['marigold'];
          setHarvestNotification({
            text: `Harvested ${rule.commonName}!`,
            coins: rule.coinHarvestYield
          });
          setTimeout(() => setHarvestNotification(null), 3000);

          setPlantStates(prev => ({
            ...prev,
            [existing.instanceId]: {
              ...plant,
              stage: 'sprout',
              growthProgress: 25,
              plantedAt: Date.now(),
              waterCount: 0
            }
          }));
        }
      }
      return;
    }

    if (selectedTool === 'rotate') {
      if (existing) {
        cozyAudio.playPlacementSound();
        setUndoStack(prev => [{ type: 'rotate', instanceId: existing.instanceId, prevRot: (existing.rotation + 270) % 360 }, ...prev.slice(0, 19)]);
        await rotateGardenItem(existing.instanceId);
      }
      return;
    }

    if (selectedTool === 'remove') {
      if (existing) {
        cozyAudio.playPlacementSound();
        setUndoStack(prev => [{ type: 'remove', instanceId: existing.instanceId, itemId: existing.itemId, prevX: existing.gridX, prevY: existing.gridY }, ...prev.slice(0, 19)]);
        await removeGardenItem(existing.instanceId);
        setSelectedCell(null);
      }
      return;
    }

    // Default select / place / move mode
    if (selectedInventoryItem) {
      if (!existing) {
        cozyAudio.playPlacementSound();
        await placeGardenItem(selectedInventoryItem.id, x, y);
      }
      return;
    }

    if (existing) {
      if (selectedCell?.x === x && selectedCell?.y === y) {
        setSelectedCell(null);
      } else {
        setSelectedCell({ x, y });
        cozyAudio.playPlacementSound();
      }
    } else {
      const currentSelectedPlaced = selectedCell ? getPlacedItemAt(selectedCell.x, selectedCell.y) : null;
      if (currentSelectedPlaced) {
        cozyAudio.playPlacementSound();
        setUndoStack(prev => [{
          type: 'move',
          instanceId: currentSelectedPlaced.instanceId,
          prevX: currentSelectedPlaced.gridX,
          prevY: currentSelectedPlaced.gridY,
          newX: x,
          newY: y
        }, ...prev.slice(0, 19)]);
        await moveGardenItem(currentSelectedPlaced.instanceId, x, y);
        setSelectedCell({ x, y });
      } else {
        // Empty tile tapped! Open the Flower Selection Modal to choose a beautiful flower!
        setTargetPlantTile({ x, y });
        setShowFlowerModal(true);
      }
    }
  };

  const handleSowFlower = async (species: SpeciesGrowthRule) => {
    const coords = targetPlantTile || { x: 3, y: 3 };
    cozyAudio.playPlacementSound();
    fireConfetti();
    await placeGardenItem(species.seedItemId, coords.x, coords.y);
    setTargetPlantTile(null);
  };

  const handleApplyMiracleWater = () => {
    cozyAudio.playWateringSound();
    setPlantStates(prev => {
      const updated: Record<string, SimulatedPlantState> = {};
      Object.entries(prev).forEach(([id, plant]) => {
        const nextProgress = Math.min(100, plant.growthProgress + 35);
        updated[id] = {
          ...plant,
          growthProgress: nextProgress,
          stage: nextProgress >= 100 ? 'bloom' : (nextProgress >= 60 ? 'growing' : (nextProgress >= 25 ? 'sprout' : 'seed')),
          isHarvestable: nextProgress >= 100,
          moisture: 'moist',
          lastWateredAt: Date.now()
        };
      });
      return updated;
    });
  };

  const handleUndo = async () => {
    if (undoStack.length === 0) return;
    const [action, ...rest] = undoStack;
    setUndoStack(rest);
    cozyAudio.playPlacementSound();

    try {
      if (action.type === 'rotate') {
        await rotateGardenItem(action.instanceId);
        await rotateGardenItem(action.instanceId);
        await rotateGardenItem(action.instanceId);
      } else if (action.type === 'move' && action.prevX !== undefined && action.prevY !== undefined) {
        await moveGardenItem(action.instanceId, action.prevX, action.prevY);
      } else if (action.type === 'remove' && action.itemId && action.prevX !== undefined && action.prevY !== undefined) {
        await placeGardenItem(action.itemId, action.prevX, action.prevY);
      }
    } catch {
      // rollback
    }
  };

  const selectedPlaced = selectedCell ? getPlacedItemAt(selectedCell.x, selectedCell.y) : null;
  const selectedPlantState = selectedPlaced ? plantStates[selectedPlaced.instanceId] : null;
  const selectedShopItem = selectedPlaced ? getShopItemById(selectedPlaced.itemId) : null;

  const weatherClass = {
    sunny: 'bg-gradient-to-b from-emerald-100/70 via-amber-50/50 to-emerald-100/80',
    golden_hour: 'bg-gradient-to-b from-amber-200/70 via-orange-100/60 to-rose-100/50',
    twilight: 'bg-gradient-to-b from-indigo-950 via-slate-900 to-emerald-950 text-emerald-100',
    rain: 'bg-gradient-to-b from-slate-300 via-sky-200 to-teal-100/80'
  }[currentWeather];

  return (
    <div className={`relative min-h-[calc(100dvh-3.5rem)] flex flex-col justify-between overflow-hidden transition-colors duration-700 select-none touch-pan-garden ${weatherClass}`}>
      
      {/* Ambient Weather Overlays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {currentWeather === 'twilight' && (
          <>
            <div className="absolute w-2.5 h-2.5 rounded-full bg-amber-300 blur-[1px] animate-pulse top-1/4 left-1/5 shadow-[0_0_15px_#fde047]" />
            <div className="absolute w-3 h-3 rounded-full bg-emerald-300 blur-[1px] animate-pulse top-1/2 left-3/4 shadow-[0_0_20px_#86efac]" />
            <div className="absolute w-2 h-2 rounded-full bg-amber-200 blur-[1px] animate-pulse top-3/4 left-1/3 shadow-[0_0_12px_#fef08a]" />
          </>
        )}
        {currentWeather === 'rain' && (
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-35 animate-pulse" />
        )}
      </div>

      {/* TOP COMPACT HUD */}
      <header className="relative z-10 p-2 sm:p-4 flex items-center justify-between gap-2 max-w-6xl mx-auto w-full">
        
        {/* Left: Weather & Audio Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1 p-1 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/80 dark:border-stone-700 shadow-xs shrink-0">
          <button
            onClick={() => setCurrentWeather('sunny')}
            title="Radiant Daylight"
            className={`p-1.5 rounded-xl text-xs transition-all cursor-pointer ${currentWeather === 'sunny' ? 'bg-amber-400 text-white shadow-xs scale-105' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentWeather('golden_hour')}
            title="Golden Hour Sunset"
            className={`p-1.5 rounded-xl text-xs transition-all cursor-pointer ${currentWeather === 'golden_hour' ? 'bg-orange-400 text-white shadow-xs scale-105' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <Sunset className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentWeather('twilight')}
            title="Twilight Fireflies"
            className={`p-1.5 rounded-xl text-xs transition-all cursor-pointer ${currentWeather === 'twilight' ? 'bg-indigo-600 text-white shadow-xs scale-105' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentWeather('rain')}
            title="Gentle Spring Rain"
            className={`p-1.5 rounded-xl text-xs transition-all cursor-pointer ${currentWeather === 'rain' ? 'bg-sky-500 text-white shadow-xs scale-105' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <CloudRain className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-stone-300 dark:bg-stone-700 mx-0.5" />
          <button
            onClick={() => {
              const muted = cozyAudio.toggleMute();
              setIsAudioMuted(muted);
            }}
            title={isAudioMuted ? 'Unmute' : 'Mute'}
            className="p-1.5 rounded-xl text-xs text-stone-500 hover:text-stone-800 transition-all cursor-pointer"
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
          </button>
        </div>

        {/* Right: 4 Clean Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {undoStack.length > 0 && (
            <button
              onClick={handleUndo}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Undo last placement or move"
            >
              <Undo2 className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Undo</span>
            </button>
          )}

          <button
            onClick={onOpenScanner}
            className="group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-extrabold shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.5)] border border-emerald-400/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer ring-2 ring-emerald-400/30 animate-pulse"
            title="Scan real plants with AI Vision to unlock seeds and earn coins!"
          >
            <Camera className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition-transform" />
            <span className="font-extrabold tracking-wide">Scan Plant</span>
            <span className="hidden md:inline-block text-[10px] bg-emerald-950/40 text-emerald-200 px-1.5 py-0.5 rounded-full border border-emerald-400/30">
              +50 🪙
            </span>
          </button>

          <button
            onClick={onOpenShop}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-extrabold shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Botanical Nursery & Decor Shop"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden xs:inline sm:inline">Shop</span>
          </button>

          <button
            onClick={onOpenQuests}
            className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-white shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Quests & Goals"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
          </button>

          <button
            onClick={onOpenJournal}
            className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-white shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Botanical Field Journal"
          >
            <BookOpen className="w-4 h-4 text-forest-700" />
          </button>
        </div>
      </header>

      {/* HARVEST POPUP NOTIFICATION */}
      <AnimatePresence>
        {harvestNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-forest-900/95 text-white shadow-xl border border-emerald-500/40 backdrop-blur-md flex items-center gap-2 text-xs font-extrabold"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>{harvestNotification.text}</span>
            <span className="text-amber-400">+{harvestNotification.coins} Coins</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXPANSIVE 2.5D ISOMETRIC GARDEN WORLD SCENE */}
      <main className="relative z-10 flex-1 w-full h-[calc(100dvh-13.5rem)] min-h-[380px] overflow-hidden flex flex-col items-center justify-center">
        
        {/* Full-Viewport Isometric Garden Canvas Scene */}
        <div className="relative w-full h-full">
          <IsometricGardenCanvas
            gridDimension={gridDimension}
            placedItems={gardenItems}
            plantStates={plantStates}
            selectedInventoryItem={selectedInventoryItem}
            selectedPlacedInstanceId={selectedPlaced?.instanceId || null}
            selectedTool={selectedTool}
            weather={currentWeather}
            onTileClick={(x, y) => handleCellClick(x, y)}
            onItemClick={(item) => {
              setSelectedCell({ x: item.gridX, y: item.gridY });
              cozyAudio.playPlacementSound();
            }}
          />

          {/* Active Placement Indicator Badge */}
          {selectedInventoryItem && (
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-950/90 text-emerald-100 border border-emerald-400/50 shadow-xl backdrop-blur-md text-xs font-extrabold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Placing: {selectedInventoryItem.name}</span>
              <button
                onClick={() => setSelectedInventoryItem(null)}
                className="p-1 hover:bg-white/20 rounded-lg text-stone-300 hover:text-white ml-1 cursor-pointer"
                title="Cancel placement"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Expansion Controls Pill */}
          <div className="absolute top-3 right-16 z-20">
            <button
              onClick={() => setShowExpansionModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/90 dark:bg-stone-900/90 hover:bg-white text-forest-950 dark:text-emerald-100 text-xs font-extrabold transition-all active:scale-95 shadow-md border border-stone-200/80 dark:border-stone-700 cursor-pointer"
              title="Expand Garden Meadow Plot"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-500" />
              <span>{gridDimension}×{gridDimension} Meadow</span>
            </button>
          </div>
        </div>

        {/* Selected Item Floating Contextual Action Drawer */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-2 pointer-events-auto">

          {/* Plant Inspector Contextual HUD Popup */}
          <AnimatePresence>
            {selectedPlaced && selectedPlantState && selectedShopItem && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-2.5 w-full p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-stone-900/95 border border-emerald-500/40 shadow-xl backdrop-blur-md flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 z-30"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-forest-100 dark:bg-emerald-950/60 p-1 flex items-center justify-center shrink-0 border border-forest-200">
                    <GardenItemIllustration
                      itemId={selectedPlaced.itemId}
                      rotation={selectedPlaced.rotation}
                      stage={selectedPlantState.stage}
                    />
                  </div>
                  <div className="min-w-0 truncate">
                    <div className="text-xs sm:text-sm font-extrabold text-forest-950 dark:text-emerald-100 truncate">
                      {selectedShopItem.name}
                    </div>
                    <div className="text-[10px] text-stone-500 flex items-center gap-1.5">
                      <span className="capitalize font-bold text-emerald-700 dark:text-emerald-400">{selectedPlantState.stage}</span>
                      <span>•</span>
                      <span>Soil: {selectedPlantState.moisture}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-auto">
                  <button
                    onClick={() => handleCellClick(selectedCell!.x, selectedCell!.y)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                    title="Water plant to accelerate growth"
                  >
                    <Droplets className="w-3.5 h-3.5 fill-white" />
                    <span>Water</span>
                  </button>
                  <button
                    onClick={() => rotateGardenItem(selectedPlaced.instanceId)}
                    className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 text-xs font-bold active:scale-95 cursor-pointer"
                    title="Rotate 90 degrees"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeGardenItem(selectedPlaced.instanceId)}
                    className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 text-xs font-bold active:scale-95 cursor-pointer"
                    title="Store back in inventory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedCell(null)}
                    className="p-1 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* BOTTOM RESPONSIVE DOCK TRAY */}
      <footer className="relative z-10 p-2 sm:p-4 max-w-4xl mx-auto w-full pb-safe">
        <div className="p-2 sm:p-3 rounded-3xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200/80 dark:border-stone-700 shadow-2xl space-y-2">
          
          {/* Action Tool Modes & Category Filters */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar pb-0.5">
            {/* Tool Modes */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  setTargetPlantTile(null);
                  setShowFlowerModal(true);
                  cozyAudio.playPlacementSound();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs hover:scale-102 active:scale-95 transition-all cursor-pointer ring-1 ring-pink-300"
                title="Choose beautiful exotic flowers to sow in your garden"
              >
                <span>🌸 Plant Flower</span>
              </button>

              <button
                onClick={() => { setSelectedTool('select'); setSelectedInventoryItem(null); }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  selectedTool === 'select' && !selectedInventoryItem
                    ? 'bg-forest-800 text-white shadow-xs scale-102'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
                title="Select and move placed objects"
              >
                <span>✋ Move</span>
              </button>
              <button
                onClick={() => setSelectedTool('water')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  selectedTool === 'water'
                    ? 'bg-sky-500 text-white shadow-xs scale-102'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
                title="Water plants to boost growth"
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Water</span>
              </button>
              <button
                onClick={() => setSelectedTool('harvest')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  selectedTool === 'harvest'
                    ? 'bg-amber-500 text-white shadow-xs scale-102'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
                title="Harvest mature blooms for coins & XP"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Harvest</span>
              </button>
              <button
                onClick={() => setSelectedTool('remove')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  selectedTool === 'remove'
                    ? 'bg-rose-600 text-white shadow-xs scale-102'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
                title="Store placed items back in bag"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Store</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 border-l border-stone-200 dark:border-stone-700 pl-2 shrink-0">
              {[
                { id: 'all', label: 'All' },
                { id: 'seeds', label: '🌱 Seeds' },
                { id: 'plant', label: '🌸 Flowers' },
                { id: 'path', label: '🧱 Paths' },
                { id: 'decoration', label: '🏡 Decor' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setDockCategory(cat.id as DockCategory)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-extrabold whitespace-nowrap transition-all ${
                    dockCategory === cat.id
                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 font-black'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}

              <button
                onClick={onOpenShop}
                className="text-xs font-extrabold text-forest-700 dark:text-emerald-300 hover:underline flex items-center gap-1 shrink-0 whitespace-nowrap px-2 py-1 rounded-lg bg-forest-50 dark:bg-emerald-950/40 ml-1"
                title="Open Botanical Nursery Shop"
              >
                <ShoppingBag className="w-3 h-3 text-amber-500" />
                <span>Shop</span>
              </button>
            </div>
          </div>

          {/* Visual Inventory Dock Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {filteredOwnedItems.map(item => {
              const isChosen = selectedInventoryItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedInventoryItem(item);
                    setSelectedTool('select');
                    cozyAudio.playPlacementSound();
                  }}
                  className={`flex-shrink-0 flex items-center gap-1.5 p-1 px-2.5 rounded-2xl border transition-all active:scale-95 cursor-pointer ${
                    isChosen
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-400 scale-102 shadow-sm'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white dark:bg-stone-900 p-1 flex items-center justify-center shrink-0 border border-stone-100 dark:border-stone-800 shadow-2xs">
                    <GardenItemIllustration itemId={item.id} />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-[11px] font-extrabold text-forest-950 dark:text-emerald-100 truncate block max-w-[85px] sm:max-w-[105px]">
                      {item.name}
                    </span>
                    <span className="text-[9px] text-stone-400 capitalize block -mt-0.5">
                      {item.category}
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredOwnedItems.length === 0 && (
              <div className="py-2 px-4 text-xs text-stone-400 flex items-center gap-2">
                <span>No items in this category.</span>
                <button onClick={onOpenShop} className="text-emerald-600 font-bold underline">
                  Acquire in Shop
                </button>
              </div>
            )}
          </div>

        </div>
      </footer>

      {/* PLOT EXPANSION MODAL */}
      <AnimatePresence>
        {showExpansionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-3xl max-w-sm w-full p-4 sm:p-5 shadow-2xl border border-stone-200 dark:border-stone-700 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-forest-950 dark:text-emerald-100 font-extrabold text-sm">
                  <Maximize2 className="w-4 h-4 text-emerald-600" />
                  <span>Expand Garden Plot</span>
                </div>
                <button onClick={() => setShowExpansionModal(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {GARDEN_EXPANSION_TIERS.map(tier => {
                  const isCurrent = gridDimension === tier.size;
                  const canUnlock = (profile?.level ?? 1) >= tier.requiredLevel && (profile?.floraCoins ?? 0) >= tier.coinCost;

                  return (
                    <div
                      key={tier.size}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        isCurrent
                          ? 'bg-forest-50 dark:bg-emerald-950/40 border-forest-500'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-extrabold text-forest-950 dark:text-emerald-100">{tier.label}</div>
                        <div className="text-[10px] text-stone-500">
                          Level {tier.requiredLevel} • {tier.coinCost} Coins
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded-lg bg-forest-600 text-white text-[10px] font-bold">Active</span>
                      ) : (
                        <button
                          disabled={!canUnlock}
                          onClick={() => {
                            setGridDimension(tier.size);
                            cozyAudio.playFanfare();
                            setShowExpansionModal(false);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            canUnlock
                              ? 'bg-forest-800 hover:bg-forest-900 text-white cursor-pointer'
                              : 'bg-stone-200 dark:bg-stone-700 text-stone-400 cursor-not-allowed'
                          }`}
                        >
                          Unlock
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Flower Selection & Sowing Modal */}
      <FlowerSelectionModal
        isOpen={showFlowerModal}
        onClose={() => {
          setShowFlowerModal(false);
          setTargetPlantTile(null);
        }}
        onSelectFlower={handleSowFlower}
        selectedTileCoords={targetPlantTile}
      />

      {/* Garden Spirit Companion */}
      <GardenSpiritCompanion
        onOpenTask={onOpenExercise || onOpenQuests}
        onOpenScanner={onOpenScanner}
        onApplyMiracleWater={handleApplyMiracleWater}
        thirstyCount={Object.values(plantStates).filter(p => p.moisture === 'dry').length}
        bloomReadyCount={Object.values(plantStates).filter(p => p.stage === 'bloom' || p.isHarvestable).length}
      />

    </div>
  );
};

