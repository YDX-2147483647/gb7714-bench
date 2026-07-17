def sanitize-patch [patch: string]: nothing -> string {
    (
        $patch
        | str trim
        | str replace --all "\r\n" "\n"
        # The space will fix patch corruption errors
        | str replace --all "\n\n" "\n \n"
    ) + "\n"
}

# Set up a package from a git repository.
def setup-from-git [pkg: record]: nothing -> nothing {
    print $'🟡 Setting up "@local/($pkg.name):($pkg.version)"…'
    mkdir $"target/typst-pkg/local/($pkg.name)/"
    cd $"target/typst-pkg/local/($pkg.name)/"

    if ('store/' | path exists) {
        cd store/
        try {
            git switch --detach $pkg.src.rev
        } catch {
            git fetch origin
            git switch --detach $pkg.src.rev
        }
    } else {
        git -c advice.detachedHead=false clone $pkg.src.git store/ --revision $pkg.src.rev --depth 1 --filter blob:none
        cd store/
    }

    rm --force $"../($pkg.version)"
    ln --symbolic ($pkg.src.dir? | default '' | path expand) $"../($pkg.version)"

    # The space will fix patch corruption errors
    let patch = sanitize-patch $pkg.patch
    try {
        $patch | git apply
        print $"✅ Set up \"@local/($pkg.name):($pkg.version)\" successfully."
    } catch {
        print $"🙀 Failed to apply patch for \"@local/($pkg.name):($pkg.version)\". Please check manually."
    }
}

# Set up a package from the typst universe.
def setup-from-universe [pkg: record]: nothing -> nothing {
    print $'🟡 Setting up "@local/($pkg.name):($pkg.version)"…'

    if ($"target/typst-pkg/local/($pkg.name)/($pkg.version)" | path exists) {
        cd $"target/typst-pkg/local/($pkg.name)/($pkg.version)"
    } else {
        let _ = $"#import \"@preview/($pkg.name):($pkg.src.version)\"" | typst compile - - --format svg --package-cache-path 'target/typst-pkg/'
        mkdir $"target/typst-pkg/local/($pkg.name)"
        mv $"target/typst-pkg/preview/($pkg.name)/($pkg.src.version)" $"target/typst-pkg/local/($pkg.name)/($pkg.version)"
        cd $"target/typst-pkg/local/($pkg.name)/($pkg.version)"
        git init .
        git add --all
    }

    let patch = sanitize-patch $pkg.patch
    try {
        $patch | git apply
        print $"✅ Set up \"@local/($pkg.name):($pkg.version)\" successfully."
    } catch {
        print $"🙀 Failed to apply patch for \"@local/($pkg.name):($pkg.version)\". Please check manually."
    }
}

# Setup typst local packages used by processors in target/typst-pkg/.
def main []: nothing -> nothing {
    cd ($env.CURRENT_FILE | path dirname | path dirname)

    for $pkg in (open scripts/typst-local-pkg.toml | get pkg) {
        if 'git' in $pkg.src {
            setup-from-git $pkg
        } else {
            setup-from-universe $pkg
        }
    }
}
