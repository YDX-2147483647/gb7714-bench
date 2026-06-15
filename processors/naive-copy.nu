#!/usr/bin/env -S nu --stdin
# List supported source formats and styles.
def "main supports" [] {
    {
        source: ['original.toml'],
    } | to json
}

# Format a bibliography of the entries from stdin.
def main []: string -> string {
  $in
  | from toml
  | get section
  | each {|sec|
          if $sec.id-prefix == "gbt7714.7.1.3:" {
              # 顺序编码制与著者-出版年制对照的例子只保留一份
              ($sec.examples | lines | first 2 | str join "\n") + "\n"
          } else {
              $sec.examples
          }
      }
  | str join
  | lines | enumerate | each {|x|
          let n = $x.index + 1
          let entry = $x.item | str replace --regex '^\[\d+\] ' ''
          $"[($n)] ($entry)\n"
      }
  | str join
}
