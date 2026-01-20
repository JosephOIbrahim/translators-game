/**
 * Title State — The Translators
 * 
 * Initial title screen with start button.
 */

import { DIALOGUE } from '../config/index.js';

export class TitleState {
  constructor() {
    this.overlay = null;
  }

  enter(game) {
    this.createOverlay(game);
  }

  exit(game) {
    if (this.overlay) {
      this.overlay.classList.remove('visible');
      setTimeout(() => this.overlay.remove(), 400);
    }
  }

  createOverlay(game) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'overlay';
    
    this.overlay.innerHTML = `
      <div class="title">${DIALOGUE.title.main}</div>
      <div class="subtitle">${DIALOGUE.title.subtitle}</div>
      <p class="desc">${DIALOGUE.title.description}</p>
      <button class="btn" id="startBtn">${DIALOGUE.title.startButton}</button>
      <div class="hint">${DIALOGUE.title.duration}</div>
    `;
    
    game.ui.appendChild(this.overlay);
    
    // Trigger reflow then add visible class for animation
    this.overlay.offsetHeight;
    this.overlay.classList.add('visible');
    
    // Bind start button (v3 flow: go directly to calibration)
    this.overlay.querySelector('#startBtn').onclick = () => {
      game.changeState('calibration');
    };
  }

  update(game, dt) {
    // No updates needed
  }

  render(game, ctx) {
    // Background rendered by Renderer.clear()
  }
}
