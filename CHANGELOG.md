# Changelog

All notable changes to this project will be documented in this file, with the following exceptions.

- The versions of LaTeX processors are not pinned due to technical limitations. Please refer to `tex-versions.yaml` in GitHub [Releases](https://github.com/YDX-2147483647/gb7714-bench/releases)/[Actions](https://github.com/YDX-2147483647/gb7714-bench/actions/workflows/ci.yaml) for their actual versions.

- Changes to the [website](./website/) are not documented here either. At present, its changes are mainly trivial UI improvements. You can inspect the [git commit history](https://github.com/YDX-2147483647/gb7714-bench/commits/main/website/) if you are really interested.

All dates in this file are in UTC+8.

## [Unreleased]

### Changed

Data:

- Update [from 2026-07-10 `42e5c08` to 2026-08-01 `d6967ad`](https://github.com/typst-doc-cn/bib-csl-dev-data/pull/2). ([#37](https://github.com/YDX-2147483647/gb7714-bench/pull/37))

## [2026-07-30](https://github.com/YDX-2147483647/gb7714-bench/releases/tag/2026-07-30)

### Added

Processors:

- Add citum. ([#25](https://github.com/YDX-2147483647/gb7714-bench/pull/25))

  Citum is a new processor created in 2026. Its support for GB/T 7714 improved significantly in [citum v0.77](https://github.com/citum/citum-core/releases/tag/v0.77.0) and [v0.78](https://github.com/citum/citum-core/releases/tag/v0.78.0).

## [2026-07-24](https://github.com/YDX-2147483647/gb7714-bench/releases/tag/2026-07-24)

### Changed

Processors:

- typst-omni-gb7714: Update [from 2026-04-27 `a1e3e2f` to v0.0.717 (2026-07-16 `c3b056d`)](https://github.com/typst-omni-gb7714/omni-gb7714/compare/a1e3e2f82915e438f7e567dc3b781e01cecd60ec...c3b056d9e86ac24c70657ef3a372b22c643db986), and then to [v0.0.718](https://github.com/typst-omni-gb7714/omni-gb7714/pull/7). ([#26](https://github.com/YDX-2147483647/gb7714-bench/pull/26), [#28](https://github.com/YDX-2147483647/gb7714-bench/pull/28))

- zotero: Update `@citation-js/*` packages from v0.8.1 to [v0.8.2](https://github.com/citation-js/citation-js/blob/main/CHANGELOG.md#-2026-07-13). ([#28](https://github.com/YDX-2147483647/gb7714-bench/pull/28))

  This change does not affect the results.

## [2026-07-11](https://github.com/YDX-2147483647/gb7714-bench/releases/tag/2026-07-11)

### Changed

Data:

- Update [from 2026-06-24 `5a47433` to 2026-07-10 `42e5c08`](https://github.com/typst-doc-cn/bib-csl-dev-data/compare/5a4743312afd26c337ca4a70b53195d681d111f8...42e5c083a0fbc07aa96c15a5a5746b2804c88a9c). ([#22](https://github.com/YDX-2147483647/gb7714-bench/pull/22))

## [2026-07-10](https://github.com/YDX-2147483647/gb7714-bench/releases/tag/2026-07-10)

### Changed

Processors:

- zotero: Update `@citation-js/*` packages from v0.7 to [v0.8.1](https://github.com/citation-js/citation-js/blob/main/CHANGELOG.md#081-2026-07-05). ([#15](https://github.com/YDX-2147483647/gb7714-bench/pull/15))

  `@citation-js/plugin-csl` now defaults to CSL 1.0.2. Therefore, the patch added in the release 2026-07-03 is no longer necessary.

  This change does not affect the results.

- typst-citrus, typst-gb7714-bilingual: Bump citegeist used in patches from v0.2.2 to [v0.3.0](https://typst.app/universe/package/citegeist/0.3.0). ([#21](https://github.com/YDX-2147483647/gb7714-bench/pull/21))

  These two processors use citegeist to load `*.bib` and do not maintain the order of uncited entries as typst-omni-gb7714 does. As a result, they were patched with a regex hack. Citegeist v0.3.0 (submitted in [typst/packages#5302](https://github.com/typst/packages/pull/5302)) now keeps the order of entries in the original `*.bib` ([alexanderkoller/typst-citegeist#7](https://github.com/alexanderkoller/typst-citegeist/issues/7)), so the patches added for them can be simplified.

  This change does not affect the results.

### Fixed

Processors:

- tex_etc: Improve the process of extracting text from PDF. ([#14](https://github.com/YDX-2147483647/gb7714-bench/pull/14))

  - Set `pdftotext -raw` to avoid mixing the lines of different entries.
  - Increase the page width from `200em` to `400em` to keep entries with long URLs (e.g., [gbt7714.b.4:10](https://gb7714.zhtyp.art/entry/gbt7714.b.4-10/)) in a single line.

- tex_etc: Handle LaTeX errors correctly. ([#17](https://github.com/YDX-2147483647/gb7714-bench/pull/17))

  Previously, LaTeX errors were ignored, and the cache from previous runs would be taken as the result. This affected `GB-T_7714—2025.better.bib/gbt7714-bibtex-style/default.txt`. They were actually exact copies of `GB-T_7714—2025.builtin.bib/gbt7714-bibtex-style/default.txt`.

  Other results were not affected.

- gbt7714-bibtex-style: Strip unsupported BibLaTeX syntaxes in `*.better.bib`. ([#17](https://github.com/YDX-2147483647/gb7714-bench/pull/17))

  `data/GB-T_7714—2025.better.bib` is for BibLaTeX and contains syntaxes unsupported by BibTeX. They are now stripped before passing to BibTeX.

## [2026-07-03](https://github.com/YDX-2147483647/gb7714-bench/releases/tag/2026-07-03)

### Added

Processors:

- Add pandoc. (e82a38d)

### Changed

Processors:

- zotero: Eliminate the inconsistencies with the Zotero Chinese Community. ([#11](https://github.com/YDX-2147483647/gb7714-bench/pull/11))

  - Remove the logic in `@citation-js/plugin-csl` that downgrades CSL-JSON items from 1.0.2 to 1.0.1. ([citation-js#276](https://github.com/citation-js/citation-js/issues/276))
  - Replace the builtin en-US locale with the latest upstream version to leverage [citation-style-language/locales#357](https://github.com/citation-style-language/locales/pull/357).

- typst_etc: Update the Typst compiler [from v0.14 to v0.15](https://typst.app/docs/changelog/0.15.0/). (02d4c11, 819d2c9)

  This affects the results of typst and typst-modern-nju-thesis, but not other Typst processors.

- typst-citrus: Update [from a git revision to the recently published v0.2.1](https://github.com/pku-typst/citeproc-typst/compare/1a74b82de6680dcb3b3629b6db2467c4c9b22808...81e1d91a94417c2e1f80dc19537be275f779563d). (8d8524d)

  This resolves [Quotation marks become 》 · Issue #5 · pku-typst/citeproc-typst](https://github.com/pku-typst/citeproc-typst/issues/5).

### Removed

Processors:

- zotero: Remove `devEngines` from `package.json`. (2a8c38a)

  This makes it possible to use any package manager, not just pnpm. The package manager does not affect the result.

  This also makes maintenance simpler, as dealing with pnpm security issues is no longer within the scope of this project.

### Fixed

Other:

- Keep the order of entries in `tex-versions.yaml`. (c800c91)

  Starting from this release, it will be gbt7714-bibtex-style, biblatex-gb7714-2025, citeproc-lua.

## [2026-06-26](https://github.com/YDX-2147483647/gb7714-bench/releases/tag/2026-06-26)

### Added

Data:

- Check in the data as of [2026-06-24 `5a47433`](https://github.com/typst-doc-cn/bib-csl-dev-data/tree/5a4743312afd26c337ca4a70b53195d681d111f8).

Processors:

- Add initial implementations:

  - zotero
  - LaTeX processors: gbt7714-bibtex-style, biblatex-gb7714-2025, citeproc-lua
  - Typst processors: typst, typst-modern-nju-thesis, typst-gb7714-bilingual, typst-citrus, typst-omni-gb7714

  Most processors support both GB/T 7714—2025 and GB/T 7714—2015, but typst-modern-nju-thesis and typst-omni-gb7714 only support GB/T 7714—2015.

- Add the naive-copy processor for `original.toml` as a reference implementation.

Styles:

- Use the latest CSL styles and locales at present.
