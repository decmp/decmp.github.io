---
title: GBA y DS
description: Código ARM y Thumb en Game Boy Advance y Nintendo DS.
sidebar:
  order: 3
---

Ambas consolas ejecutan código ARM, a menudo mezclado con el conjunto de instrucciones compacto Thumb. Los juegos de
GBA se compilaban comúnmente con agbcc, un compilador basado en GCC; los de DS, con Metrowerks CodeWarrior para ARM.

## Qué cubrirá esta página

- ARM y Thumb, y cómo saber cuál usa una función.
- GBA: agbcc y las estructuras de proyecto de la comunidad.
- DS: versiones de CodeWarrior para ARM, overlays y la división ARM7/ARM9.
- Herramientas de DS como [ds-decomp](https://github.com/AetiasHax/ds-decomp) (`dsd`), un toolkit para extraer,
  deslinkear y reconstruir una ROM de DS.
- Cómo mantener el código del SDK y del runtime fuera de tu cifra de progreso.

:::note[Ayuda a escribir esta página]
Esta página es un borrador. Si conoces el tema, [propón una guía](https://github.com/decmp/decmp.github.io/issues/new?template=propose-a-guide.yml)
o abre un pull request que edite `src/content/docs/platforms/gba-nds.md`. Consulta
[cómo contribuir](https://github.com/decmp/decmp.github.io/blob/main/CONTRIBUTING.md).
:::
