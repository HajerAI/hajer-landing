import { lstat, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? process.cwd());
const allowedRootEntries = new Set([
  ".agents", // committed agent skills (PostHog integration), the same set as .claude
  ".claude", // committed agent skills (PostHog integration)
  ".env.example",
  ".github",
  ".gitignore",
  "README.md",
  "app",
  "components",
  "content",
  "eslint.config.mjs",
  "instrumentation-client.ts", // Next.js requires this file at the project root
  "lambda", // waitlist API entry points (AWS Lambda + local dev server)
  "lib",
  "next.config.ts",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "postcss.config.mjs",
  "public",
  "scripts",
  "supabase",
  "tests",
  "tsconfig.json",
]);
// Local-only artefacts: gitignored, never reach CI, but present on a developer
// machine (README tells contributors to create .env.local).
const localOnlyRootEntries = new Set([
  ".git",
  ".next",
  "out", // next build (static export)
  "dist-lambda", // pnpm build:lambda
  "node_modules",
  "next-env.d.ts",
  "tsconfig.tsbuildinfo",
  ".env.local",
  ".data", // local waitlist sink (lib/waitlist/destination.ts), gitignored
  ".DS_Store",
]);
const forbiddenExtensions = new Set([".7z", ".gz", ".jsonl", ".map", ".rar", ".tar", ".tgz", ".zip"]);
const failures = [];

for (const entry of await readdir(root)) {
  if (localOnlyRootEntries.has(entry)) continue;
  if (!allowedRootEntries.has(entry)) failures.push(`unexpected root entry: ${entry}`);
}

async function visit(directory) {
  for (const entry of await readdir(directory)) {
    if (entry === "node_modules" || (directory === root && localOnlyRootEntries.has(entry))) continue;
    const absolute = path.join(directory, entry);
    const relative = path.relative(root, absolute);
    const metadata = await lstat(absolute);
    if (metadata.isSymbolicLink()) {
      failures.push(`symbolic link: ${relative}`);
      continue;
    }
    if (metadata.isDirectory()) {
      await visit(absolute);
      continue;
    }
    if (!metadata.isFile()) {
      failures.push(`non-file entry: ${relative}`);
      continue;
    }
    if (metadata.size > 5 * 1024 * 1024) failures.push(`file exceeds 5 MB: ${relative}`);
    if (forbiddenExtensions.has(path.extname(entry).toLowerCase())) {
      failures.push(`forbidden file type: ${relative}`);
    }
  }
}

await visit(root);
if (failures.length > 0) {
  process.stderr.write(`${failures.join("\n")}\n`);
  process.exit(1);
}
process.stdout.write("repository scope: PASS\n");
