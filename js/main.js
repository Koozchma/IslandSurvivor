// js/main.js
console.log("[DEBUG] main.js: Script start");

import * as DOM from './domElements.js';
import * as GameState from './gameState.js';
import { updateDisplay, hideGameOverUI } from './uiController.js';
import { earnMinimumWage, upgradePromotionAction, upgradeNeedAction, manualForageAction } from './actions.js';
import {
    updateHealthAndHunger, applyMaintenanceCosts, applyInterest,
    calculatePromotionStats, calculateNeedStats, checkStorylineAdvance, triggerGameOver
} from './coreLogic.js';
import { MAX_STAT, FOOD_LEVEL_NAMES, SHELTER_LEVEL_NAMES } from './config.js';


let gameLoopInterval = null;

function initializeGame() {
    console.log("[DEBUG] main.js: initializeGame START"); // <<< START INIT
    try {
        if (gameLoopInterval) {
            clearInterval(gameLoopInterval);
            gameLoopInterval = null;
            console.log("[DEBUG] main.js: Cleared existing game loop interval.");
        }

        console.log("[DEBUG] main.js: Setting initial game state...");
        GameState.setIsGameOver(false);
        // GameState.setCapital(0.00);
        GameState.setCapital(2000000.00);
        GameState.setGameSeconds(0);
        GameState.setCurrentStageIndex(0);
        GameState.setHealth(MAX_STAT);
        GameState.setHunger(MAX_STAT);

        console.log("[DEBUG] main.js: Initializing Promotion State...");
        GameState.updatePromotionState({ level: 0, currentClicks: 0 });
        calculatePromotionStats();

        console.log("[DEBUG] main.js: Initializing Food State...");
        GameState.updateFoodState({ level: 0, baseMaintenance: 0.00, forageCooldownEnd: 0 });
        calculateNeedStats('food');

        console.log("[DEBUG] main.js: Initializing Shelter State...");
        GameState.updateShelterState({ level: 0, baseMaintenance: 0.00 });
        calculateNeedStats('shelter');

        console.log("[DEBUG] main.js: Hiding Game Over UI...");
        hideGameOverUI();

        console.log("[DEBUG] main.js: Setting initial button states...");
        if(DOM.earnButton) DOM.earnButton.disabled = false;
        if(DOM.promoteButton) DOM.promoteButton.disabled = GameState.promotion.currentClicks < GameState.promotion.clicksNeeded;
        if(DOM.upgradeFoodButton) DOM.upgradeFoodButton.disabled = GameState.capital < GameState.food.currentUpgradeCost;
        if(DOM.upgradeShelterButton) DOM.upgradeShelterButton.disabled = GameState.capital < GameState.shelter.currentUpgradeCost;
        if(DOM.manualForageButton) DOM.manualForageButton.disabled = false;

        console.log("[DEBUG] main.js: Performing initial UI update...");
        updateDisplay(); // Initial render

        console.log("[DEBUG] main.js: Setting game loop interval...");
        gameLoopInterval = setInterval(gameLoop, 1000);
        if (gameLoopInterval) {
             console.log("[DEBUG] main.js: initializeGame - Game loop interval SET successfully, ID:", gameLoopInterval); // <<< LOOP SET
        } else {
             console.error("[CRITICAL] main.js: initializeGame - FAILED to set game loop interval!");
        }

    } catch (error) {
        console.error("[CRITICAL] main.js: Error during initializeGame:", error);
        GameState.setIsGameOver(true);
        if(DOM.gameOverScreen) {
             if (DOM.gameOverTitle) DOM.gameOverTitle.textContent = "Initialization Error!";
             if (DOM.gameOverMessage) DOM.gameOverMessage.textContent = "Game failed to start. Check console (F12).";
             DOM.gameOverScreen.style.display = 'flex';
        }
    }
    console.log("[DEBUG] main.js: initializeGame END"); // <<< END INIT
}


function gameLoop() {
    console.log("[DEBUG] main.js: gameLoop TICK START"); // <<< LOOP TICK START
    try {
        const currentState = GameState.getGameState();

        if (currentState.isGameOver) {
            console.log("[DEBUG] main.js: Game loop stopping: isGameOver is true.");
            if (gameLoopInterval) { clearInterval(gameLoopInterval); gameLoopInterval = null; }
            return;
        }

        // console.log("[DEBUG] main.js: Updating game second..."); // Optional: Can be noisy
        GameState.setGameSeconds(currentState.gameSeconds + 1);

        // console.log("[DEBUG] main.js: Updating health/hunger..."); // Optional: Can be noisy
        updateHealthAndHunger();

        if (GameState.getGameState().isGameOver) {
             console.log("[DEBUG] main.js: Game loop stopping after health/hunger update check.");
             if (gameLoopInterval) { clearInterval(gameLoopInterval); gameLoopInterval = null; }
             return;
        }

        // console.log("[DEBUG] main.js: Applying maintenance..."); // Optional: Can be noisy
        applyMaintenanceCosts();
        // console.log("[DEBUG] main.js: Applying interest..."); // Optional: Can be noisy
        applyInterest();
        // console.log("[DEBUG] main.js: Checking storyline..."); // Optional: Can be noisy
        checkStorylineAdvance();
        // console.log("[DEBUG] main.js: Updating display..."); // Optional: Can be noisy
        updateDisplay();

    } catch (error) {
        console.error("[CRITICAL] Error within gameLoop:", error);
        triggerGameOver("error"); // Use coreLogic's function
        if(gameLoopInterval) { clearInterval(gameLoopInterval); gameLoopInterval = null; }
    }
    // console.log("[DEBUG] main.js: gameLoop TICK END"); // Optional: Can be noisy
}

// --- Event Listeners & Startup ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("[DEBUG] main.js: DOMContentLoaded event fired"); // <<< DOM READY
    try {
        // Check essential DOM elements
        console.log("[DEBUG] main.js: Checking essential DOM elements...");
        // ... (checks remain the same)
        if (!DOM.earnButton || !DOM.capitalDisplay || !DOM.healthBar || !DOM.hungerBar || !DOM.promoteButton || !DOM.upgradeFoodButton || !DOM.upgradeShelterButton || !DOM.restartButton) {
             const missing = ["earnButton", "capitalDisplay", "healthBar", "hungerBar", "promoteButton", "upgradeFoodButton", "upgradeShelterButton", "restartButton"].find(id => !document.getElementById(id));
             console.error(`[CRITICAL] Essential DOM element not found: ${missing || 'Unknown'}. Check IDs in index.html and domElements.js.`);
             alert(`Error: Could not find essential game element: ${missing || 'Unknown'}. Check console (F12).`);
             return;
        }
        console.log("[DEBUG] main.js: Essential DOM elements confirmed.");

        // Attach event listeners
        console.log("[DEBUG] main.js: Attaching event listeners...");
        // ... (listeners remain the same) ...
         if (DOM.earnButton) DOM.earnButton.addEventListener('click', earnMinimumWage);
        if (DOM.promoteButton) DOM.promoteButton.addEventListener('click', upgradePromotionAction);
        if (DOM.upgradeFoodButton) DOM.upgradeFoodButton.addEventListener('click', () => upgradeNeedAction('food'));
        if (DOM.upgradeShelterButton) DOM.upgradeShelterButton.addEventListener('click', () => upgradeNeedAction('shelter'));
        if (DOM.manualForageButton) { // Still check as it might be added later
            DOM.manualForageButton.addEventListener('click', manualForageAction);
        } else {
             console.warn("[WARN] main.js: Manual Forage button not found during listener setup (OK if hidden initially).");
        }
        if (DOM.restartButton) DOM.restartButton.addEventListener('click', initializeGame);
        console.log("[DEBUG] main.js: Event listeners attached.");

        // Initialize the game
        initializeGame(); // <<< CALL INIT

    } catch (error) {
         console.error("[CRITICAL] Error during initial setup (DOMContentLoaded):", error);
         alert("A critical error occurred during game setup. Please check the console (F12).");
    }
});

console.log("[DEBUG] main.js: Script end parsing"); // <<< SCRIPT END
