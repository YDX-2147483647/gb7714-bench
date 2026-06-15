#!/usr/bin/env -S nu --stdin

# List supported source formats and styles.
def "main supports" [] {
    {
        source: ['builtin.bib', 'better.bib'],
    } | to json
}

# Format a bibliography of the entries from stdin.
def main []: string -> string {
    let source = $in
    $source | uv run --directory typst_etc/ common.py -- '
#import "@local/gb7714-bilingual:0.2.399": gb7714-bibliography, init-gb7714
#show: init-gb7714.with(
  // 临时处理 better.bib failed to parse BibLaTeX (wrong number of digits)
  // https://github.com/typst/biblatex/issues/105
  sys.inputs.source.replace("year = {c1988},", "year = {1988},"),
  style: "numeric",
  version: "2025",
)

#show h.where(amount: 0.5em): " " // 让 [1] 后的空白能输出到 HTML
#gb7714-bibliography(full: true, title: none)
' '{}' '//body//p'
}
