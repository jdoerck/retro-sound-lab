# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

No build step, package manager, linter or test runner. Everything is plain HTML/JS.

```sh
python3 -m http.server 8000      # serve at http://localhost:8000/ (needed: AudioWorklet requires a secure context)
node tools/check.mjs             # syntax-check every inline <script> and every DSP engine string in all .html files
```

`tools/check.mjs` has no per-file mode; it always checks the whole tree (skipping `tools/`, `docs/`, `node_modules/`, `.git/`). Run it after any edit. There is no single-test equivalent. For deeper engine checks, extract the `DSP` class and call `next()` for a few seconds per preset, watching for NaN and clipping (manual, no script exists yet).

## Architecture

Each instrument is one self-contained HTML file. The shared pattern is in the engine string:

- **DSP as a string.** `const DSP=\`class X{ … next(){…} }\`` holds a stateful class whose `next()` returns one sample per call (some also expose `L`/`R`). The same string is consumed three ways:
  - `new Function(DSP+';return X')()` for offline export and tests on the main thread.
  - `DSP` + `registerProcessor(...)` loaded into an AudioWorklet via a Blob URL for live audio.
  - A ScriptProcessor fallback that runs the same class on the main thread if the worklet fails.
- **Messaging.** UI sends small messages (`{p:patch}`, `{on:note}`, `{off:note}`, `{panic:1}`, `{tb:…}`). The worklet posts monitor data back every few blocks (trace ring buffers, register values, program counters). A local `send()` wrapper mirrors the same calls onto the fallback instance, so keep both paths in sync when adding a message.
- **Frame drivers.** Chip engines without hardware envelopes (POKEY, TIA, shift register, trackers) run a 50/60 Hz driver inside the engine for envelopes, arpeggios, slides and vibrato.
- **Clock accuracy is structural.** POKEY steps a 1.79 MHz clock, TIA runs at ~31.4 kHz, the beeper follows CPU loop rate, trackers use integer divider tables. Tuning and aliasing errors should come from this structure, not be patched over.
- **Exceptions.** Pages with no `registerProcessor` (Speech, Night Circuit Drums, No One, DAC-8, Pair Sequencer, Tessel, Horizon Warden) don't use the worklet path. Night Circuit Drums and No One render one-shot buffers with JS voice functions (`V.kick`, `V.snare`, …) plus Web Audio nodes (ConvolverNode spring IR, WaveShaper tape drive, scheduled BufferSources); No One reuses the drum voices verbatim. Check the page before assuming the worklet path.
- **Export.** Hand-written `wav16()` / `wavSt()`, a stored-mode `zip()` with CRC32, and per-page `.json` patches. Downloads go through `window.claude.use('downloads')`; outside claude.ai, an inline shim at the top of each `<body>` provides a link-based download. `sample` (Claude calls in Tessel and Speech) returns `null` locally, and those pages fall back to built-in rules.
- **State.** Patches persist in `localStorage` under per-page keys (`dac8-patch`, `csg-patch`, `drum-kit`, `noone-rhythm`, `tracker-song`, `regtracker-song`, …), always in try/catch. `sanitize()` clamps any loaded or pasted patch. Reuse the existing key naming for new pages.

## Conventions

- Keep pages single-file. Duplicate small helpers (wav, zip, CRC) per page rather than adding shared imports, unless a build step is introduced.
- Engines stay dependency-free and stateful via `next()` so they port to C++/JUCE or Faust. Don't introduce browser-only APIs inside engine strings.
- Original content only: no ROMs, factory samples, copied schematics or tunes. Name chip-like copies descriptively ("SN76477-style"), not with trademarks.
- Formulas are documented approximations (RC rules of thumb, maximal-length LFSRs instead of exact chip taps). Keep in-page notes honest when changing them.
- After engine edits, run `tools/check.mjs` and listen to the presets. NaN guards and `tanh` output stages are intentional.
- Visual language: dark solder-mask theme via CSS variables (`--mask`, `--silk`, `--pad`, `--led`, `--phos`), `.chip` blocks with a gold designator, resistor sliders snapping to E24 and capacitors to E6. Pages declare `color-scheme:dark`.
- Known limits (documented in `AGENTS.md`; don't "fix" silently): POKEY/TIA noise polynomials are standard sequences, not bit-exact taps; the Speech phoneme table is general phonetics; CSG RC and external CV mapping are simplified; no MIDI input yet.

## Project files

- `README.md` — short overview and run instructions.
- `AGENTS.md` — the longer architecture, conventions and known-limits document. Read it for detail beyond this file.
- `docs/ROADMAP.md` — planned builds, plugin port notes, and the table of published claude.ai artifacts. Update the artifact table when a page's public artifact changes.
- `index.html` — hub page linking every instrument, sequencer, experiment and game. Add new pages here.
