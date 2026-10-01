import assert from "node:assert/strict";
import test from "node:test";

import {
  connectAboutDirectionalScrollGate,
  getAboutStoryEntryDirection,
} from "../src/pages/publicSite/about/utils/aboutDirectionalScrollGate.js";

function createTarget() {
  const listeners = {};

  return {
    listeners,
    addEventListener(type, listener) {
      listeners[type] = listener;
    },
    removeEventListener(type) {
      delete listeners[type];
    },
  };
}

function createFixture(stageViewportTop = 50) {
  const scroller = {
    ...createTarget(),
    scrollTop: 150,
    getBoundingClientRect: () => ({ top: 0 }),
  };
  const stage = {
    closest: () => scroller,
    getBoundingClientRect: () => ({ top: stageViewportTop }),
  };

  return { scroller, stage };
}

test("About detects whether the story was entered from above or Contact", () => {
  assert.equal(getAboutStoryEntryDirection(createFixture(50).stage), "forward");
  assert.equal(getAboutStoryEntryDirection(createFixture(-50).stage), "reverse");
});

test("forward About gate blocks downward progress and allows upward exit", () => {
  const { scroller, stage } = createFixture();
  const windowTarget = createTarget();
  const cleanup = connectAboutDirectionalScrollGate(
    stage,
    "forward",
    { windowTarget },
  );

  assert.equal(scroller.scrollTop, 200);

  let prevented = 0;
  const createEvent = (deltaY) => ({
    deltaY,
    preventDefault() { prevented += 1; },
    stopPropagation() {},
  });

  scroller.listeners.wheel(createEvent(-20));
  assert.equal(prevented, 0);

  scroller.listeners.wheel(createEvent(20));
  assert.equal(prevented, 1);

  scroller.scrollTop = 260;
  scroller.listeners.scroll();
  assert.equal(scroller.scrollTop, 200);

  scroller.scrollTop = 180;
  scroller.listeners.scroll();
  assert.equal(scroller.scrollTop, 180);

  scroller.listeners.touchstart({ touches: [{ clientY: 100 }] });
  scroller.listeners.touchmove({
    ...createEvent(0),
    touches: [{ clientY: 80 }],
  });
  assert.equal(prevented, 2);

  cleanup();
  assert.deepEqual(scroller.listeners, {});
  assert.deepEqual(windowTarget.listeners, {});
});

test("reverse About gate blocks upward progress and allows return to Contact", () => {
  const { scroller, stage } = createFixture(-50);
  const windowTarget = createTarget();
  connectAboutDirectionalScrollGate(stage, "reverse", { windowTarget });

  let prevented = 0;
  const createEvent = (deltaY) => ({
    deltaY,
    preventDefault() { prevented += 1; },
    stopPropagation() {},
  });

  scroller.listeners.wheel(createEvent(20));
  assert.equal(prevented, 0);

  scroller.listeners.wheel(createEvent(-20));
  assert.equal(prevented, 1);

  scroller.scrollTop = 40;
  scroller.listeners.scroll();
  assert.equal(scroller.scrollTop, 100);

  scroller.scrollTop = 130;
  scroller.listeners.scroll();
  assert.equal(scroller.scrollTop, 130);

  scroller.listeners.touchstart({ touches: [{ clientY: 100 }] });
  scroller.listeners.touchmove({
    ...createEvent(0),
    touches: [{ clientY: 120 }],
  });
  assert.equal(prevented, 2);
});
