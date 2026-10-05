import { footer, hero } from "@/content/copy";
import { privacyPolicy, termsOfService } from "@/content/legal";
import { site } from "@/content/site";
import { llmsTxt } from "@/lib/seo";

// A plain-text summary for language-model crawlers (llmstxt.org). Every line
// is built from content/*, so it can never say more than the page does.
// Rendered once at build time: the site is a static export (next.config.ts).
export const dynamic = "force-static";

export function GET(): Response {
  const body = llmsTxt(
    site,
    hero.body,
    { email: footer.email, note: footer.emailNote },
    [privacyPolicy, termsOfService],
  );
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
