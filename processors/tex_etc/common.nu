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

# 根据环境变量 $CTEX_FONTSET 设置文档类 ctexart
def documentclass_ctexart []: nothing -> string {
    let fontset = $env | get CTEX_FONTSET --optional
    if fontset == null {
        '\documentclass{ctexart}'
    } else {
        $'\documentclass[fontset=($fontset)]{ctexart}'
    }
}
