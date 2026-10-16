---
title: Common patterns
description: Source shapes that fix specific kinds of diff.
sidebar:
  order: 2
---

After a while you start recognizing diffs: "that's a signed load where I wrote unsigned", "that branch means the loop
was written the other way round". This page will collect those patterns, grouped by what the diff looks like, with
small before-and-after examples.

## What this page will cover

- **Types:** signedness, widths, pointers versus arrays, struct copies.
- **Control flow:** loops, early returns, `switch` and jump tables, conditions with side effects.
- **Expressions:** evaluation order, temporaries, casts, constant folding.
- **Register allocation:** what tends to move registers, and what doesn't.
- **Data:** `static` versus global, `const` placement, string pooling, alignment.
- **Per compiler:** shapes that only matter for one compiler family. See [Compilers](/matching/compilers/).

Each pattern will say which compilers it was verified with.

:::note[Help write this page]
This page is a stub. If you know this topic, [propose a guide](https://github.com/decmp/decmp.github.io/issues/new?template=propose-a-guide.yml)
or open a pull request that edits `src/content/docs/matching/patterns.md`. See
[how to contribute](https://github.com/decmp/decmp.github.io/blob/main/CONTRIBUTING.md).
:::
