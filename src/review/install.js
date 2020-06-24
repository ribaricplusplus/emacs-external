const child_process = require('child_process')
const path = require('path')

const results = child_process.spawnSync('ln', ['-s', path.join(__dirname, 'main.js'), path.join(process.env.HOME, 'emacs-external', 'bin', 'bno-review')], {encoding: 'utf8'})
if (results.status !== 0) {
  console.error('Installation failed')
  console.error(results.stderr)
}

