import React, { useState, useEffect, useRef } from 'react';
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
  Award,
  Volume2,
  VolumeX,
  Sun,
  Sunset,
  Moon,
  CloudRain,
  Maximize2,
  Check,
  X,
  Layers,
  Coins,
  Compass,
  ArrowRight,
  Info
} from 'lucide-react';
import { useGarden } from '../../context/GardenContext';
import { useAuth } from '../../context/AuthContext';
import { GardenShopItem, PlacedGardenItem } from '../../types';
import { GardenItemIllustration } from './GardenItemIllustrations';
import { cozyAudio } from '../../services/audioService';
import {
  SimulatedPlantState,
  SPECIES_GROWTH_RULES,
  GARDEN_EXPANSION_TIERS,
  advancePlantGrowth,
  calculateSoilMoisture,
  WeatherAtmosphere
} from '../../services/gardenSimulation';
import { fireConfetti } from '../../services/economyService';

interface CozyGardenWorldProps {
  onOpenShop: () => void;
  onOpenScanner: () => void;
  onOpenJournal: () => void;
  onOpenQuests: () => void;
}

type ToolMode = 'select' | 'water' | 'harvest' | 'place' | 'rotate' | 'remove';

export const CozyGardenWorld: React.FC<CozyGardenWorldProps> = ({
  onOpenShop,
  onOpenScanner,
  onOpenJournal,
  onOpenQuests
}) => {
  const {
    profile,
    gardenItems,
    shopCatalog,
    placeGardenItem,
    rotateGardenItem,
    removeGardenItem,
    logPlantCare,
    buyItem
  } = useGarden();

  const { isAuthenticated, user } = useAuth();

  // Local simulated plant growth cache (synced with gardenItems)
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

  // Periodic real-time growth updater tick
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
        // Log care
        try {
          await logPlantCare(existing.instanceId, 'water');
        } catch {
          // offline fallback
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
            text: `Harvested flourishing ${rule.commonName}!`,
            coins: rule.coinHarvestYield
          });
          setTimeout(() => setHarvestNotification(null), 3500);

          // Reset seed stage for perpetual cozy garden loops
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

    // Place tool or Default inspect mode
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

  // Weather background gradient classes
  const weatherClass = {
    sunny: 'bg-gradient-to-b from-emerald-100/60 via-amber-50/40 to-emerald-50/80',
    golden_hour: 'bg-gradient-to-b from-amber-100/80 via-orange-100/60 to-rose-100/40',
    twilight: 'bg-gradient-to-b from-indigo-950 via-slate-900 to-emerald-950 text-emerald-100',
    rain: 'bg-gradient-to-b from-slate-200 via-sky-100 to-teal-100/80'
  }[currentWeather];

  return (
    <div className={`relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden transition-colors duration-700 ${weatherClass}`}>
      
      {/* Dynamic Ambient Particles / Weather Overlays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {currentWeather === 'twilight' && (
          <>
            <div className="absolute w-2 h-2 rounded-full bg-amber-300 blur-[1px] animate-pulse top-1/4 left-1/5 shadow-[0_0_12px_#fde047]" />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-300 blur-[1px] animate-pulse top-1/2 left-3/4 shadow-[0_0_15px_#86efac]" />
            <div className="absolute w-2 h-2 rounded-full bg-amber-400 blur-[1px] animate-ping top-2/3 left-1/3" />
          </>
        )}
        {currentWeather === 'rain' && (
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-25 animate-pulse" />
        )}
      </div>

      {/* TOP FLOATING HUD */}
      <header className="relative z-10 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto w-full">
        {/* Left: Sanctuary Brand & Level Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/80 dark:border-stone-700 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-forest-600 flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
              {profile?.level ?? 1}
            </div>
            <div>
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Sanctuary Keeper</div>
              <div className="text-xs font-extrabold text-forest-950 dark:text-emerald-100">
                {profile?.username || 'Botanist'}
              </div>
            </div>
          </div>

          {/* Flora Coins Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-400/30 backdrop-blur-md">
            <Coins className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="text-xs sm:text-sm font-extrabold text-amber-950 dark:text-amber-300">
              {profile?.floraCoins ?? 0}
            </span>
          </div>
        </div>

        {/* Center: Atmospheric Weather & Audio Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/70 dark:bg-stone-900/70 backdrop-blur-md border border-stone-200/60 dark:border-stone-700 shadow-xs">
          <button
            onClick={() => setCurrentWeather('sunny')}
            title="Radiant Daylight"
            className={`p-2 rounded-xl text-xs transition-all ${currentWeather === 'sunny' ? 'bg-amber-400 text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentWeather('golden_hour')}
            title="Golden Hour"
            className={`p-2 rounded-xl text-xs transition-all ${currentWeather === 'golden_hour' ? 'bg-orange-400 text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <Sunset className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentWeather('twilight')}
            title="Twilight Fireflies"
            className={`p-2 rounded-xl text-xs transition-all ${currentWeather === 'twilight' ? 'bg-indigo-600 text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentWeather('rain')}
            title="Gentle Spring Rain"
            className={`p-2 rounded-xl text-xs transition-all ${currentWeather === 'rain' ? 'bg-sky-500 text-white shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
          >
            <CloudRain className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5" />
          <button
            onClick={() => {
              const muted = cozyAudio.toggleMute();
              setIsAudioMuted(muted);
            }}
            title={isAudioMuted ? 'Unmute cozy audio' : 'Mute audio'}
            className="p-2 rounded-xl text-xs text-stone-500 hover:text-stone-800 transition-all"
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
          </button>
        </div>

        {/* Right: Quick Action Modals Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-102"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Scanner</span>
          </button>
          <button
            onClick={onOpenShop}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold shadow-xs transition-all hover:scale-102"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Nursery Shop</span>
          </button>
          <button
            onClick={onOpenQuests}
            className="p-2.5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-white shadow-xs transition-all"
            title="Quests & Goals"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
          </button>
          <button
            onClick={onOpenJournal}
            className="p-2.5 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-white shadow-xs transition-all"
            title="Botanical Field Journal"
          >
            <BookOpen className="w-4 h-4 text-forest-700" />
          </button>
        </div>
      </header>

      {/* HARVEST REWARD POPUP NOTIFICATION */}
      <AnimatePresence>
        {harvestNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-forest-900/95 text-white shadow-xl border border-emerald-500/40 backdrop-blur-md flex items-center gap-3"
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            <div>
              <div className="text-xs font-bold text-emerald-200">{harvestNotification.text}</div>
              <div className="text-xs text-stone-300 flex items-center gap-1">
                <span>Awarded</span>
                <span className="text-amber-400 font-extrabold">+{harvestNotification.coins} Flora Coins</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CENTER INTERACTIVE GARDEN SANCTUARY GRID */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-2 sm:p-6">
        <div className="relative p-4 sm:p-8 rounded-[2.5rem] bg-emerald-800/20 dark:bg-emerald-950/40 backdrop-blur-md border border-emerald-600/30 shadow-2xl max-w-4xl w-full flex flex-col items-center">
          
          {/* Garden Terrain Header Bar */}
          <div className="w-full flex items-center justify-between mb-4 px-2 text-xs font-bold text-forest-900 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Sanctuary Realm: {gridDimension}x{gridDimension} Grid</span>
            </div>
            <button
              onClick={() => setShowExpansionModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-forest-700/20 hover:bg-forest-700/30 text-forest-800 dark:text-emerald-300 text-xs transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Expand Plot</span>
            </button>
          </div>

          {/* Isometric Garden Canvas Grid */}
          <div
            className="grid gap-2 sm:gap-2.5 p-3 sm:p-4 rounded-3xl bg-forest-950/40 border border-forest-800/40 shadow-inner"
            style={{
              gridTemplateColumns: `repeat(${gridDimension}, minmax(0, 1fr))`,
              width: '100%',
              maxWidth: gridDimension <= 8 ? '540px' : '680px'
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
                  className={`relative aspect-square rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-center group select-none ${
                    placed
                      ? 'bg-emerald-700/40 hover:bg-emerald-600/50 shadow-xs'
                      : 'bg-emerald-900/30 hover:bg-emerald-800/50 border border-emerald-700/20 hover:border-emerald-500/50'
                  } ${isSelected ? 'ring-3 ring-amber-400 scale-105 z-20' : ''}`}
                >
                  {/* Subtle Grass Texture Backdrop */}
                  {!placed && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40">
                      <Plus className="w-3 h-3 text-emerald-300" />
                    </div>
                  )}

                  {/* Render Placed Garden Element */}
                  {placed && (
                    <div className="relative w-full h-full p-1.5 sm:p-2">
                      <GardenItemIllustration
                        itemId={placed.itemId}
                        rotation={placed.rotation}
                        stage={plantState?.stage || 'bloom'}
                        isWatered={plantState?.moisture === 'moist'}
                      />

                      {/* Plant Growth Progress Badge */}
                      {plantState && plantState.stage !== 'bloom' && (
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-stone-950/80 text-amber-300 font-extrabold text-[9px] backdrop-blur-xs">
                          {plantState.growthProgress}%
                        </div>
                      )}

                      {/* Thirsty Water Droplet Indicator */}
                      {plantState && plantState.moisture === 'dry' && (
                        <div className="absolute top-1 right-1 p-1 rounded-full bg-amber-500 text-white shadow-xs animate-bounce">
                          <Droplets className="w-2.5 h-2.5 fill-white" />
                        </div>
                      )}

                      {/* Harvest Ready Sparkle Indicator */}
                      {plantState && (plant.stage === 'bloom' || plantState.isHarvestable) && (
                        <div className="absolute top-1 left-1 p-1 rounded-full bg-emerald-500 text-white shadow-xs animate-pulse">
                          <Sparkles className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Cell Inspector Bar when a Tile is Clicked */}
          <AnimatePresence>
            {selectedPlaced && selectedPlantState && selectedShopItem && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 w-full p-4 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-emerald-500/40 shadow-lg backdrop-blur-md flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-forest-100 p-2">
                    <GardenItemIllustration
                      itemId={selectedPlaced.itemId}
                      rotation={selectedPlaced.rotation}
                      stage={selectedPlantState.stage}
                    />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-forest-950 dark:text-emerald-100">
                      {selectedShopItem.name}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      Stage: <span className="font-bold text-forest-700 dark:text-emerald-300 uppercase">{selectedPlantState.stage}</span> | Soil: <span className="font-bold">{selectedPlantState.moisture}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCellClick(selectedCell!.x, selectedCell!.y)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <Droplets className="w-3.5 h-3.5 fill-white" />
                    <span>Water</span>
                  </button>
                  <button
                    onClick={() => rotateGardenItem(selectedPlaced.instanceId)}
                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 text-xs font-bold"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeGardenItem(selectedPlaced.instanceId)}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 text-xs font-bold"
                    title="Remove to Inventory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedCell(null)}
                    className="p-2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* BOTTOM COZY TOOLBAR & INVENTORY TRAY */}
      <footer className="relative z-10 p-4 sm:p-6 max-w-5xl mx-auto w-full">
        <div className="p-3 sm:p-4 rounded-3xl bg-white/85 dark:bg-stone-900/85 backdrop-blur-md border border-stone-200/80 dark:border-stone-700 shadow-xl space-y-3">
          
          {/* Action Modes Selector */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { setSelectedTool('select'); setSelectedInventoryItem(null); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  selectedTool === 'select' && !selectedInventoryItem
                    ? 'bg-forest-800 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <span>✋ Inspect</span>
              </button>
              <button
                onClick={() => setSelectedTool('water')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  selectedTool === 'water'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Watering Can</span>
              </button>
              <button
                onClick={() => setSelectedTool('harvest')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  selectedTool === 'harvest'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Harvest Tool</span>
              </button>
              <button
                onClick={() => setSelectedTool('rotate')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  selectedTool === 'rotate'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate</span>
              </button>
              <button
                onClick={() => setSelectedTool('remove')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all ${
                  selectedTool === 'remove'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>

            <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 hidden sm:block">
              Inventory ({ownedItems.length} items)
            </div>
          </div>

          {/* Quick Inventory Item Belt */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            {ownedItems.map(item => {
              const isChosen = selectedInventoryItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedInventoryItem(item);
                    setSelectedTool('place');
                    cozyAudio.playPlacementSound();
                  }}
                  className={`flex-shrink-0 flex items-center gap-2 p-2 rounded-2xl border transition-all ${
                    isChosen
                      ? 'bg-forest-100/90 border-forest-600 ring-2 ring-forest-500/50 scale-105'
                      : 'bg-stone-50 dark:bg-stone-800/80 border-stone-200/80 dark:border-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-stone-900 p-1 flex items-center justify-center">
                    <GardenItemIllustration itemId={item.id} />
                  </div>
                  <div className="text-left pr-1">
                    <div className="text-[11px] font-extrabold text-forest-950 dark:text-emerald-100 truncate max-w-[100px]">
                      {item.name}
                    </div>
                    <div className="text-[9px] text-stone-400 uppercase tracking-wider">{item.category}</div>
                  </div>
                </button>
              );
            })}

            <button
              onClick={onOpenShop}
              className="flex-shrink-0 flex items-center gap-2 p-2 px-3.5 rounded-2xl border border-dashed border-forest-300 hover:border-forest-500 text-forest-700 dark:text-emerald-300 text-xs font-bold hover:bg-forest-50/50 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Get More</span>
            </button>
          </div>
        </div>
      </footer>

      {/* PLOT EXPANSION MODAL */}
      <AnimatePresence>
        {showExpansionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-700 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-forest-900 dark:text-emerald-100 font-extrabold text-base">
                  <Maximize2 className="w-5 h-5 text-emerald-600" />
                  <span>Expand Garden Sanctuary</span>
                </div>
                <button onClick={() => setShowExpansionModal(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-400">
                Unlock larger garden territory plots as you gain experience and Flora Coins.
              </p>

              <div className="space-y-2.5">
                {GARDEN_EXPANSION_TIERS.map(tier => {
                  const isCurrent = gridDimension === tier.size;
                  const canUnlock = (profile?.level ?? 1) >= tier.requiredLevel && (profile?.floraCoins ?? 0) >= tier.coinCost;

                  return (
                    <div
                      key={tier.size}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                        isCurrent
                          ? 'bg-forest-50 dark:bg-emerald-950/40 border-forest-500 ring-1 ring-forest-500'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-extrabold text-forest-950 dark:text-emerald-100">{tier.label}</div>
                        <div className="text-[10px] text-stone-500">
                          Requires Level {tier.requiredLevel} • Cost: {tier.coinCost} Coins
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="px-3 py-1 rounded-xl bg-forest-600 text-white text-[11px] font-bold">Active</span>
                      ) : (
                        <button
                          disabled={!canUnlock}
                          onClick={() => {
                            setGridDimension(tier.size);
                            cozyAudio.playFanfare();
                            setShowExpansionModal(false);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            canUnlock
                              ? 'bg-forest-800 hover:bg-forest-900 text-white shadow-xs'
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
