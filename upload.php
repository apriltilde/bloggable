<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $urls = [];

    // Enable error reporting for debugging
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    if (isset($_FILES['fileToUpload']) && is_array($_FILES['fileToUpload']['tmp_name'])) {
        foreach ($_FILES['fileToUpload']['tmp_name'] as $index => $tmpName) {
            if (!is_uploaded_file($tmpName)) {
                echo json_encode(['error' => 'Failed to upload file']);
                exit;
            }

            // Move the file to a temporary location
            $uploadFilePath = tempnam(sys_get_temp_dir(), 'upload_') . '.jpg';
            move_uploaded_file($tmpName, $uploadFilePath);

            // Prepare the curl command
            $command = "curl -F 'reqtype=fileupload' -F 'fileToUpload=@{$uploadFilePath}' https://catbox.moe/user/api.php";

            // Execute the command and capture the output
            $response = shell_exec($command);

            // Remove the temporary file
            unlink($uploadFilePath);

            if ($response) {
                $urls[] = trim($response);
            } else {
                echo json_encode(['error' => 'Failed to receive a response from Catbox.moe']);
                exit;
            }
        }

        // Return the URLs as JSON
        echo json_encode(['urls' => $urls]);
    } else {
        echo json_encode(['error' => 'No files provided for upload']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
