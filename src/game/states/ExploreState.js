/**
 * Explore State — The Translators
 * Source: GAME_SPEC.md "LAYER 1: TWILIGHT ZONE — Navigation"
 * 
 * Layer 1: Guide octopus, collect orbs, reach goal beacon.
 */

import { 
  DIALOGUE, 
  ORB_POSITIONS, 
  ORB_COLORS, 
  TOTAL_ORBS,
  GOAL_POSITION,
  OCTOPUS_POSITIONS,
  PALETTE
} from '../config/index.js';
import { PHYSICS } from '../config/physics.js';
import { TIMING } from '../config/timing.js';
import { Orb } from '../entities/Orb.js';
import { Particle } from '../entities/Particle.js';

export class ExploreState {
  constructor() {
    this.orbs = [];
    this.particles = [];
    this.hud = null;
    this.instruction = null;
    this.goalReached = false;
  }

  enter(game) {
    this.goalReached = false;
    
    // Position octopus
    const startPos = OCTOPUS_POSITIONS.explore;
    game.octopus.setPosition(
      startPos.x * game.width,
      startPos.y * game.height
    );
    
    // Initialize behavior tracking
    game.behavior.initPathTracking(game.octopus.x, game.octopus.y);
    
    // Create orbs
    this.orbs = ORB_POSITIONS.map((pos, i) => 
      new Orb(
        pos.x * game.width,
        pos.y * game.height,
        ORB_COLORS[i]
      )
    );
    
    // Create particles
    this.particles = Particle.createBatch(
      PHYSICS.particle.countExplore,
      game.width,
      game.height
    );
    
    // Create HUD
    this.createHUD(game);
    
    // Show intro dialogue
    setTimeout(() => {
      game.dialogue.show(DIALOGUE.explore.intro);
    }, TIMING.explore.introDelay);
  }

  exit(game) {
    if (this.hud) this.hud.remove();
    if (this.instruction) this.instruction.remove();
  }

  createHUD(game) {
    // Layer label
    this.hud = document.createElement('div');
    this.hud.className = 'hud';
    this.hud.innerHTML = `
      <div class="hud-label visible">Twilight Zone</div>
      <div class="orb-counter visible">${game.behavior.orbsCollected} / ${TOTAL_ORBS}</div>
    `;
    game.ui.appendChild(this.hud);
    
    // Instruction
    this.instruction = document.createElement('div');
    this.instruction.className = 'instruction visible';
    this.instruction.textContent = DIALOGUE.ui.instructionExplore;
    game.ui.appendChild(this.instruction);
  }

  updateOrbCounter(game) {
    const counter = this.hud.querySelector('.orb-counter');
    if (counter) {
      counter.textContent = `${game.behavior.orbsCollected} / ${TOTAL_ORBS}`;
    }
  }

  update(game, dt) {
    // Update particles
    this.particles.forEach(p => p.update(dt, game.height));
    
    // Update orbs
    this.orbs.forEach(o => o.update(dt));
  }

  render(game, ctx) {
    // Particles
    this.particles.forEach(p => p.render(ctx));
    
    // Goal beacon
    this.renderGoal(game, ctx);
    
    // Orbs
    this.orbs.forEach(o => o.render(ctx));
    
    // Octopus
    game.octopus.render(ctx, game.input.x, game.input.y);
  }

  renderGoal(game, ctx) {
    const gx = GOAL_POSITION.x * game.width;
    const gy = GOAL_POSITION.y * game.height;
    const pulse = 0.6 + Math.sin(game.time * TIMING.animation.goalPulseSpeed) * 0.3;
    
    const { outerGlowRadius, innerRingRadius, centerRadius } = PHYSICS.goal;
    
    // Outer glow
    ctx.fillStyle = `rgba(92, 255, 219, ${0.1 * pulse})`;
    ctx.beginPath();
    ctx.arc(gx, gy, outerGlowRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner ring
    ctx.strokeStyle = `rgba(92, 255, 219, ${0.5 + pulse * 0.3})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(gx, gy, innerRingRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Center
    ctx.fillStyle = PALETTE.glowCyan;
    ctx.beginPath();
    ctx.arc(gx, gy, centerRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  onPointerMove(game, x, y) {
    // Track path
    game.behavior.trackPath(x, y);
    
    // Octopus follows cursor
    game.octopus.setTarget(x, y);
  }

  onPointerDown(game, x, y) {
    // Check orb collection
    this.orbs.forEach((orb, i) => {
      if (orb.containsPoint(x, y)) {
        this.collectOrb(game, i);
      }
    });
  }

  onClick(game, x, y) {
    // Check if goal reached
    if (!this.goalReached) {
      const gx = GOAL_POSITION.x * game.width;
      const gy = GOAL_POSITION.y * game.height;
      const dist = Math.sqrt((game.octopus.x - gx) ** 2 + (game.octopus.y - gy) ** 2);
      
      if (dist < PHYSICS.goal.reachRadius) {
        this.finishLayer(game);
      }
    }
  }

  collectOrb(game, index) {
    const orb = this.orbs[index];
    if (orb.collected) return;
    
    orb.collect();
    game.behavior.collectOrb();
    this.updateOrbCounter(game);
    
    // Verbal cues (from GAME_SPEC.md)
    const collected = game.behavior.orbsCollected;
    const total = TOTAL_ORBS;
    
    if (collected === 1) {
      game.dialogue.show(DIALOGUE.explore.firstOrb);
    } else if (collected === Math.ceil(total / 2)) {
      game.dialogue.show(DIALOGUE.explore.halfOrbs);
    } else if (collected === total) {
      game.dialogue.show(DIALOGUE.explore.allOrbs);
    }
  }

  finishLayer(game) {
    this.goalReached = true;
    
    // Calculate direct distance for exploration score
    const startY = OCTOPUS_POSITIONS.explore.y * game.height;
    const goalY = GOAL_POSITION.y * game.height;
    const directDistance = startY - goalY;
    
    // Determine exit dialogue
    const explorationScore = game.behavior.getExplorationScore(directDistance);
    const exitLine = (explorationScore > 0.3 || game.behavior.orbsCollected >= 4)
      ? DIALOGUE.explore.exitHighExploration
      : DIALOGUE.explore.exitDirect;
    
    // Store direct distance for profile generation
    game.directDistance = directDistance;
    
    // Show exit dialogue then advance
    game.dialogue.show(exitLine, () => {
      game.nextLayer();
    });
  }

  onResize(game) {
    // Reposition orbs
    this.orbs.forEach((orb, i) => {
      const pos = ORB_POSITIONS[i];
      orb.x = pos.x * game.width;
      orb.y = pos.y * game.height;
    });
    
    // Recreate particles
    this.particles = Particle.createBatch(
      PHYSICS.particle.countExplore,
      game.width,
      game.height
    );
  }
}
