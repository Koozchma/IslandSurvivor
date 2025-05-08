// js/gameState.js

// --- Core Mutable State ---
export let capital = 0.00;
export let gameSeconds = 0;
export let isGameOver = false;
export let health = 100; // Initial value set here
export let hunger = 100; // Initial value set here
export let currentStageIndex = 0;

// --- State Objects ---
export let promotion = {
    level: 0,
    currentWage: 1.00,          // Will be calculated, but start with 1
    wageIncreasePerLevel: 1.00, // Wage increases by 1 per level (before bonus)
    clicksNeeded: 10,
    currentClicks: 0
};

export let food = {
    level: 0,
    baseMaintenance: 0.00,      // Starts at 0, increases after first upgrade
    maintenancePerLevel: 0.18,
    baseUpgradeCost: 10,
    upgradeCostMultiplier: 1.60,
    currentProduction: 0,       // Calculated value
    currentMaintenance: 0,      // Calculated value
    currentUpgradeCost: 10,     // Initial upgrade cost
    maxLevel: 20,
    currentName: "None",        // Calculated value
    forageCooldownEnd: 0        // Cooldown timer for manual forage (initialize to 0)
};

export let shelter = {
    level: 0,
    baseMaintenance: 0.00,      // Starts at 0, increases after first upgrade
    maintenancePerLevel: 0.22,
    baseUpgradeCost: 12,        // Initial upgrade cost
    upgradeCostMultiplier: 1.75,
    currentName: "None",        // Calculated value
    currentMaintenance: 0,      // Calculated value
    currentUpgradeCost: 12,     // Initial upgrade cost
    maxLevel: 20
};

// --- State Modifier Functions (Setters) ---
// These functions modify the module-level variables above
export function setCapital(value) { capital = value; }
export function addCapital(value) { capital += value; }
export function setGameSeconds(value) { gameSeconds = value; }
export function setIsGameOver(value) { isGameOver = value; }
export function setHealth(value) { health = Math.max(0, Math.min(100, value)); } // Clamp value between 0 and 100
export function setHunger(value) { hunger = Math.max(0, Math.min(100, value)); } // Clamp value between 0 and 100
export function setCurrentStageIndex(value) { currentStageIndex = value; }

// Update state objects using spread syntax to merge properties
export function updatePromotionState(newProps) {
    promotion = { ...promotion, ...newProps };
}
export function updateFoodState(newProps) {
    food = { ...food, ...newProps };
}
export function updateShelterState(newProps) {
    shelter = { ...shelter, ...newProps };
}

// --- State Accessor Function (Getter) ---
// Provides a snapshot of the current state for other modules to read
export function getGameState() {
    return {
        capital, gameSeconds, isGameOver, health, hunger, currentStageIndex,
        promotion, food, shelter
    };
}
