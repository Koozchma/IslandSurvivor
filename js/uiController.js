// js/uiController.js

import *_DOM from './domElements.js';
import { formatNumber, setBarColor } from './utils.js';
import { getGameState } from './gameState.js';
import { STAGES, BASE_INTEREST_RATE, MAX_STAT, FACTORY_DATA, FORAGE_MAX_FOOD_LEVEL, FORAGE_COOLDOWN_SECONDS, FORAGE_HUNGER_GAIN } from './config.js';
import { buyFactoryAction, upgradeFactoryAction } from './actions.js';

let factoriesCreated = false;

function createFactoryCards() {
    if (!DOM.factoriesGrid) {
        console.error("Factories grid container not found!");
        return;
    }
    DOM.factoriesGrid.innerHTML = ''; // Clear previous
    for (const id in FACTORY_DATA) {
        const factoryBase = FACTORY_DATA[id];
        const card = document.createElement('div');
        card.className = 'factory-card';
        card.id = `factory-${id}`;
        card.innerHTML = `
            <h3>${factoryBase.icon} ${factoryBase.name}</h3>
            <p>Level: <span id="factory-${id}-level">0</span></p>
            <p>Production: $<span id="factory-${id}-cps">0.00</span>/sec</p>
            <button id="factory-${id}-button">Buy (Cost: $${formatNumber(factoryBase.baseCost, 0)})</button>
        `;
        const button = card.querySelector(`#factory-${id}-button`);
        if (button) {
            button.addEventListener('click', () => {
                const currentFactoryState = getGameState().factories[id];
                if (currentFactoryState && currentFactoryState.level === 0) { // Check if state exists
                    buyFactoryAction(id);
                } else if (currentFactoryState) {
                    upgradeFactoryAction(id);
                }
            });
        }
        DOM.factoriesGrid.appendChild(card);
    }
    factoriesCreated = true;
    console.log("[DEBUG] uiController: Factory cards created.");
}


export function updateStoryline() {
    // ... (Keep as is from previous full version) ...
    try {
        const { capital, currentStageIndex, isGameOver } = getGameState();
        if (isGameOver || !_DOM.currentStageDisplay || !_DOM.storyTextDisplay || !_DOM.storyProgressBar) return;
        if (!STAGES || currentStageIndex < 0 || currentStageIndex >= STAGES.length) return;
        const currentStageData = STAGES[currentStageIndex];
        if (!currentStageData) return;

        _DOM.currentStageDisplay.textContent = currentStageData.name;
        _DOM.storyTextDisplay.textContent = currentStageData.text;

        let progress = 0;
        if (currentStageData.nextThreshold !== Infinity && currentStageIndex < STAGES.length) {
            const prevThreshold = currentStageIndex > 0 ? STAGES[currentStageIndex - 1].nextThreshold : 0;
            const range = currentStageData.nextThreshold - prevThreshold;
            if (range > 0 && typeof capital === 'number' && typeof prevThreshold === 'number' && typeof currentStageData.nextThreshold === 'number') {
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


export function updateDisplay() {
    try {
        if (!factoriesCreated) {
            createFactoryCards(); // Create factory cards on first update if needed
        }

        const { capital, gameSeconds, isGameOver, health, hunger, promotion, food, shelter, factories: currentFactories } = getGameState();

        if (isGameOver || !_DOM.capitalDisplay || !_DOM.healthBar || !_DOM.hungerBar) {
            return; // Don't update if game over or critical elements missing
        }

        // Health Bar
        setBarColor(_DOM.healthBar, health);
        _DOM.healthBar.style.width = (health / MAX_STAT * 100) + '%';
        if (_DOM.healthText) _DOM.healthText.textContent = `${Math.max(0, Math.floor(health))}/${MAX_STAT}`;

        // Hunger Bar
        setBarColor(_DOM.hungerBar, hunger);
        _DOM.hungerBar.style.width = (hunger / MAX_STAT * 100) + '%';
        if (_DOM.hungerText) _DOM.hungerText.textContent = `${Math.max(0, Math.floor(hunger))}/${MAX_STAT}`;

        // Capital & Game Info
        _DOM.capitalDisplay.textContent = formatNumber(capital);
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
        if (_DOM.foodLevelDisplay) _DOM.foodLevelDisplay.textContent = food.level === 0 ? food.currentName : `${food.currentName} (Lvl ${food.level})`;
        if (_DOM.foodProductionDisplay) _DOM.foodProductionDisplay.textContent = `${formatNumber(food.currentProduction, 1)} units/sec`;
        if (_DOM.foodMaintenanceDisplay) _DOM.foodMaintenanceDisplay.textContent = `\$${formatNumber(food.currentMaintenance, 2)}/sec`;
        if (_DOM.upgradeFoodButton) { /* ... (same logic as before) ... */
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
        if (_DOM.manualForageButton) { /* ... (same logic as before) ... */
            if (food.level <= FORAGE_MAX_FOOD_LEVEL) {
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

        // Shelter Operations Display
        if (_DOM.shelterLevelDisplay) _DOM.shelterLevelDisplay.textContent = shelter.level === 0 ? shelter.currentName : `${shelter.currentName} (Lvl ${shelter.level})`;
        if (_DOM.shelterQualityDisplay) _DOM.shelterQualityDisplay.textContent = shelter.level;
        if (_DOM.shelterMaintenanceDisplay) _DOM.shelterMaintenanceDisplay.textContent = `\$${formatNumber(shelter.currentMaintenance, 2)}/sec`;
        if (_DOM.upgradeShelterButton) { /* ... (same logic as before) ... */
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

        // --- Update Factory Cards ---
        let totalCps = 0;
        if (currentFactories) { // Check if factories state exists
            for (const id in currentFactories) {
                const factoryState = currentFactories[id];
                const factoryBase = FACTORY_DATA[id];
                totalCps += factoryState.currentCps;

                const levelSpan = document.getElementById(`factory-${id}-level`);
                const cpsSpan = document.getElementById(`factory-${id}-cps`);
                const button = document.getElementById(`factory-${id}-button`);

                if (levelSpan) levelSpan.textContent = factoryState.level;
                if (cpsSpan) cpsSpan.textContent = formatNumber(factoryState.currentCps, 2);
                if (button) {
                    if (factoryState.level === 0) {
                        button.innerHTML = `Buy (Cost: $${formatNumber(factoryBase.baseCost, 0)})`;
                        button.disabled = capital < factoryBase.baseCost;
                    } else if (factoryState.level < factoryState.maxLevel) {
                        button.innerHTML = `Upgrade (Cost: $${formatNumber(factoryState.currentUpgradeCost, 0)})`;
                        button.disabled = capital < factoryState.currentUpgradeCost;
                    } else {
                        button.innerHTML = `Max Level (${factoryState.maxLevel})`;
                        button.disabled = true;
                    }
                }
            }
        }
        // --- End Factory Card Updates ---

        // Financial Summary
        if (_DOM.totalCpsDisplay) _DOM.totalCpsDisplay.textContent = formatNumber(totalCps, 2);
        const totalMaintenance = food.currentMaintenance + shelter.currentMaintenance; // Recalculate total maintenance
        if (_DOM.totalMaintenanceDisplay) _DOM.totalMaintenanceDisplay.textContent = `\$${formatNumber(totalMaintenance, 2)} /sec`;
        const interestGain = capital > 0 ? capital * BASE_INTEREST_RATE : 0;
        const netGain = interestGain + totalCps - totalMaintenance; // Include factory CPS and needs maintenance
        if (_DOM.netGainDisplay) {
            _DOM.netGainDisplay.textContent = `${formatNumber(netGain, 2)} /sec`;
            _DOM.netGainDisplay.className = netGain >= 0 ? 'positive' : 'negative';
        }

        // Update Event Timer Display
        if (_DOM.eventCountdownDisplay) {
            _DOM.eventCountdownDisplay.textContent = eventTimer;
        }

        updateStoryline();

    } catch (e) {
        console.error("Error during updateDisplay:", e);
    }
}


export function showGameOverUI(reason) {
    // ... (Keep as is from previous full version) ...
    try {
        if (!_DOM.gameOverScreen || !_DOM.gameOverTitle || !_DOM.gameOverMessage) return;
        let title = "Game Over";
        let message = "Your journey has ended.";
        if (reason === "hunger") { /* ... */ } else if (reason === "health") { /* ... */ } else if (reason === "error") { /* ... */ }
        _DOM.gameOverTitle.textContent = title;
        _DOM.gameOverMessage.textContent = message;
        _DOM.gameOverScreen.style.display = 'flex';
        if (_DOM.earnButton) _DOM.earnButton.disabled = true;
        if (_DOM.promoteButton) _DOM.promoteButton.disabled = true;
        if (_DOM.upgradeFoodButton) _DOM.upgradeFoodButton.disabled = true;
        if (_DOM.upgradeShelterButton) _DOM.upgradeShelterButton.disabled = true;
        if (_DOM.manualForageButton) _DOM.manualForageButton.disabled = true;
        // Optionally disable factory buttons too
        document.querySelectorAll('.factory-card button').forEach(btn => btn.disabled = true);
    } catch (e) {
        console.error("Error showing game over UI:", e);
    }
}

export function hideGameOverUI() {
    // ... (Keep as is from previous full version) ...
    if (_DOM.gameOverScreen) _DOM.gameOverScreen.style.display = 'none';
}
