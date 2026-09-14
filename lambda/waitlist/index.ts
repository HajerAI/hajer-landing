import { GetParametersByPathCommand, SSMClient } from "@aws-sdk/client-ssm";

import { GET, MESSAGES, POST } from "../../lib/waitlist/handler";
import { createHandler } from "./adapter";

/**
 * AWS Lambda entry point for the waitlist handler, invoked through a function
 * URL that only CloudFront may call (hajer/infra/modules/waitlist-lambda and
 * modules/static-site). The handler itself is framework-free; adapter.ts
 * translates the function-URL event to a Web Request and the Response back.
 *
 * Configuration (Supabase, Gmail, …) is not in the function's environment: it
 * is read once per container from SSM Parameter Store under CONFIG_SSM_PREFIX,
 * one parameter per variable, and copied into process.env where the library
 * expects it.
 */

/** Every parameter under `prefix`; the last path segment is the variable name. */
export async function loadConfigFromSsm(
  prefix: string,
  client: Pick<SSMClient, "send"> = new SSMClient({}),
): Promise<Record<string, string>> {
  const config: Record<string, string> = {};
  let nextToken: string | undefined;
  do {
    const page = await client.send(
      new GetParametersByPathCommand({
        Path: prefix,
        Recursive: true,
        WithDecryption: true,
        NextToken: nextToken,
      }),
    );
    for (const parameter of page.Parameters ?? []) {
      if (parameter.Name && parameter.Value !== undefined) {
        config[parameter.Name.slice(parameter.Name.lastIndexOf("/") + 1)] = parameter.Value;
      }
    }
    nextToken = page.NextToken;
  } while (nextToken);
  return config;
}

export const handler = createHandler({
  loadConfig: () => loadConfigFromSsm(process.env.CONFIG_SSM_PREFIX ?? "/hajer/unknown/landing"),
  dispatch: (request) => (request.method === "POST" ? POST(request) : GET()),
  unavailableMessage: MESSAGES.destinationUnconfigured,
});
