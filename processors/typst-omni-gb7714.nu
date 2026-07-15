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
#import "@local/omni-gb7714:0.0.717": gb7714, bibliography
#show: gb7714.with(full: true, title: none)
#bibliography(sys.inputs.source)
' '{}' '//body//section[@role="doc-bibliography"]//ul//li'
}
