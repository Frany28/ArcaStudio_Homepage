import assert from "node:assert/strict";
import test from "node:test";

import {
  getAboutVideoScrollProgress,
  seekAboutVideo,
} from "../src/pages/publicSite/about/utils/aboutVideoScroll.js";

function createGeometry(scrollTop) {
  const scroller = {
    clientHeight: 700,
    scrollTop,
    getBoundingClientRect: () => ({ top: 0 }),
  };
  const track = {
    offsetHeight: 4200,
    getBoundingClientRect: () => ({ top: 2000 - scrollTop }),
  };

  return { scroller, track };
}

test("About video scroll progress stays pinned to its native track", () => {
  assert.equal(getAboutVideoScrollProgress(createGeometry(1900)), 0);
  assert.equal(getAboutVideoScrollProgress(createGeometry(2000)), 0);
  assert.equal(getAboutVideoScrollProgress(createGeometry(3750)), 0.5);
  assert.equal(getAboutVideoScrollProgress(createGeometry(5500)), 1);
  assert.equal(getAboutVideoScrollProgress(createGeometry(5700)), 1);
});

test("About video seek follows scroll in both directions", () => {
  const video = {
    currentTime: 0,
    duration: 20,
    readyState: 1,
  };

  assert.equal(seekAboutVideo(video, 0.75), true);
  const forwardTime = video.currentTime;
  assert.ok(forwardTime > 14.9 && forwardTime < 15);

  assert.equal(seekAboutVideo(video, 0.25), true);
  assert.ok(video.currentTime < forwardTime);
  assert.ok(video.currentTime > 4.9 && video.currentTime < 5);
});

test("About video waits for metadata before seeking", () => {
  const video = {
    currentTime: 0,
    duration: Number.NaN,
    readyState: 0,
  };

  assert.equal(seekAboutVideo(video, 0.5), false);
  assert.equal(video.currentTime, 0);
});
