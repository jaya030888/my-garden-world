import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Droplets,
  Leaf,
  Coins,
  Camera,
  Heart,
  ChevronRight,
  X,
  Zap
} from 'lucide-react';
import { useGarden } from '../../context/GardenContext';
import { cozyAudio } from '../../services/audioService';
import { fireConfetti } from '../../services/economyService';

interface GardenSpiritCompanionProps {
  onOpenTask: () => void;
  onOpenScanner: () => void;
  onApplyMiracleWater: () => void;
  thirstyCount: number;
  bloomReadyCount: number;
}

export const GardenSpiritCompanion: React.FC<GardenSpiritCompanionProps> = ({
  onOpenTask,
  onOpenScanner,
  onApplyMiracleWater,
  thirstyCount,
  bloomReadyCount
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useGarden();

  const handleMiracleBoost = () => {
    cozyAudio.playFanfare();
    fireConfetti();
    onApplyMiracleWater();
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end">
      {/* Speech Bubble Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            className="mb-2 w-72 sm:w-80 p-4 rounded-3xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border-2 border-emerald-400/50 shadow-2xl space-y-3 text-xs"
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧚‍♀️</span>
                <div>
                  <span className="font-black text-forest-950 dark:text-emerald-100 block">Flora the Spirit</span>
                  <span className="text-[10px] text-stone-400">Garden Guardian & Botanist</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Daily Garden Status */}
            <div className="space-y-1.5 text-stone-600 dark:text-stone-300">
              {bloomReadyCount > 0 ? (
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-900 dark:text-amber-200 flex items-center gap-2 font-black">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>{bloomReadyCount} flower{bloomReadyCount > 1 ? 's are' : ' is'} in full bloom! Harvest now for coins!</span>
                </div>
              ) : thirstyCount > 0 ? (
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300 text-sky-900 dark:text-sky-200 flex items-center gap-2 font-bold">
                  <Droplets className="w-4 h-4 text-sky-500 fill-sky-500 animate-bounce" />
                  <span>{thirstyCount} plant{thirstyCount > 1 ? 's need' : ' needs'} daily water to grow!</span>
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-900 dark:text-emerald-200 flex items-center gap-2 font-bold">
                  <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                  <span>All garden plants are thriving and nurtured today!</span>
                </div>
              )}
            </div>

            {/* Interactive Actions */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={onOpenTask}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-black text-[11px] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Today's Nature Photo Task (+50 🪙)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleMiracleBoost}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-[11px] transition-all shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
                  <span>Cast Miracle Growth Shower (+30% All)</span>
                </div>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Avatar Trigger */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          cozyAudio.playPlacementSound();
        }}
        className="relative group p-2.5 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-700 text-white shadow-[0_8px_25px_rgba(16,185,129,0.45)] border-3 border-white dark:border-stone-800 transition-transform active:scale-95 hover:scale-105 cursor-pointer"
        title="Flora the Garden Spirit"
      >
        <div className="text-xl transform group-hover:rotate-12 transition-transform">
          🧚‍♀️
        </div>
        {(thirstyCount > 0 || bloomReadyCount > 0) && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] font-black text-white items-center justify-center">
              {bloomReadyCount > 0 ? '✨' : '!'}
            </span>
          </span>
        )}
      </button>
    </div>
  );
};
