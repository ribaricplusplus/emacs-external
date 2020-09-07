const fs = require('fs')
const cp = require('child_process')
const path = require('path')

const BINARY_NAME = 'bno-book-index'

/**
 * @param {boolean} watch
 */
function buildProject(watch){
  console.log('Building project... Watch is set to', watch)
  const args = `tsc${watch ? ' --watch' : ''}`
  const data = cp.spawnSync('npx', args.split(' '), {encoding: 'utf8'})
  console.error(data.stderr)
  console.log(data.stdout)
  if (data.error){
    process.exit(1)
  }
  console.log(data.stdout)
}

function install(done){
  buildProject(false)
  const HOME = process.env.HOME
  const args = `-s ${path.join(__dirname, 'dist', 'main.js')} ${path.join(HOME, '.emacs.d', 'external', 'bin', BINARY_NAME)}`
  const data = cp.spawnSync('ln', args.split(' '), {encoding: 'utf8'})
  if (data.status !== 0){
    console.error('An error occurred while installing')
    console.error(data.stderr)
    process.exit(1)
  }
  console.log('Link installed into binary directory.')
  done()
}

function watch(done){
  buildProject(true)
  done()
}

function build(done){
  buildProject(false)
  done()
}

exports.watch = watch
exports.install = install
exports.build = build
