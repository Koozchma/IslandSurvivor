// js/actions.js

import * as gs from './gameState.js';
import { showFeedbackText, pulseCapitalDisplay, formatNumber } from './utils.js';
import { updateDisplay } from './uiController.js';
// Import new calculation functions
import { calculatePromotionStats, calculateNeedStats, calculateScienceStats } from './coreLogic.js';
// Import new science config
import { PROMOTION_BONUS_LEVEL_INTERVAL, PROMOTION_BONUS_WAGE_INCREASE, FORAGE_HUNGER_GAIN, FORAGE_COOLDOWN_SECONDS, SCIENCE_BASE_UPGRADE_COST, SCIENCE_UPGRADE_COST_MULTIPLIER, SCIENCE_MAX_LEVEL } from './config.js';


export function earnMinimumWage() {
    try {
        if (gs.isGameOver) return;

        gs.addCapital(gs.promotion.currentWage);
        showFeedbackText(`+$${formatNumber(gs.promotion.currentWage, 2)}`, 'var(--positive-feedback)');
        pulseCapitalDisplay();

        if (gs.promotion.currentClicks < gs.promotion.clicksNeeded) {
            gs.updatePromotionState({ currentClicks: gs.promotion.currentClicks + 1 });
        }
        updateDisplay(); // Update UI after potential state change
    } catch (e) {
        console.error("Error in earnMinimumWage:", e);
    }
}

export function upgradePromotionAction() {
    try {
        if (gs.isGameOver || gs.promotion.currentClicks < gs.promotion.clicksNeeded) return;

        const oldLevel = gs.promotion.level;
        const newLevel = oldLevel + 1;

        gs.updatePromotionState({
            level: newLevel,
            currentClicks: 0
        });
        calculatePromotionStats(); // Recalculate derived wage including potential bonus

        // Check if this new level is a bonus level
        if (newLevel > 0 && newLevel % PROMOTION_BONUS_LEVEL_INTERVAL === 0) {
            const currentBonusAmount = PROMOTION_BONUS_WAGE_INCREASE; // Use imported constant
            showFeedbackText(`Prize! +$${formatNumber(currentBonusAmount, 2)} Bonus Wage/Click!`, 'var(--secondary-accent)', undefined, 2000);
        } else {
            showFeedbackText("Promoted! Wage Increased!", 'var(--positive-feedback)');
        }

        updateDisplay(); // Update UI after state change
    } catch (e) {
        console.error("Error in upgradePromotionAction:", e);
    }
}

export function upgradeNeedAction(needType) {
    try {
        if (gs.isGameOver) return;
        let needObj;

        if (needType === 'food') { needObj = gs.food; }
        else if (needType === 'shelter') { needObj = gs.shelter; }
        else { return; }

        // Ensure cost is a number before comparison
        const currentUpgradeCost = needObj.currentUpgradeCost;
        if(typeof currentUpgradeCost !== 'number' || isNaN(currentUpgradeCost)) {
            console.error(`Invalid upgrade cost for ${needType}:`, currentUpgradeCost);
            return; // Prevent upgrade if cost is invalid
        }


        if (needObj.level >= needObj.maxLevel) {
            showFeedbackText("Already at Max Level!", 'var(--neutral-feedback)'); return;
        }
        if (gs.capital >= currentUpgradeCost) {
            gs.addCapital(-currentUpgradeCost); // Deduct cost

            // Update level directly in gameState
            if (needType === 'food') {
                gs.updateFoodState({ level: needObj.level + 1 });
            } else if (needType === 'shelter') {
                gs.updateShelterState({ level: needObj.level + 1 });
            }

            calculateNeedStats(needType); // Recalculate costs, production, name etc. for the new level
            const feedbackMsg = needType === 'food' ? "Food Ops Upgraded!" : "Shelter Improved!";
            showFeedbackText(feedbackMsg, 'var(--positive-feedback)');
            pulseCapitalDisplay();
            updateDisplay(); // Update UI after state changes
        } else {
            showFeedbackText("Not enough capital!", 'var(--negative-feedback)');
        }
    } catch (e) {
        console.error(`Error in upgradeNeedAction for ${needType}:`, e);
    }
}


export function manualForageAction() {
    try {
        if (gs.isGameOver) return;

        const now = gs.gameSeconds;
        // Ensure cooldown end time is valid before comparison
        const cooldownEndTime = gs.food.forageCooldownEnd;
        if(typeof cooldownEndTime !== 'number' || isNaN(cooldownEndTime)) {
            console.error("Invalid forageCooldownEnd:", cooldownEndTime);
            gs.updateFoodState({ forageCooldownEnd: now }); // Reset cooldown if invalid
            return;
        }


        if (now < cooldownEndTime) {
            return; // Exit silently if on cooldown
        }

        // Apply hunger gain
        gs.setHunger(gs.hunger + FORAGE_HUNGER_GAIN);

        // Set cooldown end time
        gs.updateFoodState({ forageCooldownEnd: now + FORAGE_COOLDOWN_SECONDS });

        showFeedbackText(`Foraged! +${FORAGE_HUNGER_GAIN} Hunger`, 'var(--positive-feedback)');
        updateDisplay(); // Update UI to show hunger change and cooldown state
    } catch (e) {
        console.error("Error in manualForageAction:", e);
    }
}

// New action to upgrade Science
export function upgradeScienceAction() {
    try {
        const { isGameOver, science, capital, scienceUnlocked } = gs.getGameState();
        if (gs.isGameOver || !scienceUnlocked) {
             if(!scienceUnlocked) console.log("[DEBUG] upgradeScienceAction skipped, Science not unlocked.");
             return; // Only allow upgrade if game is not over and Science IS unlocked
        }

        // Ensure cost is a number before comparison
        const currentUpgradeCost = science.currentUpgradeCost;
        if(typeof currentUpgradeCost !== 'number' || isNaN(currentUpgradeCost)) {
            console.error(`Invalid science upgrade cost:`, currentUpgradeCost);
            return; // Prevent upgrade if cost is invalid
        }


        if (science.level >= science.maxLevel) {
            showFeedbackText("Already at Max Level!", 'var(--neutral-feedback)'); return;
        }
        if (capital >= currentUpgradeCost) {
            gs.addCapital(-currentUpgradeCost); // Deduct cost

            gs.updateScienceState({ level: science.level + 1 }); // Update science level
            calculateScienceStats(); // Recalculate science stats for the new level

            showFeedbackText("Science Upgraded!", 'var(--science-color)'); // Use the science color for feedback
            pulseCapitalDisplay();
            updateDisplay(); // Update UI after state changes
        } else {
            showFeedbackText("Not enough capital!", 'var(--negative-feedback)');
        }
    } catch (e) {
        console.error(`Error in upgradeScienceAction:`, e);
    }
}
