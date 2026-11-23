# Roadmap and design notes

## Next builds discussed

- **Unified host (the OP-1 comparison).** One shell holding all engines with two layers: a *play layer* (the same 4 macros, a sound-shape visual and shared tape/sequencer for every engine) and a *board layer* (the full workbench). Identity stays "open the hood" and circuit-board, not OP-1 styling.
- **Sequencer in every workbench.** Reuse the Frame Tracker's compiler and driver: patterns, order list, byte-code, per-engine instrument mapping.
- **Provider-agnostic AI layer** for Tessel-style "describe a change": one `propose(patch, request)` interface with providers for Claude (built in), any OpenAI-compatible endpoint (Ollama, LM Studio, LiteLLM on the Vesper Mac Mini) and built-in rules. Use JSON-schema structured output. To reach `vesper.local`, self-host the pages on Vesper's Caddy and proxy `/llm` to LiteLLM on the same origin.
- **More chips:** TI TMS5220 (LPC speech, analyse your own voice), GI SP0256 (allophone speech), OKI MSM5205 (4-bit ADPCM crunch), MOS 6560 VIC, Bally Astrocade (shared master oscillator), Yamaha OPL2 (2-op FM, odd waveforms), Philips SAA1099 (stereo envelopes).

## Plugin port (VST3/AU)

- Recommended route: **JUCE** with the engine ported to C++ (each `next()` is ~100–300 lines). Start with the generic editor, then move the existing HTML into JUCE 8's WebView UI.
- Real-time restructuring: replace render-the-whole-sound engines (DAC-8, Tessel, Speech) with block-based voices driven by MIDI; add polyphony and voice stealing; store wavetables and bit patterns in plugin state.
- **Faust → JUCE** suits the CSG, discrete board and strings; drawable tables are awkward in Faust.
- **Rust nih-plug** gives VST3 and CLAP but no AU.
- Naming: "DAC-8" conflicts with existing audio products, so pick a distinctive brand and run USPTO/EUIPO searches before shipping. One idea: invent fictional part numbers under one owned brand.

## Design directions considered

- *Datasheet × comic print* (CMYK misregistration, halftones, timing diagrams): sketched, not adopted.
- *Culture-inspired / future interface* → **Tessel**: the interface recedes, a touchable sound-form, a possibility-space field, intent with transparent parameter diffs, generated patch glyphs, branching history.
- *Faders* and *full PCB* variants of the shift register, kept in `docs/experiments/`.
- The current family look is the green-board workbench (see CLAUDE.md).

## Published artifacts

Private claude.ai artifacts holding the same pages (useful for sharing from a phone):

| Page | File | Artifact |
|---|---|---|
| Horizon Warden | `docs/games/horizon-warden.html` | https://claude.ai/artifact/TYx5VXCxrg2fcPmqU1K6Xi |
| DAC-8 Workbench | `docs/instruments/dac8-workbench.html` | https://claude.ai/artifact/7yTgAVanLHYZZQ4uxDAzbx |
| CSG Workbench | `docs/instruments/csg-workbench.html` | https://claude.ai/artifact/6vbp3wCkB58ifMD4a51dRp |
| Speech Workbench | `docs/instruments/speech-workbench.html` | https://claude.ai/artifact/MwNnNfcxoT1WfBWSrgBABj |
| Poly Counter Workbench | `docs/instruments/poly-counter-workbench.html` | https://claude.ai/artifact/BKJrjMcKaPv367ab8S6cHp |
| Wavetable Workbench | `docs/instruments/wavetable-workbench.html` | https://claude.ai/artifact/XSAVKkoQvUCrNnLAbKRDYY |
| Scanline Workbench | `docs/instruments/scanline-workbench.html` | https://claude.ai/artifact/2tqf65sDcmmMHZmujADME3 |
| Discrete Board Workbench | `docs/instruments/discrete-board-workbench.html` | https://claude.ai/artifact/JwtvgbSU6Mtm7r6YcDTuj1 |
| Night Circuit Drums | `docs/instruments/night-circuit-drums.html` | https://claude.ai/artifact/P4M4J7AVwyLqCWMJd9Fose |
| No One | `docs/instruments/no-one.html` | https://claude.ai/artifact/8dLy7rjZgX1SZhsLCRd9og |
| Beeper Workbench | `docs/instruments/beeper-workbench.html` | https://claude.ai/artifact/VkXejtXJhNKgDPRep6NeNf |
| Shift Register Workbench | `docs/instruments/shift-register-workbench.html` | https://claude.ai/artifact/3aTm22AWopTxzNrj4RoG9H |
| Divide-Down Strings | `docs/instruments/divide-down-strings.html` | https://claude.ai/artifact/AFXWZFVPkphTNWmfX4Dn3h |
| Frame Tracker | `docs/sequencers/frame-tracker.html` | https://claude.ai/artifact/NUuQZrnFNqPTjAtX5PMzi8 |
| Register Tracker | `docs/sequencers/register-tracker.html` | https://claude.ai/artifact/BdAoT3NTVnLYofSmA6Q9YZ |
| Pair Sequencer | `docs/sequencers/pair-sequencer.html` | https://claude.ai/artifact/8SeJWDuqsgrDBULPuztgLe |
| Tessel | `docs/experiments/tessel.html` | https://claude.ai/artifact/AyVbgd92D3MWxVAMsDpNxd |
| Shift Register Faders | `docs/experiments/shift-register-faders.html` | https://claude.ai/artifact/Xru9mgXP9BTBYEfnQYMnxp |
| Shift Register PCB | `docs/experiments/shift-register-pcb.html` | https://claude.ai/artifact/Df1sJij6broA4XZHwaezNb |
