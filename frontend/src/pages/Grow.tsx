import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout,
  Plus,
  Droplets,
  Camera,
  Trash2,
  Sparkles,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { useGarden } from '../context/GardenContext';
import { PlantRecord, PlantCareType } from '../types';

export const GrowPage: React.FC = () => {
  const {
    plants,
    addPlantRecord,
    deletePlantRecord,
    logPlantCare,
    addGrowthPhoto
  } = useGarden();

  const [selectedPlant, setSelectedPlant] = useState<PlantRecord | null>(plants[0] || null);
  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [compareIndexA] = useState(0);
  const [compareIndexB] = useState(1);

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

  // Keep selected plant updated if plant array changes
  const activePlant = plants.find(p => p.id === selectedPlant?.id) || plants[0] || null;

  const handleCreatePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await addPlantRecord({
      name: newName || 'My New Botanical Friend',
      species: newSpecies || 'Botanical Houseplant',
      acquiredDate: new Date().toISOString(),
      primaryPhotoUrl: newPhotoUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&q=80',
      location: newSunlight,
      sunlightNeeds: 'indirect_bright',
      waterFrequencyDays: newWaterDays,
      notes: newNotes,
      initialPhoto: newPhotoUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&q=80'
    });
    setSelectedPlant(created);
    setShowAddPlantModal(false);
    setNewName('');
    setNewSpecies('');
    setNewPhotoUrl('');
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
    { type: 'mist', label: 'Mist Leaves', icon: Droplets, color: 'bg-teal-500 hover:bg-teal-600 text-white' },
    { type: 'fertilize', label: 'Fertilize', icon: Sparkles, color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    { type: 'prune', label: 'Prune', icon: Sprout, color: 'bg-amber-600 hover:bg-amber-700 text-white' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 pb-28 md:pb-16 space-y-6 sm:space-y-8">
      
      {/* Top Title & Collection Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 border border-forest-200 text-forest-800 text-xs font-semibold mb-2">
            <Sprout className="w-3.5 h-3.5 text-forest-600" />
            Botanical Growth & Care Journal
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-forest-950">
            My Plants Collection
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm">
            Track dated photo progression, log nurturing care, and celebrate biological growth milestones.
          </p>
        </div>

        <button
          onClick={() => setShowAddPlantModal(true)}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-forest-800/20 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Plant Record
        </button>
      </div>

      {/* Main Layout: Plants List Sidebar + Detailed Active Plant Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Sidebar: Plants List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-forest-900 uppercase tracking-wider px-1">
            <span>Your Plants ({plants.length})</span>
            <span className="text-stone-500 text-[10px] sm:text-xs">Live IndexedDB</span>
          </div>

          <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] pb-2 lg:pb-0 pr-1">
            {plants.map(plant => {
              const isSelected = activePlant?.id === plant.id;
              const photoCount = (plant.growthPhotos || []).length;
              return (
                <div
                  key={plant.id}
                  onClick={() => setSelectedPlant(plant)}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 shrink-0 w-64 lg:w-full ${
                    isSelected
                      ? 'bg-forest-800 text-white border-forest-700 shadow-md scale-[1.01]'
                      : 'glass-panel hover:bg-forest-50/80 border-forest-100 text-forest-950'
                  }`}
                >
                  <img
                    src={plant.primaryPhotoUrl}
                    alt={plant.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 border border-white/20"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm truncate">{plant.name}</h3>
                    <p className={`text-[11px] sm:text-xs truncate ${isSelected ? 'text-emerald-200' : 'text-stone-500'}`}>
                      {plant.species}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] mt-1 opacity-80">
                      <span>{photoCount} photos</span>
                      <span>•</span>
                      <span>Every {plant.waterFrequencyDays}d</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 hidden sm:block ${isSelected ? 'text-emerald-300' : 'text-stone-400'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Area: Active Plant Growth Timeline & Care Studio */}
        {activePlant ? (
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            
            {/* Active Plant Header Banner */}
            <div className="glass-panel p-4 sm:p-8 rounded-3xl border border-forest-100 shadow-sm space-y-4 sm:space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-forest-100">
                <div>
                  <h2 className="text-xl sm:text-3xl font-extrabold font-display text-forest-950">
                    {activePlant.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-forest-700 font-mono italic">
                    {activePlant.scientificName || activePlant.species} • Acquired {new Date(activePlant.acquiredDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setShowAddPhotoModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
                    Growth Snap
                  </button>
                  <button
                    onClick={() => deletePlantRecord(activePlant.id)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                    title="Delete Plant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Care Action Buttons (Awards 10 Coins + 10 XP) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-forest-900 uppercase tracking-wider block">
                  Log Care Activity (+10 Coins, +10 XP):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                  {careOptions.map(({ type, label, icon: Icon, color }) => (
                    <button
                      key={type}
                      onClick={() => logPlantCare(activePlant.id, type)}
                      className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl font-bold text-xs shadow-xs transition-all hover:scale-105 ${color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Growth Timeline & Visual Comparison Section */}
            <div className="glass-panel p-4 sm:p-8 rounded-3xl border border-forest-100 shadow-sm space-y-4 sm:space-y-6">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-forest-600" />
                  <h3 className="font-bold text-base sm:text-lg text-forest-950 font-display">
                    Growth Timeline ({activePlant.growthPhotos?.length || 0} stages)
                  </h3>
                </div>
              </div>

              {/* Before & After Visual Comparison If >= 2 photos */}
              {(activePlant.growthPhotos?.length || 0) >= 2 && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-forest-50/80 border border-forest-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-forest-900">
                    <span>Visual Growth Comparison</span>
                    <span className="text-stone-500 font-normal text-[10px] sm:text-xs">Side-by-side</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Stage A */}
                    <div className="space-y-1.5">
                      <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-stone-200 border border-stone-300">
                        <img
                          src={activePlant.growthPhotos[compareIndexA]?.photoUrl}
                          alt="Earlier stage"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-forest-950/80 text-emerald-300 px-2 py-0.5 rounded-lg text-[10px] font-mono">
                          Earlier: {new Date(activePlant.growthPhotos[compareIndexA]?.takenAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-stone-700">
                        {activePlant.growthPhotos[compareIndexA]?.stageLabel || 'Initial Stage'}
                      </p>
                    </div>

                    {/* Stage B */}
                    <div className="space-y-1.5">
                      <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-stone-200 border border-stone-300">
                        <img
                          src={activePlant.growthPhotos[compareIndexB >= activePlant.growthPhotos.length ? activePlant.growthPhotos.length - 1 : compareIndexB]?.photoUrl}
                          alt="Later stage"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-forest-950/80 text-emerald-300 px-2 py-0.5 rounded-lg text-[10px] font-mono">
                          Latest: {new Date(activePlant.growthPhotos[activePlant.growthPhotos.length - 1]?.takenAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-stone-700">
                        {activePlant.growthPhotos[activePlant.growthPhotos.length - 1]?.stageLabel || 'Recent Growth'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline Cards */}
              <div className="space-y-2.5 sm:space-y-3">
                {(activePlant.growthPhotos || []).map(photo => (
                  <div
                    key={photo.id}
                    className="p-3 sm:p-4 rounded-2xl bg-white border border-forest-100 flex items-start sm:items-center gap-3 sm:gap-4 text-xs"
                  >
                    <img
                      src={photo.photoUrl}
                      alt={photo.stageLabel}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-forest-100"
                    />
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-forest-950 text-xs sm:text-sm truncate">{photo.stageLabel}</span>
                        <span className="text-stone-500 font-mono text-[10px] sm:text-[11px] shrink-0 ml-2">
                          {new Date(photo.takenAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-stone-600 italic text-[11px] sm:text-xs">"{photo.notes || 'No notes for this stage.'}"</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Care History Activity Log */}
            <div className="glass-panel p-4 sm:p-8 rounded-3xl border border-forest-100 shadow-sm space-y-3 sm:space-y-4">
              <h3 className="font-bold text-base sm:text-lg text-forest-950 font-display">
                Recent Care Activities ({activePlant.careHistory?.length || 0})
              </h3>
              <div className="space-y-2">
                {(activePlant.careHistory || []).slice(0, 5).map(care => (
                  <div
                    key={care.id}
                    className="p-2.5 sm:p-3 rounded-xl bg-forest-50/60 border border-forest-100/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-2">
                      <div className="w-7 h-7 rounded-lg bg-forest-200 text-forest-800 flex items-center justify-center font-bold shrink-0">
                        <Droplets className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-forest-900 capitalize block truncate">{care.type}</span>
                        <span className="text-stone-500 text-[10px] truncate block">{care.notes}</span>
                      </div>
                    </div>
                    <span className="text-stone-500 font-mono text-[10px] shrink-0">
                      {new Date(care.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-8 p-8 sm:p-12 text-center glass-panel rounded-3xl border border-forest-100">
            <Sprout className="w-10 h-10 sm:w-12 sm:h-12 text-forest-400 mx-auto mb-3" />
            <h3 className="font-bold text-forest-900 text-base sm:text-lg">No Plants Registered Yet</h3>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 mb-4">
              Add your first indoor or garden plant to begin tracking growth timelines!
            </p>
            <button
              onClick={() => setShowAddPlantModal(true)}
              className="py-2.5 px-5 rounded-xl bg-forest-700 text-white font-bold text-xs"
            >
              Add Plant
            </button>
          </div>
        )}

      </div>

      {/* Modal: Add New Plant */}
      <AnimatePresence>
        {showAddPlantModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-forest-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 sm:p-8 max-w-lg w-full shadow-2xl border border-forest-100 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowAddPlantModal(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl sm:text-2xl font-bold font-display text-forest-950 mb-1">
                Register New Plant
              </h3>
              <p className="text-xs text-stone-600 mb-4 sm:mb-6">
                Add a botanical specimen to your live journal. Earn 15 Flora Coins + 20 XP.
              </p>

              <form onSubmit={handleCreatePlant} className="space-y-3.5 text-left text-xs">
                <div>
                  <label className="font-bold text-forest-900 block mb-1">Plant Given Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cleo the Monstera, Balcony Basil"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-forest-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-forest-900 block mb-1">Botanical Species</label>
                  <input
                    type="text"
                    placeholder="e.g. Monstera Deliciosa, Fiddle Leaf Fig"
                    value={newSpecies}
                    onChange={e => setNewSpecies(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-forest-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-forest-900 block mb-1">Primary Photograph URL</label>
                  <input
                    type="text"
                    placeholder="Paste image URL (Unsplash or image host)"
                    value={newPhotoUrl}
                    onChange={e => setNewPhotoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-forest-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-forest-900 block mb-1">Location</label>
                    <select
                      value={newSunlight}
                      onChange={e => setNewSunlight(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                    >
                      <option value="indoor">Indoor Living</option>
                      <option value="outdoor">Outdoor Garden</option>
                      <option value="balcony">Balcony Container</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-forest-900 block mb-1">Water Cycle (Days)</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={newWaterDays}
                      onChange={e => setNewWaterDays(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-forest-900 block mb-1">Care Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Responds well to morning light. Likes weekly misting."
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-md transition-all mt-2"
                >
                  Save Plant & Earn Rewards
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add Growth Photo */}
      <AnimatePresence>
        {showAddPhotoModal && activePlant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-forest-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 sm:p-8 max-w-md w-full shadow-2xl border border-forest-100 relative"
            >
              <button
                onClick={() => setShowAddPhotoModal(false)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg sm:text-xl font-bold font-display text-forest-950 mb-1">
                Add Growth Timeline Snapshot
              </h3>
              <p className="text-xs text-stone-600 mb-4">
                Record a new milestone photo for {activePlant.name}. Earn 30 Flora Coins + 35 XP!
              </p>

              <form onSubmit={handleAddPhotoSubmit} className="space-y-3.5 text-left text-xs">
                <div>
                  <label className="font-bold text-forest-900 block mb-1">Photo URL</label>
                  <input
                    type="text"
                    required
                    placeholder="Paste image URL (e.g. Unsplash URL or data URL)"
                    value={photoUrlInput}
                    onChange={e => setPhotoUrlInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-forest-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-forest-900 block mb-1">Stage Label</label>
                  <input
                    type="text"
                    placeholder="e.g. New Leaf Unfurling, Month 2 Update, Flowering"
                    value={photoStageLabel}
                    onChange={e => setPhotoStageLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:ring-2 focus:ring-forest-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-forest-900 block mb-1">Observations & Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. New fenestrated leaf appeared on top stem!"
                    value={photoNotes}
                    onChange={e => setPhotoNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-md transition-all"
                >
                  Save Snapshot (+30 Coins, +35 XP)
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
