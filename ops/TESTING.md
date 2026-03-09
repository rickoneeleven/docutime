# Repo Testing

DATETIME of last agent review: 09 Mar 2026 08:24 (Europe/London)

## Purpose
Fast validation commands for the PHP endpoints, Python sync scripts, and the persisted JSON dataset.

## Test Commands
- `php -l index.php` - page shell syntax
- `php -l hide_documentary.php` - hide endpoint syntax
- `php -l update_documentary_status.php` - watched endpoint syntax
- `python3 -m py_compile main.py scrap.py` - Python syntax check
- `python3 -m json.tool json_documentaries.json > /dev/null` - catalog validity
- `php -S 127.0.0.1:8000 -t .` then `curl -I http://127.0.0.1:8000/` - manual HTTP smoke

## Key Test Files
- `index.php` - HTML shell and cache headers
- `hide_documentary.php` - hide mutation path
- `update_documentary_status.php` - watched mutation path
- `main.py` - TMDB refresh logic
- `json_documentaries.json` - persisted data file

## Coverage Scope
- PHP syntax for all request handlers
- Python syntax for the refresh scripts
- JSON file integrity
- Manual root-page smoke check

## Agent Testing Protocol
**MANDATORY:** Run the relevant commands after every change.
- Use the smallest matching set for narrow edits and the full list after cross-cutting changes.
- If a check fails, fix it before ending the task.

## Notes
- No dedicated automated unit or integration suite exists in this repo yet.
