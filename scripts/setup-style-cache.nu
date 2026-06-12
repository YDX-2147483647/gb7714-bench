# Setup CSL styles and locales in target/style-cache/.
#
# Env var `$GITHUB_MIRROR` (e.g., `https://ghfast.top/https://github.com/`) is supported.
def main []: nothing -> nothing {
    cd ($env.CURRENT_FILE | path dirname | path dirname)

    let github_mirror = $env | get GITHUB_MIRROR --optional | default 'https://github.com/'

    mkdir target/style-cache/

    {
        "locales-zh-CN.xml": "https://github.com/citation-style-language/locales/raw/af8725651dbca236639e4d539659b29457b47b50/locales-zh-CN.xml",
        "gb-7714-2015-numeric.compliant.csl": "https://github.com/citation-style-language/styles/raw/995f064bd45846c000080286186d81d0b97c96cc/china-national-standard-gb-t-7714-2015-numeric.csl",
        "gb-7714-2025-numeric.compliant.csl": "https://github.com/citation-style-language/styles/raw/995f064bd45846c000080286186d81d0b97c96cc/china-national-standard-gb-t-7714-2025-numeric.csl",
        "gb-7714-2025-numeric.extended.csl": "https://github.com/zotero-chinese/styles/raw/8cde8f171c8aaf81a4fc09251dc231c498a04123/src/GB-T-7714—2025（顺序编码，双语）/GB-T-7714—2025（顺序编码，双语）.csl"
    }
    | items {|filename, url|
        let filepath = ["target/style-cache/", $filename] | path join
        if ($filepath | path exists) {
            print $"($filename) already exists, skipping download."
        } else {
            let mirror = $url | str replace 'https://github.com/' $github_mirror
            print $"Downloading ($mirror) to ($filename)…"
            http get ($mirror | url encode) | save $filepath
        }
    }

    null
}
