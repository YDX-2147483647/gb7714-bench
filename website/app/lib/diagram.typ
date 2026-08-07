#set text(
  lang: "zh",
  font: ("Libertinus Serif", "Source Han Serif SC"),
  top-edge: "ascender",
  bottom-edge: "descender",
)
#set page(
  height: auto,
  width: auto,
  margin: (top: 1.5em, bottom: 3em, x: 2em),
  fill: none,
)

#set document(title: [各种处理结果与国标原文一致的条目数量])
#show title: set text(0.8em)

#text(blue.darken(20%), link("https://gb7714.zhtyp.art/")[gb7714.zhtyp.art])
#v(weak: true, 0.3em)
#title()
#v(weak: true, 0.5em)
#text(0.8em, luma(40%))[
  （仅计完全一致的；比较时忽略大小写和标点符号编码方式差异）
]

#{
  let source-list = json(bytes(sys.inputs.sourcesHuman))
  let metrics = json(bytes(sys.inputs.metrics))
  pdf.attach("diagram.typ", bytes(sys.inputs.src))

  let processor-color = (
    gbt7714-bibtex-style: fuchsia,
    biblatex-gb7714-2025: rgb("#008080"), // https://simpleicons.org/?q=latex
    citeproc-lua: rgb("#000080"), // https://simpleicons.org/?q=lua
    zotero: rgb("#CC2936"), // https://simpleicons.org/?q=zotero
    citum: rgb("#5F5F5A"), // https://citum.org `--graphite`
    pandoc: rgb("#4093DA"), // https://simpleicons.org/?q=pandoc
    typst: rgb("#239DAD"), // https://simpleicons.org/?q=typst
    typst-modern-nju-thesis: rgb("#63065f"), // https://www.nju.edu.cn
    typst-omni-gb7714: orange,
    typst-citrus: rgb("#ca8a04"),
    typst-gb7714-bilingual: rgb("#991b1b"),
  )

  let max-metric = calc.min(
    344,
    calc.max(..metrics.values().map(processor-style => processor-style.metrics.values()).flatten()) * 1.05,
  )

  block(width: 30em, height: 15em, {
    // Axes
    place(grid(
      columns: (80%, 1fr),
      rows: 1fr,
      align: horizon,
      column-gutter: 1em,
      ..for source in source-list {
        (line(length: 100%), source)
      }
    ))
    /// Convert a metric to its x coordinate.
    let as-x(metric) = {
      80% * (1 - metric / max-metric)
    }
    /// Convert a source-human to its y coordinate
    let as-y(source-human) = {
      let pos = source-list.position(s => s == source-human)
      assert.ne(pos, none)
      100% * (pos + 1 / 2) / source-list.len()
    }

    // Grid lines
    for metric in range(calc.floor(max-metric / 50), inclusive: true).map(i => i * 50) {
      let x = as-x(metric)
      place(dx: x, {
        show: box.with(width: 0em)
        set align(center)
        show: box.with(width: 5em)
        text(luma(40%), 0.8em)[#metric 条一致]
      })
      place(line(
        start: (x, 1em),
        end: (x, as-y(source-list.last()) + 0.5em),
        stroke: gray + 0.5pt,
      ))
    }

    for (processor-style, (processor, metrics)) in metrics {
      let color = processor-color.at(processor)

      // Dots
      for (source, metric) in metrics {
        let radius = 0.2em
        place(
          dy: as-y(source) - radius,
          dx: as-x(metric) - radius,
          circle(radius: radius, stroke: none, fill: color),
        )
      }

      // Lines
      for (
        (source1, metric1),
        (source2, metric2),
      ) in metrics.pairs().slice(0, -1).zip(metrics.pairs().slice(1)) {
        place(line(
          start: (as-x(metric1), as-y(source1)),
          end: (as-x(metric2), as-y(source2)),
          stroke: 0.5pt + color,
        ))
      }
    }

    for (processor-style, (processor, metrics)) in metrics {
      let color = processor-color.at(processor)

      // Best metric
      let (source, metric) = metrics.pairs().sorted(key: ((source, metric)) => metric).last()

      let dx = if processor-style == "NJU · 2015 CSL" {
        -0.1em
      } else if processor-style == "Typst · 2015 CSL" {
        0.4em
      } else if processor-style == "Lua · 2025 CSL-M⁺" {
        -0.2em
      } else if processor-style == "Zotero · 2025 CSL-M⁺" {
        0.1em
      } else if processor-style == "Citrus · 2025 CSL-M⁺" {
        -0.3em
      } else if processor-style == "Citrus · 2025 CSL" {
        0.6em
      }

      // Texts
      place(
        dx: as-x(metric) + dx,
        dy: as-y(source) + 0.2em,
        {
          show: box.with(width: 0em)
          set align(right)
          set text(0.5em, color)
          rotate(-45deg, reflow: true, {
            place(text(stroke: 3pt + white, fill: white, processor-style))
            processor-style
          })
        },
      )
    }
  })
}
