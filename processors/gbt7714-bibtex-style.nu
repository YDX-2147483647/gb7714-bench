#!/usr/bin/env -S nu --stdin

source tex_etc/common.nu

# List supported source formats and styles.
def "main supports" [] {
    {
        source: ['builtin.bib', 'better.bib'],
    } | to json
}

# Format a bibliography of the entries from stdin.
def main []: string -> string {
    cd ($env.CURRENT_FILE | path dirname | path dirname)
    mkdir target/tex-cache/run-bibtex/
    cd target/tex-cache/run-bibtex/

    let source = $in
    $source o> ref.bib

    $'
(documentclass_ctexart)

% 让每项文献只占一行，并且无页码等文字干扰
\usepackage[paperwidth=200em]{geometry}
\pagestyle{empty}

% 让字体支持俄文
\setmainfont{cmunrm.otf}

\usepackage{gbt7714}
\bibliographystyle{gbt7714-2025-numeric}
\renewcommand{\refname}{} % 删除文献表的标题

\begin{document}
\nocite{*}
\bibliography{ref.bib}
\end{document}
    ' o> main.tex

    run_lualatex
    pdf_to_text main.pdf
}
