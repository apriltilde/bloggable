<?php
// Define the path to the directory where files will be saved
$directory = 'bugs/';

// Check if the form has been submitted
if ($_SERVER["REQUEST_METHOD"] == "POST" && !empty($_POST["content"])) {
    // Get the content from the form
    $content = $_POST["content"];
    
    // Create a timestamp for the filename
    $timestamp = date("Ymd_His");
    
    // Define the filename with the timestamp
    $filename = "report_" . $timestamp . ".txt";
    
    // Combine the directory path and filename
    $filepath = $directory . $filename;
    
    // Ensure the directory exists
    if (!is_dir($directory)) {
        mkdir($directory, 0755, true);
    }
    
    // Save the content to the file
    file_put_contents($filepath, $content);
    
    // Display a success message
    echo "<p>Report saved</p>";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/@sakun/system.css">
    <title>Save Content to File</title>
</head>
<style>
body, html {
	margin: 0;
}

body {
	display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100dvh;
}

form {
	display: flex;
    flex-direction: column;
    align-items: center;
}

        textarea {
            width: 100%;
            border: 1px solid #ccc;
            margin-top: 10px;
            box-sizing: border-box;
            resize: none;
            border: 1.5px solid #000;
            font-size: 18px;
            font-family: Chicago_12;
    		padding-left: 5px;
        }
                input:focus,
        select:focus,
        textarea:focus,
        button:focus {
            outline: none;
        }


</style>
<body>
    <h1>Send bug report</h1>
    <form action="bug.php" method="post">
        <textarea id="content" name="content" rows="10" cols="30"></textarea><br><br>
        <input <style = "" class = "btn btn-primary" type="submit" value="Submit">
    </form>
</body>
</html>
