import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db, initializeDatabase } from '../db';
import {
  UserProfile,
  PlantRecord,
  Quest,
  PlacedGardenItem,
  GardenShopItem,
  Achievement,
  IdentificationResult,
  NatureObservation
} from '../types';
import {
  awardEconomyRewards,
  purchaseShopItem,
  REWARD_VALUES
} from '../services/economyService';
import { trackQuestAction, submitNatureObservation } from '../services/questEngine';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

interface GardenContextType {
  profile: UserProfile | null;
  plants: PlantRecord[];
  quests: Quest[];
  gardenItems: PlacedGardenItem[];
  shopCatalog: GardenShopItem[];
  achievements: Achievement[];
  discoveries: IdentificationResult[];
  observations: NatureObservation[];
  loading: boolean;
  isOutsideModeActive: boolean;
  isScannerOpen: boolean;
  isServerSyncing: boolean;
  serverConnected: boolean;
  openScanner: () => void;
  closeScanner: () => void;
  startOutsideMode: () => void;
  stopOutsideMode: () => void;
  refreshData: () => Promise<void>;
  buyItem: (itemId: string) => Promise<{ success: boolean; message: string }>;
  placeGardenItem: (itemId: string, x: number, y: number) => Promise<void>;
  moveGardenItem: (instanceId: string, x: number, y: number) => Promise<void>;
  rotateGardenItem: (instanceId: string) => Promise<void>;
  removeGardenItem: (instanceId: string) => Promise<void>;
  addPlantRecord: (plant: Omit<PlantRecord, 'id' | 'growthPhotos' | 'careHistory'> & { initialPhoto?: string }) => Promise<PlantRecord>;
  deletePlantRecord: (id: string) => Promise<void>;
  logPlantCare: (plantId: string, type: any, notes?: string) => Promise<void>;
  addGrowthPhoto: (plantId: string, photoUrl: string, stageLabel?: string, notes?: string) => Promise<void>;
  saveDiscovery: (result: IdentificationResult) => Promise<void>;
  logOutsideObservation: (data: any) => Promise<void>;
  claimQuest: (questId: string) => Promise<void>;
}

const GardenContext = createContext<GardenContextType | undefined>(undefined);

export const GardenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, updateUserBalance } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plants, setPlants] = useState<PlantRecord[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [gardenItems, setGardenItems] = useState<PlacedGardenItem[]>([]);
  const [shopCatalog, setShopCatalog] = useState<GardenShopItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [discoveries, setDiscoveries] = useState<IdentificationResult[]>([]);
  const [observations, setObservations] = useState<NatureObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOutsideModeActive, setIsOutsideModeActive] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isServerSyncing, setIsServerSyncing] = useState(false);
  const [serverConnected, setServerConnected] = useState(true);

  const openScanner = useCallback(() => setIsScannerOpen(true), []);
  const closeScanner = useCallback(() => setIsScannerOpen(false), []);

  const refreshData = useCallback(async () => {
    try {
      await initializeDatabase();

      if (isAuthenticated && user) {
        setIsServerSyncing(true);
        // Attempt fetch from REST API
        const [plantsRes, questsRes, shopRes, gardenRes, profileRes] = await Promise.all([
          api.getPlants(),
          api.getQuests(),
          api.getShopCatalog(),
          api.getGardenLayout(),
          api.getProfile(),
        ]);

        if (plantsRes.success && plantsRes.data) {
          setServerConnected(true);
          setPlants(plantsRes.data.plants as any);
        }
        if (questsRes.success && questsRes.data) {
          setQuests(questsRes.data.quests as any);
        }
        if (shopRes.success && shopRes.data) {
          setShopCatalog(shopRes.data.catalog as any);
        }
        if (gardenRes.success && gardenRes.data) {
          setGardenItems(gardenRes.data.layout as any);
        }
        if (profileRes.success && profileRes.data) {
          const p = profileRes.data.profile;
          const userProfile: UserProfile = {
            id: p.id,
            username: p.username,
            floraCoins: p.coins,
            xp: p.xp,
            level: p.level,
            createdAt: p.createdAt,
            lastActiveAt: p.lastActiveAt,
            streakDays: p.streakDays || 1,
          };
          setProfile(userProfile);
          if (profileRes.data.achievements) {
            setAchievements(profileRes.data.achievements as any);
          }
        }
      } else {
        // Local IndexedDB fallback
        const [
          pProfile,
          pPlants,
          pQuests,
          pLayout,
          pShop,
          pAch,
          pDisc,
          pObs
        ] = await Promise.all([
          db.profile.get('default-user'),
          db.plants.toArray(),
          db.quests.toArray(),
          db.gardenLayout.toArray(),
          db.shopItems.toArray(),
          db.achievements.toArray(),
          db.discoveries.toArray(),
          db.observations.toArray()
        ]);

        if (pProfile) setProfile(pProfile);
        setPlants(pPlants);
        setQuests(pQuests);
        setGardenItems(pLayout);
        setShopCatalog(pShop);
        setAchievements(pAch);
        setDiscoveries(pDisc);
        setObservations(pObs);
      }
    } catch (err) {
      console.warn('[GardenProvider] Data fetch notice (operating offline/fallback):', err);
      setServerConnected(false);
    } finally {
      setIsServerSyncing(false);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const buyItem = async (itemId: string) => {
    if (isAuthenticated) {
      const res = await api.buyShopItem(itemId);
      if (res.success && res.data) {
        updateUserBalance(res.data.user.coins, user?.xp || 0, res.data.user.level);
        await refreshData();
        return { success: true, message: res.message || 'Item purchased successfully!' };
      }
      return { success: false, message: res.error?.message || 'Purchase failed.' };
    } else {
      const res = await purchaseShopItem(itemId);
      await refreshData();
      return res;
    }
  };

  const placeGardenItem = async (itemId: string, x: number, y: number) => {
    const targetX = Math.max(0, Math.min(15, x));
    const targetY = Math.max(0, Math.min(15, y));

    if (isAuthenticated) {
      const res = await api.placeGardenItem(itemId, targetX, targetY, 0);
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to place item on garden grid.');
      }
      await refreshData();
    } else {
      const existing = await db.gardenLayout
        .filter(item => item.gridX === targetX && item.gridY === targetY)
        .first();

      if (existing) {
        console.warn(`[GardenContext] Cell (${targetX}, ${targetY}) is already occupied.`);
        return;
      }

      const newItem: PlacedGardenItem = {
        instanceId: `inst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        itemId,
        gridX: targetX,
        gridY: targetY,
        rotation: 0,
        placedAt: new Date().toISOString()
      };
      await db.gardenLayout.add(newItem);
      await refreshData();
    }
  };

  const moveGardenItem = async (instanceId: string, x: number, y: number) => {
    const targetX = Math.max(0, Math.min(15, x));
    const targetY = Math.max(0, Math.min(15, y));

    if (isAuthenticated) {
      await api.moveGardenItem(instanceId, targetX, targetY);
      await refreshData();
    } else {
      await db.gardenLayout.update(instanceId, {
        gridX: targetX,
        gridY: targetY
      });
      await refreshData();
    }
  };

  const rotateGardenItem = async (instanceId: string) => {
    if (isAuthenticated) {
      await api.rotateGardenItem(instanceId);
      await refreshData();
    } else {
      const item = await db.gardenLayout.get(instanceId);
      if (item) {
        const nextRot = (item.rotation + 90) % 360;
        await db.gardenLayout.update(instanceId, { rotation: nextRot });
        await refreshData();
      }
    }
  };

  const removeGardenItem = async (instanceId: string) => {
    if (isAuthenticated) {
      await api.removeGardenItem(instanceId);
      await refreshData();
    } else {
      await db.gardenLayout.delete(instanceId);
      await refreshData();
    }
  };

  const addPlantRecord = async (data: Omit<PlantRecord, 'id' | 'growthPhotos' | 'careHistory'> & { initialPhoto?: string }) => {
    const initialPhotoUrl = data.initialPhoto || data.primaryPhotoUrl || 'https://images.unsplash.com/photo-1596724817757-9755f78c50c6?w=600&q=80';

    if (isAuthenticated) {
      const res = await api.createPlant({
        name: data.name,
        species: data.species,
        scientificName: data.scientificName,
        family: data.family,
        location: data.location || 'indoor',
        sunlightNeeds: data.sunlightNeeds || 'indirect_bright',
        waterFrequencyDays: data.waterFrequencyDays || 7,
        notes: data.notes || '',
        primaryPhotoUrl: initialPhotoUrl,
        initialPhoto: initialPhotoUrl,
      });

      if (res.success && res.data) {
        updateUserBalance(res.data.user.coins, res.data.user.xp, res.data.user.level);
        await refreshData();
        return res.data.plant;
      }
    }

    // Local DB fallback
    const id = `plant-${Date.now()}`;
    const newPlant: PlantRecord = {
      id,
      name: data.name,
      species: data.species,
      scientificName: data.scientificName,
      family: data.family,
      acquiredDate: data.acquiredDate || new Date().toISOString(),
      primaryPhotoUrl: initialPhotoUrl,
      location: data.location || 'indoor',
      sunlightNeeds: data.sunlightNeeds || 'indirect_bright',
      waterFrequencyDays: data.waterFrequencyDays || 7,
      notes: data.notes || '',
      growthPhotos: [
        {
          id: `gp-${Date.now()}`,
          plantId: id,
          photoUrl: initialPhotoUrl,
          takenAt: new Date().toISOString(),
          stageLabel: 'Day 1 Entry',
          notes: 'Plant adopted and registered into My Garden World.'
        }
      ],
      careHistory: []
    };

    await db.plants.add(newPlant);
    await awardEconomyRewards(15, 20, `Added ${newPlant.name} to My Plants`, 'quest_reward');
    await refreshData();
    return newPlant;
  };

  const deletePlantRecord = async (id: string) => {
    if (isAuthenticated) {
      await api.deletePlant(id);
      await refreshData();
    } else {
      await db.plants.delete(id);
      await refreshData();
    }
  };

  const logPlantCare = async (plantId: string, type: any, notes?: string) => {
    if (isAuthenticated) {
      const res = await api.logPlantCare(plantId, type, notes);
      if (res.success && res.data) {
        updateUserBalance(res.data.user.coins, res.data.user.xp, res.data.user.level);
        await refreshData();
        return;
      }
    }

    // Local DB fallback
    const plant = await db.plants.get(plantId);
    if (!plant) return;

    const activity = {
      id: `care-${Date.now()}`,
      plantId,
      type,
      timestamp: new Date().toISOString(),
      notes: notes || `Care task: ${type}`,
      xpAwarded: REWARD_VALUES.CARE_TASK.xp
    };

    const updatedCare = [activity, ...(plant.careHistory || [])];
    const updates: Partial<PlantRecord> = {
      careHistory: updatedCare
    };

    if (type === 'water') {
      updates.lastWateredDate = new Date().toISOString();
    } else if (type === 'fertilize') {
      updates.lastFertilizedDate = new Date().toISOString();
    }

    await db.plants.update(plantId, updates);
    await trackQuestAction('care', 1);
    await awardEconomyRewards(
      REWARD_VALUES.CARE_TASK.coins,
      REWARD_VALUES.CARE_TASK.xp,
      `Cared for ${plant.name} (${type})`,
      'care_reward'
    );
    await refreshData();
  };

  const addGrowthPhoto = async (plantId: string, photoUrl: string, stageLabel?: string, notes?: string) => {
    if (isAuthenticated) {
      const res = await api.addGrowthPhoto(plantId, photoUrl, stageLabel, notes);
      if (res.success && res.data) {
        updateUserBalance(res.data.user.coins, res.data.user.xp, res.data.user.level);
        await refreshData();
        return;
      }
    }

    // Local DB fallback
    const plant = await db.plants.get(plantId);
    if (!plant) return;

    const newPhoto = {
      id: `gp-${Date.now()}`,
      plantId,
      photoUrl,
      takenAt: new Date().toISOString(),
      stageLabel: stageLabel || 'Growth Update',
      notes: notes || ''
    };

    const updatedPhotos = [...(plant.growthPhotos || []), newPhoto];
    await db.plants.update(plantId, {
      growthPhotos: updatedPhotos,
      primaryPhotoUrl: photoUrl
    });

    await trackQuestAction('growth', 1);
    await awardEconomyRewards(
      REWARD_VALUES.GROWTH_PHOTO.coins,
      REWARD_VALUES.GROWTH_PHOTO.xp,
      `Logged growth photo for ${plant.name}`,
      'quest_reward'
    );
    await refreshData();
  };

  const saveDiscovery = async (result: IdentificationResult) => {
    if (isAuthenticated) {
      const res = await api.saveDiscovery(result);
      if (res.success && res.data) {
        updateUserBalance(res.data.user.coins, res.data.user.xp, res.data.user.level);
        await refreshData();
        return;
      }
    }

    // Local DB fallback
    const existing = await db.discoveries.get(result.id);
    if (existing && existing.isSaved) {
      console.warn(`[GardenContext] Discovery ${result.id} already saved.`);
      return;
    }

    const discovery: IdentificationResult = {
      ...result,
      isSaved: true
    };
    await db.discoveries.put(discovery);
    await trackQuestAction('discovery', 1);

    // AI-Linked Unlocks: automatically unlock corresponding species seeds in shop
    const labelLower = (result.topPrediction.botanicalInfo?.speciesName || result.topPrediction.label).toLowerCase();
    const shopItems = await db.shopItems.toArray();
    for (const item of shopItems) {
      if (!item.unlocked && (item.id.includes(labelLower) || item.name.toLowerCase().includes(labelLower))) {
        await db.shopItems.update(item.id, { unlocked: true });
      }
    }

    await awardEconomyRewards(
      REWARD_VALUES.IDENTIFY_PLANT.coins,
      REWARD_VALUES.IDENTIFY_PLANT.xp,
      `AI Discovery: Identified ${result.topPrediction.botanicalInfo?.speciesName || result.topPrediction.label} & Unlocked Special Seeds!`,
      'discovery_reward'
    );
    await refreshData();
  };

  const logOutsideObservation = async (data: any) => {
    if (isAuthenticated) {
      const res = await api.createObservation({
        durationMinutes: data.durationMinutes || 5,
        locationDescription: data.locationDescription || 'Outdoor park',
        floraObserved: data.floraObserved || [],
        sensoryNotes: data.sensoryNotes || '',
        weatherCondition: data.weatherCondition,
      });

      if (res.success && res.data) {
        updateUserBalance(res.data.user.coins, res.data.user.xp, res.data.user.level);
        await refreshData();
        return;
      }
    }

    await submitNatureObservation(data);
    await refreshData();
  };

  const claimQuest = async (questId: string) => {
    if (isAuthenticated) {
      const res = await api.claimQuest(questId);
      if (res.success && res.data) {
        updateUserBalance(res.data.user.coins, res.data.user.xp, res.data.user.level);
        await refreshData();
        return;
      } else {
        throw new Error(res.error?.message || 'Unable to claim quest reward.');
      }
    }

    // Local DB fallback
    const quest = await db.quests.get(questId);
    if (quest && !quest.isCompleted) {
      await db.quests.update(questId, {
        isCompleted: true,
        completedAt: new Date().toISOString()
      });
      await awardEconomyRewards(
        quest.coinsReward,
        quest.xpReward,
        `Claimed Quest: ${quest.title}`,
        'quest_reward'
      );
      await refreshData();
    }
  };

  const startOutsideMode = () => setIsOutsideModeActive(true);
  const stopOutsideMode = () => setIsOutsideModeActive(false);

  return (
    <GardenContext.Provider
      value={{
        profile,
        plants,
        quests,
        gardenItems,
        shopCatalog,
        achievements,
        discoveries,
        observations,
        loading,
        isOutsideModeActive,
        isScannerOpen,
        isServerSyncing,
        serverConnected,
        openScanner,
        closeScanner,
        startOutsideMode,
        stopOutsideMode,
        refreshData,
        buyItem,
        placeGardenItem,
        moveGardenItem,
        rotateGardenItem,
        removeGardenItem,
        addPlantRecord,
        deletePlantRecord,
        logPlantCare,
        addGrowthPhoto,
        saveDiscovery,
        logOutsideObservation,
        claimQuest
      }}
    >
      {children}
    </GardenContext.Provider>
  );
};

export const useGarden = () => {
  const context = useContext(GardenContext);
  if (!context) {
    throw new Error('useGarden must be used within a GardenProvider');
  }
  return context;
};
