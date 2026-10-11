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
  BookOpen,
  Sun,
  Eye,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { useGarden } from '../context/GardenContext';
import { identifyPlant, ModelLoadingProgress } from '../ai/plantClassifier';
import { VERIFIED_BOTANICAL_SPECIES, POPULAR_CULTIVARS } from '../ai/botanicalDatabase';
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
  const { profile, plants, saveDiscovery, addPlantRecord, openScanner } = useGarden();

  const [loadingProgress, setLoadingProgress] = useState<ModelLoadingProgress>({ status: 'idle' });
  const [activeResult, setActiveResult] = useState<IdentificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleScanImage = async (fileOrUrl: File | string, hint?: string) => {
    setErrorMsg(null);
    setActiveResult(null);
    setSavedSuccess(false);

    try {
      setLoadingProgress({ status: 'downloading', message: 'Initializing on-device Vision Transformer (WASM)...' });
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please drop a valid image file (JPG, PNG, or WebP).');
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

  const handleRefineCultivar = (cultivarKey: string) => {
    const cultivar = VERIFIED_BOTANICAL_SPECIES[cultivarKey];
    if (!cultivar || !activeResult) return;
    setActiveResult({
      ...activeResult,
      hasPlantDetected: true,
      topPrediction: {
        ...activeResult.topPrediction,
        label: cultivar.speciesName,
        isVerifiedSpecies: true,
        botanicalInfo: cultivar,
        statusExplanation: `Calibrated to verified cultivar: ${cultivar.speciesName} (${cultivar.scientificName}). Care parameters and ASPCA data active.`
      }
    });
  };

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      
      {/* ============================================================ */}
      {/* 1. HERO SECTION: Inspired by Editorial Reference Design */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-stone-200/70 dark:border-stone-800/80">
        
        {/* Soft Ambient Radiance */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[520px] bg-gradient-to-b from-emerald-100/35 via-stone-100/20 to-transparent dark:from-emerald-950/20 dark:via-transparent -z-10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-10">
          
          {/* Top Pill Badge */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-[16px] bg-white dark:bg-stone-900 px-3.5 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-stone-200/80 dark:border-stone-800 text-xs font-bold text-forest-900 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Open-Source Botanical Intelligence • 100% Client-Side Privacy</span>
            </div>
          </div>

          {/* Editorial Stacked Headline */}
          <div className="text-center space-y-4">
            <h1 className="space-y-1">
              <span className="block text-[clamp(36px,6.8vw,74px)] font-black leading-[0.96] tracking-tight text-forest-950/40 dark:text-emerald-100/40">
                Discover nature.
              </span>
              <span className="block text-[clamp(36px,6.8vw,74px)] font-black leading-[0.96] tracking-tight text-forest-950/75 dark:text-emerald-100/75">
                Grow with intelligence.
              </span>
              <span className="block text-[clamp(36px,6.8vw,74px)] font-black leading-[0.96] tracking-tight text-forest-950 dark:text-emerald-300">
                Watch life unfold.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed font-medium pt-2">
              Step away from screens and connect with the natural world. Identify wild flora on-device with zero cloud uploads, unlock practical soil-moisture care, and cultivate your virtual botanical sanctuary.
            </p>
          </div>

          {/* Tactile Primary Action Buttons (Inspired by reference site's high-contrast pill CTA) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 rounded-[20px] bg-forest-950 dark:bg-emerald-400 pl-6 pr-2.5 py-2.5 text-white dark:text-forest-950 shadow-[0_16px_40px_rgba(6,78,59,0.18)] hover:-translate-y-0.5 active:translate-y-0 transition-all font-extrabold text-sm sm:text-base cursor-pointer group"
            >
              <span>Scan a Plant Now</span>
              <div className="w-10 h-10 rounded-[14px] bg-white/15 dark:bg-forest-950/15 text-white dark:text-forest-950 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5 text-emerald-300 dark:text-forest-950" />
              </div>
            </button>

            <Link
              to="/garden"
              className="flex items-center gap-2.5 rounded-[20px] bg-white dark:bg-stone-800 border border-stone-200/90 dark:border-stone-700 px-6 py-3.5 text-forest-950 dark:text-emerald-100 font-bold text-sm sm:text-base shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Launch Virtual Garden</span>
            </Link>
          </div>

          {/* ============================================================ */}
          {/* PINNED SHOWCASE: Interactive Scanning Station */}
          {/* ============================================================ */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`max-w-3xl mx-auto rounded-[28px] bg-white dark:bg-stone-900 border-2 transition-all p-6 sm:p-8 shadow-[0_24px_70px_rgba(20,50,30,0.08)] space-y-6 ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[1.01]'
                : 'border-stone-200/90 dark:border-stone-800 hover:border-emerald-400/60'
            }`}
          >
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

            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pb-5 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-13 h-13 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-2xs">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-forest-950 dark:text-emerald-50">
                    Live Botanical Vision Scanner
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Drop any plant photo, take a camera snapshot, or select verified specimens
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-950 text-white font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Upload File</span>
                </button>
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs transition-all cursor-pointer active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Camera</span>
                </button>
              </div>
            </div>

            {/* Specimen Test Strip */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Test Instantly with Ground-Truth Botanical Samples:
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:inline">
                  ⚡ Pre-calibrated
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {CURATED_SAMPLE_FLORA.map(specimen => (
                  <button
                    key={specimen.speciesKey}
                    onClick={() => handleScanImage(specimen.photoUrl, specimen.speciesKey)}
                    className="flex flex-col items-start p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-stone-200/80 dark:border-stone-700 hover:border-emerald-400 text-left transition-all group cursor-pointer"
                  >
                    <div className="w-full h-14 rounded-lg overflow-hidden mb-2 bg-stone-200 dark:bg-stone-700">
                      <img
                        src={specimen.photoUrl}
                        alt={specimen.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-xs font-black text-forest-950 dark:text-emerald-100 truncate w-full">
                      {specimen.name}
                    </span>
                    <span className="text-[10px] text-stone-500 italic truncate w-full">
                      {specimen.scientific}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Loading / Status State */}
            {loadingProgress.status === 'downloading' && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  {loadingProgress.message}
                </span>
              </div>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs font-bold text-rose-800 dark:text-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Embedded Live Scan Results */}
            <AnimatePresence>
              {activeResult && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="pt-2 text-left"
                >
                  {activeResult.hasPlantDetected && activeResult.topPrediction.botanicalInfo ? (
                    <>
                      <div className="flex items-center justify-between pb-3 px-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-forest-900 dark:text-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Vision Transformer Output ({activeResult.inferenceTimeMs}ms)</span>
                        </div>
                        <span className="text-[11px] text-stone-500 font-mono">
                          Model: {activeResult.modelName.split('/').pop()}
                        </span>
                      </div>

                      {/* Cultivar Refinement Strip */}
                      <div className="mb-4 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-forest-900 dark:text-emerald-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            1-Tap Cultivar Refinement / Match Species:
                          </span>
                          <span className="text-[10px] text-stone-400">Instant Care Guide</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {POPULAR_CULTIVARS.map(cult => {
                            const isSelected = activeResult.topPrediction.botanicalInfo?.speciesName === cult.name;
                            return (
                              <button
                                key={cult.key}
                                onClick={() => handleRefineCultivar(cult.key)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-forest-900 dark:bg-emerald-500 text-white dark:text-forest-950 font-bold shadow-xs scale-102'
                                    : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-500'
                                }`}
                              >
                                <span>{cult.icon}</span>
                                <span>{cult.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <BotanicalGuideFactSheet
                        botanicalInfo={activeResult.topPrediction.botanicalInfo}
                        prediction={activeResult.topPrediction}
                        imageUrl={activeResult.imageUrl}
                        isSaved={savedSuccess}
                        onSaveToCollection={handleSaveToMyPlants}
                      />
                    </>
                  ) : (
                    <div className="p-6 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center space-y-4">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 shadow-2xs">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-black text-rose-950 dark:text-rose-100">
                          No Plant Detected
                        </h4>
                        <p className="text-xs text-rose-800 dark:text-rose-300 max-w-md mx-auto leading-relaxed">
                          We could not detect any plant in this picture (detected: <span className="font-semibold">"{activeResult.topPrediction.label}"</span>). Please upload a clear photo of living foliage, or tap any cultivar below to explore its verified care guide.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-rose-200/60 dark:border-rose-800/60 space-y-2">
                        <span className="text-[11px] font-bold text-rose-900 dark:text-rose-200 block">
                          Or select a plant species to explore its verified care guide:
                        </span>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {POPULAR_CULTIVARS.slice(0, 8).map(cult => (
                            <button
                              key={cult.key}
                              onClick={() => handleRefineCultivar(cult.key)}
                              className="px-2.5 py-1 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:border-emerald-500 flex items-center gap-1 cursor-pointer"
                            >
                              <span>{cult.icon}</span>
                              <span>{cult.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="pt-1">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-950 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Try Another Photo</span>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. WHAT USERS LEARN FROM A SCAN (Curated Magazine Strip) */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Botanical Intelligence
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-display text-forest-950 dark:text-emerald-50">
              What You Learn from Every Scan
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md">
            Beyond a label and a percentage: structured, scientific insights verified by authoritative horticultural databases.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-3">
            <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-xs font-black text-stone-600 dark:text-stone-300 inline-block">
              01
            </span>
            <h3 className="text-base font-black text-forest-950 dark:text-emerald-100">
              Taxonomic Binomial
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Official binomial scientific nomenclature, genus, botanical family, and recognized regional common names.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-3">
            <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-xs font-black text-stone-600 dark:text-stone-300 inline-block">
              02
            </span>
            <h3 className="text-base font-black text-forest-950 dark:text-emerald-100">
              Soil-Moisture Protocol
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Practical top-inch finger test guidance, pot drainage criteria, and seasonal watering schedules rather than vague estimates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-3">
            <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-xs font-black text-stone-600 dark:text-stone-300 inline-block">
              03
            </span>
            <h3 className="text-base font-black text-forest-950 dark:text-emerald-100">
              ASPCA Safety Ratings
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Documented toxicity ratings for cats, dogs, and horses, including human sap handling precautions and emergency steps.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-3">
            <span className="rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-xs font-black text-stone-600 dark:text-stone-300 inline-block">
              04
            </span>
            <h3 className="text-base font-black text-forest-950 dark:text-emerald-100">
              Ecological Synergy
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Native solitary bee pollination value, companion planting combinations, and evidence-based garden ecosystem benefits.
            </p>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. THE THREE MAIN EXPERIENCES (Varied Curated Layouts) */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
            Ecosystem Overview
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-display text-forest-950 dark:text-emerald-50">
            Three Interconnected Experiences
          </h2>
        </div>

        <div className="space-y-8">
          
          {/* Showcase 01: AI Plant Discovery (Split Magazine Card) */}
          <div className="rounded-[28px] bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-[0_16px_50px_rgba(0,0,0,0.05)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 p-8 sm:p-12 space-y-5">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-forest-900 dark:bg-emerald-400 text-white dark:text-forest-950 px-3.5 py-1 text-xs font-black">
                  01
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
                  Real-World AI Vision
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-forest-950 dark:text-emerald-50 leading-tight">
                AI-Powered Plant Discovery
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                Take a photograph of any leaf or blossom. Our client-side Vision Transformer performs local inference directly inside WebAssembly. Your photos never touch a remote server, guaranteeing 100% personal data privacy and offline capability.
              </p>
              <div className="pt-2">
                <Link
                  to="/discover"
                  className="inline-flex items-center gap-2 rounded-2xl bg-forest-900 dark:bg-emerald-500 hover:bg-forest-950 text-white dark:text-forest-950 px-5 py-3 text-xs font-black shadow-xs transition-all hover:scale-102"
                >
                  <span>Open Plant Discovery</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 h-72 lg:h-full min-h-[300px] bg-stone-100 dark:bg-stone-800 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1545241047-6083a3684587?w=1200&q=80"
                alt="Plant Discovery"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-6">
                <div className="text-white space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                    On-Device Inference
                  </span>
                  <p className="text-xs font-semibold">
                    ViT Transformer running directly in your browser with zero latency.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Showcase 02: Garden Care & Design (Split Magazine Card Reversible) */}
          <div className="rounded-[28px] bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-[0_16px_50px_rgba(0,0,0,0.05)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1 h-72 lg:h-full min-h-[300px] bg-stone-100 dark:bg-stone-800 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1599818817739-1662a5b6d910?w=1200&q=80"
                alt="Garden Care"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-6">
                <div className="text-white space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300">
                    Growth Photologging
                  </span>
                  <p className="text-xs font-semibold">
                    Compare historical photos across growth stages to verify leaf health.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 p-8 sm:p-12 space-y-5">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-forest-900 dark:bg-emerald-400 text-white dark:text-forest-950 px-3.5 py-1 text-xs font-black">
                  02
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600">
                  Care & Growth Journal
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-forest-950 dark:text-emerald-50 leading-tight">
                AI Garden Care & Design
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                Log real houseplant records, record watering cadences, compare growth photo timelines, and diagnose common pests with verified non-toxic treatments.
              </p>
              <div className="pt-2">
                <Link
                  to="/grow"
                  className="inline-flex items-center gap-2 rounded-2xl bg-teal-800 dark:bg-teal-500 hover:bg-teal-900 text-white dark:text-forest-950 px-5 py-3 text-xs font-black shadow-xs transition-all hover:scale-102"
                >
                  <span>Explore Garden Care</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Showcase 03: Virtual Garden & Nature Quests */}
          <div className="rounded-[28px] bg-gradient-to-br from-forest-950 via-stone-900 to-emerald-950 text-white border border-forest-900/40 p-8 sm:p-12 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-emerald-500 text-forest-950 px-3.5 py-1 text-xs font-black">
                  03
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                  Virtual Ecosystem
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Level {profile?.level ?? 1} Botanist • {profile?.floraCoins ?? 0} Flora Coins</span>
              </div>
            </div>

            <div className="max-w-2xl space-y-3">
              <h3 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
                Cozy Virtual Garden & Nature Quests
              </h3>
              <p className="text-sm text-emerald-100/80 leading-relaxed">
                Complete outdoor "Touch Grass" challenges, observe wildlife, earn Flora Coins, and plant unlocked botanical seeds on your interactive isometric canvas with dynamic weather and ambient rain soundscapes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/garden"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-forest-950 px-6 py-3 text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Virtual Garden</span>
              </Link>
              <Link
                to="/play"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-emerald-300" />
                <span>View Nature Quests</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. TRACKED LIVING HOUSEPLANTS (Personal Collection Preview) */}
      {/* ============================================================ */}
      {plants.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
            <div>
              <h3 className="text-lg font-black text-forest-950 dark:text-emerald-50">
                Your Tracked Living Houseplants
              </h3>
              <p className="text-xs text-stone-500">
                Plants actively monitored in your Care Collection
              </p>
            </div>
            <Link to="/grow" className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
              View All ({plants.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {plants.slice(0, 5).map(p => (
              <div
                key={p.id}
                onClick={() => navigate('/grow')}
                className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2.5 group"
              >
                <div className="w-full h-28 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src={p.primaryPhotoUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-black text-forest-950 dark:text-emerald-100 truncate">
                    {p.name}
                  </h4>
                  <p className="text-[10px] text-stone-500 italic truncate">
                    {p.species}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 5. DRAMATIC CLOSING SECTION (Inspired by reference site's #contact) */}
      {/* ============================================================ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 pt-6">
        <div className="space-y-4">
          <h2 className="text-[36px] sm:text-[68px] font-black leading-[0.94] tracking-tight text-forest-950 dark:text-emerald-50">
            Ready to step outside<br />
            <span className="text-forest-950/40 dark:text-emerald-100/40">
              and explore the wild?
            </span>
          </h2>
          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-400 max-w-lg mx-auto font-medium">
            Scan your first outdoor plant, earn Flora Coins, and grow your botanical knowledge with every discovery.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 rounded-[20px] bg-forest-950 dark:bg-emerald-400 pl-6 pr-2.5 py-2.5 text-white dark:text-forest-950 shadow-[0_16px_40px_rgba(6,78,59,0.18)] hover:-translate-y-0.5 active:translate-y-0 transition-all font-black text-sm sm:text-base cursor-pointer group"
          >
            <span>Scan Plant Now</span>
            <div className="w-10 h-10 rounded-[14px] bg-white/15 dark:bg-forest-950/15 text-white dark:text-forest-950 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5 text-emerald-300 dark:text-forest-950" />
            </div>
          </button>

          <Link
            to="/play"
            className="flex items-center gap-2.5 rounded-[20px] bg-stone-100 dark:bg-stone-800 border border-stone-200/90 dark:border-stone-700 px-6 py-3.5 text-forest-950 dark:text-emerald-100 font-bold text-sm sm:text-base shadow-2xs hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Outdoor Touch-Grass Quests</span>
          </Link>
        </div>
      </section>

    </div>
  );
};
