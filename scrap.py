import os
import sys

import requests


def main() -> int:
    api_key = os.getenv("TMDB_API_KEY")
    if not api_key:
        raise SystemExit("TMDB_API_KEY is required")

    if len(sys.argv) != 2:
        raise SystemExit("Usage: python3 scrap.py <tmdb_movie_id>")

    movie_id = sys.argv[1]
    url = f"https://api.themoviedb.org/3/movie/{movie_id}"
    response = requests.get(url, params={"api_key": api_key}, timeout=30)
    response.raise_for_status()

    for key, value in response.json().items():
        print(f"{key}: {value}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
