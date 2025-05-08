import *_DOM from './domElements.js'; // Use _DOM to avoid conflict if DOM is used as a var name
import { formatNumber, setBarColor, showFeedbackText as utilShowFeedbackText } from './utils.js';
import { getGameState } from './gameState.js';
import { STAGES, BASE_INTEREST_RATE, MAX_STAT, FOOD_LEVEL_NAMES, SHELTER_LEVEL_NAMES, FOOD_PRODUCTION_VALUES } from './config.js';

export function updateStoryline() {
    const { capital, currentStageIndex, isGameOver } = getGameState();
    if (isGameOver) return;

    const currentStageData = STAGES[currentStageIndex];
    // Logic for advancing stage is now in main or coreLogic, this just displays
    _DOM.currentStageDisplay.textContent = currentStageData.name;
    _DOM.storyTextDisplay.textContent = currentStageData.text;

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
    _DOM.storyProgressBar.style.width = progress + '%';
}


export function updateDisplay() {
    const { capital, gameSeconds, isGameOver, health, hunger, promotion, food, shelter } = getGameState();
    if (isGameOver) return;

    setBarColor(_DOM.healthBar, health);
    _DOM.healthBar.style.width = (health / MAX_STAT * 100) + '%';
    _DOM.healthText.textContent = `${Math.max(0, Math.floor(health))}/${MAX_STAT}`;
    
    setBarColor(_DOM.hungerBar, hunger);
    _DOM.hungerBar.style.width = (hunger / MAX_STAT * 100) + '%';
    _DOM.hungerText.textContent = `${Math.max(0, Math.floor(hunger))}/${MAX_STAT}`;

    _DOM.capitalDisplay.textContent = formatNumber(capital);
    _DOM.interestRateDisplay.textContent = (BASE_INTEREST_RATE * 100).toFixed(2);
    _DOM.gameTimeDisplay.textContent = gameSeconds + 's';
    _DOM.wageValueDisplay.textContent = `+$${formatNumber(promotion.currentWage, 2)}`;

    _DOM.currentWageDisplay.textContent = formatNumber(promotion.currentWage, 2);
    _DOM.promotionLevelDisplay.textContent = promotion.level;
    _DOM.promotionClicksDisplay.textContent = `Clicks: ${promotion.currentClicks}/${promotion.clicksNeeded}`;
    _DOM.promotionClickProgress.style.height = (promotion.currentClicks / promotion.clicksNeeded * 100) + '%';
    _DOM.promoteButton.disabled = promotion.currentClicks < promotion.clicksNeeded;

    _DOM.foodLevelDisplay.textContent = food.currentName;
    _DOM.foodProductionDisplay.textContent = formatNumber(food.currentProduction, 1) + " units/sec";
    _DOM.foodMaintenanceDisplay.textContent = formatNumber(food.currentMaintenance, 2) + "/sec";
    if (food.level < food.maxLevel) {
        _DOM.foodUpgradeCostDisplay.textContent = formatNumber(food.currentUpgradeCost, 0);
        _DOM.upgradeFoodButton.innerHTML = `Upgrade (Cost: $${formatNumber(food.currentUpgradeCost, 0)})`;
        _DOM.upgradeFoodButton.disabled = capital < food.currentUpgradeCost;
    } else {
        _DOM.foodUpgradeCostDisplay.textContent = "MAX";
        _DOM.upgradeFoodButton.innerHTML = `Max Level Reached`;
        _DOM.upgradeFoodButton.disabled = true;
    }

    _DOM.shelterLevelDisplay.textContent = shelter.currentName;
    _DOM.shelterQualityDisplay.textContent = shelter.level;
    _DOM.shelterMaintenanceDisplay.textContent = formatNumber(shelter.currentMaintenance, 2) + "/sec";
    if (shelter.level < shelter.maxLevel) {
        _DOM.shelterUpgradeCostDisplay.textContent = formatNumber(shelter.currentUpgradeCost, 0);
        _DOM.upgradeShelterButton.innerHTML = `Upgrade (Cost: $${formatNumber(shelter.currentUpgradeCost, 0)})`;
        _DOM.upgradeShelterButton.disabled = capital < shelter.currentUpgradeCost;
    } else {
        _DOM.shelterUpgradeCostDisplay.textContent = "MAX";
        _DOM.upgradeShelterButton.innerHTML = `Max Level Reached`;
        _DOM.upgradeShelterButton.disabled = true;
    }

    const totalMaintenance = food.currentMaintenance + shelter.currentMaintenance;
    _DOM.totalMaintenanceDisplay.textContent = formatNumber(totalMaintenance, 2) + " / sec";
    const interestGain = capital > 0 ? capital * BASE_INTEREST_RATE : 0;
    const netGain = interestGain - totalMaintenance;
    _DOM.netGainDisplay.textContent = formatNumber(netGain, 2) + " / sec";
    _DOM.netGainDisplay.className = netGain >= 0 ? 'positive' : 'negative';
    
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
    _DOM.gameOverTitle.textContent = title;
    _DOM.gameOverMessage.textContent = message;
    _DOM.gameOverScreen.style.display = 'flex';

    _DOM.earnButton.disabled = true;
    _DOM.promoteButton.disabled = true;
    _DOM.upgradeFoodButton.disabled = true;
    _DOM.upgradeShelterButton.disabled = true;
}

export function hideGameOverUI() {
    if(_DOM.gameOverScreen) _DOM.gameOverScreen.style.display = 'none';
    // Re-enable buttons if needed, but initializeGame should handle this
}