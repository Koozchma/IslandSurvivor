import * as gs from './gameState.js';
import { showFeedbackText, pulseCapitalDisplay, formatNumber } from './utils.js';
import { updateDisplay } from './uiController.js';
import { calculatePromotionStats, calculateNeedStats } from './coreLogic.js'; // Import calculation logic
import { FOOD_LEVEL_NAMES, SHELTER_LEVEL_NAMES, FOOD_PRODUCTION_VALUES } from './config.js';


export function earnMinimumWage() {
    if (gs.isGameOver) return;

    gs.setCapital(gs.capital + gs.promotion.currentWage);
    showFeedbackText(`+$${formatNumber(gs.promotion.currentWage, 2)}`, 'var(--positive-feedback)');
    pulseCapitalDisplay();
    
    if (gs.promotion.currentClicks < gs.promotion.clicksNeeded) {
        gs.updatePromotionState({ currentClicks: gs.promotion.currentClicks + 1 });
    }
    updateDisplay();
}

export function upgradePromotionAction() {
    if (gs.isGameOver || gs.promotion.currentClicks < gs.promotion.clicksNeeded) return;
    
    gs.updatePromotionState({ 
        level: gs.promotion.level + 1,
        currentClicks: 0 
    });
    calculatePromotionStats(); // Recalculate wage, etc.
    showFeedbackText("Promoted! Wage Increased!", 'var(--positive-feedback)');
    updateDisplay();
}

export function upgradeNeedAction(needType) {
    if (gs.isGameOver) return;
    let needObj, namesArray, productionValues = null, feedbackMsg;

    if (needType === 'food') {
        needObj = gs.food; namesArray = FOOD_LEVEL_NAMES; productionValues = FOOD_PRODUCTION_VALUES;
        feedbackMsg = "Food Ops Upgraded!";
    } else if (needType === 'shelter') {
        needObj = gs.shelter; namesArray = SHELTER_LEVEL_NAMES;
        feedbackMsg = "Shelter Improved!";
    } else { return; }

    if (needObj.level >= needObj.maxLevel) {
        showFeedbackText("Already at Max Level!", 'var(--neutral-feedback)'); return;
    }
    if (gs.capital >= needObj.currentUpgradeCost) {
        gs.setCapital(gs.capital - needObj.currentUpgradeCost);
        
        if (needType === 'food') {
            gs.updateFoodState({ level: needObj.level + 1 });
        } else if (needType === 'shelter') {
            gs.updateShelterState({ level: needObj.level + 1 });
        }
        
        calculateNeedStats(needType); // Recalculate costs, production, etc.
        showFeedbackText(feedbackMsg, 'var(--positive-feedback)');
        pulseCapitalDisplay();
        updateDisplay();
    } else {
        showFeedbackText("Not enough capital!", 'var(--negative-feedback)');
    }
}