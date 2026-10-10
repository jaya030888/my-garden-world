import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  ShoppingBag,
  Coins,
  Sparkles,
  RotateCw,
  Trash2,
  Lock,
  Check,
  X
} from 'lucide-react';
import { useGarden } from '../context/GardenContext';
import { GardenShopItem, PlacedGardenItem } from '../types';
import { GardenItemIllustration } from '../components/garden/GardenItemIllustrations';

export const GardenPage: React.FC = () => {
  const {
    profile,
    gardenItems,
    shopCatalog,
    buyItem,
    placeGardenItem,
    rotateGardenItem,
    removeGardenItem
  } = useGarden();

  const [showShopModal, setShowShopModal] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<GardenShopItem | null>(null);
  const [selectedPlacedItem, setSelectedPlacedItem] = useState<PlacedGardenItem | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'plant' | 'pot' | 'decoration'>('all');
  const [purchaseNotice, setPurchaseNotice] = useState<{ message: string; success: boolean } | null>(null);

  // Unlocked items owned in inventory
  const ownedItems = shopCatalog.filter(item => item.unlocked);

  const getShopItemById = (id: string): GardenShopItem | undefined => {
    return shopCatalog.find(item => item.id === id);
  };

  const handleCellClick = async (x: number, y: number) => {
    const existing = gardenItems.find(item => item.gridX === x && item.gridY === y);
    if (existing) {
      setSelectedPlacedItem(existing);
      setSelectedInventoryItem(null);
    } else {
      if (selectedInventoryItem) {
        await placeGardenItem(selectedInventoryItem.id, x, y);
      }
      setSelectedPlacedItem(null);
    }
  };

  const handlePurchase = async (itemId: string) => {
    const res = await buyItem(itemId);
    setPurchaseNotice({ message: res.message, success: res.success });
    setTimeout(() => setPurchaseNotice(null), 3500);
  };

  const filteredShop = shopCatalog.filter(
    item => activeCategoryFilter === 'all' || item.category === activeCategoryFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 pb-28 md:pb-16 space-y-6 sm:space-y-8">
      
      {/* Title & Shop Trigger Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 border border-forest-200 text-forest-800 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5 text-forest-600" />
            Interactive Virtual Sanctuary
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-forest-950">
            Virtual Garden World
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm">
            Plant and arrange your personal garden sanctuary using Flora Coins earned outdoors.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 sm:py-2 rounded-2xl shadow-xs">
            <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-400" />
            <div>
              <span className="text-[9px] sm:text-[10px] text-amber-800 font-bold block uppercase leading-none">Coins</span>
              <span className="text-sm sm:text-base font-extrabold text-amber-950">{profile?.floraCoins ?? 0}</span>
            </div>
          </div>

          <button
            onClick={() => setShowShopModal(true)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-forest-700 to-forest-800 hover:from-forest-800 hover:to-forest-900 text-white font-bold text-xs sm:text-sm shadow-md shadow-forest-800/20 transition-all hover:scale-105"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-300" />
            Garden Shop
          </button>
        </div>
      </div>

      {/* Main Studio: Inventory Tray + Garden Canvas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Inventory Tray & Selected Item Controls */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          
          {/* Inventory Tray Card */}
          <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-forest-100 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-forest-900 uppercase tracking-wider">
              <span>Your Inventory ({ownedItems.length})</span>
              <span className="text-stone-500 text-[10px] sm:text-xs">Tap to select</span>
            </div>

            {ownedItems.length === 0 ? (
              <div className="p-6 text-center text-stone-500 text-xs">
                No items unlocked yet. Visit the Shop to acquire virtual plants and decor!
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-2 gap-2 sm:gap-2.5 max-h-[300px] sm:max-h-[380px] overflow-y-auto pr-1">
                {ownedItems.map(item => {
                  const isSelected = selectedInventoryItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedInventoryItem(item);
                        setSelectedPlacedItem(null);
                      }}
                      className={`p-2 sm:p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                        isSelected
                          ? 'bg-forest-800 text-white border-forest-700 shadow-md ring-2 ring-emerald-400'
                          : 'bg-white hover:bg-forest-50/80 border-forest-100 text-forest-950'
                      }`}
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 p-1 rounded-xl bg-forest-50/80 flex items-center justify-center">
                        <GardenItemIllustration itemId={item.id} />
                      </div>
                      <div className="w-full">
                        <span className="font-bold text-[11px] sm:text-xs truncate block">{item.name}</span>
                        <span className="text-[9px] sm:text-[10px] opacity-75 capitalize block">{item.category}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedInventoryItem && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <span className="truncate">Ready: <strong>{selectedInventoryItem.name}</strong></span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 shrink-0 ml-2">Tap grid tile</span>
              </div>
            )}
          </div>

          {/* Selected Placed Item Controls */}
          {selectedPlacedItem && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-4 sm:p-5 rounded-3xl border border-forest-200 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-forest-950 text-xs sm:text-sm truncate">
                  {getShopItemById(selectedPlacedItem.itemId)?.name || 'Placed Item'}
                </h4>
                <button
                  onClick={() => setSelectedPlacedItem(null)}
                  className="text-stone-400 hover:text-stone-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => rotateGardenItem(selectedPlacedItem.instanceId)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-forest-100 hover:bg-forest-200 text-forest-900 font-bold text-xs transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Rotate 90°
                </button>

                <button
                  onClick={() => {
                    removeGardenItem(selectedPlacedItem.instanceId);
                    setSelectedPlacedItem(null);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </motion.div>
          )}

        </div>

        {/* Right Column: 8x8 Isometric/Top-Down Garden Grid Canvas */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="glass-panel p-3 sm:p-6 sm:rounded-4xl rounded-3xl border border-forest-100 shadow-lg bg-gradient-to-b from-forest-50/50 to-sage-50/50 overflow-hidden">
            
            <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-forest-900">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span>8x8 Sanctuary Grid</span>
              </div>
              <span className="text-[11px] sm:text-xs text-stone-500">
                {gardenItems.length} items placed
              </span>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-8 gap-1 sm:gap-2 w-full max-w-[500px] aspect-square mx-auto p-2 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-100/60 via-forest-100/40 to-sage-200/50 border border-forest-200/80 shadow-inner garden-grid-bg">
              {Array.from({ length: 64 }).map((_, idx) => {
                const x = idx % 8;
                const y = Math.floor(idx / 8);
                const placed = gardenItems.find(item => item.gridX === x && item.gridY === y);
                const itemDef = placed ? getShopItemById(placed.itemId) : null;
                const isSelected = selectedPlacedItem?.instanceId === placed?.instanceId;

                return (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    className={`relative rounded-xl sm:rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 ${
                      placed
                        ? isSelected
                          ? 'bg-emerald-200/90 ring-2 sm:ring-3 ring-emerald-500 scale-105 shadow-md z-10'
                          : 'bg-white/90 hover:bg-emerald-50 shadow-xs hover:scale-105'
                        : selectedInventoryItem
                        ? 'hover:bg-emerald-300/40 hover:border-dashed hover:border hover:border-emerald-500'
                        : 'hover:bg-white/40'
                    }`}
                  >
                    {placed && itemDef && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full h-full p-1 flex items-center justify-center"
                      >
                        <GardenItemIllustration itemId={itemDef.id} rotation={placed.rotation} />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-center text-stone-500 text-[11px] sm:text-xs mt-3 sm:mt-4">
              Tip: Select an item from your inventory, then tap any empty tile to place it.
            </p>

          </div>

        </div>

      </div>

      {/* Rewards & Shop Modal */}
      <AnimatePresence>
        {showShopModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-forest-950/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl sm:rounded-4xl p-5 sm:p-8 max-w-3xl w-full shadow-2xl border border-forest-100 relative max-h-[90vh] overflow-y-auto"
            >
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-stone-200 mb-4 sm:mb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-forest-950">
                    Botanical Rewards Shop
                  </h3>
                  <p className="text-xs text-stone-600">
                    Unlock virtual flora, pots, and outdoor decor with your Flora Coins.
                  </p>
                </div>

                <button
                  onClick={() => setShowShopModal(false)}
                  className="p-1.5 sm:p-2 text-stone-400 hover:text-stone-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Purchase Notice Toast */}
              {purchaseNotice && (
                <div
                  className={`p-3 rounded-2xl text-xs font-semibold mb-4 flex items-center gap-2 ${
                    purchaseNotice.success
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  {purchaseNotice.success ? <Check className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-rose-600" />}
                  {purchaseNotice.message}
                </div>
              )}

              {/* Category Filter Tabs */}
              <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1">
                {(['all', 'plant', 'pot', 'decoration'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                      activeCategoryFilter === cat
                        ? 'bg-forest-800 text-white shadow-sm'
                        : 'bg-forest-50 text-forest-800 hover:bg-forest-100'
                    }`}
                  >
                    {cat === 'all' ? 'All Items' : `${cat}s`}
                  </button>
                ))}
              </div>

              {/* Shop Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {filteredShop.map(item => {
                  const isLevelLocked = (profile?.level ?? 1) < item.requiredLevel;
                  const canAfford = (profile?.floraCoins ?? 0) >= item.price;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 sm:p-4 rounded-3xl border flex flex-col justify-between space-y-3 transition-all ${
                        item.unlocked
                          ? 'bg-emerald-50/50 border-emerald-200/80'
                          : isLevelLocked
                          ? 'bg-stone-50 border-stone-200 opacity-80'
                          : 'bg-white border-forest-100 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-14 h-14 p-2 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center">
                          <GardenItemIllustration itemId={item.id} />
                        </div>
                        <div className="text-right">
                          <span className="flex items-center gap-1 text-sm font-extrabold text-amber-900 justify-end">
                            <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            {item.price}
                          </span>
                          <span className="text-[10px] text-stone-500 uppercase font-semibold">
                            Req. Lvl {item.requiredLevel}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-forest-950 text-sm">{item.name}</h4>
                        <p className="text-stone-600 text-xs mt-1 leading-snug">{item.description}</p>
                      </div>

                      <div>
                        {item.unlocked ? (
                          <div className="py-2 px-3 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs text-center flex items-center justify-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            In Inventory
                          </div>
                        ) : isLevelLocked ? (
                          <div className="py-2 px-3 rounded-xl bg-stone-200 text-stone-600 font-bold text-xs text-center flex items-center justify-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" />
                            Unlock at Level {item.requiredLevel}
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePurchase(item.id)}
                            disabled={!canAfford}
                            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                              canAfford
                                ? 'bg-forest-700 hover:bg-forest-800 text-white shadow-sm'
                                : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            {canAfford ? `Purchase (${item.price} Coins)` : 'Need More Coins'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
