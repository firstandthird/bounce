import Bounce from '../index';
import CookieMonster from '@firstandthird/cookie-monster';
import test from 'tape-rollup';
import { fire } from 'domassist';

const className = 'bounce-is-open';
const cookieName = 'bounce';
let bounceModal;
let modalEl;

const init = () => {
  const container = document.createElement('div');
  container.id = 'fixture';
  document.body.appendChild(container);
};

const setup = () => {
  const container = document.getElementById('fixture');
  container.innerHTML = `
    <div id="opener" data-bounce-open></div>
    <div id="modal" data-bounce style="display: none">
      <div id="closer" data-bounce-close></div>
    </div>
  `;

  modalEl = document.getElementById('modal');
  bounceModal = new Bounce();
};

const teardown = () => {
  bounceModal.unbindEvents();
  document.documentElement.classList.remove(className);
  CookieMonster.remove(cookieName);
};

init();

test('Bounce exists', assert => {
  assert.equal(typeof Bounce, 'function', 'class exists');
  assert.equal(Bounce.autoRun, true, 'autorun is true');
  assert.end();
});

test('Shows element', assert => {
  setup();
  assert.equal(modalEl.style.display, 'none', 'element is hidden');
  assert.notOk(document.documentElement.classList.contains(className), 'document doesn\'t have open class');
  bounceModal.fire();
  assert.equal(modalEl.style.display, 'block', 'element is shown after firing');
  assert.ok(document.documentElement.classList.contains(className), 'document has open class');
  assert.end();
  teardown();
});

test('Fired events', assert => {
  setup();
  assert.plan(2);
  const eventHandler = () => { assert.pass('Event fired'); };
  document.documentElement.addEventListener('bounce:show', eventHandler);
  document.documentElement.addEventListener('bounce:hide', eventHandler);
  bounceModal.fire();
  bounceModal.hide();
  document.documentElement.removeEventListener('bounce:show', eventHandler);
  document.documentElement.removeEventListener('bounce:hide', eventHandler);
  assert.end();
  teardown();
});

test('Shows element with data-bounce-open', assert => {
  setup();
  const opener = document.getElementById('opener');
  assert.equal(modalEl.style.display, 'none', 'element is hidden');
  opener.click();
  assert.equal(modalEl.style.display, 'block', 'element is shown after firing');
  assert.end();
  teardown();
});

test('Pause event', assert => {
  setup();
  assert.equal(modalEl.style.display, 'none', 'element is hidden');
  fire(document.documentElement, 'bounce:pause');
  bounceModal.fire();
  assert.equal(modalEl.style.display, 'none', 'element is hidden after firing');
  assert.end();
  teardown();
});

test('Resume event', assert => {
  setup();
  assert.equal(modalEl.style.display, 'none', 'element is hidden');
  fire(document.documentElement, 'bounce:pause');
  bounceModal.fire();
  assert.equal(modalEl.style.display, 'none', 'element is hidden after firing');
  fire(document.documentElement, 'bounce:resume');
  bounceModal.fire();
  assert.equal(modalEl.style.display, 'block', 'element is shown resuming and firing again');
  assert.end();
  teardown();
});

test('Hides with Escape', assert => {
  setup();
  assert.equal(modalEl.style.display, 'none', 'element is hidden');
  bounceModal.fire();
  assert.equal(modalEl.style.display, 'block', 'element is shown after firing');
  bounceModal.handleKeyDown({ keyCode: 27 });
  assert.equal(modalEl.style.display, 'none', 'element is hidden');
  assert.end();
  teardown();
});

test('Hides element', assert => {
  setup();
  assert.equal(modalEl.style.display, 'none', 'element is hidden');
  assert.notOk(document.documentElement.classList.contains(className), 'document doesn\'t have open class');
  bounceModal.fire();
  assert.equal(modalEl.style.display, 'block', 'element is shown after firing');
  assert.ok(document.documentElement.classList.contains(className), 'document doesn\'t have open class');
  const closeButton = document.getElementById('closer');
  closeButton.click();
  assert.equal(modalEl.style.display, 'none', 'element is hidden after clicking');
  assert.notOk(document.documentElement.classList.contains(className), 'document doesn\'t have open class');
  assert.end();
  teardown();
});


test('Doesn\'t get shown twice', assert => {
  setup();
  assert.equal(modalEl.style.display, 'none', 'element is hidden');
  bounceModal.fire();
  assert.equal(modalEl.style.display, 'block', 'element is shown after firing');
  assert.end();
  teardown();
});

test('Mouseleave', assert => {
  setup();
  assert.equal(modalEl.style.display, 'none', 'element is hidden');
  bounceModal.mouseLeave({ clientY: 21 });
  assert.equal(bounceModal.delayTimer, null, 'doesn\'t fire if scroll is not small enough');
  bounceModal.mouseLeave({ clientY: 19 });
  assert.notEqual(bounceModal.delayTimer, null, 'fire if scroll is small enough');
  bounceModal.mouseEnter();
  assert.equal(bounceModal.delayTimer, null, 'will clear timeout if mouse enters again before 0 seconds');
  assert.equal(modalEl.style.display, 'none', 'element is hidden');
  bounceModal.mouseLeave({ clientY: 19 });

  setTimeout(() => {
    assert.equal(modalEl.style.display, 'block', 'element is shown');
    assert.end();
    teardown();
  }, 251);
});

test('Keydown', assert => {
  setup();
  assert.equal(modalEl.style.display, 'none', 'element is hidden');
  bounceModal.keyDown({ metaKey: false, keyCode: 76 });
  assert.equal(bounceModal.delayTimer, null, 'doesn\'t combination isn\'t metakey + L');
  bounceModal.keyDown({ metaKey: true, keyCode: 78 });
  assert.equal(bounceModal.delayTimer, null, 'doesn\'t combination isn\'t metakey + L');
  bounceModal.keyDown({ metaKey: true, keyCode: 76 });
  assert.notEqual(bounceModal.delayTimer, null, 'fire if combination is correct');

  setTimeout(() => {
    assert.equal(modalEl.style.display, 'block', 'element is shown');
    assert.end();
    teardown();
  }, 251);
});

test('Creates cookie', assert => {
  setup();
  assert.equal(CookieMonster.get(cookieName), null, 'cookie doesn\'t exist');
  bounceModal.fire();
  assert.equal(CookieMonster.get(cookieName), 'true', 'cookie does exist after firing');
  assert.end();
  teardown();
});
