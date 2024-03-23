let localDocumentariesState = {}; // Initial empty state

async function fetchDocumentaries() {
    try {
        const response = await fetch('json_documentaries.json');
        const data = await response.json();
        localDocumentariesState = data; // Update local state with fetched data
        return data;
    } catch (error) {
        console.error("Error fetching documentaries:", error);
        return {};
    }
}

function displayDocumentaries() {
    const container = document.getElementById('documentaries');
    container.innerHTML = ''; // Clear the container

    // Sort documentaries by vote_count in descending order
    const sortedDocumentaries = Object.values(localDocumentariesState).sort((a, b) => b.vote_count - a.vote_count);

    sortedDocumentaries.forEach(doc => {
        if (doc.watched === 0) {
            const docElement = document.createElement('div');
            docElement.classList.add('four', 'columns', 'documentary');
            docElement.innerHTML = `
                <a href="${doc.imdb_link}" target="_blank">
                    <img src="${doc.poster_path}" alt="${doc.title}" title="${doc.title}">
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
    const url = 'update_documentary_status.php'; 

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `title=${encodeURIComponent(title)}`,
        });
        const data = await response.json();
        if (data.success) {
            // Update local state to reflect watched status
            const docToUpdate = Object.values(localDocumentariesState).find(doc => doc.title === title);
            if (docToUpdate) {
                docToUpdate.watched = 1; // Mark as watched in local state
            }
            displayDocumentaries(); // Refresh the display using updated local state
        }
    } catch (error) {
        console.error("Error marking documentary as watched:", error);
    }
}

// Initial display
fetchDocumentaries().then(displayDocumentaries); // Ensure local state is populated before display
