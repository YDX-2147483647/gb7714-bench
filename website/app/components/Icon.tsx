import type { JSX } from "react";

export default function Icon({ path }: { path: string }): JSX.Element {
  return (
    <svg
      className="inline size-6 align-bottom"
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
