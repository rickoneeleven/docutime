let localDocumentariesState = {};

async function fetchCronLog() {
    try {
        const response = await fetch('cron.log');
        const text = await response.text();
        // Split by newlines, reverse the array, then rejoin
        return text.split('\n').reverse().join('\n');
    } catch (error) {
        console.error("Error fetching cron log:", error);
        return "Error loading cron.log";
    }
}

async function fetchDocumentaries() {
    try {
        const response = await fetch('json_documentaries.json');
        const data = await response.json();
        localDocumentariesState = data;
        return data;
    } catch (error) {
        console.error("Error fetching documentaries:", error);
        return {};
    }
}

function isDocumentaryVisible(doc) {
    if (!doc.hide_until) return true;
    const hideUntil = new Date(doc.hide_until);
    const now = new Date();
    return now > hideUntil;
}

async function displayDocumentaries() {
    const container = document.getElementById('documentaries');
    const cronLogDiv = document.getElementById('cronLog');
    container.innerHTML = '';

    const visibleDocs = Object.values(localDocumentariesState)
        .filter(doc => doc.watched === 0 && isDocumentaryVisible(doc))
        .sort((a, b) => b.vote_count - a.vote_count);

    if (visibleDocs.length === 0) {
        container.style.display = 'none';
        cronLogDiv.style.display = 'block';
        const logContent = await fetchCronLog();
        cronLogDiv.innerHTML = `<pre>${logContent}</pre>`;
        return;
    }

    container.style.display = 'flex';
    cronLogDiv.style.display = 'none';

    visibleDocs.forEach(doc => {
        const docElement = document.createElement('div');
        docElement.classList.add('four', 'columns', 'documentary');
        const year = new Date(doc.release_date).getFullYear();
        const voteAverageRounded = Math.round(doc.vote_average);
        const docId = Object.keys(localDocumentariesState).find(key => localDocumentariesState[key].title === doc.title);
        const previouslyHiddenMessage = doc.hide_until && isDocumentaryVisible(doc) 
            ? `<p style="color: red;">This documentary had previously been hidden until: ${doc.hide_until}</p>` 
            : '';

        docElement.innerHTML = `
            <a href="https://www.google.com/search?q=${encodeURIComponent(doc.title)}+trailer" target="_blank">
                <img src="${doc.poster_path}" alt="${doc.title}" title="${doc.title} (${voteAverageRounded}/10) - ${year}">      
            </a>
            <h5>
                ${doc.title} (${voteAverageRounded}/10) - ${year}
                <a href="#" onclick="hideDocumentary('${docId}'); return false;" class="hide-link">hide for 3 months</a>
                <a href="https://thepiratebay.org/search.php?q=${encodeURIComponent(doc.title)}&cat=0" target="_blank" class="hide-link">search</a>
            </h5>
            <p>${doc.overview}</p>
            ${previouslyHiddenMessage}
            <p>last updated: ${doc.last_updated}</p>
            <button class="button button-primary watched-btn" onclick="markAsWatched('${docId}')">Mark as Watched</button>
        `;
        container.appendChild(docElement);
    });
}

async function markAsWatched(id) {
    try {
        const response = await fetch('update_documentary_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${encodeURIComponent(id)}`
        });
        const data = await response.json();
        if (data.success) {
            localDocumentariesState[id].watched = 1;
            displayDocumentaries();
        }
    } catch (error) {
        console.error("Error marking documentary as watched:", error);
    }
}

async function hideDocumentary(id) {
    try {
        const response = await fetch('hide_documentary.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${encodeURIComponent(id)}`
        });
        const data = await response.json();
        if (data.success) {
            localDocumentariesState[id].hide_until = data.hide_until;
            displayDocumentaries();
        } else {
            console.error("Error hiding documentary:", data.error);
        }
    } catch (error) {
        console.error("Error hiding documentary:", error);
    }
}

fetchDocumentaries().then(displayDocumentaries);