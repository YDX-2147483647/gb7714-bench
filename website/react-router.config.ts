import { readFile } from "node:fs/promises";
import type { Config } from "@react-router/dev/config";

export default {
  // https://reactrouter.com/how-to/pre-rendering#pre-rendering-with-ssrfalse
  ssr: false,
  // return a list of URLs to prerender at build time
  async prerender({ getStaticPaths }) {
    const entries = await readFile(
      "../data/data/GB-T_7714—2025.builtin.json",
      "utf-8",
    );
    const ids = (JSON.parse(entries) as { id: string }[]).map((e) => e.id);
    return [
      ...getStaticPaths(),
      ...ids.map((id) => `/entry/${id.replace(":", "-")}/`),
    ];
  },
} satisfies Config;
