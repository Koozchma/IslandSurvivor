// js/uiController.js

import * as _DOM from './domElements.js'; // Corrected: Added 'as' keyword
import { formatNumber, setBarColor } from './utils.js';
import { getGameState } from './gameState.js';
import { STAGES, BASE_INTEREST_RATE, MAX_STAT } from './config.js';

export function updateStoryline() {
    const { capital, currentStageIndex, isGameOver } = getGameState();
    if (isGameOver) return;

    // Ensure STAGES and currentStageIndex are valid before accessing
    if (!STAGES || currentStageIndex < 0 || currentStageIndex >= STAGES.length) {
        // console.error("Invalid STAGES or currentStageIndex:", STAGES, currentStageIndex);
        return;
    }
    const currentStageData = STAGES[currentStageIndex];
    if (!currentStageData) {
        // console.error("No data for current stage index:", currentStageIndex);
        return;
    }

    if (_DOM.currentStageDisplay) _DOM.currentStageDisplay.textContent = currentStageData.name;
    if (_DOM.storyTextDisplay) _DOM.storyTextDisplay.textContent = currentStageData.text;

    let progress = 0;
    if (currentStageData.nextThreshold !== Infinity && currentStageIndex < STAGES.length) {
        const prevThreshold = currentStageIndex > 0 ? STAGES[currentStageIndex - 1].nextThreshold : 0;
        const range = currentStageData.nextThreshold - prevThreshold;
        if (range > 0) {
            progress = ((capital - prevThreshold) / range) * 100;
        } else if (capital >= currentStageData.nextThreshold) {
            progress = 100;
        }
        progress = Math.max(0, Math.min(100, progress));
    } else if (currentStageIndex >= STAGES.length - 1) {
        progress = 100;
    }
    if (_DOM.storyProgressBar) _DOM.storyProgressBar.style.width = progress + '%';
}


export function updateDisplay() {
    const { capital, gameSeconds, isGameOver, health, hunger, promotion, food, shelter } = getGameState();
    if (isGameOver) return;

    // Health Bar
    if (_DOM.healthBar) {
        setBarColor(_DOM.healthBar, health);
        _DOM.healthBar.style.width = (health / MAX_STAT * 100) + '%';
    }
    if (_DOM.healthText) _DOM.healthText.textContent = `${Math.max(0, Math.floor(health))}/${MAX_STAT}`;

    // Hunger Bar
    if (_DOM.hungerBar) {
        setBarColor(_DOM.hungerBar, hunger);
        _DOM.hungerBar.style.width = (hunger / MAX_STAT * 100) + '%';
    }
    if (_DOM.hungerText) _DOM.hungerText.textContent = `${Math.max(0, Math.floor(hunger))}/${MAX_STAT}`;

    // Capital & Game Info
    if (_DOM.capitalDisplay) _DOM.capitalDisplay.textContent = formatNumber(capital);
    if (_DOM.interestRateDisplay) _DOM.interestRateDisplay.textContent = (BASE_INTEREST_RATE * 100).toFixed(2);
    if (_DOM.gameTimeDisplay) _DOM.gameTimeDisplay.textContent = gameSeconds + 's';
    if (_DOM.wageValueDisplay) _DOM.wageValueDisplay.textContent = `+$${formatNumber(promotion.currentWage, 2)}`;

    // Promotion Section
    if (_DOM.currentWageDisplay) _DOM.currentWageDisplay.textContent = formatNumber(promotion.currentWage, 2);
    if (_DOM.promotionLevelDisplay) _DOM.promotionLevelDisplay.textContent = promotion.level;
    if (_DOM.promotionClicksDisplay) _DOM.promotionClicksDisplay.textContent = `Clicks: ${promotion.currentClicks}/${promotion.clicksNeeded}`;
    if (_DOM.promotionClickProgress) _DOM.promotionClickProgress.style.height = (promotion.currentClicks / promotion.clicksNeeded * 100) + '%';
    if (_DOM.promoteButton) _DOM.promoteButton.disabled = promotion.currentClicks < promotion.clicksNeeded;

    // Food Operations Display
    if (_DOM.foodLevelDisplay) {
        _DOM.foodLevelDisplay.textContent = food.level === 0 ? food.currentName : `${food.currentName} (Lvl ${food.level})`;
    }
    if (_DOM.foodProductionDisplay) {
        _DOM.foodProductionDisplay.textContent = `${formatNumber(food.currentProduction, 1)} units/sec`;
    }
    if (_DOM.foodMaintenanceDisplay) {
        _DOM.foodMaintenanceDisplay.textContent = `\$${formatNumber(food.currentMaintenance, 2)}/sec`;
    }
    if (_DOM.upgradeFoodButton) {
        if (food.level < food.maxLevel) {
            if (_DOM.foodUpgradeCostDisplay) _DOM.foodUpgradeCostDisplay.textContent = formatNumber(food.currentUpgradeCost, 0);
            _DOM.upgradeFoodButton.innerHTML = `Upgrade (Cost: $${formatNumber(food.currentUpgradeCost, 0)})`;
            _DOM.upgradeFoodButton.disabled = capital < food.currentUpgradeCost;
        } else {
            if (_DOM.foodUpgradeCostDisplay) _DOM.foodUpgradeCostDisplay.textContent = "MAX";
            _DOM.upgradeFoodButton.innerHTML = `Max Level Reached`;
            _DOM.upgradeFoodButton.disabled = true;
        }
    }

    // Shelter Operations Display
    if (_DOM.shelterLevelDisplay) {
        _DOM.shelterLevelDisplay.textContent = shelter.level === 0 ? shelter.currentName : `${shelter.currentName} (Lvl ${shelter.level})`;
    }
    if (_DOM.shelterQualityDisplay) _DOM.shelterQualityDisplay.textContent = shelter.level;
    if (_DOM.shelterMaintenanceDisplay) {
        _DOM.shelterMaintenanceDisplay.textContent = `\$${formatNumber(shelter.currentMaintenance, 2)}/sec`;
    }
    if (_DOM.upgradeShelterButton) {
        if (shelter.level < shelter.maxLevel) {
            if (_DOM.shelterUpgradeCostDisplay) _DOM.shelterUpgradeCostDisplay.textContent = formatNumber(shelter.currentUpgradeCost, 0);
            _DOM.upgradeShelterButton.innerHTML = `Upgrade (Cost: $${formatNumber(shelter.currentUpgradeCost, 0)})`;
            _DOM.upgradeShelterButton.disabled = capital < shelter.currentUpgradeCost;
        } else {
            if (_DOM.shelterUpgradeCostDisplay) _DOM.shelterUpgradeCostDisplay.textContent = "MAX";
            _DOM.upgradeShelterButton.innerHTML = `Max Level Reached`;
            _DOM.upgradeShelterButton.disabled = true;
        }
    }

    // Financial Summary
    const totalMaintenance = food.currentMaintenance + shelter.currentMaintenance;
    if (_DOM.totalMaintenanceDisplay) {
        _DOM.totalMaintenanceDisplay.textContent = `\$${formatNumber(totalMaintenance, 2)} /sec`;
    }

    const interestGain = capital > 0 ? capital * BASE_INTEREST_RATE : 0;
    const netGain = interestGain - totalMaintenance;
    if (_DOM.netGainDisplay) {
        _DOM.netGainDisplay.textContent = `${formatNumber(netGain, 2)} /sec`;
        _DOM.netGainDisplay.className = netGain >= 0 ? 'positive' : 'negative';
    }

    updateStoryline();
}

export function showGameOverUI(reason) {
    let title = "Game Over";
    let message = "Your journey has ended.";
    if (reason === "hunger") {
        title = "Starvation!";
        message = "Your colony succumbed to hunger. Better food management is needed next time.";
    } else if (reason === "health") {
        title = "Collapse!";
        message = "Poor living conditions and health led to the collapse of your efforts.";
    }
    if (_DOM.gameOverTitle) _DOM.gameOverTitle.textContent = title;
    if (_DOM.gameOverMessage) _DOM.gameOverMessage.textContent = message;
    if (_DOM.gameOverScreen) _DOM.gameOverScreen.style.display = 'flex';

    // Disable game interaction buttons
    if (_DOM.earnButton) _DOM.earnButton.disabled = true;
    if (_DOM.promoteButton) _DOM.promoteButton.disabled = true;
    if (_DOM.upgradeFoodButton) _DOM.upgradeFoodButton.disabled = true;
    if (_DOM.upgradeShelterButton) _DOM.upgradeShelterButton.disabled = true;
}

export function hideGameOverUI() {
    if(_DOM.gameOverScreen) _DOM.gameOverScreen.style.display = 'none';
}
