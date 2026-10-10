import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const INITIAL_SHOP_ITEMS = [
    // Plants
    {
        id: 'vp-monstera',
        name: 'Verdant Monstera',
        category: 'plant',
        description: 'Iconic split-leaf tropical beauty that brings lush jungle energy.',
        price: 40,
        requiredLevel: 1,
        iconSvg: 'leaf',
        previewColor: '#22c55e',
        isAvailable: true,
    },
    {
        id: 'vp-sunflower',
        name: 'Golden Solar Bloom',
        category: 'plant',
        description: 'Radiant heliotropic sunflower that tracks sunlight across the garden.',
        price: 60,
        requiredLevel: 2,
        iconSvg: 'sun',
        previewColor: '#eab308',
        isAvailable: true,
    },
    {
        id: 'vp-lavender',
        name: 'Fragrant Lavender Bush',
        category: 'plant',
        description: 'Soothing purple spires that attract friendly virtual honeybees.',
        price: 75,
        requiredLevel: 3,
        iconSvg: 'sparkles',
        previewColor: '#a855f7',
        isAvailable: true,
    },
    {
        id: 'vp-bonsai',
        name: 'Ancient Juniper Bonsai',
        category: 'plant',
        description: 'A 50-year-old miniature tree symbolizing patience and harmony.',
        price: 150,
        requiredLevel: 5,
        iconSvg: 'trees',
        previewColor: '#15803d',
        isAvailable: true,
    },
    // Pots
    {
        id: 'pot-terracotta',
        name: 'Classic Terracotta Pot',
        category: 'pot',
        description: 'Earthy porous clay pot with warm Mediterranean charm.',
        price: 25,
        requiredLevel: 1,
        iconSvg: 'box',
        previewColor: '#b45309',
        isAvailable: true,
    },
    {
        id: 'pot-ceramic-teal',
        name: 'Glazed Ceramic Teal Pot',
        category: 'pot',
        description: 'Vibrant hand-glazed pottery with cool ocean undertones.',
        price: 50,
        requiredLevel: 2,
        iconSvg: 'palette',
        previewColor: '#0d9488',
        isAvailable: true,
    },
    {
        id: 'pot-marble-gold',
        name: 'Imperial Marble & Brass Pot',
        category: 'pot',
        description: 'Luxurious polished marble accented with brushed golden bands.',
        price: 120,
        requiredLevel: 4,
        iconSvg: 'crown',
        previewColor: '#e2e8f0',
        isAvailable: true,
    },
    // Decorations
    {
        id: 'dec-birdbath',
        name: 'Carved Stone Birdbath',
        category: 'decoration',
        description: 'Filled with crystal water where virtual songbirds stop to drink.',
        price: 100,
        requiredLevel: 3,
        iconSvg: 'droplet',
        previewColor: '#64748b',
        isAvailable: true,
    },
    {
        id: 'dec-lantern',
        name: 'Solar Bamboo Lantern',
        category: 'decoration',
        description: 'Eco-friendly soft amber illumination for gentle evening vibes.',
        price: 65,
        requiredLevel: 2,
        iconSvg: 'sun',
        previewColor: '#f97316',
        isAvailable: true,
    },
    {
        id: 'dec-zen-fountain',
        name: 'Flowing Zen Fountain',
        category: 'decoration',
        description: 'Continuous soothing water streams that promote calmness and focus.',
        price: 200,
        requiredLevel: 5,
        iconSvg: 'sparkles',
        previewColor: '#0284c7',
        isAvailable: true,
    },
    {
        id: 'dec-stepping-stones',
        name: 'Mossy Stepping Stones',
        category: 'path',
        description: 'Weathered slate stones nested in lush emerald groundmoss.',
        price: 35,
        requiredLevel: 1,
        iconSvg: 'footprints',
        previewColor: '#475569',
        isAvailable: true,
    }
];
const INITIAL_QUESTS = [
    {
        id: 'quest-daily-discover',
        title: 'Daily Flora Scout',
        description: 'Scan and identify 1 plant or flower in your surroundings.',
        category: 'discovery',
        coinsReward: 30,
        xpReward: 50,
        isDaily: true,
        targetCount: 1,
        iconName: 'camera',
        isActive: true,
    },
    {
        id: 'quest-daily-care',
        title: 'Botanical Hydration',
        description: 'Log a watering or misting care activity for any of your plants.',
        category: 'care',
        coinsReward: 20,
        xpReward: 40,
        isDaily: true,
        targetCount: 1,
        iconName: 'droplet',
        isActive: true,
    },
    {
        id: 'quest-daily-outside',
        title: 'Touch Grass Mindfulness',
        description: 'Complete a 5-minute outdoor mindfulness and sensory session.',
        category: 'outdoor',
        coinsReward: 50,
        xpReward: 100,
        isDaily: true,
        targetCount: 1,
        iconName: 'footprints',
        isActive: true,
    },
    {
        id: 'quest-weekly-growth',
        title: 'Growth Chronicler',
        description: 'Document 3 growth timeline photos across your plant collection this week.',
        category: 'growth',
        coinsReward: 100,
        xpReward: 200,
        isDaily: false,
        targetCount: 3,
        iconName: 'trending-up',
        isActive: true,
    },
    {
        id: 'quest-weekly-botanist',
        title: 'Master Naturalist',
        description: 'Identify 5 unique botanical species using the on-device AI.',
        category: 'discovery',
        coinsReward: 150,
        xpReward: 300,
        isDaily: false,
        targetCount: 5,
        iconName: 'compass',
        isActive: true,
    }
];
const INITIAL_ACHIEVEMENTS = [
    {
        id: 'ach-first-leaf',
        title: 'First Green Step',
        description: 'Adopted and registered your first real-world plant into My Garden World.',
        icon: 'sprout',
        category: 'grow',
        xpReward: 50,
        coinReward: 25,
    },
    {
        id: 'ach-ai-explorer',
        title: 'AI Nature Explorer',
        description: 'Identified your first plant using 100% on-device vision intelligence.',
        icon: 'compass',
        category: 'discover',
        xpReward: 60,
        coinReward: 30,
    },
    {
        id: 'ach-sanctuary-architect',
        title: 'Sanctuary Architect',
        description: 'Arranged and customized your first 3 items on the virtual grid.',
        icon: 'layout',
        category: 'special',
        xpReward: 80,
        coinReward: 40,
    },
    {
        id: 'ach-grass-toucher',
        title: 'Certified Grass Toucher',
        description: 'Logged 3 outdoor mindfulness sessions in Go Outside Mode.',
        icon: 'sun',
        category: 'play',
        xpReward: 120,
        coinReward: 75,
    },
    {
        id: 'ach-plant-whisperer',
        title: 'Plant Whisperer',
        description: 'Logged 10 plant care events (watering, misting, fertilizing, or pruning).',
        icon: 'heart',
        category: 'grow',
        xpReward: 150,
        coinReward: 100,
    }
];
export async function seed() {
    console.log('Seeding initial shop items, quests, and achievements...');
    for (const item of INITIAL_SHOP_ITEMS) {
        await prisma.shopItem.upsert({
            where: { id: item.id },
            update: item,
            create: item,
        });
    }
    for (const quest of INITIAL_QUESTS) {
        await prisma.quest.upsert({
            where: { id: quest.id },
            update: quest,
            create: quest,
        });
    }
    for (const ach of INITIAL_ACHIEVEMENTS) {
        await prisma.achievement.upsert({
            where: { id: ach.id },
            update: ach,
            create: ach,
        });
    }
    console.log('Seed completed successfully.');
}
if (process.env.NODE_ENV !== 'test') {
    seed()
        .catch((e) => {
        console.error(e);
        process.exit(1);
    })
        .finally(async () => {
        await prisma.$disconnect();
    });
}
