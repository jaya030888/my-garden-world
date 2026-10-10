import React from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Coins,
  Sparkles,
  Check,
  X,
  Award,
  Flame
} from 'lucide-react';
import { useGarden } from '../../context/GardenContext';
import { cozyAudio } from '../../services/audioService';
import { fireConfetti } from '../../services/economyService';

interface QuestsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestsDrawer: React.FC<QuestsDrawerProps> = ({ isOpen, onClose }) => {
  const { quests, profile, claimQuest } = useGarden();

  if (!isOpen) return null;

  const handleClaim = async (questId: string) => {
    cozyAudio.playFanfare();
    fireConfetti();
    await claimQuest(questId);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-white dark:bg-stone-900 h-full shadow-2xl border-l border-stone-200 dark:border-stone-800 flex flex-col"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-forest-950 dark:text-emerald-100">Nature Quests & Goals</h2>
              <p className="text-xs text-stone-500">Complete garden activities to earn coins & XP.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quest List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5">
          {quests.map(quest => {
            const isDone = quest.isCompleted;
            const progress = Math.min(quest.currentCount, quest.targetCount);
            const canClaim = quest.currentCount >= quest.targetCount && !isDone;

            return (
              <div
                key={quest.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  isDone
                    ? 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-60'
                    : canClaim
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-xs'
                    : 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-forest-950 dark:text-emerald-100">
                      {quest.title}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">{quest.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-950 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl">
                    <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>+{quest.coinsReward}</span>
                  </div>
                </div>

                {/* Progress Bar & Claim Button */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-stone-400">
                      <span>Progress</span>
                      <span>{progress} / {quest.targetCount}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-100 dark:bg-stone-700 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${(progress / quest.targetCount) * 100}%` }}
                      />
                    </div>
                  </div>

                  {isDone ? (
                    <span className="px-3 py-1 rounded-xl bg-forest-100 text-forest-800 text-xs font-bold inline-flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Claimed</span>
                    </span>
                  ) : canClaim ? (
                    <button
                      onClick={() => handleClaim(quest.id)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs transition-all animate-pulse"
                    >
                      Claim!
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-stone-400">In Progress</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
