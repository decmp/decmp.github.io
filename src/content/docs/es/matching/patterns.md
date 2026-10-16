---
title: Patrones comunes
description: Formas de escribir el código fuente que corrigen tipos concretos de diff.
sidebar:
  order: 2
---

Con el tiempo empiezas a reconocer los diffs: "eso es una carga con signo donde yo escribí sin signo", "ese salto
significa que el bucle se escribió al revés". Esta página reunirá esos patrones, agrupados según cómo se ve el diff,
con pequeños ejemplos de antes y después.

## Qué cubrirá esta página

- **Tipos:** signo, anchos, punteros frente a arrays, copias de structs.
- **Flujo de control:** bucles, returns tempranos, `switch` y tablas de saltos, condiciones con efectos secundarios.
- **Expresiones:** orden de evaluación, temporales, casts, plegado de constantes.
- **Asignación de registros:** qué suele mover los registros, y qué no.
- **Datos:** `static` frente a global, ubicación de `const`, agrupación de strings, alineación.
- **Por compilador:** formas que solo importan para una familia de compiladores. Consulta
  [Compiladores](/es/matching/compilers/).

Cada patrón indicará con qué compiladores se verificó.

:::note[Ayuda a escribir esta página]
Esta página es un borrador. Si conoces el tema, [propón una guía](https://github.com/decmp/decmp.github.io/issues/new?template=propose-a-guide.yml)
o abre un pull request que edite `src/content/docs/matching/patterns.md`. Consulta
[cómo contribuir](https://github.com/decmp/decmp.github.io/blob/main/CONTRIBUTING.md).
:::
