/**
 * Transactional follow-up sent only after a waitlist signup is durably stored.
 * Keep it aligned with content/copy.ts and never request sensitive evidence.
 */
export const founderFollowup = {
  fromName: "Omar",
  subject: "We received your Hajer request",
  body: `Hi,

Omar here. Thanks for your interest in Hajer.

I received your request. We are still early and reviewing requests individually as we learn where Hajer can be most useful. We will be in touch as things develop.

In the meantime, if you have any questions, reply to this email or reach us at omar@hajer.ai.

Omar
Founder, Hajer
omar@hajer.ai`,
} as const;

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_SEND_URL =
  "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
const EMAIL_TIMEOUT_MS = 10_000;

export interface FounderFollowupSender {
  name: string;
  send(recipient: string): Promise<void>;
}

export interface GmailFollowupConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  from: string;
  replyTo?: string;
}

function safeHeader(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function base64Url(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function wrapBase64(value: string): string {
  return value.match(/.{1,76}/g)?.join("\r\n") ?? value;
}

/** Build the RFC 2822 bytes accepted by Gmail's `messages.send` endpoint. */
export function buildFounderFollowupMessage(
  recipient: string,
  from: string,
  replyTo = from,
): string {
  const encodedBody = wrapBase64(
    Buffer.from(founderFollowup.body, "utf8").toString("base64"),
  );

  return [
    `From: ${safeHeader(founderFollowup.fromName)} <${safeHeader(from)}>`,
    `To: <${safeHeader(recipient)}>`,
    `Reply-To: ${safeHeader(replyTo)}`,
    `Subject: ${safeHeader(founderFollowup.subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    encodedBody,
  ].join("\r\n");
}

export function createGmailFollowupSender(
  config: GmailFollowupConfig,
): FounderFollowupSender {
  return {
    name: "google-workspace-gmail",
    async send(recipient) {
      const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: config.refreshToken,
          grant_type: "refresh_token",
        }),
        signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
        cache: "no-store",
      });

      if (!tokenResponse.ok) {
        throw new Error(
          `Google OAuth token endpoint responded with status ${tokenResponse.status}`,
        );
      }

      const tokenPayload = (await tokenResponse.json()) as {
        access_token?: unknown;
      };
      if (
        typeof tokenPayload.access_token !== "string" ||
        tokenPayload.access_token.length === 0
      ) {
        throw new Error("Google OAuth token response did not contain an access token");
      }

      const raw = base64Url(
        buildFounderFollowupMessage(
          recipient,
          config.from,
          config.replyTo ?? config.from,
        ),
      );
      const sendResponse = await fetch(GMAIL_SEND_URL, {
        method: "POST",
        headers: {
          authorization: `Bearer ${tokenPayload.access_token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ raw }),
        signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
        cache: "no-store",
      });

      if (!sendResponse.ok) {
        throw new Error(
          `Gmail send endpoint responded with status ${sendResponse.status}`,
        );
      }
    },
  };
}

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

/**
 * Resolve the optional sender. No credentials means "disabled"; a partial
 * configuration is an error so production cannot look configured while doing
 * nothing. The route logs that error without failing the durable signup.
 */
export function resolveFounderFollowupSender(): FounderFollowupSender | null {
  const config = {
    clientId: readEnv("HAJER_GMAIL_CLIENT_ID"),
    clientSecret: readEnv("HAJER_GMAIL_CLIENT_SECRET"),
    refreshToken: readEnv("HAJER_GMAIL_REFRESH_TOKEN"),
    from: readEnv("HAJER_GMAIL_FROM"),
    replyTo: readEnv("HAJER_GMAIL_REPLY_TO"),
  };

  const credentials = [
    config.clientId,
    config.clientSecret,
    config.refreshToken,
  ];
  if (credentials.every((value) => value === undefined)) return null;
  if (credentials.some((value) => value === undefined)) {
    throw new Error("Google Workspace founder follow-up configuration is incomplete");
  }

  return createGmailFollowupSender({
    clientId: config.clientId!,
    clientSecret: config.clientSecret!,
    refreshToken: config.refreshToken!,
    from: config.from ?? "omar@hajer.ai",
    replyTo: config.replyTo ?? "omar@hajer.ai",
  });
}
