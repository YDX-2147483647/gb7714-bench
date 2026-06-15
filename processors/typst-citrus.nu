#!/usr/bin/env -S nu --stdin

# List supported source formats and styles.
def "main supports" [] {
    {
        source: ['builtin.bib', 'better.bib', 'builtin.json', 'better.json'],
        style: ['gb-7714-2025-numeric.compliant', 'gb-7714-2025-numeric.extended'],
    } | to json
}

# Format a bibliography of the entries from stdin.
def main [
    style?: string = 'gb-7714-2025-numeric.extended', # The bibliography style to use
]: string -> string {
    let source = $in
    let style = open --raw ([$env.CURRENT_FILE, '../../target/style-cache', $"($style).csl"] | path join)
    $source | uv run --directory typst_etc/ common.py -- '
#import "@local/citrus:0.2.999": csl-bibliography, init-csl, init-csl-json, nocite
#let init = if "@" in sys.inputs.source { init-csl } else { init-csl-json }
#show: init.with(
  sys
    .inputs
    .source
    // 临时处理 better.bib failed to parse BibLaTeX (wrong number of digits)
    // https://github.com/typst/biblatex/issues/105
    .replace("year = {c1988},", "year = {1988},")
    // 临时处理 citrus invalid integer
    .replace(
      regex("(year = \{\d{4})（(?:中华民国|民国|光绪|清同治|康熙).+）(\},)"),
      m => m.captures.join(),
    )
    .replace(
      regex("(year = \{\d{4})印刷(\},)"),
      m => m.captures.join(),
    ),
  sys.inputs.style,
)

#nocite("*")
#show h.where(amount: 0.5em): " " // 让 [1] 后的空白能输出到 HTML
#csl-bibliography(title: none)
' ({ style: $style } | to json) '//body//p'
}
