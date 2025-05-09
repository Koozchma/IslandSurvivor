// js/uiController.js

import * as _DOM from './domElements.js'; // Ensure 'as' is present
import { formatNumber, setBarColor } from './utils.js';
import { getGameState } from './gameState.js';
import { unlockResearchAction } from './actions.js'; // Import the research action
// Ensure all needed configs are imported, including science and research
import {
    STAGES, BASE_INTEREST_RATE, MAX_STAT,
    FORAGE_MAX_FOOD_LEVEL, FORAGE_COOLDOWN_SECONDS, FORAGE_HUNGER_GAIN,
    SCIENCE_MAX_LEVEL, RESEARCH_ITEMS // Import RESEARCH_ITEMS
} from './config.js';

export function updateStoryline() {
    try {
        const { capital, currentStageIndex, isGameOver } = getGameState();
        if (isGameOver) return;

        // Check if essential DOM elements for storyline exist
        if (!_DOM.currentStageDisplay || !_DOM.storyTextDisplay || !_DOM.storyProgressBar) {
             console.warn("[UI WARN] Missing Storyline DOM elements in uiController.updateStoryline");
             return; // Exit if elements missing to prevent errors
        }

        // Check if STAGES data is valid
        if (!STAGES || currentStageIndex < 0 || currentStageIndex >= STAGES.length) {
            console.error("[UI ERROR] Invalid STAGES data or currentStageIndex:", STAGES, currentStageIndex);
            return; // Exit if stage data is invalid
        }
        const currentStageData = STAGES[currentStageIndex];
        if (!currentStageData) {
            console.error("[UI ERROR] No data for current stage index:", currentStageIndex);
            return; // Exit if stage data is missing
        }

        _DOM.currentStageDisplay.textContent = currentStageData.name;
        _DOM.storyTextDisplay.textContent = currentStageData.text; // Base stage text

        // Calculate and display progress bar
        let progress = 0;
        if (currentStageData.nextThreshold !== Infinity && currentStageIndex < STAGES.length) {
            const prevThreshold = currentStageIndex > 0 ? STAGES[currentStageIndex - 1].nextThreshold : 0;
            const range = currentStageData.nextThreshold - prevThreshold;
            if (range > 0) {
                // Ensure capital and thresholds are numbers before calculation
                if (typeof capital === 'number' && typeof prevThreshold === 'number' && typeof currentStageData.nextThreshold === 'number') {
                     progress = ((capital - prevThreshold) / range) * 100;
                } else {
                     progress = 0; // Default to 0 if data is invalid
                }
            } else if (capital >= currentStageData.nextThreshold) {
                progress = 100;
            }
            progress = Math.max(0, Math.min(100, progress)); // Clamp between 0-100
        } else if (currentStageIndex >= STAGES.length - 1) { // Handle max stage
            progress = 100;
        }
        _DOM.storyProgressBar.style.width = progress + '%';

    } catch (e) {
        console.error("[UI ERROR] Error in updateStoryline:", e);
    }
}

// New function to render the Science Tech Tree
export function renderTechTree() {
    try {
        const { scienceUnlocked, science, unlockedResearch } = getGameState();
        // Clear the grid before rendering
        if (_DOM.researchItemsGrid) {
             _DOM.researchItemsGrid.innerHTML = '';
        } else {
             console.warn("[UI WARN] researchItemsGrid element not found for rendering tech tree.");
             return;
        }


        if (!scienceUnlocked) {
            // Tech tree should be hidden if science is not unlocked
            if(_DOM.techTreeSectionContainer) _DOM.techTreeSectionContainer.classList.add('hidden');
            return;
        }

         // Tech tree should be visible if science is unlocked
        if(_DOM.techTreeSectionContainer) _DOM.techTreeSectionContainer.classList.remove('hidden');


        RESEARCH_ITEMS.forEach(item => {
            const isUnlocked = unlockedResearch.includes(item.key);
            const canAfford = science.currentSciencePoints >= item.cost;

            const itemCard = document.createElement('div');
            itemCard.classList.add('research-item-card');
            if (isUnlocked) {
                 itemCard.classList.add('unlocked'); // Add a class for styling unlocked items
            }

            let buttonHTML = '';
            if (isUnlocked) {
                buttonHTML = '<button disabled>Unlocked</button>';
            } else {
                // Add data-key attribute to the button to identify which research it is
                 buttonHTML = `<button class="unlock-research-button" data-key="${item.key}" ${!canAfford ? 'disabled' : ''}>Research (Cost: ${formatNumber(item.cost, 0)} Science)</button>`;
            }


            itemCard.innerHTML = `
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                 <p class="research-cost">Cost: ${formatNumber(item.cost, 0)} Science</p>
                ${buttonHTML}
            `;

            _DOM.researchItemsGrid.appendChild(itemCard);
        });

        // After rendering, attach event listeners to the new buttons
        attachResearchButtonListeners();

    } catch (e) {
        console.error("Error rendering Tech Tree:", e);
    }
}

// Function to attach event listeners to research buttons
function attachResearchButtonListeners() {
    try {
        // Remove existing listeners to prevent duplicates
         const oldButtons = _DOM.researchItemsGrid.querySelectorAll('.unlock-research-button');
         oldButtons.forEach(button => {
             const oldClickHandler = button._unlockClickHandler; // Get the stored handler
             if (oldClickHandler) {
                 button.removeEventListener('click', oldClickHandler);
             }
         });


        const buttons = _DOM.researchItemsGrid.querySelectorAll('.unlock-research-button');
        buttons.forEach(button => {
            const researchKey = button.dataset.key;
            const clickHandler = () => unlockResearchAction(researchKey);
            button.addEventListener('click', clickHandler);
             button._unlockClickHandler = clickHandler; // Store the handler for removal
        });
    } catch (e) {
        console.error("Error attaching research button listeners:", e);
    }
}


export function updateDisplay() {
    try {
        const { capital, gameSeconds, isGameOver, health, hunger, promotion, food, shelter, science, scienceUnlocked } = getGameState();

        // Stop updating UI if game is over or critical elements missing
        if (isGameOver || !_DOM.capitalDisplay || !_DOM.healthBar || !_DOM.hungerBar) {
            return;
        }

        // Health Bar
        setBarColor(_DOM.healthBar, health); // Use utility function
        _DOM.healthBar.style.width = (health / MAX_STAT * 100) + '%';
        if (_DOM.healthText) _DOM.healthText.textContent = `${Math.max(0, Math.floor(health))}/${MAX_STAT}`;

        // Hunger Bar
        setBarColor(_DOM.hungerBar, hunger); // Use utility function
        _DOM.hungerBar.style.width = (hunger / MAX_STAT * 100) + '%';
        if (_DOM.hungerText) _DOM.hungerText.textContent = `${Math.max(0, Math.floor(hunger))}/${MAX_STAT}`;

        // Capital & Game Info
        _DOM.capitalDisplay.textContent = formatNumber(capital);
        if (_DOM.interestRateDisplay) _DOM.interestRateDisplay.textContent = (BASE_INTEREST_RATE * 100).toFixed(2);
        if (_DOM.gameTimeDisplay) _DOM.gameTimeDisplay.textContent = gameSeconds + 's';
        if (_DOM.wageValueDisplay) _DOM.wageValueDisplay.textContent = `+$${formatNumber(promotion.currentWage, 2)}`;

        // Promotion Section (always visible)
        if (_DOM.currentWageDisplay) _DOM.currentWageDisplay.textContent = formatNumber(promotion.currentWage, 2);
        if (_DOM.promotionLevelDisplay) _DOM.promotionLevelDisplay.textContent = promotion.level;
        if (_DOM.promotionClicksDisplay) _DOM.promotionClicksDisplay.textContent = `Clicks: ${promotion.currentClicks}/${promotion.clicksNeeded}`;
        if (_DOM.promotionClickProgress) _DOM.promotionClickProgress.style.height = (promotion.currentClicks / promotion.clicksNeeded * 100) + '%';
        if (_DOM.promoteButton) _DOM.promoteButton.disabled = promotion.currentClicks < promotion.clicksNeeded;


        // --- Conditional Display: Needs vs Science/Tech Tree ---
        if (scienceUnlocked) {
             // Hide Needs section
             if (_DOM.needsSectionContainer) _DOM.needsSectionContainer.classList.add('hidden');

             // Show Science section and Tech Tree section
             if (_DOM.scienceSectionContainer) _DOM.scienceSectionContainer.classList.remove('hidden');
             // The visibility of the Tech Tree section container is handled by renderTechTree

             // Update Science Display
             if (_DOM.sciencePointsDisplay) _DOM.sciencePointsDisplay.textContent = formatNumber(science.currentSciencePoints, 2);
             if (_DOM.scienceLevelDisplay) _DOM.scienceLevelDisplay.textContent = science.level === 0 ? science.currentName : `${science.currentName} (Lvl ${science.level})`;
             if (_DOM.scienceProductionDisplay) _DOM.scienceProductionDisplay.textContent = `${formatNumber(science.currentProduction, 2)} points/sec`;
             // if (_DOM.scienceMaintenanceDisplay) _DOM.scienceMaintenanceDisplay.textContent = `\$${formatNumber(science.currentMaintenance, 2)}/sec`; // Uncomment if science has maintenance

             if (_DOM.upgradeScienceButton) {
                if (science.level < science.maxLevel) {
                    if (_DOM.scienceUpgradeCostDisplay) _DOM.scienceUpgradeCostDisplay.textContent = formatNumber(science.currentUpgradeCost, 0);
                    _DOM.upgradeScienceButton.innerHTML = `Upgrade (Cost: $${formatNumber(science.currentUpgradeCost, 0)})`;
                    _DOM.upgradeScienceButton.disabled = capital < science.currentUpgradeCost;
                } else {
                    if (_DOM.scienceUpgradeCostDisplay) _DOM.scienceUpgradeCostDisplay.textContent = "MAX";
                    _DOM.upgradeScienceButton.innerHTML = `Max Level Reached`;
                    _DOM.upgradeScienceButton.disabled = true;
                }
            }

             // Render the Tech Tree
             renderTechTree();


        } else {
            // Show Needs section
            if (_DOM.needsSectionContainer) _DOM.needsSectionContainer.classList.remove('hidden');

            // Hide Science section and Tech Tree section
            if (_DOM.scienceSectionContainer) _DOM.scienceSectionContainer.classList.add('hidden');
            if (_DOM.techTreeSectionContainer) _DOM.techTreeSectionContainer.classList.add('hidden');


            // Food Operations Display (only if needs are active)
            if (_DOM.foodLevelDisplay) _DOM.foodLevelDisplay.textContent = food.level === 0 ? food.currentName : `${food.currentName} (Lvl ${food.level})`;
            if (_DOM.foodProductionDisplay) _DOM.foodProductionDisplay.textContent = `${formatNumber(food.currentProduction, 1)} units/sec`;
            if (_DOM.foodMaintenanceDisplay) _DOM.foodMaintenanceDisplay.textContent = `\$${formatNumber(food.currentMaintenance, 2)}/sec`;
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
            // Manual Forage Button Logic (only if needs are active)
            if (_DOM.manualForageButton) {
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

            // Shelter Operations Display (only if needs are active)
            if (_DOM.shelterLevelDisplay) _DOM.shelterLevelDisplay.textContent = shelter.level === 0 ? shelter.currentName : `${shelter.currentName} (Lvl ${shelter.level})`;
            if (_DOM.shelterQualityDisplay) _DOM.shelterQualityDisplay.textContent = shelter.level;
            if (_DOM.shelterMaintenanceDisplay) _DOM.shelterMaintenanceDisplay.textContent = `\$${formatNumber(shelter.currentMaintenance, 2)}/sec`;
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
        }


        // Financial Summary (always visible)
        // Total maintenance includes needs and science (if unlocked) - logic is in coreLogic.js
        const totalMaintenance = food.currentMaintenance + shelter.currentMaintenance + (scienceUnlocked ? science.currentMaintenance : 0);
        if (_DOM.totalMaintenanceDisplay) _DOM.totalMaintenanceDisplay.textContent = `\$${formatNumber(totalMaintenance, 2)} /sec`;
        const interestGain = capital > 0 ? capital * BASE_INTEREST_RATE : 0;
        // Assuming Science Production does NOT directly add to Capital, adjust if needed
        const productionGain = 0; // Replace with logic if science production adds to capital
        const netGain = interestGain + productionGain - totalMaintenance; // Adjust productionGain if necessary


        if (_DOM.netGainDisplay) {
            _DOM.netGainDisplay.textContent = `${formatNumber(netGain, 2)} /sec`;
            _DOM.netGainDisplay.className = netGain >= 0 ? 'positive' : 'negative';
        }

        updateStoryline(); // Update storyline progress/text

    } catch (e) {
        console.error("Error during updateDisplay:", e);
        // Consider stopping game or showing error if UI updates critically fail
        // import { triggerGameOver } from './coreLogic.js'; // Would need to import this
        // triggerGameOver("error");
    }
}

export function showGameOverUI(reason) {
    try {
        // Ensure essential game over elements exist
        if (!_DOM.gameOverScreen || !_DOM.gameOverTitle || !_DOM.gameOverMessage) {
             console.error("Game Over UI elements missing!");
             return;
        }

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
        _DOM.gameOverTitle.textContent = title;
        _DOM.gameOverMessage.textContent = message;
        _DOM.gameOverScreen.style.display = 'flex';

        // Disable all interactive buttons regardless of state
        if (_DOM.earnButton) _DOM.earnButton.disabled = true;
        if (_DOM.promoteButton) _DOM.promoteButton.disabled = true;
        if (_DOM.upgradeFoodButton) _DOM.upgradeFoodButton.disabled = true;
        if (_DOM.upgradeShelterButton) _DOM.upgradeShelterButton.disabled = true;
        if (_DOM.manualForageButton) _DOM.manualForageButton.disabled = true;
        if (_DOM.upgradeScienceButton) _DOM.upgradeScienceButton.disabled = true; // Disable science button
        // Disable research buttons
         if (_DOM.researchItemsGrid) {
             const researchButtons = _DOM.researchItemsGrid.querySelectorAll('button');
             researchButtons.forEach(button => button.disabled = true);
         }


    } catch (e) {
        console.error("Error showing game over UI:", e);
    }
}

export function hideGameOverUI() {
    if(_DOM.gameOverScreen) _DOM.gameOverScreen.style.display = 'none';
    // Note: Re-enabling buttons is handled by initializeGame in main.js upon restart.
}
