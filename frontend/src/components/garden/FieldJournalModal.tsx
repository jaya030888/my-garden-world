import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Sparkles,
  Check,
  X,
  ShieldCheck,
  Sun,
  Droplets,
  Award,
  Layers,
  Search
} from 'lucide-react';
import { useGarden } from '../../context/GardenContext';
import { VERIFIED_BOTANICAL_SPECIES } from '../../ai/botanicalDatabase';
import { BotanicalInfo } from '../../types';
import { GardenItemIllustration } from './GardenItemIllustrations';

interface FieldJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FieldJournalModal: React.FC<FieldJournalModalProps> = ({ isOpen, onClose }) => {
  const { discoveries } = useGarden();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeciesKey, setSelectedSpeciesKey] = useState<string>('marigold');
  const [mobileTab, setMobileTab] = useState<'list' | 'details'>('list');

  if (!isOpen) return null;

  const speciesList: [string, BotanicalInfo][] = Object.entries(VERIFIED_BOTANICAL_SPECIES);
  const selectedInfo = VERIFIED_BOTANICAL_SPECIES[selectedSpeciesKey] || speciesList[0][1];

  const filteredSpecies = speciesList.filter(([key, info]) => {
    const term = searchTerm.toLowerCase();
    return (
      key.includes(term) ||
      info.speciesName.toLowerCase().includes(term) ||
      info.scientificName.toLowerCase().includes(term)
    );
  });

  const isDiscovered = (key: string) => {
    return discoveries.some(d => d.topPrediction?.label.toLowerCase().includes(key));
  };

  const handleSelectSpecies = (key: string) => {
    setSelectedSpeciesKey(key);
    setMobileTab('details');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-stone-900 rounded-3xl max-w-4xl w-full max-h-[90dvh] overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-forest-100 dark:bg-emerald-950/60 flex items-center justify-center text-forest-700 dark:text-emerald-400 shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-forest-950 dark:text-emerald-100">Botanical Field Journal</h2>
              <p className="text-[11px] sm:text-xs text-stone-500">Curated scientific encyclopedia of identified flora and garden plants.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 sm:p-2 text-stone-400 hover:text-stone-600 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="md:hidden flex border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40">
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-2.5 text-xs font-extrabold text-center transition-all ${
              mobileTab === 'list'
                ? 'border-b-2 border-forest-700 text-forest-900 dark:text-emerald-300 bg-white dark:bg-stone-900'
                : 'text-stone-500'
            }`}
          >
            Species Catalog ({speciesList.length})
          </button>
          <button
            onClick={() => setMobileTab('details')}
            className={`flex-1 py-2.5 text-xs font-extrabold text-center transition-all ${
              mobileTab === 'details'
                ? 'border-b-2 border-forest-700 text-forest-900 dark:text-emerald-300 bg-white dark:bg-stone-900'
                : 'text-stone-500'
            }`}
          >
            Field Notes ({selectedInfo?.speciesName || 'Selected'})
          </button>
        </div>

        {/* Content Body: Split View / Mobile Tab View */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
          
          {/* Left Species Navigation */}
          <div className={`md:col-span-5 border-r border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden bg-stone-50/50 dark:bg-stone-950/30 ${
            mobileTab === 'list' ? 'flex' : 'hidden md:flex'
          }`}>
            <div className="p-3 border-b border-stone-200 dark:border-stone-800">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search species..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
              {filteredSpecies.map(([key, info]) => {
                const discovered = isDiscovered(key);
                const isSelected = selectedSpeciesKey === key;

                return (
                  <button
                    key={key}
                    onClick={() => handleSelectSpecies(key)}
                    className={`w-full p-2.5 sm:p-3 rounded-2xl text-left transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-forest-100 dark:bg-emerald-950/60 border border-forest-300 dark:border-emerald-700 shadow-xs'
                        : 'bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold text-forest-950 dark:text-emerald-100 flex items-center gap-1.5">
                        <span>{info.speciesName}</span>
                        {discovered && <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold">Discovered</span>}
                      </div>
                      <div className="text-[10px] text-stone-500 italic">{info.scientificName}</div>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-forest-50 dark:bg-stone-800 p-1 flex items-center justify-center shrink-0">
                      <GardenItemIllustration itemId={`vp-${key}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Species Fact Sheet */}
          <div className={`md:col-span-7 p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 bg-white dark:bg-stone-900 ${
            mobileTab === 'details' ? 'block' : 'hidden md:block'
          }`}>
            {/* Mobile Back to Catalog Button */}
            <div className="md:hidden mb-2">
              <button
                onClick={() => setMobileTab('list')}
                className="text-xs text-forest-700 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                ← Back to Species Catalog
              </button>
            </div>

            {selectedInfo && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                      {selectedInfo.family}
                    </span>
                    <h3 className="text-xl font-extrabold text-forest-950 dark:text-emerald-100 mt-1">
                      {selectedInfo.speciesName}
                    </h3>
                    <p className="text-xs text-stone-500 italic">{selectedInfo.scientificName}</p>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-forest-50 dark:bg-stone-800 border border-forest-200 dark:border-stone-700 p-2 flex items-center justify-center">
                    <GardenItemIllustration itemId={`vp-${selectedSpeciesKey}`} />
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {selectedInfo.description}
                </p>

                {/* Botanical Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs">
                  <div>
                    <span className="text-stone-400 font-bold block text-[10px]">NATIVE REGION</span>
                    <span className="text-forest-900 dark:text-emerald-200 font-extrabold">{selectedInfo.nativeRegion}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold block text-[10px]">CARE DIFFICULTY</span>
                    <span className="text-forest-900 dark:text-emerald-200 font-extrabold">{selectedInfo.difficulty}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold block text-[10px]">SUNLIGHT NEEDS</span>
                    <span className="text-forest-900 dark:text-emerald-200 font-bold">{selectedInfo.sunlight}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold block text-[10px]">WATERING CADENCE</span>
                    <span className="text-forest-900 dark:text-emerald-200 font-bold">{selectedInfo.watering}</span>
                  </div>
                </div>

                {/* Ecological Contribution */}
                <div className="p-4 rounded-2xl bg-forest-50/60 dark:bg-emerald-950/30 border border-forest-200 dark:border-emerald-800 text-xs space-y-1">
                  <span className="font-extrabold text-forest-950 dark:text-emerald-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Ecological Synergy</span>
                  </span>
                  <p className="text-stone-600 dark:text-stone-300">{selectedInfo.ecologicalFact}</p>
                </div>
              </>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
};
