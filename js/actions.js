// js/actions.js

import * as gs from './gameState.js';
import { showFeedbackText, pulseCapitalDisplay, formatNumber } from './utils.js';
import { updateDisplay } from './uiController.js';
import { calculatePromotionStats, calculateNeedStats } from './coreLogic.js';
import { PROMOTION_BONUS_LEVEL_INTERVAL, PROMOTION_BONUS_WAGE_INCREASE } from './config.js'; // Import prize constants


export function earnMinimumWage() {
    // ... (same as before) ...
    if (gs.isGameOver) return;
    gs.addCapital(gs.promotion.currentWage);
    showFeedbackText(`+$${formatNumber(gs.promotion.currentWage, 2)}`, 'var(--positive-feedback)');
    pulseCapitalDisplay();
    if (gs.promotion.currentClicks < gs.promotion.clicksNeeded) {
        gs.updatePromotionState({ currentClicks: gs.promotion.currentClicks + 1 });
    }
    updateDisplay();
}

export function upgradePromotionAction() {
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
        // Calculate the specific bonus amount just added
        const currentBonusAmount = cfg.PROMOTION_BONUS_WAGE_INCREASE;
        showFeedbackText(`Prize! +$${formatNumber(currentBonusAmount, 2)} Bonus Wage/Click!`, 'var(--secondary-accent)', undefined, 2000); // Longer display
    } else {
        showFeedbackText("Promoted! Wage Increased!", 'var(--positive-feedback)');
    }

    updateDisplay(); // Update UI after state change
}

export function upgradeNeedAction(needType) {
    // ... (same as before) ...
     if (gs.isGameOver) return;
    let needObj;
    if (needType === 'food') { needObj = gs.food; }
    else if (needType === 'shelter') { needObj = gs.shelter; }
    else { return; }
    if (needObj.level >= needObj.maxLevel) {
        showFeedbackText("Already at Max Level!", 'var(--neutral-feedback)'); return;
    }
    if (gs.capital >= needObj.currentUpgradeCost) {
        gs.addCapital(-needObj.currentUpgradeCost);
        if (needType === 'food') {
            gs.updateFoodState({ level: needObj.level + 1 });
        } else if (needType === 'shelter') {
            gs.updateShelterState({ level: needObj.level + 1 });
        }
        calculateNeedStats(needType);
        const feedbackMsg = needType === 'food' ? "Food Ops Upgraded!" : "Shelter Improved!";
        showFeedbackText(feedbackMsg, 'var(--positive-feedback)');
        pulseCapitalDisplay();
        updateDisplay();
    } else {
        showFeedbackText("Not enough capital!", 'var(--negative-feedback)');
    }
}
