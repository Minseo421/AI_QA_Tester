//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-DOrvgjvR.js
var manifest = {
  "706e8c0e4fa7ec33f140e4957fcb2dfdbf96977d08d5188e2af7d7c6334bf2dc": {
    functionName: "runScan_createServerFn_handler",
    importer: () => import("./_ssr/qa.functions-B8TTxYL9.mjs"),
  },
};
async function getServerFnById(id, access) {
  const serverFnInfo = manifest[id];
  if (!serverFnInfo)
    throw new Error("Server function info not found for " + id);
  const fnModule = (serverFnInfo.module ??= await serverFnInfo.importer());
  if (!fnModule)
    throw new Error("Server function module not resolved for " + id);
  const action = fnModule[serverFnInfo.functionName];
  if (!action)
    throw new Error(
      "Server function module export not resolved for serverFn ID: " + id,
    );
  return action;
}
//#endregion
export { getServerFnById as t };
