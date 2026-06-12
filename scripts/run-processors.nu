def write_summary [message: string]: nothing -> nothing {
    print $message

    let summary = $env | get GITHUB_STEP_SUMMARY --optional | default ([$env.CURRENT_FILE, "../../target/out/report.md"] | path join)
    mkdir ($summary | path dirname)
    $message + "\n\n" | save --append $summary
}

# Run all supported processors against a data source.
def main [
    source: path, # Path to a file in data/
]: nothing -> nothing {
    let source_kind = $source | path split | last | split row '.' | last 2 | str join '.'
    let source_content = open --raw $source

    cd ($env.CURRENT_FILE | path dirname | path dirname)
    cd processors/
    glob *.nu | each {|processor|
        let processor_name = ($processor | path parse).stem
        let supports = (nu $processor supports | from json)
        if $source_kind in $supports.source {
            if "style" in $supports {
                $supports.style | each {|style|
                    write_summary $"🟡 Run ($processor_name) with ($style)…"

                    let out = $"../target/out/($source | path split | last)/($processor_name)/($style).txt"
                    mkdir ($out | path dirname)

                    let duration = timeit {
                        $source_content | nu --stdin $processor $style o> $out
                    }

                    write_summary $"✅ ($processor_name) with ($style) completed in ($duration)."
                    write_summary $"Output: ($out)"
                }
            } else {
                write_summary $"🟡 Run ($processor_name)…"

                let out = $"../target/out/($source | path split | last)/($processor_name)/default.txt"
                mkdir ($out | path dirname)

                let duration = timeit {
                    $source_content | nu --stdin $processor o> $out
                }

                write_summary $"✅ ($processor_name) completed in ($duration)."
                write_summary $"Output: ($out)"
            }
        }
    }

    null
}
