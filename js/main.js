// js/main.js
console.log("[DEBUG] main.js: Script start");

import * as DOM from './domElements.js';
import * as GameState from './gameState.js';
import { updateDisplay, hideGameOverUI } from './uiController.js';
import { earnMinimumWage, upgradePromotionAction, upgradeNeedAction, manualForageAction } from './actions.js';
import {
    updateHealthAndHunger, applyMaintenanceCosts, applyInterest,
    calculatePromotionStats, calculateNeedStats, checkStorylineAdvance, triggerGameOver // Ensure triggerGameOver is imported if used elsewhere
} from './coreLogic.js';
import { MAX_STAT, FOOD_LEVEL_NAMES, SHELTER_LEVEL_NAMES } from './config.js';


let gameLoopInterval = null;

function initializeGame() {
    console.log("[DEBUG] main.js: initializeGame START");
    try {
        // Clear any existing loop first
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

        // Re-enable buttons and set initial states
        if(DOM.earnButton) DOM.earnButton.disabled = false;
        if(DOM.promoteButton) DOM.promoteButton.disabled = GameState.promotion.currentClicks < GameState.promotion.clicksNeeded;
        if(DOM.upgradeFoodButton) DOM.upgradeFoodButton.disabled = GameState.capital < GameState.food.currentUpgradeCost;
        if(DOM.upgradeShelterButton) DOM.upgradeShelterButton.disabled = GameState.capital < GameState.shelter.currentUpgradeCost;
        if(DOM.manualForageButton) DOM.manualForageButton.disabled = false; // Start enabled if shown

        updateDisplay();
        console.log("[DEBUG] main.js: Initial UI display updated.");

        // Start the main game loop
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


function gameLoop() {
    try {
        const currentState = GameState.getGameState();

        if (currentState.isGameOver) {
            // console.log("[DEBUG] main.js: Game loop stopping: isGameOver is true."); // Can be noisy
            if (gameLoopInterval) { // Clear interval if game is over
                 clearInterval(gameLoopInterval);
                 gameLoopInterval = null;
            }
            return;
        }

        GameState.setGameSeconds(currentState.gameSeconds + 1);
        updateHealthAndHunger(); // This function might set isGameOver

        // Re-check if the above function ended the game before proceeding
        if (GameState.getGameState().isGameOver) {
             console.log("[DEBUG] main.js: Game loop stopping after health/hunger update check.");
             if (gameLoopInterval) {
                 clearInterval(gameLoopInterval);
                 gameLoopInterval = null;
             }
             return;
        }

        applyMaintenanceCosts();
        applyInterest();
        checkStorylineAdvance();
        updateDisplay();

    } catch (error) {
        console.error("[CRITICAL] Error within gameLoop:", error);
        // Use coreLogic's triggerGameOver to centralize game over logic
        triggerGameOver("error");
        if(gameLoopInterval) { // Ensure interval stops on loop error
            clearInterval(gameLoopInterval);
            gameLoopInterval = null;
        }
    }
}

// --- Event Listeners & Startup ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("[DEBUG] main.js: DOMContentLoaded event fired");
    try {
        // Check if essential DOM elements are found before attaching listeners or initializing
        const essentialElements = [
            DOM.earnButton, DOM.capitalDisplay, DOM.healthBar, DOM.hungerBar,
            DOM.promoteButton, DOM.upgradeFoodButton, DOM.upgradeShelterButton, DOM.restartButton
        ];
        const missingElement = essentialElements.find(el => el === null);
        if (missingElement) {
             // Find the variable name associated with the missing element for a better error message
             const elementName = Object.keys(DOM).find(key => DOM[key] === missingElement);
             console.error(`[CRITICAL] Essential DOM element not found: ${elementName || 'Unknown'}. Check IDs in index.html and domElements.js.`);
             alert(`Error: Could not find essential game element: ${elementName || 'Unknown'}. Check console (F12).`);
             return;
        }
        console.log("[DEBUG] main.js: Essential DOM elements confirmed.");

        // Attach event listeners
        console.log("[DEBUG] main.js: Attaching event listeners...");
        DOM.earnButton.addEventListener('click', earnMinimumWage);
        DOM.promoteButton.addEventListener('click', upgradePromotionAction);
        DOM.upgradeFoodButton.addEventListener('click', () => upgradeNeedAction('food'));
        DOM.upgradeShelterButton.addEventListener('click', () => upgradeNeedAction('shelter'));
        // Manual forage button might not exist initially, check before adding listener
        if (DOM.manualForageButton) {
            DOM.manualForageButton.addEventListener('click', manualForageAction);
        } else {
             console.warn("[WARN] main.js: Manual Forage button not found during listener setup (this might be okay if hidden initially).");
        }
        DOM.restartButton.addEventListener('click', initializeGame);
        console.log("[DEBUG] main.js: Event listeners attached.");

        // Initialize the game state and start the loop
        initializeGame();

    } catch (error) {
         console.error("[CRITICAL] Error during initial setup (DOMContentLoaded):", error);
         alert("A critical error occurred during game setup. Please check the console (F12).");
    }
});

console.log("[DEBUG] main.js: Script end parsing");
