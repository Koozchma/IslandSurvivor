// main.js

import * as DOM from './domElements.js';
import * as GameState from './gameState.js';
import { updateDisplay, hideGameOverUI } from './uiController.js';
import { earnMinimumWage, upgradePromotionAction, upgradeNeedAction } from './actions.js';
import {
    updateHealthAndHunger, applyMaintenanceCosts, applyInterest,
    calculatePromotionStats, calculateNeedStats, checkStorylineAdvance
} from './coreLogic.js';
import { MAX_STAT, FOOD_LEVEL_NAMES, SHELTER_LEVEL_NAMES } from './config.js'; // Removed FOOD_PRODUCTION_VALUES as it's not directly used in main


let gameLoopInterval;

function initializeGame() {
    GameState.setIsGameOver(false); // Use the setter from gameState
    GameState.setCapital(0.00);
    GameState.setGameSeconds(0);
    GameState.setCurrentStageIndex(0);

    GameState.setHealth(MAX_STAT);
    GameState.setHunger(MAX_STAT);

    // Initialize promotion state directly in gameState or via its own initializer if complex
    GameState.updatePromotionState({ // Using the provided setter from gameState.js
        level: 0,
        currentClicks: 0,
        currentWage: 1.00, // Initial wage, promotion object should define wageIncreasePerLevel
        // clicksNeeded is already in gameState.promotion's initial structure
    });
    calculatePromotionStats(); // This will calculate derived values like currentWage based on level

    // Initialize food state
    GameState.updateFoodState({ // Using the provided setter from gameState.js
        level: 0,
        baseMaintenance: 0.00, // Will be set on first upgrade by calculateNeedStats
        currentProduction: 0,  // Will be set by calculateNeedStats
        currentMaintenance: 0, // Will be set by calculateNeedStats
        // baseUpgradeCost and others are part of initial food object in gameState
        currentUpgradeCost: GameState.food.baseUpgradeCost,
        currentName: FOOD_LEVEL_NAMES[0]
    });
    calculateNeedStats('food');

    // Initialize shelter state
    GameState.updateShelterState({ // Using the provided setter from gameState.js
        level: 0,
        baseMaintenance: 0.00, // Will be set on first upgrade
        currentMaintenance: 0, // Will be set by calculateNeedStats
        currentUpgradeCost: GameState.shelter.baseUpgradeCost,
        currentName: SHELTER_LEVEL_NAMES[0]
    });
    calculateNeedStats('shelter');

    hideGameOverUI(); // From uiController.js
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, 1000);
    
    // Ensure buttons are correctly enabled/disabled based on initial state
    if (DOM.earnButton) DOM.earnButton.disabled = false;
    if (DOM.promoteButton) DOM.promoteButton.disabled = GameState.promotion.currentClicks < GameState.promotion.clicksNeeded;
    
    // Initial state for upgrade buttons might depend on capital (which is 0)
    if (DOM.upgradeFoodButton) DOM.upgradeFoodButton.disabled = GameState.capital < GameState.food.currentUpgradeCost;
    if (DOM.upgradeShelterButton) DOM.upgradeShelterButton.disabled = GameState.capital < GameState.shelter.currentUpgradeCost;

    updateDisplay(); // Initial render of the UI
}


function gameLoop() {
    const { isGameOver: gameOverFlag, gameSeconds: currentSeconds } = GameState.getGameState(); // Get current isGameOver

    if (gameOverFlag) { // Use the flag read at the start of this tick
        clearInterval(gameLoopInterval);
        return;
    }
    GameState.setGameSeconds(currentSeconds + 1);
    
    updateHealthAndHunger(); // This function might set isGameOver to true
    
    // Check isGameOver again *after* potentially game-ending logic
    if (GameState.getGameState().isGameOver) { 
        clearInterval(gameLoopInterval);
        return;
    }

    applyMaintenanceCosts();
    applyInterest();
    checkStorylineAdvance();
    updateDisplay();
}

// --- Event Listeners ---
// Ensure DOM elements are available before attaching listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the game state and UI first
    initializeGame(); // Call initializeGame after DOM is ready

    // Then attach event listeners
    if (DOM.earnButton) {
        DOM.earnButton.addEventListener('click', earnMinimumWage);
    } else {
        console.error("Earn button not found");
    }

    if (DOM.promoteButton) {
        DOM.promoteButton.addEventListener('click', upgradePromotionAction);
    } else {
        console.error("Promote button not found");
    }

    if (DOM.upgradeFoodButton) {
        DOM.upgradeFoodButton.addEventListener('click', () => upgradeNeedAction('food'));
    } else {
        console.error("Upgrade Food button not found");
    }

    if (DOM.upgradeShelterButton) {
        DOM.upgradeShelterButton.addEventListener('click', () => upgradeNeedAction('shelter'));
    } else {
        console.error("Upgrade Shelter button not found");
    }

    if (DOM.restartButton) {
        DOM.restartButton.addEventListener('click', initializeGame);
    } else {
        console.error("Restart button not found");
    }
});