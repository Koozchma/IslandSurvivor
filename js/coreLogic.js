// js/coreLogic.js

import * as gs from './gameState.js';
import * as cfg from './config.js';
import { showGameOverUI } from './uiController.js'; // Import UI function for game over

// --- STATS CALCULATORS ---
export function calculatePromotionStats() {
    const newWage = 1.00 + (gs.promotion.level * gs.promotion.wageIncreasePerLevel);
    gs.updatePromotionState({ currentWage: newWage });
}

export function calculateNeedStats(needType) {
    let need, namesArray, productionValuesArray = null;
    let stateUpdater; // Function to update state

    if (needType === 'food') {
        need = gs.food;
        namesArray = cfg.FOOD_LEVEL_NAMES;
        productionValuesArray = cfg.FOOD_PRODUCTION_VALUES;
        stateUpdater = gs.updateFoodState;
    } else if (needType === 'shelter') {
        need = gs.shelter;
        namesArray = cfg.SHELTER_LEVEL_NAMES;
        stateUpdater = gs.updateShelterState;
    } else { return; }

    let newProduction = need.currentProduction; // Default to current, especially for shelter
    let newMaintenance = 0;
    let newBaseMaintenance = need.baseMaintenance;

    if (need.level > 0) {
        if (productionValuesArray) { // Only calculate production for food
            newProduction = productionValuesArray[need.level] || 0;
        }
        // Set base maintenance cost on the first upgrade (Level 1)
        if (need.level === 1 && newBaseMaintenance === 0.00) {
            if (needType === 'food') newBaseMaintenance = 0.06;
            if (needType === 'shelter') newBaseMaintenance = 0.09;
        }
        // Maintenance = Base + Additional per level beyond 1
        newMaintenance = newBaseMaintenance + ((need.level - 1) * need.maintenancePerLevel);
    } else {
        newBaseMaintenance = 0.00; // Reset base if level is 0
    }

    const newUpgradeCost = (need.level >= need.maxLevel) ? Infinity : Math.floor(need.baseUpgradeCost * Math.pow(need.upgradeCostMultiplier, need.level));
    const newName = namesArray[need.level];

    // Prepare the update payload
    const updatePayload = {
        currentMaintenance: newMaintenance,
        currentUpgradeCost: newUpgradeCost,
        currentName: newName,
        baseMaintenance: newBaseMaintenance // Ensure base maintenance is updated in state
    };

    // Add production only if it's food
    if (needType === 'food') {
        updatePayload.currentProduction = newProduction;
    }

    // Update the state using the appropriate setter
    stateUpdater(updatePayload);
}


// --- GAME LOOP LOGIC ---
export function updateHealthAndHunger() {
    const { food, shelter, hunger: currentHunger, health: currentHealth } = gs.getGameState(); // Get current states

    // Hunger Logic
    const foodBalance = food.currentProduction - cfg.POPULATION_FOOD_CONSUMPTION_RATE;
    let newHunger = currentHunger;
    if (foodBalance < 0) {
        newHunger += foodBalance * cfg.HUNGER_DECAY_NO_FOOD_BALANCE;
    } else if (newHunger < cfg.MAX_STAT) {
        newHunger += Math.min(cfg.STAT_REGEN_RATE * 2, foodBalance * 0.2 + cfg.STAT_REGEN_RATE * 0.5);
    }
    gs.setHunger(newHunger); // Use setter to update clamped value

    // Health Logic
    let healthChange = 0;
    let newHealth = currentHealth;
    if (shelter.level < cfg.SHELTER_HEALTH_MAINTENANCE_LEVEL) {
        healthChange -= cfg.HEALTH_DECAY_NO_SHELTER;
    }
    if (gs.hunger < 25) { // Use the potentially updated hunger value
        healthChange -= cfg.HEALTH_DECAY_LOW_HUNGER;
    }
    if (healthChange === 0 && gs.hunger >= 50 && newHealth < cfg.MAX_STAT) {
        healthChange = cfg.STAT_REGEN_RATE;
    }
    newHealth += healthChange;
    gs.setHealth(newHealth); // Use setter to update clamped value

    // Check Game Over (reads the potentially updated values)
    if (gs.hunger <= 0) triggerGameOver("hunger");
    else if (gs.health <= 0) triggerGameOver("health");
}

export function applyMaintenanceCosts() {
    const { food, shelter } = gs.getGameState();
    const totalMaintenance = food.currentMaintenance + shelter.currentMaintenance;
    gs.addCapital(-totalMaintenance); // Use addCapital for modification
}

export function applyInterest() {
    if (gs.capital > 0) {
        gs.addCapital(gs.capital * cfg.BASE_INTEREST_RATE); // Use addCapital
    }
}

export function triggerGameOver(reason) {
    if (gs.isGameOver) return; // Prevent multiple triggers
    gs.setIsGameOver(true);
    console.log(`Game Over triggered: ${reason}`); // Log for debugging
    // Game loop interval clearing is handled in main.js
    showGameOverUI(reason); // Update UI
}

export function checkStorylineAdvance() {
    const { capital, currentStageIndex } = gs.getGameState();
    // Ensure currentStageIndex is within bounds
    if (currentStageIndex < 0 || currentStageIndex >= cfg.STAGES.length) return;

    const currentStageData = cfg.STAGES[currentStageIndex];
    if (capital >= currentStageData.nextThreshold && currentStageIndex < cfg.STAGES.length - 1) {
        gs.setCurrentStageIndex(currentStageIndex + 1);
        // Feedback can be handled in uiController based on stage change detection if needed
    }
}
