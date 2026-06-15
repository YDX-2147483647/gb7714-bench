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
#import "@local/omni-gb7714:0.0.999": gb7714
#let (init-gb7714, bibliography) = gb7714(
  sys.inputs.source,
  full: true,
  title: none,
)
#show: init-gb7714

// 让文献表能输出到 HTML
#show grid: it => for (n, entry) in it.children.chunks(2) [
  #n.body.body #entry.body
]
// 让 mitex 转换的 $\quad$ 能输出到 HTML
#show math.equation: it => box({
  if it.body == $quad$ { "　" } else { it }
})
#bibliography
' '{}' '//body//div'
}
