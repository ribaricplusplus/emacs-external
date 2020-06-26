const child_process = require('child_process')
const fs = require('fs')
const path = require('path')

interface BookData{
  [book: string]: string[]
}

function splitLine(line: string){
  const index = line.indexOf(':')
  return [line.substring(0, index), line.substring(index+1, line.length)]
}

function printBooks(rawGrepResults: string){
  const data: BookData = {}
  const bookLines = rawGrepResults.split('\n')
  bookLines.pop()
  for (const line of bookLines){
    const fields = splitLine(line)
    if (data.hasOwnProperty(fields[1])){
      data[fields[1]].push(fields[0])
    } else {
      data[fields[1]] = [fields[0]]
    }
  }
  for (const [book, pages] of Object.entries(data)){
    process.stdout.write(book)
    process.stdout.write('\n')
    for (const page of pages){
      process.stdout.write(page + '\n')
    }
    process.stdout.write('============================================================\n')
  }
}

const configFile = fs.readFileSync(path.join(process.env.HOME, '.emacs-config.json'), {encoding: 'utf8'})
const config = JSON.parse(configFile)
const NOTEBOOK_ROOT = config.NOTEBOOK_ROOT

const findArgs = `${NOTEBOOK_ROOT} -type f -and -not \
-iregex .*\\.js$ -and -not -iregex .*\\.code$ -and -not -iregex .*\\.json -and -not -iregex .*\\.html$\
-and -not -iregex .*\\.zim$`
const grepArgs = String.raw`-E -e ^\w\..*?(,\w\..*?)?:\S+?$`



let findResults = child_process.spawnSync('find', findArgs.split(' '), {encoding: 'utf8'})
if (findResults.status !== 0){
  console.error(findResults.stderr)
  process.exit(1)
}

const paths =  findResults.stdout.split('\n')
paths.pop()

const grepResults = child_process.spawnSync('grep', [...paths, ...grepArgs.split(' ')], {encoding: 'utf8'})
if (grepResults.status === 2){
  console.error(grepResults.stderr)
  process.exit(1)
}
else if (grepResults.status === 1){
  process.stdout.write('No books.')
  process.exit(0)
}
else {
  printBooks(grepResults.stdout)
}
