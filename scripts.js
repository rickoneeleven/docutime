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

function isDocumentaryVisible(doc) {
    // If there's no hide_until date, the documentary is visible
    if (!doc.hide_until) {
        return true;
    }

    // Compare hide_until date with current date
    const hideUntil = new Date(doc.hide_until);
    const now = new Date();
    return now > hideUntil;
}

function displayDocumentaries() {
    const container = document.getElementById('documentaries');
    container.innerHTML = ''; // Clear the container

    const sortedDocumentaries = Object.values(localDocumentariesState).sort((a, b) => b.vote_count - a.vote_count);

    sortedDocumentaries.forEach(doc => {
        // Only display if documentary is not watched and is not currently hidden
        if (doc.watched === 0 && isDocumentaryVisible(doc)) {
            const docElement = document.createElement('div');
            docElement.classList.add('four', 'columns', 'documentary');

            // Extract the year from the release_date
            const year = new Date(doc.release_date).getFullYear();

            // Round the vote_average to the nearest full number and append /10
            const voteAverageRounded = Math.round(doc.vote_average);

            const docId = Object.keys(localDocumentariesState).find(key => localDocumentariesState[key].title === doc.title);

            // Create the previously hidden message if applicable
            let previouslyHiddenMessage = '';
            if (doc.hide_until && isDocumentaryVisible(doc)) {
                previouslyHiddenMessage = `
                    <p style="color: red;">This documentary had previously been hidden until: ${doc.hide_until}</p>
                `;
            }

            docElement.innerHTML = `
                <a href="https://www.google.com/search?q=${encodeURIComponent(doc.title)}+trailer" target="_blank">
                    <img src="${doc.poster_path}" alt="${doc.title}" title="${doc.title} (${voteAverageRounded}/10) - ${year}">      
                </a>
                <h5>
                    ${doc.title} (${voteAverageRounded}/10) - ${year}
                    <a href="#" onclick="hideDocumentary('${docId}'); return false;" class="hide-link">hide for 3 months</a>
                </h5>
                <p>${doc.overview}</p>
                ${previouslyHiddenMessage}
                <p>last updated: ${doc.last_updated}</p>
                <button class="button button-primary watched-btn" onclick="markAsWatched('${docId}')">Mark as Watched</button>
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

async function hideDocumentary(id) {
    const url = 'hide_documentary.php';

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
            // Update local state with new hide_until date
            if (localDocumentariesState[id]) {
                localDocumentariesState[id].hide_until = data.hide_until;
            }
            displayDocumentaries(); // Refresh the display
        } else {
            console.error("Error hiding documentary:", data.error);
        }
    } catch (error) {
        console.error("Error hiding documentary:", error);
    }
}

// Initial display
fetchDocumentaries().then(displayDocumentaries); // Ensure local state is populated before display