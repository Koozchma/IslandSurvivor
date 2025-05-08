// js/gameState.js
import { FACTORY_DATA } from './config.js'; // Need factory data for init

// --- Core Mutable State ---
export let capital = 0.00;
export let gameSeconds = 0;
export let isGameOver = false; // Restored
export let health = 100;       // Restored
export let hunger = 100;       // Restored
export let currentStageIndex = 0;

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

// --- Factories State Object ---
export let factories = {};

// Function to initialize/reset factory state
export function initializeFactoryState() {
    factories = {}; // Clear existing factory state
    for (const id in FACTORY_DATA) {
        factories[id] = {
            id: id,
            level: 0,
            currentCps: 0,
            currentUpgradeCost: FACTORY_DATA[id].baseCost, // Initial cost is base cost
            maxLevel: 50 // Default max level, can be overridden in FACTORY_DATA if needed
        };
    }
}
// Call it once on module load to ensure structure exists
initializeFactoryState();

// --- State Modifier Functions (Setters) ---
export function setCapital(value) { capital = value; }
export function addCapital(value) { capital += value; }
export function setGameSeconds(value) { gameSeconds = value; }
export function setIsGameOver(value) { isGameOver = value; }
export function setHealth(value) { health = Math.max(0, Math.min(100, value)); }
export function setHunger(value) { hunger = Math.max(0, Math.min(100, value)); }
export function setCurrentStageIndex(value) { currentStageIndex = value; }

export function updatePromotionState(newProps) { promotion = { ...promotion, ...newProps }; }
export function updateFoodState(newProps) { food = { ...food, ...newProps }; }
export function updateShelterState(newProps) { shelter = { ...shelter, ...newProps }; }
export function updateFactoryState(id, newProps) {
    if (factories[id]) {
        factories[id] = { ...factories[id], ...newProps };
    } else {
        console.error("Attempted to update non-existent factory:", id);
    }
}

// --- State Accessor Function (Getter) ---
export function getGameState() {
    return {
        capital, gameSeconds, isGameOver, health, hunger, currentStageIndex,
        promotion, food, shelter, factories // Include factories
    };
}

// Re-export initializeFactoryState for main.js
export { initializeFactoryState };
