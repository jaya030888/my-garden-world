import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Sun,
  ShieldCheck,
  ShieldAlert,
  Leaf,
  BookmarkPlus,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { identifyPlant, ModelLoadingProgress } from '../ai/plantClassifier';
import { IdentificationResult } from '../types';
import { useGarden } from '../context/GardenContext';

const SAMPLE_TEST_IMAGES = [
  {
    name: 'English Daisy',
    url: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=600&q=80',
    type: 'Flower'
  },
  {
    name: 'Monstera Pot',
    url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80',
    type: 'Houseplant'
  },
  {
    name: 'Wild Rosehip',
    url: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=600&q=80',
    type: 'Wild Shrub'
  },
  {
    name: 'Golden Sunflower',
    url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&q=80',
    type: 'Annual'
  }
];

export const DiscoverPage: React.FC = () => {
  const { saveDiscovery, addPlantRecord } = useGarden();

  const [loadingState, setLoadingState] = useState<ModelLoadingProgress>({ status: 'idle' });
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isAddedToPlants, setIsAddedToPlants] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelected = async (fileOrUrl: File | string) => {
    setErrorMsg(null);
    setResult(null);
    setIsSaved(false);
    setIsAddedToPlants(false);

    try {
      setLoadingState({ status: 'downloading', message: 'Initializing Vision Transformer...' });
      const identification = await identifyPlant(fileOrUrl, progress => {
        setLoadingState(progress);
      });
      setResult(identification);
      setLoadingState({ status: 'ready', message: 'Inference complete' });
    } catch (err: any) {
      console.error('[DiscoverPage] Classification error:', err);
      setErrorMsg(err?.message || 'Could not process the image. Please verify file format.');
      setLoadingState({ status: 'error', message: 'Error during inference' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
        return;
      }
      handleImageSelected(file);
    }
  };

  const handleSaveDiscovery = async () => {
    if (!result || isSaved) return;
    await saveDiscovery(result);
    setIsSaved(true);
  };

  const handleAddToMyPlants = async () => {
    if (!result || isAddedToPlants) return;
    const botanical = result.topPrediction.botanicalInfo;
    await addPlantRecord({
      name: botanical?.speciesName || result.topPrediction.label,
      species: botanical?.speciesName || result.topPrediction.label,
      scientificName: botanical?.scientificName,
      family: botanical?.family,
      acquiredDate: new Date().toISOString(),
      primaryPhotoUrl: result.imageUrl,
      location: 'indoor',
      sunlightNeeds: 'indirect_bright',
      waterFrequencyDays: 7,
      notes: `Identified via Open AI Vision (${result.modelName}) with ${(result.topPrediction.score * 100).toFixed(1)}% confidence.`
    });
    setIsAddedToPlants(true);
  };

  const topBotanical = result?.topPrediction.botanicalInfo;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 pb-28 md:pb-16 space-y-6 sm:space-y-8">
      
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 border border-forest-200 text-forest-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-forest-600" />
          Open-Weight Computer Vision (ViT-Base ONNX)
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-forest-950">
          Plant Explorer
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm">
          Snap or upload any plant, flower, or wild botanical specimen. Run 100% private, on-device neural inference.
        </p>
      </div>

      {/* Input Selection Card */}
      <div className="glass-panel p-4 sm:p-8 rounded-3xl shadow-sm border border-forest-100 text-center space-y-5 sm:space-y-6">
        
        {/* Sample Images Quick Bar */}
        <div>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2.5 sm:mb-3">
            Or test with verified sample flora:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {SAMPLE_TEST_IMAGES.map(sample => (
              <button
                key={sample.name}
                onClick={() => handleImageSelected(sample.url)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-forest-50/90 hover:bg-forest-100 text-forest-900 border border-forest-200/80 text-xs font-medium transition-all hover:scale-105 shadow-2xs"
              >
                <img src={sample.url} alt={sample.name} className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover" />
                <span>{sample.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upload & Camera Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-forest-800/20 transition-all hover:-translate-y-0.5"
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
            Upload Photograph
          </button>

          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 rounded-2xl bg-white hover:bg-forest-50 text-forest-800 font-semibold text-xs sm:text-sm border-2 border-forest-300 transition-all hover:-translate-y-0.5"
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-forest-600" />
            Take Photo
          </button>

        </div>

      </div>

      {/* Loading Progress State */}
      {(loadingState.status === 'downloading' || loadingState.status === 'loading') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-5 sm:p-6 rounded-3xl border border-emerald-300 text-center space-y-3 sm:space-y-4 shadow-md animate-shimmer"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto text-emerald-700">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-forest-950 text-sm sm:text-base">
              {loadingState.message || 'Processing on-device neural inference...'}
            </h3>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
              Running Vision Transformer (ViT-Base) in browser WebAssembly
            </p>
          </div>
          {loadingState.progress !== undefined && (
            <div className="max-w-xs mx-auto">
              <div className="h-2 bg-forest-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${loadingState.progress}%` }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-xs sm:text-sm">Identification Error</p>
            <p className="text-xs text-rose-700">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Results View */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Main Identification Banner Card */}
          <div className="glass-panel rounded-3xl p-4 sm:p-8 border border-forest-200 shadow-md">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start">
              
              {/* Left: Captured Photograph */}
              <div className="md:col-span-4 relative rounded-2xl overflow-hidden border border-forest-100 shadow-sm bg-stone-100 aspect-square max-h-[300px] md:max-h-none mx-auto w-full">
                <img
                  src={result.imageUrl}
                  alt="Scanned botanical"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-forest-950/75 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] text-white flex items-center justify-between">
                  <span>Latency: {result.inferenceTimeMs.toFixed(1)}ms</span>
                  <span className="text-emerald-300 font-medium">On-Device ViT</span>
                </div>
              </div>

              {/* Right: Primary Prediction Details */}
              <div className="md:col-span-8 space-y-3 sm:space-y-4">
                
                {/* Confidence Tier Tag */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {result.confidenceTier === 'high' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      High Confidence ({(result.topPrediction.score * 100).toFixed(1)}%)
                    </span>
                  )}
                  {result.confidenceTier === 'moderate' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Moderate Match ({(result.topPrediction.score * 100).toFixed(1)}%)
                    </span>
                  )}
                  {result.confidenceTier === 'uncertain' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold border border-stone-300">
                      <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
                      Uncertain Match ({(result.topPrediction.score * 100).toFixed(1)}%)
                    </span>
                  )}

                  <span className="text-[11px] text-stone-500 font-mono">
                    Model: {result.modelName.split('/')[1] || result.modelName}
                  </span>
                </div>

                {/* Primary Species Title */}
                <div>
                  <h2 className="text-xl sm:text-3xl font-extrabold font-display text-forest-950">
                    {topBotanical?.speciesName || result.topPrediction.label}
                  </h2>
                  <p className="text-xs sm:text-sm text-forest-700 font-mono italic">
                    {topBotanical?.scientificName || 'Botanical Specimen'} • {topBotanical?.family}
                  </p>
                </div>

                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
                  {topBotanical?.description}
                </p>

                {/* Confidence Bar Meter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-stone-600">
                    <span>Neural Match Probability</span>
                    <span>{(result.topPrediction.score * 100).toFixed(2)}%</span>
                  </div>
                  <div className="h-2 sm:h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        result.confidenceTier === 'high'
                          ? 'bg-emerald-500'
                          : result.confidenceTier === 'moderate'
                          ? 'bg-amber-500'
                          : 'bg-stone-400'
                      }`}
                      style={{ width: `${Math.min(100, result.topPrediction.score * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons: Save Discovery & Add to My Plants */}
                <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-2">
                  <button
                    onClick={handleSaveDiscovery}
                    disabled={isSaved}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                      isSaved
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                        : 'bg-gradient-to-r from-forest-700 to-forest-800 hover:from-forest-800 hover:to-forest-900 text-white shadow-forest-800/20'
                    }`}
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    {isSaved ? 'Saved to Discoveries (+20 Coins)' : 'Save Discovery (+20 Coins, +25 XP)'}
                  </button>

                  <button
                    onClick={handleAddToMyPlants}
                    disabled={isAddedToPlants}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs border transition-all ${
                      isAddedToPlants
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 cursor-default'
                        : 'bg-white hover:bg-forest-50 text-forest-800 border-forest-300'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-forest-600" />
                    {isAddedToPlants ? 'Added to My Plants!' : 'Add to My Plants'}
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* Botanical Profile & Care Guidance Grid */}
          {topBotanical && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
              
              {/* Sunlight & Water Card */}
              <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-forest-100 space-y-2.5 sm:space-y-3">
                <div className="flex items-center gap-2 text-forest-800 font-bold text-xs sm:text-sm">
                  <Sun className="w-4 h-4 text-amber-500" />
                  Sunlight & Hydration
                </div>
                <div className="space-y-2 text-xs text-stone-700">
                  <div>
                    <span className="font-semibold text-forest-900 block">Light:</span>
                    <span>{topBotanical.sunlight}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-forest-900 block">Watering:</span>
                    <span>{topBotanical.watering}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-forest-900 block">Soil & Humidity:</span>
                    <span>{topBotanical.soil} • {topBotanical.humidity}</span>
                  </div>
                </div>
              </div>

              {/* Safety & Care Difficulty */}
              <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-forest-100 space-y-2.5 sm:space-y-3">
                <div className="flex items-center gap-2 text-forest-800 font-bold text-xs sm:text-sm">
                  {topBotanical.petSafe ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                  )}
                  Toxicity & Difficulty
                </div>
                <div className="space-y-2 text-xs text-stone-700">
                  <div>
                    <span className="font-semibold text-forest-900 block">Pet Safety:</span>
                    <span className={topBotanical.petSafe ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
                      {topBotanical.petSafe ? 'Non-toxic & pet-safe' : 'Mildly toxic / keep away from pets'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-forest-900 block">Care Level:</span>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-forest-100 text-forest-800 font-semibold text-[11px] mt-0.5">
                      {topBotanical.difficulty}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-forest-900 block">Propagation:</span>
                    <span>{topBotanical.propagation}</span>
                  </div>
                </div>
              </div>

              {/* Ecology & Wild Fact */}
              <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-forest-100 space-y-2.5 sm:space-y-3 sm:col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 text-forest-800 font-bold text-xs sm:text-sm">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  Ecological Significance
                </div>
                <p className="text-xs text-stone-700 leading-relaxed italic">
                  "{topBotanical.ecologicalFact}"
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {topBotanical.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Alternative Model Predictions */}
          {result.alternativePredictions.length > 0 && (
            <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-forest-100 space-y-3">
              <h4 className="text-xs font-bold text-forest-900 uppercase tracking-wider">
                Alternative Neural Predictions (Top 5 Classes)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {result.alternativePredictions.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 sm:p-3 rounded-2xl bg-white/70 border border-stone-200 text-left flex flex-col justify-between text-xs min-w-0"
                  >
                    <div className="truncate">
                      <span className="font-semibold text-stone-800 block capitalize truncate">
                        {alt.label.split(',')[0]}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-stone-500 font-mono truncate block">
                        {alt.botanicalInfo?.speciesName || 'Botanical'}
                      </span>
                    </div>
                    <span className="font-mono text-stone-600 font-bold bg-stone-100 px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] self-start mt-2">
                      {(alt.score * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      )}

    </div>
  );
};
