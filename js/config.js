// js/config.js

export const MAX_STAT = 100;
export const POPULATION_FOOD_CONSUMPTION_RATE = 4; // Reduced from 5
export const SHELTER_HEALTH_MAINTENANCE_LEVEL = 3; // Reduced from 5
export const HEALTH_DECAY_NO_SHELTER = 0.35;        // Reduced from 0.5
export const HEALTH_DECAY_LOW_HUNGER = 0.6;         // Slightly reduced from 0.75
export const HUNGER_DECAY_NO_FOOD_BALANCE = 1;      // Kept at 1, balance is key
export const STAT_REGEN_RATE = 0.35;                // Increased from 0.2/0.3
export const BASE_INTEREST_RATE = 0.01;

export const NUM_ABBREVIATIONS = [
    { value: 1e18, symbol: "E" },{ value: 1e15, symbol: "P" },{ value: 1e12, symbol: "T" },
    { value: 1e9, symbol: "B" },{ value: 1e6, symbol: "M" },{ value: 1e3, symbol: "K" }
];

export const FOOD_LEVEL_NAMES = [
    "None", "Foraging Party", "Basic Traps", "Small Garden Plot", "Hunting & Gathering", "Simple Farming", // Lv 0-5
    "Crop Rotation Fields", "Fishing Nets", "Livestock Pen", "Orchard Groves", "Granary Storage", // Lv 6-10
    "Irrigated Farmland", "Aquaculture Ponds", "Selective Breeding Program", "Greenhouse Cultivation", "Food Preservation Techniques", // Lv 11-15
    "Mechanized Farming Tools", "Automated Crop Harvesting", "Hydroponics Bay", "Nutrient Paste Synthesis", "Bio-Engineered Food Labs" // Lv 16-20
];

export const FOOD_PRODUCTION_VALUES = [ // Corresponds to levels 0-20
    0,    // Level 0 (None)
    1.5,  // Level 1 (Foraging Party)
    3.0,  // Level 2 (Basic Traps)
    5.0,  // Level 3 (Small Garden Plot) - Covers consumption of 4
    7.5,  // Level 4 (Hunting & Gathering)
    10.0, // Level 5 (Simple Farming)
    13.0, // Level 6
    16.5, // Level 7
    20.5, // Level 8
    25.0, // Level 9
    30.0, // Level 10
    36.0, // Level 11
    42.5, // Level 12
    50.0, // Level 13
    58.0, // Level 14
    66.5, // Level 15
    75.0, // Level 16
    85.0, // Level 17
    96.0, // Level 18
    108.0,// Level 19
    120.0 // Level 20
];

export const SHELTER_LEVEL_NAMES = [
    "None", "Leaf Lean-To", "Crude Dugout", "Basic Shack", "Wattle and Daub Hut", "Log Cabin", // Lv 0-5
    "Timber Frame House", "Stone Cottage", "Fortified Wooden Walls", "Community Longhouse", "Watchtower Outpost", // Lv 6-10
    "Underground Bunker Access", "Reinforced Structures", "Small Barracks", "Defensive Perimeter", "Medical Bay", // Lv 11-15
    "Multi-Story Habitation Block", "Geothermal Climate Control", "Blast-Proof Shelters", "Self-Sustaining Arcology", "Island Citadel" // Lv 16-20
];

export const STAGES = [ // Adjusted thresholds slightly due to rebalance
    { threshold: 0, name: "The Shore", text: "You've landed. Survival is paramount. Manage Health & Hunger, earn for promotions, and build essential operations!", nextThreshold: 75 },
    { threshold: 75, name: "Early Survival", text: "Food and shelter are rudimentary. Improve them and work those clicks for a promotion!", nextThreshold: 400 },
    { threshold: 400, name: "Stabilizing", text: "Needs are becoming more secure. If Health or Hunger drop, it's trouble! Keep upgrading.", nextThreshold: 2000 },
    { threshold: 2000, name: "Island Community", text: "A small community is forming. Advanced operations reflect this growth. Don't neglect your vital signs!", nextThreshold: 8000 },
    { threshold: 8000, name: "Budding Economy", text: "Self-sufficiency is key. A higher wage from promotions will boost your capital.", nextThreshold: 40000 },
    { threshold: 40000, name: "Technological Growth", text: "Advanced structures and operations are now possible. The dream of something bigger is forming.", nextThreshold: 200000 },
    { threshold: 200000, name: "Regional Power", text: "Your island nation is influential. What's next on the horizon?", nextThreshold: 800000 },
    { threshold: 800000, name: "The Space Dream", text: "The stars, once distant lights, now seem within reach. The ultimate goal: colonize space!", nextThreshold: Infinity }
];
