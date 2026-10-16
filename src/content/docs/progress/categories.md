---
title: Categories
description: Split your progress into game code, libraries, or any grouping you like.
sidebar:
  order: 2
---

A single percentage hides a lot. Categories let a project report parts of the code separately, such as game code
apart from the SDK, or one figure per overlay. decmp.dev takes them from your objdiff report.

## How decmp.dev uses them

- Categories come from the `categories` in your objdiff report; decmp.dev stores each report's list.
- Ids can nest: `game.battle` or `game/battle` shows under `game`.
- A project can choose a **default category** in its settings on decmp.dev. Badges use it unless you ask for
  another one; the project page and data files can always show all code with `category=all`.

## What this page will cover

- Declaring categories in your build. For example, dtk-template sets them with `config.progress_categories` in
  `configure.py`, with `game` and `sdk` by default.
- Choosing categories that say something: game versus libraries, per module, per overlay.
- Picking a default category, and when to leave it as all code.

:::note[Help write this page]
This page is a stub. If you know this topic, [propose a guide](https://github.com/decmp/decmp.github.io/issues/new?template=propose-a-guide.yml)
or open a pull request that edits `src/content/docs/progress/categories.md`. See
[how to contribute](https://github.com/decmp/decmp.github.io/blob/main/CONTRIBUTING.md).
:::
