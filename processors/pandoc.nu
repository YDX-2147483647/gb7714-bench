#!/usr/bin/env -S nu --stdin

# List supported source formats and styles.
def "main supports" [] {
    {
        source: ['builtin.bib', 'better.bib', 'builtin.json', 'better.json'],
        style: ['gb-7714-2025-numeric.compliant'],
    } | to json
}

# Format a bibliography of the entries from stdin.
def main [
    style?: string = 'gb-7714-2025-numeric.compliant', # The bibliography style to use
]: string -> string {
    cd ($env.CURRENT_FILE | path dirname | path dirname)

    let source = $in
    let source_fmt = if ($source | str contains '@') { "biblatex" } else { "csljson" }
    let style = ['target/style-cache', $"($style).csl"] | path join

    $source
    | pandoc --from $source_fmt --citeproc --csl $style --to plain --wrap preserve
    | str replace --all "\r\n" "\n"
    | str replace --all "\n\n" "\n"
}
