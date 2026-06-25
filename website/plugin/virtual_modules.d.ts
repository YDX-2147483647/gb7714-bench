// https://vite.dev/guide/api-plugin#virtual-modules-convention

declare module "virtual:gb7714-bench-files" {
  export const SOURCE: import("./load_files").Source.Serializable;
  export const RESULT: import("./load_files").Result.Serializable;
}

declare module "virtual:gb7714-bench-git-info" {
  export const commitDate: string;
  export const revisionUrl: `https://${string}`;
}
