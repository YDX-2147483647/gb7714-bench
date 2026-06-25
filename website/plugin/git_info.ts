import { execa } from "execa";
import type { Plugin } from "vite";

export function gitInfo(): Plugin {
  const name = "gb7714-bench-git-info";
  const virtualModuleId = `virtual:${name}`;
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  return {
    name,
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    async load(id: string) {
      if (id !== resolvedVirtualModuleId) {
        return;
      }

      const commitDate = (
        await execa("git", ["log", "-1", "--format=%cd", "--date=iso-strict"])
      ).stdout;
      const revision = (await execa("git", ["rev-parse", "HEAD"])).stdout;
      const revisionUrl = `https://github.com/YDX-2147483647/gb7714-bench/tree/${revision}`;

      return `
      export const commitDate = ${JSON.stringify(commitDate)};
      export const revisionUrl = ${JSON.stringify(revisionUrl)};
      `;
    },
  };
}
