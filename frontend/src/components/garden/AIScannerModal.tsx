import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  Sparkles,
  Check,
  AlertCircle,
  X,
  BookOpen,
  Coins,
  ShieldCheck,
  Sun,
  Droplets,
  Info,
  RefreshCw
} from 'lucide-react';
import { identifyPlantImage } from '../../ai/plantClassifier';
import { IdentificationResult } from '../../types';
import { useGarden } from '../../context/GardenContext';
import { cozyAudio } from '../../services/audioService';
import { fireConfetti } from '../../services/economyService';

interface AIScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlantUnlocked?: (speciesName: string) => void;
}

// Curated authentic botanical specimens for testing
const CURATED_SPECIMENS = [
  {
    name: 'English Marigold',
    species: 'Calendula officinalis',
    color: '#f59e0b',
    sampleLabel: 'English Marigold',
    photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="224" height="224" viewBox="0 0 224 224"><rect width="224" height="224" fill="%232e7d32"/><circle cx="112" cy="112" r="60" fill="%23ea580c"/><circle cx="112" cy="112" r="45" fill="%23f97316"/><circle cx="112" cy="112" r="30" fill="%23f59e0b"/><circle cx="112" cy="112" r="15" fill="%23fbbf24"/></svg>'
  },
  {
    name: 'Common Sunflower',
    species: 'Helianthus annuus',
    color: '#eab308',
    sampleLabel: 'Sunflower',
    photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="224" height="224" viewBox="0 0 224 224"><rect width="224" height="224" fill="%231b4d2e"/><circle cx="112" cy="112" r="70" fill="%23facc15"/><circle cx="112" cy="112" r="40" fill="%2378350f"/></svg>'
  },
  {
    name: 'Common Daisy',
    species: 'Bellis perennis',
    color: '#ffffff',
    sampleLabel: 'Daisy',
    photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="224" height="224" viewBox="0 0 224 224"><rect width="224" height="224" fill="%2315803d"/><circle cx="112" cy="112" r="65" fill="%23ffffff"/><circle cx="112" cy="112" r="28" fill="%23facc15"/></svg>'
  },
  {
    name: 'Swiss Cheese Plant',
    species: 'Monstera deliciosa',
    color: '#22c55e',
    sampleLabel: 'Monstera',
    photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="224" height="224" viewBox="0 0 224 224"><rect width="224" height="224" fill="%23052e16"/><path d="M112 40C70 40 40 80 40 130C40 180 90 190 112 180C134 190 184 180 184 130C184 80 154 40 112 40Z" fill="%2322c55e"/></svg>'
  }
];

export const AIScannerModal: React.FC<AIScannerModalProps> = ({ isOpen, onClose }) => {
  const { saveDiscovery, buyItem } = useGarden();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    setErrorMessage(null);
    setResult(null);
    setRewardGranted(false);

    try {
      // Create HTMLImageElement for client/server AI classification
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imgSrc;
      await new Promise(resolve => { img.onload = resolve; });

      const res = await identifyPlantImage(img);
      setResult(res);

      if (res.confidenceTier !== 'uncertain' && res.botanicalInfo) {
        cozyAudio.playFanfare();
        fireConfetti();
        await saveDiscovery(res);
        setRewardGranted(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Classification failed');
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
        className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-forest-950 dark:text-emerald-100">AI Botanical Plant Scanner</h2>
              <p className="text-xs text-stone-500">Scan wild outdoor plants or test specimens to unlock virtual seeds.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview & Upload Zone */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-48 h-48 rounded-2xl bg-stone-100 dark:bg-stone-800 border-2 border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-center overflow-hidden relative">
              {imagePreview ? (
                <img src={imagePreview} alt="Specimen Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4 space-y-2 text-stone-400">
                  <Camera className="w-8 h-8 mx-auto text-stone-400" />
                  <div className="text-xs font-bold">No Image Selected</div>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2.5 w-full">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <Upload className="w-4 h-4 text-emerald-300" />
                <span>Upload Plant Photo</span>
              </button>

              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider text-center">
                Or select botanical specimen:
              </div>

              <div className="grid grid-cols-2 gap-2">
                {CURATED_SPECIMENS.map(spec => (
                  <button
                    key={spec.name}
                    onClick={() => handleSelectPreset(spec)}
                    className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-left hover:bg-stone-100 transition-all flex items-center gap-2"
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: spec.color }} />
                    <span className="text-xs font-extrabold text-forest-950 dark:text-emerald-100 truncate">{spec.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Classification State Loading */}
        {isClassifying && (
          <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Analyzing botanical morphology with open-weight vision model...</span>
          </div>
        )}

        {/* Classification Result Display */}
        {result && (
          <div className="p-5 rounded-3xl bg-forest-50/50 dark:bg-forest-950/40 border border-forest-200 dark:border-forest-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">AI Identification Result</div>
                <div className="text-base font-extrabold text-forest-950 dark:text-emerald-100">
                  {result.topLabel}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                result.confidenceTier === 'high' ? 'bg-emerald-100 text-emerald-800' :
                result.confidenceTier === 'moderate' ? 'bg-amber-100 text-amber-800' :
                'bg-rose-100 text-rose-800'
              }`}>
                {result.confidenceTier.toUpperCase()} ({Math.round(result.topScore * 100)}%)
              </div>
            </div>

            {/* Botanical Taxonomy Fact Sheet */}
            {result.botanicalInfo ? (
              <div className="space-y-3 pt-2 border-t border-forest-200/60 dark:border-forest-800 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-stone-500 font-medium">Scientific Name:</span>
                    <div className="font-extrabold text-forest-900 dark:text-emerald-200 italic">
                      {result.botanicalInfo.scientificName}
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium">Family:</span>
                    <div className="font-extrabold text-forest-900 dark:text-emerald-200">
                      {result.botanicalInfo.family}
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium">Sunlight:</span>
                    <div className="font-bold text-forest-900 dark:text-emerald-200">
                      {result.botanicalInfo.sunlight}
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium">Watering:</span>
                    <div className="font-bold text-forest-900 dark:text-emerald-200">
                      {result.botanicalInfo.watering}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">Ecological Benefit: </span>
                  <span className="text-stone-600 dark:text-stone-300">{result.botanicalInfo.ecologicalFact}</span>
                </div>

                {rewardGranted && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Discovery Unlocked! Virtual seeds added to inventory.</span>
                    </div>
                    <span className="text-amber-600 dark:text-amber-400 font-extrabold">+25 Coins</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Uncertain or Container Object Detected</span>
                </div>
                <p className="text-stone-600 dark:text-stone-400">
                  The model detected non-plant features or an unverified species. Please capture a close-up photo of the flower or foliage in natural light.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
