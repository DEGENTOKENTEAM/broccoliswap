const fs = require('fs')

// Fix an assert polyfill that is introduced by
// polyfilling webpack things needed by Solana

const f = fs.readFileSync('./node_modules/assert/build/assert.js').toString()
fs.writeFileSync(
  './node_modules/assert/build/assert.js',
  f.replace('require(\'object.assign/polyfill\')();', 'Object.assign')
)

fs.copyFileSync('./node_modules/stream-browserify/index.js', './node_modules/stream/index.js');
