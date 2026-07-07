import { MarkdownPage } from "~/components/MarkdownPage";
import { loadReadme } from "~/lib/docs.server";
import type { Route } from "./+types/readme";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "GB/T 7714 格式参考文献引擎哪家强？| GB/T 7714 Benchmark" },
    {
      name: "description",
      content:
        "利用 Zotero 中文 CSL 开发组测试文献，测试十种支持 GB/T 7714 的参考文献引擎。",
    },
  ];
}

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
