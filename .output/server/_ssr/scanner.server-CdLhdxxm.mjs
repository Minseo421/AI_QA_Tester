import { t as assertSafePublicUrl } from "./url-safety.server-lTzhy_NQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scanner.server-CdLhdxxm.js
var UA = "Mozilla/5.0 (compatible; AIQATester/1.0)";
var strip = (s) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
var attr = (tag, name) => {
  const m = tag.match(
    new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return m ? (m[2] ?? m[3] ?? m[4] ?? "") : null;
};
async function timedFetch(url, method = "GET", timeout = 1e4) {
  const started = Date.now();
  let current = url;
  for (let redirectCount = 0; redirectCount <= 5; redirectCount++) {
    await assertSafePublicUrl(current);
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(current, {
        method,
        redirect: "manual",
        signal: ctrl.signal,
        headers: {
          "User-Agent": UA,
          Accept: "text/html,*/*",
        },
      });
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location)
          return {
            res,
            ms: Date.now() - started,
          };
        current = new URL(location, current).toString();
        continue;
      }
      return {
        res,
        ms: Date.now() - started,
      };
    } finally {
      clearTimeout(id);
    }
  }
  throw new Error("Too many redirects.");
}
function parse(url, finalUrl, html) {
  const base = new URL(finalUrl);
  const tags = (re) => html.match(re) ?? [];
  const metas = tags(/<meta\b[^>]*>/gi);
  const meta = (n) => {
    const t = metas.find(
      (m) => (attr(m, "name") ?? attr(m, "property"))?.toLowerCase() === n,
    );
    return t ? attr(t, "content") : null;
  };
  const titleM = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? "";
  const imgs = tags(/<img\b[^>]*>/gi);
  const imagesMissingAlt = imgs
    .filter((i) => attr(i, "alt") === null)
    .map((i) => attr(i, "src") ?? "(no src)")
    .slice(0, 15);
  const headingOutline = (
    html.match(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/gi) ?? []
  )
    .map((h) => `${h.slice(1, 3).toUpperCase()}: ${strip(h).slice(0, 80)}`)
    .slice(0, 30);
  const labelsFor = new Set(
    tags(/<label\b[^>]*>/gi)
      .map((l) => attr(l, "for"))
      .filter(Boolean),
  );
  const forms = (html.match(/<form\b[\s\S]*?<\/form>/gi) ?? [])
    .slice(0, 8)
    .map((f) => {
      const open = f.match(/<form\b[^>]*>/i)[0];
      const inputs = (
        f.match(/<(input|textarea|select)\b[^>]*>/gi) ?? []
      ).filter((i) => !/type\s*=\s*["']?(hidden|submit|button)/i.test(i));
      const wrappedLabels = f.match(/<label\b[^>]*>[\s\S]*?<\/label>/gi) ?? [];
      const desc = inputs.map(
        (i) =>
          `${attr(i, "type") ?? i.match(/<(\w+)/)[1]} name=${attr(i, "name") ?? "?"}${/\srequired/i.test(i) ? " required" : ""}`,
      );
      const unlabeled = inputs
        .filter((i) => {
          const id = attr(i, "id");
          const explicitlyLabeled = !!id && labelsFor.has(id);
          const implicitlyLabeled = wrappedLabels.some((label) =>
            label.includes(i),
          );
          return (
            !explicitlyLabeled &&
            !implicitlyLabeled &&
            !attr(i, "aria-label") &&
            !attr(i, "aria-labelledby")
          );
        })
        .map((i) => attr(i, "name") ?? attr(i, "placeholder") ?? "(unnamed)");
      return {
        action: attr(open, "action") ?? "(none)",
        method: (attr(open, "method") ?? "get").toUpperCase(),
        inputs: desc,
        unlabeled,
      };
    });
  const buttonsWithoutText = (
    html.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) ?? []
  ).filter((b) => {
    const open = b.match(/<button\b[^>]*>/i)[0];
    const imageAlts = (b.match(/<img\b[^>]*>/gi) ?? [])
      .map((img) => attr(img, "alt"))
      .filter((value) => value && value.trim());
    return (
      !strip(b) &&
      !attr(open, "aria-label") &&
      !attr(open, "aria-labelledby") &&
      imageAlts.length === 0
    );
  }).length;
  const links = /* @__PURE__ */ new Set();
  for (const a of tags(/<a\b[^>]*>/gi)) {
    const h = attr(a, "href");
    if (!h || /^(#|mailto:|tel:|javascript:)/i.test(h)) continue;
    try {
      const u = new URL(h, base);
      u.hash = "";
      if (u.protocol.startsWith("http")) links.add(u.toString());
    } catch {}
  }
  const mixedContent =
    base.protocol === "https:"
      ? (html.match(/(src|href)\s*=\s*["']http:\/\/[^"']+/gi) ?? [])
          .map((m) => m.split(/["']/)[1])
          .slice(0, 10)
      : [];
  const body = html.replace(
    /<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi,
    " ",
  );
  return {
    url,
    finalUrl,
    title: titleM ? strip(titleM[1]) : null,
    metaDescription: meta("description"),
    lang: attr(htmlTag, "lang"),
    viewport: meta("viewport"),
    h1s: headingOutline
      .filter((h) => h.startsWith("H1"))
      .map((h) => h.slice(4)),
    headingOutline,
    imagesTotal: imgs.length,
    imagesMissingAlt,
    forms,
    buttonsWithoutText,
    links: [...links],
    scripts: tags(/<script\b/gi).length,
    stylesheets: tags(/<link\b[^>]*stylesheet[^>]*>/gi).length,
    mixedContent,
    textExcerpt: strip(body).slice(0, 2500),
  };
}
async function scanPage(url) {
  const { res, ms } = await timedFetch(url, "GET", 15e3);
  const html = await res.text();
  const headers = {};
  for (const k of [
    "content-type",
    "content-security-policy",
    "strict-transport-security",
    "x-frame-options",
    "x-content-type-options",
    "cache-control",
    "server",
  ]) {
    const v = res.headers.get(k);
    if (v) headers[k] = v.slice(0, 120);
  }
  return {
    ...parse(url, res.url || url, html),
    status: res.status,
    ms,
    bytes: html.length,
    headers,
  };
}
async function checkLink(url) {
  const t = Date.now();
  try {
    let { res } = await timedFetch(url, "HEAD", 8e3);
    if (res.status === 405 || res.status === 403 || res.status === 501)
      ({ res } = await timedFetch(url, "GET", 8e3));
    return {
      url,
      status: res.status,
      ok: res.status < 400,
      ms: Date.now() - t,
    };
  } catch (e) {
    return {
      url,
      status: null,
      ok: false,
      error: e instanceof Error ? e.name : "error",
      ms: Date.now() - t,
    };
  }
}
async function pool(items, n, fn) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    }),
  );
  return out;
}
async function crawl(target) {
  const start = Date.now();
  const home = await scanPage(target);
  const origin = new URL(home.finalUrl).origin;
  const pages = [
    home,
    ...(
      await pool(
        home.links
          .filter((l) => {
            try {
              return (
                new URL(l).origin === origin &&
                l !== home.finalUrl &&
                !/\.(pdf|png|jpe?g|gif|zip|svg)$/i.test(l)
              );
            } catch {
              return false;
            }
          })
          .slice(0, 4),
        4,
        async (u) => {
          try {
            return await scanPage(u);
          } catch {
            return null;
          }
        },
      )
    ).filter((p) => !!p),
  ];
  return {
    target,
    pages,
    linkChecks: await pool(
      [...new Set(pages.flatMap((p) => p.links))]
        .filter((l) => !pages.some((p) => p.finalUrl === l))
        .slice(0, 30),
      6,
      checkLink,
    ),
    durationMs: Date.now() - start,
  };
}
//#endregion
export { crawl };
