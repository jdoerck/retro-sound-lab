# Retro Sound Lab

A family of browser instruments built around early sound chips and circuits (late 1970s to mid 1980s), plus sequencers and interface experiments. Every page is a single self-contained HTML file: plain JavaScript and the Web Audio API, with no build step, no framework and no dependencies beyond Google Fonts.

The owner (J) is an experienced developer and electronic musician. The long-term goals are (1) a unified host that holds all the engines, and (2) porting the best engines to VST3/AU plugins (JUCE) and/or Faust/VCV Rack.

## Running

AudioWorklet needs a secure context, so serve over localhost instead of opening files directly:

```sh
python3 -m http.server 8000      # then open http://localhost:8000/
```

`index.html` links every page. Run `node tools/check.mjs` after edits; it syntax-checks every inline script and confirms each engine string compiles. For deeper checks, extract the `DSP` class and run `next()` for a few seconds per preset, watching for NaN and clipping.

## Layout

| Path | What it is |
|---|---|
| `instruments/` | The workbench synths and drum machines (one chip or circuit each) |
| `sequencers/` | Frame Tracker, Register Tracker, Pair Sequencer (byte-code music formats) |
| `experiments/` | Interface studies (Tessel, fader and PCB variants of the shift register) |
| `games/` | Horizon Warden, the Defender/Stargate-style shooter that started the project |
| `docs/ROADMAP.md` | Ideas discussed but not built, design directions, porting notes |
| `tools/check.mjs` | Syntax check + engine smoke test |

Each file and its published claude.ai artifact are listed in `docs/ROADMAP.md` under "Published artifacts".

## Architecture (all instruments follow this)

1. **Engine as a string.** The DSP lives in `const DSP=\`class X{ … next(){…} }\``: a class with a sample-by-sample `next()` returning one float (some also expose `L`/`R`). That one string is used three ways:
   - `new Function(DSP+';return X')()` gives a main-thread class for offline export and tests.
   - `DSP + registerProcessor(...)` is loaded into an **AudioWorklet** from a Blob URL for live audio.
   - If the worklet fails, a **ScriptProcessor** fallback runs the same class on the main thread.
2. **Messaging.** The UI sends small messages (`{p:patch}`, `{on:note}`, `{off:note}`, `{panic:1}`, `{tb:…}`); the worklet posts monitor data back every few blocks (ring buffers of traces, register values, program counters). A local `send()` wrapper mirrors the same calls onto the fallback instance.
3. **Frame drivers.** Chip instruments that had no envelopes (POKEY, TIA, shift register, trackers) use a 50/60 Hz "driver" inside the engine for envelopes, arpeggios, slides and vibrato, as game sound code did.
4. **Clock-accurate where it matters.** POKEY steps its 1.79 MHz clock, TIA its ~31.4 kHz audio clock, the beeper its CPU loop rate, and the trackers use integer divider tables, so tuning errors and aliasing come from the structure rather than being faked.
5. **Exceptions.** Night Circuit Drums and No One render one-shot buffers with plain JS voice functions (`V.kick`, `V.snare`, …), then use Web Audio nodes (ConvolverNode spring IR, WaveShaper tape drive, scheduled BufferSources). No One reuses the drum voices verbatim.
6. **Export.** Hand-written `wav16()` (and stereo `wavSt()`), `zip()` (stored, CRC32) and per-page `.json` patches. Export goes through `window.claude.use('downloads')`; outside claude.ai, the inline local shim at the top of each `<body>` supplies a link-based download. `sample` (Claude calls in Tessel, Speech) resolves to `null` locally, and those pages fall back to built-in rules.
7. **State.** Patches live in `localStorage` under per-page keys (`dac8-patch`, `csg-patch`, `drum-kit`, `noone-rhythm`, `tracker-song`, `regtracker-song`, …), always wrapped in try/catch. `sanitize()` clamps any loaded or pasted patch.

## Visual language

- **Board look:** dark solder-mask green ground (`--mask #0a2218`), cream silkscreen text (`--silk`), gold pads (`--pad #d9b45a`), red LED accent (`--led`), phosphor green traces (`--phos`). A faint 64 px grid in the background.
- **Type:** Saira Stencil One (display) and Azeret Mono (everything else).
- **Blocks are chips:** each control group is a `.chip` with a notch, a gold `U1`, `U2`… designator and a live readout (`em`) on the right.
- **Controls are parts where possible:** resistor sliders snap to E24 values with colour bands, capacitors to E6. Stock values are shown when modded; modded chips get gold borders.
- Pages are deliberately single-theme (dark) and declare `color-scheme:dark`.
- The full PCB treatment (DIP switches, slide pots, IC pins, traces) lives in `experiments/shift-register-pcb.html` if the family moves that way.

## Conventions

- Keep pages single-file. Duplicate small helpers (wav, zip, CRC) rather than adding shared imports, unless the project moves to a build step.
- Engines stay dependency-free and stateful with `next()` so they port straight to C++/JUCE or Faust.
- Use original content only: no game ROMs, no factory samples, no copied schematics or tunes. Presets, demo songs and circuits are original. Name copies descriptively ("SN76477-style"), not with trademarks.
- Formulas are documented approximations (RC rules of thumb, maximal-length LFSRs instead of exact chip taps). Keep the in-page notes honest when changing them.
- After an engine edit, run `tools/check.mjs` and listen to the presets. NaN guards and `tanh` output stages are there on purpose.
- Copy style: short and plain, written from the user's side.

## Known limits

- The noise polynomials in POKEY and TIA are standard sequences, not bit-exact chip taps.
- The Speech Workbench phoneme table is general phonetics, not the SC-01's internal data; intelligibility tuning is unfinished.
- CSG RC formulas are simplified, and the external control voltage to VCO mapping is the roughest part.
- No MIDI input (the artifact sandbox blocked it); locally, Web MIDI could now be added.
- In Wavetable Workbench, loaded audio stays in localStorage and is not part of copied patches.
