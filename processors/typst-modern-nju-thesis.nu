#!/usr/bin/env -S nu --stdin

# List supported source formats and styles.
def "main supports" [] {
    {
        source: ['builtin.bib', 'better.bib'],
        style: ['gb-7714-2015-numeric.compliant'],
        # 不适用于 2025 版样式，因为它采用全宽标点符号，而 bilingual-bibliography 目前替换规则只适用于 ASCII 标点符号
    } | to json
}

# Format a bibliography of the entries from stdin.
def main [
    style?: string = 'gb-7714-2015-numeric.compliant', # The bibliography style to use
]: string -> string {
    let source = $in
    let style = open --raw ([$env.CURRENT_FILE, '../../target/style-cache', $"($style).csl"] | path join)
    $source | uv run --directory typst_etc/ common.py -- '
#import "@local/modern-nju-thesis:0.4.199": bilingual-bibliography
#bilingual-bibliography(
  bibliography: bibliography.with(bytes(
    // 临时处理 better.bib failed to parse BibLaTeX (wrong number of digits)
    // https://github.com/typst/biblatex/issues/105
    sys.inputs.source.replace("year = {c1988},", "year = {1988},"),
  )),
  style: bytes(sys.inputs.style),
  full: true,
  title: none,
)' ({ style: $style } | to json) '//body//section[@role="doc-bibliography"]//ul//li'
}
