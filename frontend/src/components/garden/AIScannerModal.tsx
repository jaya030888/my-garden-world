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
  AlertTriangle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { identifyPlant } from '../../ai/plantClassifier';
import { VERIFIED_BOTANICAL_SPECIES, POPULAR_CULTIVARS } from '../../ai/botanicalDatabase';
import { IdentificationResult } from '../../types';
import { useGarden } from '../../context/GardenContext';
import { cozyAudio } from '../../services/audioService';
import { fireConfetti } from '../../services/economyService';
import { BotanicalGuideFactSheet } from './BotanicalGuideFactSheet';

interface AIScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlantUnlocked?: (speciesName: string) => void;
}

const CURATED_SPECIMENS = [
  {
    name: 'Snake Plant',
    speciesKey: 'snake_plant',
    color: '#059669',
    photoUrl: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?w=600&q=80'
  },
  {
    name: 'Swiss Cheese Monstera',
    speciesKey: 'monstera',
    color: '#22c55e',
    photoUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80'
  },
  {
    name: 'Aloe Vera',
    speciesKey: 'aloe',
    color: '#10b981',
    photoUrl: 'https://images.unsplash.com/photo-1567689265664-1c48de61db0b?w=600&q=80'
  },
  {
    name: 'Fiddle Leaf Fig',
    speciesKey: 'ficus',
    color: '#15803d',
    photoUrl: 'https://images.unsplash.com/photo-1597055181300-e3633a917c9c?w=600&q=80'
  },
  {
    name: 'Common Daisy',
    speciesKey: 'daisy',
    color: '#ffffff',
    photoUrl: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=600&q=80'
  },
  {
    name: 'Golden Sunflower',
    speciesKey: 'sunflower',
    color: '#eab308',
    photoUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&q=80'
  },
  {
    name: 'English Marigold',
    speciesKey: 'marigold',
    color: '#f59e0b',
    photoUrl: 'https://images.unsplash.com/photo-1599818817739-1662a5b6d910?w=600&q=80'
  },
  {
    name: 'Golden Pothos',
    speciesKey: 'pothos',
    color: '#84cc16',
    photoUrl: 'https://images.unsplash.com/photo-1596724898399-53b47e24484b?w=600&q=80'
  }
];

export const AIScannerModal: React.FC<AIScannerModalProps> = ({ isOpen, onClose }) => {
  const { saveDiscovery, addPlantRecord } = useGarden();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [rewardGranted, setRewardGranted] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);

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
    setScanError(null);

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
      console.error('[AIScannerModal] Classification notice:', err);
      setScanError(err?.message || 'Could not process image. Please try again with a clear photo.');
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

  const handleRefineCultivar = (cultivarKey: string) => {
    const cultivar = VERIFIED_BOTANICAL_SPECIES[cultivarKey];
    if (!cultivar || !result) return;
    setResult({
      ...result,
      hasPlantDetected: true,
      topPrediction: {
        ...result.topPrediction,
        label: cultivar.speciesName,
        isVerifiedSpecies: true,
        botanicalInfo: cultivar,
        statusExplanation: `Calibrated to verified cultivar: ${cultivar.speciesName} (${cultivar.scientificName}). Care parameters active.`
      }
    });
  };

  const handleSaveToPlants = async () => {
    if (!result || !result.topPrediction.botanicalInfo) return;
    const botanical = result.topPrediction.botanicalInfo;
    await addPlantRecord({
      name: botanical.speciesName,
      species: botanical.scientificName,
      scientificName: botanical.scientificName,
      family: botanical.family,
      acquiredDate: new Date().toISOString(),
      primaryPhotoUrl: result.imageUrl,
      location: 'indoor',
      sunlightNeeds: 'indirect_bright',
      waterFrequencyDays: 7,
      notes: `Identified via on-device Vision AI (${result.modelName}) with ${(result.topPrediction.score * 100).toFixed(1)}% confidence.`
    });
    setRewardGranted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full max-h-[92dvh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4 my-auto"
      >
        {/* Simple Header */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-forest-950 dark:text-emerald-50">On-Device Botanical Scanner</h2>
              <p className="text-[11px] text-stone-500">Scan plants to discover taxonomy, ASPCA safety & care guides.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg cursor-pointer">
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
              Or test instant analysis with verified specimens:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CURATED_SPECIMENS.map(spec => (
                <button
                  key={spec.name}
                  onClick={() => handleSelectPreset(spec)}
                  className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-left hover:bg-stone-100 dark:hover:bg-stone-700/60 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: spec.color }} />
                  <span className="text-xs font-bold text-forest-950 dark:text-emerald-100 truncate">{spec.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {isClassifying && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Analyzing botanical characteristics with on-device Vision Transformer...</span>
          </div>
        )}

        {/* Error State */}
        {scanError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{scanError}</span>
          </div>
        )}

        {/* Result Presentation */}
        {result && (
          <div className="space-y-4">
            {result.hasPlantDetected && result.topPrediction.botanicalInfo ? (
              <div className="space-y-3">
                {/* 1-Tap Cultivar Refinement Strip */}
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-forest-900 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      1-Tap Species Refinement / Match Cultivar:
                    </span>
                    <span className="text-[10px] text-stone-400">Calibrate care guide</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_CULTIVARS.map(cult => {
                      const isSelected = result.topPrediction.botanicalInfo?.speciesName === cult.name;
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
                  botanicalInfo={result.topPrediction.botanicalInfo}
                  prediction={result.topPrediction}
                  imageUrl={result.imageUrl}
                  isSaved={rewardGranted}
                  onSaveToCollection={handleSaveToPlants}
                />
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-3 text-xs text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-rose-950 dark:text-rose-100 text-sm">
                    No Plant Detected
                  </h4>
                  <p className="text-rose-800 dark:text-rose-300 leading-relaxed max-w-md mx-auto">
                    We could not detect any plant in this picture (detected: <span className="font-semibold">"{result.topPrediction.label}"</span>). Please upload a clear photo of living foliage, or tap any cultivar below to explore its verified care guide.
                  </p>
                </div>
                <div className="pt-2 border-t border-rose-200 dark:border-rose-800 space-y-2">
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
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};


