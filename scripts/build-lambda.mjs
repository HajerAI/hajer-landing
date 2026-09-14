// Bundles the waitlist Lambda (and its local dev server) with esbuild into dist-lambda/ and
// zips the Lambda entry for `aws lambda update-function-code`. The AWS SDK is left external:
// the nodejs22.x runtime ships it.
import { execFileSync } from "node:child_process";
import { rm } from "node:fs/promises";

import { build } from "esbuild";

await rm("dist-lambda", { recursive: true, force: true });

await build({
  entryPoints: { index: "lambda/waitlist/index.ts", local: "lambda/waitlist/local.ts" },
  outdir: "dist-lambda",
  outExtension: { ".js": ".mjs" },
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  external: ["@aws-sdk/*"],
  // Bundled CommonJS dependencies may call require(); give the ESM bundle one.
  banner: {
    js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
  },
  logLevel: "info",
});

execFileSync("zip", ["-j", "-q", "dist-lambda/waitlist.zip", "dist-lambda/index.mjs"], {
  stdio: "inherit",
});
console.log("dist-lambda/waitlist.zip");
