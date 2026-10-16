---
title: Stay legal
description: What a decomp repository may contain, and what must never go in it.
sidebar:
  order: 2
---

A matching decomp contains source code that people wrote by studying a game. The game itself must never be part of
the repository. Projects that respect this line are the ones that last.

This is not legal advice. Laws differ between countries; when in doubt, ask someone qualified.

## The short version

- **No game files in the repository.** No ROMs, disc images, executables, or extracted files. Each contributor
  provides their own copy, and `.gitignore` keeps it out of commits.
- **No assets.** Textures, models, music, text dumps and videos stay out, even "just a few for testing".
- **No leaked or proprietary code.** Don't copy from leaked source or SDKs into the project, and don't build on
  documentation you have no right to use.
- **CI secrets stay private.** If your CI needs the game, keep it in a private place (a private repository, a
  private container image, an encrypted secret), never in a public artifact or log.

## What this page will cover

- Why the original binary is needed to build, and how projects keep it out of git.
- Assets: extracting them at build time instead of committing them.
- SDK headers and libraries: what projects usually do.
- Leaks and clean-room work: why projects refuse leaked material.
- Licenses for your own code.

:::note[Help write this page]
This page is a stub. If you know this topic, [propose a guide](https://github.com/decmp/decmp.github.io/issues/new?template=propose-a-guide.yml)
or open a pull request that edits `src/content/docs/start/legal.md`. See
[how to contribute](https://github.com/decmp/decmp.github.io/blob/main/CONTRIBUTING.md).
:::
