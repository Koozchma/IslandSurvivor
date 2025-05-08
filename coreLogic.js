import * as gs from './gameState.js';
import * as cfg from './config.js';
import { updateDisplay, showGameOverUI } from './uiController.js';

// --- STATS CALCULATORS ---
export function calculatePromotionStats() {
    const newWage = 1.00 + (gs.promotion.level * gs.promotion.wageIncreasePerLevel);
    gs.updatePromotionState({ currentWage: newWage });
}

export function calculateNeedStats(needType) {
    let need, namesArray, productionValuesArray = null;
    if (needType === 'food') {
        need = gs.food; namesArray = cfg.FOOD_LEVEL_NAMES; productionValuesArray = cfg.FOOD_PRODUCTION_VALUES;
    } else if (needType === 'shelter') {
        need = gs.shelter; namesArray = cfg.SHELTER_LEVEL_NAMES;
    } else { return; }

    let newProduction = 0;
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
        newBaseMaintenance = 0.00; // Reset if level is 0
    }

    const newUpgradeCost = (need.level >= need.maxLevel) ? Infinity : Math.floor(need.baseUpgradeCost * Math.pow(need.upgradeCostMultiplier, need.level));
    const newName = namesArray[need.level];

    if (needType === 'food') {
        gs.updateFoodState({
            currentProduction: newProduction,
            currentMaintenance: newMaintenance,
            currentUpgradeCost: newUpgradeCost,
            currentName: newName,
            baseMaintenance: newBaseMaintenance
        });
    } else if (needType === 'shelter') {
        gs.updateShelterState({
            currentMaintenance: newMaintenance,
            currentUpgradeCost: newUpgradeCost,
            currentName: newName,
            baseMaintenance: newBaseMaintenance
        });
    }
}


// --- GAME LOOP LOGIC ---
export function updateHealthAndHunger() {
    const { food, shelter } = gs.getGameState(); // Get current food and shelter states

    const foodBalance = food.currentProduction - cfg.POPULATION_FOOD_CONSUMPTION_RATE;
    let newHunger = gs.hunger;
    if (foodBalance < 0) {
        newHunger += foodBalance * cfg.HUNGER_DECAY_NO_FOOD_BALANCE;
    } else if (newHunger < cfg.MAX_STAT) {
        newHunger += Math.min(cfg.STAT_REGEN_RATE * 2, foodBalance * 0.2 + cfg.STAT_REGEN_RATE * 0.5);
    }
    gs.setHunger(Math.max(0, Math.min(cfg.MAX_STAT, newHunger)));

    let healthChange = 0;
    let newHealth = gs.health;
    if (shelter.level < cfg.SHELTER_HEALTH_MAINTENANCE_LEVEL) {
        healthChange -= cfg.HEALTH_DECAY_NO_SHELTER;
    }
    if (gs.hunger < 25) {
        healthChange -= cfg.HEALTH_DECAY_LOW_HUNGER;
    }
    if (healthChange === 0 && gs.hunger >= 50 && newHealth < cfg.MAX_STAT) {
        healthChange = cfg.STAT_REGEN_RATE;
    }
    newHealth += healthChange;
    gs.setHealth(Math.max(0, Math.min(cfg.MAX_STAT, newHealth)));

    if (gs.hunger <= 0) triggerGameOver("hunger");
    else if (gs.health <= 0) triggerGameOver("health");
}

export function applyMaintenanceCosts() {
    const { food, shelter } = gs.getGameState();
    const totalMaintenance = food.currentMaintenance + shelter.currentMaintenance;
    gs.setCapital(gs.capital - totalMaintenance);
}

export function applyInterest() {
    if (gs.capital > 0) {
        gs.setCapital(gs.capital + gs.capital * cfg.BASE_INTEREST_RATE);
    }
}

export function triggerGameOver(reason) {
    if (gs.isGameOver) return;
    gs.setIsGameOver(true);
    // Game loop interval is cleared in main.js
    showGameOverUI(reason);
}

export function checkStorylineAdvance() {
    const { capital, currentStageIndex } = gs.getGameState();
    const currentStageData = cfg.STAGES[currentStageIndex];
    if (capital >= currentStageData.nextThreshold && currentStageIndex < cfg.STAGES.length - 1) {
        gs.setCurrentStageIndex(currentStageIndex + 1);
        // Feedback for stage advance is handled in uiController.updateStoryline or via showFeedbackText
    }
}