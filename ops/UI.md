# Web UI

DATETIME of last agent review: 09 Mar 2026 08:24 (Europe/London)

## Purpose
Browser UI lists visible documentaries and posts watched or hide state changes back to JSON-backed PHP endpoints.

## Key Files
- `index.php` - no-cache page shell
- `scripts.js` - fetch, render, hide, watched logic
- `styles.css` - card layout styling
- `hide_documentary.php` - sets `hide_until`
- `update_documentary_status.php` - sets `watched`

## Related
- `json_documentaries.json` - shared documentary state
- `cron.log` - fallback content when nothing is visible
- `ops/TMDB_SYNC.md` - upstream refresh job

## Agent Commands
```bash
php -l index.php
php -l hide_documentary.php
php -l update_documentary_status.php
php -S 127.0.0.1:8000 -t .
curl -I http://127.0.0.1:8000/
```

## Notes
- `scripts.js` sorts visible cards by `vote_count` descending.
- When no cards qualify, the browser fetches and renders `cron.log` directly.
- Card actions use the JSON entry key carried through render, so duplicate titles do not post the wrong id.
