# Notes by time

Script to show all notes from a given time period.

# Usage

## Synopsis

`php script.php -s N [-c]`

By default, only the titles of note documents are printed to standard output.

## Requirements

- File `~/.emacs-config.json` exists and has entry "NOTEBOOK_PATH", an absolute path to the Notebook.
- Notebook has subdirectory "dirty" (dirty in the "there is no structure to this" sense).
- Notes within the "dirty" subdirectory are structured as `NOTEBOOK_PATH/dirty/2020/08/11/notes.txt`. The important thing is the YYYY-MM-DD directory tree.

## Options

`-s N`

Since N. Show all notes written since N days before today.

`-c`

Instead of printing just the titles, also concatenate the contents of all notes.

# Todo

- Make installation script