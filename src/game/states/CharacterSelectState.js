/**
 * Character Select State — The Translators v2
 *
 * Displays 4 character cards for selection.
 * Tracks hover history and selection time for profiling.
 * Character choice is the FIRST profiling data point.
 */

import { CHARACTERS, CHARACTER_ORDER, getCharacter } from '../config/characters.js';
import { PALETTE } from '../config/palette.js';

export class CharacterSelectState {
  constructor() {
    this.overlay = null;
    this.cards = [];
    this.startTime = 0;
    this.hoverHistory = []; // Array of { characterId, startTime, duration }
    this.currentHover = null;
    this.currentHoverStart = 0;
  }

  enter(game) {
    this.startTime = Date.now();
    this.hoverHistory = [];
    this.currentHover = null;
    this.createOverlay(game);
  }

  exit(game) {
    // Record any pending hover
    this.endCurrentHover();

    if (this.overlay) {
      this.overlay.classList.remove('visible');
      setTimeout(() => this.overlay.remove(), 400);
    }
  }

  createOverlay(game) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'overlay character-select-overlay';

    this.overlay.innerHTML = `
      <div class="title">Who are you today?</div>
      <div class="subtitle">Choose your companion</div>
      <div class="character-grid" id="characterGrid"></div>
    `;

    const grid = this.overlay.querySelector('#characterGrid');

    // Create character cards
    CHARACTER_ORDER.forEach(id => {
      const char = CHARACTERS[id];
      const card = this.createCharacterCard(char, game);
      grid.appendChild(card);
      this.cards.push({ id, element: card });
    });

    game.ui.appendChild(this.overlay);

    // Trigger reflow then add visible class for animation
    this.overlay.offsetHeight;
    this.overlay.classList.add('visible');

    // Add CSS for character select if not present
    this.injectStyles();
  }

  createCharacterCard(char, game) {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.dataset.characterId = char.id;
    card.style.setProperty('--card-color', char.colors.primary);

    card.innerHTML = `
      <div class="character-icon" style="background: ${char.colors.primary}">
        <div class="character-icon-inner" style="background: ${char.colors.secondary}"></div>
      </div>
      <div class="character-name">${char.name}</div>
      <div class="character-tagline">${char.tagline}</div>
    `;

    // Hover tracking
    card.addEventListener('mouseenter', () => this.startHover(char.id));
    card.addEventListener('mouseleave', () => this.endCurrentHover());

    // Touch support
    card.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startHover(char.id);
    });

    // Selection
    card.addEventListener('click', () => this.selectCharacter(char.id, game));
    card.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (this.currentHover === char.id) {
        this.selectCharacter(char.id, game);
      }
    });

    return card;
  }

  startHover(characterId) {
    // End previous hover if any
    this.endCurrentHover();

    this.currentHover = characterId;
    this.currentHoverStart = Date.now();

    // Visual feedback
    this.cards.forEach(c => {
      if (c.id === characterId) {
        c.element.classList.add('hovered');
      } else {
        c.element.classList.remove('hovered');
      }
    });
  }

  endCurrentHover() {
    if (this.currentHover && this.currentHoverStart) {
      const duration = Date.now() - this.currentHoverStart;
      // Only record meaningful hovers (> 100ms)
      if (duration > 100) {
        this.hoverHistory.push({
          characterId: this.currentHover,
          startTime: this.currentHoverStart - this.startTime,
          duration
        });
      }
    }
    this.currentHover = null;
    this.currentHoverStart = 0;

    // Remove visual feedback
    this.cards.forEach(c => c.element.classList.remove('hovered'));
  }

  selectCharacter(characterId, game) {
    const selectTime = Date.now() - this.startTime;

    // End any current hover
    this.endCurrentHover();

    // Record selection in behavior tracker
    game.behavior.recordCharacterSelection(
      characterId,
      selectTime,
      this.hoverHistory
    );

    // Store selected character for the game
    game.selectedCharacter = characterId;
    game.currentMoment = 0;

    // Transition to garden state
    game.changeState('garden', { character: characterId });
  }

  injectStyles() {
    if (document.getElementById('character-select-styles')) return;

    const style = document.createElement('style');
    style.id = 'character-select-styles';
    style.textContent = `
      .character-select-overlay {
        padding: 40px 24px;
      }

      .character-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        max-width: 400px;
        width: 100%;
        margin-top: 32px;
      }

      @media (min-width: 600px) {
        .character-grid {
          grid-template-columns: repeat(4, 1fr);
          max-width: 700px;
          gap: 20px;
        }
      }

      .character-card {
        background: var(--bg-card);
        border-radius: 12px;
        padding: 20px 16px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
        box-shadow: 0 2px 8px var(--shadow);
      }

      .character-card:hover,
      .character-card.hovered {
        transform: translateY(-4px);
        border-color: var(--card-color);
        box-shadow: 0 8px 24px var(--shadow-hover);
      }

      .character-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        margin: 0 auto 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease;
      }

      .character-card:hover .character-icon,
      .character-card.hovered .character-icon {
        transform: scale(1.1);
      }

      .character-icon-inner {
        width: 24px;
        height: 24px;
        border-radius: 50%;
      }

      .character-name {
        font-family: var(--font-pixel);
        font-size: 1.1rem;
        color: var(--text);
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .character-tagline {
        font-size: 0.85rem;
        color: var(--text-muted);
        line-height: 1.4;
      }
    `;

    document.head.appendChild(style);
  }

  update(game, dt) {
    // No continuous updates needed
  }

  render(game, ctx) {
    // UI-based, no canvas rendering needed
  }
}
