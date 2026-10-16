---
title: The matching workflow
description: How to take one function from assembly to matching C, and how to keep going for thousands more.
sidebar:
  order: 1
---

Matching is a loop: pick a function, write C, compile, compare, adjust. This page walks through one turn of that
loop, then covers the habits that keep a project moving once there are thousands of functions left.

It assumes your project already builds from assembly and matches. If it doesn't yet, start with your
[console's guide](/platforms/gamecube-wii/).

## 1. Pick a function

Your first matches should be boring on purpose.

- **Small and self-contained.** Getters, setters, tiny init functions, wrappers that call one other function.
- **Few unknown types.** A function that only touches arguments and locals is easier than one that walks three
  unknown structs.
- **Near work that's already done.** A function in a unit where its neighbours match will reuse their types and
  headers.
- **Game code before libraries.** SDK and runtime code is often shared with other games, and someone may already
  have matched it. Check before spending time on it.

Big switch-heavy functions, hand-written assembly and code that juggles floating point are for later.

## 2. Gather context

Before writing anything, collect what the function touches:

- **Its callers and callees.** What arguments are passed in, and what is done with the return value, often tells
  you the types.
- **The data it reads.** Strings are the best clue there is. Tables and constants come next.
- **Similar functions that already match.** Projects are full of near-identical functions: one per enemy, per menu,
  per stage. A matched sibling is usually most of the answer.
- **The headers you'll need,** so the compiler sees the right struct layouts and prototypes.

## 3. Draft the C

You can write the first draft by hand, but most people start from a decompiler's output:

- [m2c](https://github.com/matt-kempster/m2c) turns MIPS, PowerPC, ARM or SuperH assembly into C-like code. Give it
  a **context file** (your headers, preprocessed) with `--context`, and it uses your real types and prototypes
  instead of guessing. Pick the target that matches your project with `--target`, for example
  `--target mips-ido-c`; run `--help` for the full list of options.
- [decomp.me](https://decomp.me) runs a decompiler and the right compiler in the browser, and shows the diff live.
  It is also how you share a function you're stuck on.
- Ghidra and similar tools help with the big picture: cross-references, call graphs, data types.

Treat the draft as a sketch. It will have temporaries named after registers, casts everywhere and odd control flow.
Clean that up as you match, not after.

## 4. Compile and diff

Build the object and compare it with the original. [objdiff](https://github.com/encounter/objdiff) shows the two
side by side, function by function, rebuilds when you save, and gives each function a match percentage. Many
projects also have a command-line diff script.

Read the diff from the top. The first difference is usually the one that matters; later ones are often knock-on
effects.

## 5. Close the gap

Differences fall into a few families. Work from the biggest to the smallest:

| What the diff shows | Usual cause |
|---|---|
| Different instructions, different structure | Wrong control flow: a `for` that was a `while`, an early return, a missing `else`, a `switch` written as `if`s. |
| Wrong loads and stores (size or sign) | Wrong types: `s16` versus `u16`, a pointer versus an array, a struct field at the wrong offset. |
| Extra or missing instructions around calls | Wrong prototype: argument count or types, or a return value that isn't used. |
| Same instructions, different order | Expression order, or where a variable is declared or assigned. |
| Same instructions, different registers | The hardest kind. Often the lifetime or reuse of a variable, or the order of statements. |
| Everything right but one constant | A missing cast, a wrong literal type, or an enum or `sizeof` the compiler sees differently. |

When a function is close, change **one thing at a time** and keep a short note of what moved the diff. Every change
should come with a reason why it should bring the output closer. Random shuffling can stumble onto a match, but you
learn nothing from it, and the result is often code nobody would have written.

### Don't fake it

Some tricks force a match without being the original code: `volatile` on a local, dead stores, junk temporaries,
inline `asm`, a `do { } while (0)` with no purpose, per-function compiler flags. They make the checksum pass while
making the source wrong. If a function resists, leave it as assembly with a short honest comment about what's left,
and come back later with more context. Projects that do allow an exception keep it documented and rare.

### When you're stuck

- **Look for a pattern across functions.** If a whole family of simple functions fails in the same way, the problem
  is probably the compiler version or the flags, not your C.
- **Fix types before anything else.** Most register and ordering puzzles disappear once the structs and prototypes
  are right.
- **Ask for a second pair of eyes.** Post a decomp.me scratch in your project's chat.
- **Set a limit.** If ten attempts haven't changed the diff, change your hypothesis or move on. Coming back a week
  later, with more of the game understood, often makes it easy.
- **Permuters exist.** [decomp-permuter](https://github.com/simonlindholm/decomp-permuter) tries random or listed
  variations of a function automatically. It can point you at what matters, but read what it finds and keep only
  changes you can explain.

## 6. Make it readable, then commit

A match is the floor. Before you commit:

- name variables and parameters for what they hold;
- replace magic numbers with named constants or enums once you know what they mean;
- use real struct fields instead of pointer arithmetic;
- name functions from evidence (a string, a caller, an SDK call), not from a guess, and keep the address-based name
  until you have that evidence;
- keep comments for the *why*, not the *what*.

Then run the full build and check the final hash still matches. One function or one unit per commit keeps history
easy to review.

## Habits that scale

Once the easy functions are gone, these habits make the difference:

- **Work in families.** Sort what's left by size and similarity, match one representative, then apply what you
  learned to its siblings.
- **Keep headers single-sourced.** One declaration per symbol, in the header of the module that owns it. Copies drift,
  and drift breaks matches in confusing ways.
- **Share types early.** A struct discovered in one function is evidence for every other function that touches it.
  Put it in a header and tell the others.
- **Watch the whole build, not just your function.** A change to a shared header can shift another unit. Let CI
  build everything.
- **Track progress in code bytes,** not only in function counts, so big functions don't hide.
- **Write down what you learn.** Compiler quirks, shapes that matched and dead ends are worth more than any single
  function. Put them in your project's docs so the next contributor doesn't relearn them.

## Next

- [Common patterns](/matching/patterns/) collects source shapes that tend to fix specific diffs.
- [Compilers](/matching/compilers/) covers the compilers you'll meet and how they differ.
- [Upload your progress](/progress/upload-action/) to see the work add up.
