import { describe, expect, it } from "vitest";

import {
  buildOutTitle,
  compareDataFileKey,
  rankDataFileKey,
  simplifyProcessorName,
  simplifyStyleName,
} from "./naming";

describe("bench.naming", () => {
  it("simplifies processor names", () => {
    expect(simplifyProcessorName("biblatex-gb7714-2025")).toBe("biblatex");
    expect(simplifyProcessorName("citeproc-lua")).toBe("lua");
    expect(simplifyProcessorName("typst-modern-nju-thesis")).toBe("NJU");
  });

  it("simplifies style names", () => {
    expect(simplifyStyleName("default")).toBe("");
    expect(simplifyStyleName("gb-7714-2025-numeric.compliant")).toBe("2025 CSL");
    expect(simplifyStyleName("gb-7714-2015-numeric.extended")).toBe("2015 CSL-M⁺");
  });

  it("builds compact output titles", () => {
    expect(
      buildOutTitle({
        dataset: "GB-T_7714—2025.better.bib",
        processor: "typst-citrus",
        style: "gb-7714-2025-numeric.compliant",
      }),
    ).toBe("better.bib · citrus · 2025 CSL");

    expect(
      buildOutTitle({
        dataset: "GB-T_7714—2025.builtin.bib",
        processor: "biblatex-gb7714-2025",
        style: "default",
      }),
    ).toBe("builtin.bib · biblatex");
  });

  it("sorts original.toml before other data files", () => {
    expect(compareDataFileKey("GB-T_7714—2025.original.toml", "GB-T_7714—2025.builtin.bib")).toBeLessThan(0);
    expect(rankDataFileKey("GB-T_7714—2025.original.toml")).toBe(0);
  });
});