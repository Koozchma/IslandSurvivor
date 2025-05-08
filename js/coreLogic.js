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

// NEW function to handle timed events
export function handleTimedEvents() {
    if (gs.nextEventIndex >= cfg.TIMED_EVENTS.length) {
        // No more events
        if (gs.timeUntilNextEvent !== Infinity) gs.setTimeUntilNextEvent(Infinity); // Prevent further countdown display
        return;
    }

    let timeRemaining = gs.timeUntilNextEvent - 1;
    gs.setTimeUntilNextEvent(timeRemaining);

    if (timeRemaining <= 0) {
        // Trigger the event
        const event = cfg.TIMED_EVENTS[gs.nextEventIndex];
        console.log(`Triggering Event: ${event.name}`); // Debug log

        // Apply effects
        gs.setCurrentFoodNeed(gs.currentFoodNeed + event.foodNeedIncr);
        gs.addShelterEventMaintenance(event.shelterMaintIncr);

        // Recalculate shelter stats immediately as maintenance changed
        calculateNeedStats('shelter');

        // Show feedback
        showFeedbackText(`Event: ${event.name}! Needs Increased!`, 'var(--warning-feedback)', undefined, 2500);

        // Move to next event
        gs.setNextEventIndex(gs.nextEventIndex + 1);
        // Reset timer (or set to Infinity if it was the last one)
        if (gs.nextEventIndex < cfg.TIMED_EVENTS.length) {
            gs.setTimeUntilNextEvent(cfg.EVENT_INTERVAL_SECONDS);
        } else {
            gs.setTimeUntilNextEvent(Infinity); // Indicate no more events
        }
    }
}

export function updateHealthAndHunger() {
    const { food, shelter, hunger: currentHunger, health: currentHealth } = gs.getGameState();

    // --- Hunger Logic ---
    const foodBalance = food.currentProduction - currentFoodNeed; // Use dynamic need
    let hungerChange = 0;
    if (foodBalance < 0) {
        hungerChange = foodBalance; // Still decay by deficit
    } else {
        if (currentHunger < cfg.MAX_STAT) {
            if (food.level >= cfg.HUNGER_STABILITY_LEVEL) { // Level 15 check still relevant for stability/regen
                hungerChange = Math.min(cfg.STAT_REGEN_RATE, foodBalance * 0.2 + cfg.STAT_REGEN_RATE * 0.1);
            } else {
                hungerChange = 0; // Stop decay if balance is non-negative, but no regen < Lvl 15
            }
        }
    }
    gs.setHunger(currentHunger + hungerChange);

    // --- Health Logic ---
    let healthChange = 0;
    if (shelter.level < cfg.SHELTER_HEALTH_MAINTENANCE_LEVEL) { // Uses config value (15)
        healthChange -= cfg.HEALTH_DECAY_NO_SHELTER; // Uses config value (0.15)
    }
    // Use gs.hunger here because it has been updated by the setter already
    if (gs.hunger < 25) {
        healthChange -= cfg.HEALTH_DECAY_LOW_HUNGER;
    }
    if (healthChange === 0 && gs.hunger >= 50 && currentHealth < cfg.MAX_STAT) {
         healthChange = cfg.STAT_REGEN_RATE;
    }
    gs.setHealth(currentHealth + healthChange); // Use setter to clamp and update

    // Check Game Over
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
