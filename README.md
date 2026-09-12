# Zelda Progression Tracker

Fan site for Anthony’s **final Switch → Switch 2 Zelda path**: numbered hero progression (1→10), Reddit-style verdict board, skip & later buckets, plus demoted chronology and connections.

Pure static HTML/CSS/JS — no build step. Progress is stored in `localStorage` under key **`zelda-progression-v2`**.

## Local preview

Open `index.html` in a browser, or serve the folder:

```bash
cd zelda-progression
python3 -m http.server 8080
# → http://localhost:8080
```

## Your final path (hero 1–10)

**Now on Switch**

1. A Link to the Past — SNES Classics — PLAY  
2. Minish Cap — GBA Classics — optional but worthwhile (Recommended)  
3. Skyward Sword HD — Switch — Essential-ish  

**Switch 2**

4. Link’s Awakening remake — Switch 2 enhanced — PLAY  
5. Ocarina of Time — Switch 2 remake (Nov 5, 2026) — ESSENTIAL · WAIT  
6. Majora’s Mask — N64 Classics — PLAY  
7. Wind Waker — GameCube Classics — ESSENTIAL  
8. Twilight Princess — wait/revisit availability — ESSENTIAL but blocked  
9. Breath of the Wild — Switch 2 Edition — ESSENTIAL  
10. Tears of the Kingdom — Switch 2 Edition — ESSENTIAL (immediately after BotW)

## Sections

- **Path** — vertical numbered flow with checklist (only 1–10 count toward hero %)  
- **Verdicts** — full series board with filters (All / Essential+Play / Skip / Optional)  
- **Skip & later** — hard skips · only if hooked · worth it later (EoW, ALBW)  
- **Timeline** / **Connections** — context, demoted below the path & verdicts  

## Deploy on Railway

This repo includes a `Dockerfile` that runs **nginx:alpine**, writing a config that listens on **`$PORT`** (Railway injects `PORT`).

```bash
# From this directory
railway up
# or connect the GitHub repo and set Dockerfile builder
```

`railway.toml` points the builder at `Dockerfile`. Health check: `/`.

## Brand

- Ink `#0B140C` · Forest `#1B5E20` · Triforce gold `#D4AF37` · Cream text  
- Headings: **Cinzel** · Body: **Source Sans 3** (Google Fonts)

## Disclaimer

Fan project — **not affiliated with Nintendo**. The Legend of Zelda and related marks are trademarks of Nintendo.
