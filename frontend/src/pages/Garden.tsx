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
  X,
  Layers,
  Info
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      
      {/* Spacious Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100/80 border border-forest-200 text-forest-800 text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-forest-600" />
            <span>Virtual Sanctuary Design Studio</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-forest-950">
            Virtual Garden Sanctuary
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm">
            Arrange and customize your personal 8x8 garden grid using Flora Coins earned outdoors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-2xl">
            <Coins className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="text-sm font-extrabold text-amber-950">{profile?.floraCoins ?? 0}</span>
          </div>

          <button
            onClick={() => setShowShopModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs sm:text-sm shadow-xs transition-all hover:scale-102"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-300" />
            <span>Garden Shop</span>
          </button>
        </div>
      </div>

      {/* Main Studio Canvas & Inventory Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 4 Columns: Inventory Palette & Tile Inspector */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Inventory Tray */}
          <div className="glass-panel p-6 rounded-3xl border border-forest-100/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-forest-900 uppercase tracking-wider">
              <span>Your Inventory ({ownedItems.length})</span>
              <span className="text-stone-400 text-[10px]">Select item to place</span>
            </div>

            {ownedItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500 bg-forest-50/50 rounded-2xl border border-dashed border-forest-200 space-y-2">
                <p>No items unlocked yet.</p>
                <button
                  onClick={() => setShowShopModal(true)}
                  className="text-forest-700 font-bold hover:underline"
                >
                  Visit the Shop
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                {ownedItems.map(item => {
                  const isSelected = selectedInventoryItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedInventoryItem(item);
                        setSelectedPlacedItem(null);
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-forest-800 text-white border-forest-700 shadow-xs ring-2 ring-emerald-400'
                          : 'bg-white hover:bg-forest-50/80 border-forest-100/80 text-forest-950'
                      }`}
                    >
                      <div className="w-10 h-10 p-1 rounded-xl bg-forest-50/60 flex items-center justify-center">
                        <GardenItemIllustration itemId={item.id} />
                      </div>
                      <span className="font-bold text-xs truncate w-full block">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Placed Tile Inspector */}
          {selectedPlacedItem && (
            <div className="glass-panel p-6 rounded-3xl border border-forest-100/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-forest-900 uppercase tracking-wider">
                <span>Placed Tile Inspector</span>
                <span className="text-stone-400 font-mono">[{selectedPlacedItem.gridX}, {selectedPlacedItem.gridY}]</span>
              </div>

              {(() => {
                const shopItem = getShopItemById(selectedPlacedItem.itemId);
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 p-2 rounded-2xl bg-forest-50 flex items-center justify-center shrink-0">
                        <GardenItemIllustration itemId={selectedPlacedItem.itemId} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-forest-950 text-sm truncate">{shopItem?.name || selectedPlacedItem.itemId}</h4>
                        <p className="text-[11px] text-stone-500">Rotation: {selectedPlacedItem.rotation}°</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => rotateGardenItem(selectedPlacedItem.instanceId)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-900 border border-forest-200/80 font-bold text-xs transition-all"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Rotate 90°</span>
                      </button>

                      <button
                        onClick={() => {
                          removeGardenItem(selectedPlacedItem.instanceId);
                          setSelectedPlacedItem(null);
                        }}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Quick Tip */}
          <div className="p-4 rounded-2xl bg-forest-50/60 border border-forest-100/80 flex items-start gap-2.5 text-xs text-stone-600">
            <Info className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Click an empty tile on the 8x8 canvas to place the selected item. Click an occupied tile to inspect, rotate, or remove it.
            </p>
          </div>

        </div>

        {/* Right 8 Columns: Spacious 8x8 Garden Grid Canvas */}
        <div className="lg:col-span-8">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-forest-100/80 shadow-xs flex flex-col items-center justify-center space-y-4">
            
            <div className="w-full max-w-lg aspect-square bg-[#eaf3ec] rounded-3xl border-2 border-forest-200/80 p-3 sm:p-4 garden-grid-bg shadow-inner">
              <div className="grid grid-cols-8 grid-rows-8 gap-1.5 sm:gap-2 w-full h-full">
                {Array.from({ length: 64 }).map((_, idx) => {
                  const x = idx % 8;
                  const y = Math.floor(idx / 8);
                  const placed = gardenItems.find(item => item.gridX === x && item.gridY === y);
                  const isSelected = selectedPlacedItem?.gridX === x && selectedPlacedItem?.gridY === y;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleCellClick(x, y)}
                      className={`relative rounded-xl transition-all flex items-center justify-center ${
                        placed
                          ? isSelected
                            ? 'bg-emerald-300/80 ring-2 ring-forest-800 shadow-xs'
                            : 'bg-white/80 hover:bg-white shadow-2xs'
                          : selectedInventoryItem
                            ? 'bg-white/30 hover:bg-emerald-200/70 border border-dashed border-emerald-400/60'
                            : 'bg-white/20 hover:bg-white/40'
                      }`}
                    >
                      {placed && (
                        <div
                          className="w-full h-full p-1 flex items-center justify-center transition-transform"
                          style={{ transform: `rotate(${placed.rotation}deg)` }}
                        >
                          <GardenItemIllustration itemId={placed.itemId} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between w-full max-w-lg text-xs text-stone-500 font-medium px-1">
              <span>8x8 Grid Canvas</span>
              <span>{gardenItems.length} / 64 Placed</span>
            </div>

          </div>
        </div>

      </div>

      {/* Shop Catalog Modal */}
      {showShopModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-forest-100 space-y-5">
            
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-forest-700" />
                <h3 className="font-bold text-lg text-forest-950 font-display">Sanctuary Garden Shop</h3>
              </div>
              <button onClick={() => setShowShopModal(false)} className="p-1.5 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {purchaseNotice && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold shrink-0 ${
                  purchaseNotice.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {purchaseNotice.message}
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {(['all', 'plant', 'pot', 'decoration'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    activeCategoryFilter === cat
                      ? 'bg-forest-800 text-white'
                      : 'bg-forest-50 text-stone-600 hover:bg-forest-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Shop Catalog Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {filteredShop.map(item => {
                const userLevel = profile?.level || 1;
                const userCoins = profile?.floraCoins || 0;
                const isLocked = item.requiredLevel > userLevel;
                const canAfford = userCoins >= item.price;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                      item.unlocked
                        ? 'bg-forest-50/50 border-forest-100/80'
                        : isLocked
                          ? 'bg-stone-50 border-stone-200 opacity-75'
                          : 'bg-white border-forest-100/80 shadow-2xs'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="w-14 h-14 mx-auto p-2 rounded-2xl bg-white border border-forest-100 flex items-center justify-center">
                        <GardenItemIllustration itemId={item.id} />
                      </div>
                      <div className="text-center">
                        <h4 className="font-bold text-forest-950 text-xs truncate">{item.name}</h4>
                        <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-2">{item.description}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-forest-100/60 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-950">
                        <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        <span>{item.price}</span>
                      </div>

                      {item.unlocked ? (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Owned
                        </span>
                      ) : isLocked ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-stone-400">
                          <Lock className="w-3 h-3" />
                          Lvl {item.requiredLevel}
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePurchase(item.id)}
                          disabled={!canAfford}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            canAfford
                              ? 'bg-forest-800 hover:bg-forest-900 text-white shadow-xs'
                              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          }`}
                        >
                          Acquire
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
