# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is
This repository is primarily a **static documentation website** (deployed via GitHub Pages) plus a standalone Python data-analysis script. There is **no backend service** — the PHP/MySQL architecture described in `OPL_AI_Feedback_Vibe_Coding_Blueprint_V2.md` is an aspirational design blueprint, not implemented code.

Runnable pieces:
- **Static site (the app):** `index.html` is the project hub. It links to `OPL_AI_Feedback_UIUX_DesignSpec.html` (interactive UI/UX design spec with a chat mockup and copy-to-clipboard prompt boxes) and to diagram/doc assets (`.svg`, `.png`, `.drawio`, `.xlsx`, `.md`). No build step — plain HTML/CSS/JS with Bootstrap/FontAwesome/Google Fonts loaded from CDNs.
- **Python script:** `main02.py` uses `pandas` for an OEE calculation.

### Running the site (dev)
Serve the repo root over HTTP (opening `file://` breaks some relative asset links and CDN behavior):

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`. Python 3 is preinstalled; the static site needs no dependencies. Live CDN assets require network egress.

### Python script caveat
`main02.py` reads `NS Loss Analysis OEE FY25.csv`, which is **not committed to the repo**. Running it will fail with `FileNotFoundError` until you supply that CSV in the working directory. This is a missing-data limitation, not an environment problem — `pandas` is installed by the update script.

### Lint / test / build
There is **no linter, test suite, build step, or CI** configured in this repo. "Building" the site is a no-op (static files). The only automated check that makes sense is a Python syntax check, e.g. `python3 -m py_compile main02.py`.
