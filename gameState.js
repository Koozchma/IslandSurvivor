// This module will hold the core mutable game state.
// Other modules can import these and modify them directly, or we can add getter/setter functions.
// For simplicity in this refactor, direct modification will be used.

export let capital = 0.00;
export let gameSeconds = 0;
export let isGameOver = false;
export let health = 0;
export let hunger = 0;
export let currentStageIndex = 0;

export let promotion = {
    level: 0, currentWage: 1.00, wageIncreasePerLevel: 0.50,
    clicksNeeded: 10, currentClicks: 0
};

export let food = {
    level: 0, baseMaintenance: 0.00, maintenancePerLevel: 0.18,
    baseUpgradeCost: 10, upgradeCostMultiplier: 1.60, currentProduction: 0,
    currentMaintenance: 0, currentUpgradeCost: 10, maxLevel: 20, currentName: "None"
};

export let shelter = {
    level: 0, baseMaintenance: 0.00, maintenancePerLevel: 0.22, baseUpgradeCost: 12,
    upgradeCostMultiplier: 1.75, currentName: "None", currentMaintenance: 0,
    currentUpgradeCost: 12, maxLevel: 20
};


// Function to update a piece of state, mainly for complex objects if needed
export function updatePromotionState(newProps) {
    promotion = { ...promotion, ...newProps };
}
export function updateFoodState(newProps) {
    food = { ...food, ...newProps };
}
export function updateShelterState(newProps) {
    shelter = { ...shelter, ...newProps };
}
export function setCapital(value) { capital = value; }
export function setGameSeconds(value) { gameSeconds = value; }
export function setIsGameOver(value) { isGameOver = value; }
export function setHealth(value) { health = value; }
export function setHunger(value) { hunger = value; }
export function setCurrentStageIndex(value) { currentStageIndex = value; }


// Helper to get the current game state (useful for modules that only read)
export function getGameState() {
    return {
        capital, gameSeconds, isGameOver, health, hunger, currentStageIndex,
        promotion, food, shelter
    };
}