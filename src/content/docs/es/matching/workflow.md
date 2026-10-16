---
title: El workflow de matching
description: Cómo llevar una función del ensamblador a C con match, y cómo seguir con miles más.
sidebar:
  order: 1
---

El matching es un ciclo: eliges una función, escribes C, compilas, comparas, ajustas. Esta página recorre una vuelta
de ese ciclo y luego cubre los hábitos que mantienen un proyecto en marcha cuando todavía quedan miles de funciones.

Supone que tu proyecto ya compila a partir del ensamblador y hace match. Si todavía no es así, empieza por la
[guía de tu consola](/es/platforms/gamecube-wii/).

## 1. Elige una función

Tus primeros matches deberían ser aburridos a propósito.

- **Pequeñas y autocontenidas.** Getters, setters, funciones de inicialización diminutas, wrappers que llaman a una
  sola función.
- **Pocos tipos desconocidos.** Una función que solo toca argumentos y variables locales es más fácil que una que
  recorre tres structs desconocidos.
- **Cerca del trabajo ya hecho.** Una función en una unit donde sus vecinas ya hacen match reutilizará sus tipos y
  headers.
- **Código del juego antes que bibliotecas.** El código del SDK y del runtime muchas veces se comparte con otros
  juegos, y puede que alguien ya le haya hecho match. Revisa antes de dedicarle tiempo.

Las funciones grandes llenas de `switch`, el ensamblador escrito a mano y el código que hace malabares con punto
flotante son para después.

## 2. Reúne contexto

Antes de escribir nada, junta lo que la función toca:

- **Quién la llama y a quién llama.** Qué argumentos recibe y qué se hace con el valor de retorno a menudo te dice
  los tipos.
- **Los datos que lee.** Los strings son la mejor pista que existe. Después vienen las tablas y las constantes.
- **Funciones parecidas que ya hacen match.** Los proyectos están llenos de funciones casi idénticas: una por enemigo,
  por menú, por nivel. Una hermana con match suele ser la mayor parte de la respuesta.
- **Los headers que vas a necesitar,** para que el compilador vea los layouts de structs y los prototipos correctos.

## 3. Escribe el borrador en C

Puedes escribir el primer borrador a mano, pero la mayoría empieza a partir de la salida de un decompilador:

- [m2c](https://github.com/matt-kempster/m2c) convierte ensamblador MIPS, PowerPC, ARM o SuperH en código parecido a
  C. Dale un **archivo de contexto** (tus headers, preprocesados) con `--context` y usará tus tipos y prototipos
  reales en lugar de adivinar. Elige el target que corresponde a tu proyecto con `--target`, por ejemplo
  `--target mips-ido-c`; ejecuta `--help` para ver la lista completa de opciones.
- [decomp.me](https://decomp.me) ejecuta un decompilador y el compilador adecuado en el navegador, y muestra el diff
  en vivo. También es la forma de compartir una función en la que te atascaste.
- Ghidra y herramientas similares ayudan con el panorama general: referencias cruzadas, grafos de llamadas, tipos de
  datos.

Trata el borrador como un boceto. Tendrá temporales con nombres de registros, casts por todas partes y un flujo de
control raro. Límpialo a medida que haces match, no después.

## 4. Compila y compara

Compila el objeto y compáralo con el original. [objdiff](https://github.com/encounter/objdiff) muestra ambos lado a
lado, función por función, recompila cuando guardas y le da a cada función un porcentaje de match. Muchos proyectos
también tienen un script de diff de línea de comandos.

Lee el diff desde arriba. La primera diferencia suele ser la que importa; las siguientes muchas veces son efectos en
cadena.

## 5. Cierra la brecha

Las diferencias caen en unas pocas familias. Trabaja de la más grande a la más pequeña:

| Lo que muestra el diff | Causa habitual |
|---|---|
| Instrucciones distintas, estructura distinta | Flujo de control equivocado: un `for` que era un `while`, un return temprano, un `else` que falta, un `switch` escrito como varios `if`. |
| Cargas y almacenamientos equivocados (tamaño o signo) | Tipos equivocados: `s16` frente a `u16`, un puntero frente a un array, un campo de struct en el offset equivocado. |
| Instrucciones de más o de menos alrededor de las llamadas | Prototipo equivocado: cantidad o tipos de argumentos, o un valor de retorno que no se usa. |
| Mismas instrucciones, distinto orden | Orden de las expresiones, o dónde se declara o asigna una variable. |
| Mismas instrucciones, distintos registros | El tipo más difícil. A menudo es la vida útil o la reutilización de una variable, o el orden de las sentencias. |
| Todo bien salvo una constante | Un cast que falta, un tipo de literal equivocado, o un enum o `sizeof` que el compilador ve de otra forma. |

Cuando una función está cerca, cambia **una cosa a la vez** y anota brevemente qué movió el diff. Cada cambio debería
tener una razón por la que acercaría la salida. Reordenar al azar puede dar con un match por casualidad, pero no
aprendes nada, y el resultado muchas veces es código que nadie habría escrito.

### No hagas trampa

Algunos trucos fuerzan un match sin ser el código original: `volatile` en una variable local, asignaciones muertas,
temporales basura, `asm` inline, un `do { } while (0)` sin propósito, flags de compilador por función. Hacen que pase
el checksum mientras el código fuente queda mal. Si una función se resiste, déjala en ensamblador con un comentario
breve y honesto sobre lo que falta, y vuelve más tarde con más contexto. Los proyectos que sí permiten una excepción
la mantienen documentada y poco frecuente.

### Cuando te atascas

- **Busca un patrón entre funciones.** Si toda una familia de funciones simples falla de la misma manera, el problema
  probablemente es la versión del compilador o los flags, no tu C.
- **Corrige los tipos antes que nada.** La mayoría de los acertijos de registros y de orden desaparecen cuando los
  structs y los prototipos son correctos.
- **Pide otro par de ojos.** Publica un scratch de decomp.me en el chat de tu proyecto.
- **Ponte un límite.** Si diez intentos no han cambiado el diff, cambia tu hipótesis o pasa a otra cosa. Volver una
  semana después, entendiendo más del juego, a menudo lo hace fácil.
- **Existen los permuters.** [decomp-permuter](https://github.com/simonlindholm/decomp-permuter) prueba
  automáticamente variaciones aleatorias o predefinidas de una función. Puede señalarte lo que importa, pero lee lo
  que encuentra y quédate solo con los cambios que puedas explicar.

## 6. Hazlo legible y luego haz commit

Un match es el piso. Antes de hacer commit:

- nombra las variables y los parámetros según lo que contienen;
- reemplaza los números mágicos por constantes con nombre o enums una vez que sepas qué significan;
- usa campos reales de structs en lugar de aritmética de punteros;
- nombra las funciones a partir de evidencia (un string, quien la llama, una llamada al SDK), no de una suposición, y
  conserva el nombre basado en la dirección hasta que tengas esa evidencia;
- reserva los comentarios para el *por qué*, no para el *qué*.

Luego ejecuta la build completa y comprueba que el hash final sigue haciendo match. Una función o una unit por commit
mantiene el historial fácil de revisar.

## Hábitos que escalan

Cuando se acaban las funciones fáciles, estos hábitos marcan la diferencia:

- **Trabaja por familias.** Ordena lo que queda por tamaño y similitud, haz match de una representante y luego aplica
  lo que aprendiste a sus hermanas.
- **Mantén una sola fuente para los headers.** Una declaración por símbolo, en el header del módulo al que pertenece.
  Las copias divergen, y esa divergencia rompe matches de formas confusas.
- **Comparte los tipos pronto.** Un struct descubierto en una función es evidencia para todas las demás funciones que
  lo tocan. Ponlo en un header y avísales a los demás.
- **Vigila toda la build, no solo tu función.** Un cambio en un header compartido puede mover otra unit. Deja que CI
  compile todo.
- **Mide el progreso en bytes de código,** no solo en cantidad de funciones, para que las funciones grandes no se
  escondan.
- **Anota lo que aprendes.** Las peculiaridades del compilador, las formas que hicieron match y los callejones sin
  salida valen más que cualquier función individual. Ponlos en la documentación de tu proyecto para que el próximo
  colaborador no tenga que volver a aprenderlos.

## Siguiente

- [Patrones comunes](/es/matching/patterns/) reúne formas de escribir el código que suelen corregir diffs concretos.
- [Compiladores](/es/matching/compilers/) cubre los compiladores que vas a encontrar y en qué se diferencian.
- [Sube tu progreso](/es/progress/upload-action/) para ver cómo se acumula el trabajo.
