# TMDB Sync

DATETIME of last agent review: 09 Mar 2026 08:24 (Europe/London)

## Purpose
Python refresh job pulls documentary metadata from TMDB and merges it into the local JSON catalog without losing user state.

## Key Files
- `main.py` - discover and detail refresh job
- `json_documentaries.json` - merged catalog and user flags
- `cron.log` - captured job output
- `scrap.py` - one-off TMDB response inspection

## Related
- TMDB Discover API `/3/discover/movie`
- TMDB Movie Details API `/3/movie/{id}`
- `ops/UI.md` - consumer of refreshed data

## Agent Commands
```bash
python3 -m py_compile main.py scrap.py
python3 main.py
tail -n 40 cron.log
python3 -m json.tool json_documentaries.json > /dev/null
```

## Notes
- `main.py` preserves `watched`, `hide_until`, and `first_discovered` for existing entries.
- `main.py` reads `TMDB_API_KEY` from the environment; `scrap.py` does not.

## Intentional Behavior
- The refresh window is approximate last-12-months logic via `timedelta(days=12*30)`.
