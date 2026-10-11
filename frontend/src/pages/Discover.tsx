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
import { IdentificationResult } from '../types';
import { useGarden } from '../context/GardenContext';

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
                    {isVerified ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Species Match ({result.confidenceTier.toUpperCase()})
                      </span>
                    ) : isContainerObject ? (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Container / Pot Detected (Unconfirmed Plant)
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-200 text-xs font-bold flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
                        Unconfirmed Plant Species
                      </span>
                    )}

                    <span className="text-stone-400 text-xs font-mono">
                      {result.inferenceTimeMs.toFixed(0)} ms • {result.modelName.split('/').pop()}
                    </span>
                  </div>

                  {/* Title & Scientific Taxonomy */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold font-display text-forest-950">
                      {customPlantName || (isVerified ? topBotanical?.speciesName : result.topPrediction.label)}
                    </h2>
                    {isVerified && topBotanical?.scientificName ? (
                      <p className="text-xs text-stone-500 italic mt-0.5">
                        {topBotanical.scientificName} • {topBotanical.family}
                      </p>
                    ) : (
                      <p className="text-xs text-amber-800 font-medium mt-0.5">
                        Model Output: <span className="font-mono">{result.topPrediction.label}</span> ({(result.topPrediction.score * 100).toFixed(1)}% softmax score)
                      </p>
                    )}
                  </div>

                  {/* Explanation / Botanical Description */}
                  {isVerified && topBotanical?.description ? (
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {topBotanical.description}
                    </p>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 space-y-2">
                      <p className="leading-relaxed">
                        {result.topPrediction.statusExplanation ||
                          'The neural model detected visual characteristics associated with this class, but it does not map to a verified single botanical species.'}
                      </p>
                      <p className="text-[11px] text-amber-800 italic">
                        Tip: You can manually label the cultivar below (e.g. "French Marigold") before adding it to your collection.
                      </p>
                    </div>
                  )}

                  {/* Verified Botanical Quick Facts */}
                  {isVerified && topBotanical && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-2.5 rounded-xl bg-forest-50/70 border border-forest-100/80 text-xs">
                          <span className="text-[10px] text-stone-500 uppercase font-bold block">Sunlight</span>
                          <span className="font-semibold text-forest-900">{topBotanical.sunlight}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-forest-50/70 border border-forest-100/80 text-xs">
                          <span className="text-[10px] text-stone-500 uppercase font-bold block">Watering</span>
                          <span className="font-semibold text-forest-900">{topBotanical.watering}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-forest-50/70 border border-forest-100/80 text-xs">
                          <span className="text-[10px] text-stone-500 uppercase font-bold block">Soil & Substrate</span>
                          <span className="font-semibold text-forest-900">{topBotanical.soil}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-forest-50/70 border border-forest-100/80 text-xs">
                          <span className="text-[10px] text-stone-500 uppercase font-bold block">Humidity</span>
                          <span className="font-semibold text-forest-900">{topBotanical.humidity}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
                          <span className="text-[10px] text-stone-500 uppercase font-bold block">Pet Safety</span>
                          <span className={`font-semibold flex items-center gap-1 ${topBotanical.petSafe ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {topBotanical.petSafe ? 'Pet Safe (Non-Toxic)' : 'Keep Away from Pets'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
                          <span className="text-[10px] text-stone-500 uppercase font-bold block">Native Region</span>
                          <span className="font-semibold text-stone-800">{topBotanical.nativeRegion}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
                          <span className="text-[10px] text-stone-500 uppercase font-bold block">Propagation</span>
                          <span className="font-semibold text-stone-800">{topBotanical.propagation}</span>
                        </div>
                      </div>

                      {topBotanical.ecologicalFact && (
                        <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs space-y-1">
                          <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Ecological Synergy & Superpower</span>
                          </span>
                          <p className="text-emerald-900/90 leading-relaxed">{topBotanical.ecologicalFact}</p>
                        </div>
                      )}

                      {topBotanical.tags && topBotanical.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {topBotanical.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 border border-forest-200 text-[10px] font-bold"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
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
