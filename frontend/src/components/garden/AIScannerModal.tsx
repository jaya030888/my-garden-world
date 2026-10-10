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
  Heart
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
    color: '#f59e0b',
    photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="224" height="224" viewBox="0 0 224 224"><rect width="224" height="224" fill="%232e7d32"/><circle cx="112" cy="112" r="60" fill="%23ea580c"/><circle cx="112" cy="112" r="45" fill="%23f97316"/><circle cx="112" cy="112" r="30" fill="%23f59e0b"/><circle cx="112" cy="112" r="15" fill="%23fbbf24"/></svg>'
  },
  {
    name: 'Sunflower',
    color: '#eab308',
    photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="224" height="224" viewBox="0 0 224 224"><rect width="224" height="224" fill="%231b4d2e"/><circle cx="112" cy="112" r="70" fill="%23facc15"/><circle cx="112" cy="112" r="40" fill="%2378350f"/></svg>'
  },
  {
    name: 'Common Daisy',
    color: '#ffffff',
    photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="224" height="224" viewBox="0 0 224 224"><rect width="224" height="224" fill="%2315803d"/><circle cx="112" cy="112" r="65" fill="%23ffffff"/><circle cx="112" cy="112" r="28" fill="%23facc15"/></svg>'
  },
  {
    name: 'Monstera',
    color: '#22c55e',
    photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="224" height="224" viewBox="0 0 224 224"><rect width="224" height="224" fill="%23052e16"/><path d="M112 40C70 40 40 80 40 130C40 180 90 190 112 180C134 190 184 180 184 130C184 80 154 40 112 40Z" fill="%2322c55e"/></svg>'
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
    runClassification(specimen.photoUrl);
  };

  const runClassification = async (imgSrc: string) => {
    setIsClassifying(true);
    setResult(null);
    setRewardGranted(false);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imgSrc;
      await new Promise(resolve => { img.onload = resolve; });

      const res = await identifyPlant(img);
      setResult(res);

      if (res.confidenceTier !== 'uncertain' && res.topPrediction.botanicalInfo) {
        cozyAudio.playFanfare();
        fireConfetti();
        await saveDiscovery(res);
        setRewardGranted(true);
      }
    } catch (err: any) {
      // Fallback
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full max-h-[88vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4"
      >
        {/* Simple Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
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
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
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

        {/* Simple Result Card */}
        {result && (
          <div className="p-4 rounded-2xl bg-forest-50/60 dark:bg-forest-950/40 border border-forest-200 dark:border-forest-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase">Plant Name</span>
                <div className="text-sm font-extrabold text-forest-950 dark:text-emerald-100">
                  {result.topPrediction.label}
                </div>
              </div>
              {result.topPrediction.botanicalInfo?.scientificName && (
                <span className="text-xs text-stone-500 italic">
                  {result.topPrediction.botanicalInfo.scientificName}
                </span>
              )}
            </div>

            {/* Care Details */}
            {result.topPrediction.botanicalInfo ? (
              <div className="space-y-2 text-xs pt-2 border-t border-forest-200/60 dark:border-forest-800">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>{result.topPrediction.botanicalInfo.sunlight}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" />
                    <span>{result.topPrediction.botanicalInfo.watering}</span>
                  </div>
                </div>

                {rewardGranted && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Saved to journal! +25 Coins awarded</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Could not confirm species. Try a clearer photo in sunlight!</span>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
