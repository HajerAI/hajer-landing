import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("the stylesheet carries no decorative motion system", () => {
  assert.doesNotMatch(css, /@keyframes rw-|\.runway-|\.rw-packet/);
  assert.doesNotMatch(css, /@keyframes accordion-|\.accordion-content/);
  assert.doesNotMatch(css, /\.reveal\s*\{/);
  assert.doesNotMatch(page, /ScrollSpine|RunwayBand/);
});

test("smooth scrolling still yields to reduced motion", () => {
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*scroll-behavior: auto/);
});
