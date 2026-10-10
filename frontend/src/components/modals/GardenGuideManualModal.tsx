import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  X,
  Sparkles,
  Droplets,
  Camera,
  Layers,
  ShoppingBag,
  Award,
  CheckCircle2,
  ChevronRight,
  Sun,
  Flame,
  HelpCircle,
  Compass,
  ArrowRight,
  Flower2
} from 'lucide-react';
import { cozyAudio } from '../../services/audioService';

interface GardenGuideManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScanner?: () => void;
  onOpenShop?: () => void;
}

type GuideTab = 'basics' | 'care' | 'scanner' | 'design' | 'progression';

export const GardenGuideManualModal: React.FC<GardenGuideManualModalProps> = ({
  isOpen,
  onClose,
  onOpenScanner,
  onOpenShop
}) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('basics');

  if (!isOpen) return null;

  const handleTabChange = (tab: GuideTab) => {
    setActiveTab(tab);
    cozyAudio.playPlacementSound();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Banner */}
          <div className="relative p-5 sm:p-6 bg-gradient-to-r from-forest-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 p-2.5 flex items-center justify-center shadow-inner">
                <BookOpen className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>How to Play</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-bold">
                    Garden Manual
                  </span>
                </h2>
                <p className="text-xs text-emerald-200 font-medium">
                  Complete guide to designing, growing, and nurturing your sanctuary
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                cozyAudio.playPlacementSound();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Close Manual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Category Tabs */}
          <div className="flex items-center gap-1.5 p-2 px-4 sm:px-6 bg-stone-100 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700/60 overflow-x-auto no-scrollbar shrink-0">
            {[
              { id: 'basics', label: '🌸 Quick Start', icon: Sparkles },
              { id: 'care', label: '💧 Plant Care', icon: Droplets },
              { id: 'scanner', label: '📷 AI Scanner', icon: Camera },
              { id: 'design', label: '🏡 Garden Design', icon: Layers },
              { id: 'progression', label: '⭐ Levels & Shop', icon: ShoppingBag }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as GuideTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm scale-102 font-black'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Modal Content Scroll Area */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-stone-800 dark:text-stone-200 text-sm">
            
            {/* TAB 1: QUICK START BASICS */}
            {activeTab === 'basics' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-200">
                      Welcome to My Garden World!
                    </h3>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300/90 mt-0.5 leading-relaxed">
                      Transform your open meadow into a flourishing botanical sanctuary. Plant seeds, water daily, scan real plants with AI, and harvest gorgeous blooms.
                    </p>
                  </div>
                </div>

                <h4 className="text-xs font-black uppercase tracking-wider text-stone-400">
                  4 Easy Steps to Play
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col justify-between space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-xs">
                        1
                      </div>
                      <span className="font-extrabold text-xs">Tap Any Plot</span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      Click any empty grass tile to open the <strong>Flower Catalog</strong> and choose from 10+ botanical varieties.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col justify-between space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center font-black text-xs">
                        2
                      </div>
                      <span className="font-extrabold text-xs">Water Daily</span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      Select the <strong>💧 Water tool</strong> or tap placed flowers to hydrate them and accelerate their growth stage.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col justify-between space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-xs">
                        3
                      </div>
                      <span className="font-extrabold text-xs">Harvest Blooms</span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      When your plant reaches full bloom, tap <strong>✨ Harvest</strong> to collect FloraCoins and XP for leveling up.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col justify-between space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-xs">
                        4
                      </div>
                      <span className="font-extrabold text-xs">Scan & Expand</span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                      Use the <strong>📷 Scan Plant</strong> button to photograph nature, unlocking exclusive exotic seeds and shop decor!
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleTabChange('care')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Next: Plant Care & Growth</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 2: PLANT CARE & GROWTH CYCLE */}
            {activeTab === 'care' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-forest-950 dark:text-emerald-100">
                    Understanding the Growth Stages
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Every flower transitions through 4 realistic life stages:
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-center space-y-1">
                    <span className="text-2xl block">🌰</span>
                    <div className="text-xs font-extrabold text-amber-900 dark:text-amber-200">1. Seed</div>
                    <div className="text-[10px] text-stone-500">Freshly planted</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-lime-50/60 dark:bg-lime-950/20 border border-lime-200/80 dark:border-lime-900/40 text-center space-y-1">
                    <span className="text-2xl block">🌱</span>
                    <div className="text-xs font-extrabold text-lime-900 dark:text-lime-200">2. Sprout</div>
                    <div className="text-[10px] text-stone-500">First green leaves</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 text-center space-y-1">
                    <span className="text-2xl block">🌿</span>
                    <div className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">3. Growing</div>
                    <div className="text-[10px] text-stone-500">Developing buds</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 text-center space-y-1">
                    <span className="text-2xl block">🌸</span>
                    <div className="text-xs font-extrabold text-rose-900 dark:text-rose-200">4. Bloom</div>
                    <div className="text-[10px] text-stone-500">Ready to harvest!</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-sky-950 dark:text-sky-200">
                    <Droplets className="w-4 h-4 text-sky-600" />
                    <span>Daily Watering Streak Mechanic</span>
                  </div>
                  <p className="text-xs text-sky-800 dark:text-sky-300 leading-relaxed">
                    Plants require regular watering to stay moist. If you water your plant and complete your daily quest, it will reach full radiant bloom the next day! You can also click the <strong>Garden Spirit</strong> for Miracle Rain to accelerate all plants simultaneously.
                  </p>
                </div>
              </motion.div>
            )}

            {/* TAB 3: AI VISION SCANNER */}
            {activeTab === 'scanner' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-teal-950 dark:text-teal-200">
                    <Camera className="w-4 h-4 text-teal-600" />
                    <span>Bridge Real Nature into Your Virtual Garden</span>
                  </div>
                  <p className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed">
                    FloraQuest connects your real-world outdoor explorations with your virtual meadow using open-weight Vision Transformer AI.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                      📸 1
                    </span>
                    <div>
                      <div className="font-bold text-xs">Snap or Upload a Photo</div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        Take a photo of any flower, tree, or houseplant on your balcony or walk.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <span className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-bold text-xs">
                      🧠 2
                    </span>
                    <div>
                      <div className="font-bold text-xs">Instant Botanical Identification</div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        Our neural network identifies the species, scientific name, ASPCA pet safety, sunlight, and care tips.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                    <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold text-xs">
                      🪙 3
                    </span>
                    <div>
                      <div className="font-bold text-xs">Earn 50 Coins + Unlock Rare Seeds</div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        Every unique discovery catalogs into your Field Journal and awards bonus currency!
                      </div>
                    </div>
                  </div>
                </div>

                {onOpenScanner && (
                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenScanner();
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Try AI Scanner Now</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 4: GARDEN DESIGN & LAYOUT */}
            {activeTab === 'design' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-forest-950 dark:text-emerald-100">
                    Controls & Garden Tools
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Customize your meadow with intuitive dock tools:
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800">✋</span>
                      <div>
                        <div className="font-extrabold text-xs">Move & Select Tool</div>
                        <div className="text-[11px] text-stone-500">Tap a placed item, then tap any open tile to move it seamlessly.</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base p-1.5 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-800">💧</span>
                      <div>
                        <div className="font-extrabold text-xs">Water Tool</div>
                        <div className="text-[11px] text-stone-500">Tap any plant to water it instantly without opening modals.</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800">✨</span>
                      <div>
                        <div className="font-extrabold text-xs">Harvest Tool</div>
                        <div className="text-[11px] text-stone-500">Tap any glowing mature flower to harvest coin yields.</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base p-1.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800">🗑️</span>
                      <div>
                        <div className="font-extrabold text-xs">Store Tool</div>
                        <div className="text-[11px] text-stone-500">Store unwanted items back into your inventory dock safely.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                  <span className="text-lg">💡</span>
                  <span><strong>Pro-Tip:</strong> Use the <strong>🎯 Reset</strong>, <strong>➕ Zoom</strong>, and <strong>➖ Zoom</strong> buttons on the canvas to inspect your garden at any angle!</span>
                </div>
              </motion.div>
            )}

            {/* TAB 5: LEVELS & SHOP */}
            {activeTab === 'progression' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-purple-950 dark:text-purple-200">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>Progression, Levels & Meadow Expansions</span>
                  </div>
                  <p className="text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
                    Level up by caring for plants, harvesting blooms, and completing daily nature walks. Each level unlocks new botanical varieties and garden furniture in the Shop!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center space-y-1">
                    <span className="text-xl">🏡 8×8</span>
                    <div className="text-xs font-bold">Starter Meadow</div>
                    <div className="text-[10px] text-stone-500">Unlocked at Level 1</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center space-y-1">
                    <span className="text-xl">🌳 10×10</span>
                    <div className="text-xs font-bold">Lush Estate</div>
                    <div className="text-[10px] text-stone-500">Unlocked at Level 3</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center space-y-1">
                    <span className="text-xl">🏰 12×12</span>
                    <div className="text-xs font-bold">Royal Sanctuary</div>
                    <div className="text-[10px] text-stone-500">Unlocked at Level 5</div>
                  </div>
                </div>

                {onOpenShop && (
                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenShop();
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-amber-300" />
                      <span>Visit Botanical Nursery Shop</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}

          </div>

          {/* Footer Action */}
          <div className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
            <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Have fun building your cozy garden paradise!</span>
            </div>
            <button
              onClick={() => {
                cozyAudio.playPlacementSound();
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Got It, Let's Play!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
