"""Compile a Typst document and extract texts from the resulting HTML.

Usage:
    echo SOURCE | uv run --directory typst_etc/ common.py -- DOC SYS_INPUTS XPATH

SYS_INPUTS should be encoded in JSON. It will be joined with { "source": SOURCE }.

If the env var `$DEBUG` is set to `1`, then the resulting HTML will be printed to stderr.
"""

import json
from os import environ
from pathlib import Path
from sys import argv, stderr, stdin

import typst
from lxml import html

PACKAGE_PATH = Path(__file__).parent / "../../target/typst-pkg/"
assert PACKAGE_PATH.exists() and PACKAGE_PATH.is_dir(), (
    f"{PACKAGE_PATH} does not exist. Please run `nu scripts/setup-typst-local-pkg.nu` first."
)


def main() -> None:
    source = stdin.read()
    # The source can be so long that passing via args might trigger system I/O errors.
    # Use stdin instead.
    doc = argv[2]
    sys_inputs = json.loads(argv[3])
    xpath = argv[4]

    debug = environ.get("DEBUG") == "1"

    html_bytes, warnings = typst.compile_with_warnings(
        doc.encode(),
        format="html",
        sys_inputs={"source": source, **sys_inputs},
        package_path=PACKAGE_PATH,
    )
    html_doc = html_bytes.decode()

    for w in warnings:
        if w.message != "html export is under active development and incomplete":
            print("Warning:", w, file=stderr)
    if debug:
        print(html_doc, file=stderr)

    tree = html.fromstring(html_doc)
    print("\n".join(li.text_content() for li in tree.xpath(xpath)))


if __name__ == "__main__":
    main()
