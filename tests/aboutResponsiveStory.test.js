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
  assert.match(source, /h-\[600svh\]/);
  assert.match(source, /sticky top-0 h-\[100svh\]/);
  assert.doesNotMatch(source, /autoPlay/);
  assert.doesNotMatch(source, /\n\s+loop\n/);
});

test("responsive About scrubs with native scroll and owns no touch or wheel gestures", async () => {
  const source = await readSource(
    "../src/pages/publicSite/about/utils/aboutVideoScroll.js",
  );

  assert.match(source, /scroller\.addEventListener\("scroll"/);
  assert.match(source, /video\.currentTime = targetTime/);
  assert.doesNotMatch(source, /preventDefault/);
  assert.doesNotMatch(source, /"touchstart"|"touchmove"|"wheel"/);
});
