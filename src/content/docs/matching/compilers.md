---
title: Compilers
description: The compilers you meet in console decomps, and how to identify yours.
sidebar:
  order: 3
---

A matching decomp needs the original compiler, in the original version, with the original flags. Identifying them
is often the first real milestone of a project.

## What this page will cover

- **Identifying a compiler:** strings left in the binary, prologue and epilogue shapes, library versions, and
  comparing small functions against candidate compilers.
- **The main families:**
  - Metrowerks CodeWarrior (GameCube, Wii, DS and others);
  - SGI IDO (Nintendo 64);
  - GCC in many old versions (N64, PS1, PS2, GBA and more);
  - newer compilers on recent consoles.
- **Flags:** optimization levels, and flags that change code generation.
- **Running old compilers today:** wrappers such as [wibo](https://github.com/decompals/wibo), and rebuilt
  compilers.
- **Several compilers in one game:** libraries built with a different version from the game.

:::note[Help write this page]
This page is a stub. If you know this topic, [propose a guide](https://github.com/decmp/decmp.github.io/issues/new?template=propose-a-guide.yml)
or open a pull request that edits `src/content/docs/matching/compilers.md`. See
[how to contribute](https://github.com/decmp/decmp.github.io/blob/main/CONTRIBUTING.md).
:::
