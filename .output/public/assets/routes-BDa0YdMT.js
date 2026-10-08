import {
  a as e,
  c as t,
  i as n,
  l as r,
  n as i,
  o as a,
  r as o,
  s,
  t as c,
} from "./index-W9-C1D5z.js";
function l(e) {
  if (Array.isArray(e)) return e.flatMap((e) => l(e));
  if (typeof e != `string`) return [];
  let t = [],
    n = 0,
    r,
    i,
    a,
    o,
    s,
    c = () => {
      for (; n < e.length && /\s/.test(e.charAt(n));) n += 1;
      return n < e.length;
    },
    u = () => ((i = e.charAt(n)), i !== `=` && i !== `;` && i !== `,`);
  for (; n < e.length;) {
    for (r = n, s = !1; c();)
      if (((i = e.charAt(n)), i === `,`)) {
        for (a = n, n += 1, c(), o = n; n < e.length && u();) n += 1;
        n < e.length && e.charAt(n) === `=`
          ? ((s = !0), (n = o), t.push(e.slice(r, a)), (r = n))
          : (n = a + 1);
      } else n += 1;
    (!s || n >= e.length) && t.push(e.slice(r));
  }
  return t;
}
function u(e) {
  return e instanceof Headers
    ? e
    : Array.isArray(e) || typeof e == `object`
      ? new Headers(e)
      : null;
}
function d(...e) {
  return e.reduce((e, t) => {
    let n = u(t);
    if (!n) return e;
    for (let [t, r] of n.entries())
      t === `set-cookie`
        ? l(r).forEach((t) => e.append(`set-cookie`, t))
        : e.set(t, r);
    return e;
  }, new Headers());
}
var f = r(t(), 1);
function p(e) {
  let t = c();
  return f.useCallback(
    async (...r) => {
      try {
        let t = await e(...r);
        if (n(t)) throw t;
        return t;
      } catch (e) {
        if (n(e))
          return (
            (e.options._fromLocation = t.stores.location.get()),
            t.navigate(t.resolveRedirect(e).options)
          );
        throw e;
      }
    },
    [t, e],
  );
}
function m(e) {
  return e !== `__proto__` && e !== `constructor` && e !== `prototype`;
}
function h(e, t) {
  let n = Object.create(null);
  if (e) for (let t of Object.keys(e)) m(t) && (n[t] = e[t]);
  if (t && typeof t == `object`)
    for (let e of Object.keys(t)) m(e) && (n[e] = t[e]);
  return n;
}
function g(e) {
  if (!e) return Object.create(null);
  let t = Object.create(null);
  for (let n of Object.keys(e)) m(n) && (t[n] = e[n]);
  return t;
}
var _ = () => {
    throw Error(
      `createServerOnlyFn() functions can only be called on the server!`,
    );
  },
  v = (t, n) => {
    let r = n || t || {};
    r.method === void 0 && (r.method = `GET`);
    let i = (e) => v(void 0, { ...r, validator: e, inputValidator: e });
    return Object.assign((e) => v(void 0, { ...r, ...e }), {
      options: r,
      middleware: (e) => {
        let t = [...(r.middleware || [])];
        e.forEach((e) => {
          s in e
            ? e.options.middleware && t.push(...e.options.middleware)
            : t.push(e);
        });
        let n = v(void 0, { ...r, middleware: t });
        return ((n[s] = !0), n);
      },
      validator: i,
      inputValidator: i,
      handler: (...t) => {
        let [n, i] = t,
          a = { ...r, extractedFn: n, serverFn: i },
          o = [...(a.middleware || []), S(a)];
        return (
          (n.method = r.method),
          Object.assign(
            async (t) => {
              let r = await y(o, `client`, {
                  ...n,
                  ...a,
                  data: t?.data,
                  headers: t?.headers,
                  signal: t?.signal,
                  fetch: t?.fetch,
                  context: g(),
                }),
                i = e(r.error);
              if (i) throw i;
              if (r.error) throw r.error;
              return r.result;
            },
            {
              ...n,
              method: r.method,
              __executeServer: async (e) => {
                let t = _(),
                  i = t.contextAfterGlobalMiddlewares;
                return await y(o, `server`, {
                  ...n,
                  data: e.data,
                  method: e.method ?? r.method,
                  serverFnMeta: n.serverFnMeta,
                  context: h(e.context, i),
                  request: t.request,
                }).then((e) => ({
                  result: e.result,
                  error: e.error,
                  context: e.sendContext,
                }));
              },
            },
          )
        );
      },
    });
  };
async function y(e, t, r) {
  let i = b([...(a()?.functionMiddleware || []), ...e]);
  if (t === `server`) {
    let e = _({ throwIfNotFound: !1 });
    e?.executedRequestMiddlewares &&
      (i = i.filter((t) => !e.executedRequestMiddlewares.has(t)));
  }
  let o = async (e) => {
    let r = i.shift();
    if (!r) return e;
    try {
      let i = `validator` in r.options ? r.options.validator : void 0;
      (!i && `inputValidator` in r.options && (i = r.options.inputValidator),
        i && t === `server` && (e.data = await x(i, e.data)));
      let a;
      if (
        (t === `client`
          ? `client` in r.options && (a = r.options.client)
          : `server` in r.options && (a = r.options.server),
        a)
      ) {
        let t = async (t = {}) => {
            let n = await o({
              ...e,
              ...t,
              context: h(e.context, t.context),
              sendContext: h(e.sendContext, t.sendContext),
              headers: d(e.headers, t.headers),
              _callSiteFetch: e._callSiteFetch,
              fetch: e._callSiteFetch ?? t.fetch ?? e.fetch,
              result:
                t.result === void 0
                  ? t instanceof Response
                    ? t
                    : e.result
                  : t.result,
              error: t.error ?? e.error,
            });
            if (n.error) throw n.error;
            return n;
          },
          r = await a({ ...e, next: t });
        if (n(r)) return { ...e, error: r };
        if (r instanceof Response) return { ...e, result: r };
        if (!r)
          throw Error(
            `User middleware returned undefined. You must call next() or return a result in your middlewares.`,
          );
        return r;
      }
      return o(e);
    } catch (t) {
      return { ...e, error: t };
    }
  };
  return o({
    ...r,
    headers: r.headers || {},
    sendContext: r.sendContext || {},
    context: r.context || g(),
    _callSiteFetch: r.fetch,
  });
}
function b(e, t = 100) {
  let n = new Set(),
    r = [],
    i = (e, a) => {
      if (a > t)
        throw Error(
          `Middleware nesting depth exceeded maximum of ${t}. Check for circular references.`,
        );
      e.forEach((e) => {
        (e.options.middleware && i(e.options.middleware, a + 1),
          n.has(e) || (n.add(e), r.push(e)));
      });
    };
  return (i(e, 0), r);
}
async function x(e, t) {
  if (e == null) return {};
  if (`~standard` in e) {
    let n = await e[`~standard`].validate(t);
    if (n.issues) throw Error(JSON.stringify(n.issues, void 0, 2));
    return n.value;
  }
  if (`parse` in e) return e.parse(t);
  if (typeof e == `function`) return e(t);
  throw Error(`Invalid validator type!`);
}
function S(e) {
  return {
    "~types": void 0,
    options: {
      inputValidator: e.validator ?? e.inputValidator,
      client: async ({ next: t, sendContext: n, fetch: r, ...i }) => {
        let a = { ...i, context: n, fetch: r };
        return t(await e.extractedFn?.(a));
      },
      server: async ({ next: t, ...n }) => {
        let r = await e.serverFn?.(n);
        return t({ ...n, result: r });
      },
    },
  };
}
var C = v({ method: `POST` }).handler(
    o(`706e8c0e4fa7ec33f140e4957fcb2dfdbf96977d08d5188e2af7d7c6334bf2dc`),
  ),
  w = i(),
  T = [
    `Fetching pages`,
    `Mapping links & forms`,
    `Checking up to 30 links`,
    `AI reviewing evidence`,
    `Writing report`,
  ],
  E = [
    `https://example.com`,
    `https://news.ycombinator.com`,
    `https://books.toscrape.com`,
  ];
function D() {
  let e = p(C),
    [t, n] = (0, f.useState)(``),
    [r, i] = (0, f.useState)(!1),
    [a, o] = (0, f.useState)(0),
    [s, c] = (0, f.useState)(null),
    [l, u] = (0, f.useState)(null);
  (0, f.useEffect)(() => {
    if (!r) return;
    o(0);
    let e = setInterval(() => o((e) => Math.min(e + 1, T.length - 1)), 4500);
    return () => clearInterval(e);
  }, [r]);
  async function d(t) {
    let r = t.trim();
    if (r) {
      (/^https?:\/\//i.test(r) || (r = `https://${r}`),
        n(r),
        i(!0),
        c(null),
        u(null));
      try {
        let t = await e({ data: { url: r } });
        t.ok ? u(t) : c(t.error);
      } catch (e) {
        c(e instanceof Error ? e.message : `Something went wrong.`);
      } finally {
        i(!1);
      }
    }
  }
  return (0, w.jsxs)(`div`, {
    className: `min-h-screen bg-background text-foreground`,
    children: [
      (0, w.jsx)(`header`, {
        className: `border-b border-border`,
        children: (0, w.jsxs)(`div`, {
          className: `mx-auto flex max-w-6xl items-center justify-between px-6 py-4 font-mono text-xs uppercase tracking-widest`,
          children: [
            (0, w.jsxs)(`span`, {
              className: `flex items-center gap-2`,
              children: [
                (0, w.jsx)(`span`, {
                  className: `h-2 w-2 rounded-full bg-accent`,
                }),
                `AI QA Tester`,
              ],
            }),
            (0, w.jsx)(`span`, {
              className: `text-muted-foreground`,
              children: `no test scripts required`,
            }),
          ],
        }),
      }),
      (0, w.jsx)(`section`, {
        className: `grid-paper border-b border-border`,
        children: (0, w.jsxs)(`div`, {
          className: `mx-auto max-w-6xl px-6 py-16`,
          children: [
            (0, w.jsx)(`p`, {
              className: `font-mono text-xs uppercase tracking-widest text-accent`,
              children: `// point it at a running app`,
            }),
            (0, w.jsxs)(`h1`, {
              className: `mt-3 max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl`,
              children: [
                `Your QA team of one.`,
                (0, w.jsx)(`br`, {}),
                `Paste a URL, get a bug report.`,
              ],
            }),
            (0, w.jsx)(`p`, {
              className: `mt-4 max-w-xl text-muted-foreground`,
              children: `It scans up to 5 pages, checks up to 30 links, inspects forms, headers and accessibility signals, then AI turns the evidence into fixes a developer can act on.`,
            }),
            (0, w.jsxs)(`form`, {
              onSubmit: (e) => {
                (e.preventDefault(), d(t));
              },
              className: `mt-8 flex max-w-2xl border-2 border-foreground bg-card`,
              children: [
                (0, w.jsx)(`span`, {
                  className: `hidden items-center px-4 font-mono text-sm text-muted-foreground sm:flex`,
                  children: `URL`,
                }),
                (0, w.jsx)(`input`, {
                  value: t,
                  onChange: (e) => n(e.target.value),
                  placeholder: `https://your-app.com`,
                  disabled: r,
                  className: `min-w-0 flex-1 bg-transparent px-3 py-4 font-mono text-sm outline-none`,
                }),
                (0, w.jsx)(`button`, {
                  disabled: r || !t.trim(),
                  className: `bg-foreground px-6 font-mono text-sm uppercase tracking-wider text-background transition hover:bg-accent disabled:opacity-50`,
                  children: r ? `Scanning…` : `Run test`,
                }),
              ],
            }),
            (0, w.jsxs)(`div`, {
              className: `mt-3 flex flex-wrap gap-2 font-mono text-xs text-muted-foreground`,
              children: [
                `try:`,
                E.map((e) =>
                  (0, w.jsx)(
                    `button`,
                    {
                      disabled: r,
                      onClick: () => d(e),
                      className: `underline decoration-dotted hover:text-accent`,
                      children: e.replace(`https://`, ``),
                    },
                    e,
                  ),
                ),
              ],
            }),
          ],
        }),
      }),
      (0, w.jsxs)(`main`, {
        className: `mx-auto max-w-6xl px-6 py-10`,
        children: [
          r && (0, w.jsx)(O, { step: a, url: t }),
          s &&
            (0, w.jsxs)(`div`, {
              className: `border-2 border-bug bg-bug-soft p-5 font-mono text-sm text-bug`,
              children: [`✕ `, s],
            }),
          l && (0, w.jsx)(A, { report: l }),
          !r && !l && !s && (0, w.jsx)(k, {}),
        ],
      }),
    ],
  });
}
function O({ step: e, url: t }) {
  return (0, w.jsxs)(`div`, {
    className: `relative overflow-hidden border-2 border-foreground bg-card p-6`,
    children: [
      (0, w.jsx)(`div`, {
        className: `pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-accent/15 to-transparent animate-scanline`,
      }),
      (0, w.jsxs)(`p`, {
        className: `font-mono text-xs text-muted-foreground`,
        children: [`target: `, t],
      }),
      (0, w.jsx)(`ol`, {
        className: `mt-4 space-y-2 font-mono text-sm`,
        children: T.map((t, n) =>
          (0, w.jsxs)(
            `li`,
            {
              className:
                n < e
                  ? `text-verified`
                  : n === e
                    ? `text-foreground`
                    : `text-muted-foreground/50`,
              children: [
                n < e ? `✓` : n === e ? `▸` : `·`,
                ` `,
                t,
                n === e ? `…` : ``,
              ],
            },
            t,
          ),
        ),
      }),
      (0, w.jsx)(`p`, {
        className: `mt-4 text-xs text-muted-foreground`,
        children: `Usually 20–60 seconds.`,
      }),
    ],
  });
}
function k() {
  return (0, w.jsx)(`div`, {
    className: `grid gap-px border border-border bg-border md:grid-cols-4`,
    children: [
      [
        `01 Collect`,
        `Fetches the target plus up to 4 internal pages and records status, speed, forms and selected headers.`,
      ],
      [
        `02 Verify`,
        `Checks up to 30 discovered links. Only clear 404/410/5xx responses are promoted as verified broken links.`,
      ],
      [
        `03 Review`,
        `AI interprets the collected evidence and proposes additional bugs and improvements without relying on handwritten test cases.`,
      ],
      [
        `04 Triage`,
        `Verified vs AI-inferred labels, confidence scores and dismiss controls make uncertainty visible.`,
      ],
    ].map(([e, t]) =>
      (0, w.jsxs)(
        `div`,
        {
          className: `bg-background p-5`,
          children: [
            (0, w.jsx)(`p`, {
              className: `font-mono text-xs uppercase tracking-widest text-accent`,
              children: e,
            }),
            (0, w.jsx)(`p`, {
              className: `mt-2 text-sm text-muted-foreground`,
              children: t,
            }),
          ],
        },
        e,
      ),
    ),
  });
}
function A({ report: e }) {
  let t = `qa-dismissed:${e.target}`,
    [n, r] = (0, f.useState)([]),
    [i, a] = (0, f.useState)(`all`),
    [o, s] = (0, f.useState)(!1);
  (0, f.useEffect)(() => {
    try {
      r(JSON.parse(localStorage.getItem(t) ?? `[]`));
    } catch {}
  }, [t]);
  let c = (e) => `${e.title}|${e.evidence}`,
    l = (e) => {
      let i = c(e),
        a = n.includes(i) ? n.filter((e) => e !== i) : [...n, i];
      (r(a), localStorage.setItem(t, JSON.stringify(a)));
    },
    u = e.findings.filter((e) => !n.includes(c(e))),
    d = u.filter((e) => i === `all` || e.kind === i),
    p = d.filter((e) => e.confidence >= 0.5),
    m = d.filter((e) => e.confidence < 0.5),
    h = u.filter((e) => e.kind === `bug`).length,
    g = u.filter((e) => e.kind === `improvement`).length,
    _ = e.findings.filter((e) => n.includes(c(e))),
    v = (0, f.useMemo)(() => N(e, u), [e, u]);
  return (0, w.jsxs)(`div`, {
    className: `space-y-8`,
    children: [
      (0, w.jsxs)(`div`, {
        className: `grid gap-px border-2 border-foreground bg-foreground md:grid-cols-[220px_1fr]`,
        children: [
          (0, w.jsxs)(`div`, {
            className: `flex flex-col justify-center bg-card p-6`,
            children: [
              (0, w.jsx)(`p`, {
                className: `font-mono text-xs uppercase tracking-widest text-muted-foreground`,
                children: `Evidence score`,
              }),
              (0, w.jsxs)(`p`, {
                className: `text-7xl font-bold tracking-tighter`,
                children: [
                  e.score,
                  (0, w.jsx)(`span`, {
                    className: `text-2xl text-muted-foreground`,
                    children: `/100`,
                  }),
                ],
              }),
              (0, w.jsx)(`p`, {
                className: `mt-2 font-mono text-[10px] leading-relaxed text-muted-foreground`,
                children: `Calculated from finding severity × confidence, not generated by AI.`,
              }),
            ],
          }),
          (0, w.jsxs)(`div`, {
            className: `bg-card p-6`,
            children: [
              (0, w.jsxs)(`p`, {
                className: `font-mono text-xs text-muted-foreground`,
                children: [
                  e.target,
                  ` · `,
                  e.pagesScanned.length,
                  ` pages · `,
                  e.linksChecked,
                  ` links checked · `,
                  (e.durationMs / 1e3).toFixed(1),
                  `s scan`,
                ],
              }),
              (0, w.jsx)(`p`, {
                className: `mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground`,
                children: `Prototype scope: URL-based black-box evidence scan · no source-code access · no interactive browser actions`,
              }),
              (0, w.jsx)(`p`, {
                className: `mt-3 text-lg leading-relaxed`,
                children: e.summary,
              }),
              (0, w.jsxs)(`div`, {
                className: `mt-4 flex flex-wrap gap-3 font-mono text-sm`,
                children: [
                  (0, w.jsxs)(`span`, {
                    className: `bg-bug-soft px-3 py-1 text-bug`,
                    children: [h, ` bugs`],
                  }),
                  (0, w.jsxs)(`span`, {
                    className: `bg-improve-soft px-3 py-1 text-improve`,
                    children: [g, ` improvements`],
                  }),
                  (0, w.jsx)(`button`, {
                    onClick: () => navigator.clipboard.writeText(v),
                    className: `border border-foreground px-3 py-1 hover:bg-foreground hover:text-background`,
                    children: `Copy as Markdown`,
                  }),
                  (0, w.jsx)(`button`, {
                    onClick: () => P(v),
                    className: `border border-foreground px-3 py-1 hover:bg-foreground hover:text-background`,
                    children: `Download report`,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      (0, w.jsx)(`div`, {
        className: `flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider`,
        children: [`all`, `bug`, `improvement`].map((e) =>
          (0, w.jsx)(
            `button`,
            {
              onClick: () => a(e),
              className: `border px-3 py-1.5 ${i === e ? `border-foreground bg-foreground text-background` : `border-border hover:border-foreground`}`,
              children:
                e === `all` ? `All` : e === `bug` ? `Bugs` : `Improvements`,
            },
            e,
          ),
        ),
      }),
      (0, w.jsxs)(`div`, {
        className: `space-y-3`,
        children: [
          p.length === 0 &&
            (0, w.jsx)(`p`, {
              className: `text-muted-foreground`,
              children: `No high-confidence findings in this view.`,
            }),
          p.map((e) => (0, w.jsx)(j, { f: e, onDismiss: () => l(e) }, e.id)),
        ],
      }),
      m.length > 0 &&
        (0, w.jsxs)(`div`, {
          children: [
            (0, w.jsxs)(`button`, {
              onClick: () => s(!o),
              className: `font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground`,
              children: [
                o ? `▾` : `▸`,
                ` `,
                m.length,
                ` low-confidence findings (may be false positives)`,
              ],
            }),
            o &&
              (0, w.jsx)(`div`, {
                className: `mt-3 space-y-3 opacity-80`,
                children: m.map((e) =>
                  (0, w.jsx)(j, { f: e, onDismiss: () => l(e) }, e.id),
                ),
              }),
          ],
        }),
      _.length > 0 &&
        (0, w.jsxs)(`div`, {
          className: `border-t border-border pt-4 font-mono text-xs text-muted-foreground`,
          children: [
            `Dismissed as not-a-problem (`,
            _.length,
            `) — remembered for this site:`,
            _.map((e) =>
              (0, w.jsxs)(
                `button`,
                {
                  onClick: () => l(e),
                  className: `ml-2 underline decoration-dotted hover:text-foreground`,
                  children: [`↺ `, e.title],
                },
                e.id,
              ),
            ),
          ],
        }),
      (0, w.jsxs)(`details`, {
        className: `border border-border p-4 font-mono text-xs`,
        children: [
          (0, w.jsx)(`summary`, {
            className: `cursor-pointer uppercase tracking-wider text-muted-foreground`,
            children: `Pages scanned`,
          }),
          (0, w.jsx)(`ul`, {
            className: `mt-3 space-y-1`,
            children: e.pagesScanned.map((e) =>
              (0, w.jsxs)(
                `li`,
                {
                  children: [
                    e.status,
                    ` · `,
                    e.ms,
                    `ms · `,
                    e.url,
                    ` `,
                    e.title ? `— ${e.title}` : ``,
                  ],
                },
                e.url,
              ),
            ),
          }),
        ],
      }),
    ],
  });
}
function j({ f: e, onDismiss: t }) {
  let [n, r] = (0, f.useState)(!1),
    i = e.kind === `bug`;
  return (0, w.jsxs)(`article`, {
    className: `border-l-4 bg-card ${i ? `border-bug` : `border-improve`} border-y border-r border-y-border border-r-border`,
    children: [
      (0, w.jsxs)(`button`, {
        onClick: () => r(!n),
        className: `flex w-full items-start gap-4 p-4 text-left`,
        children: [
          (0, w.jsx)(`span`, {
            className: `mt-0.5 shrink-0 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${i ? `bg-bug-soft text-bug` : `bg-improve-soft text-improve`}`,
            children: i ? `Bug` : `Improve`,
          }),
          (0, w.jsxs)(`div`, {
            className: `min-w-0 flex-1`,
            children: [
              (0, w.jsx)(`h3`, { className: `font-medium`, children: e.title }),
              (0, w.jsxs)(`p`, {
                className: `mt-1 flex flex-wrap gap-x-3 font-mono text-xs text-muted-foreground`,
                children: [
                  (0, w.jsx)(`span`, {
                    className: `uppercase`,
                    children: e.severity,
                  }),
                  (0, w.jsx)(`span`, { children: e.category }),
                  (0, w.jsxs)(`span`, {
                    children: [Math.round(e.confidence * 100), `% confidence`],
                  }),
                  e.source === `verified`
                    ? (0, w.jsx)(`span`, {
                        className: `text-verified`,
                        children: `✓ verified by check`,
                      })
                    : (0, w.jsx)(`span`, { children: `AI-inferred` }),
                ],
              }),
            ],
          }),
          (0, w.jsx)(`span`, {
            className: `font-mono text-muted-foreground`,
            children: n ? `−` : `+`,
          }),
        ],
      }),
      n &&
        (0, w.jsxs)(`div`, {
          className: `grid gap-4 border-t border-border p-4 text-sm md:grid-cols-2`,
          children: [
            (0, w.jsx)(M, {
              label: `Evidence`,
              children: (0, w.jsx)(`code`, {
                className: `block break-all bg-muted p-2 font-mono text-xs`,
                children: e.evidence,
              }),
            }),
            (0, w.jsx)(M, {
              label: `Page`,
              children: (0, w.jsx)(`span`, {
                className: `break-all font-mono text-xs`,
                children: e.page,
              }),
            }),
            (0, w.jsx)(M, {
              label: `Why it matters`,
              children: e.whyItMatters,
            }),
            (0, w.jsx)(M, { label: `How to fix`, children: e.howToFix }),
            e.reproSteps.length > 0 &&
              (0, w.jsx)(M, {
                label: `Steps to reproduce`,
                children: (0, w.jsx)(`ol`, {
                  className: `list-decimal pl-5`,
                  children: e.reproSteps.map((e, t) =>
                    (0, w.jsx)(`li`, { children: e }, t),
                  ),
                }),
              }),
            (0, w.jsx)(`div`, {
              className: `flex items-end justify-end`,
              children: (0, w.jsx)(`button`, {
                onClick: t,
                className: `font-mono text-xs uppercase tracking-wider text-muted-foreground underline decoration-dotted hover:text-foreground`,
                children: `Not a problem — dismiss`,
              }),
            }),
          ],
        }),
    ],
  });
}
function M({ label: e, children: t }) {
  return (0, w.jsxs)(`div`, {
    children: [
      (0, w.jsx)(`p`, {
        className: `mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground`,
        children: e,
      }),
      t,
    ],
  });
}
function N(e, t) {
  return [
    `# QA report: ${e.target}`,
    `Score: ${e.score}/100`,
    ``,
    e.summary,
    ``,
    ...t.map(
      (e) =>
        `## [${e.kind.toUpperCase()} · ${e.severity}] ${e.title}\n- Page: ${e.page}\n- Evidence: \`${e.evidence}\`\n- Confidence: ${Math.round(e.confidence * 100)}% (${e.source})\n- Why: ${e.whyItMatters}\n- Fix: ${e.howToFix}\n${e.reproSteps.map(
          (e, t) => `  ${t + 1}. ${e}`,
        ).join(`
`)}\n`,
    ),
  ].join(`
`);
}
function P(e) {
  let t = document.createElement(`a`);
  ((t.href = URL.createObjectURL(new Blob([e], { type: `text/markdown` }))),
    (t.download = `qa-report.md`),
    t.click());
}
export { D as component };
