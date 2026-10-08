import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  assertSafePublicUrl,
  privateTargetsAllowed,
} from "./url-safety.server";

export const runScan = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ url: z.string().url().max(2048) }).parse(d),
  )
  .handler(async ({ data }) => {
    const startedAt = Date.now();
    let u: URL;
    try {
      u = await assertSafePublicUrl(data.url, {
        allowPrivate: privateTargetsAllowed(),
      });
    } catch (e) {
      return {
        ok: false as const,
        error:
          e instanceof Error
            ? e.message
            : "Please enter an allowed http(s) URL.",
      };
    }

    const { crawl } = await import("./scanner.server");
    const { exploreWithBrowser } = await import("./browser-agent.server");
    const { analyze } = await import("./analyze.server");

    let scan;
    let browser;
    try {
      [scan, browser] = await Promise.all([
        crawl(u.toString()),
        exploreWithBrowser(u.toString()),
      ]);
    } catch (e) {
      return {
        ok: false as const,
        error: `Could not reach the site: ${e instanceof Error ? e.message : "unknown error"}`,
      };
    }

    try {
      const report = await analyze(scan, browser);
      return {
        ok: true as const,
        target: scan.target,
        durationMs: Date.now() - startedAt,
        pagesScanned: scan.pages.map((p) => ({
          url: p.finalUrl,
          status: p.status,
          ms: p.ms,
          title: p.title,
        })),
        linksChecked: scan.linkChecks.length,
        browser,
        scope: {
          approach: "Deterministic scan + one-shot AI test plan + Playwright",
          pageLimit: 5,
          linkLimit: 30,
          browserTestLimit: browser.maxTests,
          interactiveBrowserTests: browser.steps.length,
        },
        ...report,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const status = (e as { statusCode?: number })?.statusCode;
      if (status === 402)
        return {
          ok: false as const,
          error: "AI credits are used up. Add credits in workspace billing.",
        };
      if (status === 429)
        return {
          ok: false as const,
          error: "AI is rate limited. Try again shortly.",
        };
      return { ok: false as const, error: `AI analysis failed: ${msg}` };
    }
  });
