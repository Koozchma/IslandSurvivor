// js/coreLogic.js

import * as gs from './gameState.js';
import * as cfg from './config.js';
import { showGameOverUI } from './uiController.js';

// --- STATS CALCULATORS ---
export function calculatePromotionStats() {
    try {
        const bonusWage = Math.floor(gs.promotion.level / cfg.PROMOTION_BONUS_LEVEL_INTERVAL) * cfg.PROMOTION_BONUS_WAGE_INCREASE;
        const baseProgressWage = gs.promotion.level * gs.promotion.wageIncreasePerLevel;
        const newWage = 1.00 + baseProgressWage + bonusWage;
        gs.updatePromotionState({ currentWage: newWage });
    } catch (e) {
        console.error("Error in calculatePromotionStats:", e);
    }
}

export function calculateNeedStats(needType) {
    try {
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

        if (!need || !namesArray || (needType === 'food' && !productionValuesArray)) {
            console.error("Missing data for calculateNeedStats:", needType);
            return;
        }

        let newProduction = need.currentProduction;
        let newMaintenance = 0;
        let newBaseMaintenance = need.baseMaintenance;
        const levelIndex = Math.max(0, Math.min(need.level, need.maxLevel));

        if (levelIndex > 0) {
            if (productionValuesArray && levelIndex < productionValuesArray.length) { // Check bounds for production array
                newProduction = productionValuesArray[levelIndex] !== undefined ? productionValuesArray[levelIndex] : 0;
            }
            // Set base maintenance only once when reaching level 1
            if (levelIndex === 1 && newBaseMaintenance === 0.00) {
                if (needType === 'food') newBaseMaintenance = 0.06;
                if (needType === 'shelter') newBaseMaintenance = 0.09;
            }
            // Calculate maintenance based on levels > 0
            newMaintenance = newBaseMaintenance + ((levelIndex - 1) * need.maintenancePerLevel);
        } else {
            newBaseMaintenance = 0.00;
            if(productionValuesArray) newProduction = 0;
        }

        const newUpgradeCost = (levelIndex >= need.maxLevel) ? Infinity : Math.floor(need.baseUpgradeCost * Math.pow(need.upgradeCostMultiplier, levelIndex));
        // Check bounds for names array
        const newName = (levelIndex < namesArray.length && namesArray[levelIndex] !== undefined) ? namesArray[levelIndex] : "Unknown";

        const updatePayload = {
            currentMaintenance: newMaintenance,
            currentUpgradeCost: newUpgradeCost,
            currentName: newName,
            baseMaintenance: newBaseMaintenance // Persist potential change to base maintenance
        };
        if (needType === 'food') {
            updatePayload.currentProduction = newProduction;
        }
        stateUpdater(updatePayload); // Update the specific state object (food or shelter)
    } catch (e) {
        console.error("Error in calculateNeedStats for", needType, ":", e);
    }
}


// --- GAME LOOP LOGIC ---
export function updateHealthAndHunger() {
    try {
        const { food, shelter, hunger: currentHunger, health: currentHealth } = gs.getGameState();

        // Hunger Logic
        const foodBalance = food.currentProduction - cfg.BASE_FOOD_NEED;
        let hungerChange = 0;
        if (foodBalance < 0) {
            hungerChange = foodBalance; // Use the deficit directly
        } else if (currentHunger < cfg.MAX_STAT) {
             if (food.level >= cfg.HUNGER_STABILITY_LEVEL) {
                 hungerChange = Math.min(cfg.STAT_REGEN_RATE, foodBalance * 0.2 + cfg.STAT_REGEN_RATE * 0.1);
             } else {
                 hungerChange = 0; // Stop decay if need met, no regen below stability level
             }
        }
        gs.setHunger(currentHunger + hungerChange); // Update state via setter

        // Health Logic
        let healthChange = 0;
        if (shelter.level < cfg.SHELTER_HEALTH_MAINTENANCE_LEVEL) {
            healthChange -= cfg.HEALTH_DECAY_NO_SHELTER;
        }
        // Use the updated hunger state via getter for check
        if (gs.getGameState().hunger < 25) {
            healthChange -= cfg.HEALTH_DECAY_LOW_HUNGER;
        }
        if (healthChange === 0 && gs.getGameState().hunger >= 50 && currentHealth < cfg.MAX_STAT) {
             healthChange = cfg.STAT_REGEN_RATE;
        }
        gs.setHealth(currentHealth + healthChange); // Update state via setter

        // Check Game Over using updated state
        const finalState = gs.getGameState();
        if (finalState.hunger <= 0) triggerGameOver("hunger");
        else if (finalState.health <= 0) triggerGameOver("health");

    } catch (e) {
         console.error("Error in updateHealthAndHunger:", e);
         triggerGameOver("error");
    }
}

export function applyMaintenanceCosts() {
    try {
        const { food, shelter } = gs.getGameState();
        const totalMaintenance = food.currentMaintenance + shelter.currentMaintenance;
        gs.addCapital(-totalMaintenance);
    } catch (e) {
         console.error("Error in applyMaintenanceCosts:", e);
    }
}

export function applyInterest() {
    try {
        // Use getter inside the logic to ensure reading current capital
        const currentCapital = gs.getGameState().capital;
        if (currentCapital > 0) {
            gs.addCapital(currentCapital * cfg.BASE_INTEREST_RATE);
        }
    } catch (e) {
        console.error("Error in applyInterest:", e);
    }
}

export function triggerGameOver(reason) {
    // Ensure we don't trigger multiple times
    if (gs.getGameState().isGameOver) return;
    gs.setIsGameOver(true);
    console.log(`[DEBUG] coreLogic.js: Game Over triggered: ${reason}`);
    // Interval clearing is handled in main.js
    showGameOverUI(reason); // Update UI
}

export function checkStorylineAdvance() {
     try {
        const { capital, currentStageIndex } = gs.getGameState();
        if (currentStageIndex < 0 || currentStageIndex >= cfg.STAGES.length) return;

        const currentStageData = cfg.STAGES[currentStageIndex];
        if (capital >= currentStageData.nextThreshold && currentStageIndex < cfg.STAGES.length - 1) {
            const nextIndex = currentStageIndex + 1;
            gs.setCurrentStageIndex(nextIndex);
            console.log(`[DEBUG] coreLogic.js: Advanced to stage ${nextIndex}`);
            // Potential: Add feedback via showFeedbackText here if desired
        }
    } catch (e) {
        console.error("Error in checkStorylineAdvance:", e);
    }
}
