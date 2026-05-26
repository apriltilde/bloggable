<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$file = "users.txt";

$ref = trim($_POST["ref"] ?? "");

if ($ref === "") {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Missing ref"
    ]);

    exit();
}

if (!file_exists($file)) {
    file_put_contents($file, "");
}

$existing = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

if (!in_array($ref, $existing)) {

    file_put_contents(
        $file,
        $ref . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );

    echo json_encode([
        "success" => true,
        "message" => "Saved"
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Duplicate"
    ]);
}
?>
