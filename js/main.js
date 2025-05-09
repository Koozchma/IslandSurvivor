// js/main.js
console.log("[DEBUG] main.js: Script start");

import * as DOM from './domElements.js';
import * as GameState from './gameState.js';
import { updateDisplay, hideGameOverUI } from './uiController.js';
// Import new action
import { earnMinimumWage, upgradePromotionAction, upgradeNeedAction, manualForageAction, upgradeScienceAction } from './actions.js';
// Import new logic functions
import {
    updateHealthAndHunger, applyMaintenanceCosts, applyInterest, applyScienceProduction, // Import new production logic
    calculatePromotionStats, calculateNeedStats, calculateScienceStats, // Import new calculation logic
    checkStorylineAdvance, triggerGameOver, checkScienceUnlock // Import new unlock logic
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
        GameState.setCapital(0.00);
        GameState.setGameSeconds(0);
        GameState.setCurrentStageIndex(0);
        GameState.setHealth(MAX_STAT);
        GameState.setHunger(MAX_STAT);
        GameState.setScienceUnlocked(false); // Initialize science unlocked flag

        console.log("[DEBUG] main.js: Initializing Promotion State...");
        GameState.updatePromotionState({ level: 0, currentClicks: 0 });
        calculatePromotionStats();

        console.log("[DEBUG] main.js: Initializing Food State...");
        GameState.updateFoodState({ level: 0, baseMaintenance: 0.00, forageCooldownEnd: 0 });
        calculateNeedStats('food');

        console.log("[DEBUG] main.js: Initializing Shelter State...");
        GameState.updateShelterState({ level: 0, baseMaintenance: 0.00 });
        calculateNeedStats('shelter');

        // Initialize Science State (even though hidden initially)
        console.log("[DEBUG] main.js: Initializing Science State...");
         GameState.updateScienceState({ level: 0, currentSciencePoints: 0 }); // Initialize points
        calculateScienceStats();


        console.log("[DEBUG] main.js: Hiding Game Over UI...");
        hideGameOverUI();

        console.log("[DEBUG] main.js: Setting initial button states...");
        // Buttons disabled state will be set by updateDisplay based on state (e.g., scienceUnlocked)
        if(DOM.earnButton) DOM.earnButton.disabled = false;
        if(DOM.promoteButton) DOM.promoteButton.disabled = GameState.promotion.currentClicks < GameState.promotion.clicksNeeded;
         // Ensure upgrade buttons exist before trying to reference
        if(DOM.upgradeFoodButton) DOM.upgradeFoodButton.disabled = true; // updateDisplay will correct
        if(DOM.upgradeShelterButton) DOM.upgradeShelterButton.disabled = true; // updateDisplay will correct
        if(DOM.manualForageButton) DOM.manualForageButton.disabled = true; // updateDisplay will correct
         if(DOM.upgradeScienceButton) DOM.upgradeScienceButton.disabled = true; // updateDisplay will correct


        if(DOM.restartButton) DOM.restartButton.disabled = false; // Enable restart on init


        console.log("[DEBUG] main.js: Performing initial UI update...");
        updateDisplay(); // Initial render will hide science section

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
    // console.log("[DEBUG] main.js: gameLoop TICK START"); // <<< LOOP TICK START - Can be noisy
    try {
        const currentState = GameState.getGameState();

        if (currentState.isGameOver) {
            console.log("[DEBUG] main.js: Game loop stopping: isGameOver is true.");
            if (gameLoopInterval) { clearInterval(gameLoopInterval); gameLoopInterval = null; }
            return;
        }

        GameState.setGameSeconds(currentState.gameSeconds + 1);

        // Always check for the science unlock condition
        checkScienceUnlock();

        // Update health/hunger
        updateHealthAndHunger();

        if (GameState.getGameState().isGameOver) {
             console.log("[DEBUG] main.js: Game loop stopping after health/hunger update check.");
             if (gameLoopInterval) { clearInterval(gameLoopInterval); gameLoopInterval = null; }
             return;
        }

        // Apply maintenance (logic inside handles science if unlocked)
        applyMaintenanceCosts();
        // Apply interest
        applyInterest();
        // Apply science production (only if unlocked)
        applyScienceProduction();


        // Check storyline advance
        checkStorylineAdvance();
        // Update display
        updateDisplay();

    } catch (error) {
        console.error("[CRITICAL] Error within gameLoop:", error);
        triggerGameOver("error"); // Use coreLogic's function
        if(gameLoopInterval) { clearInterval(gameLoopInterval); gameLoopInterval = null; }
    }
    // console.log("[DEBUG] main.js: gameLoop TICK END"); // <<< LOOP TICK END - Can be noisy
}

// --- Event Listeners & Startup ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("[DEBUG] main.js: DOMContentLoaded event fired"); // <<< DOM READY
    try {
        // Check essential DOM elements
        console.log("[DEBUG] main.js: Checking essential DOM elements...");
        // Check elements required for basic game loop and UI
         if (!DOM.earnButton || !DOM.capitalDisplay || !DOM.healthBar || !DOM.hungerBar || !DOM.promoteButton || !DOM.restartButton || !DOM.scienceSectionContainer || !DOM.upgradeScienceButton) {
             const missing = ["earnButton", "capitalDisplay", "healthBar", "hungerBar", "promoteButton", "restartButton", "scienceSection", "upgradeScienceButton"].find(id => !document.getElementById(id));
             console.error(`[CRITICAL] Essential DOM element not found: ${missing || 'Unknown'}. Check IDs in index.html and domElements.js.`);
             alert(`Error: Could not find essential game element: ${missing || 'Unknown'}. Check console (F12).`);
             return;
        }
        // Check elements for needs section (always present in HTML, but logic is conditional)
        if (!DOM.upgradeFoodButton || !DOM.upgradeShelterButton || !DOM.manualForageButton) {
             const missing = ["upgradeFoodButton", "upgradeShelterButton", "manualForageButton"].find(id => !document.getElementById(id));
              console.warn(`[WARN] Essential needs button DOM element not found: ${missing || 'Unknown'}. Check IDs.`); // Warning instead of critical error if needs elements are missing
         }


        console.log("[DEBUG] main.js: Essential DOM elements confirmed.");

        // Attach event listeners
        console.log("[DEBUG] main.js: Attaching event listeners...");
        // ... (listeners remain the same, add science button listener) ...
         if (DOM.earnButton) DOM.earnButton.addEventListener('click', earnMinimumWage);
        if (DOM.promoteButton) DOM.promoteButton.addEventListener('click', upgradePromotionAction);
        if (DOM.upgradeFoodButton) DOM.upgradeFoodButton.addEventListener('click', () => upgradeNeedAction('food'));
        if (DOM.upgradeShelterButton) DOM.upgradeShelterButton.addEventListener('click', () => upgradeNeedAction('shelter'));
        if (DOM.manualForageButton) { // Still check as it might be added later
            DOM.manualForageButton.addEventListener('click', manualForageAction);
        } else {
             console.warn("[WARN] main.js: Manual Forage button not found during listener setup (OK if hidden initially).");
        }
        // Add listener for the new science upgrade button
        if (DOM.upgradeScienceButton) {
             DOM.upgradeScienceButton.addEventListener('click', upgradeScienceAction);
        } else {
             console.warn("[WARN] main.js: Science Upgrade button not found during listener setup.");
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
