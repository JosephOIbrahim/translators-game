/**
 * Main Entry Point — The Translators
 * 
 * Initializes the game when DOM is ready.
 */

import { Game } from './game/Game.js';

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas');
  const ui = document.getElementById('ui');
  
  if (!canvas || !ui) {
    console.error('Required DOM elements not found');
    return;
  }
  
  // Create and start game
  const game = new Game(canvas, ui);
  game.start();
  
  // Expose for debugging (remove in production)
  window.game = game;
});
