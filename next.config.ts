import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

import { POSTHOG_ASSETS_HOST, POSTHOG_BROWSER_API_HOST, POSTHOG_HOST } from "./lib/posthog-config";

/**
 * The site ships as a static export to S3 + CloudFront (hajer/infra/modules/static-site).
 * Two things the app relies on cannot be static and are provided by CloudFront in
 * production, so they are configured here for `next dev` only:
 *
 *   - The PostHog reverse proxy: the browser SDK talks to same-origin /ingest so tracker
 *     blocklists never see *.posthog.com. In production three CloudFront behaviours forward
 *     /ingest/* to PostHog; here Next's rewrites do the same job.
 *   - The waitlist API: POST /api/waitlist runs as a Lambda behind CloudFront. Here it is
 *     proxied to the local server started by `pnpm dev:api` (lambda/waitlist/local.ts).
 */
const nextConfig = (phase: string): NextConfig => {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  const waitlistDevServer = process.env.WAITLIST_DEV_SERVER ?? "http://127.0.0.1:8787";

  return {
    // Every route is prerendered to out/; /privacy becomes out/privacy/index.html, which is the
    // layout the CloudFront viewer-request function resolves extensionless paths to.
    ...(dev ? {} : { output: "export", trailingSlash: true }),
    // Keep Turbopack's tracing scoped to this app.
    turbopack: {
      root: process.cwd(),
    },
    ...(dev
      ? {
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
              {
                source: "/api/:path*",
                destination: `${waitlistDevServer}/api/:path*`,
              },
            ];
          },
          // PostHog calls some endpoints with a trailing slash; without this Next would 308
          // them to the slash-less path and drop the POST body.
          skipTrailingSlashRedirect: true,
        }
      : {}),
  };
};

export default nextConfig;
