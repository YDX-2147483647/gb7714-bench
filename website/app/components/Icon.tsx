import type { JSX } from "react";

export default function Icon({
  path,
  spin = false,
}: {
  path: string;
  spin?: boolean;
}): JSX.Element {
  return (
    <svg
      className={`inline size-[1em] align-middle ${spin ? "animate-spin" : ""}`}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
