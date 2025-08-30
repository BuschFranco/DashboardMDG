import { e as createComponent, l as renderComponent, r as renderTemplate } from '../chunks/astro/server_CTRzzXLj.mjs';
import 'kleur/colors';
import { a as $$Layout, $ as $$Dashboard } from '../chunks/Dashboard_XsOLJgrD.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Dashboard DevRequest" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Dashboard", $$Dashboard, {})} ` })}`;
}, "F:/MDG/Internos/Dashboard/src/pages/index.astro", void 0);

const $$file = "F:/MDG/Internos/Dashboard/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
