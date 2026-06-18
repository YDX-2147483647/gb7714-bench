import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

type BuiltinEntry = {
	id: string;
	title?: string;
	"citation-key"?: string;
	type?: string;
	[key: string]: unknown;
};

type EntrySummary = {
	index: number;
	id: string;
	citationKey: string;
	title: string;
	type: string;
};

type FileItem = {
	fileKey: string;
	sourcePath: string;
	item: string;
};

type OutItem = FileItem & {
	dataset: string;
	processor: string;
	style: string;
};

export type BenchIndexData = {
	entries: EntrySummary[];
};

export type BenchEntryData = {
	entry: EntrySummary;
	totalEntries: number;
	previousEntryId: string | null;
	nextEntryId: string | null;
	dataItems: FileItem[];
	outItems: OutItem[];
};

type BenchCache = {
	index: BenchIndexData;
	dataByIndex: FileItem[][];
	outByIndex: OutItem[][];
};

let cachePromise: Promise<BenchCache> | undefined;

export async function getBenchIndexData(): Promise<BenchIndexData> {
	const cache = await getBenchCache();
	return cache.index;
}

export async function getBenchEntryByParam(paramId: string): Promise<BenchEntryData | null> {
	const cache = await getBenchCache();
	const idx = resolveEntryIndex(cache.index.entries, paramId);

	if (idx < 0 || idx >= cache.index.entries.length) {
		return null;
	}

	return {
		entry: cache.index.entries[idx],
		totalEntries: cache.index.entries.length,
		previousEntryId: idx > 0 ? cache.index.entries[idx - 1]?.id ?? null : null,
		nextEntryId: idx < cache.index.entries.length - 1 ? cache.index.entries[idx + 1]?.id ?? null : null,
		dataItems: cache.dataByIndex[idx] ?? [],
		outItems: cache.outByIndex[idx] ?? [],
	};
}

async function getBenchCache(): Promise<BenchCache> {
	if (!cachePromise) {
		cachePromise = buildBenchCache();
	}
	return cachePromise;
}

async function buildBenchCache(): Promise<BenchCache> {
	const root = path.resolve(process.cwd(), "..");
	const dataRoot = path.join(root, "data", "data");
	const outRoot = path.join(root, "target", "out");

	const dataPaths = await listFiles(dataRoot);
	const outPaths = (await listFiles(outRoot)).filter((p) => p.toLowerCase().endsWith(".txt"));

	const builtinPath = dataPaths.find((p) => p.endsWith(".builtin.json"));
	if (!builtinPath) {
		throw new Error("Cannot find builtin JSON file in data/data.");
	}

	const builtinText = await readFile(builtinPath, "utf8");
	const builtinEntries = JSON.parse(builtinText) as BuiltinEntry[];
	const indexEntries = buildIndexEntries(builtinEntries);

	const dataByIndex = indexEntries.map(() => [] as FileItem[]);
	const outByIndex = indexEntries.map(() => [] as OutItem[]);

	for (const filePath of dataPaths) {
		const rel = toPosix(path.relative(root, filePath));
		const fileKey = rel.replace(/^data\/data\//, "");
		const items = await parseDataFile(filePath);

		for (let i = 0; i < indexEntries.length; i += 1) {
			dataByIndex[i].push({
				fileKey,
				sourcePath: rel,
				item: items[i] ?? "",
			});
		}
	}

	for (const filePath of outPaths) {
		const rel = toPosix(path.relative(root, filePath));
		const parsed = parseOutPath(rel);
		const items = await parseOutFile(filePath);
		const simplifiedOutTitle = buildOutTitle(parsed);

		for (let i = 0; i < indexEntries.length; i += 1) {
			outByIndex[i].push({
				fileKey: simplifiedOutTitle,
				sourcePath: rel,
				dataset: parsed.dataset,
				processor: parsed.processor,
				style: parsed.style,
				item: items[i] ?? "",
			});
		}
	}

	for (const group of dataByIndex) {
		group.sort((a, b) => a.fileKey.localeCompare(b.fileKey));
	}
	for (const group of outByIndex) {
		group.sort((a, b) => a.fileKey.localeCompare(b.fileKey));
	}

	return {
		index: { entries: indexEntries },
		dataByIndex,
		outByIndex,
	};
}

function buildIndexEntries(builtinEntries: BuiltinEntry[]): EntrySummary[] {
	return builtinEntries.map((entry, i) => {
		const title = pickTitle(entry);
		return {
			index: i + 1,
			id: String(entry.id ?? `entry-${i + 1}`),
			citationKey: String(entry["citation-key"] ?? entry.id ?? ""),
			type: String(entry.type ?? "unknown"),
			title,
		};
	});
}

function pickTitle(entry: BuiltinEntry): string {
	const raw =
		(entry.title as string | undefined) ??
		(entry["container-title"] as string | undefined) ??
		(entry["citation-key"] as string | undefined) ??
		(entry.id as string | undefined) ??
		"(untitled)";
	return String(raw);
}

function resolveEntryIndex(entries: EntrySummary[], paramId: string): number {
	const decoded = decodeURIComponent(paramId);
	return entries.findIndex((entry) => entry.id === decoded);
}

async function parseDataFile(filePath: string): Promise<string[]> {
	const content = await readFile(filePath, "utf8");
	const ext = path.extname(filePath).toLowerCase();

	if (ext === ".json") {
		return parseJsonData(content);
	}

	if (ext === ".bib") {
		return splitBibEntries(content);
	}

	if (ext === ".toml") {
		return splitTomlExamples(content);
	}

	return content.split(/\r?\n/).filter((line) => line.trim().length > 0);
}

function parseJsonData(content: string): string[] {
	const parsed = JSON.parse(content) as unknown;
	if (!Array.isArray(parsed)) {
		return [];
	}

	return parsed.map((item) => JSON.stringify(item, null, 2));
}

function splitBibEntries(content: string): string[] {
	return content
		.split(/\r?\n(?=@)/g)
		.map((block) => block.trim())
		.filter((block) => block.startsWith("@"));
}

function splitTomlExamples(content: string): string[] {
	const blocks = [...content.matchAll(/examples\s*=\s*'''([\s\S]*?)'''/g)];
	const entries: string[] = [];

	for (const block of blocks) {
		const body = block[1] ?? "";
		for (const line of body.split(/\r?\n/)) {
			const text = line.trim();
			if (text.length > 0) {
				entries.push(text);
			}
		}
	}

	return entries;
}

async function parseOutFile(filePath: string): Promise<string[]> {
	const content = await readFile(filePath, "utf8");
	return splitOutEntries(content);
}

function splitOutEntries(content: string): string[] {
	return content
		.split(/\r?\n(?=\[\d+\]\s)/g)
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);
}

function parseOutPath(relPath: string): { dataset: string; processor: string; style: string } {
	const parts = relPath.split("/");
	if (parts.length < 5) {
		return {
			dataset: "unknown-dataset",
			processor: "unknown-processor",
			style: parts[parts.length - 1] ?? "unknown-style",
		};
	}

	return {
		dataset: parts[2],
		processor: parts[3],
		style: parts[4].replace(/\.txt$/i, ""),
	};
}

function buildOutTitle(parsed: { dataset: string; processor: string; style: string }): string {
	const dataset = simplifyDatasetName(parsed.dataset);
	const processor = simplifyProcessorName(parsed.processor);
	const style = simplifyStyleName(parsed.style);

	return style ? `${dataset} · ${processor} · ${style}` : `${dataset} · ${processor}`;
}

function simplifyDatasetName(dataset: string): string {
	return dataset.replace(/^GB-T_7714—2025\./, "");
}

function simplifyProcessorName(processor: string): string {
	const mapped: Record<string, string> = {
		"biblatex-gb7714-2025": "biblatex",
		"citeproc-lua": "lua",
		"gbt7714-bibtex-style": "bibtex",
		typst: "typst",
		"typst-citrus": "citrus",
		"typst-gb7714-bilingual": "gb7714-bilingual",
		"typst-modern-nju-thesis": "NJU",
		"typst-omni-gb7714": "omni",
		zotero: "zotero",
	};

	return mapped[processor] ?? processor;
}

function simplifyStyleName(style: string): string {
	if (style === "default") {
		return "";
	}

	let year = "";
	if (style.includes("gb-7714-2025-numeric")) {
		year = "2025";
	} else if (style.includes("gb-7714-2015-numeric")) {
		year = "2015";
	}

	let profile = "";
	if (style.endsWith(".compliant")) {
		profile = "CSL";
	} else if (style.endsWith(".extended")) {
		profile = "CSL-M⁺";
	}

	if (year && profile) {
		return `${year} ${profile}`;
	}
	if (year) {
		return year;
	}
	if (profile) {
		return profile;
	}

	return style;
}

async function listFiles(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true });
	const files: string[] = [];

	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await listFiles(full)));
		} else if (entry.isFile()) {
			files.push(full);
		}
	}

	files.sort((a, b) => a.localeCompare(b));
	return files;
}

function toPosix(p: string): string {
	return p.split(path.sep).join("/");
}
