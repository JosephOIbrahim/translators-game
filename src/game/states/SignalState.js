/**
 * Signal State — The Translators
 * Source: GAME_SPEC.md "LAYER 3: THE ABYSS — Communication"
 * 
 * Layer 3: Respond to octopus color signals.
 */

import { 
  DIALOGUE, 
  PALETTE,
  SIGNAL_COLORS,
  COLOR_RELATIONSHIPS,
  OCTOPUS_POSITIONS
} from '../config/index.js';
import { PHYSICS } from '../config/physics.js';
import { TIMING } from '../config/timing.js';
import { Particle } from '../entities/Particle.js';

export class SignalState {
  constructor() {
    this.particles = [];
    this.hud = null;
    this.instruction = null;
    this.optionsContainer = null;
    this.currentRound = 0;
    this.currentSignal = null;
    this.signalStartTime = 0;
  }

  enter(game) {
    this.currentRound = 0;
    this.currentSignal = null;
    
    // Position octopus in center-upper
    const pos = OCTOPUS_POSITIONS.signal;
    game.octopus.setPosition(
      pos.x * game.width,
      pos.y * game.height
    );
    
    // Create particles
    this.particles = Particle.createBatch(
      PHYSICS.particle.countSignal,
      game.width,
      game.height
    );
    
    // Create HUD
    this.createHUD(game);
    
    // Show intro dialogue
    setTimeout(() => {
      game.dialogue.show(DIALOGUE.signal.intro, () => {
        setTimeout(() => this.sendSignal(game), TIMING.signal.firstSignalDelay);
      });
    }, TIMING.signal.introDelay);
  }

  exit(game) {
    if (this.hud) this.hud.remove();
    if (this.instruction) this.instruction.remove();
    if (this.optionsContainer) this.optionsContainer.remove();
    game.octopus.clearSignal();
  }

  createHUD(game) {
    this.hud = document.createElement('div');
    this.hud.className = 'hud';
    this.hud.innerHTML = `<div class="hud-label visible">The Abyss</div>`;
    game.ui.appendChild(this.hud);
    
    this.instruction = document.createElement('div');
    this.instruction.className = 'instruction visible';
    this.instruction.textContent = DIALOGUE.ui.instructionSignal;
    game.ui.appendChild(this.instruction);
  }

  sendSignal(game) {
    if (this.currentRound >= TIMING.signal.totalRounds) {
      this.finishLayer(game);
      return;
    }
    
    // Set current signal color
    this.currentSignal = SIGNAL_COLORS[this.currentRound];
    game.octopus.setSignal(this.currentSignal);
    this.signalStartTime = Date.now();
    
    // Show options after delay
    setTimeout(() => this.showOptions(game), TIMING.signal.optionsDelay);
  }

  showOptions(game) {
    // Remove old container if exists
    if (this.optionsContainer) {
      this.optionsContainer.remove();
    }
    
    this.optionsContainer = document.createElement('div');
    this.optionsContainer.className = 'signal-options visible';
    
    // Get color relationships
    const rel = COLOR_RELATIONSHIPS[this.currentSignal];
    
    const options = [
      { type: 'mirror', color: this.currentSignal, label: DIALOGUE.signalOptions.mirror },
      { type: 'similar', color: rel.similar, label: DIALOGUE.signalOptions.similar },
      { type: 'complement', color: rel.complement, label: DIALOGUE.signalOptions.complement },
      { type: 'contrast', color: rel.contrast, label: DIALOGUE.signalOptions.contrast }
    ];
    
    // Shuffle options
    options.sort(() => Math.random() - 0.5);
    
    // Create buttons
    options.forEach(opt => {
      const btn = document.createElement('div');
      btn.className = 'signal-btn';
      btn.style.backgroundColor = PALETTE[opt.color];
      btn.innerHTML = `<span>${opt.label}</span>`;
      btn.onclick = () => this.selectResponse(game, opt.type);
      this.optionsContainer.appendChild(btn);
    });
    
    game.ui.appendChild(this.optionsContainer);
  }

  selectResponse(game, type) {
    const responseTime = Date.now() - this.signalStartTime;
    
    // Record in behavior tracker
    game.behavior.recordSignalResponse(type, responseTime);
    
    // Hide options
    if (this.optionsContainer) {
      this.optionsContainer.classList.remove('visible');
    }
    
    // Clear signal
    game.octopus.clearSignal();
    
    // Show acknowledgment
    const ackLines = {
      'mirror': DIALOGUE.signal.responseMirror,
      'similar': DIALOGUE.signal.responseSimilar,
      'complement': DIALOGUE.signal.responseComplement,
      'contrast': DIALOGUE.signal.responseContrast
    };
    
    game.dialogue.show(ackLines[type], () => {
      this.currentRound++;
      setTimeout(() => this.sendSignal(game), TIMING.signal.nextSignalDelay);
    });
  }

  finishLayer(game) {
    game.dialogue.show(DIALOGUE.signal.exit, () => {
      game.nextLayer();
    });
  }

  update(game, dt) {
    // Update particles
    this.particles.forEach(p => p.update(dt, game.height));
  }

  render(game, ctx) {
    // Particles
    this.particles.forEach(p => p.render(ctx));
    
    // Octopus
    game.octopus.render(ctx, game.input.x, game.input.y);
  }

  onResize(game) {
    this.particles = Particle.createBatch(
      PHYSICS.particle.countSignal,
      game.width,
      game.height
    );
  }
}
