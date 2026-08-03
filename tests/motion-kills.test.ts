import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("the active stylesheet uses one left-to-right assessment motion system", () => {
  assert.match(css, /@keyframes rw-packet-success/);
  assert.match(css, /@keyframes rw-packet-blocked/);
  assert.doesNotMatch(css, /@keyframes rw-from-current/);
  assert.doesNotMatch(page, /ScrollSpine/);
});

test("assessment replay settles under reduced motion", () => {
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\.rw-packet-success,[\s\S]*\.rw-packet-blocked[\s\S]*animation: none !important/);
  assert.doesNotMatch(css, /\.reveal\s*\{/);
});
