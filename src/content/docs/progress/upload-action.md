---
title: Upload your progress
description: Connect a project to decmp.dev with one GitHub Actions step, no secrets, and get pull request comments for free.
sidebar:
  order: 1
---

decmp.dev builds a project page, a history chart and badges from the progress report your build already makes. You
connect a project by adding one step to its GitHub Actions workflow. There is nothing to register and no secret to
store: **the first upload creates the project.**

## What you need

- **A public GitHub repository** whose CI builds the project.
- **An objdiff progress report.** That's the JSON file written by `objdiff-cli report generate`. Projects built
  from [dtk-template](/platforms/gamecube-wii/) already produce one at `build/GAMEID/report.json`; elsewhere, add a
  step that runs objdiff over your units.
- **A version id** for the build you measure, such as a game ID (`GZ2E01`) or a serial (`SLUS_014.36`). A project
  with several versions uploads one report per version.

## How it authenticates

The step asks GitHub for an **OIDC token** for the running job (audience `https://decmp.dev`) and sends it with the
report. decmp.dev checks the token's signature and reads which repository the run belongs to, so a workflow can only
upload progress for its own repository. That's why the job needs `id-token: write` and why there is no API key.

## Add the step

Create `.github/workflows/progress.yml`, or add the step to the workflow that already builds your project:

```yaml
name: progress
on:
  push:
    branches: [main]
  pull_request:          # comments how each pull request changes progress

jobs:
  report:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write        # lets decmp.dev verify this run belongs to your repo
      pull-requests: write   # lets it comment on pull requests
    steps:
      - uses: actions/checkout@v5

      # ...build your project and run objdiff here, e.g.
      # objdiff-cli report generate -o build/GZ2E01/report.json

      - uses: decmp/upload-action@v1
        with:
          report: build/GZ2E01/report.json
          version: GZ2E01
          name: "The Legend of Zelda: Twilight Princess"  # first upload only
          platform: gc                                   # first upload only
          banner: assets/banner.webp                     # optional, 1024x256
```

Push it. When the run finishes, the log prints your project's address, which is always
`https://decmp.dev/{owner}/{repo}`.

### Which pushes upload

Every run that isn't a pull request uploads its report. Choose what that means with the workflow's `on:` block: the
example above uploads from pushes to `main` only, which is what you want. Neither the action nor decmp.dev filters
by branch, so if you also trigger the workflow from other branches, those reports count too.

### Several versions

Run the build as a matrix and upload once per version, each with its own `report` and `version`. Set
`default-version` to choose which one the project page opens on; otherwise it's the first version uploaded.

## Inputs

| Input | Default | What it does |
|---|---|---|
| `report` | | Path to the objdiff JSON report. Required, except on `workflow_run`. |
| `version` | | The game version this report measures. Required, except on `workflow_run`. |
| `name` | the repository name | Game title shown on decmp.dev. Needed on the first upload, or to rename. |
| `short-name` | | A shorter title, used by badges. |
| `platform` | | Console id (see below). |
| `default-version` | the first version uploaded | Version the project page opens on. |
| `banner` | | Header image in the repository: `.webp`, `.png`, `.jpg` or `.avif`, up to 1 MB. 1024×256 looks best. |
| `github-token` | `${{ github.token }}` | Token used to comment on pull requests. |
| `fail-on-regression` | `false` | On a pull request, fail the step when matched code, data, functions or complete units go down. |
| `comments` | `decmp-comment` | On `workflow_run`, the folder holding comment files uploaded by forks' runs. |
| `api-url` | `https://api.decmp.dev` | The API to upload to. |

Later uploads can change `name`, `short-name`, `platform` and `default-version`; leave them out once they're right.

The action has two outputs: `comment-file`, the comparison to upload when a pull request comes from a fork, and
`regressed`, which is `'true'` when a pull request loses progress.

### Platform ids

| id | Console | id | Console |
|---|---|---|---|
| `gbc` | Game Boy Color | `nds` | Nintendo DS |
| `n64` | Nintendo 64 | `psp` | PlayStation Portable |
| `ps` | PlayStation | `xbox360` | Xbox 360 |
| `gba` | Game Boy Advance | `wii` | Wii |
| `gc` | GameCube | `3ds` | Nintendo 3DS |
| `ps2` | PlayStation 2 | `switch` | Nintendo Switch |
| `xbox` | Xbox | `win32` | Windows |

## Pull request comments

Pull requests upload nothing. Instead, the action compares the pull request's report with its base commit's (or
with the latest report, if the base wasn't measured) and keeps one comment per version up to date: a before, after
and difference table, the categories that changed, and the functions that became matched or regressed. The same
table goes to the job summary.

Add `fail-on-regression: true` if you want a pull request that loses progress to fail its check.

### Pull requests from forks

A fork's pull request runs with a read-only token, so it can't comment. The fix takes two pieces. First, give the
step an `id` and upload its comparison as an artifact:

```yaml
      - uses: decmp/upload-action@v1
        id: decmp
        with:
          report: build/GZ2E01/report.json
          version: GZ2E01

      - if: ${{ !cancelled() && github.event.pull_request.head.repo.fork }}
        uses: actions/upload-artifact@v4
        with:
          name: decmp-comment-GZ2E01   # one name per version
          path: ${{ steps.decmp.outputs.comment-file }}
```

Then add a second workflow, `.github/workflows/progress-comment.yml`, that runs after the first one with your
repository's permissions and posts the comment:

```yaml
name: progress comment
on:
  workflow_run:
    workflows: [progress]
    types: [completed]

jobs:
  comment:
    if: github.event.workflow_run.event == 'pull_request'
    runs-on: ubuntu-latest
    permissions:
      actions: read          # to download the run's artifacts
      pull-requests: write
    steps:
      - uses: actions/download-artifact@v4
        with:
          pattern: decmp-comment-*
          merge-multiple: true
          path: decmp-comment
          run-id: ${{ github.event.workflow_run.id }}
          github-token: ${{ github.token }}

      - uses: decmp/upload-action@v1   # posts what it finds in decmp-comment/
```

The posting run only reads figures from those files and renders the comment itself.

## Without the action: the script

The same code is served as a single script from the API, for CI setups that can't use third-party actions or that
prefer to pin a hash. Releases never change once published, and
[`/action/manifest.json`](https://api.decmp.dev/action/manifest.json) lists every version with its SHA-256. Version
1.1.0 is the first that runs as a script.

```yaml
      - name: Upload to decmp.dev
        run: |
          curl -fsSL https://api.decmp.dev/action/v1.1.0.mjs -o decmp.mjs
          echo "10fb0039a067b4ffe67510959356a691efa6efbb0aae16450c04f8c64da0a5f8  decmp.mjs" | sha256sum -c
          node decmp.mjs
        env:
          DECMP_REPORT: build/GZ2E01/report.json
          DECMP_VERSION: GZ2E01
          DECMP_NAME: "The Legend of Zelda: Twilight Princess"  # first upload only
          DECMP_PLATFORM: gc                                   # first upload only
          DECMP_BANNER: assets/banner.webp                     # optional, 1024x256
          GITHUB_TOKEN: ${{ github.token }}                    # comments on pull requests
```

- Every input becomes a `DECMP_` variable in upper case, with hyphens as underscores: `short-name` is
  `DECMP_SHORT_NAME`. Defaults are the same, and `github-token` falls back to `GITHUB_TOKEN`.
- The job needs the same permissions as with the action.
- Give the step an `id` and it has the same outputs.
- GitHub's hosted runners already have Node. On a self-hosted runner, install Node 24.
- `/action/v1.mjs` always serves the latest 1.x release. It's handy for trying things out; in CI, pin a version and
  its hash as above.

## After the first upload

- Your page is at `https://decmp.dev/{owner}/{repo}`. Sign in on decmp.dev with GitHub to manage it; that needs
  push, maintain or admin access to the repository.
- Split your progress into [categories](/progress/categories/), such as game code and libraries, in your objdiff
  configuration.
- Add a [badge](/progress/badges/) to your README.
- Your project shows up in the weekly [Patch Notes](/patch-notes/) when it moves.

## Troubleshooting

- **`no OIDC token available`:** the job is missing `permissions: id-token: write`. Add it to the job or the
  workflow.
- **Nothing uploads from pull requests:** that's by design. Pull requests only compare and comment; uploads come
  from the other events your workflow runs on, such as pushes to `main`.
- **The pull request comment never appears:** the job needs `pull-requests: write`. For pull requests from forks,
  set up the [two-workflow version](#pull-requests-from-forks).
