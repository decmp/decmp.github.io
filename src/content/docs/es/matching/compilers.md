---
title: Compiladores
description: Los compiladores que encontrarás en los decomps de consolas, y cómo identificar el tuyo.
sidebar:
  order: 3
---

Un decomp matching necesita el compilador original, en la versión original, con los flags originales. Identificarlos
suele ser el primer hito real de un proyecto.

## Qué cubrirá esta página

- **Cómo identificar un compilador:** strings que quedaron en el binario, la forma de los prólogos y epílogos,
  versiones de bibliotecas, y comparar funciones pequeñas con compiladores candidatos.
- **Las familias principales:**
  - Metrowerks CodeWarrior (GameCube, Wii, DS y otras);
  - SGI IDO (Nintendo 64);
  - GCC en muchas versiones antiguas (N64, PS1, PS2, GBA y más);
  - compiladores más nuevos en consolas recientes.
- **Flags:** niveles de optimización, y flags que cambian la generación de código.
- **Cómo ejecutar compiladores antiguos hoy:** wrappers como [wibo](https://github.com/decompals/wibo), y
  compiladores reconstruidos.
- **Varios compiladores en un mismo juego:** bibliotecas compiladas con una versión distinta a la del juego.

:::note[Ayuda a escribir esta página]
Esta página es un borrador. Si conoces el tema, [propón una guía](https://github.com/decmp/decmp.github.io/issues/new?template=propose-a-guide.yml)
o abre un pull request que edite `src/content/docs/matching/compilers.md`. Consulta
[cómo contribuir](https://github.com/decmp/decmp.github.io/blob/main/CONTRIBUTING.md).
:::
