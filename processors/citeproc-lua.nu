#!/usr/bin/env -S nu --stdin

source tex_etc/common.nu

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
    cd ($env.CURRENT_FILE | path dirname | path dirname)

    let source = $in
    let style = open --raw (['target/style-cache', $"($style).csl"] | path join)

    mkdir target/tex-cache/run-plain/
    cd target/tex-cache/run-plain/

    let source_fmt = if ($source | str contains '@') { "bib" } else { "json" }
    $source o> $"ref.($source_fmt)"

    $style o> "custom.csl"

    $'
(documentclass_ctexart)

% 让每项文献只占一行，并且无页码等文字干扰
\usepackage[paperwidth=200em]{geometry}
\pagestyle{empty}

% 让字体支持俄文
\setmainfont{cmunrm.otf}

\usepackage{citation-style-language}
\cslsetup{style = custom}
\addbibresource{ref.($source_fmt)}

\begin{document}
\nocite{*}
\printbibliography[heading=none]
\end{document}
    ' o> main.tex

    run_lualatex
    pdf_to_text main.pdf
}
