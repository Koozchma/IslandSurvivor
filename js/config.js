// js/config.js

// --- Survival Constants ---
export const MAX_STAT = 100;
export const BASE_FOOD_NEED = 2.5; // Base hunger drain offset by production
export const HUNGER_STABILITY_LEVEL = 15; // Food level where hunger can regen above base need
export const SHELTER_HEALTH_MAINTENANCE_LEVEL = 15; // Shelter level needed to prevent decay
export const HEALTH_DECAY_NO_SHELTER = 0.15; // Health lost/sec below required shelter level
export const HEALTH_DECAY_LOW_HUNGER = 0.6; // Additional health lost/sec if hunger < 25
export const STAT_REGEN_RATE = 0.35; // Base regen rate for health/hunger when conditions met
export const FORAGE_HUNGER_GAIN = 3;
export const FORAGE_COOLDOWN_SECONDS = 3;
export const FORAGE_MAX_FOOD_LEVEL = 1; // Show forage button at food level 0 and 1

// --- Economy Constants ---
export const BASE_INTEREST_RATE = 0.01;
export const PROMOTION_BONUS_LEVEL_INTERVAL = 5;
export const PROMOTION_BONUS_WAGE_INCREASE = 10;

// --- Utility ---
export const NUM_ABBREVIATIONS = [
    { value: 1e18, symbol: "E" },{ value: 1e15, symbol: "P" },{ value: 1e12, symbol: "T" },
    { value: 1e9, symbol: "B" },{ value: 1e6, symbol: "M" },{ value: 1e3, symbol: "K" }
];

// --- Need Level Names/Data ---
export const FOOD_LEVEL_NAMES = [
    "None", "Foraging Party", "Basic Traps", "Small Garden Plot", "Hunting & Gathering", "Simple Farming",
    "Crop Rotation Fields", "Fishing Nets", "Livestock Pen", "Orchard Groves", "Granary Storage",
    "Irrigated Farmland", "Aquaculture Ponds", "Selective Breeding Program", "Greenhouse Cultivation", "Food Preservation Techniques",
    "Mechanized Farming Tools", "Automated Crop Harvesting", "Hydroponics Bay", "Nutrient Paste Synthesis", "Bio-Engineered Food Labs"
];
export const FOOD_PRODUCTION_VALUES = [ // Corresponds to levels 0-20
    0,    1.5,  3.0,  5.0,  7.5, 10.0, 13.0, 16.5, 20.5, 25.0, 30.0,
    36.0, 42.5, 50.0, 58.0, 66.5, 75.0, 85.0, 96.0, 108.0, 120.0
];
export const SHELTER_LEVEL_NAMES = [
    "None", "Leaf Lean-To", "Crude Dugout", "Basic Shack", "Wattle and Daub Hut", "Log Cabin",
    "Timber Frame House", "Stone Cottage", "Fortified Wooden Walls", "Community Longhouse", "Watchtower Outpost",
    "Underground Bunker Access", "Reinforced Structures", "Small Barracks", "Defensive Perimeter", "Medical Bay",
    "Multi-Story Habitation Block", "Geothermal Climate Control", "Blast-Proof Shelters", "Self-Sustaining Arcology", "Island Citadel"
];

// --- Factory Definitions ---
export const FACTORY_DATA = {
    // id: { name, icon, baseCost, costMultiplier, baseCps, cpsMultiplier }
    scrapYard: {
        name: "Scrap Yard", icon: "♻️", baseCost: 10, costMultiplier: 1.15,
        baseCps: 0.1, cpsMultiplier: 1.08 // CPS = baseCps * (cpsMultiplier ^ (level - 1)) * level - Adjusted example
    },
    workshop: {
        name: "Basic Workshop", icon: "🔧", baseCost: 100, costMultiplier: 1.20,
        baseCps: 1, cpsMultiplier: 1.10
    },
    assembler: {
        name: "Component Assembler", icon: "⚙️", baseCost: 1200, costMultiplier: 1.25,
        baseCps: 8, cpsMultiplier: 1.12
    },
    refinery: {
        name: "Ore Refinery", icon: "⛏️", baseCost: 15000, costMultiplier: 1.30,
        baseCps: 50, cpsMultiplier: 1.15
    },
    lab: {
        name: "Advanced Lab", icon: "🔬", baseCost: 200000, costMultiplier: 1.35,
        baseCps: 300, cpsMultiplier: 1.18
    }
};

// --- Storyline Stages ---
export const STAGES = [ // Needs re-evaluation based on combined mechanics
    { threshold: 0, name: "The Shore", text: "Survival is paramount. Manage Health & Hunger. Earn capital for basic upgrades.", nextThreshold: 75 },
    { threshold: 75, name: "Early Survival", text: "Basic needs are costly. Upgrade Food/Shelter towards Lvl 15 and seek Promotions for better wages.", nextThreshold: 400 },
    { threshold: 400, name: "Stabilizing?", text: "Can you afford a Scrap Yard? Balancing survival needs and industrial investment is key.", nextThreshold: 2000 },
    { threshold: 2000, name: "First Industry", text: "Factories add passive income, but don't neglect survival needs or promotions!", nextThreshold: 10000 }, // Increased threshold
    { threshold: 10000, name: "Growing Hub", text: "Expand your factories while ensuring your population's well-being.", nextThreshold: 50000 },
    { threshold: 50000, name: "Technological Growth", text: "Advanced factories require significant capital. Are your basic needs fully automated/stable?", nextThreshold: 250000 },
    { threshold: 250000, name: "Regional Power", text: "Your island nation is influential. What's next on the horizon?", nextThreshold: 1000000 },
    { threshold: 1000000, name: "The Space Dream", text: "The stars beckon. Can your economy support interstellar ambitions?", nextThreshold: Infinity }
];
