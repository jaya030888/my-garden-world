import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Droplets,
  Calendar,
  X,
  Check,
  Coins,
  Award,
  Zap,
  Info,
  ChevronRight
} from 'lucide-react';
import { SPECIES_GROWTH_RULES, SpeciesGrowthRule } from '../../services/gardenSimulation';
import { useGarden } from '../../context/GardenContext';
import { cozyAudio } from '../../services/audioService';
import { fireConfetti } from '../../services/economyService';

interface FlowerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFlower: (species: SpeciesGrowthRule) => void;
  selectedTileCoords?: { x: number; y: number } | null;
}

export const FlowerSelectionModal: React.FC<FlowerSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectFlower,
  selectedTileCoords
}) => {
  const { profile } = useGarden();
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('marigold');
  const [activeFilter, setActiveFilter] = useState<'all' | 'common' | 'rare' | 'legendary'>('all');

  if (!isOpen) return null;

  const speciesList = Object.values(SPECIES_GROWTH_RULES);
  const selectedSpecies = SPECIES_GROWTH_RULES[selectedSpeciesId] || speciesList[0];

  const filteredSpecies = speciesList.filter(s => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'common') return s.rarity === 'common' || s.rarity === 'uncommon';
    if (activeFilter === 'rare') return s.rarity === 'rare';
    if (activeFilter === 'legendary') return s.rarity === 'legendary' || s.rarity === 'mythic';
    return true;
  });

  const getRarityBadge = (rarity: SpeciesGrowthRule['rarity']) => {
    switch (rarity) {
      case 'mythic':
        return 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]';
      case 'legendary':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]';
      case 'rare':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'uncommon':
        return 'bg-emerald-600 text-white';
      default:
        return 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300';
    }
  };

  const handlePlantNow = () => {
    cozyAudio.playPlacementSound();
    fireConfetti();
    onSelectFlower(selectedSpecies);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full max-h-[92dvh] overflow-hidden shadow-2xl border-2 border-emerald-500/40 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/80 via-forest-900/90 to-emerald-950/80 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-emerald-50">
                Choose Botanical Flower to Sow
              </h2>
              <p className="text-[11px] text-emerald-200/80">
                {selectedTileCoords
                  ? `Sowing at Meadow Tile (${selectedTileCoords.x}, ${selectedTileCoords.y}) • Complete Daily Care to Bloom!`
                  : 'Select a botanical variety to cultivate in your sanctuary'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-2 px-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Varieties' },
            { id: 'common', label: '🌸 Meadow Classics' },
            { id: 'rare', label: '💎 Rare Spires' },
            { id: 'legendary', label: '👑 Mythic Exotics' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-forest-800 text-white shadow-xs scale-102'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Flower Species Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filteredSpecies.map(sp => {
              const isSelected = selectedSpeciesId === sp.speciesId;
              return (
                <button
                  key={sp.speciesId}
                  onClick={() => {
                    setSelectedSpeciesId(sp.speciesId);
                    cozyAudio.playPlacementSound();
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-400 shadow-md scale-102'
                      : 'bg-white dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: sp.color }}
                    />
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${getRarityBadge(sp.rarity)}`}>
                      {sp.rarity}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-black text-forest-950 dark:text-emerald-100 leading-tight">
                      {sp.commonName}
                    </div>
                    <div className="text-[10px] text-stone-400 italic truncate mt-0.5">
                      {sp.scientificName}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between text-[10px]">
                    <span className="text-stone-500 font-bold flex items-center gap-0.5">
                      <Calendar className="w-3 h-3 text-emerald-500" /> {sp.bloomDaysRequired}d Care
                    </span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                      <Coins className="w-3 h-3 text-amber-500 fill-amber-400" /> +{sp.coinHarvestYield}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Flower Detailed Preview Card */}
          {selectedSpecies && (
            <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-900/15 via-amber-500/10 to-emerald-900/20 border-2 border-emerald-500/40 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-md shrink-0 border-2 border-white"
                    style={{ backgroundColor: selectedSpecies.color }}
                  >
                    🌸
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-forest-950 dark:text-emerald-50">
                        {selectedSpecies.commonName}
                      </h3>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${getRarityBadge(selectedSpecies.rarity)}`}>
                        {selectedSpecies.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 italic mt-0.5">
                      {selectedSpecies.scientificName}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center justify-end gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>+{selectedSpecies.coinHarvestYield} Harvest Coins</span>
                  </div>
                  <div className="text-[10px] text-stone-400 font-bold">
                    +{selectedSpecies.xpHarvestYield} Botanical XP
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-white/70 dark:bg-stone-900/70 p-2.5 rounded-2xl border border-stone-200/60 dark:border-stone-800">
                {selectedSpecies.description}
              </p>

              {/* Daily Care & Bloom Rules Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/60 dark:border-stone-800">
                  <span className="text-[9px] text-stone-400 uppercase font-black block">Growth Cycle</span>
                  <span className="font-extrabold text-forest-900 dark:text-emerald-300 mt-0.5 block">
                    {selectedSpecies.bloomDaysRequired} Daily Steps
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/60 dark:border-stone-800">
                  <span className="text-[9px] text-stone-400 uppercase font-black block">Water Boost</span>
                  <span className="font-extrabold text-sky-600 dark:text-sky-400 mt-0.5 block">
                    +{selectedSpecies.waterGrowthBoostPercent}% / Water
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/60 dark:border-stone-800">
                  <span className="text-[9px] text-stone-400 uppercase font-black block">Daily Nature Bonus</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-300 mt-0.5 block">
                    ✨ Miracle Bloom
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Button */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 flex items-center justify-between gap-3">
          <div className="text-xs text-stone-500">
            <span>Sow seed into fertile soil and nurture daily with water to bloom!</span>
          </div>

          <button
            onClick={handlePlantNow}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all transform active:scale-95 cursor-pointer shrink-0"
          >
            <span>Sow {selectedSpecies.commonName}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
