import { a as stringType, i as objectType } from "../_libs/zod.mjs";
import {
  a as TSS_SERVER_FUNCTION,
  l as createServerFn,
} from "./createServerFn-DDDJMFWM.mjs";
import { t as assertSafePublicUrl } from "./url-safety.server-lTzhy_NQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/qa.functions-B8TTxYL9.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true,
  });
};
var runScan_createServerFn_handler = createServerRpc(
  {
    id: "706e8c0e4fa7ec33f140e4957fcb2dfdbf96977d08d5188e2af7d7c6334bf2dc",
    name: "runScan",
    filename: "src/lib/qa.functions.ts",
  },
  (opts) => runScan.__executeServer(opts),
);
var runScan = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    objectType({ url: stringType().url().max(2048) }).parse(d),
  )
  .handler(runScan_createServerFn_handler, async ({ data }) => {
    let u;
    try {
      u = await assertSafePublicUrl(data.url);
    } catch (e) {
      return {
        ok: false,
        error:
          e instanceof Error ? e.message : "Please enter a public http(s) URL.",
      };
    }
    const { crawl } = await import("./scanner.server-CdLhdxxm.mjs");
    const { analyze } = await import("./analyze.server-Bs0vnb0m.mjs");
    let scan;
    try {
      scan = await crawl(u.toString());
    } catch (e) {
      return {
        ok: false,
        error: `Could not reach the site: ${e instanceof Error ? e.message : "unknown error"}`,
      };
    }
    try {
      const report = await analyze(scan);
      return {
        ok: true,
        target: scan.target,
        durationMs: scan.durationMs,
        pagesScanned: scan.pages.map((p) => ({
          url: p.finalUrl,
          status: p.status,
          ms: p.ms,
          title: p.title,
        })),
        linksChecked: scan.linkChecks.length,
        scope: {
          approach: "URL-based black-box evidence scan",
          pageLimit: 5,
          linkLimit: 30,
          interactiveBrowserActions: false,
        },
        ...report,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const status = e?.statusCode;
      if (status === 402)
        return {
          ok: false,
          error: "AI credits are used up. Add credits in workspace billing.",
        };
      if (status === 429)
        return {
          ok: false,
          error: "AI is rate limited. Try again shortly.",
        };
      return {
        ok: false,
        error: `AI analysis failed: ${msg}`,
      };
    }
  });
//#endregion
export { runScan_createServerFn_handler };
