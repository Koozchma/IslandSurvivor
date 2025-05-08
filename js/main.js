// js/main.js
console.log("[DEBUG] main.js: Script start");

import * as DOM from './domElements.js';
import * as GameState from './gameState.js';
import { updateDisplay, hideGameOverUI } from './uiController.js';
// --- Corrected Import Line Below ---
import { earnMinimumWage, upgradePromotionAction, upgradeNeedAction, manualForageAction } from './actions.js';
// --- End Correction ---
import {
    updateHealthAndHunger, applyMaintenanceCosts, applyInterest,
    calculatePromotionStats, calculateNeedStats, checkStorylineAdvance, triggerGameOver
} from './coreLogic.js';
import { MAX_STAT, FOOD_LEVEL_NAMES, SHELTER_LEVEL_NAMES } from './config.js';


let gameLoopInterval = null;

// Function initializeGame() remains the same as the last full version provided
function initializeGame() {
    console.log("[DEBUG] main.js: initializeGame START");
    try {
        if (gameLoopInterval) {
            clearInterval(gameLoopInterval);
            gameLoopInterval = null;
            console.log("[DEBUG] main.js: Cleared existing game loop interval.");
        }

        GameState.setIsGameOver(false);
        GameState.setCapital(0.00);
        GameState.setGameSeconds(0);
        GameState.setCurrentStageIndex(0);

        GameState.setHealth(MAX_STAT);
        GameState.setHunger(MAX_STAT);

        GameState.updatePromotionState({ level: 0, currentClicks: 0 });
        calculatePromotionStats();
        console.log("[DEBUG] main.js: Initialized Promotion State:", GameState.getGameState().promotion);

        GameState.updateFoodState({ level: 0, baseMaintenance: 0.00, forageCooldownEnd: 0 });
        calculateNeedStats('food');
        console.log("[DEBUG] main.js: Initialized Food State:", GameState.getGameState().food);

        GameState.updateShelterState({ level: 0, baseMaintenance: 0.00 });
        calculateNeedStats('shelter');
        console.log("[DEBUG] main.js: Initialized Shelter State:", GameState.getGameState().shelter);

        hideGameOverUI();

        if(DOM.earnButton) DOM.earnButton.disabled = false;
        if(DOM.promoteButton) DOM.promoteButton.disabled = GameState.promotion.currentClicks < GameState.promotion.clicksNeeded;
        if(DOM.upgradeFoodButton) DOM.upgradeFoodButton.disabled = GameState.capital < GameState.food.currentUpgradeCost;
        if(DOM.upgradeShelterButton) DOM.upgradeShelterButton.disabled = GameState.capital < GameState.shelter.currentUpgradeCost;
        if(DOM.manualForageButton) DOM.manualForageButton.disabled = GameState.gameSeconds < GameState.food.forageCooldownEnd;

        updateDisplay();
        console.log("[DEBUG] main.js: Initial UI display updated.");

        gameLoopInterval = setInterval(gameLoop, 1000);
        console.log("[DEBUG] main.js: initializeGame - Game loop interval SET, ID:", gameLoopInterval);

    } catch (error) {
        console.error("[CRITICAL] main.js: Error during initializeGame:", error);
        GameState.setIsGameOver(true);
        if(DOM.gameOverScreen) {
             if (DOM.gameOverTitle) DOM.gameOverTitle.textContent = "Initialization Error!";
             if (DOM.gameOverMessage) DOM.gameOverMessage.textContent = "Game failed to start. Check console (F12).";
             DOM.gameOverScreen.style.display = 'flex';
        }
    }
    console.log("[DEBUG] main.js: initializeGame END");
}


// Function gameLoop() remains the same as the last full version provided
function gameLoop() {
    try {
        const currentState = GameState.getGameState();
        if (currentState.isGameOver) {
            console.log("[DEBUG] main.js: Game loop stopping: isGameOver is true.");
            clearInterval(gameLoopInterval);
            gameLoopInterval = null;
            return;
        }

        GameState.setGameSeconds(currentState.gameSeconds + 1);
        updateHealthAndHunger();
        if (GameState.getGameState().isGameOver) {
             console.log("[DEBUG] main.js: Game loop stopping after health/hunger update.");
             clearInterval(gameLoopInterval);
             gameLoopInterval = null;
             return;
        }

        applyMaintenanceCosts();
        applyInterest();
        checkStorylineAdvance();
        updateDisplay();

    } catch (error) {
        console.error("[CRITICAL] Error within gameLoop:", error);
        triggerGameOver("error");
        if(gameLoopInterval) clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    }
}

// Event Listeners Setup remains the same as the last full version provided
document.addEventListener('DOMContentLoaded', () => {
    console.log("[DEBUG] main.js: DOMContentLoaded event fired");
    try {
        if (!DOM.earnButton || !DOM.capitalDisplay || !DOM.healthBar || !DOM.hungerBar) {
             console.error("[CRITICAL] Essential DOM element(s) not found! Check IDs in index.html and domElements.js.");
             alert("Error: Could not find essential game elements. Check console (F12).");
             return;
        }
        console.log("[DEBUG] main.js: Essential DOM elements found.");

        console.log("[DEBUG] main.js: Attaching event listeners...");
        if (DOM.earnButton) DOM.earnButton.addEventListener('click', earnMinimumWage);
        if (DOM.promoteButton) DOM.promoteButton.addEventListener('click', upgradePromotionAction);
        if (DOM.upgradeFoodButton) DOM.upgradeFoodButton.addEventListener('click', () => upgradeNeedAction('food'));
        if (DOM.upgradeShelterButton) DOM.upgradeShelterButton.addEventListener('click', () => upgradeNeedAction('shelter'));
        if (DOM.manualForageButton) DOM.manualForageButton.addEventListener('click', manualForageAction); // Listener uses the imported name
        if (DOM.restartButton) DOM.restartButton.addEventListener('click', initializeGame);
        console.log("[DEBUG] main.js: Event listeners attached.");

        initializeGame();
    } catch (error) {
         console.error("[CRITICAL] Error during initial setup:", error);
         alert("A critical error occurred during game setup. Please check the console (F12).");
    }
});

console.log("[DEBUG] main.js: Script end");
