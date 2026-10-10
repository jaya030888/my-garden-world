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
  Leaf
} from 'lucide-react';
import { useGarden } from '../../context/GardenContext';
import { GardenShopItem, PlacedGardenItem } from '../../types';
import { GardenItemIllustration } from './GardenItemIllustrations';
import { cozyAudio } from '../../services/audioService';
import {
  SimulatedPlantState,
  SPECIES_GROWTH_RULES,
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
    rotateGardenItem,
    removeGardenItem,
    logPlantCare
  } = useGarden();

  const [plantStates, setPlantStates] = useState<Record<string, SimulatedPlantState>>({});
  const [gridDimension, setGridDimension] = useState<number>(8);
  const [currentWeather, setCurrentWeather] = useState<WeatherAtmosphere>('sunny');
  const [selectedTool, setSelectedTool] = useState<ToolMode>('select');
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<GardenShopItem | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(cozyAudio.getIsMuted());
  const [showExpansionModal, setShowExpansionModal] = useState<boolean>(false);
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
        await rotateGardenItem(existing.instanceId);
      }
      return;
    }

    if (selectedTool === 'remove') {
      if (existing) {
        cozyAudio.playPlacementSound();
        await removeGardenItem(existing.instanceId);
        setSelectedCell(null);
      }
      return;
    }

    // Default select / place mode
    if (existing) {
      setSelectedCell({ x, y });
    } else {
      if (selectedInventoryItem) {
        cozyAudio.playPlacementSound();
        await placeGardenItem(selectedInventoryItem.id, x, y);
      }
      setSelectedCell(null);
    }
  };

  const selectedPlaced = selectedCell ? getPlacedItemAt(selectedCell.x, selectedCell.y) : null;
  const selectedPlantState = selectedPlaced ? plantStates[selectedPlaced.instanceId] : null;
  const selectedShopItem = selectedPlaced ? getShopItemById(selectedPlaced.itemId) : null;

  const weatherClass = {
    sunny: 'bg-gradient-to-b from-emerald-100/60 via-amber-50/40 to-emerald-50/80',
    golden_hour: 'bg-gradient-to-b from-amber-100/80 via-orange-100/60 to-rose-100/40',
    twilight: 'bg-gradient-to-b from-indigo-950 via-slate-900 to-emerald-950 text-emerald-100',
    rain: 'bg-gradient-to-b from-slate-200 via-sky-100 to-teal-100/80'
  }[currentWeather];

  return (
    <div className={`relative min-h-[calc(100dvh-3.5rem)] flex flex-col justify-between overflow-hidden transition-colors duration-700 select-none touch-pan-garden ${weatherClass}`}>
      
      {/* Ambient Weather Overlays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {currentWeather === 'twilight' && (
          <>
            <div className="absolute w-2 h-2 rounded-full bg-amber-300 blur-[1px] animate-pulse top-1/4 left-1/5 shadow-[0_0_12px_#fde047]" />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-300 blur-[1px] animate-pulse top-1/2 left-3/4 shadow-[0_0_15px_#86efac]" />
          </>
        )}
        {currentWeather === 'rain' && (
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-25 animate-pulse" />
        )}
      </div>

      {/* TOP COMPACT HUD */}
      <header className="relative z-10 p-2 sm:p-4 flex items-center justify-between gap-2 max-w-6xl mx-auto w-full">
        
        {/* Left: Weather & Audio Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1 p-1 rounded-2xl bg-white/85 dark:bg-stone-900/85 backdrop-blur-md border border-stone-200/80 dark:border-stone-700 shadow-xs shrink-0">
          <button
            onClick={() => setCurrentWeather('sunny')}
            title="Radiant Daylight"
            className={`p-1.5 rounded-xl text-xs transition-all ${currentWeather === 'sunny' ? 'bg-amber-400 text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentWeather('golden_hour')}
            title="Golden Hour"
            className={`p-1.5 rounded-xl text-xs transition-all ${currentWeather === 'golden_hour' ? 'bg-orange-400 text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <Sunset className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentWeather('twilight')}
            title="Twilight Fireflies"
            className={`p-1.5 rounded-xl text-xs transition-all ${currentWeather === 'twilight' ? 'bg-indigo-600 text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentWeather('rain')}
            title="Gentle Spring Rain"
            className={`p-1.5 rounded-xl text-xs transition-all ${currentWeather === 'rain' ? 'bg-sky-500 text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
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
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Plant Scanner"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-200" />
            <span className="hidden xs:inline sm:inline">Scan</span>
          </button>

          <button
            onClick={onOpenShop}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-extrabold shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Botanical Nursery Shop"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden xs:inline sm:inline">Shop</span>
          </button>

          <button
            onClick={onOpenQuests}
            className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-white/85 dark:bg-stone-900/85 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-white shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Quests & Goals"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
          </button>

          <button
            onClick={onOpenJournal}
            className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-white/85 dark:bg-stone-900/85 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-white shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Botanical Journal"
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
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-3.5 py-2 rounded-2xl bg-forest-900/95 text-white shadow-xl border border-emerald-500/40 backdrop-blur-md flex items-center gap-2 text-xs font-extrabold"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>{harvestNotification.text}</span>
            <span className="text-amber-400">+{harvestNotification.coins} Coins</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CENTER GARDEN CANVAS */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-1 sm:p-3 w-full min-h-0">
        <div className="relative p-2 sm:p-4 rounded-3xl bg-emerald-800/20 dark:bg-emerald-950/40 backdrop-blur-md border border-emerald-600/30 shadow-2xl w-full max-w-[min(100%,560px,calc(100dvh-17rem))] flex flex-col items-center">
          
          {/* Plot Info / Expansion */}
          <div className="w-full flex items-center justify-between mb-1 sm:mb-2 px-1">
            <span className="text-[11px] font-extrabold text-forest-950 dark:text-emerald-200">
              Virtual Sanctuary
            </span>
            <button
              onClick={() => setShowExpansionModal(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-forest-700/20 hover:bg-forest-700/30 text-forest-900 dark:text-emerald-200 text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Maximize2 className="w-2.5 h-2.5" />
              <span>{gridDimension}x{gridDimension} Plot</span>
            </button>
          </div>

          {/* Responsive Garden Canvas Grid */}
          <div
            className="grid gap-0.5 sm:gap-1.5 p-1 sm:p-2.5 rounded-2xl bg-forest-950/40 border border-forest-800/40 shadow-inner w-full aspect-square"
            style={{
              gridTemplateColumns: `repeat(${gridDimension}, minmax(0, 1fr))`
            }}
          >
            {Array.from({ length: gridDimension * gridDimension }).map((_, index) => {
              const x = index % gridDimension;
              const y = Math.floor(index / gridDimension);
              const placed = getPlacedItemAt(x, y);
              const plantState = placed ? plantStates[placed.instanceId] : null;
              const isSelected = selectedCell?.x === x && selectedCell?.y === y;

              return (
                <div
                  key={`${x}-${y}`}
                  onClick={() => handleCellClick(x, y)}
                  className={`relative aspect-square rounded-md sm:rounded-xl cursor-pointer transition-all duration-150 flex items-center justify-center group select-none touch-manipulation ${
                    placed
                      ? 'bg-emerald-700/40 hover:bg-emerald-600/50 shadow-xs active:scale-95'
                      : 'bg-emerald-900/30 hover:bg-emerald-800/50 border border-emerald-700/20 active:scale-95'
                  } ${isSelected ? 'ring-2 sm:ring-3 ring-amber-400 scale-105 z-20' : ''}`}
                >
                  {!placed && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40">
                      <Plus className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-emerald-300" />
                    </div>
                  )}

                  {placed && (
                    <div className="relative w-full h-full p-0.5">
                      <GardenItemIllustration
                        itemId={placed.itemId}
                        rotation={placed.rotation}
                        stage={plantState?.stage || 'bloom'}
                        isWatered={plantState?.moisture === 'moist'}
                      />

                      {/* Growth Progress Badge */}
                      {plantState && plantState.stage !== 'bloom' && (
                        <div className="absolute bottom-0 right-0 px-0.5 py-0.1 rounded bg-stone-950/80 text-amber-300 font-extrabold text-[6px] sm:text-[8px] backdrop-blur-xs">
                          {plantState.growthProgress}%
                        </div>
                      )}

                      {/* Water Droplet */}
                      {plantState && plantState.moisture === 'dry' && (
                        <div className="absolute top-0 right-0 p-0.5 rounded-full bg-amber-500 text-white animate-bounce">
                          <Droplets className="w-2 h-2 fill-white" />
                        </div>
                      )}

                      {/* Harvest Sparkle */}
                      {plantState && (plantState.stage === 'bloom' || plantState.isHarvestable) && (
                        <div className="absolute top-0 left-0 p-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
                          <Sparkles className="w-2 h-2 fill-amber-300 text-amber-300" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Plant Inspector Popup */}
          <AnimatePresence>
            {selectedPlaced && selectedPlantState && selectedShopItem && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-2 w-full p-2 sm:p-3 rounded-2xl bg-white/95 dark:bg-stone-900/95 border border-emerald-500/40 shadow-lg backdrop-blur-md flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 z-30"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-forest-100 p-0.5 sm:p-1 flex items-center justify-center shrink-0">
                    <GardenItemIllustration
                      itemId={selectedPlaced.itemId}
                      rotation={selectedPlaced.rotation}
                      stage={selectedPlantState.stage}
                    />
                  </div>
                  <div className="min-w-0 truncate">
                    <div className="text-xs font-extrabold text-forest-950 dark:text-emerald-100 truncate">
                      {selectedShopItem.name}
                    </div>
                    <div className="text-[10px] text-stone-500">
                      <span className="capitalize">{selectedPlantState.stage}</span> • Soil: {selectedPlantState.moisture}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-auto">
                  <button
                    onClick={() => handleCellClick(selectedCell!.x, selectedCell!.y)}
                    className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-[11px] sm:text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                  >
                    <Droplets className="w-3 h-3 fill-white" />
                    <span>Water</span>
                  </button>
                  <button
                    onClick={() => rotateGardenItem(selectedPlaced.instanceId)}
                    className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 text-xs font-bold active:scale-95 cursor-pointer"
                    title="Rotate"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeGardenItem(selectedPlaced.instanceId)}
                    className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 text-xs font-bold active:scale-95 cursor-pointer"
                    title="Store"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setSelectedCell(null)}
                    className="p-1 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* BOTTOM RESPONSIVE TOOLBAR */}
      <footer className="relative z-10 p-2 sm:p-4 max-w-3xl mx-auto w-full pb-safe">
        <div className="p-2 sm:p-2.5 rounded-2xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/80 dark:border-stone-700 shadow-xl space-y-1.5">
          
          {/* Tool Modes */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar pb-0.5">
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setSelectedTool('select'); setSelectedInventoryItem(null); }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  selectedTool === 'select' && !selectedInventoryItem
                    ? 'bg-forest-800 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <span>✋ Move</span>
              </button>
              <button
                onClick={() => setSelectedTool('water')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  selectedTool === 'water'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <Droplets className="w-3 h-3" />
                <span>Water</span>
              </button>
              <button
                onClick={() => setSelectedTool('harvest')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  selectedTool === 'harvest'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Harvest</span>
              </button>
              <button
                onClick={() => setSelectedTool('remove')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  selectedTool === 'remove'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <Trash2 className="w-3 h-3" />
                <span>Store</span>
              </button>
            </div>

            <button
              onClick={onOpenShop}
              className="text-xs font-extrabold text-forest-700 dark:text-emerald-300 hover:underline flex items-center gap-1 shrink-0 whitespace-nowrap px-1.5 py-1 rounded-lg bg-forest-50 dark:bg-emerald-950/40"
            >
              <Plus className="w-3 h-3" />
              <span>Seeds</span>
            </button>
          </div>

          {/* Clean Inventory Belt */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {ownedItems.map(item => {
              const isChosen = selectedInventoryItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedInventoryItem(item);
                    setSelectedTool('select');
                    cozyAudio.playPlacementSound();
                  }}
                  className={`flex-shrink-0 flex items-center gap-1.5 p-1 px-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                    isChosen
                      ? 'bg-forest-100 border-forest-600 ring-2 ring-forest-500/50 scale-102'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white dark:bg-stone-900 p-0.5 flex items-center justify-center shrink-0">
                    <GardenItemIllustration itemId={item.id} />
                  </div>
                  <span className="text-[10px] font-extrabold text-forest-950 dark:text-emerald-100 truncate max-w-[70px] sm:max-w-[80px]">
                    {item.name}
                  </span>
                </button>
              );
            })}
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
                      className={`p-2 rounded-xl border flex items-center justify-between ${
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

    </div>
  );
};
