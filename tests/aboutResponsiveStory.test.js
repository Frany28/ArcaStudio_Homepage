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

  assert.match(source, /autoPlay=\{shouldPlay\}/);
  assert.match(source, /\n\s+muted\n/);
  assert.match(source, /\n\s+playsInline\n/);
  assert.match(source, /webkit-playsinline=""/);
  assert.match(source, /type="video\/mp4"/);
  assert.match(source, /type="video\/webm"/);
  assert.match(source, /poster=\{aboutHero\}/);
  assert.match(source, /useReducedMotion\(\)/);
});

test("responsive About playback retries media readiness and first interaction", async () => {
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
});
