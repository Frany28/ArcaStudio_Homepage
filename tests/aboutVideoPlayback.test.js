import assert from "node:assert/strict";
import test from "node:test";

import { connectAboutVideoPlayback } from "../src/pages/publicSite/about/utils/aboutVideoPlayback.js";

function createTarget() {
  const listeners = {};

  return {
    hidden: false,
    listeners,
    addEventListener(type, listener) {
      listeners[type] = listener;
    },
    removeEventListener(type) {
      delete listeners[type];
    },
  };
}

test("About playback reports an iOS autoplay rejection and retries on touch", async () => {
  const documentTarget = createTarget();
  const attributes = {};
  let attempts = 0;
  let blocked = 0;
  let started = 0;
  const video = {
    ...createTarget(),
    pause() {},
    play() {
      attempts += 1;
      return attempts === 1
        ? Promise.reject(new Error("autoplay blocked"))
        : Promise.resolve();
    },
    setAttribute(name, value) {
      attributes[name] = value;
    },
  };

  const cleanup = connectAboutVideoPlayback(video, {
    documentTarget,
    interactionTarget: documentTarget,
    onPlaybackBlocked: () => { blocked += 1; },
    onPlaybackStarted: () => { started += 1; },
  });

  await Promise.resolve();
  assert.equal(blocked, 1);
  assert.equal(started, 0);
  assert.equal(video.muted, true);
  assert.equal(attributes.playsinline, "");
  assert.equal(attributes["webkit-playsinline"], "");

  documentTarget.listeners.touchstart();
  await Promise.resolve();
  assert.equal(started, 1);

  cleanup();
  assert.deepEqual(video.listeners, {});
  assert.deepEqual(documentTarget.listeners, {});
});
