import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/readme.tsx"),
  route("entry/", "routes/entry-home.tsx"),
  route("entry/:entryId/", "routes/entry.tsx"),
] satisfies RouteConfig;
