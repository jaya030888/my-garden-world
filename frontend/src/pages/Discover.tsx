import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Leaf,
  BookmarkPlus,
  PlusCircle,
  HelpCircle,
  Info,
  Edit3,
  Droplets,
  Layers,
  Wind,
  Globe,
  Sprout,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { identifyPlant, ModelLoadingProgress } from '../ai/plantClassifier';
import { VERIFIED_BOTANICAL_SPECIES, POPULAR_CULTIVARS } from '../ai/botanicalDatabase';
import { IdentificationResult } from '../types';
import { useGarden } from '../context/GardenContext';
import { BotanicalGuideFactSheet } from '../components/garden/BotanicalGuideFactSheet';

const SAMPLE_TEST_IMAGES = [
  {
    name: 'French Marigold',
    url: 'https://images.unsplash.com/photo-1599818817739-1662a5b6d910?w=600&q=80',
    type: 'Flower'
  },
  {
    name: 'English Daisy',
    url: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=600&q=80',
    type: 'Wildflower'
  },
  {
    name: 'Golden Sunflower',
    url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&q=80',
    type: 'Annual'
  },
  {
    name: 'Wild Rosehip',
    url: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=600&q=80',
    type: 'Wild Shrub'
  },
  {
    name: 'Monstera Pot',
    url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80',
    type: 'Container Plant'
  }
];

export const DiscoverPage: React.FC = () => {
  const { discoveries, saveDiscovery, addPlantRecord } = useGarden();

  const [activeTab, setActiveTab] = useState<'scanner' | 'history'>('scanner');
  const [loadingState, setLoadingState] = useState<ModelLoadingProgress>({ status: 'idle' });
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isAddedToPlants, setIsAddedToPlants] = useState(false);
  const [customPlantName, setCustomPlantName] = useState('');
  const [isEditingCustomName, setIsEditingCustomName] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelected = async (fileOrUrl: File | string) => {
    setErrorMsg(null);
    setResult(null);
    setIsSaved(false);
    setIsAddedToPlants(false);
    setCustomPlantName('');
    setIsEditingCustomName(false);
    setActiveTab('scanner');

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

  const handleSelectCultivar = (cultivarKey: string) => {
    const cultivar = VERIFIED_BOTANICAL_SPECIES[cultivarKey];
    if (!cultivar || !result) return;
    setCustomPlantName(cultivar.speciesName);
    setResult({
      ...result,
      hasPlantDetected: true,
      topPrediction: {
        ...result.topPrediction,
        label: cultivar.speciesName,
        isVerifiedSpecies: true,
        botanicalInfo: cultivar,
        statusExplanation: `Calibrated to verified cultivar: ${cultivar.speciesName} (${cultivar.scientificName}). Care parameters and ASPCA data active.`
      }
    });
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
    const finalResult: IdentificationResult = {
      ...result,
      userAssignedSpecies: customPlantName || undefined,
      notes: customPlantName ? `User assigned label: ${customPlantName}` : undefined
    };
    await saveDiscovery(finalResult);
    setIsSaved(true);
  };

  const handleAddToMyPlants = async () => {
    if (!result || isAddedToPlants) return;
    const botanical = result.topPrediction.botanicalInfo;
    const plantName = customPlantName || botanical?.speciesName || result.topPrediction.label;
    const speciesName = customPlantName || botanical?.scientificName || 'Unspecified Cultivar';

    await addPlantRecord({
      name: plantName,
      species: speciesName,
      scientificName: botanical?.scientificName || (customPlantName ? customPlantName : undefined),
      family: botanical?.family,
      acquiredDate: new Date().toISOString(),
      primaryPhotoUrl: result.imageUrl,
      location: 'indoor',
      sunlightNeeds: 'indirect_bright',
      waterFrequencyDays: 7,
      notes: result.topPrediction.isVerifiedSpecies
        ? `Identified via Open AI Vision (${result.modelName}) with ${(result.topPrediction.score * 100).toFixed(1)}% confidence.`
        : `Custom plant record created from scan. Model raw output: ${result.topPrediction.label} (${(result.topPrediction.score * 100).toFixed(1)}%).`
    });
    setIsAddedToPlants(true);
  };

  const topBotanical = result?.topPrediction.botanicalInfo;
  const isVerified = result?.topPrediction.isVerifiedSpecies;
  const isContainerObject = result?.topPrediction.detectionType === 'container_object';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      
      {/* Spacious Header with Clean Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100/80 border border-forest-200 text-forest-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-forest-600" />
            <span>Open-Weight Vision AI</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-forest-950">
            Botanical Plant Explorer
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm">
            Scan plants with on-device neural vision inference and verified botanical taxonomy.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-forest-50/80 border border-forest-100/80 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'scanner'
                ? 'bg-forest-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-forest-900 hover:bg-forest-100/60'
            }`}
          >
            Scanner & AI
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-forest-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-forest-900 hover:bg-forest-100/60'
            }`}
          >
            Saved Discoveries ({discoveries.length})
          </button>
        </div>
      </div>

      {activeTab === 'scanner' ? (
        <div className="space-y-8">
          
          {/* Main Upload Dropzone */}
          <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-forest-100/80 shadow-xs space-y-6 text-center">
            
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-forest-100/80 flex items-center justify-center text-forest-700">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-forest-950">Select a Plant to Identify</h3>
                <p className="text-xs text-stone-500 mt-1">Upload a photo or choose from sample specimens</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs shadow-xs transition-all hover:scale-102"
                >
                  <Upload className="w-4 h-4 text-emerald-300" />
                  <span>Upload Image</span>
                </button>

                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-forest-50 hover:bg-forest-100 text-forest-900 border border-forest-200/80 font-bold text-xs transition-all hover:scale-102"
                >
                  <Camera className="w-4 h-4 text-forest-600" />
                  <span>Use Camera</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Quick Sample Picks */}
            <div className="pt-4 border-t border-forest-100/80">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-3">
                Or quick test with verified samples:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {SAMPLE_TEST_IMAGES.map(sample => (
                  <button
                    key={sample.name}
                    onClick={() => handleImageSelected(sample.url)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-forest-50 border border-forest-100/80 text-forest-900 text-xs font-semibold transition-all hover:scale-102 shadow-2xs"
                  >
                    <img src={sample.url} alt={sample.name} className="w-5 h-5 rounded-lg object-cover" />
                    <span>{sample.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Loading Indicator */}
          {loadingState.status === 'downloading' && (
            <div className="p-8 rounded-3xl bg-forest-50/80 border border-forest-100/80 text-center space-y-3">
              <div className="w-8 h-8 mx-auto border-3 border-forest-700 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-forest-900">{loadingState.message}</p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Honest Result Card */}
          {result && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-forest-100/80 shadow-xs space-y-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                
                {/* Image Preview */}
                <div className="w-full md:w-60 h-60 rounded-2xl overflow-hidden border border-forest-100/80 shrink-0 bg-stone-100">
                  <img src={result.imageUrl} alt="Scan Result" className="w-full h-full object-cover" />
                </div>

                {/* Identification Details */}
                <div className="flex-1 space-y-4 w-full">
                  
                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {result.hasPlantDetected ? (
                      isContainerObject ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Potted Plant Specimen ({result.confidenceTier.toUpperCase()})
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Verified Botanical Match ({result.confidenceTier.toUpperCase()})
                        </span>
                      )
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        No Plant Detected
                      </span>
                    )}

                    <span className="text-stone-400 text-xs font-mono">
                      {result.inferenceTimeMs.toFixed(0)} ms • {result.modelName.split('/').pop()}
                    </span>
                  </div>

                  {/* Title & Scientific Taxonomy */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold font-display text-forest-950 dark:text-emerald-50">
                      {customPlantName || (result.hasPlantDetected ? (topBotanical?.speciesName || result.topPrediction.label) : 'No Plant Detected')}
                    </h2>
                    {result.hasPlantDetected && topBotanical?.scientificName ? (
                      <p className="text-xs text-stone-500 italic mt-0.5">
                        {topBotanical.scientificName} • {topBotanical.family}
                      </p>
                    ) : (
                      <p className="text-xs text-stone-500 font-medium mt-0.5">
                        Model Output: <span className="font-mono">{result.topPrediction.label}</span> ({(result.topPrediction.score * 100).toFixed(1)}% confidence)
                      </p>
                    )}
                  </div>

                  {/* 1-Tap Cultivar Refinement Bar */}
                  <div className="p-3.5 rounded-2xl bg-forest-50/80 dark:bg-stone-800/80 border border-forest-100/80 dark:border-stone-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-forest-900 dark:text-emerald-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        1-Tap Cultivar Refinement / Pick Exact Species:
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">Instant Care Guide</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_CULTIVARS.map(cult => {
                        const isSelected = customPlantName === cult.name || (!customPlantName && topBotanical?.speciesName === cult.name);
                        return (
                          <button
                            key={cult.key}
                            onClick={() => handleSelectCultivar(cult.key)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-forest-900 dark:bg-emerald-500 text-white dark:text-forest-950 shadow-xs scale-102 font-bold'
                                : 'bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-emerald-500'
                            }`}
                          >
                            <span>{cult.icon}</span>
                            <span>{cult.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation / Botanical Description */}
                  {result.hasPlantDetected && topBotanical?.description ? (
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {topBotanical.description}
                    </p>
                  ) : !result.hasPlantDetected ? (
                    <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-950 dark:text-rose-200 space-y-2">
                      <p className="leading-relaxed font-semibold">
                        No plant detected in this photo.
                      </p>
                      <p className="text-[11px] text-stone-600 dark:text-stone-300">
                        {result.topPrediction.statusExplanation ||
                          `The vision model classified "${result.topPrediction.label}", which is not a plant species. Please upload a clear photo of living plant leaves or tap a cultivar above to explore its care guide directly.`}
                      </p>
                    </div>
                  ) : null}

                  {/* Comprehensive Botanical Fact Sheet */}
                  {result.hasPlantDetected && topBotanical && (
                    <div className="pt-2">
                      <BotanicalGuideFactSheet
                        botanicalInfo={topBotanical}
                        prediction={result.topPrediction}
                        imageUrl={result.imageUrl}
                        isSaved={isAddedToPlants}
                        onSaveToCollection={handleAddToMyPlants}
                      />
                    </div>
                  )}

                  {/* Manual Label Editor for Unconfirmed / Container Detections */}
                  {(!isVerified || isEditingCustomName) && (
                    <div className="p-3.5 rounded-2xl bg-forest-50/60 border border-forest-100/80 space-y-2 text-xs">
                      <label className="font-bold text-forest-900 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-forest-600" />
                        Specify Custom Plant / Cultivar Name:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. French Marigold (Tagetes patula)"
                        value={customPlantName}
                        onChange={e => setCustomPlantName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={handleSaveDiscovery}
                      disabled={isSaved}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isSaved
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-forest-800 hover:bg-forest-900 text-white shadow-xs'
                      }`}
                    >
                      <BookmarkPlus className="w-4 h-4 text-emerald-300" />
                      <span>{isSaved ? 'Saved to Discoveries' : isVerified ? 'Save Discovery' : 'Save as Nature Log'}</span>
                    </button>

                    <button
                      onClick={handleAddToMyPlants}
                      disabled={isAddedToPlants}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isAddedToPlants
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-forest-50 hover:bg-forest-100 text-forest-900 border border-forest-200/80'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4 text-forest-600" />
                      <span>{isAddedToPlants ? 'Added to My Plants' : 'Add to My Plants Collection'}</span>
                    </button>

                    {isVerified && !isEditingCustomName && (
                      <button
                        onClick={() => setIsEditingCustomName(true)}
                        className="px-3.5 py-2.5 text-stone-500 hover:text-forest-900 text-xs font-semibold"
                      >
                        Edit Label
                      </button>
                    )}
                  </div>

                  {/* Alternative Candidate Predictions */}
                  {result.alternativePredictions.length > 0 && (
                    <div className="pt-3 border-t border-forest-100/60 text-xs space-y-1.5">
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                        Alternative Model Candidates:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {result.alternativePredictions.map((alt, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200/80 text-[11px] text-stone-600"
                          >
                            {alt.label} ({(alt.score * 100).toFixed(1)}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          )}

        </div>
      ) : (
        /* Saved Discoveries Catalog */
        <div className="space-y-6">
          {discoveries.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500 bg-forest-50/50 rounded-3xl border border-dashed border-forest-200 space-y-3">
              <p className="text-sm font-semibold text-forest-900">No saved discoveries yet</p>
              <p>Scan real plants using the AI Scanner to build your personal botanical catalog.</p>
              <button
                onClick={() => setActiveTab('scanner')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 text-white font-bold text-xs mt-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Scan First Plant
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {discoveries.map(disc => (
                <div
                  key={disc.id}
                  className="p-4 rounded-3xl bg-white border border-forest-100/80 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <img
                      src={disc.imageUrl}
                      alt={disc.topPrediction.label}
                      className="w-full h-44 rounded-2xl object-cover border border-forest-100/80"
                    />
                    <div>
                      <h4 className="font-bold text-forest-950 text-sm">
                        {disc.userAssignedSpecies || disc.topPrediction.botanicalInfo?.speciesName || disc.topPrediction.label}
                      </h4>
                      <p className="text-xs text-stone-500 italic mt-0.5">
                        {disc.topPrediction.botanicalInfo?.scientificName || 'Nature Observation'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-forest-100/80 text-[11px] text-stone-500">
                    <span className="font-semibold text-forest-800">
                      {(disc.topPrediction.score * 100).toFixed(1)}% match
                    </span>
                    <span>{new Date(disc.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
