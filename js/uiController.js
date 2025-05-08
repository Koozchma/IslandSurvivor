// js/uiController.js - MINIMAL TEST

import * as _DOM from './domElements.js'; // The only import we need to test

console.log("[DEBUG] MINIMAL uiController loaded. _DOM object:", _DOM);

// Export empty functions to prevent import errors in other files for now
export function updateStoryline() {}
export function updateDisplay() {}
export function showGameOverUI(reason) {}
export function hideGameOverUI() {}
