/**
 * Function-URL event ⇄ Web Request/Response, plus the once-per-container
 * configuration load. Dependency-free on purpose: tests import this file
 * directly, index.ts wires in the SSM loader and the waitlist handler.
 */

/** The parts of the function-URL payload (format 2.0) the adapter reads. */
export interface FunctionUrlEvent {
  rawPath: string;
  rawQueryString?: string;
  headers?: Record<string, string | undefined>;
  body?: string;
  isBase64Encoded?: boolean;
  requestContext: { http: { method: string } };
}

export interface FunctionUrlResult {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  isBase64Encoded: false;
}

export interface HandlerOptions {
  /** Environment variables to apply before the first request; called once per container. */
  loadConfig: () => Promise<Record<string, string>>;
  /** The application: Request in, Response out. */
  dispatch: (request: Request) => Response | Promise<Response>;
  /** Shown to the visitor when the configuration cannot be loaded. */
  unavailableMessage: string;
}

export function toRequest(event: FunctionUrlEvent): Request {
  const method = event.requestContext.http.method.toUpperCase();
  const headers = new Headers();
  for (const [name, value] of Object.entries(event.headers ?? {})) {
    if (value !== undefined) headers.set(name, value);
  }
  const host = headers.get("host") ?? "lambda";
  const query = event.rawQueryString ? `?${event.rawQueryString}` : "";
  const body =
    event.body === undefined || method === "GET" || method === "HEAD"
      ? undefined
      : event.isBase64Encoded
        ? Buffer.from(event.body, "base64")
        : event.body;
  return new Request(`https://${host}${event.rawPath}${query}`, { method, headers, body });
}

export async function toResult(response: Response): Promise<FunctionUrlResult> {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, name) => {
    headers[name] = value;
  });
  return {
    statusCode: response.status,
    headers,
    body: await response.text(),
    isBase64Encoded: false,
  };
}

export function createHandler({ loadConfig, dispatch, unavailableMessage }: HandlerOptions) {
  let configured: Promise<void> | undefined;

  return async (event: FunctionUrlEvent): Promise<FunctionUrlResult> => {
    // One load per container, shared by concurrent invocations. Variables already in the
    // environment win. A failed load is retried on the next request instead of poisoning
    // the container.
    configured ??= loadConfig().then((config) => {
      for (const [name, value] of Object.entries(config)) {
        process.env[name] ??= value;
      }
    });
    try {
      await configured;
    } catch (error) {
      configured = undefined;
      const reason = error instanceof Error ? error.message : "unknown error";
      console.error(`[waitlist] configuration load failed: ${reason}`);
      return toResult(
        Response.json(
          { ok: false, code: "config_unavailable", message: unavailableMessage },
          { status: 503, headers: { "cache-control": "no-store" } },
        ),
      );
    }

    return toResult(await dispatch(toRequest(event)));
  };
}
