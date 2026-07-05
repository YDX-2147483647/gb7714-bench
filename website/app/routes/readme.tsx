import { MarkdownPage } from "~/components/MarkdownPage";
import { loadReadme } from "~/lib/docs.server";
import type { Route } from "./+types/readme";

export async function loader(_: Route.LoaderArgs) {
  const readme = await loadReadme();
  return { readme };
}

export default function Readme({
  loaderData: { readme },
}: Route.ComponentProps) {
  return (
    <MarkdownPage heading="GB/T 7714 格式参考文献引擎哪家强？">
      {readme}
    </MarkdownPage>
  );
}
