import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  HelpCircle,
  Clock,
  Droplet
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
    name: 'Monstera Deliciosa',
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
  const { discoveries, saveDiscovery, addPlantRecord } = useGarden();

  const [activeTab, setActiveTab] = useState<'scanner' | 'history'>('scanner');
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      
      {/* Spacious Header with Clean Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100/80 border border-forest-200 text-forest-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-forest-600" />
            <span>On-Device Vision AI</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-forest-950">
            Botanical Plant Explorer
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm">
            Scan any botanical specimen with 100% private, client-side neural vision inference.
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

          {/* Result Card */}
          {result && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-forest-100/80 shadow-xs space-y-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                
                {/* Image Preview */}
                <div className="w-full md:w-56 h-56 rounded-2xl overflow-hidden border border-forest-100/80 shrink-0 bg-stone-100">
                  <img src={result.imageUrl} alt="Identified Plant" className="w-full h-full object-cover" />
                </div>

                {/* Identification Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {(result.topPrediction.score * 100).toFixed(1)}% Confidence
                    </span>

                    <span className="text-stone-400 text-xs font-mono">
                      {result.inferenceTimeMs.toFixed(0)} ms latency
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold font-display text-forest-950">
                      {topBotanical?.speciesName || result.topPrediction.label}
                    </h2>
                    {topBotanical?.scientificName && (
                      <p className="text-xs text-stone-500 italic mt-0.5">{topBotanical.scientificName}</p>
                    )}
                  </div>

                  {topBotanical?.description && (
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {topBotanical.description}
                    </p>
                  )}

                  {/* Botanical Quick Facts */}
                  {topBotanical && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                      <div className="p-2.5 rounded-xl bg-forest-50/70 border border-forest-100/80 text-xs">
                        <span className="text-[10px] text-stone-500 uppercase font-bold block">Sunlight</span>
                        <span className="font-semibold text-forest-900 capitalize">{topBotanical.sunlight}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-forest-50/70 border border-forest-100/80 text-xs">
                        <span className="text-[10px] text-stone-500 uppercase font-bold block">Watering</span>
                        <span className="font-semibold text-forest-900 capitalize">{topBotanical.watering}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-forest-50/70 border border-forest-100/80 text-xs">
                        <span className="text-[10px] text-stone-500 uppercase font-bold block">Pet Safety</span>
                        <span className={`font-semibold ${topBotanical.petSafe ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {topBotanical.petSafe ? 'Pet Friendly' : 'Toxic to Pets'}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-forest-50/70 border border-forest-100/80 text-xs">
                        <span className="text-[10px] text-stone-500 uppercase font-bold block">Difficulty</span>
                        <span className="font-semibold text-forest-900 capitalize">{topBotanical.difficulty}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-3">
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
                      <span>{isSaved ? 'Saved to Discoveries' : 'Save Discovery'}</span>
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
                  </div>

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
                        {disc.topPrediction.botanicalInfo?.speciesName || disc.topPrediction.label}
                      </h4>
                      <p className="text-xs text-stone-500 italic mt-0.5">
                        {disc.topPrediction.botanicalInfo?.scientificName || 'Botanical specimen'}
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
