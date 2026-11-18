# themindful.nl → Company of One (site `home`)

Rebuilt copy of www.themindful.nl (EN + NL), ready to upload to Company of One.

- `site/` — the upload copy: 104 pages (`**/index.html`), `assets/site.css`, `assets/site.js`, `assets/fonts/*.woff2`, `co1-app.json` (10 forms), icons, favicon, manifest, PDFs.
- Pictures are **not** here: all 106 are in the Company of One media library and already placed in site `home`, version `b46d4533c845f59a174fdd6f995a1a7a`. `scripts/media-library-map.json` maps each site path to its library id.
- `scripts/` — `build.py` and `shrink.py` that made `site/` from the live site (see `management/move-in/themindful-kit.md` in the office for the steps).

## To finish
1. Upload everything in `site/` to site `home` with `base` = `b46d4533c845f59a174fdd6f995a1a7a`, and remove the old placeholder `assets/style.css`.
2. Check the preview against the live site (desktop + phone).
3. Propose `site_publish` for that version. The owner's yes puts it live.

Blocked on step 1: `deploy_site` takes file bodies only inline (~3.2 MB here), so it needs a bulk upload path from the Company of One team.
