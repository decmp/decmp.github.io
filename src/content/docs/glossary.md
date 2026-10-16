---
title: Glossary
description: Decomp words, in plain language.
---

- **Assembly (asm):** The human-readable form of machine code. A matching project starts with every function as assembly.
- **Category:** A named part of a project's code that progress is reported for separately, such as game code or the SDK.
- **Context file:** Your project's headers, preprocessed into one file, so a decompiler like m2c knows your types.
- **Equivalent:** Code that is believed to behave the same as the original but doesn't compile to the same bytes.
- **Fuzzy match:** How close not-yet-matching code is to the original, as a percentage.
- **Matching:** Source that compiles to exactly the original bytes.
- **Overlay:** Code loaded into memory only when needed, often into the same memory area as other overlays.
- **Scratch:** A single function shared on decomp.me so it can be matched in the browser.
- **Split:** Dividing a binary into units and sections so each part can be built separately.
- **Symbol:** A name attached to an address: a function, a global, a table.
- **Unit:** One object file, ideally the same as one of the original source files.

:::note[Help write this page]
The glossary is short on purpose for now. Missing a term? [Suggest it](https://github.com/decmp/decmp.github.io/issues/new?template=fix-something.yml)
or open a pull request that edits `src/content/docs/glossary.md`.
:::
