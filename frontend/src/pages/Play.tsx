import React, { useState, useEffect } from 'react';
import {
  Compass,
  Award,
  Coins,
  CheckCircle2,
  Lock,
  Footprints,
  History,
  Droplets,
  Camera,
  Sun,
  Scan,
  ShieldCheck,
  Leaf
} from 'lucide-react';
import { useGarden } from '../context/GardenContext';
import { db } from '../db';
import { TransactionRecord } from '../types';

export const PlayPage: React.FC = () => {
  const {
    quests,
    achievements,
    profile,
    observations,
    startOutsideMode,
    claimQuest
  } = useGarden();

  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  useEffect(() => {
    const fetchTx = async () => {
      const tx = await db.transactions.reverse().limit(20).toArray();
      setTransactions(tx);
    };
    fetchTx();
  }, [profile]);

  const renderQuestIcon = (name: string) => {
    switch (name) {
      case 'scan':
        return <Scan className="w-5 h-5 text-emerald-600" />;
      case 'droplet':
        return <Droplets className="w-5 h-5 text-sky-500" />;
      case 'sun':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'camera':
        return <Camera className="w-5 h-5 text-purple-500" />;
      default:
        return <Compass className="w-5 h-5 text-forest-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 pb-28 md:pb-16 space-y-6 sm:space-y-8">
      
      {/* Page Title & Go Outside Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 border border-forest-200 text-forest-800 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5 text-forest-600" />
            Gamified Nature Quests & Economy
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-forest-950">
            Nature Quests & Badges
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm">
            Complete mindful real-world botanical actions, earn rewards, and grow your level.
          </p>
        </div>

        <button
          onClick={startOutsideMode}
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Footprints className="w-4 h-4" />
          Launch Go Outside Mode
        </button>
      </div>

      {/* Main Grid: Quests Left, Achievements & Ledger Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Active Quests */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-forest-900 uppercase tracking-wider px-1">
            <span>Daily & Weekly Nature Quests</span>
            <span className="text-stone-500 text-[10px] sm:text-xs">Resets daily</span>
          </div>

          <div className="space-y-3">
            {quests.map(quest => {
              const isClaimable = quest.currentCount >= quest.targetCount && !quest.isCompleted;

              return (
                <div
                  key={quest.id}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all ${
                    quest.isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200/80 opacity-90'
                      : 'glass-panel border-forest-100 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 sm:gap-3.5">
                      <div className="p-2.5 sm:p-3 rounded-2xl bg-forest-50 border border-forest-100 shrink-0">
                        {renderQuestIcon(quest.iconName)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <h4 className="font-bold text-forest-950 text-sm sm:text-base">{quest.title}</h4>
                          <span className="text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
                            {quest.isDaily ? 'Daily' : 'Weekly'}
                          </span>
                        </div>
                        <p className="text-stone-600 text-xs mt-1 leading-relaxed">
                          {quest.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 font-bold text-xs text-amber-900 justify-end">
                        <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        +{quest.coinsReward}
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-semibold text-purple-700">
                        +{quest.xpReward} XP
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 pt-3 border-t border-forest-100 flex items-center justify-between">
                    <div className="text-xs text-stone-500">
                      Progress: <strong>{quest.currentCount}</strong> / {quest.targetCount}
                    </div>

                    {quest.isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        Claimed
                      </span>
                    ) : isClaimable ? (
                      <button
                        onClick={() => claimQuest(quest.id)}
                        className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        Claim Reward
                      </button>
                    ) : (
                      <span className="text-xs text-stone-400 font-medium">In Progress</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nature Observations Chronicle */}
          <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-forest-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base sm:text-lg text-forest-950 font-display flex items-center gap-2">
              <Footprints className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              Recorded Outdoor Walks ({observations.length})
            </h3>
            {observations.length === 0 ? (
              <p className="text-xs text-stone-500 italic">
                No nature walks logged yet. Tap "Launch Go Outside Mode" above to record your first observation!
              </p>
            ) : (
              <div className="space-y-2.5">
                {observations.slice(0, 4).map(obs => (
                  <div
                    key={obs.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-forest-50/70 border border-forest-100 text-xs space-y-1.5"
                  >
                    <div className="flex justify-between font-bold text-forest-900">
                      <span>{obs.locationDescription}</span>
                      <span className="text-stone-500 font-mono text-[10px] sm:text-[11px]">
                        {obs.durationMinutes} min • {new Date(obs.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-stone-600 italic text-[11px] sm:text-xs">"{obs.sensoryNotes}"</p>
                    <div className="flex flex-wrap gap-1 text-[10px] text-emerald-800">
                      {obs.floraObserved.map((fl, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-100/80 font-medium flex items-center gap-1">
                          <Leaf className="w-2.5 h-2.5 text-emerald-600" /> {fl}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Achievements Showcase & Transaction History */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          
          {/* Achievements Showcase */}
          <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-forest-100 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg text-forest-950 font-display flex items-center gap-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                Achievements
              </h3>
              <span className="text-xs text-stone-500 font-semibold">
                {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
              </span>
            </div>

            <div className="space-y-2.5">
              {achievements.map(ach => (
                <div
                  key={ach.id}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-left flex items-center gap-3 ${
                    ach.unlocked
                      ? 'bg-amber-50/60 border-amber-200/80 text-forest-950'
                      : 'bg-stone-50/70 border-stone-200 text-stone-400 opacity-60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      ach.unlocked ? 'bg-amber-100 text-amber-700' : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {ach.unlocked ? <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" /> : <Lock className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs truncate">{ach.title}</h4>
                    <p className="text-[10px] sm:text-[11px] leading-snug">{ach.description}</p>
                  </div>
                  <div className="text-right text-[10px] font-bold text-amber-800 shrink-0">
                    +{ach.coinReward} Coins
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flora Coins Transaction History Ledger */}
          <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-forest-100 shadow-sm space-y-3 sm:space-y-4">
            <h3 className="font-bold text-base sm:text-lg text-forest-950 font-display flex items-center gap-2">
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-forest-600" />
              Flora Coins Ledger
            </h3>

            <div className="space-y-2 max-h-[260px] sm:max-h-[300px] overflow-y-auto pr-1">
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  className="p-2.5 sm:p-3 rounded-xl bg-white border border-stone-200/80 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-stone-800 block truncate">{tx.description}</span>
                    <span className="text-[9px] sm:text-[10px] text-stone-400 font-mono">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(tx.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`font-bold font-mono text-xs shrink-0 ${
                      tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} {tx.currency}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
