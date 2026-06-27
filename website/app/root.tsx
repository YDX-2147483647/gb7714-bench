import { commitDate, revisionUrl } from "virtual:gb7714-bench-git-info";
import {
  mdiBookshelf,
  mdiFileDocumentOutline,
  mdiGit,
  mdiHomeOutline,
} from "@mdi/js";
import { StrictMode } from "react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import type { Route } from "./+types/root";
import Icon from "./components/Icon";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700&family=IBM+Plex+Mono:wght@400;600&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const atReadme = location.pathname === "/";

  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className="mx-8 mt-4 grid grid-cols-[1fr_auto] text-ink-soft lg:mx-10">
          <p className="content-end text-sm">
            最后更新于
            <a
              href={revisionUrl}
              target="_blank"
              rel="noopener"
              className="inline-block hover:underline focus:underline"
            >
              <time dateTime={commitDate}>
                {new Intl.DateTimeFormat("zh-CN", {
                  dateStyle: "medium",
                }).format(new Date(commitDate))}
              </time>
            </a>
          </p>
          <nav className="content-end text-4xl lg:text-3xl">
            {!atReadme && (
              <Link
                to="/"
                title="返回首页"
                className="m-0.5 rounded p-0.5 hover:bg-bg-dark hover:shadow-inner focus:bg-bg-dark focus:shadow-inner"
              >
                <span className="sr-only">返回首页</span>
                <Icon path={mdiHomeOutline} />
              </Link>
            )}
            {[
              {
                title: "GitHub 仓库",
                href: "https://github.com/YDX-2147483647/gb7714-bench",
                icon: mdiGit,
              },
              {
                title: "Zotero 群组文库",
                href: "https://www.zotero.org/groups/4677213/chinese_csl_development/collections/ZLAYMIUR/collection",
                icon: mdiBookshelf,
              },
              {
                title: "国标影印 PDF",
                href: "https://publishmedia.cbpt.cnki.net/portal/minio/webs/hbxy/media/web/2026/01/20/GBT 7714—2025 信息与文献 参考文献著录规则.pdf",
                icon: mdiFileDocumentOutline,
              },
            ].map(({ title, href, icon }) => {
              return (
                <a
                  title={title}
                  href={href}
                  key={href}
                  target="_blank"
                  rel="noopener"
                  className="m-0.5 rounded p-0.5 hover:bg-bg-dark hover:shadow-inner focus:bg-bg-dark focus:shadow-inner"
                >
                  <span className="sr-only">{title}</span>
                  <Icon path={icon} />
                </a>
              );
            })}
          </nav>
        </header>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <StrictMode>
      <Outlet />
    </StrictMode>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
