---
title: ¿Qué es un decomp?
description: Los proyectos de decompilación reconstruyen el código fuente de un juego. Los matching lo demuestran, byte a byte.
sidebar:
  order: 1
---

Un **proyecto de decompilación** (un "decomp") convierte el código máquina compilado de un juego de nuevo en código
fuente que la gente puede leer, modificar y compilar. El juego se distribuye como un binario: un `.dol`, un ELF, una
imagen ROM, un ejecutable en un disco. Un decomp produce C o C++ que, al compilarse, te devuelve ese mismo binario.

Hay dos formas de juzgar si el código fuente es "correcto", y llevan a proyectos muy distintos.

## Matching y non-matching

### Matching

Un decomp **matching** reconstruye el binario original **byte a byte**. Compilas el código fuente con el mismo
compilador, la misma versión y los mismos flags que usaron los desarrolladores, lo enlazas en el mismo orden, y la
salida tiene exactamente el mismo hash que el archivo comercial.

Ese estándar suena estricto, y lo es. También es lo que hace que los decomps matching funcionen:

- **Es verificable.** Un checksum te dice si terminaste. Nadie tiene que discutir si una función "se ve bien"; el
  compilador lo decide.
- **Es incremental.** No necesitas entender todo el juego antes de empezar. El binario se divide en partes, y cada
  función puede reemplazarse por C de una en una mientras el resto sigue en ensamblador. La build se mantiene idéntica
  en cada paso.
- **Detecta errores.** Si tu C tiene un tipo equivocado, un cast faltante o un bucle escrito de otra manera, el
  compilador normalmente emite instrucciones distintas y el diff lo muestra.
- **Preserva el comportamiento exacto,** bugs y rarezas incluidos. Speedrunners, modders e investigadores pueden
  confiar en él.

El costo es que debes descubrir no solo *qué* hace una función sino *cómo se escribió*, porque dos fragmentos de C que
hacen lo mismo a menudo compilan a instrucciones distintas.

### Non-matching

Un decomp **non-matching** (o "funcionalmente equivalente") busca código fuente que se comporte igual pero compile a
bytes distintos, muchas veces con un compilador moderno. Puede avanzar más rápido y es una buena opción para ports,
pero pierde el checksum: necesitas otras formas, como tests y partidas completas, para saber que el código es
correcto.

Muchos proyectos matching también permiten algunas funciones **equivalentes** mientras trabajan: código que se cree
que se comporta igual pero que todavía no hace match, compilado solo en una configuración non-matching aparte. La meta
sigue siendo un match completo.

Esta guía trata sobre decomps matching.

## Cómo se arma un proyecto matching

Los detalles cambian según la consola, pero la forma casi siempre es la misma:

1. **Los archivos originales del juego quedan fuera del repositorio.** Cada colaborador aporta su propia copia, y la
   build extrae lo que necesita. Consulta [Mantente dentro de la ley](/es/start/legal/).
2. **El binario se divide** en secciones, luego en unidades (units; una por cada archivo fuente original, cuando se
   pueden identificar), y cada unit en funciones y datos. Las herramientas generan esta división a partir de un
   archivo de configuración más los símbolos.
3. **Cada función empieza como ensamblador.** El proyecto compila a partir de ese ensamblador y ya debe hacer match.
4. **Los colaboradores reemplazan funciones por C,** de una en una. Una herramienta de diff compara la función
   compilada con la original, instrucción por instrucción.
5. **Cuando una unit hace match por completo,** el proyecto enlaza el C compilado en lugar del ensamblador, y el
   checksum final demuestra que nada se rompió.

## Medir el progreso

Como el trabajo avanza función por función, el progreso tiene una medida natural. Herramientas como
[objdiff](https://github.com/encounter/objdiff) comparan cada objeto compilado con el original y producen un reporte
con cifras como:

| Medida | Significado |
|---|---|
| Código con match | Bytes de código en funciones que hacen match exacto. La cifra principal. |
| Funciones con match | Cuántas funciones hacen match, sin importar su tamaño. |
| Fuzzy match | Qué tan cerca está, en promedio, el código que todavía no hace match. |
| Datos con match | Bytes de datos (tablas, strings, globales inicializadas) contabilizados. |
| Units completas | Units que hacen match por completo y pueden enlazarse desde el código fuente. |

Los bytes de código son una medida más justa que el número de funciones: un proyecto puede hacer match de cientos de
getters diminutos y seguir teniendo sus funciones más grandes en ensamblador.

decmp.dev lee estos reportes y los convierte en páginas de proyecto, gráficas de historial y badges. Consulta
[Sube tu progreso](/es/progress/upload-action/).

## El matching no es la meta final

Una función que hace match todavía puede ser difícil de leer: variables llamadas `temp_r3`, campos llamados `unk2C`,
números mágicos por todas partes. Una vez que algo hace match, el siguiente trabajo es hacerlo comprensible: tipos
reales, nombres reales respaldados por evidencia, enums para las constantes. Un decomp matching que nadie puede leer
es un checksum, no código fuente.

## A dónde seguir

- [Mantente dentro de la ley](/es/start/legal/) antes de subir nada.
- [Elige un juego](/es/start/choosing-a-game/) si vas a empezar un proyecto nuevo, o
  [únete a uno existente](/es/contribute/), que es la forma más rápida de entrar.
- Lee [el workflow de matching](/es/matching/workflow/) para ver cómo es una sesión de trabajo.
