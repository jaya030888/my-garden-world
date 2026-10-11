import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  Sparkles,
  Sprout,
  Droplets,
  ShieldCheck,
  Globe,
  Leaf,
  Compass,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Heart,
  CheckCircle2,
  Coins,
  Award,
  Layers,
  BookOpen
} from 'lucide-react';
import { useGarden } from '../context/GardenContext';
import { identifyPlant, ModelLoadingProgress } from '../ai/plantClassifier';
import { IdentificationResult } from '../types';
import { BotanicalGuideFactSheet } from '../components/garden/BotanicalGuideFactSheet';

const CURATED_SAMPLE_FLORA = [
  {
    name: 'Common Daisy',
    scientific: 'Bellis perennis',
    speciesKey: 'daisy',
    tag: 'Wildflower',
    color: '#10b981',
    photoUrl: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=600&q=80'
  },
  {
    name: 'Golden Sunflower',
    scientific: 'Helianthus annuus',
    speciesKey: 'sunflower',
    tag: 'Pollinator Magnet',
    color: '#f59e0b',
    photoUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&q=80'
  },
  {
    name: 'French Marigold',
    scientific: 'Tagetes patula',
    speciesKey: 'marigold',
    tag: 'Companion Herb',
    color: '#ea580c',
    photoUrl: 'https://images.unsplash.com/photo-1599818817739-1662a5b6d910?w=600&q=80'
  },
  {
    name: 'Swiss Cheese Plant',
    scientific: 'Monstera deliciosa',
    speciesKey: 'monstera',
    tag: 'Tropical Aroid',
    color: '#059669',
    photoUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80'
  },
  {
    name: 'English Lavender',
    scientific: 'Lavandula angustifolia',
    speciesKey: 'lavender',
    tag: 'Aromatic Sub-Shrub',
    color: '#8b5cf6',
    photoUrl: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=600&q=80'
  }
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, plants, discoveries, saveDiscovery, addPlantRecord } = useGarden();

  const [loadingProgress, setLoadingProgress] = useState<ModelLoadingProgress>({ status: 'idle' });
  const [activeResult, setActiveResult] = useState<IdentificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleScanImage = async (fileOrUrl: File | string, hint?: string) => {
    setErrorMsg(null);
    setActiveResult(null);
    setSavedSuccess(false);

    try {
      setLoadingProgress({ status: 'downloading', message: 'Initializing on-device Vision Transformer...' });
      const result = await identifyPlant(fileOrUrl, progress => {
        setLoadingProgress(progress);
      }, hint);

      setActiveResult(result);
      setLoadingProgress({ status: 'ready', message: 'Identification complete' });
    } catch (err: any) {
      console.error('[DashboardPage] AI Scan error:', err);
      setErrorMsg(err?.message || 'Could not analyze image. Please try with a clear plant photo.');
      setLoadingProgress({ status: 'error', message: 'Inference notice' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }
    handleScanImage(file);
  };

  const handleSaveToMyPlants = async () => {
    if (!activeResult || !activeResult.topPrediction.botanicalInfo) return;
    const bot = activeResult.topPrediction.botanicalInfo;
    await addPlantRecord({
      name: bot.speciesName,
      species: bot.scientificName,
      scientificName: bot.scientificName,
      family: bot.family,
      acquiredDate: new Date().toISOString(),
      primaryPhotoUrl: activeResult.imageUrl,
      location: 'indoor',
      sunlightNeeds: 'indirect_bright',
      waterFrequencyDays: 7,
      notes: `Identified on homepage via Vision AI with ${(activeResult.topPrediction.score * 100).toFixed(1)}% confidence.`
    });
    await saveDiscovery(activeResult);
    setSavedSuccess(true);
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* ============================================================ */}
      {/* 1. HERO SECTION: Plant Discovery Front & Center */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-6 sm:pt-10 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50/70 via-stone-50/50 to-transparent dark:from-stone-900/90 dark:via-stone-950 dark:to-surface-bg border-b border-forest-100/60 dark:border-stone-800">
        
        {/* Organic Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-emerald-200/20 via-teal-200/20 to-amber-200/15 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto space-y-8 text-center">
          
          {/* Main Title Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>On-Device Open-Source Vision AI • 100% Private Client Inference</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display text-forest-950 dark:text-emerald-50 tracking-tight leading-tight">
              Discover Nature. Grow with Intelligence.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-600 to-forest-800 dark:from-emerald-400 dark:to-teal-300">
                Watch Life Unfold.
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
              Identify plant species in your browser, unlock scientific cultivation advice with ASPCA pet safety, and build an isometric virtual garden.
            </p>
          </div>

          {/* PRIMARY CALL TO ACTION: Prominent Dropzone & Camera Trigger */}
          <div className="max-w-2xl mx-auto p-5 sm:p-7 rounded-3xl bg-white/95 dark:bg-stone-900/95 border-2 border-dashed border-emerald-300 dark:border-emerald-800 shadow-xl space-y-5 transition-all hover:border-emerald-500">
            
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-forest-950 dark:text-emerald-100">
                  Scan Any Flower, Houseplant, or Leaf
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Drag & drop a photo, browse files, or test with verified botanical specimens below
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer ring-1 ring-forest-700"
              >
                <Upload className="w-4 h-4 text-emerald-300" />
                <span>Upload Plant Image</span>
              </button>

              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-50 dark:bg-stone-800 hover:bg-emerald-100 text-forest-900 dark:text-emerald-200 border border-emerald-200 dark:border-stone-700 font-extrabold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Use Device Camera</span>
              </button>
            </div>

            {/* Curated Sample Flower Picks for Instant Verification */}
            <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800">
              <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block mb-2.5">
                Or click to test with verified botanical specimens:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {CURATED_SAMPLE_FLORA.map(specimen => (
                  <button
                    key={specimen.speciesKey}
                    onClick={() => handleScanImage(specimen.photoUrl, specimen.speciesKey)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-emerald-500 text-stone-800 dark:text-stone-200 text-xs font-bold transition-all shadow-2xs hover:scale-102 cursor-pointer"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: specimen.color }} />
                    <span>{specimen.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Loading State Banner */}
          {loadingProgress.status === 'downloading' && (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-center space-y-2">
              <div className="w-6 h-6 mx-auto border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">{loadingProgress.message}</p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs font-bold text-rose-800 dark:text-rose-200 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* LIVE SCAN RESULT PRESENTATION (EMBEDDED FACT SHEET) */}
          <AnimatePresence>
            {activeResult && activeResult.topPrediction.botanicalInfo && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl mx-auto text-left pt-4"
              >
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-forest-900 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>AI Identification Result ({activeResult.inferenceTimeMs}ms)</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Model: {activeResult.modelName.split('/').pop()}
                  </span>
                </div>

                <BotanicalGuideFactSheet
                  botanicalInfo={activeResult.topPrediction.botanicalInfo}
                  prediction={activeResult.topPrediction}
                  imageUrl={activeResult.imageUrl}
                  isSaved={savedSuccess}
                  onSaveToCollection={handleSaveToMyPlants}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ============================================================ */}
          {/* WHAT USERS LEARN FROM A SCAN (4-Column Illustrated Bar) */}
          {/* ============================================================ */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 space-y-1 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold mb-2">
                  <Globe className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-extrabold text-forest-950 dark:text-emerald-100">
                  Taxonomic Identity
                </h4>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Confirmed binomial scientific nomenclature, genus, botanical family, and common regional names.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 space-y-1 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center text-sky-700 dark:text-sky-400 font-bold mb-2">
                  <Droplets className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-extrabold text-forest-950 dark:text-emerald-100">
                  Moisture & Soil Guidance
                </h4>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Practical soil moisture regimes, aeration guidelines, drainage metrics, and seasonal feeding.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 space-y-1 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-extrabold text-forest-950 dark:text-emerald-100">
                  ASPCA Pet Toxicity
                </h4>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Verified safety status for cats, dogs, and horses, including handling precautions for children.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 space-y-1 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-extrabold text-forest-950 dark:text-emerald-100">
                  Ecological Synergy
                </h4>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Pollinator value for native solitary bees, phytoremediation traits, and companion planting.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. THE THREE CORE PILLARS OF MY GARDEN WORLD */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-forest-950 dark:text-emerald-50">
            Explore the Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Three seamlessly connected experiences bridging real-world botanical observation and cozy virtual play.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Pillar 1: Plant Discovery */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md space-y-4 flex flex-col justify-between hover:shadow-lg transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">Feature Pillar 1</span>
                <h3 className="text-lg font-black text-forest-950 dark:text-emerald-100">AI Plant Discovery</h3>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Identify wild flowers and garden plants using open-weight Vision Transformers. View honest confidence ratings and verified taxonomic records without sending photos to cloud APIs.
              </p>
            </div>
            <Link
              to="/discover"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:gap-2.5 transition-all"
            >
              <span>Explore Explorer Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 2: Garden Care & Design */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md space-y-4 flex flex-col justify-between hover:shadow-lg transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-wider block">Feature Pillar 2</span>
                <h3 className="text-lg font-black text-forest-950 dark:text-emerald-100">Garden Care & Design</h3>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Log real houseplant records, record watering cadences, compare growth photo timelines, and diagnose common plant issues with customized treatment plans.
              </p>
            </div>
            <Link
              to="/grow"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 group-hover:gap-2.5 transition-all"
            >
              <span>Open Plant Care Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 3: Virtual Garden & Nature Quests */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md space-y-4 flex flex-col justify-between hover:shadow-lg transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">Feature Pillar 3</span>
                <h3 className="text-lg font-black text-forest-950 dark:text-emerald-100">Virtual Garden & Quests</h3>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Step away from screens, complete "Touch Grass" outdoor challenges, earn Flora Coins, and cultivate your own cozy isometric garden with dynamic weather and ambient lo-fi soundscapes.
              </p>
            </div>
            <Link
              to="/garden"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 group-hover:gap-2.5 transition-all"
            >
              <span>Enter Virtual Garden Canvas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. VIRTUAL GARDEN TEASER & QUICK STATS */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-forest-900 via-emerald-950 to-stone-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold uppercase tracking-wider inline-block">
              Your Garden Sanctuary
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Ready to cultivate your virtual botanical tiles?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200/80 max-w-xl">
              You have {profile?.floraCoins ?? 0} Flora Coins and Level {profile?.level ?? 1} botanist ranking. Enter the full-screen canvas to design paths, plant unlocked seeds, and listen to relaxing rain.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/garden"
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-forest-950" />
              <span>Launch Virtual Garden</span>
            </Link>

            <Link
              to="/play"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-emerald-300" />
              <span>View Nature Quests</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. RECENT USER DISCOVERIES & MY PLANTS OVERVIEW */}
      {/* ============================================================ */}
      {plants.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-forest-950 dark:text-emerald-50">Your Tracked Houseplants</h3>
              <p className="text-xs text-stone-500">Living plants in your personal collection</p>
            </div>
            <Link to="/grow" className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
              View All ({plants.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {plants.slice(0, 5).map(p => (
              <div
                key={p.id}
                onClick={() => navigate('/grow')}
                className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
              >
                <div className="w-full h-28 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img src={p.primaryPhotoUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-forest-950 dark:text-emerald-100 truncate">{p.name}</h4>
                  <p className="text-[10px] text-stone-500 italic truncate">{p.species}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
