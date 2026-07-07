import { MarkdownPage } from "~/components/MarkdownPage";
import { loadChangelog } from "~/lib/docs.server";
import type { Route } from "./+types/changelog";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "更新记录 | GB/T 7714 Benchmark" },
    {
      name: "description",
      content:
        "All notable changes to this project will be documented in this file, with some exceptions.",
    },
  ];
}

export async function loader(_: Route.LoaderArgs) {
  const changelog = await loadChangelog();
  return { changelog };
}

export default function Changelog({
  loaderData: { changelog },
}: Route.ComponentProps) {
  return <MarkdownPage heading="更新记录">{changelog}</MarkdownPage>;
}
