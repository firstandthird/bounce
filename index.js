/* eslint-env browser */
import CookieMonster from '@firstandthird/cookie-monster';
import { show, hide, on, once, off, find, addClass, removeClass, fire } from 'domassist';
import aug from 'aug';

const CLASSES = {
  OPEN: 'bounce-is-open'
};
const cookieName = 'bounce';
const cookieValue = true;
const cookieExpires = 30;

class BounceModal {
  constructor(options = {}) {
    this.openers = find('[data-bounce-open]');

    if (BounceModal.isDisabled() && !this.openers.length) {
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
    if (!BounceModal.isDisabled()) {
      on(document.documentElement, 'mouseleave', this.handleMouseLeave);
      on(document.documentElement, 'mouseenter', this.handleMouseEnter);
    }

    on(document.documentElement, 'keydown', this.handleKeyDown);
    on(document.documentElement, 'bounce:pause', this.handlePause);
    on(document.documentElement, 'bounce:resume', this.handleResume);
    on(this.openers, 'click', e => {
      e.preventDefault();
      this.fire();
    });
    once(this.closers, 'click', this.hide.bind(this));
  }

  unbindEvents() {
    document.documentElement.removeEventListener('mouseleave', this.handleMouseLeave);
    document.documentElement.removeEventListener('mouseenter', this.handleMouseEnter);
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
    if (!this.openers.length) {
      off(document.documentElement, 'keydown', this.handleKeyDown);
    }

    fire(document.documentElement, 'bounce:hide');
    removeClass(document.documentElement, CLASSES.OPEN);
    hide(this.elements);
  }

  fire() {
    if (this.paused) {
      return;
    }

    this.disable();
    fire(document.documentElement, 'bounce:show');
    addClass(document.documentElement, CLASSES.OPEN);
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

    if (!event.metaKey || event.keyCode !== 76 || BounceModal.isDisabled()) {
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
