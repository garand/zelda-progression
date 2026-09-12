# Zelda Progression Tracker

Polished fan site for Anthony’s curated **Switch → Switch 2** Zelda play order: interactive checklist, official chronology visual, and connected pairs.

Pure static HTML/CSS/JS — no build step. Progress is stored in `localStorage` under key **`zelda-progression-v1`**.

## Local preview

Open `index.html` in a browser, or serve the folder:

```bash
cd zelda-progression
python3 -m http.server 8080
# → http://localhost:8080
```

## Hero path (recommended order)

**Phase 1 — Now on Switch**

1. A Link to the Past (SNES NSO) — play  
2. The Minish Cap (GBA NSO+) — recommended optional  
3. Skyward Sword HD — essential-ish  

**Phase 2 — Switch 2**

4. Link’s Awakening remake (enhanced) — play  
5. Ocarina of Time Switch 2 remake (Nov 5, 2026) — essential · WAIT  
6. Majora’s Mask (N64 Classics) — play  
7. Wind Waker (GameCube Classics) — essential  
8. Twilight Princess — essential but blocked (no Switch release yet)  
9. Breath of the Wild Switch 2 Edition — essential  
10. Tears of the Kingdom Switch 2 Edition — essential (right after BotW)

Plus a Later/Optional section (Oracles, Echoes of Wisdom, Zelda I/II, multiplayer skips, DS titles, ALBW).

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
