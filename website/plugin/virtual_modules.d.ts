// https://vite.dev/guide/api-plugin#virtual-modules-convention

declare module "virtual:gb7714-bench-files" {
  export const SOURCE: import("./load_files").Source.Serializable;
  export const RESULT: import("./load_files").Result.Serializable;
}
