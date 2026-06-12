#!/usr/bin/env -S nu --stdin

source tex_etc/common.nu

# List supported source formats and styles.
def "main supports" [] {
    echo {
        source: ['builtin.bib', 'better.bib'],
    } | to json
}

# Format a bibliography of the entries from stdin.
def main []: string -> string {
    cd ($env.CURRENT_FILE | path dirname | path dirname)
    mkdir target/tex-cache/run-biber/
    cd target/tex-cache/run-biber/

    let source = $in
    $source o> ref.bib

    '
\documentclass{ctexart}

% 让每项文献只占一行，并且无页码等文字干扰
\usepackage[paperwidth=200em]{geometry}
\pagestyle{empty}

% 让字体支持俄文
\setmainfont{cmunrm.otf}

\usepackage[backend=biber,style=gb7714-2025]{biblatex}
\addbibresource[location=local]{ref.bib}

% 临时处理 better.bib 中 @periodical 文献缺 number 导致的 Undefined \multinumberfirst
% （该问题已于 2026/06/10 v1.1x 修复）
% https://github.com/hushidong/biblatex-gb7714-2015/issues/239
\providecommand{\multinumberfirst}[1]{#1}
\providecommand{\multinumbersecond}[1]{#1}

\begin{document}
\nocite{*}
\printbibliography[heading=none]
\end{document}
    ' o> main.tex

    run_lualatex
    pdf_to_text main.pdf
}
