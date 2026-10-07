import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const runScan = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ url: z.string().url() }).parse(d))
  .handler(async ({ data }) => {
    const u = new URL(data.url);
    if (!/^https?:$/.test(u.protocol) || /^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname)) {
      return { ok: false as const, error: "Please enter a public http(s) URL." };
    }
    const { crawl } = await import("./scanner.server");
    const { analyze } = await import("./analyze.server");
    let scan;
    try {
      scan = await crawl(u.toString());
    } catch (e) {
      return { ok: false as const, error: `Could not reach the site: ${e instanceof Error ? e.message : "unknown error"}` };
    }
    try {
      const report = await analyze(scan);
      return {
        ok: true as const,
        target: scan.target,
        durationMs: scan.durationMs,
        pagesScanned: scan.pages.map((p) => ({ url: p.finalUrl, status: p.status, ms: p.ms, title: p.title })),
        linksChecked: scan.linkChecks.length,
        ...report,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const status = (e as { statusCode?: number })?.statusCode;
      if (status === 402) return { ok: false as const, error: "AI credits are used up. Add credits in workspace billing." };
      if (status === 429) return { ok: false as const, error: "AI is busy (rate limited). Try again in a minute." };
      return { ok: false as const, error: `AI analysis failed: ${msg}` };
    }
  });
