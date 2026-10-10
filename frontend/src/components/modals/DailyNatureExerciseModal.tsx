import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  Sparkles,
  Check,
  CheckCircle2,
  X,
  Coins,
  Award,
  Sun,
  Leaf,
  Bird,
  Droplets,
  Footprints,
  Clock,
  RotateCw
} from 'lucide-react';
import {
  DailyNatureExercise,
  getTodaysNatureExercise,
  updatePhotoSlot,
  saveNatureExerciseState
} from '../../services/natureExerciseService';
import { useGarden } from '../../context/GardenContext';
import { cozyAudio } from '../../services/audioService';
import { fireConfetti } from '../../services/economyService';

interface DailyNatureExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyNatureExerciseModal: React.FC<DailyNatureExerciseModalProps> = ({ isOpen, onClose }) => {
  const { logOutsideObservation } = useGarden();

  const [exercise, setExercise] = useState<DailyNatureExercise>(getTodaysNatureExercise());
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [claimedReward, setClaimedReward] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filledCount = exercise.slots.filter(s => !!s.photoUrl).length;
  const isAllFilled = filledCount >= exercise.targetCount;

  const handleSlotClick = (slotIndex: number) => {
    setActiveSlotIndex(slotIndex);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeSlotIndex === null) return;

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      const updated = updatePhotoSlot(exercise, activeSlotIndex, b64);
      setExercise(updated);
      cozyAudio.playPlacementSound();
    };
    reader.readAsDataURL(file);
  };

  const handleCompleteExercise = async () => {
    if (!isAllFilled || exercise.isCompleted) return;

    setIsSubmitting(true);
    try {
      cozyAudio.playFanfare();
      fireConfetti();

      // Log observation to backend / IndexedDB
      await logOutsideObservation({
        durationMinutes: 15,
        locationDescription: `Outdoor Field Exercise: ${exercise.title}`,
        floraObserved: exercise.slots.map(s => s.label),
        sensoryNotes: `Completed daily outdoor photo quest: ${exercise.description}`,
        weatherCondition: 'Sunny / Daylight'
      });

      const completed: DailyNatureExercise = {
        ...exercise,
        isCompleted: true,
        completedAt: new Date().toISOString()
      };
      saveNatureExerciseState(completed);
      setExercise(completed);
      setClaimedReward(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (cat: DailyNatureExercise['category']) => {
    switch (cat) {
      case 'leaves': return <Leaf className="w-5 h-5 text-emerald-400" />;
      case 'birds': return <Bird className="w-5 h-5 text-sky-400" />;
      case 'flowers': return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'water': return <Droplets className="w-5 h-5 text-teal-400" />;
      default: return <Footprints className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-forest-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-gradient-to-b from-forest-900 via-forest-900 to-forest-950 border border-emerald-500/30 rounded-3xl p-4 sm:p-7 text-white shadow-2xl overflow-hidden max-h-[92dvh] overflow-y-auto space-y-4 sm:space-y-6"
      >
        {/* Decorative background aura */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              {getCategoryIcon(exercise.category)}
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider">
                  Today's Nature Expedition
                </span>
                {exercise.isCompleted && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Completed</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-emerald-50 mt-0.5 sm:mt-1">
                {exercise.title}
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-300">{exercise.subtitle}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quest Instructions & Rewards Box */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 sm:space-y-3">
          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
            {exercise.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-white/10 text-xs">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1 text-amber-300 font-extrabold text-xs">
                <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                <span>+{exercise.coinReward} Flora Coins</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-300 font-extrabold text-xs">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                <span>+{exercise.xpReward} XP</span>
              </div>
            </div>

            <div className="text-[10px] sm:text-[11px] text-stone-400">
              Bonus: <span className="text-emerald-200 font-bold">{exercise.seedRewardName}</span>
            </div>
          </div>
        </div>

        {/* PHOTO SLOTS GRID */}
        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
            <span>Outdoor Photo Objectives ({filledCount}/{exercise.targetCount})</span>
            <span className="text-stone-400 text-[10px] sm:text-[11px]">Tap slot to snap / upload</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {exercise.slots.map(slot => {
              const hasPhoto = !!slot.photoUrl;

              return (
                <div
                  key={slot.slotIndex}
                  onClick={() => !exercise.isCompleted && handleSlotClick(slot.slotIndex)}
                  className={`group relative rounded-2xl p-2.5 sm:p-3 border transition-all flex flex-row sm:flex-col items-center sm:justify-between text-left sm:text-center gap-3 sm:gap-1 min-h-[75px] sm:min-h-[160px] active:scale-98 ${
                    hasPhoto
                      ? 'bg-emerald-950/60 border-emerald-500/50 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 border-dashed border-stone-600 hover:border-emerald-400 cursor-pointer'
                  } ${exercise.isCompleted ? 'cursor-default' : ''}`}
                >
                  {/* Photo Preview / Capture Placeholder */}
                  {hasPhoto ? (
                    <div className="w-16 h-16 sm:w-full sm:h-24 rounded-xl overflow-hidden relative shrink-0 sm:mb-2">
                      <img
                        src={slot.photoUrl}
                        alt={slot.label}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <div className="absolute top-1 right-1 p-0.5 sm:p-1 rounded-full bg-emerald-500 text-white shadow-xs">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-full sm:h-24 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 shrink-0 sm:mb-2 group-hover:scale-102 transition-transform">
                      <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-stone-400 group-hover:text-emerald-300" />
                      <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 group-hover:text-emerald-200">
                        Take Photo
                      </span>
                    </div>
                  )}

                  {/* Slot Label */}
                  <div className="w-full min-w-0">
                    <div className="text-xs sm:text-[11px] font-extrabold text-emerald-100 line-clamp-2">
                      {slot.label}
                    </div>
                    {!hasPhoto && !exercise.isCompleted && (
                      <div className="text-[9px] text-amber-300 mt-0.5">Required</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Claim Reward Button / Completion Banner */}
        {exercise.isCompleted ? (
          <div className="p-3 sm:p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-center space-y-1">
            <div className="text-xs sm:text-sm font-extrabold text-emerald-200 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Exercise Completed! +{exercise.coinReward} Coins Claimed</span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-300">
              New outdoor nature challenge arrives tomorrow at sunrise.
            </p>
          </div>
        ) : (
          <button
            onClick={handleCompleteExercise}
            disabled={!isAllFilled || isSubmitting}
            className={`w-full py-3 sm:py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 ${
              isAllFilled
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-forest-950 cursor-pointer animate-pulse hover:scale-102'
                : 'bg-white/10 text-stone-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>
              {isAllFilled
                ? `Complete Exercise & Claim +${exercise.coinReward} Flora Coins!`
                : `Photograph all ${exercise.targetCount} items to complete (${filledCount}/${exercise.targetCount})`}
            </span>
          </button>
        )}
      </motion.div>
    </div>
  );
};
