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
  Compass,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useGarden } from '../context/GardenContext';

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

  const activeQuest = quests.find(q => !q.isCompleted) || quests[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 sm:space-y-10">
      
      {/* Spacious Hero Welcome Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-forest-900 via-forest-850 to-forest-950 text-white shadow-xl overflow-hidden border border-emerald-500/20">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sanctuary Overview</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight text-emerald-50">
              Welcome back, {profile?.username || 'Botanist'}
            </h1>
            
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Explore your botanical sanctuary, document real-world plants with private AI, and design your virtual garden.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-3 shrink-0">
            <Link
              to="/discover"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102"
            >
              <Sparkles className="w-4 h-4" />
              <span>Scan & Identify Plant</span>
            </Link>

            <button
              onClick={startOutsideMode}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all hover:scale-102"
            >
              <Footprints className="w-4 h-4 text-amber-300" />
              <span>Go Outside Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Spacious Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 7 Columns: Actionable Quest & Plant Care */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Nature Quest */}
          {activeQuest && (
            <div className="glass-panel p-6 rounded-3xl border border-forest-100/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-forest-900 uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-forest-600" />
                  Active Quest
                </span>
                <Link to="/play" className="text-forest-700 hover:text-forest-950 flex items-center gap-1 font-semibold text-xs">
                  All Quests <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-forest-50/70 border border-forest-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-forest-950 text-sm sm:text-base">{activeQuest.title}</h3>
                  <p className="text-stone-600 text-xs">{activeQuest.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-xl">
                    <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    +{activeQuest.coinsReward}
                  </span>
                  <Link
                    to={activeQuest.category === 'discovery' ? '/discover' : '/play'}
                    className="py-2 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition-all"
                  >
                    Start
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Plant Care Reminders */}
          <div className="glass-panel p-6 rounded-3xl border border-forest-100/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg text-forest-950 font-display flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-500" />
                Plant Care & Hydration
              </h3>
              <Link to="/grow" className="text-xs font-bold text-forest-700 hover:text-forest-950 flex items-center gap-1">
                Open Collection <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {plants.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500 bg-forest-50/50 rounded-2xl border border-dashed border-forest-200">
                <p>No plants in your collection yet.</p>
                <Link to="/grow" className="inline-block mt-2 text-forest-700 font-bold hover:underline">
                  + Add your first plant
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {plants.slice(0, 4).map(plant => (
                  <div
                    key={plant.id}
                    className="p-3.5 rounded-2xl bg-white border border-forest-100/80 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={plant.primaryPhotoUrl}
                        alt={plant.name}
                        className="w-11 h-11 rounded-xl object-cover border border-forest-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-forest-950 text-xs truncate">{plant.name}</h4>
                        <span className="text-[10px] text-stone-500">Every {plant.waterFrequencyDays}d</span>
                      </div>
                    </div>

                    <button
                      onClick={() => logPlantCare(plant.id, 'water')}
                      className="py-1.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Droplets className="w-3.5 h-3.5 text-sky-600" />
                      <span>Water</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right 5 Columns: Virtual Garden Snapshot & Recent Discoveries */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Virtual Garden Sanctuary Banner */}
          <div className="glass-panel p-6 rounded-3xl border border-forest-100/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg text-forest-950 font-display flex items-center gap-2">
                <Award className="w-4 h-4 text-forest-600" />
                Virtual Garden
              </h3>
              <Link to="/garden" className="text-xs font-bold text-forest-700 hover:text-forest-950 flex items-center gap-1">
                Design Studio <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-100/50 to-forest-100/50 border border-forest-200/80 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-forest-900 block">Sanctuary Layout</span>
                <p className="text-xs text-stone-600">
                  {gardenItems.length} active flora and decor items arranged on your grid.
                </p>
              </div>

              <Link
                to="/garden"
                className="py-2 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-xs transition-all shrink-0"
              >
                Open Garden
              </Link>
            </div>
          </div>

          {/* Recent AI Discoveries */}
          <div className="glass-panel p-6 rounded-3xl border border-forest-100/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg text-forest-950 font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Recent Discoveries
              </h3>
              <Link to="/discover" className="text-xs font-bold text-forest-700 hover:text-forest-950">
                Scan New
              </Link>
            </div>

            {discoveries.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500 bg-forest-50/50 rounded-2xl border border-dashed border-forest-200">
                <p>No plants scanned yet.</p>
                <Link to="/discover" className="inline-block mt-2 text-forest-700 font-bold hover:underline">
                  Scan a plant now
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {discoveries.slice(0, 3).map(disc => (
                  <div
                    key={disc.id}
                    className="p-3 rounded-2xl bg-white border border-forest-100/80 flex items-center gap-3 text-xs shadow-2xs"
                  >
                    <img
                      src={disc.imageUrl}
                      alt={disc.topPrediction.label}
                      className="w-11 h-11 rounded-xl object-cover border border-forest-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-forest-950 block truncate">
                        {disc.topPrediction.botanicalInfo?.speciesName || disc.topPrediction.label}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {(disc.topPrediction.score * 100).toFixed(1)}% match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <div className="p-4 rounded-2xl bg-forest-50/60 border border-forest-100/80 flex items-start gap-2.5 text-xs text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              AI vision inference runs 100% privately in your browser sandbox using open-weight Vision Transformers.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
