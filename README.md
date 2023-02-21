# git-bump

Git-bump assumes the current version of the Git-controlled project.

Git-bump is based on the Semantic Versioning 2.0.0.

See also https://semver.org/

## Installation

```bash
npm install -g @rinse/git-bump
```

## Get an assumption of the current version

Move the current directory to some Git-controlled project.

Then, type 'git bump' and you'll see an assumption of the current version.

```bash
$ git bump
1.0.0
```

It prints the exact version from Git tags, or a bumped version assumed by tags or commits.

## Reference of CLI options

Type `git-bump --help` to see help in the command line.

### Prerelease

Giving an identifier to the `--prerelease` option, Git-bump adds a prerelease version to an assumed version core.

```bash
$ git bump --prerelease beta
1.0.0-beta.0
```

Note that it does nothing when the exact version exists.

```bash
$ git describe --exact-match
1.0.0
$ git bump --prerelease beta
1.0.0
```

### Release

Giving the `--release` option, Git-bump always shows a release version.

You want to use this when the latest tag indicates a prerelease version.

```bash
$ git bump
1.0.0-beta.1
$ git bump --release
1.0.0
```

Unlike `--prerelease`, a release version is newly suggested even when HEAD is tagged with a prerelease version.

```bash
$ git describe --exact-match
1.0.0-beta.0
$ git bump --release
1.0.0
```

### Build

Giving the `--build` option, Git-bump adds a build metadata to an assumed version.

```bash
$ git bump --build
1.0.0+6717d5d
```

Note that it does nothing when the exact version exists.

```bash
$ git describe --exact-match
1.0.0
$ git bump --build
1.0.0
```

### Initial version

Giving a version to the `--initial-version` option, Git-bump prints the version when no previous version found.

```bash
$ git tag
$ git git-bump --initial-version 1.0.0
1.0.0
```

The default value is `0.1.0`.

```bash
$ git tag
$ git git-bump
0.1.0
```

### Include non-annotated tags

Giving the `--include-non-annotated` option,
Git-bump sees non-annotated tags as well, in search for the previous version.

```bash
$ git bump --include-non-annotated
1.0.0
```

## Prefixes on Commit message

Git-bump bumps a new version and prints it as a current version when new commits are stacked on the latest tag.

A version being increased is determined by prefixes of commit messages.

Each prefix is mapped to a scale of modification; principal prefixes are the following:

| Scale | Keywords                      |
|-------|-------------------------------|
| patch | fix, hotfix, refactor         |
| minor | resolve, close, feat, feature |
| major | fix!, refactor!, feat!        |

If the biggest scale of modification found in the new commits is -

- A major modification, Git-bump increases a major version.
- A minor modification, Git-bump increases a minor version.
- A patch modification, Git-bump increases a patch version.

> **Note**
> If the previous version is below 1.0.0, Git-bump increases a minor version
> even when major modifications are found.

<details>
<summary>The whole supported prefixes are the following:</summary>

| Keyword      | Scale |
|--------------|-------|
| fix          | patch |
| fix!         | major |
| fixes        | patch |
| fixes!       | major |
| fixed        | patch |
| fixed!       | major |
| fixing       | patch |
| fixing!      | major |
| resolve      | minor |
| resolve!     | major |
| resolves     | minor |
| resolves!    | major |
| resolved     | minor |
| resolved!    | major |
| resolving    | minor |
| resolving!   | major |
| close        | minor |
| close!       | major |
| closes       | minor |
| closes!      | major |
| closed       | minor |
| closed!      | major |
| closing      | minor |
| closing!     | major |
| hotfix       | patch |
| hotfix!      | major |
| feat         | minor |
| feat!        | major |
| feature      | minor |
| feature!     | major |
| refactor     | patch |
| refactor!    | major |
| refactors    | patch |
| refactors!   | major |
| refactored   | patch |
| refactored!  | major |
| refactoring  | patch |
| refactoring! | major |

</details>

Additionally, you can have preferred keywords on `$HOME/.git-bump.json`.
You can also override a predefined keywords above.

For instance, you want to use the 'bug' keyword for a patch modification, insteads of 'fix'.

```json
{
    "keywords": {
        "patch": [
            "bug"
        ],
        "minor": [
            "fix",
            "fixes",
            "fixed",
            "fixing"
        ],
        "major": [
            "major"
        ]
    }
}
```
