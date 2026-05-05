<?php
header('Content-Type: application/json');

$apiKey = "6d207e02198a847aa98d0a2a901485a5";

if (!isset($_FILES['fileToUpload'])) {
    echo json_encode([
        'error' => 'No file received',
        'files' => $_FILES
    ]);
    exit;
}

$files = $_FILES['fileToUpload'];

$urls = [];
$debug = [];

$ch = curl_init("https://freeimage.host/api/1/upload");

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
]);

for ($i = 0; $i < count($files['tmp_name']); $i++) {

    $tmpName = $files['tmp_name'][$i];

    // 🔴 Check upload validity
    if (empty($tmpName) || !is_uploaded_file($tmpName)) {
        $debug[] = [
            "index" => $i,
            "error" => "Invalid or missing uploaded file",
            "tmp_name" => $tmpName,
            "name" => $files['name'][$i] ?? null
        ];
        continue;
    }

    curl_setopt($ch, CURLOPT_POSTFIELDS, [
        "key" => $apiKey,
        "source" => new CURLFile(
            $tmpName,
            $files['type'][$i] ?? "image/jpeg",
            $files['name'][$i] ?? "upload.jpg"
        )
    ]);

    $response = curl_exec($ch);

    // 🔴 CURL error
    if ($response === false) {
        $debug[] = [
            "index" => $i,
            "curl_error" => curl_error($ch)
        ];
        continue;
    }

    $data = json_decode($response, true);

    // 🔴 API error response
    if (!isset($data['image']['url'])) {
        $debug[] = [
            "index" => $i,
            "error" => "Upload failed",
            "raw_response" => $data
        ];
        continue;
    }

    $urls[] = $data['image']['url'];

    $debug[] = [
        "index" => $i,
        "success" => true,
        "url" => $data['image']['url']
    ];
}

curl_close($ch);

// 🔥 Final response with full debug info
echo json_encode([
    "urls" => $urls,
    "debug" => $debug
], JSON_PRETTY_PRINT);
