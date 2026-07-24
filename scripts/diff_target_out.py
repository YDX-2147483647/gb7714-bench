"""Compare `target/out/` with `target-out.zip` in the latest release.

Usage:
    uv run scripts/diff_target_out.py
"""

import json
from collections import deque
from difflib import Differ, HtmlDiff
from html import escape
from io import BytesIO
from pathlib import Path
from subprocess import run
from zipfile import ZipFile


def fetch_ref() -> tuple[str, str, bytes]:
    latest_tag = json.loads(
        run(
            ["gh", "release", "ls", "--json=tagName", "--limit=1"],
            check=True,
            text=True,
            capture_output=True,
        ).stdout
    )[0]["tagName"]
    latest_url = (
        f"https://github.com/YDX-2147483647/gb7714-bench/releases/tag/{latest_tag}"
    )
    target_out_zip = run(
        [
            "gh",
            "release",
            "download",
            latest_tag,
            "--pattern=target-out.zip",
            "--output=-",
        ],
        check=True,
        capture_output=True,
    ).stdout
    return latest_tag, latest_url, target_out_zip


def main() -> None:
    target_dir = Path(__file__).parent / "../target"
    actual_dir = target_dir / "out"

    ref_tag, ref_url, ref_out = fetch_ref()

    html_result_parts = deque(
        [
            f"<h1>Diff from <a href='{ref_url}'><code>{ref_tag}</code></a> to current</h1>"
        ]
    )
    text_result_parts = deque([f"# Diff from [`{ref_tag}`]({ref_url}) to current"])

    html_differ = HtmlDiff(wrapcolumn=40)
    text_differ = Differ()

    with ZipFile(BytesIO(ref_out)) as ref_zip:
        names = sorted(
            f.filename.removeprefix("out/")
            for f in ref_zip.infolist()
            if not f.is_dir()
        )
        changed = False
        for name in names:
            ref = ref_zip.read(f"out/{name}").decode().strip().splitlines(keepends=True)
            actual = (
                (actual_dir / name)
                .read_text(encoding="utf-8")
                .strip()
                .splitlines(keepends=True)
            )

            if ref != actual:
                changed = True
                heading = f"<details><summary>{escape(name)}</summary>"
                tail = "</details>"

                text_part = "".join(
                    line
                    for line in text_differ.compare(ref, actual)
                    if line.startswith(("- ", "+ ", "? "))
                )
                text_result_parts.append(
                    f"""
{heading}

Ref → Actual

```diff
{text_part}
```

{tail}""".strip()
                )

                html_result_parts.append(heading)
                html_result_parts.append(
                    html_differ.make_table(
                        ref,
                        actual,
                        "Ref",
                        "Actual",
                        context=True,
                        numlines=0,
                    )
                )
                html_result_parts.append(tail)

    if not changed:
        text_result_parts.append("Nothing changed.")
        html_result_parts.append("<p>Nothing changed.</p>")

    text_result = "\n\n".join(text_result_parts)

    html_result = (
        # Adpated from `HtmlDiff.make_file`.
        # https://github.com/python/cpython/blob/v3.13.14/Lib/difflib.py#L1705-L1730
        (
            html_differ._file_template  # type: ignore
            % {
                "styles": html_differ._styles,  # type: ignore
                "legend": html_differ._legend,  # type: ignore
                "table": "\n".join(html_result_parts),
                "charset": "utf-8",
            }
        )
        .encode("utf-8", "xmlcharrefreplace")
        .decode("utf-8")
    )

    (target_dir / "diff.md").write_text(text_result, encoding="utf-8")
    (target_dir / "diff.html").write_text(html_result, encoding="utf-8")
    print("Please check target/diff.{md,html}.")


if __name__ == "__main__":
    main()
