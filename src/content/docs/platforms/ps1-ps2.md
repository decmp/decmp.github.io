---
title: PS1 and PS2
description: MIPS code on the first two PlayStations.
sidebar:
  order: 4
---

Both PlayStations use MIPS CPUs. PS1 games were mostly built with old GCC versions from the official SDK, and
matching their output usually needs [maspsx](https://github.com/mkst/maspsx), which rewrites GCC's assembly so that
GNU `as` produces the same object the SDK's own assembler did. PS2 games used several toolchains, so identifying the compiler comes first.

## What this page will cover

- PS1: the SDK's GCC versions, maspsx, and the official libraries left as assembly.
- PS1: overlays, and how projects load them at a fixed address.
- PS2: the Emotion Engine, its compilers, and what makes them harder to match.
- Splitting with [splat](https://github.com/ethteck/splat) and disassembling with
  [spimdisasm](https://github.com/Decompollaborate/spimdisasm).
- Several regions or versions from one source tree.

:::note[Help write this page]
This page is a stub. If you know this topic, [propose a guide](https://github.com/decmp/decmp.github.io/issues/new?template=propose-a-guide.yml)
or open a pull request that edits `src/content/docs/platforms/ps1-ps2.md`. See
[how to contribute](https://github.com/decmp/decmp.github.io/blob/main/CONTRIBUTING.md).
:::
