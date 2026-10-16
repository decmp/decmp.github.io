# Contributing

Thanks for helping. Corrections, new guides and translations are all welcome.

## Before you write

- **Check the issues.** Open one with the **Propose a guide** template before writing a whole page, or with
  **Fix something** for errors, broken links and typos.
- **Small fixes** can go straight to a pull request.

## Writing rules

- **Write original content.** Don't copy text from other guides, wikis or tool documentation, even with changes.
  Link to them instead.
- **Only state what you can back up.** Check tool behavior, flags and versions against the tool's own repository or
  your own runs. If you aren't sure of a fact, leave it out or say plainly that it's uncertain. Don't guess command
  flags.
- **Nothing illegal.** No ROMs, assets, leaked code or links to them.
- **Plain and direct.** Short sentences, second person ("you"), concrete examples. Explain jargon or link to the
  glossary.
- **Name the scope.** If advice only holds for one compiler or console, say which.

## Pages and translations

- English pages live in `src/content/docs/`, Spanish ones in `src/content/docs/es/`, with the same file names.
  Internal links in Spanish pages start with `/es/`.
- Slugs are English for every language.
- If you change an English page and can't update its translation, say so in the pull request so someone else can.
- Patch Notes (`src/content/docs/patch-notes/YYYY-Www.md`) are generated: change `scripts/patch-notes.mjs`, not the
  files.

## Code

- Code, comments and commit messages are in English.
- Run `pnpm build` before opening a pull request; it must pass.

## License

By contributing, you agree that your written content is licensed under CC BY-SA 4.0 and your code under MIT, as
described in the README.
