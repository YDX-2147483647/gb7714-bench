def run_lualatex []: nothing -> nothing {
    try {
        latexmk -lualatex | print --stderr
    } catch {
        latexmk -lualatex -gg | print --stderr
    }
}

def pdf_to_text [pdf: path]: nothing -> string {
    pdftotext $pdf -
    | str trim
    | str replace --all "\r\n" "\n"
    | str replace --all "\f" ""
    | str replace --all --regex '\n+(\[\d+\])' "\n$1"
    | str replace --all --regex '\n{2,}' " "
    | str replace --all --regex '\n(?!\[)' ""
}
