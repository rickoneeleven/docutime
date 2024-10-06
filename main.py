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
            if movie_id not in movies_data or (movie_id in movies_data and movies_data[movie_id].get('watched', 0) == 0):
                detailed_response = requests.get(url_movie_details.format(id=movie['id']), params={'api_key': api_key})
                detailed_data = detailed_response.json()
                
                # Check if this is a new movie
                is_new_movie = movie_id not in movies_data
                
                movies_data[movie_id] = {
                    'title': movie['title'],
                    'poster_path': f"https://image.tmdb.org/t/p/w500/{movie['poster_path']}" if movie['poster_path'] else None,
                    'homepage': detailed_data.get('homepage'),
                    'imdb_link': f"https://www.imdb.com/title/{detailed_data.get('imdb_id')}/" if detailed_data.get('imdb_id') else None,
                    'overview': movie['overview'],
                    'release_date': movie['release_date'],
                    'vote_average': movie['vote_average'],
                    'vote_count': movie['vote_count'],
                    'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    'watched': movies_data[movie_id]['watched'] if movie_id in movies_data else 0,
                }
                
                # Add first_discovered field only for new movies
                if is_new_movie:
                    movies_data[movie_id]['first_discovered'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                
                print(f"{'Added' if is_new_movie else 'Updated'} movie: {movie['title']} (ID: {movie_id})")
            else:
                print(f"Skipped updating details for watched movie: {movie['title']} (ID: {movie_id})")
                movies_data[movie_id]['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
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