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
                <a href="${doc.imdb_link}" target="_blank">
                    <img src="${doc.poster_path}" alt="${doc.title}">
                </a>
                <h5>${doc.title}</h5>
                <p>${doc.overview}</p>
                <p>Release date: ${doc.release_date}</p>
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
