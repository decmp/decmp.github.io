# decmp Learn

**From first function to 100%.** The companion site of [decmp.dev](https://decmp.dev), served at
<https://learn.decmp.dev>.

It has two parts:

- **Guides** to starting and progressing in a matching decompilation: what a decomp is, per-console paths, the
  matching workflow, and how to connect a project to decmp.dev.
- **Patch Notes**, an automatic weekly digest of progress on decmp.dev, with an RSS feed.

The site is built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build), in English and
Spanish, with search by Pagefind.

## Run it locally

You need Node 24 and pnpm.

```sh
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # static site in dist/, with the search index
pnpm preview    # serve dist/
```

## Contribute a guide

Many pages are stubs with an outline and a "Help write this page" note. To write one:

1. Open an issue with the **Propose a guide** template, so nobody else writes the same page.
2. Edit the page under `src/content/docs/` (English) and, if you can, its translation under
   `src/content/docs/es/`. A page without a translation shows the English text with a notice.
3. Run `pnpm build` and open a pull request.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the writing rules. To add a language, add it to `locales` in
`astro.config.mjs`, add `src/content/i18n/<lang>.json`, and translate pages under `src/content/docs/<lang>/`.

## Patch Notes

`scripts/patch-notes.mjs` writes one issue per ISO week to `src/content/docs/patch-notes/YYYY-Www.md`:

- It reads `/data/index.json` from the decmp.dev API, then the history of every project that reported since the day
  before the week began, one request at a time.
- Sections: High Scores, Stage Cleared, New Challengers, Checkpoints, Combo Meter and By platform.
- Re-running it for the same week overwrites the same file. If any request fails, it exits with an error and writes
  nothing.

```sh
pnpm patch-notes                          # the last completed ISO week
pnpm patch-notes --week 2026-W41          # a given week
pnpm patch-notes --api http://localhost:8787
```

`DECMP_API` and `PATCH_NOTES_WEEK` set the same options from the environment, and `DECMP_SITE` changes the base of
project links. The index is cached in `.cache/` for six hours; `--no-cache` skips the cache.

The `Patch Notes` workflow runs it every Monday at 06:00 UTC (or by hand, with an optional week) and commits the
issue if it changed. The `Deploy` workflow builds the site and publishes it to GitHub Pages on every push to `main`
and after each Patch Notes run.

## Licenses

- Guides and other written content (`src/content/`): [CC BY-SA 4.0](LICENSE-CONTENT).
- Code: [MIT](LICENSE).
