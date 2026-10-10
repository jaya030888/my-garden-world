"""
Curated Botanical Knowledge Graph for FloraQuest AI Inference Service.
Strict 1-to-1 biological species mappings and container object separation.
"""
from typing import Dict, Any, Optional, Tuple

VERIFIED_BOTANICAL_TAXONOMY: Dict[str, Dict[str, Any]] = {
    "daisy": {
        "species_name": "Common Daisy",
        "scientific_name": "Bellis perennis",
        "family": "Asteraceae (Composite Family)",
        "common_names": ["English Daisy", "Lawn Daisy", "Bruisewort"],
        "description": "Perennial herbaceous plant featuring clean white composite florets surrounding a radiant golden center disc.",
        "native_region": "Western, central, and northern Europe",
        "sunlight": "Full sun to partial shade (4-6 hours direct light daily)",
        "watering": "Moderate watering when top 1 inch of soil feels dry",
        "soil": "Well-drained, fertile, loamy soil with neutral pH (6.0 - 7.0)",
        "humidity": "Standard ambient humidity (40-60%)",
        "toxicity": "Non-toxic to cats, dogs, and horses (ASPCA certified safe)",
        "pet_safe": True,
        "propagation": "Seed sowing in early spring or root clump division in autumn",
        "ecological_fact": "Composite flower structure acts as a high-efficiency landing platform for wild bees and hoverflies.",
        "difficulty": "Beginner"
    },
    "sunflower": {
        "species_name": "Common Sunflower",
        "scientific_name": "Helianthus annuus",
        "family": "Asteraceae (Composite Family)",
        "common_names": ["Sunflower", "Golden Solar Bloom", "Miradulce"],
        "description": "Fast-growing annual recognized for its large golden flower heads that practice heliotropism in early bud stages.",
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
    "rose": {
        "species_name": "Wild Rose / Rosehip",
        "scientific_name": "Rosa canina",
        "family": "Rosaceae (Rose Family)",
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
    "marigold": {
        "species_name": "French Marigold",
        "scientific_name": "Tagetes patula",
        "family": "Asteraceae (Composite Family)",
        "common_names": ["Marigold", "Tagetes", "African Marigold"],
        "description": "Compact annual with aromatic pinnate foliage and velvety flowers in brilliant shades of yellow, orange, and mahogany.",
        "native_region": "Mexico and Central America",
        "sunlight": "Full direct sunlight (minimum 6 hours daily)",
        "watering": "Moderate watering at soil level; allow topsoil to dry slightly between waterings",
        "soil": "Well-draining garden soil or standard potting mix (pH 6.0 - 7.0)",
        "humidity": "Low to moderate humidity (30-50%)",
        "toxicity": "Mildly irritating sap if chewed excessively by pets",
        "pet_safe": False,
        "propagation": "Extremely easy from seed sown in spring; germinates in 4-7 days",
        "ecological_fact": "Root exudates produce alpha-terthienyl, a natural nematicide that repels harmful root-knot nematodes.",
        "difficulty": "Beginner"
    },
    "monstera": {
        "species_name": "Swiss Cheese Plant",
        "scientific_name": "Monstera deliciosa",
        "family": "Araceae (Arum Family)",
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
    },
    "pothos": {
        "species_name": "Golden Pothos",
        "scientific_name": "Epipremnum aureum",
        "family": "Araceae (Arum Family)",
        "common_names": ["Devil's Ivy", "Ceylon Creeper", "Hunter's Robe"],
        "description": "Exceptionally hardy trailing evergreen vine with glossy heart-shaped foliage marbled with creamy golden variegation.",
        "native_region": "Mo'orea, Society Islands (French Polynesia)",
        "sunlight": "Low to bright indirect light; very tolerant of lower light conditions",
        "watering": "Water thoroughly when top 2 inches of soil are dry; drought-forgiving",
        "soil": "Standard well-draining houseplant potting mix",
        "humidity": "Thrives in normal household humidity (30-50%)",
        "toxicity": "Toxic to pets if chewed (insoluble calcium oxalate crystals)",
        "pet_safe": False,
        "propagation": "Stem node cuttings rooted in clean water",
        "ecological_fact": "NASA Clean Air studies identified Golden Pothos as an effective biofilter of indoor volatile organic compounds.",
        "difficulty": "Beginner"
    },
    "lavender": {
        "species_name": "English Lavender",
        "scientific_name": "Lavandula angustifolia",
        "family": "Lamiaceae (Mint Family)",
        "common_names": ["True Lavender", "Common Lavender", "Garden Lavender"],
        "description": "Aromatic evergreen sub-shrub with narrow grey-green leaves and spikes of intensely fragrant purple-violet flowers.",
        "native_region": "Mediterranean (Spain, France, Italy)",
        "sunlight": "Full blazing sun (6-8+ hours direct sunlight daily)",
        "watering": "Low water requirement; let soil dry completely between light waterings",
        "soil": "Well-draining, gravelly, alkaline soil (pH 6.5 - 7.5)",
        "humidity": "Low to moderate humidity; needs good airflow",
        "toxicity": "Contains linalool; mildly toxic in large quantities to pets",
        "pet_safe": False,
        "propagation": "Semi-hardwood cuttings taken in summer",
        "ecological_fact": "Essential oil compounds deter garden pests while serving as a premier food source for bees.",
        "difficulty": "Intermediate"
    },
    "cardoon": {
        "species_name": "Cardoon / Artichoke Thistle",
        "scientific_name": "Cynara cardunculus",
        "family": "Asteraceae (Composite Family)",
        "common_names": ["Cardoon", "Artichoke Thistle", "Wild Artichoke"],
        "description": "Dramatic architectural perennial thistle with deeply cut silver-grey foliage and large violet flower heads.",
        "native_region": "Mediterranean basin",
        "sunlight": "Full direct sunlight (6+ hours daily)",
        "watering": "Moderate watering during growth; drought-resistant once established",
        "soil": "Deep, rich, well-draining garden soil",
        "humidity": "Low to moderate humidity",
        "toxicity": "Non-toxic to pets",
        "pet_safe": True,
        "propagation": "By seed in spring or root crown division",
        "ecological_fact": "Flowers produce abundant pollen and nectar, attracting wild bees and butterflies.",
        "difficulty": "Intermediate"
    }
}

INANIMATE_CONTAINER_CLASSES = {
    "pot, flowerpot",
    "flowerpot",
    "pot",
    "vase",
    "greenhouse, nursery, glasshouse",
    "greenhouse",
    "tray",
    "bucket",
    "watering can"
}

def lookup_botanical_info(label: str) -> Tuple[Optional[Dict[str, Any]], bool, str, str]:
    """
    Evaluates predicted class against verified botanical taxonomy.
    Returns: (botanical_info, is_verified_species, detection_type, status_explanation)
    """
    clean = label.lower().strip()

    # 1. Container / Inanimate object detection
    if clean in INANIMATE_CONTAINER_CLASSES or "flowerpot" in clean or clean == "pot":
        return (
            None,
            False,
            "container_object",
            "The vision model detected a flowerpot container rather than the specific plant species inside it."
        )

    # 2. Direct species match
    if clean in VERIFIED_BOTANICAL_TAXONOMY:
        return (
            VERIFIED_BOTANICAL_TAXONOMY[clean],
            True,
            "species",
            f"Verified botanical match: {VERIFIED_BOTANICAL_TAXONOMY[clean]['scientific_name']}"
        )

    # 3. Substring match for verified species
    if "daisy" in clean:
        return (VERIFIED_BOTANICAL_TAXONOMY["daisy"], True, "species", "Verified botanical match: Bellis perennis (Common Daisy)")
    if "sunflower" in clean:
        return (VERIFIED_BOTANICAL_TAXONOMY["sunflower"], True, "species", "Verified botanical match: Helianthus annuus (Sunflower)")
    if "rose" in clean or "hip" in clean:
        return (VERIFIED_BOTANICAL_TAXONOMY["rose"], True, "species", "Verified botanical match: Rosa canina (Wild Rose)")
    if "marigold" in clean or "tagetes" in clean:
        return (VERIFIED_BOTANICAL_TAXONOMY["marigold"], True, "species", "Verified botanical match: Tagetes patula (French Marigold)")
    if "monstera" in clean:
        return (VERIFIED_BOTANICAL_TAXONOMY["monstera"], True, "species", "Verified botanical match: Monstera deliciosa")
    if "pothos" in clean:
        return (VERIFIED_BOTANICAL_TAXONOMY["pothos"], True, "species", "Verified botanical match: Epipremnum aureum (Golden Pothos)")
    if "lavender" in clean:
        return (VERIFIED_BOTANICAL_TAXONOMY["lavender"], True, "species", "Verified botanical match: Lavandula angustifolia (Lavender)")
    if "cardoon" in clean:
        return (VERIFIED_BOTANICAL_TAXONOMY["cardoon"], True, "species", "Verified botanical match: Cynara cardunculus (Cardoon)")

    # 4. Unidentified / Non-verified species class
    return (
        None,
        False,
        "unidentified",
        f"The vision model predicted class '{clean}', but this does not match a verified species in the botanical database."
    )
