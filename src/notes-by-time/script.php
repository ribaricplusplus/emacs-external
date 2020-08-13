<?php

/**
 * Fills $arr with paths that satisfy $conditions,
 * Namely, the paths that are made since the date specified in conditions.
 * */
function traverse_notes(array &$arr, int $current_depth, int $max_depth, Directory $entry, array $conditions, bool $pass){
    if ($current_depth === $max_depth) {
        while(($subdirectory = $entry->read()) !== false){
            if ($subdirectory === "." || $subdirectory === "..") continue;
            $condition_pass = (int)$subdirectory >= (int)$conditions[$current_depth];
            if (is_dir($entry->path . "/" . $subdirectory)){
                if ($pass || $condition_pass) {
                    array_push($arr, $entry->path . "/" . $subdirectory);
                }
            }
        }
    } else {
        while(($subdirectory = $entry->read()) !== false){
            if ($subdirectory === "." || $subdirectory === "..") continue;
            $condition_equal = (int)$subdirectory === (int)$conditions[$current_depth];
            $condition_positive = (int)$subdirectory > (int)$conditions[$current_depth];
            if (is_dir($entry->path . "/" . $subdirectory)){
                if ($pass || $condition_positive || $condition_equal){
                    $new_pass = $condition_positive || $pass ? true : false;
                    $new_entry = dir($entry->path . "/" . $subdirectory);
                    traverse_notes($arr, $current_depth+1, $max_depth, $new_entry, $conditions, $new_pass);
                    $new_entry->close();
                }
            }
        }
    }
}

/**
 * $conditions is an array of the form [year, month, day], and the index denotes which of those
 * components must match
 */
function satisfies_condition($path, $conditions, $index){
    return ((int)basename($path)) >= $conditions[$index];
}

function print_dir_contents(string $dir){
    $dir_instance = dir($dir);
    while(($entry = $dir_instance->read()) !== false){
        if ($entry === "." || $entry === "..") continue;
        echo $entry . "\n";
    }
    $dir_instance->close();
}

function concatenate_notes(array $valid_paths){
    foreach($valid_paths as $path){
        echo ">>>>>>>>>>>>>>>>>>>>" . $path . "<<<<<<<<<<<<<<<<<<<<\n";
        $entry = dir($path);
        while(($subentry = $entry->read()) !== false){
            if (is_file($entry->path . "/" . $subentry)){
                echo $subentry . "\n";
                echo "==================================================\n";
                echo file_get_contents($entry->path . "/" . $subentry);
                echo "\n\n\n";
            }
        }
        $entry->close();
    }
}

function print_entries(array $valid_paths){
    foreach($valid_paths as $path){
        $entry = dir($path);
        echo ">>>>>>>>>>>>>>>>>>>>" . $path . "<<<<<<<<<<<<<<<<<<<<\n";
        while (($subentry = $entry->read()) !== false){
            if ($subentry === "." || $subentry === "..") continue;
            echo $subentry . "\n";
        }
        $entry->close();
    }
}

// From valid path extracts substring denoting date and sorts by that
function sort_by_date(array &$valid_paths){
    usort($valid_paths, function ($path1, $path2) {
        $components1 = explode("/", substr($path1, -10));
        $components2 = explode("/", substr($path2, -10));
        for($i = 0; $i < 3; ++$i){
            if ((int)$components1[$i] > (int)$components2[$i]){
                return 1;
            } else if ((int)$components1[$i] < (int)$components2[$i]){
                return -1;
            }
        }
        return 0;
    });
}

$home = getenv("HOME");
$config_contents = file_get_contents($home . "/.emacs-config.json");
$config = json_decode($config_contents, true);
define("NOTEBOOK_PATH", $config["NOTEBOOK_PATH"] . "/dirty");
$args = getopt("s:c");
$since = (new DateTime())->sub(new DateInterval("P" . $args["s"] . "D"));
$since_array_strings = explode("/", $since->format("Y/m/d"));
$since_array = array_map(function ($elem) {
    return (int)$elem;
}, $since_array_strings);
$valid_paths = [];
$root_directory = dir(NOTEBOOK_PATH);
traverse_notes($valid_paths, 0, 2, $root_directory, $since_array, false);
sort_by_date($valid_paths);
$root_directory->close();
if (array_key_exists("c", $args)){
    concatenate_notes($valid_paths);
} else {
    print_entries($valid_paths);
}
