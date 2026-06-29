# GB/T 7714 格式参考文献引擎哪家强？

[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/YDX-2147483647/gb7714-bench/ci.yaml?style=flat-square)](https://github.com/YDX-2147483647/gb7714-bench/actions/workflows/ci.yaml)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fgb7714.zhtyp.art&style=flat-square)](https://gb7714.zhtyp.art)
[![Netlify Status](https://api.netlify.com/api/v1/badges/4ba176ba-8c79-4f96-abf5-8e83c744fcda/deploy-status)](https://app.netlify.com/projects/gb7714-bench/deploys)

<!-- NOTE: The following will be included in the website. -->

推荐性国家标准 [GB/T 7714—2025《信息与文献　参考文献著录规则》](https://std.samr.gov.cn/gb/search/gbDetailed?id=4507EFE13D37CB6AE06397BE0A0A601F)（PDF：[知网影印版](https://publishmedia.cbpt.cnki.net/portal/minio/webs/hbxy/media/web/2026/01/20/GBT%207714—2025%20信息与文献%20参考文献著录规则.pdf)／[标网数字正版](https://www.spc.org.cn/online/c6ce52e55ac09b9c79a20aea77cedd14.html)）计划自2026年7月1日起实施。

此项目利用 [Zotero 中文 CSL 开发组的测试文献数据](https://github.com/typst-doc-cn/bib-csl-dev-data)，测试了十种支持 GB/T 7714 的参考文献引擎。测试初步结果可在[网站`/entry/`页](https://gb7714.zhtyp.art/entry/)查看（加载可能比较慢）。

对于广大文章作者，希望此项目能帮助评估各引擎成熟程度与文献数据兼容性，选择省心组合舒服地写作；对于参考文献引擎与样式开发者，希望此项目能帮助查找各家程序缺陷，并提升跨引擎、跨文献数据格式的兼容性。

## 测试范围

此项目主要测试2025版国标；不过部分主流引擎同时测试了2015版国标，以与暂时只支持2015版国标的引擎相互比较。

此项目关注文末参考文献表中每篇文献著录的文本内容，不关注参考文献表的组织方式与排版样式，也不关注正文引注。

此项目当前主要关注各引擎实现的正确性，而不太关注性能。[CI · Workflow runs](https://github.com/YDX-2147483647/gb7714-bench/actions/workflows/ci.yaml) 会输出每种「数据源 · 引擎 · 样式」组合处理文献所用时长，但只能用于调试，不能用于严谨评估性能[^perf]。

[^perf]: 每种组合都只运行了一次，而且并未控制缓存情况不变。

## 测试对象与方法

处理结果由数据源、引擎、样式三者共同决定。数据源提供文献信息，引擎实现文献著录，样式控制著录项目与格式。

### 数据源

数据源从 Zotero 导出，有`GB-T_7714—2025.{builtin,better}.{bib,json}`共 2×2 = 4 个版本。详情请移步 [bib-csl-dev-data](https://github.com/typst-doc-cn/bib-csl-dev-data)。

为方便对比，此项目还引用了[`GB-T_7714—2025.original.toml`](https://github.com/typst-doc-cn/bib-csl-dev-data/blob/main/data/GB-T_7714—2025.original.toml)。该文件的内容提取自 [Z-Library 上2025版国标数字版 PDF](https://z-lib.sk/book/Eq8yZgnY5D/gbt-77142025-信息与文献-参考文献著录规则.html) 中嵌入的文本，数据质量较差，请谨慎参考。详见文件开头的`notes`。

### 引擎

各引擎的测试脚本位于[`processors/`](./processors/)。

- **[Zotero](./processors/zotero/main.ts)** 🔮 ([Citation.js](https://citation.js.org) + [citeproc-js](https://citeproc-js.readthedocs.io))

  Zotero 技术栈有稳定编程接口，调用即可获得文献处理结果。

- **[LaTeX 系列](./processors/tex_etc/common.nu)**

  - BibTeX: [gbt7714-bibtex-style](./processors/gbt7714-bibtex-style.nu) ([CTAN: gbt7714](https://www.ctan.org/pkg/gbt7714))
  - BibLaTeX: [biblatex-gb7714-2025](./processors/biblatex-gb7714-2025.nu) ([CTAN: biblatex-gb7714-2015](https://www.ctan.org/pkg/biblatex-gb7714-2015))
  - Lua: [citeproc-lua](./processors/citeproc-lua.nu) 🔮 ([CTAN: citation-style-language](https://www.ctan.org/pkg/citation-style-language))

  LaTeX 系列统一选用`ctexart`文档类，采用`latexmk --lualatex`编译输出 PDF，然后从 PDF 提取文本作为文献处理结果。

  受 PDF 机制所限，即使页面宽度能保证参考文献表每项不会折行，从 PDF 提取出的文本也可能比较零碎，因此提取后还统一用脚本整合了碎片。不过脚本难免存在失误，结果可能多余或缺少空白字符。如果发现这类问题，可[通过 GitHub issue 反馈](https://github.com/YDX-2147483647/gb7714-bench/issues/new/choose)。

- **[Typst 系列](./processors/typst_etc/common.py)**

  - [Typst](./processors/typst.nu) 🔮（内置[`bibliography`元素](https://typst.app/docs/reference/model/bibliography/)）
  - NJU: [typst-modern-nju-thesis](./processors/typst-modern-nju-thesis.nu) 🔮 ([Typst Universe](https://typst.app/universe/package/modern-nju-thesis))
  - GB7714-bilingual: [typst-gb7714-bilingual](./processors/typst-gb7714-bilingual.nu) ([Typst Universe](https://typst.app/universe/package/gb7714-bilingual))
  - Citrus: [typst-citrus](./processors/typst-citrus.nu) 🔮 ([Typst Universe](https://typst.app/universe/package/citrus)，又名 citeproc-typst)
  - Omni: [typst-omni-gb7714](./processors/typst-omni-gb7714.nu) ([GitHub](https://github.com/typst-omni-gb7714/omni-gb7714)，尚未发布于 Typst Universe)

  其实 Typst 系列还有 [Citext](https://github.com/Shuenhoy/citext)。不过其技术栈与 Zotero 基本相同，只是运行 JavaScript 的方式不同，所以估计其文献处理结果与 Zotero 完全一致，不必专门测试。

  Typst 系列统一调用 [typst-py](https://pypi.org/project/typst/) 生成 HTML，然后从 HTML 提取文本作为文献处理结果。

  HTML 不存在 PDF 那样的文本碎片问题；不过有些引擎对 HTML 支持不好，需要额外适配，具体请参考[定制修补 Typst 包的脚本](./scripts/setup-typst-local-pkg.nu)与各引擎的测试脚本。

- **[Pandoc](./processors/pandoc.nu)** 🔮

  Pandoc 有命令行接口，指定`--to plain`即可按纯文本导出文献处理结果。

  Pandoc 支持多种文献处理方式。这里只测试`pandoc --citeproc`调用 [haskell citeproc](https://hackage.haskell.org/package/citeproc) 的方式，不测试它调用 LaTeX 的方式。

另外，有的引擎直接加载文献数据源会报错（主要是因为`*.better.*`的奇异字段），无法正常生成参考文献表；还有引擎不支持保持条目原始顺序，输出的参考文献表难以与其它引擎比较。针对这些情况，此项目对很多引擎做了适当修补，具体请参考各引擎测试脚本。

### 样式

以上标记 🔮 的引擎都是基于 [Citation Style Language (CSL)](https://docs.citationstyles.org/en/stable/specification.html) 的通用引擎，通过`*.csl`文件支持任意样式。

对于这些引擎，此项目测试时忽略引擎内置 CSL 样式，而统一使用以下 CSL 样式。其中`*.compliant`严格符合 CSL 标准，大部分 CSL 引擎都支持；而`*.extended`使用了 [CSL-M 扩展](https://citeproc-js.readthedocs.io/en/latest/csl-m/) 与 [Zotero 中文社区约定](https://github.com/zotero-chinese/csl-m-schema-rng/tree/main/patches)，各 CSL 引擎支持程度不一。

- 2015 CSL: [gb-7714-2015-numeric.compliant](https://github.com/citation-style-language/styles/blob/HEAD/china-national-standard-gb-t-7714-2015-numeric.csl)
- 2025 CSL: [gb-7714-2025-numeric.compliant](https://github.com/citation-style-language/styles/blob/HEAD/china-national-standard-gb-t-7714-2025-numeric.csl)
- 2025 CSL-M⁺: [gb-7714-2025-numeric.extended](https://github.com/zotero-chinese/styles/blob/HEAD/src/GB-T-7714—2025（顺序编码，双语）/GB-T-7714—2025（顺序编码，双语）.csl)

对于其它引擎，此项目测试各自默认选项。

## 复现

此项目支持在 Windows 和 Ubuntu 复现，具体步骤请参考[`ci.yaml`](./.github/workflows/ci.yaml)。
