---
title: GameCube and Wii
description: Starting a matching decomp of a GameCube or Wii game with decomp-toolkit, dtk-template and objdiff.
sidebar:
  order: 1
---

GameCube and Wii decomps share one CPU family, one compiler family and one mature toolchain. Most active projects
on these consoles are built from the same template, so once you know one, you can find your way around the others.

## The hardware and the compiler

- **CPU:** PowerPC (Gekko on GameCube, Broadway on Wii), big-endian.
- **Compiler:** almost always **Metrowerks CodeWarrior** (`mwcceppc`), shipped with the official SDK. Many versions
  exist, and they generate different code, so finding the right version for your game (and sometimes for each
  library inside it) is one of the first jobs. Projects refer to them by labels such as `GC/1.2.5n`, `GC/1.3.2` or
  Wii versions.
- **Executables:** a main `.dol`, often plus `.rel` modules (relocatable code loaded at runtime, roughly like DLLs).
- **Languages:** C and C++. C++ games bring mangled names, vtables and compiler-generated code you must reproduce.

CodeWarrior is a Windows program. On Linux and macOS the template runs it through
[wibo](https://github.com/decompals/wibo), a small wrapper for 32-bit Windows command-line tools, and downloads it
for you.

## The toolchain

| Tool | What it does |
|---|---|
| [decomp-toolkit](https://github.com/encounter/decomp-toolkit) (`dtk`) | Analyzes the DOL and RELs, splits them into objects from your config, and handles disc images, archives and maps. |
| [dtk-template](https://github.com/encounter/dtk-template) | The project scaffold: `configure.py`, a ninja build, CI and progress reporting. |
| [objdiff](https://github.com/encounter/objdiff) | Diffs your compiled objects against the original, function by function, and writes the progress report. |
| [m2c](https://github.com/matt-kempster/m2c) | Drafts C from assembly. It supports PowerPC and has CodeWarrior-specific handling. |
| [decomp.me](https://decomp.me) | Shares a single function as a "scratch" so others can help match it in the browser. |
| [sjiswrap](https://github.com/encounter/sjiswrap) | Lets the compiler read UTF-8 source as Shift JIS, for Japanese strings. |

## Starting a project

The template's own [getting started guide](https://github.com/encounter/dtk-template/blob/main/docs/getting_started.md)
is the reference; this is the outline so you know what to expect.

1. **Install the dependencies.** Python and [ninja](https://ninja-build.org/). On Windows, use native tools; the
   template notes that objdiff can't watch files for automatic rebuilds under WSL.
2. **Create your repository from dtk-template** and clone it.
3. **Add your game.** Rename `orig/GAMEID` to your game's ID (for example `GZ2E01`) and put your disc image there.
   The template accepts several formats (ISO, RVZ, WBFS and others) or a disc you extracted with Dolphin. Everything
   under `orig/` is ignored by git, apart from a `.gitkeep`.
4. **Configure.** Rename `config/GAMEID` too, and fill in `config.yml` using the example file next to it.
5. **Write the expected hashes.** `config/GAMEID/build.sha1` lists the SHA-1 of each file the build must produce.
   The template suggests generating it with `dtk shasum`, then pointing the paths at `build/` instead of `orig/`.
6. **Generate and build.** Add the ID to `VERSIONS` in `configure.py`, run `python configure.py`, then `ninja`.

The first `ninja` run analyzes the binary and writes `symbols.txt` and `splits.txt` for you. Expect it not to link
straight away: the generated splits are a starting point you refine.

### If the disc has a map or debug ELF

Some discs ship a linker `.map` file, or a debug build left in the files. These are gold: they give you real
function names, sizes and the original file each function came from. The template can read a `.map` during the
first analysis to fill `symbols.txt` and `splits.txt`, and `dtk` can generate a config from a matching `.elf`.
Check the template's guide for the exact keys, and remove the `map` entries once the analysis has run.

## The two files you'll edit most

- **`symbols.txt`** names every function and object with its address, type and size. Renaming a symbol here renames
  it everywhere: in the split assembly, in objdiff and in the report.
- **`splits.txt`** says which address ranges of each section belong to which source file. Getting units right
  matters: link order, padding and data placement all depend on it.

Both files are documented in the template's `docs/` folder.

## From assembly to C

In `configure.py`, each source file is declared as an object with a status:

- `Matching`: it matches, so it is compiled and linked into the final build;
- `NonMatching`: it is still being worked on, so the build uses the original code for it;
- `Equivalent`: it behaves the same but doesn't match, and is linked only when you configure with `--non-matching`.

The usual loop:

1. Pick a unit, mark it `NonMatching` and create its `.c` or `.cpp` file.
2. Open the project in objdiff. It reads `objdiff.json`, which the build generates, and shows each function of the
   unit side by side with the original.
3. Write a function, save, and watch the diff update. When the whole unit matches, switch it to `Matching`.
4. Run `ninja` and check that the final hashes still pass.

See [the matching workflow](/matching/workflow/) for how to tackle one function.

### CodeWarrior habits worth knowing early

- **Version and flags come first.** If a whole family of simple functions refuses to match the same way, suspect
  the compiler version or a flag for that library, not your C.
- **Inlining and ordering are part of the match.** CodeWarrior's inlining decisions, and the order of functions
  and data in a file, follow the source. A missing `inline`, or a helper defined in the wrong place, shows up in the
  diff.
- **C++ needs the class layout.** Constructors, destructors, vtables and virtual calls only match once the class
  hierarchy and member order are right. Real names from maps help a lot here.
- **The SDK is shared.** Many games link the same SDK and runtime libraries. Other projects may already have matched
  the version your game uses, so look before you start.

## Progress and CI

The template defines progress categories in `configure.py`, by default `game` (Game Code) and `sdk` (SDK Code), so
you can report game code apart from libraries. Building `build/GAMEID/report.json` runs
`objdiff-cli report generate` over every unit; `ninja progress` prints a summary in the terminal.

For CI, the template ships an example GitHub Actions workflow. It builds inside a container image that holds the
game files, and that image comes from a separate **private** repository, so the files never become public. Follow
the template's `docs/github_actions.md` to set it up.

Once CI produces `report.json`, add one step to upload it to decmp.dev: see
[Upload your progress](/progress/upload-action/).

## Where to get help

- The template's README links the GC/Wii decompilation community Discord, whose `#dtk` channel covers the tooling.
- Existing projects are the best reference. Most of them use this exact layout, so find one on a similar engine or
  SDK version and read how they solved the same problems.
