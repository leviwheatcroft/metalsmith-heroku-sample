import {
  extend,
  each
} from 'lodash'
import debug from 'debug'
import readline from 'readline'
import {
  createReadStream
} from 'fs'

let dbg = debug('redirects')

export default function (options) {
  return (files, metalsmith, done) => {
    let redirects = []
    readline.createInterface({
      input: createReadStream('redirects.csv')
    })
    .on('line', (line) => {
      line = line.split(',')
      redirects.push({ src: line[0], dest: line[1] })
    })
    .on('close', () => {
      metalsmith.metadata(extend(metalsmith.metadata(), { redirects }))
      each(redirects, (r) => dbg(`${r.src} > ${r.dest}`))
      done()
    })
  }
}
