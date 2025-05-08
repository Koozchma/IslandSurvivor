// js/actions.js

import * as gs from './gameState.js';
import { showFeedbackText, pulseCapitalDisplay, formatNumber } from './utils.js';
import { updateDisplay } from './uiController.js';
import { calculatePromotionStats, calculateNeedStats } from './coreLogic.js';
// Note: Config imports like FOOD_LEVEL_NAMES might not be needed here if calculateNeedStats handles names


export function earnMinimumWage() {
    if (gs.isGameOver) return;

    gs.addCapital(gs.promotion.currentWage); // Use addCapital
    showFeedbackText(`+$${formatNumber(gs.promotion.currentWage, 2)}`, 'var(--positive-feedback)');
    pulseCapitalDisplay();

    if (gs.promotion.currentClicks < gs.promotion.clicksNeeded) {
        gs.updatePromotionState({ currentClicks: gs.promotion.currentClicks + 1 });
    }
    updateDisplay(); // Update UI after state change
}

export function upgradePromotionAction() {
    if (gs.isGameOver || gs.promotion.currentClicks < gs.promotion.clicksNeeded) return;

    gs.updatePromotionState({
        level: gs.promotion.level + 1,
        currentClicks: 0
    });
    calculatePromotionStats(); // Recalculate derived wage
    showFeedbackText("Promoted! Wage Increased!", 'var(--positive-feedback)');
    updateDisplay(); // Update UI after state change
}

export function upgradeNeedAction(needType) {
    if (gs.isGameOver) return;
    let needObj;

    if (needType === 'food') { needObj = gs.food; }
    else if (needType === 'shelter') { needObj = gs.shelter; }
    else { return; }

    if (needObj.level >= needObj.maxLevel) {
        showFeedbackText("Already at Max Level!", 'var(--neutral-feedback)'); return;
    }
    if (gs.capital >= needObj.currentUpgradeCost) {
        gs.addCapital(-needObj.currentUpgradeCost); // Deduct cost

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
}
