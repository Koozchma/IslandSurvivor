// js/actions.js

import * as gs from './gameState.js';
import { showFeedbackText, pulseCapitalDisplay, formatNumber } from './utils.js';
import { updateDisplay } from './uiController.js';
import { calculatePromotionStats, calculateNeedStats, calculateFactoryStats } from './coreLogic.js';
import { PROMOTION_BONUS_LEVEL_INTERVAL, PROMOTION_BONUS_WAGE_INCREASE, FORAGE_HUNGER_GAIN, FORAGE_COOLDOWN_SECONDS, FACTORY_DATA } from './config.js';


export function earnMinimumWage() {
    try {
        if (gs.isGameOver) return;
        const currentWage = gs.promotion.currentWage;
        gs.addCapital(currentWage);
        showFeedbackText(`+$${formatNumber(currentWage, 2)}`, 'var(--positive-feedback)');
        pulseCapitalDisplay();
        if (gs.promotion.currentClicks < gs.promotion.clicksNeeded) {
            gs.updatePromotionState({ currentClicks: gs.promotion.currentClicks + 1 });
        }
        updateDisplay();
    } catch (e) { console.error("Error in earnMinimumWage:", e); }
}

export function upgradePromotionAction() {
    try {
        if (gs.isGameOver || gs.promotion.currentClicks < gs.promotion.clicksNeeded) return;
        const newLevel = gs.promotion.level + 1;
        gs.updatePromotionState({ level: newLevel, currentClicks: 0 });
        calculatePromotionStats();
        if (newLevel > 0 && newLevel % PROMOTION_BONUS_LEVEL_INTERVAL === 0) {
            const bonusAmount = PROMOTION_BONUS_WAGE_INCREASE;
            showFeedbackText(`Prize! +$${formatNumber(bonusAmount, 2)} Bonus Wage/Click!`, 'var(--secondary-accent)', undefined, 2000);
        } else {
            showFeedbackText("Promoted! Wage Increased!", 'var(--positive-feedback)');
        }
        updateDisplay();
    } catch (e) { console.error("Error in upgradePromotionAction:", e); }
}

export function upgradeNeedAction(needType) {
    try {
        if (gs.isGameOver) return;
        let needObj;
        if (needType === 'food') { needObj = gs.food; }
        else if (needType === 'shelter') { needObj = gs.shelter; }
        else { return; }

        const cost = needObj.currentUpgradeCost;
        if (typeof cost !== 'number' || isNaN(cost) || cost === Infinity) { return; } // Check cost validity

        if (needObj.level >= needObj.maxLevel) {
            showFeedbackText("Already at Max Level!", 'var(--neutral-feedback)'); return;
        }
        if (gs.capital >= cost) {
            gs.addCapital(-cost);
            if (needType === 'food') { gs.updateFoodState({ level: needObj.level + 1 }); }
            else if (needType === 'shelter') { gs.updateShelterState({ level: needObj.level + 1 }); }
            calculateNeedStats(needType); // Recalculate state AFTER level increase
            const feedbackMsg = needType === 'food' ? "Food Ops Upgraded!" : "Shelter Improved!";
            showFeedbackText(feedbackMsg, 'var(--positive-feedback)');
            pulseCapitalDisplay();
            updateDisplay();
        } else {
            showFeedbackText("Not enough capital!", 'var(--negative-feedback)');
        }
    } catch (e) { console.error(`Error in upgradeNeedAction for ${needType}:`, e); }
}

export function manualForageAction() {
    try {
        if (gs.isGameOver) return;
        const now = gs.gameSeconds;
        const cooldownEndTime = gs.food.forageCooldownEnd;
        if(typeof cooldownEndTime !== 'number' || isNaN(cooldownEndTime)){
             gs.updateFoodState({ forageCooldownEnd: now }); // Reset if invalid
             return;
         }
        if (now < cooldownEndTime) { return; }

        gs.setHunger(gs.hunger + FORAGE_HUNGER_GAIN);
        gs.updateFoodState({ forageCooldownEnd: now + FORAGE_COOLDOWN_SECONDS });
        showFeedbackText(`Foraged! +${FORAGE_HUNGER_GAIN} Hunger`, 'var(--positive-feedback)');
        updateDisplay();
    } catch (e) { console.error("Error in manualForageAction:", e); }
}

// --- Factory Actions ---
export function buyFactoryAction(factoryId) {
    try {
        if (gs.isGameOver) return;
        const factoryState = gs.factories[factoryId];
        const factoryBase = FACTORY_DATA[factoryId];
        if (!factoryState || !factoryBase || factoryState.level > 0) { return; }

        const cost = factoryBase.baseCost;
        if (gs.capital >= cost) {
            gs.addCapital(-cost);
            gs.updateFactoryState(factoryId, { level: 1 });
            calculateFactoryStats(factoryId); // Calculate initial CPS and next upgrade cost
            showFeedbackText(`${factoryBase.name} Purchased!`, 'var(--positive-feedback)');
            pulseCapitalDisplay();
            updateDisplay();
        } else {
             showFeedbackText("Not enough capital!", 'var(--negative-feedback)');
        }
    } catch(e) { console.error("Error buying factory:", factoryId, e); }
}

export function upgradeFactoryAction(factoryId) {
     try {
        if (gs.isGameOver) return;
        const factoryState = gs.factories[factoryId];
        if (!factoryState || factoryState.level <= 0 || factoryState.level >= factoryState.maxLevel) { return; }

        const cost = factoryState.currentUpgradeCost;
        if(typeof cost !== 'number' || isNaN(cost) || cost === Infinity) { return; }

        if (gs.capital >= cost) {
            gs.addCapital(-cost);
            gs.updateFactoryState(factoryId, { level: factoryState.level + 1 });
            calculateFactoryStats(factoryId); // Recalculate CPS and next upgrade cost
            showFeedbackText(`${FACTORY_DATA[factoryId].name} Upgraded!`, 'var(--positive-feedback)');
            pulseCapitalDisplay();
            updateDisplay();
        } else {
             showFeedbackText("Not enough capital!", 'var(--negative-feedback)');
        }
    } catch(e) { console.error("Error upgrading factory:", factoryId, e); }
}
