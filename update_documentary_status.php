<?php
// Assuming your JSON file is in the same directory and named 'json_documentaries.json'
$jsonFilePath = 'json_documentaries.json';
$data = json_decode(file_get_contents($jsonFilePath), true);

$title = $_POST['title']; // The title is received from the fetch call

foreach ($data as &$doc) {
    if ($doc['title'] === $title) {
        $doc['watched'] = 1;
        break; // Stop the loop once the documentary is found and updated
    }
}

file_put_contents($jsonFilePath, json_encode($data, JSON_PRETTY_PRINT)); // Save back to the file

echo json_encode(['success' => true]); // Response back to the frontend