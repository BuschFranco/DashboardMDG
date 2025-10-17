import { e as createComponent, f as createAstro, r as renderTemplate, k as defineScriptVars, l as renderComponent, m as maybeRenderHead } from '../../chunks/astro/server_CTRzzXLj.mjs';
import 'kleur/colors';
import { $ as $$Dashboard, a as $$Layout } from '../../chunks/Dashboard_KoIr0mlP.mjs';
/* empty css                                      */
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$token = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$token;
  const { token } = Astro2.params;
  const ADMIN_TOKEN = process.env.ADMIN_APPROVAL_TOKEN || "4444";
  const isValidToken = token === ADMIN_TOKEN;
  if (!isValidToken) {
    return Astro2.redirect("/404");
  }
  return renderTemplate(_a || (_a = __template(["", "  <script>(function(){", "\n  // Agregar token a la ventana global para uso en JavaScript\n  window.adminToken = token;\n  window.isAdminMode = true;\n  \n  // Debug logs\n  console.log('Admin mode initialized:', {\n    token: window.adminToken,\n    isAdminMode: window.isAdminMode\n  });\n})();<\/script>"])), renderComponent($$result, "Layout", $$Layout, { "title": "Dashboard Admin - Gesti\xF3n de Aprobaciones", "data-astro-cid-x3puz4g3": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="admin-dashboard" data-astro-cid-x3puz4g3> <div class="admin-header" data-astro-cid-x3puz4g3> <h1 class="admin-title" data-astro-cid-x3puz4g3>Panel de Administración</h1> <p class="admin-subtitle" data-astro-cid-x3puz4g3>Gestión de aprobaciones con permisos especiales</p> <div class="admin-badge" data-astro-cid-x3puz4g3> <span data-astro-cid-x3puz4g3>🔐 Acceso Autorizado</span> </div> </div> ${renderComponent($$result2, "Dashboard", $$Dashboard, { "data-astro-cid-x3puz4g3": true })} </div> ` }), defineScriptVars({ token }));
}, "C:/MDG/DashboardMDG/src/pages/admin/[token].astro", void 0);

const $$file = "C:/MDG/DashboardMDG/src/pages/admin/[token].astro";
const $$url = "/admin/[token]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$token,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
