// js/utils.js

import * as DOM from './domElements.js';
import { NUM_ABBREVIATIONS } from './config.js';
import { getGameState } from './gameState.js';


export function formatNumber(num, decimals = 2) {
    if (num === Infinity) return "MAX";
    if (Math.abs(num) < 1000 && Math.abs(num) >= 1e-9) return num.toFixed(decimals);
    if (Math.abs(num) < 1e-9) return '0.00';

    const item = NUM_ABBREVIATIONS.find(item => Math.abs(num) >= item.value);
    if (item) {
        let formatted = (num / item.value).toFixed(decimals);
        formatted = formatted.replace(/\.?0+$/, "");
        formatted = formatted.replace(/(\.\d*?[1-9])0+$/, "$1");
        return formatted + item.symbol;
    }
    return num.toFixed(decimals);
}


export function showFeedbackText(text, color, element = DOM.capitalFeedback, duration = 1000) {
    try {
        const safeGameState = getGameState();
        // Check if DOM element exists before proceeding
        const targetElement = element || DOM.capitalFeedback; // Fallback just in case
        if (!targetElement || safeGameState.isGameOver) return;

        targetElement.textContent = text;
        targetElement.style.color = color;
        targetElement.classList.add('show');
        setTimeout(() => {
            if (targetElement) {
                targetElement.classList.remove('show');
            }
        }, duration);
    } catch (e) {
        console.error("Error in showFeedbackText:", e);
    }
}

export function pulseCapitalDisplay() {
     try {
        const safeGameState = getGameState();
        if (safeGameState.isGameOver || !DOM.capitalDisplay) return;
        DOM.capitalDisplay.classList.add('pulsing');
        setTimeout(() => {
            if (DOM.capitalDisplay) {
                DOM.capitalDisplay.classList.remove('pulsing');
            }
        }, 300);
    } catch (e) {
        console.error("Error in pulseCapitalDisplay:", e);
    }
}

export function setBarColor(barElement, value) {
    if (!barElement) return;
    try {
        if (value < 25) barElement.style.backgroundColor = 'var(--negative-feedback)';
        else if (value < 50) barElement.style.backgroundColor = 'var(--warning-feedback)';
        else barElement.style.backgroundColor = 'var(--positive-feedback)';
    } catch (e) {
        console.error("Error in setBarColor:", e, "Element:", barElement);
    }
}
