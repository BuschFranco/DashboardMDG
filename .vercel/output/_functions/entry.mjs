import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter__YtUyk2U.mjs';
import { manifest } from './manifest_BTCDiNRG.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/_token_.astro.mjs');
const _page2 = () => import('./pages/api/delete-request.astro.mjs');
const _page3 = () => import('./pages/api/requests.astro.mjs');
const _page4 = () => import('./pages/api/update-approval.astro.mjs');
const _page5 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/[token].astro", _page1],
    ["src/pages/api/delete-request.ts", _page2],
    ["src/pages/api/requests.ts", _page3],
    ["src/pages/api/update-approval.ts", _page4],
    ["src/pages/index.astro", _page5]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "ff28ab5a-d269-4647-a96e-617852e84caa",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
