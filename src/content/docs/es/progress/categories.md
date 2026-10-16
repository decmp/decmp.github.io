---
title: Categorías
description: Divide tu progreso en código del juego, bibliotecas o cualquier agrupación que quieras.
sidebar:
  order: 2
---

Un solo porcentaje oculta mucho. Las categorías permiten que un proyecto reporte partes del código por separado, como
el código del juego aparte del SDK, o una cifra por overlay. decmp.dev las toma de tu reporte de objdiff.

## Cómo las usa decmp.dev

- Las categorías vienen de `categories` en tu reporte de objdiff; decmp.dev guarda la lista de cada reporte.
- Los ids pueden anidarse: `game.battle` o `game/battle` aparece bajo `game`.
- Un proyecto puede elegir una **categoría por defecto** en su configuración en decmp.dev. Los badges la usan a menos
  que pidas otra; la página del proyecto y los archivos de datos siempre pueden mostrar todo el código con
  `category=all`.

## Qué cubrirá esta página

- Cómo declarar categorías en tu build. Por ejemplo, dtk-template las define con `config.progress_categories` en
  `configure.py`, con `game` y `sdk` por defecto.
- Cómo elegir categorías que digan algo: juego frente a bibliotecas, por módulo, por overlay.
- Cómo elegir una categoría por defecto, y cuándo dejarla como todo el código.

:::note[Ayuda a escribir esta página]
Esta página es un borrador. Si conoces el tema, [propón una guía](https://github.com/decmp/decmp.github.io/issues/new?template=propose-a-guide.yml)
o abre un pull request que edite `src/content/docs/progress/categories.md`. Consulta
[cómo contribuir](https://github.com/decmp/decmp.github.io/blob/main/CONTRIBUTING.md).
:::
