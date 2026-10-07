import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { runScan } from "@/lib/qa.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI QA Tester — find bugs without writing tests" },
      { name: "description", content: "Paste a URL. AI crawls your app and returns an actionable report of bugs and improvements." },
      { property: "og:title", content: "AI QA Tester" },
      { property: "og:description", content: "Paste a URL, get an actionable bug & improvement report in under a minute." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Result = Awaited<ReturnType<typeof runScan>>;
type Report = Extract<Result, { ok: true }>;
type Finding = Report["findings"][number];

const STEPS = ["Fetching pages", "Mapping links & forms", "Checking every link", "AI reviewing evidence", "Writing report"];
const SAMPLES = ["https://example.com", "https://news.ycombinator.com", "https://books.toscrape.com"];

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
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 4500);
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
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent" />AI QA Tester</span>
          <span className="text-muted-foreground">no test scripts required</span>
        </div>
      </header>

      <section className="grid-paper border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">// point it at a running app</p>
          <h1 className="mt-3 max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Your QA team of one.<br />Paste a URL, get a bug report.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            It crawls your pages, checks every link, inspects forms, headers and accessibility, then AI turns the evidence into fixes a developer can act on.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); go(url); }} className="mt-8 flex max-w-2xl border-2 border-foreground bg-card">
            <span className="hidden items-center px-4 font-mono text-sm text-muted-foreground sm:flex">URL</span>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-app.com" disabled={loading}
              className="min-w-0 flex-1 bg-transparent px-3 py-4 font-mono text-sm outline-none" />
            <button disabled={loading || !url.trim()} className="bg-foreground px-6 font-mono text-sm uppercase tracking-wider text-background transition hover:bg-accent disabled:opacity-50">
              {loading ? "Scanning…" : "Run test"}
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs text-muted-foreground">
            try:
            {SAMPLES.map((s) => (
              <button key={s} disabled={loading} onClick={() => go(s)} className="underline decoration-dotted hover:text-accent">{s.replace("https://", "")}</button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {loading && <Progress step={step} url={url} />}
        {error && <div className="border-2 border-bug bg-bug-soft p-5 font-mono text-sm text-bug">✕ {error}</div>}
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
          <li key={s} className={i < step ? "text-verified" : i === step ? "text-foreground" : "text-muted-foreground/50"}>
            {i < step ? "✓" : i === step ? "▸" : "·"} {s}{i === step ? "…" : ""}
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-muted-foreground">Usually 20–60 seconds.</p>
    </div>
  );
}

function HowItWorks() {
  const items = [
    ["01 Crawl", "Fetches the page plus up to 4 internal pages and records status, speed and security headers."],
    ["02 Verify", "Checks up to 30 links for real. Broken ones are proven facts, not guesses."],
    ["03 Review", "AI reads the collected evidence and flags bugs and improvements, each citing proof."],
    ["04 Triage", "Confidence scores, a ‘verified’ label and a dismiss button keep false positives out of your way."],
  ];
  return (
    <div className="grid gap-px border border-border bg-border md:grid-cols-4">
      {items.map(([t, d]) => (
        <div key={t} className="bg-background p-5">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">{t}</p>
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
  useEffect(() => { try { setDismissed(JSON.parse(localStorage.getItem(key) ?? "[]")); } catch {} }, [key]);
  const sig = (f: Finding) => `${f.title}|${f.evidence}`;
  const toggle = (f: Finding) => {
    const s = sig(f);
    const next = dismissed.includes(s) ? dismissed.filter((d) => d !== s) : [...dismissed, s];
    setDismissed(next);
    localStorage.setItem(key, JSON.stringify(next));
  };
  const active = report.findings.filter((f) => !dismissed.includes(sig(f)));
  const shown = active.filter((f) => (filter === "all" || f.kind === filter));
  const main = shown.filter((f) => f.confidence >= 0.5);
  const low = shown.filter((f) => f.confidence < 0.5);
  const bugs = active.filter((f) => f.kind === "bug").length;
  const imps = active.filter((f) => f.kind === "improvement").length;
  const hidden = report.findings.filter((f) => dismissed.includes(sig(f)));

  const markdown = useMemo(() => toMarkdown(report, active), [report, active]);

  return (
    <div className="space-y-8">
      <div className="grid gap-px border-2 border-foreground bg-foreground md:grid-cols-[220px_1fr]">
        <div className="flex flex-col justify-center bg-card p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Quality score</p>
          <p className="text-7xl font-bold tracking-tighter">{report.score}<span className="text-2xl text-muted-foreground">/100</span></p>
        </div>
        <div className="bg-card p-6">
          <p className="font-mono text-xs text-muted-foreground">{report.target} · {report.pagesScanned.length} pages · {report.linksChecked} links checked · {(report.durationMs / 1000).toFixed(1)}s crawl</p>
          <p className="mt-3 text-lg leading-relaxed">{report.summary}</p>
          <div className="mt-4 flex flex-wrap gap-3 font-mono text-sm">
            <span className="bg-bug-soft px-3 py-1 text-bug">{bugs} bugs</span>
            <span className="bg-improve-soft px-3 py-1 text-improve">{imps} improvements</span>
            <button onClick={() => navigator.clipboard.writeText(markdown)} className="border border-foreground px-3 py-1 hover:bg-foreground hover:text-background">Copy as Markdown</button>
            <button onClick={() => download(markdown)} className="border border-foreground px-3 py-1 hover:bg-foreground hover:text-background">Download report</button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider">
        {(["all", "bug", "improvement"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`border px-3 py-1.5 ${filter === f ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>{f === "all" ? "All" : f === "bug" ? "Bugs" : "Improvements"}</button>
        ))}
      </div>

      <div className="space-y-3">
        {main.length === 0 && <p className="text-muted-foreground">No high-confidence findings in this view.</p>}
        {main.map((f) => <FindingCard key={f.id} f={f} onDismiss={() => toggle(f)} />)}
      </div>

      {low.length > 0 && (
        <div>
          <button onClick={() => setShowLow(!showLow)} className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
            {showLow ? "▾" : "▸"} {low.length} low-confidence findings (may be false positives)
          </button>
          {showLow && <div className="mt-3 space-y-3 opacity-80">{low.map((f) => <FindingCard key={f.id} f={f} onDismiss={() => toggle(f)} />)}</div>}
        </div>
      )}

      {hidden.length > 0 && (
        <div className="border-t border-border pt-4 font-mono text-xs text-muted-foreground">
          Dismissed as not-a-problem ({hidden.length}) — remembered for this site:
          {hidden.map((f) => (
            <button key={f.id} onClick={() => toggle(f)} className="ml-2 underline decoration-dotted hover:text-foreground">↺ {f.title}</button>
          ))}
        </div>
      )}

      <details className="border border-border p-4 font-mono text-xs">
        <summary className="cursor-pointer uppercase tracking-wider text-muted-foreground">Pages scanned</summary>
        <ul className="mt-3 space-y-1">
          {report.pagesScanned.map((p) => <li key={p.url}>{p.status} · {p.ms}ms · {p.url} {p.title ? `— ${p.title}` : ""}</li>)}
        </ul>
      </details>
    </div>
  );
}

function FindingCard({ f, onDismiss }: { f: Finding; onDismiss: () => void }) {
  const [open, setOpen] = useState(false);
  const bug = f.kind === "bug";
  return (
    <article className={`border-l-4 bg-card ${bug ? "border-bug" : "border-improve"} border-y border-r border-y-border border-r-border`}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-start gap-4 p-4 text-left">
        <span className={`mt-0.5 shrink-0 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${bug ? "bg-bug-soft text-bug" : "bg-improve-soft text-improve"}`}>{bug ? "Bug" : "Improve"}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium">{f.title}</h3>
          <p className="mt-1 flex flex-wrap gap-x-3 font-mono text-xs text-muted-foreground">
            <span className="uppercase">{f.severity}</span><span>{f.category}</span>
            <span>{Math.round(f.confidence * 100)}% confidence</span>
            {f.source === "verified" ? <span className="text-verified">✓ verified by check</span> : <span>AI-inferred</span>}
          </p>
        </div>
        <span className="font-mono text-muted-foreground">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="grid gap-4 border-t border-border p-4 text-sm md:grid-cols-2">
          <Field label="Evidence"><code className="block break-all bg-muted p-2 font-mono text-xs">{f.evidence}</code></Field>
          <Field label="Page"><span className="break-all font-mono text-xs">{f.page}</span></Field>
          <Field label="Why it matters">{f.whyItMatters}</Field>
          <Field label="How to fix">{f.howToFix}</Field>
          {f.reproSteps.length > 0 && (
            <Field label="Steps to reproduce"><ol className="list-decimal pl-5">{f.reproSteps.map((s, i) => <li key={i}>{s}</li>)}</ol></Field>
          )}
          <div className="flex items-end justify-end">
            <button onClick={onDismiss} className="font-mono text-xs uppercase tracking-wider text-muted-foreground underline decoration-dotted hover:text-foreground">Not a problem — dismiss</button>
          </div>
        </div>
      )}
    </article>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>{children}</div>;
}

function toMarkdown(r: Report, fs: Finding[]) {
  return [`# QA report: ${r.target}`, `Score: ${r.score}/100`, "", r.summary, "",
    ...fs.map((f) => `## [${f.kind.toUpperCase()} · ${f.severity}] ${f.title}\n- Page: ${f.page}\n- Evidence: \`${f.evidence}\`\n- Confidence: ${Math.round(f.confidence * 100)}% (${f.source})\n- Why: ${f.whyItMatters}\n- Fix: ${f.howToFix}\n${f.reproSteps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}\n`)].join("\n");
}
function download(md: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
  a.download = "qa-report.md";
  a.click();
}
