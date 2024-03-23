import requests
from datetime import datetime, timedelta

api_key = 'ace52aaa504f959c46c6888da82f56b5'

    # Movie ID for "The Bloody Hundredth"
movie_id = '84334'

# URL for the movie endpoint
url = f"https://api.themoviedb.org/3/movie/{movie_id}"

# Query parameters
params = {
    'api_key': api_key,
}

response = requests.get(url, params=params)
data = response.json()

# Print all the parameters it returns
for key, value in data.items():
    print(f"{key}: {value}")