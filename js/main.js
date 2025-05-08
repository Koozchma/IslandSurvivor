// js/main.js
console.log("[DEBUG] main.js: Script start");

import * as DOM from './domElements.js';
import * as GameState from './gameState.js';
import { updateDisplay, hideGameOverUI } from './uiController.js';
import { earnMinimumWage, upgradePromotionAction, upgradeNeedAction, manualForageAction } from './actions.js'; // Import all actions
import {
    updateHealthAndHunger, applyMaintenanceCosts, applyInterest, applyFactoryProduction,
    calculatePromotionStats, calculateNeedStats, calculateFactoryStats, // Include factory calc
    checkStorylineAdvance, triggerGameOver
} from './coreLogic.js';
import { MAX_STAT, FACTORY_DATA } from './config.js'; // Import FACTORY_DATA for init loop


let gameLoopInterval = null;

function initializeGame() {
    console.log("[DEBUG] main.js: initializeGame START");
    try {
        if (gameLoopInterval) { clearInterval(gameLoopInterval); gameLoopInterval = null; }

        // Initialize Core State
        GameState.setIsGameOver(false);
        GameState.setCapital(0.00);
        GameState.setGameSeconds(0);
        GameState.setCurrentStageIndex(0);
        GameState.setHealth(MAX_STAT);
        GameState.setHunger(MAX_STAT);

        // Initialize Sub-States & Calculate Derived Values
        GameState.updatePromotionState({ level: 0, currentClicks: 0 });
        calculatePromotionStats();

        GameState.updateFoodState({ level: 0, baseMaintenance: 0.00, forageCooldownEnd: 0 });
        calculateNeedStats('food');

        GameState.updateShelterState({ level: 0, baseMaintenance: 0.00 });
        calculateNeedStats('shelter');

        GameState.initializeFactoryState(); // Reset all factory levels/stats
        for (const id in FACTORY_DATA) { // Use FACTORY_DATA keys for iteration
             calculateFactoryStats(id); // Calculate initial cost/cps
        }

        console.log("[DEBUG] main.js: All states initialized.");

        hideGameOverUI();

        // Set initial button states based on fresh state
        if(DOM.earnButton) DOM.earnButton.disabled = false;
        if(DOM.promoteButton) DOM.promoteButton.disabled = GameState.getGameState().promotion.currentClicks < GameState.getGameState().promotion.clicksNeeded;
        if(DOM.upgradeFoodButton) DOM.upgradeFoodButton.disabled = GameState.getGameState().capital < GameState.getGameState().food.currentUpgradeCost;
        if(DOM.upgradeShelterButton) DOM.upgradeShelterButton.disabled = GameState.getGameState().capital < GameState.getGameState().shelter.currentUpgradeCost;
        if(DOM.manualForageButton) DOM.manualForageButton.disabled = false;
        // Factory button states are handled by updateDisplay based on factory state

        updateDisplay(); // Initial UI Render (will create factory cards)
        console.log("[DEBUG] main.js: Initial UI display updated.");

        gameLoopInterval = setInterval(gameLoop, 1000);
        console.log("[DEBUG] main.js: initializeGame - Game loop interval SET, ID:", gameLoopInterval);

    } catch (error) {
        console.error("[CRITICAL] main.js: Error during initializeGame:", error);
        GameState.setIsGameOver(true);
        if(DOM.gameOverScreen) { /* ... show init error ... */ }
    }
    console.log("[DEBUG] main.js: initializeGame END");
}


function gameLoop() {
    try {
        const currentState = GameState.getGameState();
        if (currentState.isGameOver) {
            if (gameLoopInterval) { clearInterval(gameLoopInterval); gameLoopInterval = null; }
            return;
        }

        GameState.setGameSeconds(currentState.gameSeconds + 1);

        // Core game logic steps
        updateHealthAndHunger(); // Check survival first
        if (GameState.getGameState().isGameOver) { // Check if survival failed
             if (gameLoopInterval) { clearInterval(gameLoopInterval); gameLoopInterval = null; }
             return;
        }
        applyMaintenanceCosts(); // Apply costs for needs
        applyInterest();         // Apply capital interest
        applyFactoryProduction();// Apply factory income
        checkStorylineAdvance(); // Check stage progression

        // Update UI last
        updateDisplay();

    } catch (error) {
        console.error("[CRITICAL] Error within gameLoop:", error);
        triggerGameOver("error");
        if(gameLoopInterval) { clearInterval(gameLoopInterval); gameLoopInterval = null; }
    }
}

// --- Event Listeners & Startup ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("[DEBUG] main.js: DOMContentLoaded event fired");
    try {
        // Check only the most critical elements needed before init
        if (!DOM.earnButton || !DOM.capitalDisplay || !DOM.factoriesGrid || !DOM.restartButton ) {
             const missing = ["earnButton", "capitalDisplay", "factoriesGrid", "restartButton"].find(id => !document.getElementById(id));
             console.error(`[CRITICAL] Essential DOM element not found: ${missing || 'Unknown'}. Check IDs in index.html and domElements.js.`);
             alert(`Error: Could not find essential game element: ${missing || 'Unknown'}. Check console (F12).`);
             return;
        }
        console.log("[DEBUG] main.js: Essential DOM elements confirmed.");

        // Attach event listeners
        console.log("[DEBUG] main.js: Attaching event listeners...");
        DOM.earnButton.addEventListener('click', earnMinimumWage);
        if (DOM.promoteButton) DOM.promoteButton.addEventListener('click', upgradePromotionAction); // Check if exists
        if (DOM.upgradeFoodButton) DOM.upgradeFoodButton.addEventListener('click', () => upgradeNeedAction('food'));
        if (DOM.upgradeShelterButton) DOM.upgradeShelterButton.addEventListener('click', () => upgradeNeedAction('shelter'));
        if (DOM.manualForageButton) DOM.manualForageButton.addEventListener('click', manualForageAction);
        DOM.restartButton.addEventListener('click', initializeGame);
        // Factory listeners are added in uiController.createFactoryCards
        console.log("[DEBUG] main.js: Event listeners attached.");

        initializeGame();

    } catch (error) {
         console.error("[CRITICAL] Error during initial setup (DOMContentLoaded):", error);
         alert("A critical error occurred during game setup. Please check the console (F12).");
    }
});

console.log("[DEBUG] main.js: Script end parsing");
