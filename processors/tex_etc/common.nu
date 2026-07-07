export def run-lualatex []: nothing -> nothing {
    # 以下`do --capture-errors { ^cmd | tee { print --stderr } } | ignore`写法可以保证：
    # 1. cmd 退出代码非零时，整个命令的退出代码也非零
    # 2. cmd 的 stdout 会被转到 stderr，整个命令不生成多余 stdout
    # 3. cmd 的 stdout 会立即输出到 stderr，而不会阻塞到运行结束才一齐输出
    try {
        do --capture-errors { latexmk -lualatex | tee { print --stderr } } | ignore
    } catch {
        print --stderr "😱 Failed to compile with lualatex. Clean the cache and retry."
        do --capture-errors { latexmk -lualatex -gg | tee { print --stderr } } | ignore
    }
}

export def pdf-to-text [pdf: path]: nothing -> string {
    # -raw: keep strings in content stream order
    # -nopgbrk: don't insert page breaks ("\f") between pages
    pdftotext $pdf -raw -nopgbrk -
    | str trim
    | str replace --all "\r\n" "\n"
    | str replace --all --regex '\n(?!\[\d+\])' ""
}

# 根据环境变量 $CTEX_FONTSET 设置文档类 ctexart
def documentclass-ctexart []: nothing -> string {
    let fontset = $env | get CTEX_FONTSET --optional
    if fontset == null {
        '\documentclass{ctexart}'
    } else {
        $'\documentclass[fontset=($fontset)]{ctexart}'
    }
}

export def document-prelude []: nothing -> string {
    $'
(documentclass-ctexart)

% 让每项文献只占一行，并且无页码等文字干扰
\usepackage[paperwidth=400em]{geometry}
\pagestyle{empty}

% 让字体支持俄文
\setmainfont{cmunrm.otf}
    '
}

export const INFRA_VERSION_PATTERNS = [
  '^This is (LuaHBTeX, Version \d+\.\d+\.\d+ \(TeX Live \d{4}\)  \(format=lualatex \d{4}\.\d+\.\d+\))',
  '^(LaTeX2e <\d{4}-\d{2}-\d{2}>)$',
  '^(L3 programming layer <\d{4}-\d{2}-\d{2}>)$',
  '^Document Class: (ctexart \d{4}/\d{2}/\d{2} v\d+\.\d+\.\d+) Chinese adapter for class article',
]
