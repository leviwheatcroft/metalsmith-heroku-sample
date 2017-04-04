import debug from 'debug'
import http from 'http'
import st from 'st'

let dbg = debug('metalsmith-smsftr')

export default function (options) {
  return (files, metalsmith, done) => {
    let server = st({
      path: metalsmith._destination,
      index: 'index'
    })

    http.createServer((request, response) => {
      let meta = files[request.url.slice(1)] || {}
      response.setHeader(
        'Content-Type',
        meta.mimeType ? meta.mimeType : 'text/html'
      )
      server(request, response)
      dbg(`req: ${request.url.slice(1)}`)
    }).listen(8080)
    done()
  }
}
