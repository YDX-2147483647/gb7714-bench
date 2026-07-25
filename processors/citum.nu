#!/usr/bin/env -S nu --stdin

# List supported source formats and styles.
def "main supports" [] {
    {
        source: ['builtin.bib', 'better.bib', 'builtin.json', 'better.json'],
    } | to json
}

# Format a bibliography of the entries from stdin.
def main []: string -> string {
    cd ($env.CURRENT_FILE | path dirname | path dirname)

    let source = $in

    mkdir target/citum-cache/
    cd target/citum-cache/

    let source_fmt = if ($source | str contains '@') { "bib" } else { "json" }
    let citum_source_fmt = if $source_fmt == "bib" { "yaml" } else { $source_fmt }
    if $source_fmt == "bib" {
       $source o> ref.bib
       citum convert refs ref.bib --output $"ref.($citum_source_fmt)" | print --stderr
    } else {
       $source o> $"ref.($citum_source_fmt)"
    }

    citum render refs --bibliography $"ref.($citum_source_fmt)" --style gb-t-7714-2025-numeric  --mode bib --json
    | from json
    | get bibliography.entries.text
    | each { str replace --regex '(^\[\d+\])' '$1 ' } # Add a space after the numbers
    | str join "\n"
}
