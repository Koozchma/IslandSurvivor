// js/gameState.js

// --- Core Mutable State ---
export let capital = 0.00;
export let gameSeconds = 0;
export let isGameOver = false;
export let health = 100;
export let hunger = 100;
export let currentStageIndex = 0;
export let scienceUnlocked = false;
export let unlockedResearch = []; // New array to store keys of unlocked research

// --- State Objects ---
export let promotion = {
    level: 0,
    currentWage: 1.00,
    wageIncreasePerLevel: 1.00,
    clicksNeeded: 10,
    currentClicks: 0
};

export let food = {
    level: 0,
    baseMaintenance: 0.00,
    maintenancePerLevel: 0.18,
    baseUpgradeCost: 10,
    upgradeCostMultiplier: 1.60,
    currentProduction: 0,
    currentMaintenance: 0,
    currentUpgradeCost: 10,
    maxLevel: 20,
    currentName: "None",
    forageCooldownEnd: 0
};

export let shelter = {
    level: 0,
    baseMaintenance: 0.00,
    maintenancePerLevel: 0.22,
    baseUpgradeCost: 12,
    upgradeCostMultiplier: 1.75,
    currentName: "None",
    currentMaintenance: 0,
    currentUpgradeCost: 12,
    maxLevel: 20
};

export let science = {
    level: 0,
    currentSciencePoints: 0,
    baseProduction: 0,
    productionPerLevel: 0,
    baseMaintenance: 0.00,
    maintenancePerLevel: 0.00,
    baseUpgradeCost: 500,
    upgradeCostMultiplier: 1.7,
    currentProduction: 0,
    currentMaintenance: 0,
    currentUpgradeCost: 500,
    maxLevel: 20,
    currentName: "None"
};


// --- State Modifier Functions (Setters) ---
export function setCapital(value) { capital = value; }
export function addCapital(value) { capital += value; }
export function setGameSeconds(value) { gameSeconds = value; }
export function setIsGameOver(value) { isGameOver = value; }
export function setHealth(value) { health = Math.max(0, Math.min(100, value)); }
export function setHunger(value) { hunger = Math.max(0, Math.min(100, value)); }
export function setCurrentStageIndex(value) { currentStageIndex = value; }
export function setScienceUnlocked(value) { scienceUnlocked = value; }
export function addSciencePoints(value) { science.currentSciencePoints += value; }

// New setter to add unlocked research
export function addUnlockedResearch(researchKey) {
     if (!unlockedResearch.includes(researchKey)) {
         unlockedResearch.push(researchKey);
     }
}


export function updatePromotionState(newProps) {
    promotion = { ...promotion, ...newProps };
}
export function updateFoodState(newProps) {
    food = { ...food, ...newProps };
}
export function updateShelterState(newProps) {
    shelter = { ...shelter, ...newProps };
}
export function updateScienceState(newProps) {
    science = { ...science, ...newProps };
}


// --- State Accessor Function (Getter) ---
export function getGameState() {
    return {
        capital, gameSeconds, isGameOver, health, hunger, currentStageIndex, scienceUnlocked, unlockedResearch, // Include unlockedResearch
        promotion, food, shelter, science
    };
}
