import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Upload,
  Sparkles,
  AlertCircle,
  X,
  Coins,
  RefreshCw,
  Sun,
  Droplets,
  Heart,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Sprout,
  Wind,
  Layers,
  Tag,
  BookOpen
} from 'lucide-react';
import { identifyPlant } from '../../ai/plantClassifier';
import { IdentificationResult } from '../../types';
import { useGarden } from '../../context/GardenContext';
import { cozyAudio } from '../../services/audioService';
import { fireConfetti } from '../../services/economyService';

interface AIScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlantUnlocked?: (speciesName: string) => void;
}

const CURATED_SPECIMENS = [
  {
    name: 'English Marigold',
    speciesKey: 'marigold',
    color: '#f59e0b',
    photoUrl: 'https://images.unsplash.com/photo-1599818817739-1662a5b6d910?w=600&q=80'
  },
  {
    name: 'Sunflower',
    speciesKey: 'sunflower',
    color: '#eab308',
    photoUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&q=80'
  },
  {
    name: 'Common Daisy',
    speciesKey: 'daisy',
    color: '#ffffff',
    photoUrl: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=600&q=80'
  },
  {
    name: 'Monstera',
    speciesKey: 'monstera',
    color: '#22c55e',
    photoUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80'
  }
];

export const AIScannerModal: React.FC<AIScannerModalProps> = ({ isOpen, onClose }) => {
  const { saveDiscovery } = useGarden();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [rewardGranted, setRewardGranted] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setImagePreview(b64);
      runClassification(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (specimen: typeof CURATED_SPECIMENS[0]) => {
    setImagePreview(specimen.photoUrl);
    runClassification(specimen.photoUrl, specimen.speciesKey);
  };

  const runClassification = async (imgSrc: string, hint?: string) => {
    setIsClassifying(true);
    setResult(null);
    setRewardGranted(false);

    try {
      const res = await identifyPlant(imgSrc, undefined, hint);
      setResult(res);

      if (res.confidenceTier !== 'uncertain' && res.topPrediction.botanicalInfo) {
        cozyAudio.playFanfare();
        fireConfetti();
        await saveDiscovery(res);
        setRewardGranted(true);
      }
    } catch (err: any) {
      console.warn('[AIScannerModal] Classification notice:', err);
      // Fallback with hint if provided
      if (hint) {
        const res = await identifyPlant(imgSrc, undefined, hint);
        setResult(res);
      }
    } finally {
      setIsClassifying(false);
    }
  };

  const handleManualSelect = (speciesKey: string) => {
    if (imagePreview) {
      runClassification(imagePreview, speciesKey);
    } else {
      const match = CURATED_SPECIMENS.find(s => s.speciesKey === speciesKey);
      if (match) handleSelectPreset(match);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-stone-900 rounded-3xl max-w-xl sm:max-w-2xl w-full max-h-[90dvh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-3.5 sm:space-y-4"
      >
        {/* Simple Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-forest-950 dark:text-emerald-50">Plant Scanner</h2>
              <p className="text-[11px] text-stone-500">Scan plants to discover care tips & earn coins.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Photo Upload or Preset */}
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-300" />
            <span>Upload or Snap Plant Photo</span>
          </button>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider text-center">
              Or test with a garden flower:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CURATED_SPECIMENS.map(spec => (
                <button
                  key={spec.name}
                  onClick={() => handleSelectPreset(spec)}
                  className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-left hover:bg-stone-100 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: spec.color }} />
                  <span className="text-xs font-bold text-forest-950 dark:text-emerald-100">{spec.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {isClassifying && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>Identifying your plant...</span>
          </div>
        )}

        {/* Comprehensive Result Card */}
        {result && (
          <div className="p-4 sm:p-5 rounded-2xl bg-forest-50/70 dark:bg-stone-900/90 border border-forest-200 dark:border-stone-800 space-y-4">
            
            {/* Header: Plant Name, Scientific Taxonomy & Badges */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                    Plant Identification
                  </span>
                  <div className="text-lg font-black text-forest-950 dark:text-emerald-100">
                    {result.topPrediction.label}
                  </div>
                  {result.topPrediction.botanicalInfo && (
                    <div className="text-xs text-stone-500 dark:text-stone-400 italic flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {result.topPrediction.botanicalInfo.scientificName}
                      </span>
                      <span>•</span>
                      <span>{result.topPrediction.botanicalInfo.family}</span>
                    </div>
                  )}
                </div>

                {result.topPrediction.botanicalInfo && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Difficulty Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${
                        result.topPrediction.botanicalInfo.difficulty === 'Beginner'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : result.topPrediction.botanicalInfo.difficulty === 'Intermediate'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          : 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                      }`}
                    >
                      {result.topPrediction.botanicalInfo.difficulty}
                    </span>

                    {/* Pet Safety Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border flex items-center gap-1 ${
                        result.topPrediction.botanicalInfo.petSafe
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {result.topPrediction.botanicalInfo.petSafe ? (
                        <>
                          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Pet Safe</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>Pet Caution</span>
                        </>
                      )}
                    </span>

                    {/* Native Region */}
                    {result.topPrediction.botanicalInfo.nativeRegion && (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{result.topPrediction.botanicalInfo.nativeRegion}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Common Names */}
              {result.topPrediction.botanicalInfo?.commonNames && result.topPrediction.botanicalInfo.commonNames.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-stone-400 uppercase text-[9px]">Also known as:</span>
                  {result.topPrediction.botanicalInfo.commonNames.map(name => (
                    <span key={name} className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 text-[10px]">
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Rich Botanical Features */}
            {result.topPrediction.botanicalInfo ? (
              <div className="space-y-3 pt-3 border-t border-forest-200/60 dark:border-stone-800 text-xs">
                
                {/* Botanical Narrative Description */}
                {result.topPrediction.botanicalInfo.description && (
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed bg-white/60 dark:bg-stone-800/40 p-3 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
                    {result.topPrediction.botanicalInfo.description}
                  </p>
                )}

                {/* Core Cultivation Grid (4 Feature Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Sunlight */}
                  <div className="p-3 rounded-xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 space-y-1 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                      <Sun className="w-4 h-4 shrink-0" />
                      <span className="uppercase text-[10px] tracking-wide">Sunlight Needs</span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-200 text-[11px] leading-snug">
                      {result.topPrediction.botanicalInfo.sunlight}
                    </p>
                  </div>

                  {/* Watering */}
                  <div className="p-3 rounded-xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 space-y-1 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                      <Droplets className="w-4 h-4 shrink-0" />
                      <span className="uppercase text-[10px] tracking-wide">Watering Cadence</span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-200 text-[11px] leading-snug">
                      {result.topPrediction.botanicalInfo.watering}
                    </p>
                  </div>

                  {/* Soil */}
                  <div className="p-3 rounded-xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 space-y-1 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                      <Layers className="w-4 h-4 shrink-0" />
                      <span className="uppercase text-[10px] tracking-wide">Soil & Substrate</span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-200 text-[11px] leading-snug">
                      {result.topPrediction.botanicalInfo.soil}
                    </p>
                  </div>

                  {/* Humidity */}
                  <div className="p-3 rounded-xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 space-y-1 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                      <Wind className="w-4 h-4 shrink-0" />
                      <span className="uppercase text-[10px] tracking-wide">Humidity & Climate</span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-200 text-[11px] leading-snug">
                      {result.topPrediction.botanicalInfo.humidity}
                    </p>
                  </div>
                </div>

                {/* Horticultural Characteristics: Propagation & Toxicity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-stone-100/90 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-stone-600 dark:text-stone-400 text-[10px] uppercase">
                      <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Propagation Method</span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-snug">
                      {result.topPrediction.botanicalInfo.propagation}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-100/90 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-stone-600 dark:text-stone-400 text-[10px] uppercase">
                      {result.topPrediction.botanicalInfo.petSafe ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      )}
                      <span>Safety & Toxicity</span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-snug">
                      {result.topPrediction.botanicalInfo.toxicity}
                    </p>
                  </div>
                </div>

                {/* Ecological Superpower */}
                {result.topPrediction.botanicalInfo.ecologicalFact && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-extrabold text-emerald-900 dark:text-emerald-200">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="uppercase text-[10px] tracking-wide">Ecological Synergy</span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                      {result.topPrediction.botanicalInfo.ecologicalFact}
                    </p>
                  </div>
                )}

                {/* Botanical Tags */}
                {result.topPrediction.botanicalInfo.tags && result.topPrediction.botanicalInfo.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <Tag className="w-3.5 h-3.5 text-stone-400" />
                    {result.topPrediction.botanicalInfo.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-forest-100/80 dark:bg-emerald-950/60 text-forest-800 dark:text-emerald-300 border border-forest-200/80 dark:border-emerald-800 text-[10px] font-bold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Reward Banner */}
                {rewardGranted && (
                  <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-400/40 flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Unlocked seeds & recorded in Botanical Field Journal! +25 Coins</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-amber-50 text-amber-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Pot detected! Select the plant species growing inside:</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {CURATED_SPECIMENS.map(spec => (
                    <button
                      key={spec.speciesKey}
                      onClick={() => handleManualSelect(spec.speciesKey)}
                      className="px-2.5 py-1.5 text-left rounded-lg bg-white dark:bg-stone-800 border border-amber-300 dark:border-stone-700 hover:border-emerald-500 text-xs font-semibold text-stone-800 dark:text-stone-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: spec.color }} />
                      <span>{spec.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

