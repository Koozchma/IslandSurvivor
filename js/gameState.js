// js/gameState.js

// --- Core Mutable State ---
export let capital = 0.00;
export let gameSeconds = 0;
export let isGameOver = false;
export let health = 100;
export let hunger = 100;
export let currentStageIndex = 0;
export let scienceUnlocked = false; // New flag for Science

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

// New Science State Object
export let science = {
    level: 0,
    currentSciencePoints: 0,
    baseProduction: 0, // Base production value
    productionPerLevel: 0, // Production increase per level
    baseMaintenance: 0.00, // Using the new config constant
    maintenancePerLevel: 0.00, // Using the new config constant
    baseUpgradeCost: 500, // Using the new config constant
    upgradeCostMultiplier: 1.7, // Using the new config constant
    currentProduction: 0, // Calculated production per second
    currentMaintenance: 0, // Calculated maintenance per second
    currentUpgradeCost: 500, // Initial cost from base
    maxLevel: 20, // Using the new config constant
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
export function setScienceUnlocked(value) { scienceUnlocked = value; } // New setter for the flag
export function addSciencePoints(value) { science.currentSciencePoints += value; } // Setter for science points


export function updatePromotionState(newProps) {
    promotion = { ...promotion, ...newProps };
}
export function updateFoodState(newProps) {
    food = { ...food, ...newProps };
}
export function updateShelterState(newProps) {
    shelter = { ...shelter, ...newProps };
}
// New Science State Updater
export function updateScienceState(newProps) {
    science = { ...science, ...newProps };
}


// --- State Accessor Function (Getter) ---
export function getGameState() {
    return {
        capital, gameSeconds, isGameOver, health, hunger, currentStageIndex, scienceUnlocked, // Include the new flag
        promotion, food, shelter, science // Include the new science state
    };
}
