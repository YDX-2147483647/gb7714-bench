# 各引擎的测试脚本

## 约定

每个引擎测试脚本的入口为[`*.nu`文件](https://www.nushell.sh/)，至少提供以下两个命令。

- `main […]: string → string`

  从 stdin 接收文献数据源，调用引擎处理，然后将处理结果输出到 stdout。

  若引擎基于 CSL，应添加`style?: string`参数，内容是 CSL 样式的名称，例如`gb-7714-2025-numeric.compliant.csl`，默认值是该引擎最常用或最适合的 CSL 样式。

- `main supports`

  以 JSON 形式输出引擎的支持范围。

  - `source`字段列出支持的文献数据源格式，例如`["builtin.json", "better.bib"]`，无顺序要求。
  - 若引擎基于 CSL，应在`style`字段列出支持的 CSL 样式的名称，无顺序要求，必须包含`main`命令`style`参数的默认值；若不基于 CSL，应不提供`style`字段。

脚本可假设工作目录是此文件夹，且相关工具已经安装，CSL 相关文件也已下载至`target/style-cache/`。

如果确实必要，脚本可在`target/`建立文件夹存储文件。脚本不必考虑文件读写竞争，但需自行处理之前运行遗留的文件。

脚本需支持在 Windows 与 Ubuntu 运行，必要时可新设环境变量控制行为。
