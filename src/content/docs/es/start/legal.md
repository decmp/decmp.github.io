---
title: Mantente dentro de la ley
description: Qué puede contener un repositorio de decomp, y qué nunca debe estar en él.
sidebar:
  order: 2
---

Un decomp matching contiene código fuente que la gente escribió estudiando un juego. El juego en sí nunca debe formar
parte del repositorio. Los proyectos que respetan esta línea son los que perduran.

Esto no es asesoría legal. Las leyes varían entre países; ante la duda, consulta a alguien calificado.

## La versión corta

- **Ningún archivo del juego en el repositorio.** Ni ROMs, ni imágenes de disco, ni ejecutables, ni archivos
  extraídos. Cada colaborador aporta su propia copia, y `.gitignore` la mantiene fuera de los commits.
- **Ningún asset.** Texturas, modelos, música, volcados de texto y videos quedan fuera, incluso "solo unos pocos para
  probar".
- **Ningún código filtrado o propietario.** No copies al proyecto nada de código filtrado ni de SDKs, y no te bases en
  documentación que no tienes derecho a usar.
- **Los secretos de CI se mantienen privados.** Si tu CI necesita el juego, guárdalo en un lugar privado (un
  repositorio privado, una imagen de contenedor privada, un secreto cifrado), nunca en un artifact o log público.

## Qué cubrirá esta página

- Por qué se necesita el binario original para compilar, y cómo los proyectos lo mantienen fuera de git.
- Assets: extraerlos durante la build en lugar de hacer commit de ellos.
- Headers y bibliotecas del SDK: qué suelen hacer los proyectos.
- Filtraciones y trabajo clean-room: por qué los proyectos rechazan material filtrado.
- Licencias para tu propio código.

:::note[Ayuda a escribir esta página]
Esta página es un borrador. Si conoces el tema, [propón una guía](https://github.com/decmp/decmp.github.io/issues/new?template=propose-a-guide.yml)
o abre un pull request que edite `src/content/docs/start/legal.md`. Consulta
[cómo contribuir](https://github.com/decmp/decmp.github.io/blob/main/CONTRIBUTING.md).
:::
