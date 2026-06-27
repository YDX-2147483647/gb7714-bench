import { diffWordsWithSpace } from "diff";

export function calcAddedRanges(
  ref: string,
  actual: string,
): [number, number][] {
  const diff = diffWordsWithSpace(ref, actual);

  const addedRanges: [number, number][] = [];
  let n = 0;
  for (const { added, value, removed } of diff) {
    if (added) {
      addedRanges.push([n, n + value.length]);
    }
    if (!removed) {
      n += value.length;
    }
  }
  return addedRanges;
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("calcAddedRanges", () => {
    const ref = `
@book{gbt7714.5.1:1,
	author = {{博伯尔}},
	date = {2023},
	isbn = {978-7-302-58978-5},
	langid = {pinyin},
	location = {北京},
	note = {Pages: 35},
	publisher = {清华大学出版社},
	title = {银行业的未来与人工智能},
	translator = {{徐超}},
}`.trim();
    const actual = `
@book{gbt7714.5.1:1,
	author = {{博伯尔}},
	date = {2023},
	isbn = {978-7-302-58978-5},
	langid = {chinese},
	location = {北京},
	pages = {35},
	publisher = {清华大学出版社},
	title = {银行业的未来与人工智能},
	translator = {{徐超}},
}`.trim();

    const addedRanges = calcAddedRanges(ref, actual);

    expect(addedRanges).toStrictEqual([
      [96, 103],
      [125, 130],
    ]);
    expect(
      addedRanges.map(([start, end]) => actual.slice(start, end)),
    ).toStrictEqual(["chinese", "pages"]);
  });
}
