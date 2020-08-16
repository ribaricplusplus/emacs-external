<?php
function sort_by_time($a, $b){
    return $a[0] - $b[0];
}
$home = getenv("HOME");
if (!$home){
    echo "HOME environment variable not found.\n";
    exit(1);
}
$config_contents = file_get_contents($home . "/.emacs-config.json");
if ($config_contents === false) {
    echo "Could not read ~/.emacs-config.json.\n";
    exit(1);
}
$config = json_decode($config_contents, true);
define("NOTEBOOK_PATH", $config["NOTEBOOK_PATH"]);
$files = shell_exec("find " . NOTEBOOK_PATH . " -type f -iname 'videos.*' -or -iname 'video.*'");
$files_array = explode("\n", $files);

// Array of arrays, associating access times with path names
$arr = [];
foreach ($files_array as $file){
    if ($file === "") {
        continue;
    }
    $metadata = stat($file);
    if ($metadata === false) {
        echo "Failed to stat file.\n";
        var_dump($metadata);
        exit(1);
    }
    $modification_time = $metadata["mtime"];
    array_push($arr, [$modification_time, $file]);
}
usort($arr, "sort_by_time"); // From oldest to newest
$arr_length = count($arr);
for($i = $arr_length - 1; $i >= 0; --$i){
    $file = $arr[$i][1];
    $contents = file_get_contents($file);
    echo $file . "\n";
    echo "==================================================\n";
    echo $contents;
    echo "\n\n\n";
}
