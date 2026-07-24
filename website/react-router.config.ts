import type { Config } from "@react-router/dev/config";

export default {
  // https://reactrouter.com/how-to/pre-rendering#pre-rendering-with-ssrfalse
  // https://reactrouter.com/how-to/spa#4-direct-all-urls-to-indexhtml
  // Note that enabling pre-rendering for `/` causes the SPA fallback to change from `/index.html` to `/__spa-fallback.html`.
  // Therefore, `_redirects` should be different from the usual setup.
  ssr: false,
  prerender: [
    "/",
    "/changelog/",
    "/version/",
    "/entry/",
    "/compare/",
    "/converge/",
    "/diagram.svg",
    "/diagram.pdf",
  ],
} satisfies Config;
