/* eslint-env browser */
import CookieMonster from '@firstandthird/cookie-monster';
import { show, hide, on, once, off, find, addClass, removeClass, fire, matches } from 'domassist';
import aug from 'aug';

const CLASSES = {
  OPEN: 'bounce-is-open'
};
const EVENTS = {
  OPEN: 'bounce:open',
  SHOW: 'bounce:show',
  HIDE: 'bounce:hide',
  PAUSE: 'bounce:pause',
  RESUME: 'bounce:resume',
};
const cookieName = 'bounce';
const cookieValue = true;
const cookieExpires = 30;

class BounceModal {
  constructor(options = {}) {
    this.openers = find('[data-bounce-open]');

    this.options = aug({}, {
      minOffset: 20,
      delay: 250,
      cookieName
    }, options);

    if (this.isDisabled() && !this.openers.length) {
      return;
    }

    this.handleMouseLeave = this.mouseLeave.bind(this);
    this.handleMouseEnter = this.mouseEnter.bind(this);
    this.handleKeyDown = this.keyDown.bind(this);
    this.handlePause = this.onPause.bind(this);
    this.handleResume = this.onResume.bind(this);
    this.handleHash = this.onHashChange.bind(this);
    this.elements = find('[data-bounce]');
    this.closers = find('[data-bounce-close]');
    this.delayTimer = null;
    this.paused = false;
    this.hashedElements = this.elements.filter(element => matches(element, '[data-bounce-enable-hash]'));

    if (this.elements.length) {
      this.bindEvents();
    }
  }

  bindEvents() {
    if (!this.isDisabled()) {
      on(document.documentElement, 'mouseleave', this.handleMouseLeave);
      on(document.documentElement, 'mouseenter', this.handleMouseEnter);
    }

    if (this.hashedElements.length) {
      this.onHashChange();
      on(window, 'hashchange', this.handleHash.bind(this));
    }

    on(document.documentElement, 'keydown', this.handleKeyDown);
    on(document.documentElement, EVENTS.PAUSE, this.handlePause);
    on(document.documentElement, EVENTS.RESUME, this.handleResume);
    on(document.documentElement, EVENTS.OPEN, this.fire.bind(this));
    on(this.openers, 'click', event => {
      event.preventDefault();
      this.fire();
    });
    once(this.closers, 'click', this.hide.bind(this));
  }

  unbindEvents() {
    document.documentElement.removeEventListener('mouseleave', this.handleMouseLeave);
    document.documentElement.removeEventListener('mouseenter', this.handleMouseEnter);
    off(document.documentElement, EVENTS.PAUSE, this.handlePause);
    off(document.documentElement, EVENTS.RESUME, this.handleResume);
  }

  onHashChange() {
    if (this.paused) {
      return;
    }

    const hash = location.hash.slice(1);
    const hashItems = this.hashedElements.filter(element => element.id === hash);

    if (!hashItems.length) {
      return;
    }

    this.disable();
    fire(document.documentElement, EVENTS.SHOW);
    addClass(document.documentElement, CLASSES.OPEN);
    show(hashItems);
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

    fire(document.documentElement, EVENTS.HIDE);
    removeClass(document.documentElement, CLASSES.OPEN);
    hide(this.elements);
  }

  fire() {
    if (this.paused) {
      return;
    }

    this.disable();
    fire(document.documentElement, EVENTS.SHOW);
    addClass(document.documentElement, CLASSES.OPEN);
    show(this.elements);
  }

  disable() {
    this.unbindEvents();
    CookieMonster.set(this.options.cookieName, cookieValue, cookieExpires);
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

    if (!event.metaKey || event.keyCode !== 76 || this.isDisabled()) {
      return;
    }

    this.delayTimer = setTimeout(this.fire.bind(this), this.options.delay);
  }

  isDisabled() {
    return !!CookieMonster.get(this.options.cookieName);
  }
}

BounceModal.autoRun = true;

window.addEventListener('DOMContentLoaded', () => {
  if (BounceModal.autoRun) {
    new BounceModal();
  }
});

export default BounceModal;
