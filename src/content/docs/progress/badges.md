---
title: Badges
description: Show your progress in a README with a badge that updates itself.
sidebar:
  order: 3
---

Once a project uploads its reports, decmp.dev can draw a badge for it. The
[API builder](https://decmp.dev/api) on decmp.dev makes the URL for you and previews it.

## The two kinds of badge

- **An SVG badge** drawn by decmp.dev:

  ```md
  [![progress](https://api.decmp.dev/badge/OWNER/REPO.svg)](https://decmp.dev/OWNER/REPO)
  ```

- **A shields.io endpoint,** if you prefer shields.io's rendering:

  ```md
  ![progress](https://img.shields.io/endpoint?url=https%3A%2F%2Fapi.decmp.dev%2Fshield%2FOWNER%2FREPO.json)
  ```

Both take the same query parameters, such as `measure` (for example `matched_code_percent`, the default, or
`matched_functions_percent`), `version`, `category`, `label` and `color`. The SVG badge also takes `style` and
`labelColor`.

## What this page will cover

- Every measure and what it means.
- Badges per version and per category.
- Styles and colors.
- The JSON data files behind the project page, for your own charts.

:::note[Help write this page]
This page is a stub. If you know this topic, [propose a guide](https://github.com/decmp/decmp.github.io/issues/new?template=propose-a-guide.yml)
or open a pull request that edits `src/content/docs/progress/badges.md`. See
[how to contribute](https://github.com/decmp/decmp.github.io/blob/main/CONTRIBUTING.md).
:::
