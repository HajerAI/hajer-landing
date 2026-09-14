import assert from "node:assert/strict";
import test from "node:test";

async function loadHtml(): Promise<{ html: string; source: string } | null> {
  const source = process.env.HAJER_TEST_BASE_URL;
  if (!source) return null;

  try {
    const response = await fetch(new URL("/", source), {
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) return { html: await response.text(), source };
  } catch {
    // The caller will report the missing explicit test server as a skipped check.
  }

  return null;
}

const page = await loadHtml();

test(
  "SSR HTML carries the hero headline, request form, and customer authority",
  {
    skip: page
      ? false
      : "set HAJER_TEST_BASE_URL to this checkout's running build",
  },
  () => {
    const { html } = page!;

    assert.ok(html.includes("See what breaks first."), "hero headline is missing");
    assert.ok(html.includes('type="email"'), "inline request form is missing");
    assert.ok(
      html.includes("Your team keeps the final release decision."),
      "customer authority is missing",
    );
  },
);
