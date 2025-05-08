// js/coreLogic.js

import * as gs from './gameState.js';
import * as cfg from './config.js';
import { showGameOverUI } from './uiController.js'; // May need this again

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
            need = gs.food; namesArray = cfg.FOOD_LEVEL_NAMES;
            productionValuesArray = cfg.FOOD_PRODUCTION_VALUES; stateUpdater = gs.updateFoodState;
        } else if (needType === 'shelter') {
            need = gs.shelter; namesArray = cfg.SHELTER_LEVEL_NAMES; stateUpdater = gs.updateShelterState;
        } else { return; }

        if (!need || !namesArray || (needType === 'food' && !productionValuesArray)) { return; }

        let newProduction = need.currentProduction;
        let newMaintenance = 0;
        let newBaseMaintenance = need.baseMaintenance;
        const levelIndex = Math.max(0, Math.min(need.level, need.maxLevel));

        if (levelIndex > 0) {
            if (productionValuesArray && levelIndex < productionValuesArray.length) {
                newProduction = productionValuesArray[levelIndex] !== undefined ? productionValuesArray[levelIndex] : 0;
            }
            if (levelIndex === 1 && newBaseMaintenance === 0.00) {
                if (needType === 'food') newBaseMaintenance = 0.06;
                if (needType === 'shelter') newBaseMaintenance = 0.09;
            }
            newMaintenance = newBaseMaintenance + ((levelIndex - 1) * need.maintenancePerLevel);
        } else {
            newBaseMaintenance = 0.00;
            if (productionValuesArray) newProduction = 0;
        }

        const newUpgradeCost = (levelIndex >= need.maxLevel) ? Infinity : Math.floor(need.baseUpgradeCost * Math.pow(need.upgradeCostMultiplier, levelIndex));
        const newName = (levelIndex < namesArray.length && namesArray[levelIndex] !== undefined) ? namesArray[levelIndex] : "Unknown";

        const updatePayload = {
            currentMaintenance: newMaintenance, currentUpgradeCost: newUpgradeCost,
            currentName: newName, baseMaintenance: newBaseMaintenance
        };
        if (needType === 'food') {
            updatePayload.currentProduction = newProduction;
        }
        stateUpdater(updatePayload);
    } catch (e) {
        console.error("Error in calculateNeedStats for", needType, ":", e);
    }
}

export function calculateFactoryStats(factoryId) {
    try {
        const factoryState = gs.factories[factoryId];
        const factoryBaseData = cfg.FACTORY_DATA[factoryId];
        if (!factoryState || !factoryBaseData) return;

        let currentCps = 0;
        let nextUpgradeCost = Infinity;

        if (factoryState.level > 0) {
            // Recalculate CPS based on the formula chosen in config.js (using cpsMultiplier here)
             currentCps = factoryBaseData.baseCps * Math.pow(factoryBaseData.cpsMultiplier, factoryState.level - 1);
            // Adjust based on maxLevel from gameState if different from default
            const maxLevel = factoryState.maxLevel || 50;
            if (factoryState.level < maxLevel) {
                nextUpgradeCost = Math.floor(factoryBaseData.baseCost * Math.pow(factoryBaseData.costMultiplier, factoryState.level));
            }
        } else {
            nextUpgradeCost = factoryBaseData.baseCost; // Cost to buy level 1
        }
        gs.updateFactoryState(factoryId, { currentCps: currentCps, currentUpgradeCost: nextUpgradeCost });
    } catch (e) {
        console.error("Error in calculateFactoryStats for", factoryId, ":", e);
    }
}

// --- GAME LOOP LOGIC ---
export function updateHealthAndHunger() {
    // ... (Keep the logic from the previous version that used BASE_FOOD_NEED and SHELTER_HEALTH_MAINTENANCE_LEVEL) ...
     try {
        const { food, shelter, hunger: currentHunger, health: currentHealth } = gs.getGameState();

        // Hunger Logic
        const foodBalance = food.currentProduction - cfg.BASE_FOOD_NEED;
        let hungerChange = 0;
        if (foodBalance < 0) {
            hungerChange = foodBalance;
        } else if (currentHunger < cfg.MAX_STAT) {
             if (food.level >= cfg.HUNGER_STABILITY_LEVEL) {
                 hungerChange = Math.min(cfg.STAT_REGEN_RATE, foodBalance * 0.2 + cfg.STAT_REGEN_RATE * 0.1);
             } else {
                 hungerChange = 0;
             }
        }
        gs.setHunger(currentHunger + hungerChange);

        // Health Logic
        let healthChange = 0;
        if (shelter.level < cfg.SHELTER_HEALTH_MAINTENANCE_LEVEL) {
            healthChange -= cfg.HEALTH_DECAY_NO_SHELTER;
        }
        if (gs.getGameState().hunger < 25) { // Check updated hunger
            healthChange -= cfg.HEALTH_DECAY_LOW_HUNGER;
        }
        if (healthChange === 0 && gs.getGameState().hunger >= 50 && currentHealth < cfg.MAX_STAT) {
             healthChange = cfg.STAT_REGEN_RATE;
        }
        gs.setHealth(currentHealth + healthChange);

        // Check Game Over
        const finalState = gs.getGameState();
        if (finalState.hunger <= 0) triggerGameOver("hunger");
        else if (finalState.health <= 0) triggerGameOver("health");

    } catch (e) {
         console.error("Error in updateHealthAndHunger:", e);
         triggerGameOver("error");
    }
}

export function applyMaintenanceCosts() {
    // Includes Food and Shelter maintenance again
    try {
        const { food, shelter } = gs.getGameState();
        const totalMaintenance = food.currentMaintenance + shelter.currentMaintenance;
        gs.addCapital(-totalMaintenance);
    } catch (e) {
         console.error("Error in applyMaintenanceCosts:", e);
    }
}

export function applyInterest() {
    // ... (Keep as is) ...
     try {
        const currentCapital = gs.getGameState().capital;
        if (currentCapital > 0) {
            gs.addCapital(currentCapital * cfg.BASE_INTEREST_RATE);
        }
    } catch (e) {
        console.error("Error in applyInterest:", e);
    }
}

export function applyFactoryProduction() {
    // ... (Keep as is) ...
     try {
        let totalCps = 0;
        // Ensure factories state exists before iterating
        if(gs.factories) {
            for (const id in gs.factories) {
                totalCps += gs.factories[id].currentCps;
            }
        }
        if (totalCps > 0) {
            gs.addCapital(totalCps);
        }
    } catch (e) {
        console.error("Error in applyFactoryProduction:", e);
    }
}

export function triggerGameOver(reason) {
    // ... (Keep as is) ...
     if (gs.getGameState().isGameOver) return;
    gs.setIsGameOver(true);
    console.log(`[DEBUG] coreLogic.js: Game Over triggered: ${reason}`);
    showGameOverUI(reason);
}

export function checkStorylineAdvance() {
     // ... (Keep as is) ...
      try {
        const { capital, currentStageIndex } = gs.getGameState();
        if (currentStageIndex < 0 || currentStageIndex >= cfg.STAGES.length) return;

        const currentStageData = cfg.STAGES[currentStageIndex];
        if (currentStageData.nextThreshold !== Infinity && capital >= currentStageData.nextThreshold && currentStageIndex < cfg.STAGES.length - 1) {
            const nextIndex = currentStageIndex + 1;
            gs.setCurrentStageIndex(nextIndex);
            console.log(`[DEBUG] coreLogic.js: Advanced to stage ${nextIndex}`);
        }
    } catch (e) {
        console.error("Error in checkStorylineAdvance:", e);
    }
}
