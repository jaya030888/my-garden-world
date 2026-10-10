import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Sprout,
  Coins,
  Award,
  Footprints,
  Droplets,
  ChevronRight,
  ShieldCheck,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useGarden } from '../context/GardenContext';
import { calculateXpForNextLevel } from '../services/economyService';

export const DashboardPage: React.FC = () => {
  const {
    profile,
    plants,
    quests,
    gardenItems,
    discoveries,
    startOutsideMode,
    logPlantCare
  } = useGarden();

  const xpNeeded = profile ? calculateXpForNextLevel(profile.level) : 100;
  const xpPercentage = profile ? Math.min(100, Math.round((profile.xp / xpNeeded) * 100)) : 0;

  // Find priority daily quest
  const activeQuest = quests.find(q => !q.isCompleted) || quests[0];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 pb-28 md:pb-16 space-y-6 sm:space-y-8">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl sm:rounded-4xl p-5 sm:p-8 md:p-10 bg-gradient-to-br from-forest-900 via-forest-850 to-forest-950 text-white shadow-xl overflow-hidden border border-emerald-500/20">
        
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              Discover • Grow • Play
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-display leading-tight text-emerald-50">
              Welcome back, <br className="hidden sm:inline" />
              {profile?.username || 'Botanical Wanderer'}
            </h1>

            <p className="text-stone-300 text-xs sm:text-sm md:text-base max-w-xl leading-relaxed">
              Discover nature with on-device open AI, nurture real plants, and watch your personal virtual garden flourish.
            </p>

            <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <Link
                to="/discover"
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                Scan & Identify Plant
              </Link>

              <button
                onClick={startOutsideMode}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all hover:scale-105"
              >
                <Footprints className="w-4 h-4 text-amber-300" />
                Go Outside Mode
              </button>
            </div>
          </div>

          {/* User Progress Stats Card */}
          <div className="lg:col-span-4 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300 uppercase">Botanist Level</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-forest-950 font-extrabold text-xs">
                Level {profile?.level ?? 1}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-stone-300">Level Progression</span>
                <span className="text-emerald-300">{profile?.xp ?? 0} / {xpNeeded} XP</span>
              </div>
              <div className="h-2 sm:h-2.5 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1 text-center">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-black/20">
                <span className="text-[11px] sm:text-xs text-stone-300 block">Flora Coins</span>
                <span className="text-base sm:text-lg font-extrabold text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                  <Coins className="w-4 h-4 fill-amber-300" />
                  {profile?.floraCoins ?? 0}
                </span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-2xl bg-black/20">
                <span className="text-[11px] sm:text-xs text-stone-300 block">Plants Tracked</span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-300 block mt-0.5">
                  {plants.length}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Main Grid: Priority Actions, Garden Preview, Care Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left 8 Cols: Quick Action Quest, Care Reminders & Garden Snapshot */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          
          {/* Priority Nature Quest Card */}
          {activeQuest && (
            <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-forest-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-forest-900 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-forest-600" />
                  Actionable Nature Quest
                </span>
                <Link to="/play" className="text-forest-700 hover:text-forest-900 flex items-center gap-1">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-forest-50/80 border border-forest-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h3 className="font-bold text-forest-950 text-sm sm:text-base">{activeQuest.title}</h3>
                  <p className="text-stone-600 text-xs mt-0.5">{activeQuest.description}</p>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-end sm:self-auto">
                  <span className="flex items-center gap-1 text-xs font-extrabold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-xl">
                    <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    +{activeQuest.coinsReward}
                  </span>
                  <Link
                    to={activeQuest.category === 'discovery' ? '/discover' : '/play'}
                    className="py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    Start Quest
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Plant Care Reminders */}
          <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-forest-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg text-forest-950 font-display flex items-center gap-2">
                <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500" />
                Care Reminders & Plant Health
              </h3>
              <Link to="/grow" className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1">
                Open Journal <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {plants.length === 0 ? (
              <p className="text-xs text-stone-500 italic">No plants in collection yet. Register a plant in My Plants!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plants.map(plant => (
                  <div
                    key={plant.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-white border border-forest-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                      <img
                        src={plant.primaryPhotoUrl}
                        alt={plant.name}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-forest-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-forest-900 truncate">{plant.name}</h4>
                        <span className="text-[10px] text-stone-500">Every {plant.waterFrequencyDays} days</span>
                      </div>
                    </div>

                    <button
                      onClick={() => logPlantCare(plant.id, 'water')}
                      className="py-1.5 px-2.5 sm:px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Droplets className="w-3.5 h-3.5 text-sky-600" />
                      Water
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Virtual Garden Sanctuary Snapshot */}
          <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-forest-100 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg text-forest-950 font-display flex items-center gap-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-forest-600" />
                Virtual Garden Preview
              </h3>
              <Link to="/garden" className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1">
                Customize Garden <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-100/60 to-forest-100/60 border border-forest-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-forest-900 block">Active Layout</span>
                <p className="text-xs text-stone-600">
                  {gardenItems.length} virtual flora, pots & decorations arranged in your 8x8 sanctuary.
                </p>
              </div>

              <Link
                to="/garden"
                className="py-2 px-4 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs shadow-sm transition-all shrink-0"
              >
                Open Garden
              </Link>
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Recent Discoveries & Open AI Vision Feature */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          
          {/* Recent AI Discoveries */}
          <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-forest-100 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg text-forest-950 font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Saved Discoveries
              </h3>
              <Link to="/discover" className="text-xs font-bold text-forest-700 hover:text-forest-900">
                Scan New
              </Link>
            </div>

            {discoveries.length === 0 ? (
              <div className="p-5 text-center text-xs text-stone-500 space-y-2">
                <p>No discoveries saved yet.</p>
                <Link
                  to="/discover"
                  className="inline-block py-2 px-3.5 rounded-xl bg-forest-100 text-forest-900 font-bold text-xs hover:bg-forest-200"
                >
                  Explore First Plant
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {discoveries.slice(0, 4).map(disc => (
                  <div
                    key={disc.id}
                    className="p-2.5 sm:p-3 rounded-2xl bg-forest-50/70 border border-forest-100 flex items-center gap-2.5 sm:gap-3 text-xs"
                  >
                    <img
                      src={disc.imageUrl}
                      alt={disc.topPrediction.label}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-forest-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-forest-950 block truncate">
                        {disc.topPrediction.botanicalInfo?.speciesName || disc.topPrediction.label}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {(disc.topPrediction.score * 100).toFixed(1)}% match • {disc.inferenceTimeMs.toFixed(0)}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hacktoberfest Open AI Challenge Note */}
          <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-forest-100 shadow-sm space-y-2 text-xs text-stone-700">
            <span className="font-bold text-forest-900 block flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% On-Device & Private AI
            </span>
            <p className="text-[11px] leading-relaxed text-stone-600">
              Inference runs locally using open-weight Vision Transformers (ViT-Base) inside your browser's WebAssembly sandbox. Your images and nature logs never leave your device.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
