export def run-lualatex []: nothing -> nothing {
    try {
        latexmk -lualatex | print --stderr
    } catch {
        latexmk -lualatex -gg | print --stderr
    }
}

export def pdf-to-text [pdf: path]: nothing -> string {
    pdftotext $pdf -
    | str trim
    | str replace --all "\r\n" "\n"
    | str replace --all "\f" ""
    | str replace --all --regex '\n+(\[\d+\])' "\n$1"
    | str replace --all --regex '\n{2,}' " "
    | str replace --all --regex '\n(?!\[)' ""
}

# 根据环境变量 $CTEX_FONTSET 设置文档类 ctexart
export def documentclass-ctexart []: nothing -> string {
    let fontset = $env | get CTEX_FONTSET --optional
    if fontset == null {
        '\documentclass{ctexart}'
    } else {
        $'\documentclass[fontset=($fontset)]{ctexart}'
    }
}

export const INFRA_VERSION_PATTERNS = [
  '^This is (LuaHBTeX, Version \d+\.\d+\.\d+ \(TeX Live \d{4}\)  \(format=lualatex \d{4}\.\d+\.\d+\))',
  '^(LaTeX2e <\d{4}-\d{2}-\d{2}>)$',
  '^(L3 programming layer <\d{4}-\d{2}-\d{2}>)$',
  '^Document Class: (ctexart \d{4}/\d{2}/\d{2} v\d+\.\d+\.\d+) Chinese adapter for class article',
]
