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

    const sortedDocumentaries = Object.values(localDocumentariesState).sort((a, b) => b.vote_count - a.vote_count);

    sortedDocumentaries.forEach(doc => {
        if (doc.watched === 0) {
            const docElement = document.createElement('div');
            docElement.classList.add('four', 'columns', 'documentary');

            // Extract the year from the release_date
            const year = new Date(doc.release_date).getFullYear();

            // Round the vote_average to the nearest full number and append /10
            const voteAverageRounded = Math.round(doc.vote_average);

            docElement.innerHTML = `
                <a href="${doc.imdb_link}" target="_blank">
                    <img src="${doc.poster_path}" alt="${doc.title}" title="${doc.title} (${voteAverageRounded}/10) - ${year}">
                </a>
                <h5>${doc.title} (${voteAverageRounded}/10) - ${year}</h5>
                <p>${doc.overview}</p>
                <button class="button button-primary watched-btn" onclick="markAsWatched('${Object.keys(localDocumentariesState).find(key => localDocumentariesState[key].title === doc.title)}')">Mark as Watched</button>
            `;
            container.appendChild(docElement);
        }
    });
}


async function markAsWatched(id) {
    const url = 'update_documentary_status.php'; 

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${encodeURIComponent(id)}`,
        });
        const data = await response.json();
        if (data.success) {
            // Update local state to reflect watched status
            if (localDocumentariesState[id]) {
                localDocumentariesState[id].watched = 1; // Mark as watched in local state
            }
            displayDocumentaries(); // Refresh the display using updated local state
        }
    } catch (error) {
        console.error("Error marking documentary as watched:", error);
    }
}

// Initial display
fetchDocumentaries().then(displayDocumentaries); // Ensure local state is populated before display
