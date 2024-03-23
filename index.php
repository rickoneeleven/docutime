<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentaggries To Watch</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.min.css">
    <style>
        .container {
            margin-top: 50px;
        }
        .documentary {
            margin-bottom: 30px;
        }
        .documentary img {
            max-width: 100%;
            height: auto;
        }
        .watched-btn {
            cursor: pointer;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="documentaries" class="row"></div>
    </div>

    <script>
        async function fetchDocumentaries() {
            try {
                const response = await fetch('json_documentaries.json');
                const data = await response.json();
                return data;
            } catch (error) {
                console.error("Error fetching documentaries:", error);
                return {};
            }
        }

        async function displayDocumentaries() {
            const documentaries = await fetchDocumentaries();
            const container = document.getElementById('documentaries');
            container.innerHTML = ''; // Clear the container

            Object.values(documentaries).forEach(doc => {
                if (doc.watched === 0) {
                    const docElement = document.createElement('div');
                    docElement.classList.add('four', 'columns', 'documentary');
                    docElement.innerHTML = `
                        <img src="${doc.poster_path}" alt="${doc.title}">
                        <h5>${doc.title}</h5>
                        <p>${doc.overview}</p>
                        <p>Release date: ${doc.release_date}</p>
                        <a href="${doc.imdb_link}" target="_blank" class="button button-primary">IMDB</a>
                        <button class="button button-primary watched-btn" onclick="markAsWatched('${doc.title}')">Mark as Watched</button>
                    `;
                    container.appendChild(docElement);
                }
            });
        }

        async function markAsWatched(title) {
            const url = 'update_documentary_status.php'; // Confirm this is the correct URL
            console.log('URL:', url); // Output the URL being used for the fetch call
            console.log('Title:', title); // Output the title to ensure it's correct

            try {
                const response = await fetch(url, { // Make sure 'url' is a valid string, not null or undefined
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `title=${encodeURIComponent(title)}`,
                });
                console.log('Fetch request sent to:', response.url); // Output the URL the request was sent to
                const data = await response.json();
                console.log('Response received:', data); // Output the data received from the server
                if (data.success) {
                    displayDocumentaries(); // Refresh the display if update was successful
                }
            } catch (error) {
                console.error("Error marking documentary as watched:", error);
                console.log('Fetch request failed for:', url); // Output the URL that failed
            }
        }

// Initial display
displayDocumentaries();

    </script>
</body>
</html>