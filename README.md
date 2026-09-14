# Hajer Web

Public website and assessment-request intake for [hajer.ai](https://hajer.ai).

A Next.js static export served from S3 + CloudFront, with the waitlist intake
(`POST /api/waitlist`) running as an AWS Lambda behind the same distribution. The
infrastructure lives in the `hajer` repo (`infra/modules/static-site`,
`infra/modules/waitlist-lambda`); this repo builds and deploys onto it.

## Development

```bash
corepack pnpm@10.34.5 install --frozen-lockfile
corepack pnpm@10.34.5 dev        # the site on :3000
corepack pnpm@10.34.5 dev:api    # the waitlist API on :8787 (second terminal)
```

`next dev` proxies `/api/*` to the local API and `/ingest/*` to PostHog (see
`next.config.ts`); in production CloudFront does both. `dev:api` reads `.env.local`;
with nothing configured, signups land in `.data/waitlist.jsonl`.

## Checks

```bash
corepack pnpm@10.34.5 boundary
corepack pnpm@10.34.5 test
corepack pnpm@10.34.5 lint
corepack pnpm@10.34.5 exec tsc --noEmit
corepack pnpm@10.34.5 build          # static export → out/
corepack pnpm@10.34.5 build:lambda   # waitlist bundle → dist-lambda/waitlist.zip
```

## Deployment

`.github/workflows/deploy.yml` deploys `main` to production (hajer.ai) and `develop` to
develop (develop-landing.hajer.ai): S3 sync, Lambda code update, CloudFront invalidation.
Each GitHub environment carries the variables `just landing-deploy-vars <env>` prints in
`hajer/infra` (`AWS_ROLE_ARN`, `AWS_REGION`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`,
`LAMBDA_FUNCTION_NAME`, `SITE_URL`); the role is assumed through GitHub OIDC.

Runtime configuration for the waitlist (Supabase, Gmail, …) is not in this repo or in the
Lambda's environment: it is read at cold start from SSM Parameter Store under
`/hajer/<env>/landing/<NAME>`, one `SecureString` per variable named exactly as in
`.env.example`. Never commit credentials or `.env.local`.
