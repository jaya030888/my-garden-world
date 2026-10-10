import { BotanicalInfo } from '../types';

export const BOTANICAL_DATABASE: Record<string, BotanicalInfo> = {
  daisy: {
    speciesName: 'Common Daisy',
    commonNames: ['English Daisy', 'Lawn Daisy', 'Bruisewort'],
    scientificName: 'Bellis perennis',
    family: 'Asteraceae (Composite Family)',
    description: 'A cheerful European native with a rosette of spoon-shaped leaves and classic white ray florets surrounding a bright yellow center disc.',
    nativeRegion: 'Western, central and northern Europe',
    sunlight: 'Full sun to partial shade (4-6 hours direct sun)',
    watering: 'Moderate; keep soil evenly moist but well-drained. Water 1-2 times weekly.',
    soil: 'Well-draining loamy or sandy soil with neutral pH (6.0 - 7.5)',
    humidity: 'Average ambient humidity (40-60%)',
    toxicity: 'Non-toxic to cats, dogs, and horses (ASPCA verified).',
    petSafe: true,
    propagation: 'By seed in spring or clump division in autumn.',
    ecologicalFact: 'Bellis perennis is a vital early-spring nectar source for native solitary bees and hoverflies when other blooms are scarce.',
    difficulty: 'Beginner',
    tags: ['Flower', 'Wildflower', 'Pollinator-Friendly', 'Edible Bloom']
  },
  sunflower: {
    speciesName: 'Common Sunflower',
    commonNames: ['Sunflower', 'Helianthus', 'Miradulce'],
    scientificName: 'Helianthus annuus',
    family: 'Asteraceae',
    description: 'A tall annual known for its giant, radiant golden flower heads that practice heliotropism (tracking the sun across the sky during early growth).',
    nativeRegion: 'North America',
    sunlight: 'Full direct sun (minimum 6-8 hours daily)',
    watering: 'Deep, infrequent watering once established; soak soil 1-2 inches weekly.',
    soil: 'Nutrient-rich, loose, well-draining soil with good depth for deep taproots.',
    humidity: 'Tolerates wide humidity ranges (30-70%)',
    toxicity: 'Non-toxic to dogs, cats, and pets.',
    petSafe: true,
    propagation: 'Direct seed sowing in warm late spring soil.',
    ecologicalFact: 'Sunflowers are hyperaccumulators capable of phytoremediation—absorbing toxic heavy metals like lead and arsenic from polluted soils.',
    difficulty: 'Beginner',
    tags: ['Annual', 'Tall', 'Bird Feeder', 'Pollinator Magnet']
  },
  'pot, flowerpot': {
    speciesName: 'Potted Botanical / Houseplant',
    commonNames: ['Container Garden Plant', 'Indoor Foliage', 'Monstera / Pothos Specimen'],
    scientificName: 'Epipremnum aureum / Monstera deliciosa',
    family: 'Araceae (Arum Family)',
    description: 'A vibrant cultivated plant grown in indoor containers, characterized by lush air-purifying foliage and adaptable growth habits.',
    nativeRegion: 'Tropical rainforest understories (Central America & SE Asia)',
    sunlight: 'Bright indirect light; avoid harsh midday direct sun which scorches foliage.',
    watering: 'Allow top 1-2 inches of potting mix to dry between thorough waterings.',
    soil: 'Aerated, chunky aroid potting mix (peat/coco coir, perlite, orchid bark).',
    humidity: 'Moderate to high (50-70% ideal)',
    toxicity: 'Mildly toxic if ingested due to insoluble calcium oxalate crystals; keep away from curious pets.',
    petSafe: false,
    propagation: 'Stem cuttings rooted in clean water or sphagnum moss.',
    ecologicalFact: 'Indoor plants increase indoor air humidity and capture fine particulate matter on leaf surfaces.',
    difficulty: 'Beginner',
    tags: ['Houseplant', 'Aroid', 'Air Purifying', 'Foliage']
  },
  'hip, rose hip, rosehip': {
    speciesName: 'Wild Rose / Rosehip',
    commonNames: ['Sweet Briar', 'Eglantine Rose', 'Dog Rose'],
    scientificName: 'Rosa rubiginosa / Rosa canina',
    family: 'Rosaceae',
    description: 'A thorny deciduous shrub featuring fragrant pale pink blooms followed by nutrient-dense bright scarlet seed pods (rose hips).',
    nativeRegion: 'Europe, Western Asia, Northwest Africa',
    sunlight: 'Full sun to light afternoon shade (at least 6 hours direct sun)',
    watering: 'Water regularly at the root base; drought-tolerant once established.',
    soil: 'Rich, moist, well-drained loam with pH 6.0 - 6.5.',
    humidity: 'Moderate humidity with good air circulation to deter fungal mildew.',
    toxicity: 'Non-toxic; rose hips are packed with Vitamin C and flavonoids.',
    petSafe: true,
    propagation: 'Hardwood cuttings in late autumn or cold-stratified seeds.',
    ecologicalFact: 'Rose hips persist through winter, providing essential emergency sustenance for songbirds and small forest mammals.',
    difficulty: 'Intermediate',
    tags: ['Shrub', 'Edible', 'Medicinal', 'Wildlife Habitat']
  },
  monstera: {
    speciesName: 'Monstera Deliciosa',
    commonNames: ['Swiss Cheese Plant', 'Split-Leaf Philodendron', 'Fruit Salad Plant'],
    scientificName: 'Monstera deliciosa',
    family: 'Araceae',
    description: 'An iconic tropical climbing epiphyte celebrated for its dramatic glossy green leaves that develop natural fenestrations (slits and holes).',
    nativeRegion: 'Tropical forests of Southern Mexico to Panama',
    sunlight: 'Medium to bright indirect light.',
    watering: 'Water every 1-2 weeks, allowing potting mix to dry out halfway down.',
    soil: 'Peat-based potting mix with coarse perlite and pine bark chunks.',
    humidity: 'Appreciates 60%+ humidity; mist leaves or use a pebble tray.',
    toxicity: 'Toxic to pets if chewed (calcium oxalate crystals cause oral irritation).',
    petSafe: false,
    propagation: 'Node cuttings with aerial root in water or moist moss.',
    ecologicalFact: 'Leaf fenestrations allow tropical winds and filtered sunlight to pass through to lower forest layers without tearing the foliage.',
    difficulty: 'Beginner',
    tags: ['Tropical', 'Climber', 'Statement Plant', 'Aroid']
  },
  pothos: {
    speciesName: 'Golden Pothos',
    commonNames: ["Devil's Ivy", 'Ceylon Creeper', "Hunter's Robe"],
    scientificName: 'Epipremnum aureum',
    family: 'Araceae',
    description: 'An exceptionally hardy trailing vine with heart-shaped emerald green leaves marbled with creamy gold variegation.',
    nativeRegion: 'Mo\'orea, Society Islands (French Polynesia)',
    sunlight: 'Low to bright indirect light; very tolerant of low light.',
    watering: 'Water thoroughly when soil is 75% dry; drought-forgiving.',
    soil: 'Standard well-draining houseplant potting soil.',
    humidity: 'Thrives in normal household humidity (30-50%).',
    toxicity: 'Mildly toxic to pets if consumed.',
    petSafe: false,
    propagation: 'Extremely easy stem cutting rooting in clean water.',
    ecologicalFact: 'Ranked in NASA Clean Air Studies for its ability to filter formaldehyde, benzene, and xylene from indoor spaces.',
    difficulty: 'Beginner',
    tags: ['Hardy', 'Trailing', 'Low Light', 'Fast Growing']
  },
  succulent: {
    speciesName: 'Echeveria Elegans',
    commonNames: ['Mexican Snowball', 'Alabaster Rose', 'Hens and Chicks'],
    scientificName: 'Echeveria elegans',
    family: 'Crassulaceae',
    description: 'A compact drought-adapted succulent forming tight geometric rosettes of pale silvery-blue fleshy leaves.',
    nativeRegion: 'Semi-desert regions of Mexico (Hidalgo)',
    sunlight: 'Full direct sunlight (at least 6 hours of bright light)',
    watering: '"Soak and dry" method; water only when soil is completely dry to prevent rot.',
    soil: 'Gritty cactus/succulent mix with high pumice or coarse sand content.',
    humidity: 'Low humidity (under 40%); sensitive to high stagnant humidity.',
    toxicity: 'Non-toxic and pet-safe for dogs and cats.',
    petSafe: true,
    propagation: 'Leaf pullings or separating offsets ("chicks") from mother plant.',
    ecologicalFact: 'Uses Crassulacean Acid Metabolism (CAM) photosynthesis, opening stomata at night to conserve precious water in arid habitats.',
    difficulty: 'Beginner',
    tags: ['Succulent', 'Drought-Tolerant', 'Geometric', 'Pet-Safe']
  },
  lavender: {
    speciesName: 'English Lavender',
    commonNames: ['True Lavender', 'Common Lavender', 'Garden Lavender'],
    scientificName: 'Lavandula angustifolia',
    family: 'Lamiaceae (Mint Family)',
    description: 'An aromatic evergreen sub-shrub with slender grey-green foliage and spikes of intensely fragrant purple-violet flowers.',
    nativeRegion: 'Mediterranean (Spain, France, Italy)',
    sunlight: 'Full blazing sun (6-8+ hours direct sunlight daily)',
    watering: 'Low water requirement; let soil dry completely between light waterings.',
    soil: 'Well-draining, gravelly, alkaline soil (pH 6.5 - 7.5). Avoid heavy wet clay.',
    humidity: 'Low to moderate humidity; needs good wind and airflow.',
    toxicity: 'Contains small amounts of linalool; mildly toxic in large quantities to pets.',
    petSafe: false,
    propagation: 'Semi-hardwood cuttings taken in summer.',
    ecologicalFact: 'Essential oil compounds deter garden pests like mosquitoes and ticks while serving as a premier food source for honeybees and bumblebees.',
    difficulty: 'Intermediate',
    tags: ['Aromatic', 'Herb', 'Pollinator Haven', 'Drought-Tolerant']
  },
  fern: {
    speciesName: 'Boston Fern',
    commonNames: ['Sword Fern', 'Fishbone Fern', 'Wild Boston Fern'],
    scientificName: 'Nephrolepis exaltata',
    family: 'Lomariopsidaceae',
    description: 'A timeless graceful fern featuring arching, feathery fronds of bright chartreuse to emerald green.',
    nativeRegion: 'Humid tropical swamps and forests of the Americas',
    sunlight: 'Bright filtered indirect light or morning dappled shade.',
    watering: 'Consistently moist soil; never let root ball dry out completely.',
    soil: 'Rich, moisture-retentive peat potting mix amended with perlite.',
    humidity: 'High humidity (60-80% required); loves bathroom placement or daily misting.',
    toxicity: '100% non-toxic and pet safe (ASPCA verified).',
    petSafe: true,
    propagation: 'Division of rhizome runners during spring repotting.',
    ecologicalFact: 'Ferns are ancient vascular plants that predate flowering plants by over 200 million years, reproducing via microscopic spores on frond undersides.',
    difficulty: 'Intermediate',
    tags: ['Ancient', 'Pet-Safe', 'High Humidity', 'Air Purifying']
  },
  mushroom: {
    speciesName: 'Forest Fungi / Agaric',
    commonNames: ['Wild Woodland Mushroom', 'Field Mushroom', 'Forest Spore Fungi'],
    scientificName: 'Agaricus / Mycena sp.',
    family: 'Agaricaceae',
    description: 'A fascinating fruiting body of subterranean mycelial networks that flourishes in damp woodland leaf litter.',
    nativeRegion: 'Temperate forest biomes worldwide',
    sunlight: 'Damp shaded forest floors and understories.',
    watering: 'Requires high environmental moisture and damp organic substrate.',
    soil: 'Decomposing organic matter, leaf humus, and rich woodland soil.',
    humidity: 'High ambient humidity (80-95%)',
    toxicity: 'Caution: Never consume wild mushrooms without expert mycological identification.',
    petSafe: false,
    propagation: 'Wind-dispersed microscopic fungal spores.',
    ecologicalFact: 'Fungal mycelium forms mycorrhizal networks—the "Wood Wide Web"—sharing water, carbon, and mineral nutrients between forest trees.',
    difficulty: 'Expert',
    tags: ['Fungi', 'Mycelium', 'Decomposer', 'Woodland']
  }
};

/**
 * Maps a raw model classification label (e.g. from ImageNet/ViT) to the closest botanical knowledge entry.
 */
export function getBotanicalInfoForLabel(rawLabel: string): BotanicalInfo {
  const clean = rawLabel.toLowerCase().trim();
  
  // Exact match
  if (BOTANICAL_DATABASE[clean]) {
    return BOTANICAL_DATABASE[clean];
  }

  // Keyword / Substring match
  if (clean.includes('daisy') || clean.includes('aster') || clean.includes('chamomile')) {
    return BOTANICAL_DATABASE['daisy'];
  }
  if (clean.includes('sunflower') || clean.includes('rapeseed') || clean.includes('yellow')) {
    return BOTANICAL_DATABASE['sunflower'];
  }
  if (clean.includes('rose') || clean.includes('hip') || clean.includes('shrub') || clean.includes('briar')) {
    return BOTANICAL_DATABASE['hip, rose hip, rosehip'];
  }
  if (clean.includes('pot') || clean.includes('vase') || clean.includes('greenhouse') || clean.includes('plant')) {
    return BOTANICAL_DATABASE['pot, flowerpot'];
  }
  if (clean.includes('monstera') || clean.includes('philodendron') || clean.includes('leaf') || clean.includes('aroid')) {
    return BOTANICAL_DATABASE['monstera'];
  }
  if (clean.includes('pothos') || clean.includes('ivy') || clean.includes('vine')) {
    return BOTANICAL_DATABASE['pothos'];
  }
  if (clean.includes('succulent') || clean.includes('cactus') || clean.includes('crassula') || clean.includes('agave')) {
    return BOTANICAL_DATABASE['succulent'];
  }
  if (clean.includes('lavender') || clean.includes('mint') || clean.includes('herb') || clean.includes('salvia')) {
    return BOTANICAL_DATABASE['lavender'];
  }
  if (clean.includes('fern') || clean.includes('moss') || clean.includes('spore')) {
    return BOTANICAL_DATABASE['fern'];
  }
  if (clean.includes('mushroom') || clean.includes('fungus') || clean.includes('agaric') || clean.includes('bolete')) {
    return BOTANICAL_DATABASE['mushroom'];
  }

  // Fallback enriched botanical discovery profile
  const formattedTitle = clean.split(',')[0].trim().replace(/^\w/, c => c.toUpperCase());
  return {
    speciesName: `${formattedTitle} Specimen`,
    commonNames: [formattedTitle, 'Botanical Find'],
    scientificName: `Plantae sp. (${clean.split(',')[0]})`,
    family: 'Plantae (Plant Kingdom)',
    description: `A distinct botanical specimen identified with visual characteristics matching ${clean}. Observed in outdoor or botanical habitat.`,
    nativeRegion: 'Cosmopolitan distribution',
    sunlight: 'Medium to bright natural ambient light',
    watering: 'Check soil moisture before watering; adjust according to seasonal growth.',
    soil: 'Well-draining, balanced potting or garden soil mix.',
    humidity: 'Moderate ambient outdoor or indoor humidity (40-60%)',
    toxicity: 'Research local species before allowing pets or small children to contact.',
    petSafe: true,
    propagation: 'Stem cuttings or seed dispersal.',
    ecologicalFact: 'All living plants photosynthesize to fix atmospheric carbon dioxide into oxygen and biomass, anchoring terrestrial food webs.',
    difficulty: 'Intermediate',
    tags: ['Botanical Specimen', 'Nature Discovery', 'Photosynthetic', 'Outdoor Observation']
  };
}
