<?php
header('Content-Type: application/json');

// Get the JSON file path
$jsonFilePath = 'json_documentaries.json';

// Validate that the request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

// Get the documentary ID from the POST data
$id = isset($_POST['id']) ? $_POST['id'] : null;

if (!$id) {
    echo json_encode(['success' => false, 'error' => 'No ID provided']);
    exit;
}

// Try to read the JSON file
try {
    if (!file_exists($jsonFilePath)) {
        throw new Exception('JSON file not found');
    }
    
    $jsonContent = file_get_contents($jsonFilePath);
    if ($jsonContent === false) {
        throw new Exception('Failed to read JSON file');
    }
    
    $data = json_decode($jsonContent, true);
    if ($data === null) {
        throw new Exception('Failed to parse JSON data');
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}

// Check if the documentary exists
if (!isset($data[$id])) {
    echo json_encode(['success' => false, 'error' => 'Documentary not found']);
    exit;
}

// Calculate the date 3 months from now
$hideUntil = date('Y-m-d H:i:s', strtotime('+3 months'));

// Update the hide_until field
$data[$id]['hide_until'] = $hideUntil;

// Try to write the updated data back to the file
try {
    $result = file_put_contents($jsonFilePath, json_encode($data, JSON_PRETTY_PRINT));
    if ($result === false) {
        throw new Exception('Failed to write to JSON file');
    }
    
    echo json_encode([
        'success' => true,
        'hide_until' => $hideUntil
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}