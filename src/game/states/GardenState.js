/**
 * Garden State — The Translators v2
 *
 * Core gameplay: 5-7 story moments per character.
 * Each moment: companion dialogue → object placement → continue.
 * Replaces the 3-layer system with unified garden experience.
 */

import { getCharacter } from '../config/characters.js';
import { PALETTE, ISLAND_PALETTE } from '../config/palette.js';
import { createCompanion } from '../entities/companions/index.js';
import { Environment } from '../systems/Environment.js';
import { Tree } from '../entities/Tree.js';
import { Flower, FLOWER_COLORS } from '../entities/Flower.js';
import { Bird } from '../entities/Bird.js';
import { Particle } from '../entities/Particle.js';
import { Island } from '../entities/Island.js';
import { WolframLens } from '../systems/WolframLens.js';

export class GardenState {
  constructor() {
    this.character = null;
    this.currentMoment = 0;
    this.placedObjects = [];
    this.trayObjects = [];
    this.draggingObject = null;
    this.dragOffset = { x: 0, y: 0 };

    // Companion creature
    this.companion = null;

    // UI elements
    this.promptCard = null;
    this.objectTray = null;
    this.continueBtn = null;
    this.hud = null;

    // Timing
    this.momentStartTime = 0;
    this.lastPlacementTime = 0;
    this.placementCount = 0;
    this.revisionCount = 0;

    // Garden canvas area (above tray)
    this.gardenArea = { x: 0, y: 0, width: 0, height: 0 };
    this.trayArea = { x: 0, y: 0, width: 0, height: 0 };

    // Living world elements
    this.environment = null;
    this.island = null;  // Floating garden platform
    this.trees = [];
    this.flowers = [];
    this.particles = [];
    this.birds = [];

    // Wolfram Lens - mathematical perception filter
    // The lens IS the profile: transforms how the world appears
    this.lens = null;

    // Control hints UI
    this.controlHints = null;
  }

  enter(game, data = {}) {
    const characterId = data.character || game.selectedCharacter || 'collector';
    this.character = getCharacter(characterId);

    if (!this.character) {
      console.error('No character found:', characterId);
      game.changeState('title');
      return;
    }

    this.currentMoment = game.currentMoment || 0;
    this.placedObjects = [];
    this.placementCount = 0;
    this.revisionCount = 0;

    // Calculate areas
    this.calculateAreas(game);

    // Create companion creature
    this.companion = createCompanion(characterId, game);

    // Create living world environment
    this.environment = new Environment(this.character);

    // Create floating island platform
    this.island = new Island(game);
    this.island.setGardenHeight(this.gardenArea.height);

    // Create Wolfram Lens — mathematical perception filter
    // Starts uncalibrated, calibrates as player behavior emerges
    this.lens = new WolframLens();
    // Set center for spatial transforms (island center)
    this.lens.centerX = this.island.centerX;
    this.lens.centerY = this.island.centerY;

    // Generate vegetation ON the island
    this.generateForest(game);
    this.generateFlowers(game);

    // Fewer particles for cleaner look
    this.particles = Particle.createGardenBatch(15, game.width, this.gardenArea.height);
    this.birds = [new Bird(game), new Bird(game)];

    // Enable cursor following on companion, constrained to island
    if (this.companion && this.island) {
      this.companion.setFollowCursor(true, this.gardenArea.height - 50);
      // Set movement bounds to island surface
      if (this.companion.setMovementBounds) {
        this.companion.setMovementBounds(this.island.spawnBounds);
      }
      // Start companion at center of island
      this.companion.setPosition(this.island.centerX, this.island.centerY);
    }

    // Create UI
    this.createUI(game);

    // Start moment
    this.startMoment(game);
  }

  exit(game) {
    // Record final moment data
    this.recordMomentData(game);

    // Clean up UI
    if (this.promptCard) this.promptCard.remove();
    if (this.objectTray) this.objectTray.remove();
    if (this.continueBtn) this.continueBtn.remove();
    if (this.hud) this.hud.remove();
    if (this.controlHints) this.controlHints.remove();

    // Disable cursor following
    if (this.companion) {
      this.companion.setFollowCursor(false);
    }
  }

  calculateAreas(game) {
    const trayHeight = 140;
    this.trayArea = {
      x: 0,
      y: game.height - trayHeight,
      width: game.width,
      height: trayHeight
    };
    this.gardenArea = {
      x: 0,
      y: 0,
      width: game.width,
      height: game.height - trayHeight
    };
  }

  createUI(game) {
    this.injectStyles();

    // HUD with character name and moment progress
    this.hud = document.createElement('div');
    this.hud.className = 'garden-hud';
    this.hud.innerHTML = `
      <div class="garden-character">${this.character.name}</div>
      <div class="garden-progress">
        ${this.currentMoment + 1} / ${this.character.story.moments.length}
      </div>
    `;
    game.ui.appendChild(this.hud);

    // Prompt card
    this.promptCard = document.createElement('div');
    this.promptCard.className = 'garden-prompt';
    game.ui.appendChild(this.promptCard);

    // Object tray
    this.objectTray = document.createElement('div');
    this.objectTray.className = 'garden-tray';
    game.ui.appendChild(this.objectTray);

    // Continue button (hidden initially)
    this.continueBtn = document.createElement('button');
    this.continueBtn.className = 'continue-btn garden-continue';
    this.continueBtn.textContent = 'Continue';
    this.continueBtn.onclick = () => this.nextMoment(game);
    game.ui.appendChild(this.continueBtn);

    // Control hints
    this.controlHints = document.createElement('div');
    this.controlHints.className = 'control-hints';
    this.controlHints.innerHTML = `
      <div class="hint-row">
        <span class="hint-key">Move cursor</span>
        <span class="hint-desc">Companion follows</span>
      </div>
      <div class="hint-row">
        <span class="hint-key">Click tree</span>
        <span class="hint-desc">Shake</span>
      </div>
      <div class="hint-row">
        <span class="hint-key">Drag object</span>
        <span class="hint-desc">Place in garden</span>
      </div>
    `;
    game.ui.appendChild(this.controlHints);
  }

  startMoment(game) {
    const moment = this.character.story.moments[this.currentMoment];
    if (!moment) {
      this.finishGarden(game);
      return;
    }

    this.momentStartTime = Date.now();
    this.placementCount = 0;
    this.revisionCount = 0;
    this.placedObjects = [];

    // Position companion based on moment data
    if (this.companion && moment.companion) {
      const pos = moment.companion.position;
      this.companion.setTarget(
        pos.x * game.width,
        pos.y * this.gardenArea.height
      );
      this.companion.setEmotion(moment.companion.emotion || 'neutral');
    }

    // Update progress
    this.hud.querySelector('.garden-progress').textContent =
      `${this.currentMoment + 1} / ${this.character.story.moments.length}`;

    // Show prompt
    this.promptCard.innerHTML = `
      <div class="prompt-text">${moment.prompt}</div>
    `;
    this.promptCard.classList.add('visible');

    // Show companion dialogue
    const dialogue = moment.companion.dialogue;
    game.dialogue.show(dialogue, () => {
      // After dialogue, populate tray
      this.populateTray(game, moment);
    });

    // Hide continue button
    this.continueBtn.classList.remove('visible');
  }

  populateTray(game, moment) {
    this.trayObjects = [];
    this.objectTray.innerHTML = '';

    moment.objects.available.forEach((objectId, index) => {
      const obj = this.createTrayObject(objectId, index, moment.objects.available.length);
      this.trayObjects.push(obj);
      this.objectTray.appendChild(obj.element);
    });

    this.objectTray.classList.add('visible');
  }

  createTrayObject(objectId, index, total) {
    const element = document.createElement('div');
    element.className = 'tray-object';
    element.dataset.objectId = objectId;

    // Create visual based on object name
    const displayName = objectId.replace(/_/g, ' ');
    const hue = (index / total) * 360;

    element.innerHTML = `
      <div class="object-icon" style="background: hsl(${hue}, 45%, 65%)"></div>
      <div class="object-label">${displayName}</div>
    `;

    // Make draggable
    element.addEventListener('mousedown', (e) => this.startDragFromTray(e, objectId, element));
    element.addEventListener('touchstart', (e) => this.startDragFromTray(e, objectId, element), { passive: false });

    return {
      id: objectId,
      element,
      inTray: true
    };
  }

  startDragFromTray(e, objectId, element) {
    e.preventDefault();

    const rect = element.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;

    // Create a floating copy for dragging
    const dragEl = element.cloneNode(true);
    dragEl.className = 'tray-object dragging';
    dragEl.style.position = 'fixed';
    dragEl.style.left = rect.left + 'px';
    dragEl.style.top = rect.top + 'px';
    dragEl.style.width = rect.width + 'px';
    dragEl.style.zIndex = '1000';
    document.body.appendChild(dragEl);

    this.draggingObject = {
      id: objectId,
      element: dragEl,
      sourceElement: element,
      fromTray: true,
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top
    };

    // Dim source
    element.style.opacity = '0.3';
  }

  startDragPlaced(e, placedObj) {
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches ? e.touches[0] : e;

    this.draggingObject = {
      id: placedObj.id,
      element: placedObj.element,
      fromTray: false,
      placedIndex: this.placedObjects.indexOf(placedObj),
      offsetX: touch.clientX - placedObj.x,
      offsetY: touch.clientY - placedObj.y
    };

    placedObj.element.classList.add('dragging');
  }

  onPointerMove(game, x, y) {
    if (!this.draggingObject) return;

    const newX = x - this.draggingObject.offsetX;
    const newY = y - this.draggingObject.offsetY;

    this.draggingObject.element.style.left = newX + 'px';
    this.draggingObject.element.style.top = newY + 'px';
  }

  onPointerUp(game) {
    if (!this.draggingObject) return;

    const drag = this.draggingObject;
    const rect = drag.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Check if dropped in garden area
    if (centerY < this.trayArea.y) {
      if (drag.fromTray) {
        // New placement from tray
        this.placeObject(game, drag.id, centerX, centerY, drag.element);
        drag.sourceElement.style.display = 'none';
      } else {
        // Repositioning existing object
        this.repositionObject(game, drag.placedIndex, centerX, centerY);
        drag.element.classList.remove('dragging');
      }
    } else {
      // Dropped back in tray area
      if (drag.fromTray) {
        // Return to tray
        drag.sourceElement.style.opacity = '1';
        drag.element.remove();
      } else {
        // Remove from garden
        this.removeObject(game, drag.placedIndex);
      }
    }

    this.draggingObject = null;
    this.checkContinueCondition(game);
  }

  placeObject(game, objectId, x, y, dragElement) {
    const now = Date.now();

    // Record placement speed
    if (this.lastPlacementTime) {
      game.behavior.recordPlacementSpeed(now - this.lastPlacementTime);
    }
    this.lastPlacementTime = now;

    // Create placed object element
    const placedEl = document.createElement('div');
    placedEl.className = 'placed-object';
    placedEl.style.left = x + 'px';
    placedEl.style.top = y + 'px';
    placedEl.innerHTML = dragElement.innerHTML;
    game.ui.appendChild(placedEl);

    // Remove drag element
    dragElement.remove();

    const placedObj = {
      id: objectId,
      element: placedEl,
      x: x,
      y: y
    };

    // Make repositionable
    placedEl.addEventListener('mousedown', (e) => this.startDragPlaced(e, placedObj));
    placedEl.addEventListener('touchstart', (e) => this.startDragPlaced(e, placedObj), { passive: false });

    this.placedObjects.push(placedObj);
    this.placementCount++;

    // Record in behavior tracker
    const category = this.getObjectCategory(objectId);
    game.behavior.recordPlacement({
      objectId,
      category,
      position: { x, y },
      momentIndex: this.currentMoment,
      timestamp: now,
      isFirst: this.placementCount === 1
    });
  }

  repositionObject(game, index, x, y) {
    if (index < 0 || index >= this.placedObjects.length) return;

    const obj = this.placedObjects[index];
    obj.x = x;
    obj.y = y;
    obj.element.style.left = x + 'px';
    obj.element.style.top = y + 'px';

    this.revisionCount++;
  }

  removeObject(game, index) {
    if (index < 0 || index >= this.placedObjects.length) return;

    const obj = this.placedObjects.splice(index, 1)[0];
    obj.element.remove();

    // Show source in tray again
    const trayObj = this.trayObjects.find(t => t.id === obj.id);
    if (trayObj) {
      trayObj.element.style.display = '';
      trayObj.element.style.opacity = '1';
    }

    this.revisionCount++;
  }

  getObjectCategory(objectId) {
    // Categorize objects by keywords
    const lightWords = ['light', 'glow', 'lantern', 'star', 'sun', 'moon', 'fire', 'crystal'];
    const natureWords = ['flower', 'seed', 'moss', 'leaf', 'tree', 'feather', 'stone'];
    const structureWords = ['bridge', 'wall', 'gate', 'tower', 'pillar', 'foundation', 'corner'];
    const memoryWords = ['memory', 'letter', 'gift', 'secret', 'moment', 'hope', 'fear'];

    const lower = objectId.toLowerCase();

    if (lightWords.some(w => lower.includes(w))) return 'light';
    if (natureWords.some(w => lower.includes(w))) return 'nature';
    if (structureWords.some(w => lower.includes(w))) return 'structure';
    if (memoryWords.some(w => lower.includes(w))) return 'memory';
    return 'whimsy';
  }

  checkContinueCondition(game) {
    const moment = this.character.story.moments[this.currentMoment];
    if (!moment) return;

    const minPlacements = moment.objects.minPlacements || 1;

    if (this.placedObjects.length >= minPlacements) {
      this.continueBtn.classList.add('visible');
    } else {
      this.continueBtn.classList.remove('visible');
    }
  }

  recordMomentData(game) {
    const moment = this.character.story.moments[this.currentMoment];
    if (!moment) return;

    const duration = Date.now() - this.momentStartTime;

    // Determine ambiguity response for ambiguous prompts
    let ambiguityResponse = null;
    if (moment.promptType === 'ambiguous') {
      if (this.placedObjects.length === 0) {
        ambiguityResponse = 'avoided';
      } else if (this.placedObjects.length > moment.objects.minPlacements) {
        ambiguityResponse = 'embraced';
      } else {
        ambiguityResponse = 'minimal';
      }
    }

    game.behavior.recordMomentComplete({
      momentIndex: this.currentMoment,
      duration,
      placementCount: this.placedObjects.length,
      revisions: this.revisionCount,
      ambiguityResponse
    });
  }

  nextMoment(game) {
    // Record current moment data
    this.recordMomentData(game);

    // Clean up placed objects
    this.placedObjects.forEach(obj => obj.element.remove());
    this.placedObjects = [];

    // Move to next moment
    this.currentMoment++;
    game.currentMoment = this.currentMoment;

    if (this.currentMoment >= this.character.story.moments.length) {
      this.finishGarden(game);
    } else {
      // Hide tray and prompt
      this.objectTray.classList.remove('visible');
      this.promptCard.classList.remove('visible');
      this.continueBtn.classList.remove('visible');

      // Start next moment after brief pause
      setTimeout(() => this.startMoment(game), 500);
    }
  }

  finishGarden(game) {
    // Store the calibrated lens on game for ProfileState to use
    game.wolframLens = this.lens;

    // Show outro
    game.dialogue.show(this.character.story.outro, () => {
      game.changeState('profile');
    });
  }

  update(game, dt) {
    // Update environment
    if (this.environment) {
      this.environment.update(dt);
    }

    // Update Wolfram Lens time (for temporal transforms)
    if (this.lens) {
      this.lens.updateTime(dt);

      // Calibrate lens from behavioral signals (smooth interpolation)
      // Only starts calibrating once we have some data
      if (game.behavior && game.behavior.placements.length > 0) {
        const signals = game.behavior.getLensSignals(game.width, this.gardenArea.height);
        this.lens.updateToward(signals, 0.05); // Gentle 5% lerp per frame
      }
    }

    // Update trees
    this.trees.forEach(tree => tree.update(dt, this.environment));

    // Update flowers
    this.flowers.forEach(flower => flower.update(dt, this.environment));

    // Update particles with wind
    const windOffset = this.environment ? this.environment.getWindOffset() : 0;
    this.particles.forEach(p => p.update(dt, this.gardenArea.height, game.width, windOffset));

    // Update birds (occasional trigger)
    this.birds.forEach(bird => bird.update(dt, game));
    if (Math.random() < 0.002) {
      const inactive = this.birds.find(b => !b.active);
      if (inactive) inactive.trigger();
    }

    // Update companion
    if (this.companion) {
      this.companion.update(game, dt);
    }
  }

  render(game, ctx) {
    const palette = this.getTreePalette();

    // === 1. SKY (flat cool sage) ===
    this.renderSky(ctx, game);

    // === 2. FLOATING ISLAND PLATFORM ===
    if (this.island) {
      this.island.render(ctx);
    }

    // === 3. TREES (on island surface, sorted by Y) ===
    // Pass lens for mathematical color/spatial transforms
    this.trees.forEach(t => t.render(ctx, palette, this.lens));

    // === 4. FLOWERS (dense on island) ===
    // Lens transforms how colors are perceived
    this.flowers.forEach(f => f.render(ctx, this.lens));

    // === 5. PARTICLES (floating above) ===
    this.particles.forEach(p => p.render(ctx));

    // === 6. BIRDS (background sky) ===
    this.birds.forEach(b => b.render(ctx));

    // === 7. COMPANION (on island) ===
    if (this.companion) {
      this.companion.render(ctx);
    }

    // === 8. GROUND / TRAY AREA ===
    this.renderGround(ctx, game);
  }

  renderSky(ctx, game) {
    // Flat cool sage background - creates calm space for island to pop
    ctx.fillStyle = ISLAND_PALETTE.skyBase;
    ctx.fillRect(0, 0, game.width, this.gardenArea.height);
  }

  renderGround(ctx, game) {
    // Ground area with grass hint
    const groundGradient = ctx.createLinearGradient(0, this.trayArea.y - 20, 0, this.trayArea.y);
    groundGradient.addColorStop(0, 'rgba(200, 192, 168, 0)');
    groundGradient.addColorStop(1, 'rgba(180, 172, 148, 0.3)');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, this.trayArea.y - 20, game.width, 20);

    // Tray area
    ctx.fillStyle = PALETTE.bgCard;
    ctx.fillRect(0, this.trayArea.y, game.width, this.trayArea.height);

    // Tray top border
    ctx.strokeStyle = PALETTE.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, this.trayArea.y);
    ctx.lineTo(game.width, this.trayArea.y);
    ctx.stroke();
  }

  onPointerDown(game, x, y) {
    // Handled by element event listeners
  }

  onClick(game, x, y) {
    // Only process clicks in garden area
    if (y >= this.trayArea.y) return;

    // Check tree clicks
    const clickedTree = this.trees.find(t => t.containsPoint(x, y));
    if (clickedTree) {
      clickedTree.shake();

      // Companion reacts
      if (this.companion) {
        this.companion.reactToInteraction(clickedTree.x, clickedTree.y, 'pleased');
      }

      // Occasional leaf burst reward
      if (Math.random() < 0.4) {
        this.spawnLeafBurst(clickedTree.x, clickedTree.y - 30 * clickedTree.size);
      }
    }
  }

  onKeyDown(game, key) {
    if (key === 'e' || key === 'space') {
      // Interact with nearest tree to companion
      const nearest = this.findNearestTree(this.companion?.x || game.width / 2, this.companion?.y || game.height / 2);
      if (nearest && this.getTreeDistance(nearest, this.companion) < 150) {
        nearest.shake();
        if (this.companion) {
          this.companion.reactToInteraction(nearest.x, nearest.y, 'pleased');
        }
        if (Math.random() < 0.4) {
          this.spawnLeafBurst(nearest.x, nearest.y - 30 * nearest.size);
        }
      }
    }
  }

  findNearestTree(x, y) {
    let nearest = null;
    let minDist = Infinity;
    for (const tree of this.trees) {
      const dist = this.getTreeDistance(tree, { x, y });
      if (dist < minDist) {
        minDist = dist;
        nearest = tree;
      }
    }
    return nearest;
  }

  getTreeDistance(tree, point) {
    if (!point) return Infinity;
    const dx = tree.x - point.x;
    const dy = tree.y - point.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  spawnLeafBurst(x, y) {
    for (let i = 0; i < 5; i++) {
      const leaf = new Particle(
        x + (Math.random() - 0.5) * 30,
        y + Math.random() * 10,
        'leaf'
      );
      leaf.vy = 0.3 + Math.random() * 0.5;
      leaf.vx = (Math.random() - 0.5) * 2;
      this.particles.push(leaf);
    }
  }

  generateForest(game) {
    this.trees = [];

    // Only 1-2 trees for cozy contained feel (reference style)
    const count = 1 + Math.floor(Math.random() * 2);

    for (let i = 0; i < count; i++) {
      // Get spawn point on island surface, biased toward back
      const pos = this.island
        ? this.island.getBackSpawnPoint()
        : { x: game.width / 2, y: this.gardenArea.height * 0.4 };

      // Only round trees for cozy feel
      const type = 'round';
      // Larger, more prominent trees
      const size = 0.9 + Math.random() * 0.4;

      this.trees.push(new Tree(pos.x, pos.y, type, size));
    }

    // Sort by Y for depth ordering
    this.trees.sort((a, b) => a.y - b.y);
  }

  generateFlowers(game) {
    this.flowers = [];

    // Dense flowers for lush island feel (30-45)
    const count = 30 + Math.floor(Math.random() * 15);

    for (let i = 0; i < count; i++) {
      // Get spawn point on island surface
      const pos = this.island
        ? this.island.getSpawnPoint()
        : { x: game.width / 2 + (Math.random() - 0.5) * 200, y: this.gardenArea.height * 0.5 };

      const color = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];
      this.flowers.push(new Flower(pos.x, pos.y, color));
    }
  }

  getTreePalette() {
    const palettes = {
      collector: { trunk: '#8a7560', foliage: '#6b9b5d', foliageLight: '#8ab877' },
      wanderer: { trunk: '#8a7560', foliage: '#5a9a8a', foliageLight: '#7ab8a8' },
      caretaker: { trunk: '#8a7560', foliage: '#8ab877', foliageLight: '#a8d090' },
      architect: { trunk: '#6a5a48', foliage: '#7a8b7a', foliageLight: '#98a898' }
    };
    return palettes[this.character?.id] || palettes.collector;
  }

  onResize(game) {
    this.calculateAreas(game);
    // Recalculate island bounds
    if (this.island) {
      this.island.setGardenHeight(this.gardenArea.height);
      this.island.recalculateBounds(game);
    }
  }

  injectStyles() {
    if (document.getElementById('garden-state-styles')) return;

    const style = document.createElement('style');
    style.id = 'garden-state-styles';
    style.textContent = `
      .garden-hud {
        position: absolute;
        top: 16px;
        left: 16px;
        right: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 50;
        pointer-events: none;
      }

      .garden-character {
        font-family: var(--font-pixel);
        font-size: 1.1rem;
        color: var(--text);
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .garden-progress {
        font-family: var(--font-pixel);
        font-size: 1rem;
        color: var(--text-muted);
      }

      .garden-prompt {
        position: absolute;
        top: 60px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-card);
        border-left: 4px solid var(--sage);
        border-radius: 8px;
        padding: 16px 24px;
        max-width: 400px;
        width: calc(100% - 48px);
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 40;
        box-shadow: 0 4px 20px var(--shadow);
      }

      .garden-prompt.visible {
        opacity: 1;
      }

      .prompt-text {
        font-size: 1rem;
        color: var(--text);
        line-height: 1.6;
        text-align: center;
      }

      .garden-tray {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 0 24px;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 60;
      }

      .garden-tray.visible {
        opacity: 1;
      }

      .tray-object {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: grab;
        padding: 12px;
        border-radius: 8px;
        background: var(--bg-secondary);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .tray-object:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px var(--shadow-hover);
      }

      .tray-object.dragging {
        cursor: grabbing;
        transform: scale(1.1);
        box-shadow: 0 8px 24px var(--shadow-hover);
        pointer-events: none;
      }

      .object-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        margin-bottom: 8px;
      }

      .object-label {
        font-family: var(--font-pixel);
        font-size: 0.75rem;
        color: var(--text-muted);
        text-align: center;
        max-width: 80px;
        text-transform: capitalize;
      }

      .placed-object {
        position: fixed;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px;
        border-radius: 8px;
        background: var(--bg-card);
        box-shadow: 0 4px 12px var(--shadow);
        cursor: grab;
        transform: translate(-50%, -50%);
        z-index: 70;
        transition: box-shadow 0.2s ease;
      }

      .placed-object:hover {
        box-shadow: 0 6px 20px var(--shadow-hover);
      }

      .placed-object.dragging {
        cursor: grabbing;
        box-shadow: 0 8px 24px var(--shadow-hover);
        z-index: 100;
      }

      .garden-continue {
        bottom: 160px;
        right: 24px;
      }

      .control-hints {
        position: absolute;
        bottom: 160px;
        left: 16px;
        font-family: var(--font-pixel);
        font-size: 0.75rem;
        color: var(--text-muted);
        opacity: 0.6;
        pointer-events: none;
        z-index: 45;
      }

      .hint-row {
        display: flex;
        gap: 8px;
        margin-bottom: 6px;
      }

      .hint-key {
        color: var(--sage);
        min-width: 80px;
      }

      .hint-desc {
        color: var(--text-muted);
      }
    `;

    document.head.appendChild(style);
  }
}
