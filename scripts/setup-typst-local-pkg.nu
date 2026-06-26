def sanitize_patch [patch: string]: nothing -> string {
    (
        $patch
        | str trim
        | str replace --all "\r\n" "\n"
        # The space will fix patch corruption errors
        | str replace --all "\n\n" "\n \n"
    ) + "\n"
}

# Setup typst local packages used by processors in target/typst-pkg/.
def main []: nothing -> nothing {
    cd ($env.CURRENT_FILE | path dirname | path dirname)

    # Set up packages from git repositories.
    [
      {
        # This package has not been published to https://typst.app/universe/.
        name: "omni-gb7714",
        version: "0.0.999",
        git: "https://github.com/typst-omni-gb7714/omni-gb7714",
        revision: "a1e3e2f82915e438f7e567dc3b781e01cecd60ec",
        patch: '
diff --git a/.gitignore b/.gitignore
index 84bee07..1c46833 100644
--- a/.gitignore
+++ b/.gitignore
@@ -1,5 +1,6 @@
 *

+!typst.toml
 !.gitignore

 # README
diff --git a/typst.toml b/typst.toml
new file mode 100644
index 0000000..5417ac0
--- /dev/null
+++ b/typst.toml
@@ -0,0 +1,4 @@
+[package]
+name = "omni-gb7714"
+version = "0.0.999"
+entrypoint = "gb7714.typ"
',
      },
      {
        name: 'gb7714-bilingual',
        version: '0.2.399',
        git: 'https://github.com/pku-typst/gb7714-bilingual',
        revision: '3a19c8e99236b8561d3c5af8f40f17f42ebc067c',
        patch: '
diff --git a/src/api.typ b/src/api.typ
index ec6ae21..a4860d2 100644
--- a/src/api.typ
+++ b/src/api.typ
@@ -1,6 +1,14 @@
 // GB/T 7714 双语参考文献系统 - 公共 API

-#import "@preview/citegeist:0.2.2": load-bibliography
+#import "@preview/citegeist:0.2.2": load-bibliography as _load-bibliography
+#let load-bibliography(bib-str, ..args) = {
+  // 临时处理 HashMap 乱序问题 https://github.com/alexanderkoller/typst-citegeist/issues/7
+  let data = _load-bibliography(bib-str, ..args)
+  let key-order = bib-str.matches(regex("@\\w+\\{([^,\\s]+)")).map(m => m.captures.first())
+  for key in key-order {
+    ((key): data.at(key))
+  }
+}

 #import "@preview/auto-pinyin:0.1.0": to-pinyin

diff --git a/typst.toml b/typst.toml
index 1abff9c..9910ef4 100644
--- a/typst.toml
+++ b/typst.toml
@@ -1,6 +1,6 @@
 [package]
 name = "gb7714-bilingual"
-version = "0.2.3"
+version = "0.2.399"
 entrypoint = "lib.typ"
 authors = ["pku-typst"]
 license = "MIT"
',
      }
    ]
    | each {|pkg|
        print $'🟡 Setting up "@local/($pkg.name):($pkg.version)"…'
        mkdir $"target/typst-pkg/local/($pkg.name)/"
        cd $"target/typst-pkg/local/($pkg.name)/"

        if ($pkg.version | path exists) {
            cd $pkg.version
            try {
                git switch --detach $pkg.revision
            } catch {
                git fetch origin
                git switch --detach $pkg.revision
            }
        } else {
            git -c advice.detachedHead=false clone $pkg.git $pkg.version --revision $pkg.revision --depth 1 --filter blob:none
            cd $pkg.version
        }

        # The space will fix patch corruption errors
        let patch = sanitize_patch $pkg.patch
        try {
            $patch | git apply
            print $"✅ Set up \"@local/($pkg.name):($pkg.version)\" successfully."
        } catch {
            print $"🙀 Failed to apply patch for \"@local/($pkg.name):($pkg.version)\". Please check manually."
        }
    }

    # Set up packages from the typst universe.
    [
        {
            name: 'modern-nju-thesis',
            version: '0.4.199',
            published_version: '0.4.1',
            patch: '
diff --git a/typst.toml b/typst.toml
index e0f9578..6dd78f9 100644
--- a/typst.toml
+++ b/typst.toml
@@ -1,6 +1,6 @@
 [package]
 name = "modern-nju-thesis"
-version = "0.4.1"
+version = "0.4.199"
 entrypoint = "lib.typ"
 authors = ["OrangeX4"]
 license = "MIT"
diff --git a/utils/bilingual-bibliography.typ b/utils/bilingual-bibliography.typ
index b081d40..1582e63 100644
--- a/utils/bilingual-bibliography.typ
+++ b/utils/bilingual-bibliography.typ
@@ -37,7 +37,9 @@
     }
   }

-  show grid.cell.where(x: 1): it => {
+  show html.elem.where(tag: "li", attrs: (:)): it => {
+    show: html.li.with(class: "stop-show-rule-iteration")
+
     // 后续的操作是对 string 进行的。
     let ittext = to-string(it)
     // 判断是否为中文文献：去除特定词组后，仍有至少两个连续汉字。
',
        },
        {
            name: 'citrus',
            version: '0.2.199',
            published_version: '0.2.1',
            patch: '
diff --git a/src/init/bibtex.typ b/src/init/bibtex.typ
index a81a95d..0845dae 100644
--- a/src/init/bibtex.typ
+++ b/src/init/bibtex.typ
@@ -25,7 +25,15 @@
   auto-links: true,
   doc,
 ) = {
-  import "@preview/citegeist:0.2.1": load-bibliography
+  import "@preview/citegeist:0.2.2": load-bibliography as _load-bibliography
+  let load-bibliography(bib-str, ..args) = {
+    // 临时处理 HashMap 乱序问题 https://github.com/alexanderkoller/typst-citegeist/issues/7
+    let data = _load-bibliography(bib-str, ..args)
+    let key-order = bib-str.matches(regex("@\\w+\\{([^,\\s]+)")).map(m => m.captures.first())
+    for key in key-order {
+      ((key): data.at(key))
+    }
+  }

   // Load bibliography data
   let bib-data = load-bibliography(bib)
diff --git a/typst.toml b/typst.toml
index 8a78804..626d339 100644
--- a/typst.toml
+++ b/typst.toml
@@ -1,6 +1,6 @@
 [package]
 name = "citrus"
-version = "0.2.1"
+version = "0.2.199"
 entrypoint = "lib.typ"
 authors = ["lucifer1004"]
 license = "MIT"
',
        }
    ]
    | each {|pkg|
        print $'🟡 Setting up "@local/($pkg.name):($pkg.version)"…'

        if ($"target/typst-pkg/local/($pkg.name)/($pkg.version)" | path exists) {
            cd $"target/typst-pkg/local/($pkg.name)/($pkg.version)"
        } else {
            let _ = $"#import \"@preview/($pkg.name):($pkg.published_version)\"" | typst compile - - --format svg --package-cache-path 'target/typst-pkg/'
            mkdir $"target/typst-pkg/local/($pkg.name)"
            mv $"target/typst-pkg/preview/($pkg.name)/($pkg.published_version)" $"target/typst-pkg/local/($pkg.name)/($pkg.version)"
            cd $"target/typst-pkg/local/($pkg.name)/($pkg.version)"
            git init .
            git add --all
        }

        let patch = sanitize_patch $pkg.patch
        try {
            $patch | git apply
            print $"✅ Set up \"@local/($pkg.name):($pkg.version)\" successfully."
        } catch {
            print $"🙀 Failed to apply patch for \"@local/($pkg.name):($pkg.version)\". Please check manually."
        }
    }

    null
}
