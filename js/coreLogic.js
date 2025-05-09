// js/coreLogic.js

import * as gs from './gameState.js';
import * as cfg from './config.js';
import { showGameOverUI, updateDisplay } from './uiController.js'; // ensure updateDisplay is imported
import { showFeedbackText } from './utils.js'; // Import showFeedbackText for research effects


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

export function calculateScienceStats() {
    try {
        const { science } = gs.getGameState();
        const levelIndex = Math.max(0, Math.min(science.level, science.maxLevel));

        let newProduction = 0;
        let newMaintenance = 0;
        let newBaseMaintenance = science.baseMaintenance;

         if (levelIndex > 0) {
            if (levelIndex < cfg.SCIENCE_PRODUCTION_VALUES.length) { // Check bounds for production array
                newProduction = cfg.SCIENCE_PRODUCTION_VALUES[levelIndex] !== undefined ? cfg.SCIENCE_PRODUCTION_VALUES[levelIndex] : 0;
            }
             // Set base maintenance only once when reaching level 1 for science
            if (levelIndex === 1 && newBaseMaintenance === 0.00) {
                newBaseMaintenance = cfg.SCIENCE_BASE_MAINTENANCE > 0 ? cfg.SCIENCE_BASE_MAINTENANCE : 0.00; // Use config
            }
            // Calculate maintenance based on levels > 0
            newMaintenance = newBaseMaintenance + ((levelIndex - 1) * cfg.SCIENCE_MAINTENANCE_PER_LEVEL);
         } else {
             newBaseMaintenance = 0.00;
             newProduction = 0;
         }


        const newUpgradeCost = (levelIndex >= science.maxLevel) ? Infinity : Math.floor(cfg.SCIENCE_BASE_UPGRADE_COST * Math.pow(cfg.SCIENCE_UPGRADE_COST_MULTIPLIER, levelIndex));
        const newName = (levelIndex < cfg.SCIENCE_LEVEL_NAMES.length && cfg.SCIENCE_LEVEL_NAMES[levelIndex] !== undefined) ? cfg.SCIENCE_LEVEL_NAMES[levelIndex] : "Unknown";

        gs.updateScienceState({
            currentProduction: newProduction,
            currentMaintenance: newMaintenance,
            currentUpgradeCost: newUpgradeCost,
            currentName: newName,
            baseMaintenance: newBaseMaintenance // Persist potential change to base maintenance
        });
    } catch (e) {
        console.error("Error in calculateScienceStats:", e);
    }
}


// --- RESEARCH LOGIC ---

// Function to apply the effect of a research item
export function applyResearchEffect(researchItem) {
    try {
        if (!researchItem || !researchItem.effect) {
            console.warn("[WARN] applyResearchEffect: No effect defined for research item.", researchItem);
            return;
        }

        switch (researchItem.effect.type) {
            case 'text_feedback':
                // Display a feedback message for now
                showFeedbackText(researchItem.effect.text, 'var(--research-color)', undefined, 3000); // Use research color for feedback
                console.log(`[DEBUG] Research "${researchItem.name}" applied: ${researchItem.effect.text}`);
                break;
            // Add more effect types here later, e.g.,
            // case 'unlock_factory':
            //     unlockFactory(researchItem.effect.factoryKey);
            //     break;
            // case 'boost_all_factories':
            //     boostFactoryProduction(researchItem.effect.percentage);
            //     break;
            // case 'reduce_all_factory_maintenance':
            //     reduceFactoryMaintenance(researchItem.effect.percentage);
            //     break;
             case 'set_health_regen_boost': // Example: Science research could boost health regen
                 // This would require state for health regen boost and updating updateHealthAndHunger
                 console.log(`[DEBUG] Research "${researchItem.name}" applied: Health regen boosted.`);
                 break;
            default:
                console.warn("[WARN] applyResearchEffect: Unknown effect type:", researchItem.effect.type, "for item:", researchItem.key);
        }
    } catch (e) {
        console.error("Error in applyResearchEffect:", e);
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
        // Base health regen if needs met and health is below max
        if (healthChange === 0 && gs.getGameState().hunger >= 50 && currentHealth < cfg.MAX_STAT) {
             healthChange = cfg.STAT_REGEN_RATE;
        }
         // TODO: Add potential health regen boost from science research here
         // if (gs.getGameState().unlockedResearch.includes('health_regen_boost')) {
         //     healthChange += some_boost_amount;
         // }


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
        const { food, shelter, science, scienceUnlocked } = gs.getGameState();
        let totalMaintenance = food.currentMaintenance + shelter.currentMaintenance;

        // Add science maintenance if unlocked
        if (scienceUnlocked) {
            totalMaintenance += science.currentMaintenance;
        }

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

export function applyScienceProduction() {
    try {
        const { science, scienceUnlocked } = gs.getGameState();
        // Only produce science points if Science is unlocked and production is greater than 0
        if (scienceUnlocked && science.currentProduction > 0) {
             gs.addSciencePoints(science.currentProduction);
        }
    } catch (e) {
        console.error("Error in applyScienceProduction:", e);
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

// Function to check if Science should be unlocked
export function checkScienceUnlock() {
    try {
        const { food, shelter, scienceUnlocked } = gs.getGameState();

        // Unlock Science if both needs are at max level and Science isn't already unlocked
        if (food.level >= food.maxLevel && shelter.level >= shelter.maxLevel && !scienceUnlocked) {
            console.log("[DEBUG] coreLogic.js: Food and Shelter maxed. Unlocking Science.");

            gs.setScienceUnlocked(true);

            // Initialize Science state to level 1 upon unlock (assuming level 0 is "None")
             gs.updateScienceState({
                level: 1, // Start at level 1 upon unlock
                currentSciencePoints: 0 // Start with 0 science points
            });
            calculateScienceStats(); // Calculate initial science stats

            // Trigger a UI update to show the new section(s) and hide old ones
            updateDisplay();

            // Optional: Add a storyline update or special message for this milestone
        }
    } catch (e) {
        console.error("Error in checkScienceUnlock:", e);
    }
}

// New function to check for available research unlocks (based on science points)
export function checkResearchUnlockConditions() {
    try {
        const { scienceUnlocked, science, unlockedResearch } = gs.getGameState();
        if (!scienceUnlocked) return; // Only check if Science is unlocked

        // This function doesn't *unlock* anything, just checks if conditions *could* be met
        // Actual unlocking happens via user action (clicking the button)
        // This function is more of a placeholder if there were passive research unlocks
        // For this implementation, the logic is handled in the action.
        // We'll keep it simple and rely on the action's checks for now.
        // If you had passive research that unlocks automatically, this is where it would go.

    } catch (e) {
         console.error("Error in checkResearchUnlockConditions:", e);
    }
}
