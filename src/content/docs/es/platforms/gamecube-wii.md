---
title: GameCube y Wii
description: Cómo empezar un decomp matching de un juego de GameCube o Wii con decomp-toolkit, dtk-template y objdiff.
sidebar:
  order: 1
---

Los decomps de GameCube y Wii comparten una familia de CPU, una familia de compiladores y una toolchain madura. La
mayoría de los proyectos activos en estas consolas se construyen a partir de la misma plantilla, así que cuando
conoces uno, puedes orientarte en los demás.

## El hardware y el compilador

- **CPU:** PowerPC (Gekko en GameCube, Broadway en Wii), big-endian.
- **Compilador:** casi siempre **Metrowerks CodeWarrior** (`mwcceppc`), incluido en el SDK oficial. Existen muchas
  versiones y generan código distinto, así que encontrar la versión correcta para tu juego (y a veces para cada
  biblioteca dentro de él) es una de las primeras tareas. Los proyectos se refieren a ellas con etiquetas como
  `GC/1.2.5n`, `GC/1.3.2` o versiones de Wii.
- **Ejecutables:** un `.dol` principal, a menudo junto con módulos `.rel` (código reubicable que se carga en tiempo de
  ejecución, más o menos como las DLL).
- **Lenguajes:** C y C++. Los juegos en C++ traen nombres mangled, vtables y código generado por el compilador que
  debes reproducir.

CodeWarrior es un programa de Windows. En Linux y macOS la plantilla lo ejecuta mediante
[wibo](https://github.com/decompals/wibo), un pequeño wrapper para herramientas de línea de comandos de Windows de 32
bits, y lo descarga por ti.

## La toolchain

| Herramienta | Qué hace |
|---|---|
| [decomp-toolkit](https://github.com/encounter/decomp-toolkit) (`dtk`) | Analiza el DOL y los REL, los divide en objetos según tu configuración y maneja imágenes de disco, archivos comprimidos y maps. |
| [dtk-template](https://github.com/encounter/dtk-template) | La estructura base del proyecto: `configure.py`, una build con ninja, CI y reporte de progreso. |
| [objdiff](https://github.com/encounter/objdiff) | Compara tus objetos compilados con los originales, función por función, y escribe el reporte de progreso. |
| [m2c](https://github.com/matt-kempster/m2c) | Genera un borrador en C a partir del ensamblador. Soporta PowerPC y tiene tratamiento específico para CodeWarrior. |
| [decomp.me](https://decomp.me) | Comparte una sola función como "scratch" para que otros ayuden a hacerle match en el navegador. |
| [sjiswrap](https://github.com/encounter/sjiswrap) | Permite que el compilador lea código fuente UTF-8 como Shift JIS, para strings en japonés. |

## Empezar un proyecto

La [guía de inicio](https://github.com/encounter/dtk-template/blob/main/docs/getting_started.md) de la propia
plantilla es la referencia; esto es el esquema general para que sepas qué esperar.

1. **Instala las dependencias.** Python y [ninja](https://ninja-build.org/). En Windows, usa herramientas nativas; la
   plantilla advierte que objdiff no puede vigilar archivos para recompilar automáticamente bajo WSL.
2. **Crea tu repositorio a partir de dtk-template** y clónalo.
3. **Agrega tu juego.** Renombra `orig/GAMEID` con el ID de tu juego (por ejemplo `GZ2E01`) y coloca ahí tu imagen de
   disco. La plantilla acepta varios formatos (ISO, RVZ, WBFS y otros) o un disco que hayas extraído con Dolphin. Todo
   lo que está bajo `orig/` lo ignora git, salvo un `.gitkeep`.
4. **Configura.** Renombra también `config/GAMEID` y completa `config.yml` usando el archivo de ejemplo que está al
   lado.
5. **Escribe los hashes esperados.** `config/GAMEID/build.sha1` lista el SHA-1 de cada archivo que la build debe
   producir. La plantilla sugiere generarlo con `dtk shasum` y luego apuntar las rutas a `build/` en lugar de `orig/`.
6. **Genera y compila.** Agrega el ID a `VERSIONS` en `configure.py`, ejecuta `python configure.py` y luego `ninja`.

La primera ejecución de `ninja` analiza el binario y escribe `symbols.txt` y `splits.txt` por ti. No esperes que
enlace de inmediato: las divisiones generadas son un punto de partida que vas refinando.

### Si el disco trae un map o un ELF de depuración

Algunos discos incluyen un archivo `.map` del linker, o una build de depuración olvidada entre los archivos. Son oro:
te dan nombres reales de funciones, tamaños y el archivo original del que vino cada función. La plantilla puede leer
un `.map` durante el primer análisis para llenar `symbols.txt` y `splits.txt`, y `dtk` puede generar una
configuración a partir de un `.elf` que haga match. Revisa la guía de la plantilla para ver las claves exactas, y
elimina las entradas `map` una vez que se haya hecho el análisis.

## Los dos archivos que más vas a editar

- **`symbols.txt`** nombra cada función y objeto con su dirección, tipo y tamaño. Renombrar un símbolo aquí lo
  renombra en todas partes: en el ensamblador dividido, en objdiff y en el reporte.
- **`splits.txt`** indica qué rangos de direcciones de cada sección pertenecen a qué archivo fuente. Definir bien las
  units importa: el orden de enlace, el padding y la ubicación de los datos dependen de ello.

Ambos archivos están documentados en la carpeta `docs/` de la plantilla.

## Del ensamblador a C

En `configure.py`, cada archivo fuente se declara como un objeto con un estado:

- `Matching`: hace match, así que se compila y se enlaza en la build final;
- `NonMatching`: todavía se está trabajando, así que la build usa el código original para él;
- `Equivalent`: se comporta igual pero no hace match, y solo se enlaza cuando configuras con `--non-matching`.

El ciclo habitual:

1. Elige una unit, márcala como `NonMatching` y crea su archivo `.c` o `.cpp`.
2. Abre el proyecto en objdiff. Lee `objdiff.json`, que genera la build, y muestra cada función de la unit lado a lado
   con la original.
3. Escribe una función, guarda y observa cómo se actualiza el diff. Cuando toda la unit haga match, cámbiala a
   `Matching`.
4. Ejecuta `ninja` y comprueba que los hashes finales siguen pasando.

Consulta [el workflow de matching](/es/matching/workflow/) para ver cómo abordar una función.

### Hábitos de CodeWarrior que conviene conocer pronto

- **Primero la versión y los flags.** Si toda una familia de funciones simples se niega a hacer match de la misma
  manera, sospecha de la versión del compilador o de un flag para esa biblioteca, no de tu C.
- **El inlining y el orden son parte del match.** Las decisiones de inlining de CodeWarrior, y el orden de las
  funciones y los datos en un archivo, siguen al código fuente. Un `inline` que falta, o una función auxiliar definida
  en el lugar equivocado, aparece en el diff.
- **C++ necesita el layout de las clases.** Constructores, destructores, vtables y llamadas virtuales solo hacen match
  cuando la jerarquía de clases y el orden de los miembros son correctos. Los nombres reales de los maps ayudan mucho
  aquí.
- **El SDK es compartido.** Muchos juegos enlazan el mismo SDK y las mismas bibliotecas de runtime. Puede que otros
  proyectos ya hayan hecho match de la versión que usa tu juego, así que busca antes de empezar.

## Progreso y CI

La plantilla define categorías de progreso en `configure.py`, por defecto `game` (Game Code) y `sdk` (SDK Code), para
que puedas reportar el código del juego aparte de las bibliotecas. Compilar `build/GAMEID/report.json` ejecuta
`objdiff-cli report generate` sobre cada unit; `ninja progress` imprime un resumen en la terminal.

Para CI, la plantilla incluye un workflow de ejemplo de GitHub Actions. Compila dentro de una imagen de contenedor que
contiene los archivos del juego, y esa imagen viene de un repositorio **privado** separado, así que los archivos nunca
se hacen públicos. Sigue el `docs/github_actions.md` de la plantilla para configurarlo.

Una vez que CI produzca `report.json`, agrega un paso para subirlo a decmp.dev: consulta
[Sube tu progreso](/es/progress/upload-action/).

## Dónde conseguir ayuda

- El README de la plantilla enlaza al Discord de la comunidad de decompilación de GC/Wii, cuyo canal `#dtk` cubre las
  herramientas.
- Los proyectos existentes son la mejor referencia. La mayoría usa exactamente esta estructura, así que busca uno con
  un motor o una versión de SDK parecidos y lee cómo resolvieron los mismos problemas.
