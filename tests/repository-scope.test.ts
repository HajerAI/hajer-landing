import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";

const run = promisify(execFile);
const verifier = new URL("../scripts/verify-repository-scope.mjs", import.meta.url);

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), "hajer-scope-"));
  await mkdir(path.join(root, "app"));
  await writeFile(path.join(root, "package.json"), "{}\n");
  await writeFile(path.join(root, "app", "page.tsx"), "export default function Page() {}\n");
  return root;
}

async function verify(root: string) {
  return run(process.execPath, [verifier.pathname, root]);
}

test("repository scope accepts the public application tree", async () => {
  const root = await fixture();
  const result = await verify(root);
  assert.match(result.stdout, /PASS/);
});

test("repository scope rejects unknown roots and unsafe file forms", async () => {
  for (const mutate of [
    async (root: string) => mkdir(path.join(root, "unknown")),
    async (root: string) => symlink(path.join(root, "package.json"), path.join(root, "app", "linked.json")),
    async (root: string) => writeFile(path.join(root, "app", "bundle.js.map"), "{}"),
    async (root: string) => writeFile(path.join(root, "app", "data.jsonl"), "{}\n"),
    async (root: string) => writeFile(path.join(root, "app", "bundle.zip"), "not an archive"),
  ]) {
    const root = await fixture();
    await mutate(root);
    await assert.rejects(verify(root));
  }
});
