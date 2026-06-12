#!/usr/bin/env -S nu --stdin

# List supported source formats and styles.
def "main supports" [] {
    echo {
        source: ['builtin.bib', 'better.bib', 'builtin.json', 'better.json'],
        style: ['gb-7714-2015-numeric.compliant', 'gb-7714-2025-numeric.compliant', 'gb-7714-2025-numeric.extended'],
    } | to json
}

# Format a bibliography of the entries from stdin.
def main [
    style?: string = 'gb-7714-2025-numeric.compliant', # The bibliography style to use
]: string -> string {
    node zotero/main.ts $style
}
