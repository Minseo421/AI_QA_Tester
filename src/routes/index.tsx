import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { runScan } from "@/lib/qa.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI QA Tester — AI-driven exploratory testing" },
      {
        name: "description",
        content:
          "Paste a URL. AI plans exploratory tests, Playwright executes them in Chromium, and the app produces an actionable bug and improvement report.",
      },
      { property: "og:title", content: "AI QA Tester" },
      {
        property: "og:description",
        content:
          "AI explores a running web app in Chromium and turns observed evidence into a bug & improvement report.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Result = Awaited<ReturnType<typeof runScan>>;
type Report = Extract<Result, { ok: true }>;
type Finding = Report["findings"][number];

const STEPS = [
  "Collecting deterministic evidence",
  "Launching Chromium",
  "AI planning exploratory tests",
  "Playwright executing the test plan",
  "Reviewing observed outcomes",
  "Writing report",
];
const SAMPLES = [
  "https://example.com",
  "https://news.ycombinator.com",
  "https://books.toscrape.com",
];

function Index() {
  const scan = useServerFn(runScan);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const t = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      4500,
    );
    return () => clearInterval(t);
  }, [loading]);

  async function go(target: string) {
    let u = target.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    setUrl(u);
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const r = await scan({ data: { url: u } });
      if (r.ok) setReport(r);
      else setError(r.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 font-mono text-xs uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            AI QA Tester
          </span>
          <span className="text-muted-foreground">
            no test scripts required
          </span>
        </div>
      </header>

      <section className="grid-paper border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            // point it at a running app
          </p>
          <h1 className="mt-3 max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Your QA team of one.
            <br />
            Paste a URL, get a bug report.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            AI looks at the initial browser state once, plans up to three safe
            exploratory tests, and Playwright executes that plan in a real
            Chromium browser. A deterministic scan runs alongside it so the
            final report combines hard evidence with observed user-flow
            behaviour.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              go(url);
            }}
            className="mt-8 flex max-w-2xl border-2 border-foreground bg-card"
          >
            <span className="hidden items-center px-4 font-mono text-sm text-muted-foreground sm:flex">
              URL
            </span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-app.com"
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent px-3 py-4 font-mono text-sm outline-none"
            />
            <button
              disabled={loading || !url.trim()}
              className="bg-foreground px-6 font-mono text-sm uppercase tracking-wider text-background transition hover:bg-accent disabled:opacity-50"
            >
              {loading ? "Scanning…" : "Run test"}
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs text-muted-foreground">
            try:
            {SAMPLES.map((s) => (
              <button
                key={s}
                disabled={loading}
                onClick={() => go(s)}
                className="underline decoration-dotted hover:text-accent"
              >
                {s.replace("https://", "")}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {loading && <Progress step={step} url={url} />}
        {error && (
          <div className="border-2 border-bug bg-bug-soft p-5 font-mono text-sm text-bug">
            ✕ {error}
          </div>
        )}
        {report && <ReportView report={report} />}
        {!loading && !report && !error && <HowItWorks />}
      </main>
    </div>
  );
}

function Progress({ step, url }: { step: number; url: string }) {
  return (
    <div className="relative overflow-hidden border-2 border-foreground bg-card p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-accent/15 to-transparent animate-scanline" />
      <p className="font-mono text-xs text-muted-foreground">target: {url}</p>
      <ol className="mt-4 space-y-2 font-mono text-sm">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={
              i < step
                ? "text-verified"
                : i === step
                  ? "text-foreground"
                  : "text-muted-foreground/50"
            }
          >
            {i < step ? "✓" : i === step ? "▸" : "·"} {s}
            {i === step ? "…" : ""}
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-muted-foreground">
        Usually 20–60 seconds. The stage labels are an estimate while the server
        works; actual browser tests are shown in the completed trace.
      </p>
    </div>
  );
}

function HowItWorks() {
  const items = [
    [
      "01 Observe",
      "Maps the page and collects deterministic evidence such as links, forms, status codes and accessibility signals.",
    ],
    [
      "02 Decide",
      "AI sees the initial browser state once and plans up to three self-contained exploratory tests — no handwritten test script.",
    ],
    [
      "03 Act",
      "Playwright executes the whole plan without another planner call after every action, then records before/after state and runtime signals.",
    ],
    [
      "04 Report",
      "AI combines browser observations with verified scan evidence into prioritized bugs and improvements.",
    ],
  ];
  return (
    <div className="grid gap-px border border-border bg-border md:grid-cols-4">
      {items.map(([t, d]) => (
        <div key={t} className="bg-background p-5">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            {t}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{d}</p>
        </div>
      ))}
    </div>
  );
}

function ReportView({ report }: { report: Report }) {
  const key = `qa-dismissed:${report.target}`;
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "bug" | "improvement">("all");
  const [showLow, setShowLow] = useState(false);
  useEffect(() => {
    try {
      setDismissed(JSON.parse(localStorage.getItem(key) ?? "[]"));
    } catch {
      setDismissed([]);
    }
  }, [key]);
  const sig = (f: Finding) => `${f.title}|${f.evidence}`;
  const toggle = (f: Finding) => {
    const s = sig(f);
    const next = dismissed.includes(s)
      ? dismissed.filter((d) => d !== s)
      : [...dismissed, s];
    setDismissed(next);
    localStorage.setItem(key, JSON.stringify(next));
  };
  const active = report.findings.filter((f) => !dismissed.includes(sig(f)));
  const shown = active.filter((f) => filter === "all" || f.kind === filter);
  const main = shown.filter((f) => f.confidence >= 0.5);
  const low = shown.filter((f) => f.confidence < 0.5);
  const bugs = active.filter((f) => f.kind === "bug").length;
  const imps = active.filter((f) => f.kind === "improvement").length;
  const hidden = report.findings.filter((f) => dismissed.includes(sig(f)));

  const markdown = useMemo(() => toMarkdown(report, active), [report, active]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden border-2 border-foreground bg-card">
        <div className="grid md:grid-cols-[190px_1fr]">
          <div className="flex flex-col justify-center border-b border-border p-6 md:border-b-0 md:border-r">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Evidence score
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-6xl font-bold tracking-tighter">
                {report.score}
              </span>
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Evidence-weighted, not AI-generated.
            </p>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-bug-soft px-2.5 py-1 font-mono text-xs text-bug">
                {bugs} {bugs === 1 ? "bug" : "bugs"}
              </span>
              <span className="bg-improve-soft px-2.5 py-1 font-mono text-xs text-improve">
                {imps} {imps === 1 ? "improvement" : "improvements"}
              </span>
              <span className="border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground">
                {report.browser.steps.length} browser tests
              </span>
            </div>

            <h2 className="mt-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              What the test found
            </h2>
            <p className="mt-2 max-w-3xl text-lg leading-7">{report.summary}</p>

            <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs">
              <button
                onClick={() => navigator.clipboard.writeText(markdown)}
                className="border border-foreground px-3 py-2 transition hover:bg-foreground hover:text-background"
              >
                Copy Markdown
              </button>
              <button
                onClick={() => download(markdown)}
                className="border border-foreground px-3 py-2 transition hover:bg-foreground hover:text-background"
              >
                Download report
              </button>
            </div>
          </div>
        </div>
      </section>

      {report.analysisWarning && (
        <div className="border border-improve bg-improve-soft p-4 text-sm text-improve">
          <span className="font-mono text-xs uppercase tracking-wider">
            Degraded AI synthesis
          </span>
          <p className="mt-1">{report.analysisWarning}</p>
          <p className="mt-1 text-xs">
            The deterministic scan and completed browser trace are still shown.
          </p>
        </div>
      )}

      <BrowserExploration browser={report.browser} />

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              Findings
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Issues worth reviewing
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Open a finding for evidence, impact, reproduction steps and a
              suggested fix.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 font-mono text-xs">
            {(["all", "bug", "improvement"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`border px-3 py-1.5 transition ${filter === f ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
              >
                {f === "all"
                  ? `All ${active.length}`
                  : f === "bug"
                    ? `Bugs ${bugs}`
                    : `Improvements ${imps}`}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {main.length === 0 && (
            <div className="border border-dashed border-border p-6 text-sm text-muted-foreground">
              No high-confidence findings in this view.
            </div>
          )}
          {main.map((f) => (
            <FindingCard key={f.id} f={f} onDismiss={() => toggle(f)} />
          ))}
        </div>
      </section>

      {low.length > 0 && (
        <div className="border-t border-border pt-4">
          <button
            onClick={() => setShowLow(!showLow)}
            className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            {showLow ? "▾" : "▸"} {low.length} low-confidence findings
            <span className="ml-2 normal-case tracking-normal">
              — may be false positives
            </span>
          </button>
          {showLow && (
            <div className="mt-3 space-y-3 opacity-80">
              {low.map((f) => (
                <FindingCard key={f.id} f={f} onDismiss={() => toggle(f)} />
              ))}
            </div>
          )}
        </div>
      )}

      {hidden.length > 0 && (
        <details className="border border-border bg-card p-4 font-mono text-xs text-muted-foreground">
          <summary className="cursor-pointer uppercase tracking-wider">
            Dismissed findings ({hidden.length})
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {hidden.map((f) => (
              <button
                key={f.id}
                onClick={() => toggle(f)}
                className="border border-border px-2 py-1 hover:border-foreground hover:text-foreground"
              >
                ↺ {f.title}
              </button>
            ))}
          </div>
        </details>
      )}

      <RunDetails report={report} />
    </div>
  );
}

function BrowserExploration({ browser }: { browser: Report["browser"] }) {
  const safetyLimited = browser.steps.filter(
    (step) => step.blockedBySafety,
  ).length;
  const runtimeSignals = browser.steps.filter(
    (step) =>
      step.consoleErrors.length > 0 ||
      step.pageErrors.length > 0 ||
      step.failedRequests.length > 0,
  ).length;

  return (
    <details className="group border border-border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              AI browser exploration
            </span>
            <span className="border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              {browser.steps.length}/{browser.plannedTests || browser.maxTests}{" "}
              tests executed
            </span>
            {safetyLimited > 0 && (
              <span className="bg-improve-soft px-2 py-0.5 font-mono text-[10px] text-improve">
                {safetyLimited} safety-limited
              </span>
            )}
            {runtimeSignals > 0 && (
              <span className="border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {runtimeSignals} with runtime signals
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            AI planned the tests once; Playwright executed them in a real
            Chromium browser.
          </p>
        </div>
        <span className="shrink-0 font-mono text-lg text-muted-foreground transition group-open:rotate-45">
          +
        </span>
      </summary>

      <div className="border-t border-border">
        {browser.error ? (
          <div className="bg-improve-soft p-4 text-sm text-improve">
            Browser exploration unavailable: {browser.error}
          </div>
        ) : browser.steps.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            The one-shot planner did not produce an executable browser test.{" "}
            {browser.stopReason}
          </div>
        ) : (
          <ol className="divide-y divide-border">
            {browser.steps.map((step) => (
              <li key={step.step}>
                <details className="group/test">
                  <summary className="grid cursor-pointer list-none gap-2 px-4 py-3 md:grid-cols-[58px_1fr_auto] md:items-center [&::-webkit-details-marker]:hidden">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      TEST {step.step}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{step.testGoal}</p>
                      <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                        {step.action}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {step.blockedBySafety && (
                        <span className="bg-improve-soft px-2 py-1 font-mono text-[10px] text-improve">
                          safety-limited
                        </span>
                      )}
                      <span className="font-mono text-sm text-muted-foreground transition group-open/test:rotate-45">
                        +
                      </span>
                    </div>
                  </summary>

                  <div className="grid gap-4 border-t border-border bg-muted/30 px-4 py-4 text-sm md:grid-cols-2">
                    <Field label="Expected">{step.expectedOutcome}</Field>
                    <Field label="Observed">{step.outcome}</Field>
                    {step.blockedBySafety && (
                      <div className="md:col-span-2 rounded-sm bg-improve-soft p-3 font-mono text-xs text-improve">
                        Safety policy affected this test. Effects caused by the
                        block are not treated as app bugs.
                      </div>
                    )}
                    {(step.consoleErrors.length > 0 ||
                      step.pageErrors.length > 0 ||
                      step.failedRequests.length > 0) && (
                      <details className="md:col-span-2 border-t border-border pt-3 font-mono text-xs text-muted-foreground">
                        <summary className="cursor-pointer">
                          Runtime signals
                        </summary>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                          {step.consoleErrors.map((value, i) => (
                            <li key={`c-${i}`}>console: {value}</li>
                          ))}
                          {step.pageErrors.map((value, i) => (
                            <li key={`p-${i}`}>page: {value}</li>
                          ))}
                          {step.failedRequests.map((value, i) => (
                            <li key={`r-${i}`}>request: {value}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </details>
              </li>
            ))}
          </ol>
        )}
      </div>
    </details>
  );
}

function FindingCard({ f, onDismiss }: { f: Finding; onDismiss: () => void }) {
  const [open, setOpen] = useState(false);
  const bug = f.kind === "bug";
  return (
    <article
      className={`overflow-hidden border bg-card ${bug ? "border-l-4 border-l-bug" : "border-l-4 border-l-improve"} border-y-border border-r-border`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-muted/30"
      >
        <span
          className={`mt-0.5 shrink-0 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${bug ? "bg-bug-soft text-bug" : "bg-improve-soft text-improve"}`}
        >
          {bug ? "Bug" : "Improve"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <h3 className="font-medium leading-snug">{f.title}</h3>
            <span className="max-w-full truncate font-mono text-[10px] text-muted-foreground md:max-w-xs">
              {displayPage(f.page)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground">
            <span className="border border-border px-1.5 py-0.5 uppercase">
              {f.severity}
            </span>
            <span>{f.category}</span>
            <span>{Math.round(f.confidence * 100)}% confidence</span>
            {f.source === "verified" ? (
              <span className="text-verified">✓ verified check</span>
            ) : f.source === "browser" ? (
              <span className="text-accent">● browser observed</span>
            ) : (
              <span>AI from scan evidence</span>
            )}
          </div>
        </div>
        <span className="shrink-0 font-mono text-muted-foreground">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="border-t border-border bg-muted/20 p-4 text-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <Field label="Evidence">
                <code className="block break-words bg-background p-3 font-mono text-xs leading-relaxed">
                  {f.evidence}
                </code>
              </Field>
              <Field label="Page">
                <span className="break-all font-mono text-xs">{f.page}</span>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Field label="Why it matters">{f.whyItMatters}</Field>
              <Field label="How to fix">{f.howToFix}</Field>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
            {f.reproSteps.length > 0 ? (
              <Field label="Steps to reproduce">
                <ol className="list-decimal space-y-1 pl-5">
                  {f.reproSteps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              </Field>
            ) : (
              <span />
            )}
            <button
              onClick={onDismiss}
              className="ml-auto font-mono text-xs uppercase tracking-wider text-muted-foreground underline decoration-dotted hover:text-foreground"
            >
              Not a problem — dismiss
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function RunDetails({ report }: { report: Report }) {
  return (
    <details className="border border-border bg-card font-mono text-xs">
      <summary className="cursor-pointer p-4 uppercase tracking-wider text-muted-foreground">
        Run details
      </summary>
      <div className="grid gap-4 border-t border-border p-4 text-muted-foreground md:grid-cols-2">
        <div>
          <p className="text-foreground">Target</p>
          <p className="mt-1 break-all">{report.target}</p>
        </div>
        <div>
          <p className="text-foreground">Coverage</p>
          <p className="mt-1">
            {report.pagesScanned.length} pages · {report.linksChecked} links ·{" "}
            {report.browser.steps.length} browser tests ·{" "}
            {(report.durationMs / 1000).toFixed(1)}s
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="text-foreground">Prototype scope</p>
          <p className="mt-1">
            URL black-box scan + one-shot AI test plan + Playwright · no
            source-code access · max {report.browser.maxTests} browser tests
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="text-foreground">Pages scanned</p>
          <ul className="mt-2 space-y-1">
            {report.pagesScanned.map((p) => (
              <li key={p.url} className="break-all">
                {p.status} · {p.ms}ms · {p.url} {p.title ? `— ${p.title}` : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

function displayPage(value: string) {
  try {
    const url = new URL(value);
    const path = `${url.pathname}${url.search}`;
    return path === "/" ? url.hostname : path;
  } catch {
    return value;
  }
}

function toMarkdown(r: Report, fs: Finding[]) {
  return [
    `# QA report: ${r.target}`,
    `Score: ${r.score}/100`,
    "",
    r.summary,
    "",
    ...fs.map(
      (f) =>
        `## [${f.kind.toUpperCase()} · ${f.severity}] ${f.title}\n- Page: ${f.page}\n- Evidence: \`${f.evidence}\`\n- Confidence: ${Math.round(f.confidence * 100)}% (${f.source})\n- Why: ${f.whyItMatters}\n- Fix: ${f.howToFix}\n${f.reproSteps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}\n`,
    ),
  ].join("\n");
}
function download(md: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
  a.download = "qa-report.md";
  a.click();
}
