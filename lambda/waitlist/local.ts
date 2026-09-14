import { createServer } from "node:http";

import { GET, POST } from "../../lib/waitlist/handler";

/**
 * The waitlist handler as a plain HTTP server for `next dev`, which proxies
 * /api/* here (next.config.ts). Start it with `pnpm dev:api`; it reads
 * .env.local like Next does, and with nothing configured the library falls
 * back to the .data/waitlist.jsonl sink outside production.
 */
const port = Number(process.env.PORT ?? 8787);

createServer(async (incoming, outgoing) => {
  const chunks: Buffer[] = [];
  for await (const chunk of incoming) chunks.push(chunk as Buffer);

  const headers = new Headers();
  for (const [name, value] of Object.entries(incoming.headers)) {
    if (typeof value === "string") headers.set(name, value);
    else if (Array.isArray(value)) headers.set(name, value.join(", "));
  }
  const method = (incoming.method ?? "GET").toUpperCase();
  const request = new Request(`http://${incoming.headers.host ?? "localhost"}${incoming.url ?? "/"}`, {
    method,
    headers,
    body: method === "GET" || method === "HEAD" ? undefined : Buffer.concat(chunks),
  });

  const response =
    new URL(request.url).pathname !== "/api/waitlist"
      ? Response.json({ ok: false, code: "not_found" }, { status: 404 })
      : method === "POST"
        ? await POST(request)
        : GET();

  outgoing.writeHead(response.status, Object.fromEntries(response.headers));
  outgoing.end(Buffer.from(await response.arrayBuffer()));
}).listen(port, "127.0.0.1", () => {
  console.log(`waitlist API listening on http://127.0.0.1:${port}/api/waitlist`);
});
