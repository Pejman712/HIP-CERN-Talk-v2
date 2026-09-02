# Robot Mapping and Navigation for Inspection Tasks in CERN Facilities

A clean, single-page web version of the presentation by **Pejman Habibiroudkenar**
(Helsinki Institute of Physics · Aalto University · Tampere University).

- `index.html` — the whole site (HTML + CSS, no build step, no dependencies)
- `assets/img/` — figures extracted from the original slide deck
- `.nojekyll` — tells GitHub Pages to serve the files as-is

The site mirrors the talk's structure — Overview → Our Contribution → SPS Radiation
Survey → Non-Repetitive LiDAR Mapping — with slides 24–33 gathered into an **Appendix**.

## Preview locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Publish on GitHub Pages

1. Create a repository and push these files (keep `index.html` at the repo root).
2. In **Settings → Pages**, set *Source* to the `main` branch, folder `/ (root)`.
3. Your site goes live at `https://<username>.github.io/<repo>/`.

> To serve from a subfolder instead, move these files into `docs/` and choose the sure
> `/docs` folder in the Pages settings.
