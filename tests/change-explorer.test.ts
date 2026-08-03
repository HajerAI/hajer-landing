import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const copy = (await import(
  new URL("../content/copy.ts", import.meta.url).href
)) as typeof import("../content/copy");
const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const explorerSource = await readFile(
  new URL("../components/sections/ChangeExplorer.tsx", import.meta.url),
  "utf8",
);

test("the public page restores the eight-case change explorer", () => {
  assert.match(pageSource, /<ChangeExplorer \/>/);
  assert.equal(copy.changeExplorer.headline, "See what breaks.");
  assert.equal(copy.changeExplorer.patterns.length, 8);
  assert.equal(copy.changeExplorer.patterns[4].name, "Silent truncation");
  assert.match(explorerSource, /aria-pressed/);
  assert.match(explorerSource, /Choose a change pattern/);
});

test("the explorer is explicitly illustrative", () => {
  const publicExplorer = JSON.stringify({
    changeExplorer: copy.changeExplorer,
    changeDiffLabels: copy.changeDiffLabels,
    changeDiffs: copy.changeDiffs,
  });
  assert.match(publicExplorer, /illustrative patterns/i);
  assert.match(publicExplorer, /not customer results/i);
});
