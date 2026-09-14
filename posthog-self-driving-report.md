# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured for Hajer's public assessment-request website. Session Replay and Error Tracking were already enabled; Support was enabled, and health, error, and support signal sources were activated. Findings will begin appearing in the [Self-driving inbox](https://eu.posthog.com/project/274371/inbox) within about 30 minutes as scouts run and recordings arrive.

## AI data processing

Approved by the organization-level setup gate.

## GitHub

Connected before this setup began through the PostHog GitHub App.

## Products enabled

| Product | Result | Web SDK check |
|---|---|---|
| Session Replay | Already enabled | `instrumentation-client.ts` does not disable session recording. |
| Error Tracking | Already enabled | `instrumentation-client.ts` enables `capture_exceptions`. |
| Support (Conversations) | Enabled in this setup | An inbound email, inbox, or Slack channel is still required before tickets can arrive. |

## Signal sources

| Source product | Source type | Action |
|---|---|---|
| `health_checks` | `health_issue` | Enabled — `01a0a0a1-6bc2-7045-a99f-da52f74facf3` |
| `error_tracking` | `issue_created` | Enabled — `01a0a0a1-6d33-7fb8-a28d-322b24b554df` |
| `error_tracking` | `issue_reopened` | Enabled — `01a0a0a1-6c6c-7375-adf9-22127859987b` |
| `error_tracking` | `issue_spiking` | Enabled — `01a0a0a1-6c28-789f-9579-b8edef21d2e1` |
| `conversations` | `ticket` | Enabled — `01a0a0a1-6c7e-7607-acbe-f2975b212e84` |
| `signals_scout` | `cross_source_issue` | Skipped — on by default; no opt-out row exists. |
| `session_replay` | `session_analysis_cluster` | Skipped — retired route; Replay Vision scanners supply replay coverage. |
| `replay_vision` | — | Skipped — each scanner's `emits_signals` setting is its source configuration. |

## Connected tools

No additional issue tracker, error tracker, support desk, security scanner, feedback source, or search analytics source was selected. No external responder was enabled. GitHub remains connected for Self-driving code context.

## Scout troop

The troop has **7 active scouts** and **21 disabled scouts**. The verified budget is **100 runs/day**, with **0 used** and **100 remaining** when configured. Announcement: “Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.”

### Active

| Scout | Why it is active |
|---|---|
| `signals-scout-general` | Covers cross-product patterns and unowned surfaces. |
| `signals-scout-anomaly-detection` | Watches saved monitoring for meaningful trend breaks. |
| `signals-scout-health-checks` | Triage layer for actionable PostHog setup health issues. |
| `signals-scout-product-analytics` | Watches conversion-flow and engagement regressions. |
| `signals-scout-web-analytics` | Watches landing-page traffic, attribution, and channel health. |
| `signals-scout-web-vitals` | Watches site performance against Core Web Vitals thresholds. |
| `signals-scout-assessment-request-funnel` | Custom check for the assessment-request journey. |

### Disabled

| Scout | Reason |
|---|---|
| `signals-scout-ai-observability` | No confirmed AI observability telemetry. |
| `signals-scout-apm` | No confirmed distributed-tracing surface. |
| `signals-scout-conversations` | Support is newly enabled but no inbound channel is connected yet. |
| `signals-scout-csp-violations` | No CSP reporting configuration was found. |
| `signals-scout-customer-analytics` | No account/group analytics surface was identified. |
| `signals-scout-data-pipelines` | No CDP or batch-export pipeline surface was identified. |
| `signals-scout-data-warehouse` | No warehouse source was selected in this setup. |
| `signals-scout-error-tracking` | Covered by the native Error Tracking responder. |
| `signals-scout-experiments` | No active experiment surface was identified. |
| `signals-scout-feature-flags` | No active feature-flag use was identified in this repository. |
| `signals-scout-inbox-validation` | Fresh setup has no shipped fixes to validate yet. |
| `signals-scout-insight-alerts` | No alert surface was identified. |
| `signals-scout-logs` | No active logs telemetry was confirmed. |
| `signals-scout-mcp-tool-calls` | No project MCP-analytics surface was identified. |
| `signals-scout-observability-gaps` | Kept off to preserve a selective troop; health coverage is active. |
| `signals-scout-replay-vision` | No prior scanner observations exist; the new scanner layer supplies replay coverage. |
| `signals-scout-revenue-analytics` | No payment or revenue integration was found. |
| `signals-scout-session-replay` | Covered by the Replay Vision scanners below. |
| `signals-scout-skills-store` | No team skill-store hygiene surface was identified. |
| `signals-scout-surveys` | Surveys are not enabled and none exist. |
| `signals-scout-tasks` | No PostHog Tasks workflow surface was identified. |

## Custom scouts

Created **`signals-scout-assessment-request-funnel`**. It watches the `WaitlistInline` / `WaitlistFull` journey and the server-side `captureWaitlistEvent` path in `app/api/waitlist/route.ts` for completion-rate drops, optional-detail follow-through drops, and a material shift in entry-surface share.

Its discriminator is a meaningful completion or detail-follow-through regression **while visitor or CTA volume holds**. This gives the assessment-request path a dedicated owner; the built-in product-analytics scout partially overlaps it but is general-purpose and centered on saved flows. The scout excludes small samples, incomplete windows, demand-only changes, ordinary retries, and all form contents or identifying visitor data.

No other custom scouts were proposed: there is no confirmed billing, warehouse, background-job, external-tool, survey, or AI-observability surface with its own high-confidence discriminator. If this custom scout proves noisy, set `emit: false` on its config in PostHog to run it in dry-run mode.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and pushes verified findings to the inbox. These are the only items in this setup that spend Replay Vision quota; each finding has half weight and needs corroboration before it is promoted into a report.

| Scanner | Status | Scope | Sampling | Estimate |
|---|---|---|---:|---:|
| [Assessment request breakage](https://eu.posthog.com/project/274371/replay-vision/01a0a0b1-09fe-73f4-9479-b768f0a74462) | Created | URL-scoped landing-page and assessment-request flow, which is where the inline and full request forms live. | 50% | 0 observations / 0 credits per month |
| [Assessment request frustration](https://eu.posthog.com/project/274371/replay-vision/01a0a0b1-0a36-7050-a66a-48a411e2c132) | Created | `$rageclick` sessions only; no URL filter, keeping it distinct from the breakage monitor. | 100% | 0 observations / 0 credits per month |

The current organization Replay Vision budget is 2,500 credits, with 2,500 remaining and no projected current spend. No recordings exist yet, so both monitors are armed and will begin working as soon as recordings arrive. Rate their observations in the Replay Vision UI after the first sweeps to receive configuration recommendations.

## Follow-ups

- [ ] Connect an inbound Support channel (email, inbox, or Slack) in PostHog so the enabled Conversations ticket responder has tickets to process.
- [ ] Generate real browser traffic after deployment so Session Replay records sessions and both Replay Vision monitors can begin scanning.
- [ ] Reauthorize the PostHog MCP connection with `property_definition:read` if you want direct schema-level confirmation of the custom assessment-request event taxonomy; the scout will verify its event schema at runtime.

## What happens next

The scout coordinator picks up fresh configurations within about 30 minutes. Scout runs consume the shared daily budget, findings cluster into reports in the [Self-driving inbox](https://eu.posthog.com/project/274371/inbox), and immediately actionable findings can start coding tasks.