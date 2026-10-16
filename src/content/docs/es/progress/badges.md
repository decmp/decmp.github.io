---
title: Badges
description: Muestra tu progreso en un README con un badge que se actualiza solo.
sidebar:
  order: 3
---

Una vez que un proyecto sube sus reportes, decmp.dev puede dibujarle un badge. El
[constructor de la API](https://decmp.dev/api) de decmp.dev arma la URL por ti y te muestra una vista previa.

## Los dos tipos de badge

- **Un badge SVG** dibujado por decmp.dev:

  ```md
  [![progress](https://api.decmp.dev/badge/OWNER/REPO.svg)](https://decmp.dev/OWNER/REPO)
  ```

- **Un endpoint de shields.io,** si prefieres cómo los dibuja shields.io:

  ```md
  ![progress](https://img.shields.io/endpoint?url=https%3A%2F%2Fapi.decmp.dev%2Fshield%2FOWNER%2FREPO.json)
  ```

Ambos aceptan los mismos parámetros de consulta, como `measure` (por ejemplo `matched_code_percent`, el valor por
defecto, o `matched_functions_percent`), `version`, `category`, `label` y `color`. El badge SVG también acepta
`style` y `labelColor`.

## Qué cubrirá esta página

- Cada medida y qué significa.
- Badges por versión y por categoría.
- Estilos y colores.
- Los archivos de datos JSON detrás de la página del proyecto, para tus propias gráficas.

:::note[Ayuda a escribir esta página]
Esta página es un borrador. Si conoces el tema, [propón una guía](https://github.com/decmp/decmp.github.io/issues/new?template=propose-a-guide.yml)
o abre un pull request que edite `src/content/docs/progress/badges.md`. Consulta
[cómo contribuir](https://github.com/decmp/decmp.github.io/blob/main/CONTRIBUTING.md).
:::
