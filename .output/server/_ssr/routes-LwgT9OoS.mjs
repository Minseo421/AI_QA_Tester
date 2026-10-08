import { r as __toESM } from "../_runtime.mjs";
import { a as stringType, i as objectType } from "../_libs/zod.mjs";
import {
  U as isRedirect,
  b as useRouter,
} from "../_libs/@tanstack/react-router+[...].mjs";
import {
  a as TSS_SERVER_FUNCTION,
  l as createServerFn,
} from "./createServerFn-DDDJMFWM.mjs";
import {
  n as require_jsx_runtime,
  r as require_react,
} from "../_libs/react+tanstack__react-query.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-DOrvgjvR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-LwgT9OoS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
  const router = useRouter();
  return import_react.useCallback(
    async (...args) => {
      try {
        const res = await serverFn(...args);
        if (isRedirect(res)) throw res;
        return res;
      } catch (err) {
        if (isRedirect(err)) {
          err.options._fromLocation = router.stores.location.get();
          return router.navigate(router.resolveRedirect(err).options);
        }
        throw err;
      }
    },
    [router, serverFn],
  );
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId, { origin: "server" }))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true,
  });
};
var runScan = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    objectType({ url: stringType().url().max(2048) }).parse(d),
  )
  .handler(
    createSsrRpc(
      "706e8c0e4fa7ec33f140e4957fcb2dfdbf96977d08d5188e2af7d7c6334bf2dc",
    ),
  );
var STEPS = [
  "Fetching pages",
  "Mapping links & forms",
  "Checking up to 30 links",
  "AI reviewing evidence",
  "Writing report",
];
var SAMPLES = [
  "https://example.com",
  "https://news.ycombinator.com",
  "https://books.toscrape.com",
];
function Index() {
  const scan = useServerFn(runScan);
  const [url, setUrl] = (0, import_react.useState)("");
  const [loading, setLoading] = (0, import_react.useState)(false);
  const [step, setStep] = (0, import_react.useState)(0);
  const [error, setError] = (0, import_react.useState)(null);
  const [report, setReport] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    if (!loading) return;
    setStep(0);
    const t = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      4500,
    );
    return () => clearInterval(t);
  }, [loading]);
  async function go(target) {
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "min-h-screen bg-background text-foreground",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
        className: "border-b border-border",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className:
            "mx-auto flex max-w-6xl items-center justify-between px-6 py-4 font-mono text-xs uppercase tracking-widest",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
              className: "flex items-center gap-2",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                  className: "h-2 w-2 rounded-full bg-accent",
                }),
                "AI QA Tester",
              ],
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
              className: "text-muted-foreground",
              children: "no test scripts required",
            }),
          ],
        }),
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
        className: "grid-paper border-b border-border",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className: "mx-auto max-w-6xl px-6 py-16",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
              className:
                "font-mono text-xs uppercase tracking-widest text-accent",
              children: "// point it at a running app",
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
              className:
                "mt-3 max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl",
              children: [
                "Your QA team of one.",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
                "Paste a URL, get a bug report.",
              ],
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
              className: "mt-4 max-w-xl text-muted-foreground",
              children:
                "It scans up to 5 pages, checks up to 30 links, inspects forms, headers and accessibility signals, then AI turns the evidence into fixes a developer can act on.",
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
              onSubmit: (e) => {
                e.preventDefault();
                go(url);
              },
              className:
                "mt-8 flex max-w-2xl border-2 border-foreground bg-card",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                  className:
                    "hidden items-center px-4 font-mono text-sm text-muted-foreground sm:flex",
                  children: "URL",
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
                  value: url,
                  onChange: (e) => setUrl(e.target.value),
                  placeholder: "https://your-app.com",
                  disabled: loading,
                  className:
                    "min-w-0 flex-1 bg-transparent px-3 py-4 font-mono text-sm outline-none",
                }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
                  disabled: loading || !url.trim(),
                  className:
                    "bg-foreground px-6 font-mono text-sm uppercase tracking-wider text-background transition hover:bg-accent disabled:opacity-50",
                  children: loading ? "Scanning…" : "Run test",
                }),
              ],
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
              className:
                "mt-3 flex flex-wrap gap-2 font-mono text-xs text-muted-foreground",
              children: [
                "try:",
                SAMPLES.map((s) =>
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      disabled: loading,
                      onClick: () => go(s),
                      className:
                        "underline decoration-dotted hover:text-accent",
                      children: s.replace("https://", ""),
                    },
                    s,
                  ),
                ),
              ],
            }),
          ],
        }),
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
        className: "mx-auto max-w-6xl px-6 py-10",
        children: [
          loading &&
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
              step,
              url,
            }),
          error &&
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
              className:
                "border-2 border-bug bg-bug-soft p-5 font-mono text-sm text-bug",
              children: ["✕ ", error],
            }),
          report &&
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportView, { report }),
          !loading &&
            !report &&
            !error &&
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HowItWorks, {}),
        ],
      }),
    ],
  });
}
function Progress({ step, url }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className:
      "relative overflow-hidden border-2 border-foreground bg-card p-6",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        className:
          "pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-accent/15 to-transparent animate-scanline",
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
        className: "font-mono text-xs text-muted-foreground",
        children: ["target: ", url],
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
        className: "mt-4 space-y-2 font-mono text-sm",
        children: STEPS.map((s, i) =>
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "li",
            {
              className:
                i < step
                  ? "text-verified"
                  : i === step
                    ? "text-foreground"
                    : "text-muted-foreground/50",
              children: [
                i < step ? "✓" : i === step ? "▸" : "·",
                " ",
                s,
                i === step ? "…" : "",
              ],
            },
            s,
          ),
        ),
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
        className: "mt-4 text-xs text-muted-foreground",
        children: "Usually 20–60 seconds.",
      }),
    ],
  });
}
function HowItWorks() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
    className: "grid gap-px border border-border bg-border md:grid-cols-4",
    children: [
      [
        "01 Collect",
        "Fetches the target plus up to 4 internal pages and records status, speed, forms and selected headers.",
      ],
      [
        "02 Verify",
        "Checks up to 30 discovered links. Only clear 404/410/5xx responses are promoted as verified broken links.",
      ],
      [
        "03 Review",
        "AI interprets the collected evidence and proposes additional bugs and improvements without relying on handwritten test cases.",
      ],
      [
        "04 Triage",
        "Verified vs AI-inferred labels, confidence scores and dismiss controls make uncertainty visible.",
      ],
    ].map(([t, d]) =>
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "div",
        {
          className: "bg-background p-5",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
              className:
                "font-mono text-xs uppercase tracking-widest text-accent",
              children: t,
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
              className: "mt-2 text-sm text-muted-foreground",
              children: d,
            }),
          ],
        },
        t,
      ),
    ),
  });
}
function ReportView({ report }) {
  const key = `qa-dismissed:${report.target}`;
  const [dismissed, setDismissed] = (0, import_react.useState)([]);
  const [filter, setFilter] = (0, import_react.useState)("all");
  const [showLow, setShowLow] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    try {
      setDismissed(JSON.parse(localStorage.getItem(key) ?? "[]"));
    } catch {}
  }, [key]);
  const sig = (f) => `${f.title}|${f.evidence}`;
  const toggle = (f) => {
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
  const markdown = (0, import_react.useMemo)(
    () => toMarkdown(report, active),
    [report, active],
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    className: "space-y-8",
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className:
          "grid gap-px border-2 border-foreground bg-foreground md:grid-cols-[220px_1fr]",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "flex flex-col justify-center bg-card p-6",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                className:
                  "font-mono text-xs uppercase tracking-widest text-muted-foreground",
                children: "Evidence score",
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                className: "text-7xl font-bold tracking-tighter",
                children: [
                  report.score,
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                    className: "text-2xl text-muted-foreground",
                    children: "/100",
                  }),
                ],
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                className:
                  "mt-2 font-mono text-[10px] leading-relaxed text-muted-foreground",
                children:
                  "Calculated from finding severity × confidence, not generated by AI.",
              }),
            ],
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "bg-card p-6",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                className: "font-mono text-xs text-muted-foreground",
                children: [
                  report.target,
                  " · ",
                  report.pagesScanned.length,
                  " pages · ",
                  report.linksChecked,
                  " links checked · ",
                  (report.durationMs / 1e3).toFixed(1),
                  "s scan",
                ],
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                className:
                  "mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground",
                children:
                  "Prototype scope: URL-based black-box evidence scan · no source-code access · no interactive browser actions",
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
                className: "mt-3 text-lg leading-relaxed",
                children: report.summary,
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
                className: "mt-4 flex flex-wrap gap-3 font-mono text-sm",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
                    className: "bg-bug-soft px-3 py-1 text-bug",
                    children: [bugs, " bugs"],
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
                    className: "bg-improve-soft px-3 py-1 text-improve",
                    children: [imps, " improvements"],
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
                    onClick: () => navigator.clipboard.writeText(markdown),
                    className:
                      "border border-foreground px-3 py-1 hover:bg-foreground hover:text-background",
                    children: "Copy as Markdown",
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
                    onClick: () => download(markdown),
                    className:
                      "border border-foreground px-3 py-1 hover:bg-foreground hover:text-background",
                    children: "Download report",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
        className:
          "flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider",
        children: ["all", "bug", "improvement"].map((f) =>
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              onClick: () => setFilter(f),
              className: `border px-3 py-1.5 ${filter === f ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`,
              children:
                f === "all" ? "All" : f === "bug" ? "Bugs" : "Improvements",
            },
            f,
          ),
        ),
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
        className: "space-y-3",
        children: [
          main.length === 0 &&
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
              className: "text-muted-foreground",
              children: "No high-confidence findings in this view.",
            }),
          main.map((f) =>
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              FindingCard,
              {
                f,
                onDismiss: () => toggle(f),
              },
              f.id,
            ),
          ),
        ],
      }),
      low.length > 0 &&
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
              onClick: () => setShowLow(!showLow),
              className:
                "font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground",
              children: [
                showLow ? "▾" : "▸",
                " ",
                low.length,
                " low-confidence findings (may be false positives)",
              ],
            }),
            showLow &&
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
                className: "mt-3 space-y-3 opacity-80",
                children: low.map((f) =>
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    FindingCard,
                    {
                      f,
                      onDismiss: () => toggle(f),
                    },
                    f.id,
                  ),
                ),
              }),
          ],
        }),
      hidden.length > 0 &&
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className:
            "border-t border-border pt-4 font-mono text-xs text-muted-foreground",
          children: [
            "Dismissed as not-a-problem (",
            hidden.length,
            ") — remembered for this site:",
            hidden.map((f) =>
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "button",
                {
                  onClick: () => toggle(f),
                  className:
                    "ml-2 underline decoration-dotted hover:text-foreground",
                  children: ["↺ ", f.title],
                },
                f.id,
              ),
            ),
          ],
        }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
        className: "border border-border p-4 font-mono text-xs",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
            className:
              "cursor-pointer uppercase tracking-wider text-muted-foreground",
            children: "Pages scanned",
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
            className: "mt-3 space-y-1",
            children: report.pagesScanned.map((p) =>
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "li",
                {
                  children: [
                    p.status,
                    " · ",
                    p.ms,
                    "ms · ",
                    p.url,
                    " ",
                    p.title ? `— ${p.title}` : "",
                  ],
                },
                p.url,
              ),
            ),
          }),
        ],
      }),
    ],
  });
}
function FindingCard({ f, onDismiss }) {
  const [open, setOpen] = (0, import_react.useState)(false);
  const bug = f.kind === "bug";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
    className: `border-l-4 bg-card ${bug ? "border-bug" : "border-improve"} border-y border-r border-y-border border-r-border`,
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
        onClick: () => setOpen(!open),
        className: "flex w-full items-start gap-4 p-4 text-left",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
            className: `mt-0.5 shrink-0 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${bug ? "bg-bug-soft text-bug" : "bg-improve-soft text-improve"}`,
            children: bug ? "Bug" : "Improve",
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
            className: "min-w-0 flex-1",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
                className: "font-medium",
                children: f.title,
              }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
                className:
                  "mt-1 flex flex-wrap gap-x-3 font-mono text-xs text-muted-foreground",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                    className: "uppercase",
                    children: f.severity,
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                    children: f.category,
                  }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
                    children: [Math.round(f.confidence * 100), "% confidence"],
                  }),
                  f.source === "verified"
                    ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                        className: "text-verified",
                        children: "✓ verified by check",
                      })
                    : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                        children: "AI-inferred",
                      }),
                ],
              }),
            ],
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
            className: "font-mono text-muted-foreground",
            children: open ? "−" : "+",
          }),
        ],
      }),
      open &&
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
          className:
            "grid gap-4 border-t border-border p-4 text-sm md:grid-cols-2",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
              label: "Evidence",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
                className: "block break-all bg-muted p-2 font-mono text-xs",
                children: f.evidence,
              }),
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
              label: "Page",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
                className: "break-all font-mono text-xs",
                children: f.page,
              }),
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
              label: "Why it matters",
              children: f.whyItMatters,
            }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
              label: "How to fix",
              children: f.howToFix,
            }),
            f.reproSteps.length > 0 &&
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
                label: "Steps to reproduce",
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
                  className: "list-decimal pl-5",
                  children: f.reproSteps.map((s, i) =>
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "li",
                      { children: s },
                      i,
                    ),
                  ),
                }),
              }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
              className: "flex items-end justify-end",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
                onClick: onDismiss,
                className:
                  "font-mono text-xs uppercase tracking-wider text-muted-foreground underline decoration-dotted hover:text-foreground",
                children: "Not a problem — dismiss",
              }),
            }),
          ],
        }),
    ],
  });
}
function Field({ label, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
        className:
          "mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground",
        children: label,
      }),
      children,
    ],
  });
}
function toMarkdown(r, fs) {
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
function download(md) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
  a.download = "qa-report.md";
  a.click();
}
//#endregion
export { Index as component };
