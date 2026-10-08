import { t as createOpenAI } from "../_libs/ai-sdk__openai+zod.mjs";
import {
  n as output_exports,
  r as streamText,
  t as NoObjectGeneratedError,
} from "../_libs/ai.mjs";
import {
  a as stringType,
  i as objectType,
  n as enumType,
  r as numberType,
  t as arrayType,
} from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analyze.server-Bs0vnb0m.js
var schema = objectType({
  summary: stringType(),
  findings: arrayType(
    objectType({
      kind: enumType(["bug", "improvement"]),
      category: enumType([
        "functionality",
        "accessibility",
        "performance",
        "seo",
        "security",
        "ux",
        "content",
      ]),
      severity: enumType(["critical", "high", "medium", "low"]),
      title: stringType(),
      page: stringType(),
      evidence: stringType(),
      whyItMatters: stringType(),
      howToFix: stringType(),
      reproSteps: arrayType(stringType()),
      confidence: numberType(),
    }),
  ),
});
var INSTRUCTIONS = `You are a senior QA engineer reviewing a web app for a small team with no dedicated QA function.
You receive machine-collected evidence from a URL-based black-box scan: HTTP status, response timing, selected headers, server-returned HTML structure, forms, links and visible text.

Your job is to identify evidence-supported issues and explain them clearly. Find BOTH:
- bugs: things the supplied evidence directly shows are broken
- improvements: things that work but could be made safer, clearer, more accessible or more robust

Rules to avoid false positives:
- Only report issues supported by the provided facts. The evidence field must cite a concrete fact from the data (URL, tag, count, timing, header or text).
- Do NOT repeat broken-link, missing-alt, unlabeled-form-control, inaccessible-button or mixed-content findings that are already verified separately.
- Do NOT invent browser behaviour, JavaScript behaviour, login outcomes, button-click outcomes, rendering problems or user flows. This prototype does not execute interactive browser actions.
- A missing security header can be an improvement, not proof of an exploitable security bug.
- HTTP 401/403/429 responses can be caused by authentication or bot/rate-limit protection. Do not label them broken unless other evidence proves a user-facing failure.
- If a page looks like a client-rendered shell with little useful server HTML, mention that limitation once rather than inventing findings.
- confidence must be 0..1. Use 0.9+ only when the supplied fact strongly supports the claim. Omit weak speculation.
- Write plain language a developer and non-technical stakeholder can understand.
- reproSteps must contain 1-4 short steps.
- Report at most 10 AI findings, most important first.
- summary must be 2-3 sentences and must state the strongest evidence plus any important scan limitation.`;
function isVerifiedBrokenStatus(status) {
  return (
    status === 404 ||
    status === 410 ||
    (status !== null && status >= 500 && status <= 599)
  );
}
function verifiedFindings(data) {
  const out = [];
  const home = data.pages[0];
  if (home && isVerifiedBrokenStatus(home.status))
    out.push({
      id: "v-home",
      kind: "bug",
      category: "functionality",
      severity: "critical",
      title: `Home page returns HTTP ${home.status}`,
      page: home.finalUrl,
      evidence: `GET ${home.url} → ${home.status}`,
      whyItMatters: "Visitors may be unable to load the app at all.",
      howToFix:
        "Check the deployment, route configuration and server logs for the home page.",
      reproSteps: [`Open ${home.url}`],
      confidence: 1,
      source: "verified",
    });
  data.linkChecks
    .filter((l) => isVerifiedBrokenStatus(l.status))
    .forEach((l, i) => {
      const src = data.pages.find((p) => p.links.includes(l.url));
      out.push({
        id: `v-link-${i}`,
        kind: "bug",
        category: "functionality",
        severity: "high",
        title: `Broken link (HTTP ${l.status})`,
        page: src?.finalUrl ?? data.target,
        evidence: `${l.url} → HTTP ${l.status}`,
        whyItMatters:
          "A user following this link reaches an error response instead of the intended destination.",
        howToFix:
          "Update the link to a valid destination, restore the missing route, or remove the link.",
        reproSteps: [
          `Open ${src?.finalUrl ?? data.target}`,
          `Follow the link to ${l.url}`,
        ],
        confidence: 0.98,
        source: "verified",
      });
    });
  data.pages
    .filter((p) => p.ms > 3e3)
    .forEach((p, i) => {
      out.push({
        id: `v-slow-${i}`,
        kind: "improvement",
        category: "performance",
        severity: p.ms > 6e3 ? "high" : "medium",
        title: `Slow server response (${(p.ms / 1e3).toFixed(1)}s)`,
        page: p.finalUrl,
        evidence: `Server HTML fetch took ${p.ms}ms`,
        whyItMatters:
          "Slow initial responses can make the product feel unresponsive, especially on slower connections.",
        howToFix:
          "Profile this route and consider caching, a CDN, or reducing server-side work. Confirm with browser performance tooling before treating this as user-perceived load time.",
        reproSteps: [
          `Request ${p.finalUrl} and measure the initial HTML response`,
        ],
        confidence: 0.8,
        source: "verified",
      });
    });
  data.pages.forEach((p, pageIndex) => {
    if (p.imagesMissingAlt.length > 0)
      out.push({
        id: `v-alt-${pageIndex}`,
        kind: "improvement",
        category: "accessibility",
        severity: "medium",
        title: `${p.imagesMissingAlt.length} image${p.imagesMissingAlt.length === 1 ? "" : "s"} missing alt text`,
        page: p.finalUrl,
        evidence: `Images without an alt attribute: ${p.imagesMissingAlt.slice(0, 3).join(", ")}`,
        whyItMatters:
          "Screen-reader users may miss the purpose or content of these images.",
        howToFix:
          'Add meaningful alt text for informative images. Use alt="" for images that are purely decorative.',
        reproSteps: [
          `Open ${p.finalUrl}`,
          "Inspect the listed image elements for an alt attribute",
        ],
        confidence: 0.98,
        source: "verified",
      });
    const unlabeled = p.forms.flatMap((f) => f.unlabeled);
    if (unlabeled.length > 0)
      out.push({
        id: `v-label-${pageIndex}`,
        kind: "improvement",
        category: "accessibility",
        severity: "medium",
        title: `${unlabeled.length} form control${unlabeled.length === 1 ? "" : "s"} missing an accessible label`,
        page: p.finalUrl,
        evidence: `Unlabeled controls: ${unlabeled.slice(0, 5).join(", ")}`,
        whyItMatters:
          "Users of assistive technology may not know what information each control expects.",
        howToFix:
          "Associate each control with a <label>, aria-label, or aria-labelledby value.",
        reproSteps: [
          `Open ${p.finalUrl}`,
          "Inspect the listed form controls and their accessible names",
        ],
        confidence: 0.95,
        source: "verified",
      });
    if (p.buttonsWithoutText > 0)
      out.push({
        id: `v-button-${pageIndex}`,
        kind: "improvement",
        category: "accessibility",
        severity: "medium",
        title: `${p.buttonsWithoutText} button${p.buttonsWithoutText === 1 ? "" : "s"} without visible text or aria-label`,
        page: p.finalUrl,
        evidence: `${p.buttonsWithoutText} <button> element(s) had no text and no aria-label in the server HTML`,
        whyItMatters:
          "Icon-only controls need an accessible name so screen-reader users can understand their purpose.",
        howToFix:
          "Add visible button text or a meaningful accessible name such as aria-label.",
        reproSteps: [`Open ${p.finalUrl}`, "Inspect button accessible names"],
        confidence: 0.9,
        source: "verified",
      });
    if (p.mixedContent.length > 0)
      out.push({
        id: `v-mixed-${pageIndex}`,
        kind: "bug",
        category: "security",
        severity: "high",
        title: "HTTPS page references insecure HTTP resources",
        page: p.finalUrl,
        evidence: `HTTP resources referenced from HTTPS: ${p.mixedContent.slice(0, 3).join(", ")}`,
        whyItMatters:
          "Browsers may block insecure resources, and unencrypted subresources weaken transport security.",
        howToFix: "Serve these assets over HTTPS and update their URLs.",
        reproSteps: [
          `Open ${p.finalUrl}`,
          "Inspect the listed resource URLs or browser console for mixed-content warnings",
        ],
        confidence: 0.98,
        source: "verified",
      });
  });
  return out.slice(0, 14);
}
function compact(data) {
  return JSON.stringify({
    target: data.target,
    scope: {
      method: "URL-based black-box HTTP scan",
      pagesScanned: data.pages.length,
      interactiveBrowserActions: false,
    },
    pages: data.pages.map((p) => ({
      ...p,
      links: `${p.links.length} links`,
    })),
    verifiedBrokenLinks: data.linkChecks.filter((l) =>
      isVerifiedBrokenStatus(l.status),
    ).length,
    linksChecked: data.linkChecks.length,
  });
}
function calculateQualityScore(findings) {
  const severityPenalty = {
    critical: 30,
    high: 18,
    medium: 8,
    low: 3,
  };
  const penalty = findings.reduce((total, finding) => {
    const kindMultiplier = finding.kind === "bug" ? 1 : 0.6;
    return (
      total +
      severityPenalty[finding.severity] * kindMultiplier * finding.confidence
    );
  }, 0);
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
}
async function analyze(data, request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey)
    throw new Error("AI is not configured (missing OPENAI_API_KEY).");
  const provider = createOpenAI({ apiKey });
  const result = streamText({
    model: provider.responses(process.env.OPENAI_MODEL ?? "gpt-6-luna"),
    instructions: INSTRUCTIONS,
    messages: [
      {
        role: "user",
        content: `Scan evidence (JSON):\n${compact(data)}`,
      },
    ],
    output: output_exports.object({ schema }),
    abortSignal: request?.signal,
    providerOptions: {
      openai: {
        store: false,
        reasoningEffort: "low",
      },
    },
  });
  let parsed;
  try {
    parsed = await result.output;
  } catch (e) {
    if (NoObjectGeneratedError.isInstance(e) && e.text) {
      const m = e.text.match(/\{[\s\S]*\}/);
      parsed = m
        ? JSON.parse(m[0])
        : {
            summary: "AI review could not be parsed.",
            findings: [],
          };
    } else throw e;
  }
  const ai = (parsed.findings ?? []).slice(0, 10).map((f, i) => ({
    ...f,
    id: `ai-${i}`,
    reproSteps: (f.reproSteps ?? []).slice(0, 4),
    confidence: Math.max(0, Math.min(1, f.confidence ?? 0.5)),
    source: "ai",
  }));
  const findings = [...verifiedFindings(data), ...ai];
  const rank = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  findings.sort(
    (a, b) =>
      rank[a.severity] - rank[b.severity] || b.confidence - a.confidence,
  );
  return {
    summary: parsed.summary,
    score: calculateQualityScore(findings),
    findings,
  };
}
//#endregion
export { analyze };
