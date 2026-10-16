---
title: Glosario
description: Las palabras del decomp, en lenguaje sencillo.
---

- **Archivo de contexto:** Los headers de tu proyecto, preprocesados en un solo archivo, para que un decompilador como m2c conozca tus tipos.
- **Categoría:** Una parte con nombre del código de un proyecto cuyo progreso se reporta por separado, como el código del juego o el SDK.
- **Ensamblador (asm):** La forma legible por humanos del código máquina. Un proyecto matching empieza con todas sus funciones en ensamblador.
- **Equivalente:** Código que se cree que se comporta igual que el original pero que no compila a los mismos bytes.
- **Fuzzy match:** Qué tan cerca está del original el código que todavía no hace match, como porcentaje.
- **Matching:** Código fuente que compila exactamente a los bytes originales.
- **Overlay:** Código que se carga en memoria solo cuando se necesita, a menudo en la misma zona de memoria que otros overlays.
- **Scratch:** Una sola función compartida en decomp.me para poder hacerle match en el navegador.
- **Símbolo:** Un nombre asociado a una dirección: una función, una global, una tabla.
- **Split:** Dividir un binario en units y secciones para que cada parte pueda compilarse por separado.
- **Unidad (unit):** Un archivo objeto, idealmente equivalente a uno de los archivos fuente originales.

:::note[Ayuda a escribir esta página]
El glosario es corto a propósito por ahora. ¿Falta algún término? [Sugiérelo](https://github.com/decmp/decmp.github.io/issues/new?template=fix-something.yml)
o abre un pull request que edite `src/content/docs/glossary.md`.
:::
