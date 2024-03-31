<?php
$jsonFilePath = 'json_documentaries.json';
$data = json_decode(file_get_contents($jsonFilePath), true);

$id = $_POST['id']; // The id is received from the fetch call

if (isset($data[$id])) {
    $data[$id]['watched'] = 1;
}

file_put_contents($jsonFilePath, json_encode($data, JSON_PRETTY_PRINT)); // Save back to the file

echo json_encode(['success' => true]); // Response back to the frontend
?>