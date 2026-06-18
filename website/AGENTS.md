# Website Decisions

## Goal

Build a benchmark explorer for the `gb7714-bench` dataset using the existing React Router + Vite + Tailwind CSS setup.

## Core routing

- `/` shows all benchmark entries grouped by `data/data/GB-T_7714—2025.original.toml` sections.
- `/entry/:id/` uses the real `builtin.json` `id` value, not a numeric index.
- Entry navigation uses previous/next entry ids from `builtin.json` order.

## Data sources

### Canonical entry order

- `data/data/GB-T_7714—2025.builtin.json` is the single source of truth for entry order.
- Other `data` files and all `out` files are aligned by position.

### Data ordering rules in `/entry/:id/`

Data Sources must be rendered in this order:

1. `original.toml`
2. all `.bib` files
3. all `.json` files
4. within same format, `builtin` before `better`

### TOML parsing

- Parse `GB-T_7714—2025.original.toml` with `@std/toml` `parse`.
- Only `[[section]]` blocks are used.
- Each section may provide:
  - `id-prefix`
  - `headings`
  - `notes`
  - `examples`
- `headings` and `notes` must be shown:
  - on `/` above each grouped entry section
  - on `/entry/:id/` in the `original.toml` block

### Uncategorized handling

- Uncategorized entries are not allowed.
- If any entry cannot be mapped to a section, build must fail.
- Do not render an `Uncategorized` section in the UI.

## Output variants

### Title simplification rules

- `default` is omitted from the title.
- `compliant` becomes `CSL`.
- `extended` becomes `CSL-M⁺`.
- `gb-7714-2025-numeric` becomes `2025`.
- `gb-7714-2015-numeric` becomes `2015`.

### Processor name simplification

- `biblatex-gb7714-2025` → `biblatex`
- `citeproc-lua` → `lua`
- `gbt7714-bibtex-style` → `bibtex`
- `typst` → `typst`
- `typst-citrus` → `citrus`
- `typst-gb7714-bilingual` → `gb7714-bilingual`
- `typst-modern-nju-thesis` → `NJU`
- `typst-omni-gb7714` → `omni`
- `zotero` → `zotero`

### Diff behavior

- `/entry/:id/` includes a base selector for output diffing.
- Empty selection means normal rendering.
- Selected base means every other output shows word diff against the base using `diffWordsWithSpace` from `diff`.
- The selected base item is labeled `Baseline`.

## Rendering rules

### Syntax highlighting

- `Data Sources` `*.json` entries are syntax-highlighted.
- `Data Sources` `*.bib` entries are syntax-highlighted.
- Highlighting is done with lightweight HTML token wrapping, not a full code editor.

### Styling

- Use the custom warm paper-like theme already in `app.css`.
- Keep code blocks readable on mobile and desktop.
- Keep Tailwind utility usage minimal and preserve the existing CSS structure.

## Testing

- Use `vitest` for helper-level tests.
- Keep tests focused on pure logic:
  - output title simplification
  - processor/style name mapping
  - TOML section parsing
  - uncategorized hard-fail behavior
- Prefer tests for exported helpers rather than UI snapshots.

## Build / validation

- `pnpm typecheck` must pass.
- `pnpm build` must pass.
- `pnpm test` must pass.

## Notes for future changes

- Keep `builtin.json` as the entry order source.
- Keep section grouping driven by `original.toml`.
- If new data sources or processors are added, update the simplification mappings and tests together.
