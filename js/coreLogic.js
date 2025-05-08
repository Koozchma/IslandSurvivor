// js/coreLogic.js

import * as gs from './gameState.js';
import * as cfg from './config.js';
import { showGameOverUI } from './uiController.js';

// --- STATS CALCULATORS ---
export function calculatePromotionStats() {
    // Calculate bonus wage based on level milestones
    const bonusWage = Math.floor(gs.promotion.level / cfg.PROMOTION_BONUS_LEVEL_INTERVAL) * cfg.PROMOTION_BONUS_WAGE_INCREASE;
    // Calculate base wage progression
    const baseProgressWage = gs.promotion.level * gs.promotion.wageIncreasePerLevel;
    // Total wage is base (1) + level progression + bonus
    const newWage = 1.00 + baseProgressWage + bonusWage;
    gs.updatePromotionState({ currentWage: newWage });
}

export function calculateNeedStats(needType) {
    // ... (This function remains the same as the last full code version) ...
    let need, namesArray, productionValuesArray = null;
    let stateUpdater;

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

    let newProduction = need.currentProduction;
    let newMaintenance = 0;
    let newBaseMaintenance = need.baseMaintenance;

    if (need.level > 0) {
        if (productionValuesArray) {
            newProduction = productionValuesArray[need.level] || 0;
        }
        if (need.level === 1 && newBaseMaintenance === 0.00) {
            if (needType === 'food') newBaseMaintenance = 0.06;
            if (needType === 'shelter') newBaseMaintenance = 0.09;
        }
        newMaintenance = newBaseMaintenance + ((need.level - 1) * need.maintenancePerLevel);
    } else {
        newBaseMaintenance = 0.00;
    }

    const newUpgradeCost = (need.level >= need.maxLevel) ? Infinity : Math.floor(need.baseUpgradeCost * Math.pow(need.upgradeCostMultiplier, need.level));
    const newName = namesArray[need.level];

    const updatePayload = {
        currentMaintenance: newMaintenance,
        currentUpgradeCost: newUpgradeCost,
        currentName: newName,
        baseMaintenance: newBaseMaintenance
    };
    if (needType === 'food') {
        updatePayload.currentProduction = newProduction;
    }
    stateUpdater(updatePayload);
}


// --- GAME LOOP LOGIC ---
export function updateHealthAndHunger() {
    const { food, shelter, hunger: currentHunger, health: currentHealth } = gs.getGameState();

    // --- Hunger Logic ---
    let hungerChange = 0;
    // Apply constant decay if food level is below requirement
    if (food.level < 15) { // << CHANGED: Condition is level, not production balance
        hungerChange -= cfg.BASE_HUNGER_DECAY;
    } else {
        // Optional: Regenerate slowly if above level 15 and not full
        if (currentHunger < cfg.MAX_STAT) {
            hungerChange += cfg.STAT_REGEN_RATE; // Simple regen when condition met
        }
    }
    let newHunger = currentHunger + hungerChange;
    gs.setHunger(newHunger); // Use setter to clamp and update

    // --- Health Logic ---
    let healthChange = 0;
    // Apply decay if shelter level is below requirement
    if (shelter.level < cfg.SHELTER_HEALTH_MAINTENANCE_LEVEL) { // Uses new config value (15)
        healthChange -= cfg.HEALTH_DECAY_NO_SHELTER; // Uses new config value (0.15)
    }
    // Apply decay if hunger is low (use the newly calculated hunger state)
    if (gs.hunger < 25) {
        healthChange -= cfg.HEALTH_DECAY_LOW_HUNGER;
    }

    // Regenerate if conditions met (no decay factors active)
    if (healthChange === 0 && gs.hunger >= 50 && currentHealth < cfg.MAX_STAT) {
         healthChange = cfg.STAT_REGEN_RATE;
    }
    let newHealth = currentHealth + healthChange;
    gs.setHealth(newHealth); // Use setter to clamp and update

    // Check Game Over (reads the potentially updated values)
    if (gs.hunger <= 0) triggerGameOver("hunger");
    else if (gs.health <= 0) triggerGameOver("health");
}

export function applyMaintenanceCosts() {
    const { food, shelter } = gs.getGameState();
    const totalMaintenance = food.currentMaintenance + shelter.currentMaintenance;
    gs.addCapital(-totalMaintenance);
}

export function applyInterest() {
    if (gs.capital > 0) {
        gs.addCapital(gs.capital * cfg.BASE_INTEREST_RATE);
    }
}

export function triggerGameOver(reason) {
    // ... (same as before) ...
     if (gs.isGameOver) return;
    gs.setIsGameOver(true);
    console.log(`Game Over triggered: ${reason}`);
    showGameOverUI(reason);
}

export function checkStorylineAdvance() {
    // ... (same as before) ...
    const { capital, currentStageIndex } = gs.getGameState();
    if (currentStageIndex < 0 || currentStageIndex >= cfg.STAGES.length) return;
    const currentStageData = cfg.STAGES[currentStageIndex];
    if (capital >= currentStageData.nextThreshold && currentStageIndex < cfg.STAGES.length - 1) {
        gs.setCurrentStageIndex(currentStageIndex + 1);
    }
}
