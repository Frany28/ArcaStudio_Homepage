import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (relativePath) =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

test("About selects the responsive video story through 1024px and preserves desktop AboutStory", async () => {
  const source = await readSource(
    "../src/pages/publicSite/about/components/AboutSection.jsx",
  );

  assert.match(source, /<AboutResponsiveStory \/>/);
  assert.match(
    source,
    /className="w-full min-\[1025px\]:hidden"[\s\S]*<AboutResponsiveStory \/>/,
  );
  assert.match(
    source,
    /className="hidden w-full min-\[1025px\]:block"[\s\S]*<AboutStory/,
  );
});

test("responsive About video keeps inline muted playback and both source formats", async () => {
  const source = await readSource(
    "../src/pages/publicSite/about/components/AboutResponsiveStory.jsx",
  );

  assert.match(source, /\n\s+muted\n/);
  assert.match(source, /\n\s+playsInline\n/);
  assert.match(source, /webkit-playsinline=""/);
  assert.match(source, /type="video\/mp4"/);
  assert.match(source, /type="video\/webm"/);
  assert.match(source, /poster=\{aboutHero\}/);
  assert.match(source, /useReducedMotion\(\)/);
  assert.match(source, /autoPlay=\{shouldPlay\}/);
  assert.match(source, /onEnded=\{\(\) => setVideoCompleted\(true\)\}/);
  assert.match(source, /onCanPlay=\{\(\) => setVideoReady\(true\)\}/);
  assert.match(source, /onPlaying=/);
  assert.match(source, /Reproducir video/);
  assert.match(source, /playbackBlocked && shouldPlay/);
  assert.doesNotMatch(source, /\n\s+loop\n/);
});

test("responsive About retries playback without taking ownership of scrolling", async () => {
  const source = await readSource(
    "../src/pages/publicSite/about/utils/aboutVideoPlayback.js",
  );

  for (const eventName of [
    "canplay",
    "loadeddata",
    "loadedmetadata",
    "touchstart",
    "pointerdown",
  ]) {
    assert.match(source, new RegExp(`"${eventName}"`));
  }
  assert.doesNotMatch(source, /preventDefault/);
  assert.doesNotMatch(source, /"touchmove"|"wheel"/);
  assert.match(source, /onPlaybackBlocked/);
  assert.match(source, /onPlaybackStarted/);
});

test("responsive About gates the active travel direction until video completion", async () => {
  const componentSource = await readSource(
    "../src/pages/publicSite/about/components/AboutResponsiveStory.jsx",
  );
  const gateSource = await readSource(
    "../src/pages/publicSite/about/utils/aboutDirectionalScrollGate.js",
  );

  assert.match(componentSource, /connectAboutDirectionalScrollGate\(/);
  assert.match(componentSource, /getAboutStoryEntryDirection\(stage\)/);
  assert.match(componentSource, /playbackDirection/);
  assert.match(componentSource, /!videoCompleted/);
  assert.match(gateSource, /direction === "reverse"/);
  assert.match(gateSource, /event\.deltaY < 0 : event\.deltaY > 0/);
  assert.match(gateSource, /currentY > touchStartY/);
  assert.match(gateSource, /currentY < touchStartY/);
  assert.match(gateSource, /keepStoryAtBoundary/);
  assert.match(gateSource, /addEventListener\("scroll"/);
  assert.match(gateSource, /event\.preventDefault\(\)/);
  assert.match(componentSource, /useLayoutEffect/);
});

test("responsive About uses dedicated reversed clips when entering from Contact", async () => {
  const source = await readSource(
    "../src/pages/publicSite/about/components/AboutResponsiveStory.jsx",
  );

  assert.match(source, /about-story-mobile-reverse\.mp4/);
  assert.match(source, /about-story-mobile-reverse\.webm/);
  assert.match(source, /about-story-tablet-reverse\.mp4/);
  assert.match(source, /about-story-tablet-reverse\.webm/);
  assert.match(source, /playbackDirection === "reverse"/);
});

test("responsive About restarts an unfinished video after leaving either way", async () => {
  const source = await readSource(
    "../src/pages/publicSite/about/components/AboutResponsiveStory.jsx",
  );

  assert.match(
    source,
    /video && leftStory && !videoCompleted/,
  );
  assert.match(source, /video\.pause\(\);[\s\S]*video\.currentTime = 0/);
});
