import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Coins,
  Lock,
  Check,
  X,
  Sparkles,
  Layers,
  Leaf,
  Droplets,
  Box,
  Home,
  Footprints
} from 'lucide-react';
import { useGarden } from '../../context/GardenContext';
import { GardenShopItem } from '../../types';
import { GardenItemIllustration } from './GardenItemIllustrations';
import { cozyAudio } from '../../services/audioService';

interface GardenShopDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type ShopCategory = 'all' | 'seeds' | 'plant' | 'path' | 'decoration' | 'pot';

export const GardenShopDrawer: React.FC<GardenShopDrawerProps> = ({ isOpen, onClose }) => {
  const { profile, shopCatalog, buyItem } = useGarden();
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('all');
  const [purchaseNotice, setPurchaseNotice] = useState<{ message: string; success: boolean } | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async (itemId: string) => {
    const res = await buyItem(itemId);
    if (res.success) {
      cozyAudio.playHarvestChime();
    }
    setPurchaseNotice({ message: res.message, success: res.success });
    setTimeout(() => setPurchaseNotice(null), 3000);
  };

  const filteredItems = shopCatalog.filter(item => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'seeds') return item.id.startsWith('seed-');
    if (activeCategory === 'plant') return item.category === 'plant' && !item.id.startsWith('seed-');
    return item.category === activeCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-lg bg-white dark:bg-stone-900 h-full shadow-2xl border-l border-stone-200 dark:border-stone-800 flex flex-col"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest-100 dark:bg-emerald-950/60 flex items-center justify-center text-forest-700 dark:text-emerald-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-forest-950 dark:text-emerald-100">Botanical Nursery & Decor</h2>
              <p className="text-xs text-stone-500">Acquire seeds, flowers, paths, and cozy fixtures.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <Coins className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="text-xs font-extrabold text-amber-950 dark:text-amber-300">{profile?.floraCoins ?? 0}</span>
            </div>
            <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-stone-100 dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'seeds', label: '🌱 Seeds' },
            { id: 'plant', label: '🌸 Flowers' },
            { id: 'path', label: '🧱 Paths & Ponds' },
            { id: 'decoration', label: '🏡 Fixtures' },
            { id: 'pot', label: '🏺 Pots' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as ShopCategory)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-forest-800 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Purchase Status Notice */}
        <AnimatePresence>
          {purchaseNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`px-4 sm:px-6 py-2.5 text-xs font-bold flex items-center justify-between ${
                purchaseNotice.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}
            >
              <span>{purchaseNotice.message}</span>
              <button onClick={() => setPurchaseNotice(null)}><X className="w-3.5 h-3.5" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Item Cards List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-2.5 sm:space-y-3 pb-safe">
          {filteredItems.map(item => {
            const isUnlocked = item.unlocked;
            const canAfford = (profile?.floraCoins ?? 0) >= item.price;
            const meetsLevel = (profile?.level ?? 1) >= item.requiredLevel;

            return (
              <div
                key={item.id}
                className={`p-3 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-2.5 sm:gap-4 ${
                  isUnlocked
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : meetsLevel
                    ? 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-1.5 sm:p-2 flex items-center justify-center shrink-0">
                    <GardenItemIllustration itemId={item.id} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-forest-950 dark:text-emerald-100 flex items-center gap-1.5 truncate">
                      <span className="truncate">{item.name}</span>
                      {isUnlocked && <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-bold shrink-0">Owned</span>}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-stone-500 truncate max-w-[170px] sm:max-w-[220px]">{item.description}</p>
                    <div className="text-[9px] sm:text-[10px] text-stone-400 mt-0.5">
                      Requires Level {item.requiredLevel} • Category: {item.category}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isUnlocked ? (
                    <span className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-forest-100 text-forest-800 text-xs font-bold inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">In Bag</span>
                    </span>
                  ) : !meetsLevel ? (
                    <span className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-500 text-xs font-bold inline-flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lvl {item.requiredLevel}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item.id)}
                      disabled={!canAfford}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                        canAfford
                          ? 'bg-forest-800 hover:bg-forest-900 text-white shadow-xs cursor-pointer'
                          : 'bg-stone-200 dark:bg-stone-700 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5 text-amber-300" />
                      <span>{item.price}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
