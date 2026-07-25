import type { JSX } from "react";
import { MarkdownPage } from "~/components/MarkdownPage";
import { loadVersions, type Versions } from "~/lib/version.server";
import type { Route } from "./+types/version";

const description = "列出各引擎的版本信息，方便检查更新。";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "引擎版本 | GB/T 7714 Benchmark" },
    {
      name: "description",
      content: description,
    },
  ];
}

export async function loader(_: Route.LoaderArgs) {
  const versions = await loadVersions();
  return { versions };
}

export default function VersionPage({
  loaderData: { versions },
}: Route.ComponentProps) {
  return (
    <MarkdownPage
      heading="引擎版本"
      description={description}
      epilogue={
        <div className="prose mx-auto mt-8 w-max max-w-full overflow-x-auto">
          <VersionTable versions={versions} />
        </div>
      }
    >
      由于技术限制，LaTeX 系列引擎的版本并未固定，实际测试版本请参考 GitHub
      [Releases](https://github.com/YDX-2147483647/gb7714-bench/releases)/[Actions](https://github.com/YDX-2147483647/gb7714-bench/actions/workflows/ci.yaml)
      的`tex-versions.yaml`；以下列出的当前测试版本源自最后一次 release
      的`tex-versions.yaml`，可能略微落后于当前网站内容所用版本。
    </MarkdownPage>
  );
}

function VersionTable({ versions }: { versions: Versions }): JSX.Element {
  return (
    <table className="min-w-lg">
      <thead>
        <tr>
          <th>引擎</th>
          <th>当前测试版本</th>
          <th>最新版本</th>
          <th>
            <span className="inline-block">最新版本</span>
            <span className="inline-block">发布日期</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <Processor name="zotero" />
          </td>
          <td>
            <a
              href="https://github.com/YDX-2147483647/gb7714-bench/blob/main/processors/zotero/package.json"
              target="_blank"
              rel="noopener"
            >
              citation.js {versions.zotero["citation.js"]}
              <br />
              citeproc-js {versions.zotero["citeproc-js"]}
            </a>
          </td>
          <td>
            <Badge
              kind="npm-version"
              pkg="@citation-js/core"
              label="citation.js"
            />
            <Badge kind="npm-version" pkg="citeproc" label="citeproc-js" />
          </td>
          <td>
            <Badge
              kind="npm-last-update"
              pkg="@citation-js/core"
              label="citation.js"
            />
            <Badge kind="npm-last-update" pkg="citeproc" label="citeproc-js" />
          </td>
        </tr>
        <tr>
          <td>
            <Processor name="gbt7714-bibtex-style" />
          </td>
          <td>
            <Badge kind="tex-versions.yaml" pkg="gbt7714-bibtex-style" />
          </td>
          <td>
            <Badge kind="ctan-version" pkg="gbt7714" />
          </td>
          <td>
            <Badge
              kind="git-hub-release-date"
              pkg="zepinglee/gbt7714-bibtex-style"
            />
          </td>
        </tr>
        <tr>
          <td>
            <Processor name="biblatex-gb7714-2025" />
          </td>
          <td>
            <Badge kind="tex-versions.yaml" pkg="biblatex-gb7714-2025" />
          </td>
          <td>
            <Badge kind="ctan-version" pkg="biblatex-gb7714-2015" />
          </td>
          <td>
            <Badge
              kind="git-hub-release-date"
              pkg="hushidong/biblatex-gb7714-2025"
            />
          </td>
        </tr>
        <tr>
          <td>
            <Processor name="citeproc-lua" />
          </td>
          <td>
            <Badge kind="tex-versions.yaml" pkg="citeproc-lua" />
          </td>
          <td>
            <Badge kind="ctan-version" pkg="citation-style-language" />
          </td>
          <td>
            <Badge kind="git-hub-release-date" pkg="zepinglee/citeproc-lua" />
          </td>
        </tr>
        <tr>
          <td>
            <Processor name="typst" />
          </td>
          <td>
            <a
              href="https://github.com/YDX-2147483647/gb7714-bench/blob/main/processors/typst_etc/pyproject.toml"
              target="_blank"
              rel="noopener"
            >
              typst-py {versions["typst-py"]}
            </a>
          </td>
          <td>
            <Badge kind="git-hub-release" pkg="typst/typst" />
            <Badge kind="py-pi-version" pkg="typst" />
          </td>
          <td>
            <Badge kind="git-hub-release-date" pkg="typst/typst" />
            <Badge
              kind="git-hub-release-date"
              pkg="messense/typst-py"
              label="typst-py"
            />
          </td>
        </tr>
        <tr>
          <td>
            <Processor name="typst-modern-nju-thesis" />
          </td>
          <td>
            <TypstLocalPkg version={versions.typst["modern-nju-thesis"]} />
          </td>
          <td>
            <Badge kind="typst-version" pkg="modern-nju-thesis" />
          </td>
          <td>
            <Badge
              kind="git-hub-release-date"
              pkg="nju-lug/modern-nju-thesis"
            />
          </td>
        </tr>
        <tr>
          <td>
            <Processor name="typst-gb7714-bilingual" />
          </td>
          <td>
            <TypstLocalPkg version={versions.typst["gb7714-bilingual"]} />
          </td>
          <td>
            <Badge kind="typst-version" pkg="gb7714-bilingual" />
          </td>
          <td>
            <Badge
              kind="git-hub-last-commit"
              pkg="pku-typst/gb7714-bilingual"
            />
          </td>
        </tr>
        <tr>
          <td>
            <Processor name="typst-citrus" />
          </td>
          <td>
            <TypstLocalPkg version={versions.typst.citrus} />
          </td>
          <td>
            <Badge kind="typst-version" pkg="citrus" />
          </td>
          <td>
            <Badge kind="git-hub-last-commit" pkg="pku-typst/citeproc-typst" />
          </td>
        </tr>
        <tr>
          <td>
            <Processor name="typst-omni-gb7714" />
          </td>
          <td>
            <TypstLocalPkg version={versions.typst["omni-gb7714"]} />
          </td>
          <td>N/A</td>
          <td>
            <Badge
              kind="git-hub-last-commit"
              pkg="typst-omni-gb7714/omni-gb7714"
            />
          </td>
        </tr>
        <tr>
          <td>
            <Processor name="pandoc" />
          </td>
          <td>
            <a
              href="https://github.com/YDX-2147483647/gb7714-bench/blob/main/.github/workflows/ci.yaml"
              target="_blank"
              rel="noopener"
            >
              {versions.ci.pandoc}
            </a>
          </td>
          <td>
            <Badge kind="git-hub-release" pkg="jgm/pandoc" />
          </td>
          <td>
            <Badge kind="git-hub-release-date" pkg="jgm/pandoc" />
          </td>
        </tr>
        <tr>
          <td>
            <Processor name="citum" />
          </td>
          <td>
            <a
              href="https://github.com/YDX-2147483647/gb7714-bench/blob/main/.github/workflows/ci.yaml"
              target="_blank"
              rel="noopener"
            >
              {versions.ci.citum}
            </a>
          </td>
          <td>
            <Badge kind="git-hub-release" pkg="citum/citum-core" />
          </td>
          <td>
            <Badge kind="git-hub-release-date" pkg="citum/citum-core" />
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function Processor({ name }: { name: string }): JSX.Element {
  return (
    <a
      href={`https://github.com/YDX-2147483647/gb7714-bench/blob/main/processors/${name}.nu`}
      target="_blank"
      rel="noopener"
    >
      {name}
    </a>
  );
}

function TypstLocalPkg({ version }: { version: string }): JSX.Element {
  return (
    <a
      href="https://github.com/YDX-2147483647/gb7714-bench/blob/main/scripts/typst-local-pkg.toml"
      target="_blank"
      rel="noopener"
    >
      {version} + 补丁
    </a>
  );
}

function ImgLink({
  href,
  src,
  alt,
}: {
  href: string;
  src: string;
  alt: string;
}): JSX.Element {
  return (
    <a href={href} target="_blank" rel="noopener">
      <img src={src} alt={alt} />
    </a>
  );
}

function shieldsIo(
  path: `/${string}`,
  params: Record<string, string | null | true> = {},
): string {
  const search = new URLSearchParams(
    Object.entries(params).flatMap(([k, v]) => {
      if (v === null) {
        return [];
      } else if (v === true) {
        return [[k, ""]];
      } else {
        return [[k, v]];
      }
    }),
  );
  return new URL(`https://img.shields.io${path}?${search}`).href;
}

function Badge({
  kind,
  pkg,
  label = null,
}: {
  kind:
    | "ctan-version"
    | "npm-version"
    | "npm-last-update"
    | "git-hub-release"
    | "git-hub-release-date"
    | "git-hub-last-commit"
    | "py-pi-version"
    | "typst-version"
    | "tex-versions.yaml";
  pkg: string;
  label?: string | null;
}): JSX.Element {
  const pkgEncoded = encodeURIComponent(pkg);

  switch (kind) {
    case "ctan-version":
      // https://shields.io/badges/ctan-version
      return (
        <ImgLink
          href={`https://www.ctan.org/pkg/${pkg}`}
          src={shieldsIo(`/ctan/v/${pkg}`, { logo: "latex", label })}
          alt={`${pkg} – CTAN`}
        />
      );
    case "npm-version":
      // https://shields.io/badges/npm-version
      return (
        <ImgLink
          href={`https://www.npmjs.com/package/${pkg}`}
          src={shieldsIo(`/npm/v/${pkgEncoded}`, { logo: "npm", label })}
          alt={`${pkg} – npm`}
        />
      );
    case "npm-last-update":
      // https://shields.io/badges/npm-last-update
      return (
        <ImgLink
          href={`https://www.npmjs.com/package/${pkg}`}
          src={shieldsIo(`/npm/last-update/${pkgEncoded}`, {
            logo: "npm",
            label,
          })}
          alt={`${pkg} – npm last update`}
        />
      );
    case "git-hub-release":
      // https://shields.io/badges/git-hub-release
      return (
        <ImgLink
          href={`https://github.com/${pkg}/releases`}
          src={shieldsIo(`/github/v/release/${pkg}`, {
            include_prereleases: true,
            logo: "github",
            label,
          })}
          alt={`${pkg} – GitHub release`}
        />
      );
    case "git-hub-release-date":
      // https://shields.io/badges/git-hub-release-date
      return (
        <ImgLink
          href={`https://github.com/${pkg}/releases`}
          src={shieldsIo(`/github/release-date-pre/${pkg}`, {
            logo: "github",
            label,
          })}
          alt={`${pkg} – GitHub release date`}
        />
      );
    case "git-hub-last-commit":
      // https://shields.io/badges/git-hub-last-commit
      return (
        <ImgLink
          href={`https://github.com/${pkg}`}
          src={shieldsIo(`/github/last-commit/${pkg}`, {
            logo: "github",
            label,
          })}
          alt={`${pkg} – GitHub last commit`}
        />
      );
    case "py-pi-version":
      // https://shields.io/badges/py-pi-version
      return (
        <ImgLink
          href={`https://pypi.org/project/${pkg}`}
          src={shieldsIo(`/pypi/v/${pkg}`, {
            logo: "python",
            labelColor: "white",
            label,
          })}
          alt={`${pkg} – PyPI version`}
        />
      );
    case "typst-version": {
      // https://forum.typst.app/t/a-snippet-to-display-your-universe-package-version-in-a-badge/2386
      return (
        <DynamicBadge
          alt={`${pkg} – Typst Universe`}
          url={`https://typst.app/universe/package/${pkg}`}
          format="xml"
          query="/html/body/div/main/div[2]/aside/section[2]/dl/dd[3]"
          params={{
            logo: "typst",
            labelColor: "white",
            label: label ?? "universe",
            color: "#239dad",
          }}
        />
      );
    }
    case "tex-versions.yaml": {
      return (
        <DynamicBadge
          alt={`${pkg} in tex-versions.yaml`}
          url="https://github.com/YDX-2147483647/gb7714-bench/releases/latest/download/tex-versions.yaml"
          format="yaml"
          query={`$.${pkg}[-1:]`}
          params={{
            logo: "yaml",
            logoColor: "#008080",
            label: "",
            color: "white",
          }}
        />
      );
    }
    default: {
      const exhaustiveCheck: never = kind;
      return exhaustiveCheck;
    }
  }
}

function DynamicBadge({
  alt,
  url,
  format,
  query,
  params = {},
}: {
  alt: string;
  url: string;
  format: "xml" | "json" | "yaml" | "toml";
  /** @see https://jsonpath-plus.github.io/JSONPath/demo/ */
  query: string;
  params?: {
    logo?: string;
    logoColor?: string;
    label?: string;
    labelColor?: string;
    color?: string;
  };
}): JSX.Element {
  // https://shields.io/badges/dynamic-xml-badge, etc.
  return (
    <ImgLink
      href={url}
      src={shieldsIo(`/badge/dynamic/${format}`, { url, query, ...params })}
      alt={alt}
    />
  );
}
