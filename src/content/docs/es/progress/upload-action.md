---
title: Sube tu progreso
description: Conecta un proyecto a decmp.dev con un solo paso de GitHub Actions, sin secretos, y obtén comentarios en tus pull requests sin costo.
sidebar:
  order: 1
---

decmp.dev construye una página de proyecto, una gráfica de historial y badges a partir del reporte de progreso que tu
build ya genera. Conectas un proyecto agregando un paso a su workflow de GitHub Actions. No hay nada que registrar ni
ningún secreto que guardar: **la primera subida crea el proyecto.**

## Qué necesitas

- **Un repositorio público de GitHub** cuyo CI compile el proyecto.
- **Un reporte de progreso de objdiff.** Es el archivo JSON que escribe `objdiff-cli report generate`. Los proyectos
  basados en [dtk-template](/es/platforms/gamecube-wii/) ya generan uno en `build/GAMEID/report.json`; en otros casos,
  agrega un paso que ejecute objdiff sobre tus units.
- **Un id de versión** para la build que mides, como un ID de juego (`GZ2E01`) o un serial (`SLUS_014.36`). Un
  proyecto con varias versiones sube un reporte por versión.

## Cómo se autentica

El paso le pide a GitHub un **token OIDC** para el job en ejecución (audience `https://decmp.dev`) y lo envía junto
con el reporte. decmp.dev verifica la firma del token y lee a qué repositorio pertenece la ejecución, así que un
workflow solo puede subir progreso de su propio repositorio. Por eso el job necesita `id-token: write` y por eso no
hay API key.

## Agrega el paso

Crea `.github/workflows/progress.yml`, o agrega el paso al workflow que ya compila tu proyecto:

```yaml
name: progress
on:
  push:
    branches: [main]
  pull_request:          # comments how each pull request changes progress

jobs:
  report:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write        # lets decmp.dev verify this run belongs to your repo
      pull-requests: write   # lets it comment on pull requests
    steps:
      - uses: actions/checkout@v5

      # ...build your project and run objdiff here, e.g.
      # objdiff-cli report generate -o build/GZ2E01/report.json

      - uses: decmp/upload-action@v1
        with:
          report: build/GZ2E01/report.json
          version: GZ2E01
          name: "The Legend of Zelda: Twilight Princess"  # first upload only
          platform: gc                                   # first upload only
          banner: assets/banner.webp                     # optional, 1024x256
```

Haz push. Cuando termine la ejecución, el log imprime la dirección de tu proyecto, que siempre es
`https://decmp.dev/{owner}/{repo}`.

### Qué pushes suben

Toda ejecución que no sea de un pull request sube su reporte. Decide qué significa eso con el bloque `on:` del
workflow: el ejemplo de arriba sube solo desde pushes a `main`, que es lo que quieres. Ni la action ni decmp.dev
filtran por rama, así que si también disparas el workflow desde otras ramas, esos reportes también cuentan.

### Varias versiones

Ejecuta la build como una matriz y sube una vez por versión, cada una con su propio `report` y `version`. Define
`default-version` para elegir en cuál se abre la página del proyecto; si no, es la primera versión que se subió.

## Inputs

| Input | Por defecto | Qué hace |
|---|---|---|
| `report` | | Ruta al reporte JSON de objdiff. Obligatorio, salvo en `workflow_run`. |
| `version` | | La versión del juego que mide este reporte. Obligatorio, salvo en `workflow_run`. |
| `name` | el nombre del repositorio | Título del juego que se muestra en decmp.dev. Necesario en la primera subida, o para renombrar. |
| `short-name` | | Un título más corto, usado por los badges. |
| `platform` | | Id de la consola (ver abajo). |
| `default-version` | la primera versión subida | Versión en la que se abre la página del proyecto. |
| `banner` | | Imagen de cabecera en el repositorio: `.webp`, `.png`, `.jpg` o `.avif`, de hasta 1 MB. 1024×256 se ve mejor. |
| `github-token` | `${{ github.token }}` | Token usado para comentar en pull requests. |
| `fail-on-regression` | `false` | En un pull request, hace fallar el paso cuando bajan el código, los datos, las funciones o las units completas con match. |
| `comments` | `decmp-comment` | En `workflow_run`, la carpeta con los archivos de comentario subidos por las ejecuciones de forks. |
| `api-url` | `https://api.decmp.dev` | La API a la que se sube. |

Las subidas posteriores pueden cambiar `name`, `short-name`, `platform` y `default-version`; omítelos cuando ya estén
bien.

La action tiene dos outputs: `comment-file`, la comparación que hay que subir cuando un pull request viene de un fork,
y `regressed`, que es `'true'` cuando un pull request pierde progreso.

### Ids de plataforma

| id | Consola | id | Consola |
|---|---|---|---|
| `gbc` | Game Boy Color | `nds` | Nintendo DS |
| `n64` | Nintendo 64 | `psp` | PlayStation Portable |
| `ps` | PlayStation | `xbox360` | Xbox 360 |
| `gba` | Game Boy Advance | `wii` | Wii |
| `gc` | GameCube | `3ds` | Nintendo 3DS |
| `ps2` | PlayStation 2 | `switch` | Nintendo Switch |
| `xbox` | Xbox | `win32` | Windows |

## Comentarios en pull requests

Los pull requests no suben nada. En su lugar, la action compara el reporte del pull request con el de su commit base
(o con el último reporte, si el base no se midió) y mantiene actualizado un comentario por versión: una tabla de
antes, después y diferencia, las categorías que cambiaron y las funciones que pasaron a hacer match o que retrocedieron.
La misma tabla va al resumen del job.

Agrega `fail-on-regression: true` si quieres que un pull request que pierde progreso falle su check.

### Pull requests desde forks

El pull request de un fork se ejecuta con un token de solo lectura, así que no puede comentar. La solución tiene dos
partes. Primero, dale un `id` al paso y sube su comparación como artifact:

```yaml
      - uses: decmp/upload-action@v1
        id: decmp
        with:
          report: build/GZ2E01/report.json
          version: GZ2E01

      - if: ${{ !cancelled() && github.event.pull_request.head.repo.fork }}
        uses: actions/upload-artifact@v4
        with:
          name: decmp-comment-GZ2E01   # one name per version
          path: ${{ steps.decmp.outputs.comment-file }}
```

Luego agrega un segundo workflow, `.github/workflows/progress-comment.yml`, que se ejecuta después del primero con los
permisos de tu repositorio y publica el comentario:

```yaml
name: progress comment
on:
  workflow_run:
    workflows: [progress]
    types: [completed]

jobs:
  comment:
    if: github.event.workflow_run.event == 'pull_request'
    runs-on: ubuntu-latest
    permissions:
      actions: read          # to download the run's artifacts
      pull-requests: write
    steps:
      - uses: actions/download-artifact@v4
        with:
          pattern: decmp-comment-*
          merge-multiple: true
          path: decmp-comment
          run-id: ${{ github.event.workflow_run.id }}
          github-token: ${{ github.token }}

      - uses: decmp/upload-action@v1   # posts what it finds in decmp-comment/
```

La ejecución que publica solo lee cifras de esos archivos y arma el comentario por su cuenta.

## Sin la action: el script

El mismo código se sirve como un único script desde la API, para configuraciones de CI que no pueden usar actions de
terceros o que prefieren fijar un hash. Las releases nunca cambian una vez publicadas, y
[`/action/manifest.json`](https://api.decmp.dev/action/manifest.json) lista cada versión con su SHA-256. La versión
1.1.0 es la primera que se ejecuta como script.

```yaml
      - name: Upload to decmp.dev
        run: |
          curl -fsSL https://api.decmp.dev/action/v1.1.0.mjs -o decmp.mjs
          echo "10fb0039a067b4ffe67510959356a691efa6efbb0aae16450c04f8c64da0a5f8  decmp.mjs" | sha256sum -c
          node decmp.mjs
        env:
          DECMP_REPORT: build/GZ2E01/report.json
          DECMP_VERSION: GZ2E01
          DECMP_NAME: "The Legend of Zelda: Twilight Princess"  # first upload only
          DECMP_PLATFORM: gc                                   # first upload only
          DECMP_BANNER: assets/banner.webp                     # optional, 1024x256
          GITHUB_TOKEN: ${{ github.token }}                    # comments on pull requests
```

- Cada input se convierte en una variable `DECMP_` en mayúsculas, con guiones bajos en lugar de guiones:
  `short-name` es `DECMP_SHORT_NAME`. Los valores por defecto son los mismos, y `github-token` recurre a
  `GITHUB_TOKEN`.
- El job necesita los mismos permisos que con la action.
- Dale un `id` al paso y tendrá los mismos outputs.
- Los runners alojados de GitHub ya tienen Node. En un runner self-hosted, instala Node 24.
- `/action/v1.mjs` siempre sirve la última release 1.x. Es práctico para hacer pruebas; en CI, fija una versión y su
  hash como arriba.

## Después de la primera subida

- Tu página está en `https://decmp.dev/{owner}/{repo}`. Inicia sesión en decmp.dev con GitHub para administrarla;
  eso requiere acceso push, maintain o admin al repositorio.
- Divide tu progreso en [categorías](/es/progress/categories/), como código del juego y bibliotecas, en tu
  configuración de objdiff.
- Agrega un [badge](/es/progress/badges/) a tu README.
- Tu proyecto aparece en las [Patch Notes](/es/patch-notes/) semanales cuando avanza.

## Solución de problemas

- **`no OIDC token available`:** al job le falta `permissions: id-token: write`. Agrégalo al job o al workflow.
- **No se sube nada desde los pull requests:** es así por diseño. Los pull requests solo comparan y comentan; las
  subidas vienen de los otros eventos con los que se ejecuta tu workflow, como los pushes a `main`.
- **El comentario en el pull request nunca aparece:** el job necesita `pull-requests: write`. Para pull requests
  desde forks, configura la [versión con dos workflows](#pull-requests-desde-forks).
