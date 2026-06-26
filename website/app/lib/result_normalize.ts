/** Convert selected punctuation marks to ASCII. */
function toAscii(s: string): string {
  return s.replaceAll("，", ",").replaceAll("：", ":").replaceAll("；", ";");
}

/** Normalize a formatted entry. */
export function normalizeResult(s: string): string {
  const firstToAscii = (_match: string, p1: string, p2: string): string =>
    `${toAscii(p1)} ${p2}`;
  const secondToAscii = (_match: string, p1: string, p2: string): string =>
    `${p1} ${toAscii(p2)}`;

  const insertSpace = "$1 $2";

  const removeMatchSpaces = (match: string): string =>
    match.replaceAll(" ", "");

  return (
    // See https://www.unicode.org/reports/tr44/tr44-24.html#GC_Values_Table
    s
      // 1. Add spaces
      .replaceAll(
        /([\p{Other_Punctuation}\p{Close_Punctuation}\p{Final_Punctuation}])\s*(\p{Letter})/gu,
        firstToAscii,
      )
      .replaceAll(
        // Excluding `.`, which can be used in version numbers, e.g. `V1.0`.
        /([,:;，：；])\s*([\p{Letter}\p{Number}\p{Open_Punctuation}\p{Initial_Punctuation}])/gu,
        firstToAscii,
      )
      .replaceAll(
        /([\p{Letter}\p{Number}])\s*([\p{Open_Punctuation}\p{Initial_Punctuation}&])/gu,
        secondToAscii,
      )
      .replaceAll(/\s*[（(]/gu, " (")
      .replaceAll(/[）)]\s*/gu, ") ")
      .replaceAll(/([\p{sc=Han}\]]\.?)([\p{Number}\[])/gu, insertSpace)
      .replaceAll(".[", ". [")
      // 2. Clean redundant spaces
      .replaceAll(/https?:\/\/.+$/gu, removeMatchSpaces)
      .replaceAll(/\/\s[A-Z]/gu, removeMatchSpaces)
      .replaceAll(/[A-Z]\s*\]/gu, removeMatchSpaces)
      .replaceAll(/\s*[·《》]\s*/gu, removeMatchSpaces)
      .replaceAll(") :", "):")
      .replaceAll(/%\s+/gu, "%")
      .replaceAll("[S. l.]", "[S.l.]")
      .replaceAll("[s. n.]", "[s.n.]")
      .replaceAll(/[\p{sc=Latin}\p{Number}]\s+\p{sc=Han}/gu, removeMatchSpaces)
      .replaceAll(/\p{sc=Han}\s+[\p{sc=Latin}\p{Number}]/gu, removeMatchSpaces)
  );
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("toAscii", () => {
    expect(toAscii("，：")).toBe(",:");

    // U+2236 Mathematical Operators RATIO
    const unchanged = "。《》\u{2236}";
    expect(toAscii(unchanged)).toBe(unchanged);
  });

  test("normalizeResult", () => {
    const results = `
[3] Boobier T.AI and the future of banking[M].Chichester:John Wiley& Sons,2020:35.
[52] V1.0
[66] [S.l.]:Macmillan,1975
[73] Salt Lake City:[s.n.],1964
[99] 顾炎武. 昌平山水记；京东考古录[M]. 北京：北京古籍出版社，1980.
[122] [J]. 2011，33（2）：20-25；2011，33（3）：26-30.
[134] 牛志明,Swingland I R,雷光春.综合湿地管理:综合湿地管理国际研讨会论文集[C].北京:海洋出版社,2012.
[134] 牛志明，Swingland I R，雷光春. 综合湿地管理：综合湿地管理国际研讨会论文集[M]. 北京：海洋出版社，2012.
[187] 陈登原. 国史旧闻：第%s 卷 1[M]. 北京：中华书局，2000.
[215] 扬奎斯特,萨金特.递归宏观经济理论[M].杨斌,王忠玉,陈彦斌,等,译.2版.北京:中国人民大学出版社,2010:798.
[227] Boobier T.AI and the future of banking[M ].Chichester:John Wiley & Sons,2020:35.
[229] 阿扬.谈谈记忆:与诺贝尔获奖得者埃里克·坎德尔的问答[M].姜海伦,译// 《环球科学》杂志社.认识记忆力:关于学习、思考与遗忘的脑科学.北京:机械工业出版社,2023:15-18.
[243] 杨洪升. 四库馆私家抄校书考略[J]. 文献，2013（1）：56-75.
[255] Saito M,Miyazaki K.Jadeite-bearing metagabbro in serpentinite melange of the“Kurosegawa Belt”in Izumi Town,Yatsushiro City,Kumamoto Prefecture,central Kyushu[J].Bulletin of the Geological Survey of Japan,2006,57 (5/6):169-176.
[269] 陈志勇.中国财税文化价值研究:“中国财税文化国际学术研讨会”论文集[C/OL].北京:经济科学出版社,2011.http://apabi.lib.pku.edu.cn/usp/pku/pub.mvc? pid=book.detail&metaid=m.20110628-BPO-889-0135&cult=CN.
[282] 汤万金, 杨跃翔, 刘文, 等.人体安全重要技术标准研制最终报告:7178999X-2006BAK04A10/10.2013[R/OL].2013-09-30.http://www.nstrs.cn/xiangxiBG.aspx?id=41707.
[305] 中国科学院文献情报中心.中国科学院科技论文预发布平台[EB/OL].[2025-03-06].https://chinaxiv.org/home.htm.
[317] Zotero.[Zotero download][EB/OL].[2024-04-08].https://www.zotero.org/download/.
[342] 肖玲，张雪，王永. 数据要素的统计测算方法探究 [EB/OL]. PSSXiv，2024（2024-07-02）[2024-09-30]. https://zsyyb.cn/abs/202408.01096.
[344] Jenkins S D,Ruostekoski J.Controlled manipulation of light by cooperative response of atoms in an optical lattice[PP/OL].V2.arXiv (2012-03-18) [2020-06-24].https://doi.org/10.48550/arXiv.1112.6136.
`
      .trim()
      .split("\n");

    expect(results.map(normalizeResult)).toMatchInlineSnapshot(`
      [
        "[3] Boobier T. AI and the future of banking [M]. Chichester: John Wiley & Sons, 2020: 35.",
        "[52] V1.0",
        "[66] [S.l.]: Macmillan, 1975",
        "[73] Salt Lake City: [s.n.], 1964",
        "[99] 顾炎武. 昌平山水记; 京东考古录 [M]. 北京: 北京古籍出版社, 1980.",
        "[122] [J]. 2011, 33 (2): 20-25; 2011, 33 (3): 26-30.",
        "[134] 牛志明, Swingland I R, 雷光春. 综合湿地管理: 综合湿地管理国际研讨会论文集 [C]. 北京: 海洋出版社, 2012.",
        "[134] 牛志明, Swingland I R, 雷光春. 综合湿地管理: 综合湿地管理国际研讨会论文集 [M]. 北京: 海洋出版社, 2012.",
        "[187] 陈登原. 国史旧闻: 第%s卷1 [M]. 北京: 中华书局, 2000.",
        "[215] 扬奎斯特, 萨金特. 递归宏观经济理论 [M]. 杨斌, 王忠玉, 陈彦斌, 等, 译. 2版. 北京: 中国人民大学出版社, 2010: 798.",
        "[227] Boobier T. AI and the future of banking [M]. Chichester: John Wiley & Sons, 2020: 35.",
        "[229] 阿扬. 谈谈记忆: 与诺贝尔获奖得者埃里克·坎德尔的问答 [M]. 姜海伦, 译//《环球科学》杂志社. 认识记忆力: 关于学习、 思考与遗忘的脑科学. 北京: 机械工业出版社, 2023: 15-18.",
        "[243] 杨洪升. 四库馆私家抄校书考略 [J]. 文献, 2013 (1): 56-75.",
        "[255] Saito M, Miyazaki K. Jadeite-bearing metagabbro in serpentinite melange of the “Kurosegawa Belt” in Izumi Town, Yatsushiro City, Kumamoto Prefecture, central Kyushu [J]. Bulletin of the Geological Survey of Japan, 2006, 57 (5/6): 169-176.",
        "[269] 陈志勇. 中国财税文化价值研究: “中国财税文化国际学术研讨会” 论文集 [C/OL]. 北京: 经济科学出版社, 2011. http://apabi.lib.pku.edu.cn/usp/pku/pub.mvc?pid=book.detail&metaid=m.20110628-BPO-889-0135&cult=CN.",
        "[282] 汤万金, 杨跃翔, 刘文, 等. 人体安全重要技术标准研制最终报告: 7178999X-2006BAK04A10/10.2013 [R/OL]. 2013-09-30. http://www.nstrs.cn/xiangxiBG.aspx?id=41707.",
        "[305] 中国科学院文献情报中心. 中国科学院科技论文预发布平台 [EB/OL]. [2025-03-06]. https://chinaxiv.org/home.htm.",
        "[317] Zotero. [Zotero download] [EB/OL]. [2024-04-08]. https://www.zotero.org/download/.",
        "[342] 肖玲, 张雪, 王永. 数据要素的统计测算方法探究 [EB/OL]. PSSXiv, 2024 (2024-07-02) [2024-09-30]. https://zsyyb.cn/abs/202408.01096.",
        "[344] Jenkins S D, Ruostekoski J. Controlled manipulation of light by cooperative response of atoms in an optical lattice [PP/OL]. V2. arXiv (2012-03-18) [2020-06-24]. https://doi.org/10.48550/arXiv.1112.6136.",
      ]
    `);
    // [344]的`V2. arXiv`不对，但十分罕见，就忽略了吧……
  });
}
