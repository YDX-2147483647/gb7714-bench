#!/usr/bin/env -S nu --stdin

# List supported source formats and styles.
def "main supports" [] {
    {
        source: ['builtin.bib', 'better.bib'],
        style: ['gb-7714-2015-numeric.compliant', 'gb-7714-2025-numeric.compliant'],
    } | to json
}

# Format a bibliography of the entries from stdin.
def main [
    style?: string = 'gb-7714-2025-numeric.compliant', # The bibliography style to use
]: string -> string {
    let source = $in
    let style = open --raw ([$env.CURRENT_FILE, '../../target/style-cache', $"($style).csl"] | path join)
    $source | uv run --directory typst_etc/ common.py -- '
#set text(lang: "zh")
#bibliography(
  bytes(
    // 临时处理 better.bib failed to parse BibLaTeX (wrong number of digits)
    // https://github.com/typst/biblatex/issues/105
    sys.inputs.source.replace("year = {c1988},", "year = {1988},"),
  ),
  style: bytes(sys.inputs.style),
  full: true,
  title: none,
)' ({ style: $style } | to json) '//body//section[@role="doc-bibliography"]//ul//li'
}
