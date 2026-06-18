import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("entry/:id/", "routes/entry.$id.tsx"),
] satisfies RouteConfig;
