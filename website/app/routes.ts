import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/readme.tsx"),
  route("changelog/", "routes/changelog.tsx"),
  route("version/", "routes/version.tsx"),
  route("entry/", "routes/entry-home.tsx"),
  route("entry/:entryId/", "routes/entry.tsx"),
  route("compare/", "routes/compare.tsx"),
  route("converge/", "routes/converge.tsx"),
  route("diagram.svg", "routes/diagram.svg.ts"),
  route("diagram.pdf", "routes/diagram.pdf.ts"),
] satisfies RouteConfig;
