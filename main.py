import requests
from datetime import datetime, timedelta
import json
import os

# Print the current working directory to check path issues when run from crontab
print(f"Current working directory: {os.getcwd()}")

api_key = os.getenv('TMDB_API_KEY')
if api_key:
    print("API key loaded successfully.")
else:
    print("Failed to load API key.")

end_date = datetime.today()
start_date = end_date - timedelta(days=12*30)  # Approximation for 12 months
start_date_str = start_date.strftime('%Y-%m-%d')
end_date_str = end_date.strftime('%Y-%m-%d')

url_discover = "https://api.themoviedb.org/3/discover/movie"
url_movie_details = "https://api.themoviedb.org/3/movie/{id}"
params = {
    'api_key': api_key,
    'language': 'en-US',
    'sort_by': 'vote_count.desc',
    'release_date.gte': start_date_str,
    'release_date.lte': end_date_str,
    'vote_average.gte': 6.5,
    'vote_count.gte': 10,
    'with_genres': '99',
    'page': 1,
}

def preserve_user_data(old_data, new_data):
    """
    Preserve user-specific fields when updating movie data
    """
    preserved_fields = {
        'watched': old_data.get('watched', 0),
        'hide_until': old_data.get('hide_until', None),
        'first_discovered': old_data.get('first_discovered') or datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    return {**new_data, **preserved_fields}

json_file_path = 'json_documentaries.json'
if os.path.exists(json_file_path):
    print(f"JSON file path: {os.path.abspath(json_file_path)}")
    with open(json_file_path, 'r') as file:
        movies_data = json.load(file)
        print("Loaded existing JSON file.")
else:
    movies_data = {}
    print(f"JSON file does not exist at {os.path.abspath(json_file_path)}. Creating a new one.")

while True:
    response = requests.get(url_discover, params=params)
    if response.status_code == 200:
        data = response.json()
        print(f"Processing page {params['page']} out of {data['total_pages']}.")
        for movie in data['results']:
            movie_id = str(movie['id'])  # Use string for JSON keys
            
            # Get detailed movie data
            detailed_response = requests.get(url_movie_details.format(id=movie['id']), params={'api_key': api_key})
            detailed_data = detailed_response.json()
            
            # Prepare new movie data
            new_movie_data = {
                'title': movie['title'],
                'poster_path': f"https://image.tmdb.org/t/p/w500/{movie['poster_path']}" if movie['poster_path'] else None,
                'homepage': detailed_data.get('homepage'),
                'imdb_link': f"https://www.imdb.com/title/{detailed_data.get('imdb_id')}/" if detailed_data.get('imdb_id') else None,
                'overview': movie['overview'],
                'release_date': movie['release_date'],
                'vote_average': movie['vote_average'],
                'vote_count': movie['vote_count'],
                'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            }

            # For existing movies, preserve user data
            if movie_id in movies_data:
                new_movie_data = preserve_user_data(movies_data[movie_id], new_movie_data)
                print(f"Updated movie: {movie['title']} (ID: {movie_id}), preserved user preferences")
            else:
                # For new movies, add first_discovered timestamp
                new_movie_data['first_discovered'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                new_movie_data['watched'] = 0
                print(f"Added new movie: {movie['title']} (ID: {movie_id})")
            
            # Update the movies_data dictionary
            movies_data[movie_id] = new_movie_data

    else:
        print(f"Failed to fetch data: HTTP {response.status_code}")

    if params['page'] < data['total_pages']:
        params['page'] += 1
    else:
        break

# Saving the updated movies data back to the JSON file
try:
    with open(json_file_path, 'w') as file:
        json.dump(movies_data, file, indent=2)
        print(f"JSON file '{json_file_path}' has been updated/created on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}.")
except Exception as e:
    print(f"Failed to write to file: {e}")