/**
 * Arrange State — The Translators
 * Source: GAME_SPEC.md "LAYER 2: MIDNIGHT ZONE — Arrangement"
 * 
 * Layer 2: Drag and arrange elements (or don't).
 */

import { 
  DIALOGUE, 
  OCTOPUS_POSITIONS,
  ORB_COLORS
} from '../config/index.js';
import { PHYSICS } from '../config/physics.js';
import { TIMING } from '../config/timing.js';
import { Element } from '../entities/Element.js';
import { Particle } from '../entities/Particle.js';

export class ArrangeState {
  constructor() {
    this.elements = [];
    this.particles = [];
    this.hud = null;
    this.instruction = null;
    this.continueBtn = null;
    this.draggingIndex = null;
    this.dragOffset = { x: 0, y: 0 };
    this.stillnessTimer = null;
    this.stillnessShown = false;
  }

  enter(game) {
    this.draggingIndex = null;
    this.stillnessShown = false;
    
    // Start behavior tracking for this layer
    game.behavior.startArrangeLayer();
    
    // Position octopus at bottom (observing)
    const pos = OCTOPUS_POSITIONS.arrange;
    game.octopus.setPosition(
      pos.x * game.width,
      pos.y * game.height
    );
    
    // Create elements from collected orbs or defaults
    this.createElements(game);
    
    // Create particles
    this.particles = Particle.createBatch(
      PHYSICS.particle.countArrange,
      game.width,
      game.height
    );
    
    // Create HUD
    this.createHUD(game);
    
    // Show intro dialogue
    setTimeout(() => {
      game.dialogue.show(DIALOGUE.arrange.intro, () => {
        // Show continue button after delay
        setTimeout(() => {
          this.showContinueButton(game);
        }, TIMING.arrange.continueButtonDelay);
        
        // Start stillness timer
        this.startStillnessTimer(game);
      });
    }, TIMING.arrange.introDelay);
  }

  exit(game) {
    if (this.hud) this.hud.remove();
    if (this.instruction) this.instruction.remove();
    if (this.continueBtn) this.continueBtn.remove();
    if (this.stillnessTimer) clearTimeout(this.stillnessTimer);
    
    // Store final positions for analysis
    game.behavior.storeElementPositions(this.elements);
  }

  createElements(game) {
    this.elements = [];
    
    // Use collected orb colors if available, otherwise defaults
    const orbsCollected = game.behavior.orbsCollected;
    const numElements = Math.max(4, Math.min(8, orbsCollected || 5));
    
    for (let i = 0; i < numElements; i++) {
      const angle = (i / numElements) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 80 + Math.random() * 60;
      
      this.elements.push(new Element(
        game.width / 2 + Math.cos(angle) * dist,
        game.height / 2 + Math.sin(angle) * dist - 50,
        ORB_COLORS[i % ORB_COLORS.length],
        18 + Math.random() * 8
      ));
    }
  }

  createHUD(game) {
    this.hud = document.createElement('div');
    this.hud.className = 'hud';
    this.hud.innerHTML = `<div class="hud-label visible">Midnight Zone</div>`;
    game.ui.appendChild(this.hud);
    
    this.instruction = document.createElement('div');
    this.instruction.className = 'instruction visible';
    this.instruction.textContent = DIALOGUE.ui.instructionArrange;
    game.ui.appendChild(this.instruction);
  }

  showContinueButton(game) {
    this.continueBtn = document.createElement('button');
    this.continueBtn.className = 'continue-btn visible';
    this.continueBtn.textContent = DIALOGUE.ui.continueButton;
    this.continueBtn.onclick = () => this.finishLayer(game);
    game.ui.appendChild(this.continueBtn);
  }

  startStillnessTimer(game) {
    this.stillnessTimer = setTimeout(() => {
      if (!this.stillnessShown && game.behavior.arrangeActions < 3) {
        this.stillnessShown = true;
        game.dialogue.show(DIALOGUE.arrange.stillness);
      }
    }, TIMING.arrange.stillnessDelay);
  }

  update(game, dt) {
    // Update particles
    this.particles.forEach(p => p.update(dt, game.height));
    
    // Update elements (drift when not dragging)
    this.elements.forEach((el, i) => {
      if (i !== this.draggingIndex) {
        el.update(dt, game.width, game.height);
      }
    });
  }

  render(game, ctx) {
    // Particles
    this.particles.forEach(p => p.render(ctx));
    
    // Elements
    this.elements.forEach(el => el.render(ctx));
    
    // Octopus
    game.octopus.render(ctx, game.input.x, game.input.y);
  }

  onPointerDown(game, x, y) {
    // Check if clicking an element (check in reverse for proper z-order)
    for (let i = this.elements.length - 1; i >= 0; i--) {
      if (this.elements[i].containsPoint(x, y)) {
        this.draggingIndex = i;
        this.elements[i].isDragging = true;
        this.dragOffset.x = x - this.elements[i].x;
        this.dragOffset.y = y - this.elements[i].y;
        
        // Record arrange action
        game.behavior.recordArrangeAction();
        
        // Reset stillness timer
        if (this.stillnessTimer) {
          clearTimeout(this.stillnessTimer);
        }
        
        // Move to end of array (top of z-order)
        const element = this.elements.splice(i, 1)[0];
        this.elements.push(element);
        this.draggingIndex = this.elements.length - 1;
        
        break;
      }
    }
  }

  onPointerMove(game, x, y) {
    if (this.draggingIndex !== null) {
      this.elements[this.draggingIndex].setPosition(
        x - this.dragOffset.x,
        y - this.dragOffset.y
      );
    }
  }

  onPointerUp(game) {
    if (this.draggingIndex !== null) {
      this.elements[this.draggingIndex].isDragging = false;
      this.draggingIndex = null;
    }
  }

  finishLayer(game) {
    // Store final positions
    game.behavior.storeElementPositions(this.elements);
    
    // Determine exit dialogue based on organization style
    const style = game.behavior.getOrganizationStyle();
    const exitLines = {
      'linear': DIALOGUE.arrange.exitLinear,
      'clustered': DIALOGUE.arrange.exitClustered,
      'minimal': DIALOGUE.arrange.exitMinimal,
      'distributed': DIALOGUE.arrange.exitDistributed
    };
    
    game.dialogue.show(exitLines[style] || exitLines['distributed'], () => {
      game.nextLayer();
    });
  }

  onResize(game) {
    // Recreate particles
    this.particles = Particle.createBatch(
      PHYSICS.particle.countArrange,
      game.width,
      game.height
    );
  }
}
