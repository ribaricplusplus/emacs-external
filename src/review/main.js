const fs = require('fs')
const path = require('path')
const cp = require('child_process')

// Returns yesterday in the format [year, month, day]
function yesterday(){
  const now = new Date()
  now.setDate(now.getDate()-1)
  return [now.getFullYear(), now.getMonth()+1, now.getDate()]
}

function zeroPadIfNeeded(str){
  if (str.length === 1){
    return '0' + str
  }
  return str
}

function reviewDay(date, dirty){
  let formattedDate = date
  if(typeof date === 'string'){
    formattedDate = date.split('/')
  } else {
    formattedDate = formattedDate.map(num => String(num))
  }
  // Months and days are in zero padded format
  for (let i = 1; i < 3; ++i) {
    formattedDate[i] = zeroPadIfNeeded(formattedDate[i])
  }
  const pathToYesterday = path.join(dirty, ...formattedDate)
  debugger;
  if (!fs.existsSync(pathToYesterday)){
    console.error('Yesterday does not exist!')
    process.exit(1)
  }
  const findArgs = `${pathToYesterday} -type f -not -iregex .*\\.code$ -and -not -iregex .*\\.json -and -not -iregex .*\\.html -and -not -iregex .*\\.js -print`
  const nbFilesProcess = cp.spawnSync('find', findArgs.split(' '), {encoding: 'utf8'})
  if (nbFilesProcess.status !== 0){
    console.error(nbFilesProcess.stderr)
    process.exit(1)
  }
  let  nbFiles = nbFilesProcess.stdout.split('\n')
  nbFiles = nbFiles.filter(file => file.length !== 0)
  for(const file of nbFiles){
    const contents = fs.readFileSync(file, {encoding: 'utf8'})
    process.stdout.write(file + '\n')
    process.stdout.write('==================================================================\n')
    process.stdout.write(contents)
  }
}

const HOME = process.env.HOME
const data = fs.readFileSync(path.join(HOME, '.emacs-config.json'))
const json = JSON.parse(data)
const NOTEBOOK_PATH = json.NOTEBOOK_PATH
const DIRTY_NOTEBOOK_PATH = path.join(NOTEBOOK_PATH, 'dirty')
// I need year, month, and day, to identify the path

if (process.argv[2] !== ''){
  reviewDay(process.argv[2], DIRTY_NOTEBOOK_PATH)
} else {
  reviewDay(yesterday(), DIRTY_NOTEBOOK_PATH)
}
