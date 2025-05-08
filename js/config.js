// js/config.js

export const MAX_STAT = 100;
// --- Hunger/Food Balancing Changes ---
export const BASE_FOOD_NEED = 2.5;                 // << CHANGED from 4.0 (Significantly reduces base hunger drain)
export const HUNGER_STABILITY_LEVEL = 15;
export const FORAGE_HUNGER_GAIN = 3;                // << CHANGED from 2 (Makes manual forage slightly more effective)
export const FORAGE_COOLDOWN_SECONDS = 3;
export const FORAGE_MAX_FOOD_LEVEL = 1;
// --- End Hunger/Food Balancing Changes ---

export const SHELTER_HEALTH_MAINTENANCE_LEVEL = 15;
export const HEALTH_DECAY_NO_SHELTER = 0.15;
export const HEALTH_DECAY_LOW_HUNGER = 0.6;
// export const HUNGER_DECAY_NO_FOOD_BALANCE = 1; // Not directly used in current hunger logic calculation path
export const STAT_REGEN_RATE = 0.35;
export const BASE_INTEREST_RATE = 0.01;
export const PROMOTION_BONUS_LEVEL_INTERVAL = 5;
export const PROMOTION_BONUS_WAGE_INCREASE = 10;

export const NUM_ABBREVIATIONS = [
    { value: 1e18, symbol: "E" },{ value: 1e15, symbol: "P" },{ value: 1e12, symbol: "T" },
    { value: 1e9, symbol: "B" },{ value: 1e6, symbol: "M" },{ value: 1e3, symbol: "K" }
];

export const FOOD_LEVEL_NAMES = [
    "None", "Foraging Party", "Basic Traps", "Small Garden Plot", "Hunting & Gathering", "Simple Farming",
    "Crop Rotation Fields", "Fishing Nets", "Livestock Pen", "Orchard Groves", "Granary Storage",
    "Irrigated Farmland", "Aquaculture Ponds", "Selective Breeding Program", "Greenhouse Cultivation", "Food Preservation Techniques",
    "Mechanized Farming Tools", "Automated Crop Harvesting", "Hydroponics Bay", "Nutrient Paste Synthesis", "Bio-Engineered Food Labs"
];

export const FOOD_PRODUCTION_VALUES = [
    0,    1.5,  3.0,  5.0,  7.5, 10.0, 13.0, 16.5, 20.5, 25.0, 30.0,
    36.0, 42.5, 50.0, 58.0, 66.5, 75.0, 85.0, 96.0, 108.0, 120.0
]; // Note: Level 2 production (3.0) now exceeds the base need (2.5)

export const SHELTER_LEVEL_NAMES = [
    "None", "Leaf Lean-To", "Crude Dugout", "Basic Shack", "Wattle and Daub Hut", "Log Cabin",
    "Timber Frame House", "Stone Cottage", "Fortified Wooden Walls", "Community Longhouse", "Watchtower Outpost",
    "Underground Bunker Access", "Reinforced Structures", "Small Barracks", "Defensive Perimeter", "Medical Bay",
    "Multi-Story Habitation Block", "Geothermal Climate Control", "Blast-Proof Shelters", "Self-Sustaining Arcology", "Island Citadel"
];

export const STAGES = [
    { threshold: 0, name: "The Shore", text: "Survival is tough. Hunger and exposure constantly threaten. Upgrade Food and Shelter operations significantly!", nextThreshold: 75 },
    { threshold: 75, name: "Early Survival", text: "Food and shelter are rudimentary. You need level 15 operations to truly stabilize! Get clicks for promotions.", nextThreshold: 400 },
    { threshold: 400, name: "Stabilizing?", text: "Needs are becoming more secure. If Health or Hunger drop, it's trouble! Keep upgrading.", nextThreshold: 2000 },
    { threshold: 2000, name: "Island Community", text: "A small community forms, demanding better sustenance and housing. Are basic needs finally stable?", nextThreshold: 8000 },
    { threshold: 8000, name: "Budding Economy", text: "If basic needs are met, focus on increasing your income through promotions and prizes.", nextThreshold: 40000 },
    { threshold: 40000, name: "Technological Growth", text: "Advanced structures and operations are now possible. The dream of something bigger is forming.", nextThreshold: 200000 },
    { threshold: 200000, name: "Regional Power", text: "Your island nation is influential. What's next on the horizon?", nextThreshold: 800000 },
    { threshold: 800000, name: "The Space Dream", text: "The stars, once distant lights, now seem within reach. The ultimate goal: colonize space!", nextThreshold: Infinity }
];
