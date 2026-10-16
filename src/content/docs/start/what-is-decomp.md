---
title: What is a decomp?
description: Decompilation projects rebuild a game's source code. Matching ones prove it, byte for byte.
sidebar:
  order: 1
---

A **decompilation project** (a "decomp") turns a game's compiled machine code back into source code that people can
read, change and build. The game ships as a binary: a `.dol`, an ELF, a ROM image, an executable on a disc. A decomp
produces C or C++ that, when built, gives you that binary again.

There are two ways to judge whether the source is "right", and they lead to very different projects.

## Matching and non-matching

### Matching

A **matching** decomp rebuilds the original binary **byte for byte**. You compile the source with the same compiler,
the same version and the same flags the developers used, link it in the same order, and the output hashes identically
to the retail file.

That standard sounds strict, and it is. It is also what makes matching decomps work:

- **It is verifiable.** A checksum tells you whether you are done. Nobody has to argue about whether a function
  "looks right"; the compiler settles it.
- **It is incremental.** You don't have to understand the whole game before starting. The binary is split into
  pieces, and each function can be replaced by C one at a time while the rest stays as assembly. The build stays
  identical at every step.
- **It catches mistakes.** If your C has a wrong type, a missing cast or a loop written the wrong way, the compiler
  usually emits different instructions and the diff shows it.
- **It preserves behavior exactly,** bugs and quirks included. Speedrunners, modders and researchers can trust it.

The cost is that you must work out not only *what* a function does but *how it was written*, because two pieces of
C that do the same thing often compile to different instructions.

### Non-matching

A **non-matching** (or "functionally equivalent") decomp aims for source that behaves the same but compiles to
different bytes, often with a modern compiler. It can move faster and is a fine choice for ports, but it loses the
checksum: you need other ways, like tests and playthroughs, to know the code is correct.

Many matching projects also allow a few **equivalent** functions while they work: code that is believed to behave
the same but doesn't match yet, built only in a separate non-matching configuration. The goal stays a full match.

This guide is about matching decomps.

## How a matching project fits together

The details change per console, but the shape is nearly always the same:

1. **The original game files stay out of the repository.** Each contributor supplies their own copy, and the build
   extracts what it needs. See [Stay legal](/start/legal/).
2. **The binary is split** into sections, then into units (one per original source file, when they can be found),
   and each unit into functions and data. Tools generate this split from a config file plus symbols.
3. **Every function starts as assembly.** The project builds from that assembly and must already match.
4. **Contributors replace functions with C,** one at a time. A diff tool compares the compiled function with the
   original, instruction by instruction.
5. **When a unit matches completely,** the project links the compiled C instead of the assembly, and the final
   checksum proves nothing broke.

## Measuring progress

Because work happens function by function, progress has a natural measure. Tools like
[objdiff](https://github.com/encounter/objdiff) compare every built object with the original and produce a report
with figures such as:

| Measure | Meaning |
|---|---|
| Matched code | Bytes of code in functions that match exactly. The headline number. |
| Matched functions | How many functions match, regardless of size. |
| Fuzzy match | How close the not-yet-matching code is, on average. |
| Matched data | Bytes of data (tables, strings, initialized globals) accounted for. |
| Complete units | Units that match fully and can be linked from source. |

Code bytes are a fairer measure than a function count: a project can match hundreds of tiny getters and still have
its biggest functions in assembly.

decmp.dev reads these reports and turns them into project pages, history charts and badges. See
[Upload your progress](/progress/upload-action/).

## Matching is not the finish line

A function that matches can still be hard to read: variables named `temp_r3`, fields called `unk2C`, magic numbers
everywhere. Once something matches, the next job is to make it understandable: real types, real names backed by
evidence, enums for constants. A matching decomp that nobody can read is a checksum, not source code.

## Where next

- [Stay legal](/start/legal/) before you push anything.
- [Choose a game](/start/choosing-a-game/) if you are starting a new project, or
  [join an existing one](/contribute/), which is the faster way in.
- Read [the matching workflow](/matching/workflow/) to see what a working session looks like.
