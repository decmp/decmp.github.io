---
title: PS1 y PS2
description: Código MIPS en las dos primeras PlayStation.
sidebar:
  order: 4
---

Ambas PlayStation usan CPUs MIPS. Los juegos de PS1 se compilaron en su mayoría con versiones antiguas de GCC del SDK
oficial, y hacer match de su salida normalmente requiere [maspsx](https://github.com/mkst/maspsx), que reescribe el
ensamblador de GCC para que GNU `as` produzca el mismo objeto que generaba el ensamblador propio del SDK. Los juegos de
PS2 usaron varias toolchains, así que lo primero es identificar el compilador.

## Qué cubrirá esta página

- PS1: las versiones de GCC del SDK, maspsx y las bibliotecas oficiales que se dejan en ensamblador.
- PS1: overlays, y cómo los proyectos los cargan en una dirección fija.
- PS2: el Emotion Engine, sus compiladores y qué los hace más difíciles de hacer match.
- Dividir con [splat](https://github.com/ethteck/splat) y desensamblar con
  [spimdisasm](https://github.com/Decompollaborate/spimdisasm).
- Varias regiones o versiones a partir de un mismo árbol de código fuente.

:::note[Ayuda a escribir esta página]
Esta página es un borrador. Si conoces el tema, [propón una guía](https://github.com/decmp/decmp.github.io/issues/new?template=propose-a-guide.yml)
o abre un pull request que edite `src/content/docs/platforms/ps1-ps2.md`. Consulta
[cómo contribuir](https://github.com/decmp/decmp.github.io/blob/main/CONTRIBUTING.md).
:::
