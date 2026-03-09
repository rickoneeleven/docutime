# DocuTime

DATETIME of last agent review: 09 Mar 2026 08:24 (Europe/London)

Documentary watchlist site that refreshes TMDB results into a local JSON file and lets users mark titles watched or hidden from the browser.

## Stack
- PHP 7.4 serves `index.php`, `hide_documentary.php`, and `update_documentary_status.php`
- Vanilla JavaScript in `scripts.js` renders cards and calls the PHP endpoints
- Plain CSS in `styles.css` handles the card layout
- Python 3.11 with `requests` runs `main.py` against TMDB
- `json_documentaries.json` stores both fetched metadata and user state
- `cron.log` captures scheduled refresh output and is shown in the UI when nothing is visible

## Quick Start
```bash
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install requests
export TMDB_API_KEY=your_tmdb_key
python3 main.py
php -S 127.0.0.1:8000 -t .
```

Open `http://127.0.0.1:8000/` after the server starts. Stop the PHP server with `Ctrl+C`.

## Configuration
- `TMDB_API_KEY` is required for `main.py`; without it the refresh script logs `Failed to load API key.` and TMDB requests fail.
- `json_documentaries.json` must be writable by both the PHP process and any cron user that runs `main.py`.
- `cron.log` should be writable by the scheduled job if you rely on the fallback log view in the browser.
- `main.py` preserves `watched`, `hide_until`, and `first_discovered` when it refreshes an existing documentary entry.
- `scrap.py` is an ad hoc TMDB inspection script with a hard-coded API key and fixed movie id. Do not use it for scheduled refreshes.

## Common Operations
```bash
tail -n 40 cron.log
python3 main.py
php -l index.php
php -l hide_documentary.php
php -l update_documentary_status.php
python3 -m py_compile main.py scrap.py
python3 -m json.tool json_documentaries.json > /dev/null
```

## Troubleshooting

### The page shows only `cron.log`
The frontend renders the log when every documentary is either watched or still inside `hide_until`, or when the catalog cannot be shown usefully.

Check:
```bash
tail -n 40 cron.log
python3 -m json.tool json_documentaries.json > /dev/null
```

### `main.py` says the API key is missing
Export `TMDB_API_KEY` in the same shell or cron environment before running the script:

```bash
export TMDB_API_KEY=your_tmdb_key
python3 main.py
```

### Hide or watched actions do not persist
Both PHP mutation endpoints write directly to `json_documentaries.json`. Confirm the web server user can write the file and that the JSON is still valid after edits:

```bash
ls -l json_documentaries.json
python3 -m json.tool json_documentaries.json > /dev/null
```

## Links
- Ops awareness docs: `ops/`
