import { compile } from "~/lib/diagram.server";
import type { Route } from "./+types/diagram.pdf";

export async function loader(_: Route.LoaderArgs) {
  const bytes = await compile({ format: "pdf" });
  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}
