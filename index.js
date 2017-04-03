/* eslint-env browser */
import CookieMonster from '@firstandthird/cookie-monster';
import { show, hide, on, once, off, find } from 'domassist';
import aug from 'aug';

const cookieName = 'bounce';
const cookieValue = true;
const cookieExpires = 30;

class BounceModal {
  constructor(options = {}) {
    if (BounceModal.isDisabled()) {
      return;
    }

    this.options = aug({}, {
      minOffset: 20,
      delay: 250
    }, options);
    this.handleMouseLeave = this.mouseLeave.bind(this);
    this.handleMouseEnter = this.mouseEnter.bind(this);
    this.handleKeyDown = this.keyDown.bind(this);
    this.handlePause = this.onPause.bind(this);
    this.handleResume = this.onResume.bind(this);
    this.elements = find('[data-bounce]');
    this.closers = find('[data-bounce-close]');
    this.delayTimer = null;
    this.paused = false;

    if (this.elements.length) {
      this.bindEvents();
    }
  }

  bindEvents() {
    on(document.documentElement, 'mouseleave', this.handleMouseLeave);
    on(document.documentElement, 'mouseenter', this.handleMouseEnter);
    on(document.documentElement, 'keydown', this.handleKeyDown);
    on(document.documentElement, 'bounce:pause', this.handlePause);
    on(document.documentElement, 'bounce:resume', this.handleResume);
    once(this.closers, 'click', this.hide.bind(this));
  }

  unbindEvents() {
    off(document.documentElement, 'mouseleave', this.handleMouseLeave);
    off(document.documentElement, 'mouseenter', this.handleMouseEnter);
    off(document.documentElement, 'bounce:pause', this.handlePause);
    off(document.documentElement, 'bounce:resume', this.handleResume);
  }

  onPause() {
    this.paused = true;
  }

  onResume() {
    this.paused = false;
  }

  hide() {
    off(document.documentElement, 'keydown', this.handleKeyDown);
    hide(this.elements);
  }

  fire() {
    if (this.paused) {
      return;
    }

    this.disable();
    show(this.elements);
  }

  disable() {
    this.unbindEvents();
    CookieMonster.set(cookieName, cookieValue, cookieExpires);
  }

  mouseLeave(event) {
    if (event.clientY > this.options.minOffset) {
      return;
    }

    this.delayTimer = setTimeout(this.fire.bind(this), this.options.delay);
  }

  mouseEnter() {
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
  }

  keyDown(event) {
    if (event.keyCode === 27) {
      this.hide();
      return;
    }

    if (!event.metaKey || event.keyCode !== 76) {
      return;
    }

    this.delayTimer = setTimeout(this.fire.bind(this), this.options.delay);
  }

  static isDisabled() {
    return !!CookieMonster.get(cookieName);
  }
}

BounceModal.autoRun = true;

window.addEventListener('DOMContentLoaded', () => {
  if (BounceModal.autoRun) {
    new BounceModal();
  }
});

export default BounceModal;
