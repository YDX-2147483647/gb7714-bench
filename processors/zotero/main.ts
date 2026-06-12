import { readFileSync } from "node:fs";
import path from "node:path";
import { argv, stdin } from "node:process";
import { fileURLToPath } from "node:url";

import { Cite, plugins } from "@citation-js/core";
import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-csl";

const ROOT_DIR = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));

const styleCache = (filename: string): string =>
  readFileSync(path.join(ROOT_DIR, "target/style-cache", filename), "utf-8");

const config = plugins.config.get("@csl");
config.locales.add("zh-CN", styleCache("locales-zh-CN.xml"));
for (
  const template of [
    "gb-7714-2015-numeric.compliant",
    "gb-7714-2025-numeric.compliant",
    "gb-7714-2025-numeric.extended",
  ]
) {
  config.templates.add(template, styleCache(`${template}.csl`));
}

const source = Buffer.concat(await Array.fromAsync(stdin)).toString("utf-8");
const template = argv[2] as string;

const data = new Cite(source);
const bibliography = data.format("bibliography", { template, format: "text" });
console.log(bibliography);
