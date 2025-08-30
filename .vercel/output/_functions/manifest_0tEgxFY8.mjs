import 'kleur/colors';
import { q as decodeKey } from './chunks/astro/server_CTRzzXLj.mjs';
import 'clsx';
import 'cookie';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_DvLdmU1D.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///F:/MDG/Internos/Dashboard/","cacheDir":"file:///F:/MDG/Internos/Dashboard/node_modules/.astro/","outDir":"file:///F:/MDG/Internos/Dashboard/dist/","srcDir":"file:///F:/MDG/Internos/Dashboard/src/","publicDir":"file:///F:/MDG/Internos/Dashboard/public/","buildClientDir":"file:///F:/MDG/Internos/Dashboard/dist/client/","buildServerDir":"file:///F:/MDG/Internos/Dashboard/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_token_.DINd-bc9.css"},{"type":"inline","content":".admin-dashboard[data-astro-cid-x3puz4g3]{position:relative}.admin-header[data-astro-cid-x3puz4g3]{text-align:center;margin-bottom:2rem;padding:2rem;background:linear-gradient(135deg,#059669,#047857,#065f46);border-radius:16px;margin-top:6rem;box-shadow:0 10px 25px #0596694d}.admin-title[data-astro-cid-x3puz4g3]{font-size:2.5rem;font-weight:700;color:#fff;margin-bottom:.5rem;text-shadow:0 2px 4px rgba(0,0,0,.3)}.admin-subtitle[data-astro-cid-x3puz4g3]{font-size:1.2rem;color:#ffffffe6;margin-bottom:1rem}.admin-badge[data-astro-cid-x3puz4g3]{display:inline-block;background:#fff3;backdrop-filter:blur(10px);padding:.5rem 1rem;border-radius:20px;border:1px solid rgba(255,255,255,.3)}.admin-badge[data-astro-cid-x3puz4g3] span[data-astro-cid-x3puz4g3]{color:#fff;font-weight:600;font-size:.9rem}.admin-dashboard[data-astro-cid-x3puz4g3] .dashboard-header{display:none}.admin-dashboard[data-astro-cid-x3puz4g3] .dashboard-container{padding-top:0}\n"}],"routeData":{"route":"/admin/[token]","isIndex":false,"type":"page","pattern":"^\\/admin\\/([^/]+?)\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"token","dynamic":true,"spread":false}]],"params":["token"],"component":"src/pages/admin/[token].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/requests","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/requests\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"requests","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/requests.ts","pathname":"/api/requests","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/update-approval","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/update-approval\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"update-approval","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/update-approval.ts","pathname":"/api/update-approval","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_token_.DINd-bc9.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["F:/MDG/Internos/Dashboard/src/pages/admin/[token].astro",{"propagation":"none","containsHead":true}],["F:/MDG/Internos/Dashboard/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000noop-actions":"_noop-actions.mjs","\u0000@astro-page:src/pages/admin/[token]@_@astro":"pages/admin/_token_.astro.mjs","\u0000@astro-page:src/pages/api/requests@_@ts":"pages/api/requests.astro.mjs","\u0000@astro-page:src/pages/api/update-approval@_@ts":"pages/api/update-approval.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_0tEgxFY8.mjs","F:/MDG/Internos/Dashboard/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_DbyEc_zJ.mjs","F:/MDG/Internos/Dashboard/src/components/Dashboard.astro?astro&type=script&index=0&lang.ts":"_astro/Dashboard.astro_astro_type_script_index_0_lang.DX9UZ8Ff.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/_token_.DINd-bc9.css","/favicon.svg","/MDGlogo.png","/_astro/Dashboard.astro_astro_type_script_index_0_lang.DX9UZ8Ff.js"],"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"hUNC6gQYxkXiNqHgkctgkhLG7HoU4+nKAmIMf7GjVSo="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
