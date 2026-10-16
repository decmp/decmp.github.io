---
title: GBA and DS
description: ARM and Thumb code on Game Boy Advance and Nintendo DS.
sidebar:
  order: 3
---

Both consoles run ARM code, often mixed with the compact Thumb instruction set. GBA games are commonly built with
agbcc, a GCC-based compiler; DS games with Metrowerks CodeWarrior for ARM.

## What this page will cover

- ARM and Thumb, and how to tell which one a function uses.
- GBA: agbcc and the community's project layouts.
- DS: CodeWarrior for ARM versions, overlays, and the ARM7/ARM9 split.
- DS tooling such as [ds-decomp](https://github.com/AetiasHax/ds-decomp) (`dsd`), a toolkit to extract, delink and
  rebuild a DS ROM.
- Keeping SDK and runtime code out of your progress figure.

:::note[Help write this page]
This page is a stub. If you know this topic, [propose a guide](https://github.com/decmp/decmp.github.io/issues/new?template=propose-a-guide.yml)
or open a pull request that edits `src/content/docs/platforms/gba-nds.md`. See
[how to contribute](https://github.com/decmp/decmp.github.io/blob/main/CONTRIBUTING.md).
:::
