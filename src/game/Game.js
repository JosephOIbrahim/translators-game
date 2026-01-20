/**
 * Game Controller — The Translators
 * 
 * Central controller managing:
 * - State machine (title → layers → profile)
 * - Canvas and rendering
 * - Input routing
 * - Systems coordination
 */

import { LAYERS } from './config/index.js';
import { Renderer } from './systems/Renderer.js';
import { Input } from './systems/Input.js';
import { DialogueSystem } from './systems/DialogueSystem.js';
import { BehaviorTracker } from './systems/BehaviorTracker.js';
import { Octopus } from './entities/Octopus.js';

// Import states (v3 states — honest calibration)
import { TitleState } from './states/TitleState.js';
import { CalibrationState } from './states/CalibrationState.js';
import { ProfileState } from './states/ProfileState.js';

// Legacy states (kept for reference)
import { CharacterSelectState } from './states/CharacterSelectState.js';
import { GardenState } from './states/GardenState.js';
import { LayerIntroState } from './states/LayerIntroState.js';
import { ExploreState } from './states/ExploreState.js';
import { ArrangeState } from './states/ArrangeState.js';
import { SignalState } from './states/SignalState.js';

export class Game {
  constructor(canvas, uiContainer) {
    // Canvas setup
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ui = uiContainer;
    
    // Dimensions
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.resize();
    
    // Systems
    this.renderer = new Renderer(this);
    this.input = new Input(this);
    this.dialogue = new DialogueSystem(this);
    this.behavior = new BehaviorTracker();
    
    // Entities
    this.octopus = new Octopus(this);
    
    // State machine (v3 flow: title → calibration → profile)
    this.states = {
      title: new TitleState(),
      calibration: new CalibrationState(),
      profile: new ProfileState(),
      // Legacy states (kept for reference)
      characterSelect: new CharacterSelectState(),
      garden: new GardenState(),
      layerIntro: new LayerIntroState(),
      explore: new ExploreState(),
      arrange: new ArrangeState(),
      signal: new SignalState()
    };
    this.currentState = null;
    this.currentStateName = '';

    // v2 game progress
    this.selectedCharacter = null;
    this.currentMoment = 0;

    // Legacy: Layer progress
    this.currentLayer = 0;
    
    // Time tracking
    this.lastTime = 0;
    this.time = 0;
    
    // Bind methods
    this.loop = this.loop.bind(this);
    this.resize = this.resize.bind(this);
    
    // Event listeners
    window.addEventListener('resize', this.resize);
  }

  /**
   * Initialize and start the game
   */
  start() {
    this.changeState('title');
    requestAnimationFrame(this.loop);
  }

  /**
   * Change to a new state
   * @param {string} stateName - Name of state to transition to
   * @param {object} data - Optional data to pass to new state
   */
  changeState(stateName, data = {}) {
    // Exit current state
    if (this.currentState) {
      this.currentState.exit(this);
    }
    
    // Enter new state
    this.currentStateName = stateName;
    this.currentState = this.states[stateName];
    
    if (!this.currentState) {
      console.error(`Unknown state: ${stateName}`);
      return;
    }
    
    this.currentState.enter(this, data);
  }

  /**
   * Advance to next layer or profile
   */
  nextLayer() {
    this.currentLayer++;
    
    if (this.currentLayer < LAYERS.length) {
      this.changeState('layerIntro');
    } else {
      this.changeState('profile');
    }
  }

  /**
   * Get current layer config
   * @returns {object} Layer configuration
   */
  getLayerConfig() {
    return LAYERS[this.currentLayer];
  }

  /**
   * Restart the game
   */
  restart() {
    // v2 state reset
    this.selectedCharacter = null;
    this.currentMoment = 0;

    // Legacy reset
    this.currentLayer = 0;

    this.behavior.reset();
    this.changeState('title');
  }

  /**
   * Handle window resize
   */
  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Notify current state
    if (this.currentState && this.currentState.onResize) {
      this.currentState.onResize(this);
    }
  }

  /**
   * Main game loop
   */
  loop(timestamp) {
    // Calculate delta time
    const dt = this.lastTime ? (timestamp - this.lastTime) / 1000 : 0.016;
    this.lastTime = timestamp;
    this.time += dt;
    
    // Update
    if (this.currentState) {
      this.currentState.update(this, dt);
    }
    this.octopus.update(this, dt);
    
    // Render
    this.renderer.clear();
    if (this.currentState) {
      this.currentState.render(this, this.ctx);
    }
    
    // Continue loop
    requestAnimationFrame(this.loop);
  }

  // === Input Routing ===
  
  onPointerDown(x, y) {
    // Check dialogue first
    if (this.dialogue.isVisible()) {
      this.dialogue.advance();
      return;
    }
    
    if (this.currentState && this.currentState.onPointerDown) {
      this.currentState.onPointerDown(this, x, y);
    }
  }

  onPointerMove(x, y) {
    if (this.currentState && this.currentState.onPointerMove) {
      this.currentState.onPointerMove(this, x, y);
    }
  }

  onPointerUp() {
    if (this.currentState && this.currentState.onPointerUp) {
      this.currentState.onPointerUp(this);
    }
  }

  onClick(x, y) {
    // Check dialogue first
    if (this.dialogue.isVisible()) {
      this.dialogue.advance();
      return;
    }

    if (this.currentState && this.currentState.onClick) {
      this.currentState.onClick(this, x, y);
    }
  }

  onKeyDown(key) {
    if (this.currentState && this.currentState.onKeyDown) {
      this.currentState.onKeyDown(this, key);
    }
  }

  onKeyUp(key) {
    if (this.currentState && this.currentState.onKeyUp) {
      this.currentState.onKeyUp(this, key);
    }
  }
}
