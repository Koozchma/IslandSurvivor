// js/uiController.js

import *_DOM from './domElements.js';
import { formatNumber, setBarColor } from './utils.js';
import { getGameState } from './gameState.js';
// --- Corrected Import Line Below ---
import { STAGES, BASE_INTEREST_RATE, MAX_STAT, FORAGE_MAX_FOOD_LEVEL, FORAGE_COOLDOWN_SECONDS, FORAGE_HUNGER_GAIN } from './config.js';
// --- End Correction ---


// function updateStoryline() remains the same as the last full version provided
export function updateStoryline() {
    try {
        const { capital, currentStageIndex, isGameOver } = getGameState();
        if (isGameOver) return;
        if (!_DOM.currentStageDisplay || !_DOM.storyTextDisplay || !_DOM.storyProgressBar) return;
        if (!STAGES || currentStageIndex < 0 || currentStageIndex >= STAGES.length) return;
        const currentStageData = STAGES[currentStageIndex];
        if (!currentStageData) return;

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
    } catch (e) {
        console.error("Error in updateStoryline:", e);
    }
}

// function updateDisplay() remains the same, using the imported FORAGE_MAX_FOOD_LEVEL correctly
export function updateDisplay() {
    try {
        const { capital, gameSeconds, isGameOver, health, hunger, promotion, food, shelter } = getGameState();
        if (isGameOver) return;

        if (_DOM.healthBar) setBarColor(_DOM.healthBar, health);
        if (_DOM.healthBar) _DOM.healthBar.style.width = (health / MAX_STAT * 100) + '%';
        if (_DOM.healthText) _DOM.healthText.textContent = `${Math.max(0, Math.floor(health))}/${MAX_STAT}`;

        if (_DOM.hungerBar) setBarColor(_DOM.hungerBar, hunger);
        if (_DOM.hungerBar) _DOM.hungerBar.style.width = (hunger / MAX_STAT * 100) + '%';
        if (_DOM.hungerText) _DOM.hungerText.textContent = `${Math.max(0, Math.floor(hunger))}/${MAX_STAT}`;

        if (_DOM.capitalDisplay) _DOM.capitalDisplay.textContent = formatNumber(capital);
        if (_DOM.interestRateDisplay) _DOM.interestRateDisplay.textContent = (BASE_INTEREST_RATE * 100).toFixed(2);
        if (_DOM.gameTimeDisplay) _DOM.gameTimeDisplay.textContent = gameSeconds + 's';
        if (_DOM.wageValueDisplay) _DOM.wageValueDisplay.textContent = `+$${formatNumber(promotion.currentWage, 2)}`;

        if (_DOM.currentWageDisplay) _DOM.currentWageDisplay.textContent = formatNumber(promotion.currentWage, 2);
        if (_DOM.promotionLevelDisplay) _DOM.promotionLevelDisplay.textContent = promotion.level;
        if (_DOM.promotionClicksDisplay) _DOM.promotionClicksDisplay.textContent = `Clicks: ${promotion.currentClicks}/${promotion.clicksNeeded}`;
        if (_DOM.promotionClickProgress) _DOM.promotionClickProgress.style.height = (promotion.currentClicks / promotion.clicksNeeded * 100) + '%';
        if (_DOM.promoteButton) _DOM.promoteButton.disabled = promotion.currentClicks < promotion.clicksNeeded;

        if (_DOM.foodLevelDisplay) _DOM.foodLevelDisplay.textContent = food.level === 0 ? food.currentName : `${food.currentName} (Lvl ${food.level})`;
        if (_DOM.foodProductionDisplay) _DOM.foodProductionDisplay.textContent = `${formatNumber(food.currentProduction, 1)} units/sec`;
        if (_DOM.foodMaintenanceDisplay) _DOM.foodMaintenanceDisplay.textContent = `\$${formatNumber(food.currentMaintenance, 2)}/sec`;
        if (_DOM.upgradeFoodButton) { /* ... */ } // Unchanged
        if (_DOM.manualForageButton) {
            if (food.level <= FORAGE_MAX_FOOD_LEVEL) { // This line uses the imported constant
                _DOM.manualForageButton.style.display = 'block';
                const now = gameSeconds;
                const cooldownRemaining = food.forageCooldownEnd - now;
                if (cooldownRemaining > 0) {
                    _DOM.manualForageButton.disabled = true;
                    _DOM.manualForageButton.textContent = `Forage (Wait ${cooldownRemaining}s)`;
                } else {
                    _DOM.manualForageButton.disabled = false;
                    _DOM.manualForageButton.textContent = `Manual Forage (+${FORAGE_HUNGER_GAIN} Hunger)`;
                }
            } else {
                _DOM.manualForageButton.style.display = 'none';
            }
        }

        if (_DOM.shelterLevelDisplay) _DOM.shelterLevelDisplay.textContent = shelter.level === 0 ? shelter.currentName : `${shelter.currentName} (Lvl ${shelter.level})`;
        if (_DOM.shelterQualityDisplay) _DOM.shelterQualityDisplay.textContent = shelter.level;
        if (_DOM.shelterMaintenanceDisplay) _DOM.shelterMaintenanceDisplay.textContent = `\$${formatNumber(shelter.currentMaintenance, 2)}/sec`;
        if (_DOM.upgradeShelterButton) { /* ... */ } // Unchanged

        const totalMaintenance = food.currentMaintenance + shelter.currentMaintenance;
        if (_DOM.totalMaintenanceDisplay) _DOM.totalMaintenanceDisplay.textContent = `\$${formatNumber(totalMaintenance, 2)} /sec`;
        const interestGain = capital > 0 ? capital * BASE_INTEREST_RATE : 0;
        const netGain = interestGain - totalMaintenance;
        if (_DOM.netGainDisplay) {
            _DOM.netGainDisplay.textContent = `${formatNumber(netGain, 2)} /sec`;
            _DOM.netGainDisplay.className = netGain >= 0 ? 'positive' : 'negative';
        }

        updateStoryline();

    } catch (e) {
        console.error("Error during updateDisplay:", e);
    }
}

// functions showGameOverUI() and hideGameOverUI() remain the same as the last full version provided
export function showGameOverUI(reason) {
    try {
        let title = "Game Over";
        let message = "Your journey has ended.";
        if (reason === "hunger") {
            title = "Starvation!";
            message = "Your colony succumbed to hunger. Better food management is needed next time.";
        } else if (reason === "health") {
            title = "Collapse!";
            message = "Poor living conditions and health led to the collapse of your efforts.";
        } else if (reason === "error") {
             title = "System Error!";
             message = "An unexpected error occurred. Please check the console (F12).";
        }
        if (_DOM.gameOverTitle) _DOM.gameOverTitle.textContent = title;
        if (_DOM.gameOverMessage) _DOM.gameOverMessage.textContent = message;
        if (_DOM.gameOverScreen) _DOM.gameOverScreen.style.display = 'flex';

        if (_DOM.earnButton) _DOM.earnButton.disabled = true;
        if (_DOM.promoteButton) _DOM.promoteButton.disabled = true;
        if (_DOM.upgradeFoodButton) _DOM.upgradeFoodButton.disabled = true;
        if (_DOM.upgradeShelterButton) _DOM.upgradeShelterButton.disabled = true;
        if (_DOM.manualForageButton) _DOM.manualForageButton.disabled = true;
    } catch (e) {
        console.error("Error showing game over UI:", e);
    }
}
export function hideGameOverUI() {
    if(_DOM.gameOverScreen) _DOM.gameOverScreen.style.display = 'none';
}
