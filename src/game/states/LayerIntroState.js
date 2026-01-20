/**
 * Layer Intro State — The Translators
 * 
 * Shows layer name and mechanic before entering layer.
 */

import { LAYERS, DIALOGUE, getLayerLabel } from '../config/index.js';

export class LayerIntroState {
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
    const layer = game.getLayerConfig();
    
    this.overlay = document.createElement('div');
    this.overlay.className = 'overlay';
    
    this.overlay.innerHTML = `
      <div class="subtitle">${getLayerLabel(game.currentLayer)}</div>
      <div class="title" style="font-size: 2rem;">${layer.name}</div>
      <div class="hint" style="margin-top: 8px;">— ${layer.mechanic} —</div>
      <button class="btn" style="margin-top: 28px;" id="enterBtn">${DIALOGUE.layerIntro.enterButton}</button>
    `;
    
    game.ui.appendChild(this.overlay);
    
    // Trigger reflow then add visible class
    this.overlay.offsetHeight;
    this.overlay.classList.add('visible');
    
    // Bind enter button
    this.overlay.querySelector('#enterBtn').onclick = () => {
      const layer = game.getLayerConfig();
      game.changeState(layer.id);
    };
  }

  update(game, dt) {
    // No updates needed
  }

  render(game, ctx) {
    // Background rendered by Renderer.clear()
  }
}
