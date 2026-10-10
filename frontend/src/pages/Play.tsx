import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Footprints,
  Award,
  Coins,
  Sparkles,
  CheckCircle2,
  Calendar,
  Lock,
  Sun,
  ShieldCheck,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useGarden } from '../context/GardenContext';

export const PlayPage: React.FC = () => {
  const {
    profile,
    quests,
    achievements,
    observations,
    claimQuest,
    startOutsideMode
  } = useGarden();

  const [activeTab, setActiveTab] = useState<'quests' | 'mindfulness' | 'achievements'>('quests');
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  const handleClaim = async (questId: string) => {
    try {
      await claimQuest(questId);
      setClaimStatus('Quest reward claimed successfully!');
      setTimeout(() => setClaimStatus(null), 3000);
    } catch (err: any) {
      setClaimStatus(err?.message || 'Failed to claim quest');
    }
  };

  const dailyQuests = quests.filter(q => q.isDaily);
  const weeklyQuests = quests.filter(q => !q.isDaily);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      
      {/* Spacious Header with Clean Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100/80 border border-forest-200 text-forest-800 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-forest-600" />
            <span>Outdoor Activities & Quests</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-forest-950">
            Quests & Mindfulness
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm">
            Step outside, complete botanical challenges, and earn Flora Coins for your virtual sanctuary.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-forest-50/80 border border-forest-100/80 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('quests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'quests'
                ? 'bg-forest-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-forest-900 hover:bg-forest-100/60'
            }`}
          >
            Quests ({quests.length})
          </button>
          <button
            onClick={() => setActiveTab('mindfulness')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'mindfulness'
                ? 'bg-forest-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-forest-900 hover:bg-forest-100/60'
            }`}
          >
            Outdoor Log ({observations.length})
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'achievements'
                ? 'bg-forest-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-forest-900 hover:bg-forest-100/60'
            }`}
          >
            Achievements ({achievements.filter(a => a.unlocked).length}/{achievements.length})
          </button>
        </div>
      </div>

      {claimStatus && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{claimStatus}</span>
        </div>
      )}

      {/* Tab 1: Quests */}
      {activeTab === 'quests' && (
        <div className="space-y-8">
          
          {/* Daily Quests Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-forest-950 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                Daily Nature Quests
              </h3>
              <span className="text-xs text-stone-400 font-medium">Resets daily</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyQuests.map(quest => (
                <div
                  key={quest.id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 ${
                    quest.isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200/80'
                      : 'bg-white border-forest-100/80 shadow-2xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-forest-700 bg-forest-100/70 px-2.5 py-0.5 rounded-lg uppercase">
                        {quest.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-extrabold text-amber-950">
                        <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        <span>+{quest.coinsReward} Coins</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-forest-950 text-sm">{quest.title}</h4>
                      <p className="text-xs text-stone-600 mt-0.5">{quest.description}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-forest-100/60 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-400">
                      Progress: {quest.currentCount} / {quest.targetCount}
                    </span>

                    {quest.isCompleted ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        Claimed
                      </span>
                    ) : quest.currentCount >= quest.targetCount ? (
                      <button
                        onClick={() => handleClaim(quest.id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
                      >
                        Claim Reward
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-stone-400">In Progress</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Quests Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-forest-950 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-forest-600" />
                Weekly Naturalist Bounties
              </h3>
              <span className="text-xs text-stone-400 font-medium">Resets every Monday</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weeklyQuests.map(quest => (
                <div
                  key={quest.id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 ${
                    quest.isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200/80'
                      : 'bg-white border-forest-100/80 shadow-2xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-forest-700 bg-forest-100/70 px-2.5 py-0.5 rounded-lg uppercase">
                        {quest.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-extrabold text-amber-950">
                        <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        <span>+{quest.coinsReward} Coins</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-forest-950 text-sm">{quest.title}</h4>
                      <p className="text-xs text-stone-600 mt-0.5">{quest.description}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-forest-100/60 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-400">
                      Progress: {quest.currentCount} / {quest.targetCount}
                    </span>

                    {quest.isCompleted ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        Claimed
                      </span>
                    ) : quest.currentCount >= quest.targetCount ? (
                      <button
                        onClick={() => handleClaim(quest.id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
                      >
                        Claim Reward
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-stone-400">In Progress</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Mindfulness & Outdoor Log */}
      {activeTab === 'mindfulness' && (
        <div className="space-y-6">
          
          {/* Outdoor Mode CTA */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base sm:text-lg text-forest-950 font-display">
                Touch Grass & Step Outside
              </h3>
              <p className="text-xs text-stone-600">
                Take a 5-minute break in nature to record sensory observations and earn Flora Coins.
              </p>
            </div>
            <button
              onClick={startOutsideMode}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all hover:scale-102 shrink-0"
            >
              <Footprints className="w-4 h-4" />
              <span>Start 5-Min Session</span>
            </button>
          </div>

          {/* Past Observation Log Cards */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-forest-950">Completed Outdoor Sessions</h3>
            {observations.length === 0 ? (
              <div className="p-10 text-center text-xs text-stone-500 bg-forest-50/50 rounded-3xl border border-dashed border-forest-200">
                No outdoor mindfulness logs yet. Step outside and complete your first session!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {observations.map(obs => (
                  <div
                    key={obs.id}
                    className="p-5 rounded-3xl bg-white border border-forest-100/80 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-forest-950 flex items-center gap-1.5">
                        <Footprints className="w-3.5 h-3.5 text-amber-600" />
                        {obs.durationMinutes} min Nature Break
                      </span>
                      <span className="text-stone-400 text-[11px]">{new Date(obs.timestamp).toLocaleDateString()}</span>
                    </div>

                    <p className="text-xs text-stone-600 italic leading-relaxed">
                      "{obs.sensoryNotes}"
                    </p>

                    {obs.floraObserved && obs.floraObserved.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {obs.floraObserved.map((flora, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-lg bg-forest-50 text-forest-800 text-[10px] font-semibold border border-forest-100"
                          >
                            {flora}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 3: Achievements & Milestones */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 ${
                ach.unlocked
                  ? 'bg-white border-forest-200/80 shadow-2xs'
                  : 'bg-stone-50/80 border-stone-200/80 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-forest-50 flex items-center justify-center text-forest-700">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-forest-950 text-sm">{ach.title}</h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">{ach.description}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-forest-100/60 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700">+{ach.xpReward} XP</span>
                  <span className="text-amber-800">+{ach.coinReward} Coins</span>
                </div>
                {ach.unlocked ? (
                  <span className="text-emerald-600 flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Unlocked
                  </span>
                ) : (
                  <span className="text-stone-400 flex items-center gap-1 text-[11px]">
                    <Lock className="w-3.5 h-3.5" />
                    Locked
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
