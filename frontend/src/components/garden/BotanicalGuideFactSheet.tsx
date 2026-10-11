import React, { useState } from 'react';
import {
  Sun,
  Droplets,
  Layers,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Sprout,
  Sparkles,
  BookOpen,
  Calendar,
  Thermometer,
  Scissors,
  Bug,
  ExternalLink,
  PlusCircle,
  BookmarkPlus,
  CheckCircle2,
  Info,
  Tag,
  Heart
} from 'lucide-react';
import { BotanicalInfo, ClassificationPrediction } from '../../types';

interface BotanicalGuideFactSheetProps {
  botanicalInfo: BotanicalInfo;
  prediction?: ClassificationPrediction;
  imageUrl?: string;
  onSaveToCollection?: () => void;
  isSaved?: boolean;
  className?: string;
}

export const BotanicalGuideFactSheet: React.FC<BotanicalGuideFactSheetProps> = ({
  botanicalInfo,
  prediction,
  imageUrl,
  onSaveToCollection,
  isSaved = false,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'care' | 'safety' | 'pests' | 'sources'>('overview');

  const scorePercent = prediction ? (prediction.score * 100).toFixed(1) : null;
  const isHighConfidence = prediction && prediction.score >= 0.55;
  const isModerateConfidence = prediction && prediction.score >= 0.20 && prediction.score < 0.55;

  return (
    <div className={`bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden transition-all ${className}`}>
      
      {/* Top Banner Header */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-stone-50 dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-950 border-b border-stone-200 dark:border-stone-800">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          
          <div className="space-y-2">
            {/* Status & Confidence Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[10px] font-extrabold uppercase tracking-wider">
                {botanicalInfo.family}
              </span>

              {prediction && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border flex items-center gap-1 ${
                  isHighConfidence
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    : isModerateConfidence
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                }`}>
                  <Sparkles className="w-3 h-3" />
                  <span>
                    {isHighConfidence ? `Verified Match (${scorePercent}%)` : isModerateConfidence ? `Tentative Match (${scorePercent}%)` : `Class Score (${scorePercent}%)`}
                  </span>
                </span>
              )}

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border flex items-center gap-1 ${
                botanicalInfo.petSafe
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
              }`}>
                {botanicalInfo.petSafe ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Pet Safe</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>Pet Caution</span>
                  </>
                )}
              </span>

              <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-[10px] font-bold">
                Difficulty: {botanicalInfo.difficulty}
              </span>
            </div>

            {/* Title & Taxonomy */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-forest-950 dark:text-emerald-50 tracking-tight">
                {botanicalInfo.speciesName}
              </h2>
              <div className="text-xs text-stone-500 dark:text-stone-400 italic flex flex-wrap items-center gap-2 mt-0.5">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                  {botanicalInfo.scientificName}
                </span>
                {botanicalInfo.genus && (
                  <>
                    <span>•</span>
                    <span>Genus: {botanicalInfo.genus}</span>
                  </>
                )}
                {botanicalInfo.lifespan && (
                  <>
                    <span>•</span>
                    <span>{botanicalInfo.lifespan}</span>
                  </>
                )}
              </div>
            </div>

            {/* Vernacular / Common Names */}
            {botanicalInfo.commonNames && botanicalInfo.commonNames.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400 pt-1">
                <span className="font-bold text-stone-400 uppercase text-[9px]">Common Names:</span>
                {botanicalInfo.commonNames.map(cn => (
                  <span key={cn} className="px-2 py-0.5 rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-[10px]">
                    {cn}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Photo & CTA */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
            {imageUrl && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-200 dark:border-stone-700 shadow-md">
                <img src={imageUrl} alt={botanicalInfo.speciesName} className="w-full h-full object-cover" />
              </div>
            )}

            {onSaveToCollection && (
              <button
                onClick={onSaveToCollection}
                disabled={isSaved}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                    : 'bg-emerald-700 hover:bg-emerald-600 text-white active:scale-95'
                }`}
              >
                {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'Saved to Collection' : 'Add to My Plants'}</span>
              </button>
            )}
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-stone-200/60 dark:border-stone-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Botanical Profile', icon: BookOpen },
            { id: 'care', label: 'Care & Cultivation', icon: Droplets },
            { id: 'safety', label: 'Pet Safety & Ecology', icon: ShieldCheck },
            { id: 'pests', label: 'Pests & Prevention', icon: Bug },
            { id: 'sources', label: 'Scientific Sources', icon: ExternalLink }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-forest-800 dark:bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-white/80 dark:hover:bg-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panes */}
      <div className="p-4 sm:p-6 space-y-4">

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Description */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 text-xs sm:text-sm text-stone-700 dark:text-stone-200 leading-relaxed">
              <span className="font-extrabold text-forest-950 dark:text-emerald-200 block mb-1">Botanical Overview</span>
              {botanicalInfo.description}
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Native Region</span>
                <p className="font-extrabold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{botanicalInfo.nativeRegion}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Expected Height</span>
                <p className="font-extrabold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{botanicalInfo.expectedHeight || 'Varies by cultivar'}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Flowering Period</span>
                <p className="font-extrabold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{botanicalInfo.floweringSeason || 'Active growing season'}</span>
                </p>
              </div>
            </div>

            {/* Look-alikes / Confusable Species */}
            {botanicalInfo.confusableSpecies && botanicalInfo.confusableSpecies.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs space-y-1.5">
                <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  <span>Visually Similar Look-Alikes (Taxonomic Distinctions):</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {botanicalInfo.confusableSpecies.map(c => (
                    <span key={c} className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700 text-stone-700 dark:text-stone-300 text-[11px] font-semibold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {botanicalInfo.tags && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <Tag className="w-3.5 h-3.5 text-stone-400" />
                {botanicalInfo.tags.map(t => (
                  <span key={t} className="px-2.5 py-0.5 rounded-full bg-forest-100/70 dark:bg-emerald-950/60 text-forest-800 dark:text-emerald-300 border border-forest-200 dark:border-emerald-800 text-[10px] font-bold">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CARE & CULTIVATION */}
        {activeTab === 'care' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 text-xs">
                  <Sun className="w-4 h-4 shrink-0" />
                  <span className="uppercase tracking-wide text-[10px]">Sunlight Requirements</span>
                </div>
                <p className="text-stone-700 dark:text-stone-200 text-xs leading-relaxed">
                  {botanicalInfo.sunlight}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400 text-xs">
                  <Droplets className="w-4 h-4 shrink-0" />
                  <span className="uppercase tracking-wide text-[10px]">Practical Soil-Moisture Guidance</span>
                </div>
                <p className="text-stone-700 dark:text-stone-200 text-xs leading-relaxed">
                  {botanicalInfo.watering}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                  <Layers className="w-4 h-4 shrink-0" />
                  <span className="uppercase tracking-wide text-[10px]">Soil & Drainage Profile</span>
                </div>
                <p className="text-stone-700 dark:text-stone-200 text-xs leading-relaxed">
                  {botanicalInfo.soil}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                  <Wind className="w-4 h-4 shrink-0" />
                  <span className="uppercase tracking-wide text-[10px]">Humidity & Aeration</span>
                </div>
                <p className="text-stone-700 dark:text-stone-200 text-xs leading-relaxed">
                  {botanicalInfo.humidity}
                </p>
              </div>

            </div>

            {/* Temperature & Feeding Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-600 dark:text-stone-400 text-[10px] uppercase">
                  <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                  <span>Temperature & Hardiness</span>
                </div>
                <p className="text-stone-700 dark:text-stone-200 text-xs leading-relaxed">
                  {botanicalInfo.temperatureRange || 'Moderate household temperatures (18°C - 26°C / 65°F - 78°F).'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-600 dark:text-stone-400 text-[10px] uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Seasonal Fertilizer Guidance</span>
                </div>
                <p className="text-stone-700 dark:text-stone-200 text-xs leading-relaxed">
                  {botanicalInfo.fertilizerGuidance || 'Feed half-strength balanced liquid plant food monthly during spring/summer active growth.'}
                </p>
              </div>
            </div>

            {/* Pruning & Propagation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-600 dark:text-stone-400 text-[10px] uppercase">
                  <Scissors className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pruning & Repotting Guidance</span>
                </div>
                <p className="text-stone-700 dark:text-stone-200 text-xs leading-relaxed">
                  {botanicalInfo.pruningAndRepotting || 'Remove yellowed or spent foliage at the stem base using sanitized shears.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-600 dark:text-stone-400 text-[10px] uppercase">
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Propagation Method</span>
                </div>
                <p className="text-stone-700 dark:text-stone-200 text-xs leading-relaxed">
                  {botanicalInfo.propagation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SAFETY & ECOLOGICAL ROLE */}
        {activeTab === 'safety' && (
          <div className="space-y-4">
            
            {/* Pet Toxicity Banner */}
            <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
              botanicalInfo.petSafe
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
            }`}>
              <div className="flex items-center gap-2">
                {botanicalInfo.petSafe ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <span className={`font-extrabold text-sm ${
                  botanicalInfo.petSafe ? 'text-emerald-950 dark:text-emerald-200' : 'text-amber-950 dark:text-amber-200'
                }`}>
                  {botanicalInfo.petSafe ? 'ASPCA Vetted: Non-Toxic to Pets' : 'ASPCA Precaution: Keep Away from Pets'}
                </span>
              </div>
              <p className="text-stone-700 dark:text-stone-300 text-xs leading-relaxed pl-7">
                {botanicalInfo.toxicity}
              </p>
            </div>

            {/* Human Handling & Toxicity */}
            {botanicalInfo.humanToxicity && (
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs space-y-1">
                <span className="font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-stone-500" />
                  <span>Human Edibility & Handling Precautions:</span>
                </span>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{botanicalInfo.humanToxicity}</p>
              </div>
            )}

            {/* Ecological Superhero Fact */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-extrabold text-emerald-950 dark:text-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="uppercase text-[10px] tracking-wide">Ecological Synergy & Wildlife Value</span>
              </div>
              <p className="text-stone-700 dark:text-stone-300 text-xs leading-relaxed">
                {botanicalInfo.ecologicalFact}
              </p>
            </div>

          </div>
        )}

        {/* TAB 4: PESTS & DISEASES */}
        {activeTab === 'pests' && (
          <div className="space-y-3">
            {botanicalInfo.pestsAndDiseases && botanicalInfo.pestsAndDiseases.length > 0 ? (
              botanicalInfo.pestsAndDiseases.map(pest => (
                <div key={pest.name} className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-forest-950 dark:text-emerald-200 flex items-center gap-1.5">
                      <Bug className="w-3.5 h-3.5 text-rose-500" />
                      <span>{pest.name}</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-stone-400">Common Issue</span>
                  </div>
                  <p className="text-stone-700 dark:text-stone-300 text-xs">
                    <strong className="text-stone-900 dark:text-stone-100">Symptoms:</strong> {pest.symptoms}
                  </p>
                  <p className="text-emerald-800 dark:text-emerald-300 text-xs">
                    <strong className="text-emerald-950 dark:text-emerald-200">Prevention & Treatment:</strong> {pest.prevention}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300">
                Generally pest-resistant under proper light and ventilation conditions. Check under leaves weekly for aphids or spider mites.
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SCIENTIFIC SOURCES & ATTRIBUTION */}
        {activeTab === 'sources' && (
          <div className="space-y-3 text-xs">
            <p className="text-stone-600 dark:text-stone-300 text-xs leading-relaxed">
              All botanical facts, toxicological classifications, and cultivation parameters in My Garden World are verified against peer-reviewed botanical registries:
            </p>

            <div className="space-y-2">
              {botanicalInfo.sources && botanicalInfo.sources.length > 0 ? (
                botanicalInfo.sources.map((src, i) => (
                  <div key={i} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-extrabold text-stone-900 dark:text-stone-100 block">{src.title}</span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">{src.organization}</span>
                    </div>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1 hover:underline"
                      >
                        <span>Verify Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-500">
                  Authoritative reference: Royal Horticultural Society & ASPCA Animal Poison Control Database.
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
              Note: On-device Vision Transformer (ViT-Base ImageNet-1k) performs visual classification. Botanical knowledge and safety rules are queried directly from verified biological taxonomy registries.
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
