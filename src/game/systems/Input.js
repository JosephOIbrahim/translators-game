/**
 * Input System — The Translators
 * 
 * Handles mouse and touch input, routes to game.
 */

export class Input {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;

    // Current pointer position
    this.x = 0;
    this.y = 0;
    this.isDown = false;

    // Keyboard state
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      space: false,
      e: false
    };

    // Bind event handlers
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    // Attach listeners
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mouseup', this.onMouseUp);
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.canvas.addEventListener('touchend', this.onTouchEnd);
    document.addEventListener('click', this.onClick);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  onMouseMove(e) {
    this.x = e.clientX;
    this.y = e.clientY;
    this.game.onPointerMove(this.x, this.y);
  }

  onMouseDown(e) {
    this.isDown = true;
    this.x = e.clientX;
    this.y = e.clientY;
    this.game.onPointerDown(this.x, this.y);
  }

  onMouseUp(e) {
    this.isDown = false;
    this.game.onPointerUp();
  }

  onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.x = touch.clientX;
    this.y = touch.clientY;
    this.game.onPointerMove(this.x, this.y);
  }

  onTouchStart(e) {
    e.preventDefault();
    this.isDown = true;
    const touch = e.touches[0];
    this.x = touch.clientX;
    this.y = touch.clientY;
    this.game.onPointerMove(this.x, this.y);
    this.game.onPointerDown(this.x, this.y);
  }

  onTouchEnd(e) {
    this.isDown = false;
    this.game.onPointerUp();
  }

  onClick(e) {
    this.game.onClick(e.clientX, e.clientY);
  }

  onKeyDown(e) {
    const key = this.mapKey(e.code);
    if (key) {
      this.keys[key] = true;
      this.game.onKeyDown(key);
    }
  }

  onKeyUp(e) {
    const key = this.mapKey(e.code);
    if (key) {
      this.keys[key] = false;
      this.game.onKeyUp(key);
    }
  }

  /**
   * Map key codes to logical keys
   */
  mapKey(code) {
    const map = {
      'KeyW': 'up',
      'ArrowUp': 'up',
      'KeyS': 'down',
      'ArrowDown': 'down',
      'KeyA': 'left',
      'ArrowLeft': 'left',
      'KeyD': 'right',
      'ArrowRight': 'right',
      'Space': 'space',
      'KeyE': 'e'
    };
    return map[code];
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('touchmove', this.onTouchMove);
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.canvas.removeEventListener('touchend', this.onTouchEnd);
    document.removeEventListener('click', this.onClick);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
