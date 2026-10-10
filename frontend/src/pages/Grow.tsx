import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout,
  Plus,
  Droplets,
  Camera,
  Trash2,
  Sparkles,
  TrendingUp,
  X,
  Calendar,
  Sun,
  ShieldCheck,
  History,
  CheckCircle2,
  BookOpen,
  Heart,
  Wind,
  Bug,
  AlertCircle,
  HelpCircle,
  Upload,
  Info,
  Thermometer,
  Feather
} from 'lucide-react';
import { useGarden } from '../context/GardenContext';
import { PlantRecord, PlantCareType } from '../types';
import { getPlantCareAndUses } from '../ai/botanicalDatabase';
import { identifyPlant } from '../ai/plantClassifier';

export const GrowPage: React.FC = () => {
  const {
    plants,
    addPlantRecord,
    deletePlantRecord,
    logPlantCare,
    addGrowthPhoto
  } = useGarden();

  const [selectedPlantId, setSelectedPlantId] = useState<string>(plants[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'profile' | 'treatment' | 'timeline' | 'history'>('profile');
  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiScanStatus, setAiScanStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Plant form state
  const [newName, setNewName] = useState('');
  const [newSpecies, setNewSpecies] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newSunlight, setNewSunlight] = useState<'indoor' | 'outdoor' | 'balcony'>('indoor');
  const [newWaterDays, setNewWaterDays] = useState(7);
  const [newNotes, setNewNotes] = useState('');

  // New Photo form state
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoStageLabel, setPhotoStageLabel] = useState('Vegetative Growth');
  const [photoNotes, setPhotoNotes] = useState('');

  const activePlant = plants.find(p => p.id === selectedPlantId) || plants[0] || null;

  // Sample Real Plants for Quick Testing
  const SAMPLE_REAL_PLANTS = [
    { name: 'Swiss Cheese Plant', species: 'Monstera Deliciosa', url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&q=80' },
    { name: 'French Marigold', species: 'Tagetes Patula', url: 'https://images.unsplash.com/photo-1599818817739-1662a5b6d910?w=600&q=80' },
    { name: 'Golden Pothos', species: 'Epipremnum Aureum', url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&q=80' },
    { name: 'English Lavender', species: 'Lavandula Angustifolia', url: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=600&q=80' },
    { name: 'Common Daisy', species: 'Bellis Perennis', url: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=600&q=80' }
  ];

  const handleAiAutoDetect = async (fileOrUrl: File | string) => {
    setIsAiScanning(true);
    setAiScanStatus('Analyzing botanical characteristics with AI Vision...');
    try {
      const result = await identifyPlant(fileOrUrl, progress => {
        if (progress.message) setAiScanStatus(progress.message);
      });
      const top = result.topPrediction;
      const speciesName = top.botanicalInfo?.speciesName || top.label;
      setNewName(speciesName);
      setNewSpecies(top.botanicalInfo?.scientificName || speciesName);
      if (typeof fileOrUrl === 'string') {
        setNewPhotoUrl(fileOrUrl);
      } else {
        setNewPhotoUrl(URL.createObjectURL(fileOrUrl));
      }
      if (top.botanicalInfo) {
        setNewNotes(top.botanicalInfo.description);
        setNewWaterDays(top.botanicalInfo.watering.toLowerCase().includes('daily') ? 2 : (top.botanicalInfo.watering.toLowerCase().includes('week') ? 7 : 10));
      }
      setAiScanStatus(`✨ Identified: ${speciesName}! Customized treatment plan & practical uses loaded.`);
    } catch (err: any) {
      setAiScanStatus('Photo loaded. You can refine the name & species.');
      if (typeof fileOrUrl === 'string') {
        setNewPhotoUrl(fileOrUrl);
      } else {
        setNewPhotoUrl(URL.createObjectURL(fileOrUrl));
      }
    } finally {
      setIsAiScanning(false);
    }
  };

  const handleCreatePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await addPlantRecord({
      name: newName || 'My New Plant',
      species: newSpecies || 'Botanical Specimen',
      acquiredDate: new Date().toISOString(),
      primaryPhotoUrl: newPhotoUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&q=80',
      location: newSunlight,
      sunlightNeeds: 'indirect_bright',
      waterFrequencyDays: newWaterDays,
      notes: newNotes,
      initialPhoto: newPhotoUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&q=80'
    });
    setSelectedPlantId(created.id);
    setShowAddPlantModal(false);
    setNewName('');
    setNewSpecies('');
    setNewPhotoUrl('');
    setNewNotes('');
    setAiScanStatus('');
  };

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlant || !photoUrlInput) return;
    await addGrowthPhoto(activePlant.id, photoUrlInput, photoStageLabel, photoNotes);
    setShowAddPhotoModal(false);
    setPhotoUrlInput('');
    setPhotoNotes('');
  };

  const careOptions: { type: PlantCareType; label: string; icon: any; color: string }[] = [
    { type: 'water', label: 'Water', icon: Droplets, color: 'bg-sky-500 hover:bg-sky-600 text-white' },
    { type: 'mist', label: 'Mist', icon: Droplets, color: 'bg-teal-500 hover:bg-teal-600 text-white' },
    { type: 'fertilize', label: 'Fertilize', icon: Sparkles, color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    { type: 'prune', label: 'Prune', icon: Sprout, color: 'bg-amber-600 hover:bg-amber-700 text-white' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      
      {/* Spacious Header with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100/80 border border-forest-200 text-forest-800 text-xs font-semibold">
            <Sprout className="w-3.5 h-3.5 text-forest-600" />
            <span>Growth & Care Collection</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-forest-950">
            My Plants Collection
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm">
            Document growth photo progression, schedule nurturing care, and track botanical vitality.
          </p>
        </div>

        <button
          onClick={() => setShowAddPlantModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs sm:text-sm shadow-xs transition-all hover:scale-102 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-emerald-300" />
          <span>Add New Plant</span>
        </button>
      </div>

      {plants.length === 0 ? (
        <div className="p-12 text-center text-xs text-stone-500 bg-forest-50/50 rounded-3xl border border-dashed border-forest-200 space-y-3">
          <p className="text-sm font-semibold text-forest-900">Your collection is empty</p>
          <p>Add your first real-world houseplant or garden flora to start tracking growth.</p>
          <button
            onClick={() => setShowAddPlantModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 text-white font-bold text-xs mt-2"
          >
            <Plus className="w-4 h-4" />
            Add First Plant
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Plant Selector Strip */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pr-1">
            {plants.map(plant => {
              const isSelected = activePlant?.id === plant.id;
              return (
                <button
                  key={plant.id}
                  onClick={() => setSelectedPlantId(plant.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all ${
                    isSelected
                      ? 'bg-forest-800 text-white border-forest-700 shadow-xs'
                      : 'bg-white hover:bg-forest-50 border-forest-100/80 text-forest-950'
                  }`}
                >
                  <img
                    src={plant.primaryPhotoUrl}
                    alt={plant.name}
                    className="w-8 h-8 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-xs truncate block">{plant.name}</span>
                    <span className="text-[10px] opacity-70 block">{plant.species}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {activePlant && (
            <div className="space-y-6">
              
              {/* Plant View Tabs */}
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-forest-50/80 dark:bg-stone-800 border border-forest-100/80 dark:border-stone-700 self-start w-fit flex-wrap">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-forest-800 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-forest-900'
                  }`}
                >
                  🌿 Plant Profile & Care
                </button>
                <button
                  onClick={() => setActiveTab('treatment')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'treatment'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-forest-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Treatment Plan & Practical Uses</span>
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'timeline'
                      ? 'bg-forest-800 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-forest-900'
                  }`}
                >
                  📸 Photo Timeline ({(activePlant.growthPhotos || []).length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-forest-800 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-forest-900'
                  }`}
                >
                  📋 Care Log History ({(activePlant.careHistory || []).length})
                </button>
              </div>

              {/* Tab 1: Profile & Quick Care */}
              {activeTab === 'profile' && (
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-forest-100/80 shadow-xs space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Plant Hero Photo */}
                    <div className="md:col-span-5 h-72 rounded-2xl overflow-hidden border border-forest-100/80 bg-stone-100 shadow-xs">
                      <img
                        src={activePlant.primaryPhotoUrl}
                        alt={activePlant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Plant Metadata & Care Controls */}
                    <div className="md:col-span-7 space-y-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-extrabold font-display text-forest-950">{activePlant.name}</h2>
                          <p className="text-xs text-stone-500 italic mt-0.5">{activePlant.species}</p>
                        </div>
                        <button
                          onClick={() => deletePlantRecord(activePlant.id)}
                          className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Delete Plant Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Care Parameters */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-2xl bg-forest-50/70 border border-forest-100/80 text-xs">
                          <span className="text-[10px] text-stone-500 uppercase font-bold block">Water Schedule</span>
                          <span className="font-semibold text-forest-900 mt-0.5 block">Every {activePlant.waterFrequencyDays} days</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-forest-50/70 border border-forest-100/80 text-xs">
                          <span className="text-[10px] text-stone-500 uppercase font-bold block">Location</span>
                          <span className="font-semibold text-forest-900 capitalize mt-0.5 block">{activePlant.location}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-forest-50/70 border border-forest-100/80 text-xs">
                          <span className="text-[10px] text-stone-500 uppercase font-bold block">Adoption Date</span>
                          <span className="font-semibold text-forest-900 mt-0.5 block">
                            {new Date(activePlant.acquiredDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {activePlant.notes && (
                        <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-2xl border border-stone-200/60 leading-relaxed">
                          {activePlant.notes}
                        </p>
                      )}

                      {/* Quick Care Action Buttons */}
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold text-forest-900 uppercase tracking-wider block">
                          Log Nurturing Activity
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {careOptions.map(opt => (
                            <button
                              key={opt.type}
                              onClick={() => logPlantCare(activePlant.id, opt.type)}
                              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs shadow-2xs transition-all hover:scale-102 cursor-pointer ${opt.color}`}
                            >
                              <opt.icon className="w-3.5 h-3.5" />
                              <span>{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* Tab: AI Treatment Plan & Practical Uses */}
              {activeTab === 'treatment' && (() => {
                const guide = getPlantCareAndUses(activePlant.species || activePlant.name);
                return (
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-forest-100/80 shadow-xs space-y-6">
                    
                    {/* Header Banner */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-forest-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">AI Plant Doctor & Botanical Advisor</span>
                        </div>
                        <h3 className="text-xl font-black font-display text-white">{guide.speciesName}</h3>
                        <p className="text-xs text-emerald-200 italic">{guide.scientificName} • {guide.family}</p>
                      </div>
                      <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-bold border border-emerald-400/30">
                        {guide.uses.petSafetyAdvisory.includes('Pet Safe') ? '🐾 Pet Safe' : '⚠️ Pet Caution'}
                      </span>
                    </div>

                    {/* SECTION 1: HOW TO TREAT & CARE PLAN */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-black text-forest-950 uppercase tracking-wide flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-sky-600" />
                        <span>1. How to Treat & Nurture This Plant</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-stone-800 border border-sky-200/80 dark:border-stone-700 space-y-1.5">
                          <div className="flex items-center gap-2 font-extrabold text-xs text-sky-950 dark:text-sky-300">
                            <Droplets className="w-4 h-4 text-sky-600" />
                            <span>Watering & Soil Hydration</span>
                          </div>
                          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                            {guide.treatment.wateringSchedule}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-stone-800 border border-amber-200/80 dark:border-stone-700 space-y-1.5">
                          <div className="flex items-center gap-2 font-extrabold text-xs text-amber-950 dark:text-amber-300">
                            <Sun className="w-4 h-4 text-amber-600" />
                            <span>Sunlight & Lighting Needs</span>
                          </div>
                          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                            {guide.treatment.sunlightRequirement}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1.5">
                          <div className="flex items-center gap-2 font-extrabold text-xs text-forest-950 dark:text-emerald-300">
                            <Sprout className="w-4 h-4 text-emerald-600" />
                            <span>Soil Mix & Pot Drainage</span>
                          </div>
                          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                            {guide.treatment.soilMix}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1.5">
                          <div className="flex items-center gap-2 font-extrabold text-xs text-forest-950 dark:text-emerald-300">
                            <Thermometer className="w-4 h-4 text-rose-500" />
                            <span>Temperature & Humidity</span>
                          </div>
                          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                            {guide.treatment.humidityTemperature}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-forest-50/70 border border-forest-100/80 space-y-2">
                        <div className="text-xs font-bold text-forest-900 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Vital Diagnostics & Health Checklist</span>
                        </div>
                        <ul className="space-y-1 text-xs text-stone-600">
                          {guide.treatment.vitalSigns.map((sign, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-600 font-bold">•</span>
                              <span>{sign}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* SECTION 2: PRACTICAL USES & BOTANICAL BENEFITS */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-sm font-black text-forest-950 uppercase tracking-wide flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>2. Botanical Uses & Practical Benefits</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-stone-800 border border-teal-200/80 dark:border-stone-700 space-y-1.5">
                          <div className="flex items-center gap-2 font-extrabold text-xs text-teal-950 dark:text-teal-300">
                            <Wind className="w-4 h-4 text-teal-600" />
                            <span>Air Purification & NASA Biofilter</span>
                          </div>
                          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                            {guide.uses.airPurificationScore}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-stone-800 border border-emerald-200/80 dark:border-stone-700 space-y-1.5">
                          <div className="flex items-center gap-2 font-extrabold text-xs text-emerald-950 dark:text-emerald-300">
                            <Bug className="w-4 h-4 text-emerald-600" />
                            <span>Ecological & Pollinator Magnet</span>
                          </div>
                          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                            {guide.uses.ecologicalRole}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-stone-800 border border-purple-200/80 dark:border-stone-700 space-y-1.5">
                          <div className="flex items-center gap-2 font-extrabold text-xs text-purple-950 dark:text-purple-300">
                            <BookOpen className="w-4 h-4 text-purple-600" />
                            <span>Medicinal & Culinary Uses</span>
                          </div>
                          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                            {guide.uses.medicinalOrCulinary}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-stone-800 border border-amber-200/80 dark:border-stone-700 space-y-1.5">
                          <div className="flex items-center gap-2 font-extrabold text-xs text-amber-950 dark:text-amber-300">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span>Pet Safety & Toxicity</span>
                          </div>
                          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                            {guide.uses.petSafetyAdvisory}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* Tab 2: Growth Timeline Photos */}
              {activeTab === 'timeline' && (
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-forest-100/80 shadow-xs space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-forest-950 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      Growth Photo Progression
                    </h3>
                    <button
                      onClick={() => setShowAddPhotoModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-800 text-white font-bold text-xs shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Add Milestone Photo</span>
                    </button>
                  </div>

                  {(activePlant.growthPhotos || []).length === 0 ? (
                    <div className="p-8 text-center text-xs text-stone-500 bg-forest-50/50 rounded-2xl border border-dashed border-forest-200">
                      <p>No growth photos recorded yet.</p>
                      <button
                        onClick={() => setShowAddPhotoModal(true)}
                        className="inline-block mt-2 text-forest-700 font-bold hover:underline"
                      >
                        + Add initial timeline photo
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {activePlant.growthPhotos.map((entry, idx) => (
                        <div
                          key={entry.id || idx}
                          className="p-3 rounded-2xl bg-white border border-forest-100/80 shadow-2xs space-y-2.5"
                        >
                          <img
                            src={entry.photoUrl}
                            alt={entry.stageLabel || 'Growth'}
                            className="w-full h-40 rounded-xl object-cover"
                          />
                          <div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-forest-950">{entry.stageLabel || `Milestone ${idx + 1}`}</span>
                              <span className="text-[10px] text-stone-400">
                                {new Date(entry.takenAt).toLocaleDateString()}
                              </span>
                            </div>
                            {entry.notes && (
                              <p className="text-[11px] text-stone-500 mt-1 leading-normal">{entry.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Care History */}
              {activeTab === 'history' && (
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-forest-100/80 shadow-xs space-y-4">
                  <h3 className="font-bold text-base text-forest-950 flex items-center gap-2">
                    <History className="w-4 h-4 text-forest-600" />
                    Care Activity Stream
                  </h3>

                  {(activePlant.careHistory || []).length === 0 ? (
                    <div className="p-8 text-center text-xs text-stone-500 bg-forest-50/50 rounded-2xl border border-dashed border-forest-200">
                      No care logs recorded yet. Use the care buttons on the profile tab to log care events.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activePlant.careHistory.map((log: any, idx: number) => (
                        <div
                          key={log.id || idx}
                          className="p-3 rounded-xl bg-white border border-forest-100/80 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="font-bold text-forest-950 capitalize">{log.type} Care Completed</span>
                          </div>
                          <div className="flex items-center gap-3 text-stone-400 text-[11px]">
                            <span className="text-emerald-700 font-bold">+{log.xpAwarded} XP</span>
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* Add Plant Modal */}
      {showAddPlantModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-forest-100 dark:border-stone-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-forest-100 dark:bg-forest-900/60 flex items-center justify-center text-forest-700 dark:text-emerald-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-forest-950 dark:text-emerald-100 font-display">Add Botanical Plant</h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">Upload photo for instant AI species & care auto-fill</p>
                </div>
              </div>
              <button onClick={() => setShowAddPlantModal(false)} className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Photo Scanner Upload Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/30 dark:to-stone-800 border-2 border-dashed border-emerald-300 dark:border-emerald-700/50 text-center space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleAiAutoDetect(e.target.files[0]);
                  }
                }}
              />
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAiScanning}
                  className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{isAiScanning ? 'Scanning Botanical AI...' : '📸 Upload Real Plant Photo'}</span>
                </button>
              </div>

              {/* Sample Quick-Select Pills */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-bold text-forest-800 dark:text-emerald-300 uppercase tracking-wider">Or Auto-Detect with Sample Flora:</p>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {SAMPLE_REAL_PLANTS.map(sample => (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => handleAiAutoDetect(sample.url)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-forest-200 dark:border-stone-700 text-forest-900 dark:text-emerald-200 font-medium transition-colors shadow-2xs"
                    >
                      🌱 {sample.name}
                    </button>
                  ))}
                </div>
              </div>

              {aiScanStatus && (
                <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 py-1.5 px-3 rounded-lg border border-emerald-300/60 dark:border-emerald-800 animate-fade-in">
                  {aiScanStatus}
                </div>
              )}
            </div>

            <form onSubmit={handleCreatePlant} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-forest-900 dark:text-emerald-200 block">Plant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Living Room Monstera"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-forest-200 dark:border-stone-700 bg-white dark:bg-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-forest-900 dark:text-emerald-200 block">Species / Botanical Variety</label>
                <input
                  type="text"
                  placeholder="e.g. Monstera Deliciosa"
                  value={newSpecies}
                  onChange={e => setNewSpecies(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-forest-200 dark:border-stone-700 bg-white dark:bg-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-forest-900 dark:text-emerald-200 block">Photo URL / Preview</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newPhotoUrl}
                  onChange={e => setNewPhotoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-forest-200 dark:border-stone-700 bg-white dark:bg-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
                {newPhotoUrl && (
                  <div className="mt-2 h-24 w-full rounded-xl overflow-hidden border border-forest-200 dark:border-stone-700">
                    <img src={newPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-forest-900 dark:text-emerald-200 block">Water Frequency</label>
                  <select
                    value={newWaterDays}
                    onChange={e => setNewWaterDays(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-forest-200 dark:border-stone-700 bg-white dark:bg-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  >
                    <option value={2}>Every 2 Days (High Moisture)</option>
                    <option value={4}>Every 4 Days</option>
                    <option value={7}>Every 7 Days (Weekly)</option>
                    <option value={14}>Every 14 Days (Bi-weekly)</option>
                    <option value={30}>Every 30 Days (Monthly / Succulents)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-forest-900 dark:text-emerald-200 block">Environment</label>
                  <select
                    value={newSunlight}
                    onChange={e => setNewSunlight(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-forest-200 dark:border-stone-700 bg-white dark:bg-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  >
                    <option value="indoor">Indoor Living Space</option>
                    <option value="balcony">Balcony / Bright Patio</option>
                    <option value="outdoor">Outdoor Garden Bed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-forest-900 dark:text-emerald-200 block">Notes & Care Tips</label>
                <textarea
                  rows={2}
                  placeholder="Soil type, pot drainage, or botanical details..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-forest-200 dark:border-stone-700 bg-white dark:bg-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlantModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-forest-200 dark:border-stone-700 font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold"
                >
                  Save Plant Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Photo Modal */}
      {showAddPhotoModal && activePlant && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-forest-100 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-forest-950 font-display">Add Growth Photo</h3>
              <button onClick={() => setShowAddPhotoModal(false)} className="p-1.5 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPhotoSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-forest-900 block">Photo URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={photoUrlInput}
                  onChange={e => setPhotoUrlInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-forest-900 block">Growth Milestone Label</label>
                <input
                  type="text"
                  value={photoStageLabel}
                  onChange={e => setPhotoStageLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-forest-900 block">Milestone Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. New leaf unfurling after watering cycle..."
                  value={photoNotes}
                  onChange={e => setPhotoNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPhotoModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-forest-200 font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
