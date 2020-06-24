const fs = require('fs')
const child_process = require('child_process')
const path = require('path')

function subprocessFailedExit(message, error, details){
  console.error(message)
  console.error(error)
  console.error('Received user input: ', process.argv[2])
  console.error('Exit code:', details?.status)
  console.error('Error: ', details?.error)
  process.exit(1)
}

const HOME = process.env.HOME
const CONFIG_NAME = '.emacs-config.json'
const configString = fs.readFileSync(path.join(HOME, CONFIG_NAME), {encoding: 'utf8'})
let config
try {
   config = JSON.parse(configString)  
} catch (err) {
  console.error(err)
  process.exit(1)
}

const NOTEBOOK_PATH = config.NOTEBOOK_ROOT
if (NOTEBOOK_PATH === undefined){
  console.error('Invalid notebook path.')
  process.exit(1)
}
// Exclude .zim files and everything in .git directory. Other than that, search all notebook files.
const STANDARD_FIND_ARGS = [NOTEBOOK_PATH, '-not', '-iregex', '.*zim$', '-and', '-not', '-iregex', '.*?git/.*', '-and', '-not', '-iregex', '.*\\.code$', '-and', '-type', 'f', '-print']

// Find all matching files
if (process.argv[2] === undefined){
  console.error('No argument for searching has been received. Pass a regular expression that will be forwarded to grep.')
  process.exit(1)
}

const findResults = child_process.spawnSync('find', STANDARD_FIND_ARGS, {encoding: 'utf8'})
debugger;
if (findResults.status !== 0){
  subprocessFailedExit('An error occurred while running find.', findResults.stderr, findResults)
}
const userInput = process.argv[2]
const files = findResults.stdout.split('\n')
if (files[files.length -1] === '') {
  files.pop()
}
const grepResults = child_process.spawnSync('grep', ['-l', '-i', userInput, ...files], {encoding: 'utf8'})
if (grepResults.status === 2){
  subprocessFailedExit('Error occurred  while running grep.', grepResults.stderr, grepResults)
}

if (grepResults.status === 1) {
  console.log('No results found.')
}

console.log(grepResults.stdout)
