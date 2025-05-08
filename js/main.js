// js/main.js

console.log("main.js: Script start"); // <--- ADD THIS

import * as DOM from './domElements.js';
import * as GameState from './gameState.js';
import { updateDisplay, hideGameOverUI } from './uiController.js';
import { earnMinimumWage, upgradePromotionAction, upgradeNeedAction } from './actions.js';
import {
    updateHealthAndHunger, applyMaintenanceCosts, applyInterest,
    calculatePromotionStats, calculateNeedStats, checkStorylineAdvance
} from './coreLogic.js';
import { MAX_STAT, FOOD_LEVEL_NAMES, SHELTER_LEVEL_NAMES } from './config.js';


let gameLoopInterval;

function initializeGame() {
    console.log("Initializing game..."); // Debug log
    GameState.setIsGameOver(false);
    GameState.setCapital(0.00);
    GameState.setGameSeconds(0);
    GameState.setCurrentStageIndex(0);

    GameState.setHealth(MAX_STAT);
    GameState.setHunger(MAX_STAT);

    GameState.updatePromotionState({
        level: 0,
        currentClicks: 0
        // currentWage will be set by calculatePromotionStats
    });
    calculatePromotionStats();

    GameState.updateFoodState({
        level: 0,
        baseMaintenance: 0.00,
        // currentProduction, currentMaintenance, currentUpgradeCost, currentName set by calculateNeedStats
    });
    calculateNeedStats('food');

    GameState.updateShelterState({
        level: 0,
        baseMaintenance: 0.00,
        // currentMaintenance, currentUpgradeCost, currentName set by calculateNeedStats
    });
    calculateNeedStats('shelter');


    hideGameOverUI();
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    // Ensure coreLogic functions are defined before being called by setInterval
    try {
      gameLoopInterval = setInterval(gameLoop, 1000);
      console.log("Game loop started."); // Debug log
    } catch (e) {
        console.error("Error starting game loop:", e);
        GameState.setIsGameOver(true); // Prevent potential issues if loop setup failed
    }


    // Re-enable buttons and set initial states
    if (DOM.earnButton) DOM.earnButton.disabled = false;
    if (DOM.promoteButton) DOM.promoteButton.disabled = GameState.promotion.currentClicks < GameState.promotion.clicksNeeded;
    if (DOM.upgradeFoodButton) DOM.upgradeFoodButton.disabled = GameState.capital < GameState.food.currentUpgradeCost;
    if (DOM.upgradeShelterButton) DOM.upgradeShelterButton.disabled = GameState.capital < GameState.shelter.currentUpgradeCost;

    updateDisplay(); // Initial render of the UI
    console.log("Game Initialized."); // Debug log
}


function gameLoop() {
    // Use getGameState to ensure we have the latest flag status
    const currentState = GameState.getGameState();

    if (currentState.isGameOver) {
        console.log("Game loop stopping: isGameOver is true."); // Debug log
        clearInterval(gameLoopInterval);
        return;
    }

    try {
        GameState.setGameSeconds(currentState.gameSeconds + 1);

        updateHealthAndHunger(); // Can potentially set isGameOver

        // Re-check if the above function ended the game
        if (GameState.getGameState().isGameOver) {
             console.log("Game loop stopping after health/hunger update."); // Debug log
             clearInterval(gameLoopInterval);
             return;
        }

        applyMaintenanceCosts();
        applyInterest();
        checkStorylineAdvance();
        updateDisplay();
    } catch (error) {
        console.error("Error in game loop:", error);
        GameState.setIsGameOver(true); // Stop the loop on error
        clearInterval(gameLoopInterval);
        // Optionally show an error to the user or trigger game over UI more explicitly here
    }
}

// --- Event Listeners ---
// Wait for the DOM to be fully loaded before initializing and attaching listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Initializing..."); // Debug log

    // Attach event listeners first, then initialize game which calls updateDisplay
    // This ensures elements exist if initialization somehow errors out early.
    if (DOM.earnButton) {
        DOM.earnButton.addEventListener('click', earnMinimumWage);
    } else {
        console.error("Earn button not found during listener setup");
    }

    if (DOM.promoteButton) {
        DOM.promoteButton.addEventListener('click', upgradePromotionAction);
    } else {
        console.error("Promote button not found during listener setup");
    }

    if (DOM.upgradeFoodButton) {
        DOM.upgradeFoodButton.addEventListener('click', () => upgradeNeedAction('food'));
    } else {
        console.error("Upgrade Food button not found during listener setup");
    }

    if (DOM.upgradeShelterButton) {
        DOM.upgradeShelterButton.addEventListener('click', () => upgradeNeedAction('shelter'));
    } else {
        console.error("Upgrade Shelter button not found during listener setup");
    }

    if (DOM.restartButton) {
        DOM.restartButton.addEventListener('click', initializeGame);
    } else {
        console.error("Restart button not found during listener setup");
    }

    // Initialize the game state and start the loop
    initializeGame();
});
