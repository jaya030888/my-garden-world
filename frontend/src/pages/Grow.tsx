import React, { useState } from 'react';
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
  CheckCircle2
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

  const [selectedPlantId, setSelectedPlantId] = useState<string>(plants[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'profile' | 'timeline' | 'history'>('profile');
  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);

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
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-forest-50/80 border border-forest-100/80 self-start w-fit">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'profile'
                      ? 'bg-forest-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-forest-900'
                  }`}
                >
                  Plant Profile & Care
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'timeline'
                      ? 'bg-forest-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-forest-900'
                  }`}
                >
                  Photo Timeline ({(activePlant.growthPhotos || []).length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'history'
                      ? 'bg-forest-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-forest-900'
                  }`}
                >
                  Care Log History ({(activePlant.careHistory || []).length})
                </button>
              </div>

              {/* Tab 1: Profile & Quick Care */}
              {activeTab === 'profile' && (
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-forest-100/80 shadow-xs space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Plant Hero Photo */}
                    <div className="md:col-span-5 h-72 rounded-2xl overflow-hidden border border-forest-100/80 bg-stone-100">
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
                          className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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
                              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs shadow-2xs transition-all hover:scale-102 ${opt.color}`}
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-forest-100 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-forest-950 font-display">Add Botanical Plant Record</h3>
              <button onClick={() => setShowAddPlantModal(false)} className="p-1.5 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlant} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-forest-900 block">Plant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Living Room Monstera"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-forest-900 block">Species / Variety</label>
                <input
                  type="text"
                  placeholder="e.g. Monstera Deliciosa"
                  value={newSpecies}
                  onChange={e => setNewSpecies(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-forest-900 block">Photo URL (or Unsplash)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newPhotoUrl}
                  onChange={e => setNewPhotoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-forest-900 block">Water Frequency</label>
                  <select
                    value={newWaterDays}
                    onChange={e => setNewWaterDays(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  >
                    <option value={3}>Every 3 Days</option>
                    <option value={7}>Every 7 Days (Weekly)</option>
                    <option value={14}>Every 14 Days (Bi-weekly)</option>
                    <option value={30}>Every 30 Days (Monthly)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-forest-900 block">Location</label>
                  <select
                    value={newSunlight}
                    onChange={e => setNewSunlight(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  >
                    <option value="indoor">Indoor Living</option>
                    <option value="balcony">Balcony / Patio</option>
                    <option value="outdoor">Outdoor Garden</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-forest-900 block">Notes & Care Tips</label>
                <textarea
                  rows={2}
                  placeholder="Add soil type, pot size, or propagation notes..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlantModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-forest-200 font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold"
                >
                  Save Plant
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
