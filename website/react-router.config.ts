import type { Config } from "@react-router/dev/config";

export default {
  // https://reactrouter.com/how-to/pre-rendering#pre-rendering-with-ssrfalse
  ssr: false,
  prerender: ["/"],
} satisfies Config;
