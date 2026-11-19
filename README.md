# Retro Sound Lab

Playable browser instruments modelled on early sound chips and circuits (SN76477, POKEY, TIA, Ensoniq DOC, Odyssey² register, 1-bit beepers, discrete arcade boards, divide-down string machines), plus byte-code music sequencers.

```sh
python3 -m http.server 8000
# open http://localhost:8000/
```

Every page is one self-contained HTML file using the Web Audio API. Start with `index.html`. See `CLAUDE.md` for architecture and conventions and `docs/ROADMAP.md` for what's next.

All circuits, presets, songs and artwork are original; no ROMs or samples from any game or instrument are included.
