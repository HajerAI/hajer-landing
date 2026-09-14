import type { NextConfig } from "next";

import { POSTHOG_ASSETS_HOST, POSTHOG_BROWSER_API_HOST, POSTHOG_HOST } from "./lib/posthog-config";

const nextConfig: NextConfig = {
  // Vercel builds this app from the `web` root even though the repository also
  // contains Replit's workspace. Keep Turbopack's tracing scoped to this app.
  turbopack: {
    root: process.cwd(),
  },
  // First-party proxy for posthog-js so tracker blocklists never see
  // *.posthog.com. Static bundles and /array (the SDK's own lazy-loaded
  // scripts and remote config) live on the assets host; everything else
  // (events, flags) goes to the ingestion host.
  async rewrites() {
    return [
      {
        source: `${POSTHOG_BROWSER_API_HOST}/static/:path*`,
        destination: `${POSTHOG_ASSETS_HOST}/static/:path*`,
      },
      {
        source: `${POSTHOG_BROWSER_API_HOST}/array/:path*`,
        destination: `${POSTHOG_ASSETS_HOST}/array/:path*`,
      },
      {
        source: `${POSTHOG_BROWSER_API_HOST}/:path*`,
        destination: `${POSTHOG_HOST}/:path*`,
      },
    ];
  },
  // PostHog calls some endpoints with a trailing slash; without this Next
  // would 308 them to the slash-less path and drop the POST body.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
