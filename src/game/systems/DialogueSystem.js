/**
 * Dialogue System — The Translators
 * Source: GAME_SPEC.md "DIALOGUE SYSTEM"
 * 
 * Handles dialogue box display, queuing, and callbacks.
 */

import { DIALOGUE } from '../config/index.js';
import { TIMING } from '../config/timing.js';

export class DialogueSystem {
  constructor(game) {
    this.game = game;
    this.queue = [];
    this.callback = null;
    this.visible = false;
    
    // Create DOM elements
    this.createElements();
  }

  /**
   * Create dialogue UI elements
   */
  createElements() {
    // Container
    this.container = document.createElement('div');
    this.container.id = 'dialogueBox';
    this.container.className = 'dialogue-box';
    
    // Speaker label
    this.speakerEl = document.createElement('div');
    this.speakerEl.className = 'dialogue-speaker';
    this.speakerEl.textContent = DIALOGUE.ui.speaker;
    
    // Text content
    this.textEl = document.createElement('div');
    this.textEl.className = 'dialogue-text';
    
    // Continue indicator
    this.continueEl = document.createElement('div');
    this.continueEl.className = 'dialogue-continue';
    this.continueEl.textContent = DIALOGUE.ui.continueHint;
    
    // Assemble
    this.container.appendChild(this.speakerEl);
    this.container.appendChild(this.textEl);
    this.container.appendChild(this.continueEl);
    
    // Add to UI container
    this.game.ui.appendChild(this.container);
  }

  /**
   * Show dialogue
   * @param {string|string[]} lines - Single line or array of lines
   * @param {function} callback - Called after all lines dismissed
   */
  show(lines, callback = null) {
    this.queue = Array.isArray(lines) ? [...lines] : [lines];
    this.callback = callback;
    this.displayNext();
  }

  /**
   * Display next line in queue
   */
  displayNext() {
    if (this.queue.length === 0) {
      this.hide();
      if (this.callback) {
        const cb = this.callback;
        this.callback = null;
        setTimeout(cb, TIMING.dialogue.callbackDelay);
      }
      return;
    }
    
    const line = this.queue.shift();
    this.textEl.textContent = line;
    this.visible = true;
    this.container.classList.add('visible');
    
    // Show/hide continue indicator
    this.continueEl.style.display = 
      (this.queue.length > 0 || this.callback) ? 'block' : 'none';
  }

  /**
   * Advance to next line (called on tap/click)
   */
  advance() {
    if (this.visible) {
      this.displayNext();
    }
  }

  /**
   * Hide dialogue box
   */
  hide() {
    this.visible = false;
    this.container.classList.remove('visible');
  }

  /**
   * Check if dialogue is currently visible
   */
  isVisible() {
    return this.visible;
  }

  /**
   * Clear queue and hide
   */
  clear() {
    this.queue = [];
    this.callback = null;
    this.hide();
  }
}
