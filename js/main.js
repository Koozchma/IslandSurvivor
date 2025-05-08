import * as DOM from './domElements.js';
import * as GameState from './gameState.js';
import { updateDisplay, hideGameOverUI } from './uiController.js';
import { earnMinimumWage, upgradePromotionAction, upgradeNeedAction } from './actions.js';
import {
    updateHealthAndHunger, applyMaintenanceCosts, applyInterest,
    calculatePromotionStats, calculateNeedStats, checkStorylineAdvance
} from './coreLogic.js';
import { MAX_STAT, FOOD_LEVEL_NAMES, SHELTER_LEVEL_NAMES, FOOD_PRODUCTION_VALUES } from './config.js';


let gameLoopInterval;

function initializeGame() {
    GameState.setIsGameOver(false);
    GameState.setCapital(0.00);
    GameState.setGameSeconds(0);
    GameState.setCurrentStageIndex(0);

    GameState.setHealth(MAX_STAT);
    GameState.setHunger(MAX_STAT);

    GameState.updatePromotionState({
        level: 0,
        currentClicks: 0,
        currentWage: 1.00 // Initial wage
    });
    calculatePromotionStats(); // Calculate initial derived stats for promotion

    GameState.updateFoodState({
        level: 0,
        baseMaintenance: 0.00,
        currentProduction: 0,
        currentMaintenance: 0,
        currentUpgradeCost: GameState.food.baseUpgradeCost, // Initial cost
        currentName: FOOD_LEVEL_NAMES[0]
    });
    calculateNeedStats('food'); // Calculate initial derived stats for food

    GameState.updateShelterState({
        level: 0,
        baseMaintenance: 0.00,
        currentMaintenance: 0,
        currentUpgradeCost: GameState.shelter.baseUpgradeCost, // Initial cost
        currentName: SHELTER_LEVEL_NAMES[0]
    });
    calculateNeedStats('shelter'); // Calculate initial derived stats for shelter


    hideGameOverUI();
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, 1000);
    
    // Re-enable buttons that might have been disabled by game over
    DOM.earnButton.disabled = false;
    DOM.promoteButton.disabled = GameState.promotion.currentClicks < GameState.promotion.clicksNeeded; // Initial state
    DOM.upgradeFoodButton.disabled = GameState.capital < GameState.food.currentUpgradeCost;
    DOM.upgradeShelterButton.disabled = GameState.capital < GameState.shelter.currentUpgradeCost;

    updateDisplay();
}


function gameLoop() {
    if (GameState.isGameOver) {
        clearInterval(gameLoopInterval);
        return;
    }
    GameState.setGameSeconds(GameState.gameSeconds + 1);
    
    updateHealthAndHunger();
    if (GameState.isGameOver) { // Check again if health/hunger update caused game over
        clearInterval(gameLoopInterval);
        return;
    }

    applyMaintenanceCosts();
    applyInterest();
    checkStorylineAdvance(); // Check and advance storyline stage
    updateDisplay();
}

// Event Listeners
if (DOM.earnButton) DOM.earnButton.addEventListener('click', earnMinimumWage);
if (DOM.promoteButton) DOM.promoteButton.addEventListener('click', upgradePromotionAction);
if (DOM.upgradeFoodButton) DOM.upgradeFoodButton.addEventListener('click', () => upgradeNeedAction('food'));
if (DOM.upgradeShelterButton) DOM.upgradeShelterButton.addEventListener('click', () => upgradeNeedAction('shelter'));
if (DOM.restartButton) DOM.restartButton.addEventListener('click', initializeGame);

// Start the game
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});