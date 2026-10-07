import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import type { ScanData } from "./scanner.server";

export type Finding = {
  id: string;
  kind: "bug" | "improvement";
  category: "functionality" | "accessibility" | "performance" | "seo" | "security" | "ux" | "content";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  page: string;
  evidence: string;
  whyItMatters: string;
  howToFix: string;
  reproSteps: string[];
  confidence: number;
  source: "verified" | "ai";
};

const schema = z.object({
  summary: z.string(),
  score: z.number(),
  findings: z.array(
    z.object({
      kind: z.enum(["bug", "improvement"]),
      category: z.enum(["functionality", "accessibility", "performance", "seo", "security", "ux", "content"]),
      severity: z.enum(["critical", "high", "medium", "low"]),
      title: z.string(),
      page: z.string(),
      evidence: z.string(),
      whyItMatters: z.string(),
      howToFix: z.string(),
      reproSteps: z.array(z.string()),
      confidence: z.number(),
    }),
  ),
});

const INSTRUCTIONS = `You are a senior QA engineer reviewing a web app for a small team with no QA function.
You receive machine-collected facts from a crawl (HTTP status, timings, headers, HTML structure, forms, link checks, visible text).
Find BOTH bugs (broken things) and improvements (things that could be better) across functionality, accessibility, performance, SEO, security, UX and content.
Rules to avoid false positives:
- Only report issues supported by the provided facts. "evidence" must quote or cite a concrete fact from the data (a URL, a tag, a number, a header).
- Do NOT repeat broken-link findings; those are already reported separately.
- Never speculate about things you cannot see (e.g. JavaScript behaviour after render). If the page is a client-rendered shell with little HTML, say so once instead of inventing issues.
- confidence is 0..1: 0.9+ only when the fact alone proves it; lower when it depends on context.
- Write in plain language a developer can act on. reproSteps: 1-4 short steps. Report at most 14 findings, most important first.
- score: overall quality 0-100. summary: 2-3 sentences for a non-technical reader.`;

function verifiedFindings(data: ScanData): Finding[] {
  const out: Finding[] = [];
  const home = data.pages[0];
  if (home.status >= 400)
    out.push({ id: "v-home", kind: "bug", category: "functionality", severity: "critical", title: `Home page returns HTTP ${home.status}`, page: home.finalUrl, evidence: `GET ${home.url} → ${home.status}`, whyItMatters: "Visitors cannot load the app at all.", howToFix: "Check the deployment and server logs for this route.", reproSteps: [`Open ${home.url}`], confidence: 1, source: "verified" });
  data.linkChecks.filter((l) => !l.ok).forEach((l, i) => {
    const src = data.pages.find((p) => p.links.includes(l.url));
    out.push({
      id: `v-link-${i}`, kind: "bug", category: "functionality", severity: l.status === 404 || l.status === null ? "high" : "medium",
      title: l.status ? `Broken link (HTTP ${l.status})` : `Link unreachable (${l.error})`, page: src?.finalUrl ?? data.target,
      evidence: `${l.url} → ${l.status ?? l.error}`, whyItMatters: "Users clicking this link hit an error page or dead end.",
      howToFix: "Update the link to a valid destination or remove it. Note: some sites block automated requests (403/999) — confirm in a browser.",
      reproSteps: [`Open ${src?.finalUrl ?? data.target}`, `Click the link to ${l.url}`], confidence: l.status === 403 || l.status === 429 || (l.status ?? 0) >= 900 ? 0.5 : 0.95, source: "verified",
    });
  });
  data.pages.filter((p) => p.ms > 3000).forEach((p, i) =>
    out.push({ id: `v-slow-${i}`, kind: "improvement", category: "performance", severity: p.ms > 6000 ? "high" : "medium", title: `Slow server response (${(p.ms / 1000).toFixed(1)}s)`, page: p.finalUrl, evidence: `HTML took ${p.ms}ms to download`, whyItMatters: "Slow pages lose visitors, especially on mobile.", howToFix: "Add caching/CDN, reduce server work on this route.", reproSteps: [`Open ${p.finalUrl} and time the first load`], confidence: 0.8, source: "verified" }),
  );
  return out;
}

function compact(data: ScanData) {
  return JSON.stringify({
    target: data.target,
    pages: data.pages.map((p) => ({ ...p, links: `${p.links.length} links` })),
    brokenLinks: data.linkChecks.filter((l) => !l.ok).length,
    linksChecked: data.linkChecks.length,
  });
}

export async function analyze(data: ScanData, request?: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("AI is not configured (missing key).");
  const provider = createOpenAI({ apiKey });
  const result = streamText({
    model: provider.responses(process.env.OPENAI_MODEL ?? "gpt-6-astra"),
    instructions: INSTRUCTIONS,
    messages: [{ role: "user", content: `Crawl data (JSON):\n${compact(data)}` }],
    output: Output.object({ schema }),
    abortSignal: request?.signal,
    providerOptions: { openai: { store: false, reasoningEffort: "low" } },
  });
  let parsed: z.infer<typeof schema>;
  try {
    parsed = (await result.output) as z.infer<typeof schema>;
  } catch (e) {
    if (NoObjectGeneratedError.isInstance(e) && e.text) {
      const m = e.text.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : { summary: "AI review could not be parsed.", score: 0, findings: [] };
    } else throw e;
  }
  const ai: Finding[] = (parsed.findings ?? []).slice(0, 14).map((f, i) => ({
    ...f, id: `ai-${i}`, reproSteps: (f.reproSteps ?? []).slice(0, 4), confidence: Math.max(0, Math.min(1, f.confidence ?? 0.5)), source: "ai" as const,
  }));
  const findings = [...verifiedFindings(data), ...ai];
  const rank = { critical: 0, high: 1, medium: 2, low: 3 };
  findings.sort((a, b) => rank[a.severity] - rank[b.severity] || b.confidence - a.confidence);
  return { summary: parsed.summary, score: Math.max(0, Math.min(100, Math.round(parsed.score ?? 0))), findings };
}
