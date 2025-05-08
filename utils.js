import * as DOM from './domElements.js';
import { NUM_ABBREVIATIONS } from './config.js';
import { getGameState } from './gameState.js';


export function formatNumber(num, decimals = 2) {
    if (num === Infinity) return "MAX";
    if (Math.abs(num) < 1000 && num !== 0) return num.toFixed(decimals);
    if (num === 0) return '0.00';
    const item = NUM_ABBREVIATIONS.find(item => Math.abs(num) >= item.value);
    if (item) {
        return (num / item.value).toFixed(decimals).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + item.symbol;
    }
    return num.toFixed(decimals);
}

export function showFeedbackText(text, color, element = DOM.capitalFeedback, duration = 1000) {
    const { isGameOver } = getGameState();
    if (!element || isGameOver) return;
    element.textContent = text;
    element.style.color = color;
    element.classList.add('show');
    setTimeout(() => { element.classList.remove('show'); }, duration);
}

export function pulseCapitalDisplay() {
    const { isGameOver } = getGameState();
    if (isGameOver) return;
    DOM.capitalDisplay.classList.add('pulsing');
    setTimeout(() => { DOM.capitalDisplay.classList.remove('pulsing'); }, 300);
}

export function setBarColor(barElement, value) {
    if (value < 25) barElement.style.backgroundColor = 'var(--negative-feedback)';
    else if (value < 50) barElement.style.backgroundColor = 'var(--warning-feedback)';
    else barElement.style.backgroundColor = 'var(--positive-feedback)';
}