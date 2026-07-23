import { compile } from "~/lib/diagram.server";
import type { Route } from "./+types/diagram.svg";

export async function loader(_: Route.LoaderArgs) {
  const bytes = await compile({ format: "svg" });
  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
    },
  });
}
