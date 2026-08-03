# Hajer Web

Public website and assessment-request intake for [hajer.ai](https://hajer.ai).

## Development

```bash
corepack pnpm@10.34.5 install --frozen-lockfile
corepack pnpm@10.34.5 dev
```

## Checks

```bash
corepack pnpm@10.34.5 boundary
corepack pnpm@10.34.5 test
corepack pnpm@10.34.5 lint
corepack pnpm@10.34.5 exec tsc --noEmit
corepack pnpm@10.34.5 build
```

Deployment values belong in Vercel or the local environment. Never commit credentials or `.env.local`.
