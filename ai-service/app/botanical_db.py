"""
Curated Botanical Knowledge Graph for FloraQuest AI Inference Service.
"""
from typing import Dict, Any, Optional

BOTANICAL_TAXONOMY: Dict[str, Dict[str, Any]] = {
    "daisy": {
        "species_name": "Daisy",
        "scientific_name": "Bellis perennis",
        "family": "Asteraceae",
        "common_names": ["Common Daisy", "Lawn Daisy", "English Daisy"],
        "description": "Charming perennial herbaceous plant featuring clean white composite florets surrounding a radiant golden center disc.",
        "native_region": "Western, central and northern Europe",
        "sunlight": "Full sun to partial shade (4-6 hours direct light daily)",
        "watering": "Moderate watering when top 1 inch of soil feels dry",
        "soil": "Well-drained, fertile, loamy soil with neutral pH (6.0 - 7.0)",
        "humidity": "Standard ambient humidity (40-60%)",
        "toxicity": "Non-toxic to cats and dogs (ASPCA certified safe)",
        "pet_safe": True,
        "propagation": "Seed sowing in early spring or root clump division in autumn",
        "ecological_fact": "Composite flower structure acts as a high-efficiency landing platform for wild bees and syrphid hoverflies.",
        "difficulty": "Beginner"
    },
    "pot, flowerpot": {
        "species_name": "Potted Houseplant",
        "scientific_name": "Plantae (Cultivated Potted Variety)",
        "family": "Araceae / Succulent / Foliage",
        "common_names": ["Indoor Container Plant", "Potted Foliage", "Houseplant"],
        "description": "Cultivated indoor plant thriving in container environments with specialized potting media.",
        "native_region": "Subtropical & Tropical understory climates",
        "sunlight": "Bright indirect light; protect from intense midday scorching sun",
        "watering": "Allow top 50% of potting mix to dry before thorough deep soaking",
        "soil": "Aroid mix (coco coir, orchid bark, perlite, horticultural charcoal)",
        "humidity": "Elevated humidity (50-70%) promotes vigorous leaf development",
        "toxicity": "Varies by specific species (keep away from curious pets as precaution)",
        "pet_safe": False,
        "propagation": "Stem node cuttings rooted in clean water or sphagnum moss",
        "ecological_fact": "Indoor container plants significantly boost room air micro-humidity and human psychological focus.",
        "difficulty": "Intermediate"
    },
    "rosehip": {
        "species_name": "Rosehip / Wild Rose",
        "scientific_name": "Rosa canina",
        "family": "Rosaceae",
        "common_names": ["Dog Rose", "Wild Rose", "Rose Haw"],
        "description": "Hardy wild climbing shrub bearing delicate pale pink blooms followed by nutrient-dense scarlet rosehip fruits.",
        "native_region": "Europe, Northwest Africa, and Western Asia",
        "sunlight": "Full sun for maximum blossom and fruit production (6+ hours)",
        "watering": "Deep weekly watering during summer; drought-tolerant once established",
        "soil": "Moist, rich, well-draining clay-loam soil",
        "humidity": "Moderate outdoor humidity (45-65%)",
        "toxicity": "Non-toxic; rosehips are exceptionally rich in natural Vitamin C",
        "pet_safe": True,
        "propagation": "Hardwood cuttings in winter or cold-stratified seeds in autumn",
        "ecological_fact": "Crucial winter survival food source for migratory birds like thrushes, waxwings, and blackbirds.",
        "difficulty": "Intermediate"
    },
    "sunflower": {
        "species_name": "Sunflower",
        "scientific_name": "Helianthus annuus",
        "family": "Asteraceae",
        "common_names": ["Common Sunflower", "Golden Solar Bloom"],
        "description": "Fast-growing annual recognized for its large golden flower heads that exhibit heliotropism.",
        "native_region": "North America",
        "sunlight": "Direct uninterrupted full sunlight (6-8+ hours daily)",
        "watering": "Deep regular watering during budding and flowering stages",
        "soil": "Deep, nutrient-rich, loose soil with excellent drainage",
        "humidity": "Low to moderate outdoor humidity (30-50%)",
        "toxicity": "Non-toxic to cats, dogs, and horses (ASPCA certified safe)",
        "pet_safe": True,
        "propagation": "Direct seed sowing outdoors after last spring frost",
        "ecological_fact": "Sunflower seed heads exhibit Fibonacci spiral geometry and support hundreds of pollinator species.",
        "difficulty": "Beginner"
    },
    "monstera": {
        "species_name": "Swiss Cheese Plant",
        "scientific_name": "Monstera deliciosa",
        "family": "Araceae",
        "common_names": ["Monstera", "Split-Leaf Philodendron", "Ceriman"],
        "description": "Iconic tropical climbing vine with dramatic fenestrated (split) evergreen foliage.",
        "native_region": "Tropical rainforests of Southern Mexico and Central America",
        "sunlight": "Bright indirect light; tolerates medium light but develops fewer splits",
        "watering": "Water every 1-2 weeks; allow top 2-3 inches of soil to dry out",
        "soil": "Chunky, aerated aroid potting mix with perlite and pine bark",
        "humidity": "High humidity (60-80%); benefits from ambient misting",
        "toxicity": "Toxic to pets if chewed (contains insoluble calcium oxalate crystals)",
        "pet_safe": False,
        "propagation": "Stem cuttings with at least one node and aerial root",
        "ecological_fact": "Leaf fenestrations allow torrential jungle rain and dappled sunlight to pass through to lower foliage.",
        "difficulty": "Intermediate"
    }
}

def lookup_botanical_info(label: str) -> Optional[Dict[str, Any]]:
    """Lookup botanical knowledge by predicted synset label or keyword match."""
    normalized = label.lower().strip()
    if normalized in BOTANICAL_TAXONOMY:
        return BOTANICAL_TAXONOMY[normalized]
    
    # Keyword search
    for key, info in BOTANICAL_TAXONOMY.items():
        if key in normalized or normalized in key:
            return info
        if any(alias.lower() in normalized for alias in info.get("common_names", [])):
            return info
            
    # Fallback botanical card
    return {
        "species_name": label.replace("_", " ").title(),
        "scientific_name": f"Botanical Synset ({label})",
        "family": "Plantae",
        "common_names": [label.replace("_", " ").title()],
        "description": f"Botanical specimen visually classified under ImageNet category '{label}'.",
        "native_region": "Temperate & Subtropical regions",
        "sunlight": "Bright indirect sunlight",
        "watering": "Water when topsoil feels dry to touch",
        "soil": "Well-drained all-purpose organic potting soil",
        "humidity": "Moderate ambient humidity (40-60%)",
        "toxicity": "Check specific genus before allowing pet contact",
        "pet_safe": False,
        "propagation": "Seed or stem cutting depending on plant habit",
        "ecological_fact": "Contributes to biodiversity and local pollinator habitat.",
        "difficulty": "Intermediate"
    }
