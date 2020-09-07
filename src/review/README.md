# Description

This tool concatenates all notes that were written on the previous day,
or on a specified day, so that they can be reviewed easily without having the need to switch files.

All files that are not regular files, and that end in .js, .json, .code are ignored and not concatenated.

# Requirements

- ~/.emacs-config.json exists and contains NOTEBOOK_PATH
- Notes are written in the format dirty/2020/06/01. Note that zero padding happens.

# Installation

`node install.js`
