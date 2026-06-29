# Changelog

All notable changes to this project will be documented in this file, with the following exceptions.

- The versions of LaTeX processors are not pinned due to technical limitations. Please refer to `tex-versions.yaml` in GitHub [Releases](https://github.com/YDX-2147483647/gb7714-bench/releases)/[Actions](https://github.com/YDX-2147483647/gb7714-bench/actions) for their actual versions.

- Changes to the [website](./website/) are not documented here either. At present, its changes are mainly trivial UI improvements. You can inspect the [git commit history](https://github.com/YDX-2147483647/gb7714-bench/commits/main/website/) if you are really interested.

All dates in this file are in UTC+8.

## [Unreleased]

### Added

Processors:

- Add pandoc. (e82a38d)

### Changed

Processors:

- typst_etc: Update the Typst compiler [from v0.14 to v0.15](https://typst.app/docs/changelog/0.15.0/). (02d4c11, 819d2c9)

  This affects the results of typst and typst-modern-nju-thesis, but not other Typst processors.

- typst-citrus: Update [from a git revision to the recently published v0.2.1](https://github.com/pku-typst/citeproc-typst/compare/1a74b82de6680dcb3b3629b6db2467c4c9b22808...81e1d91a94417c2e1f80dc19537be275f779563d). (8d8524d)

  This resolves [Quotation marks become 》 · Issue #5 · pku-typst/citeproc-typst](https://github.com/pku-typst/citeproc-typst/issues/5).

### Removed

Processors:

- zotero: Remove `devEngines` from `package.json`. (2a8c38a)

  This makes it possible to use any package manager, not just pnpm. The package manager does not affect the result.

  This also makes maintenance simpler, as dealing with pnpm security issues is no longer within the scope of this project.

## [2026-06-26](https://github.com/YDX-2147483647/gb7714-bench/releases/tag/2026-06-26)

### Added

Data:

- Check in the data as of [`5a47433` 2026-06-24](https://github.com/typst-doc-cn/bib-csl-dev-data/tree/5a4743312afd26c337ca4a70b53195d681d111f8).

Processors:

- Add initial implementations:

  - zotero
  - LaTeX processors: gbt7714-bibtex-style, biblatex-gb7714-2025, citeproc-lua
  - Typst processors: typst, typst-modern-nju-thesis, typst-gb7714-bilingual, typst-citrus, typst-omni-gb7714

  Most processors support both GB/T 7714—2025 and GB/T 7714—2015, but typst-modern-nju-thesis and typst-omni-gb7714 only support GB/T 7714—2015.

- Add the naive-copy processor for `original.toml` as a reference implementation.

Styles:

- Use the latest CSL styles and locales at present.
