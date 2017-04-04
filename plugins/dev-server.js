'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  return (files, metalsmith, done) => {
    let server = (0, _st2.default)({
      path: metalsmith._destination,
      index: 'index'
    });

    _http2.default.createServer((request, response) => {
      let meta = files[request.url.slice(1)] || {};
      response.setHeader('Content-Type', meta.mimeType ? meta.mimeType : 'text/html');
      server(request, response);
      dbg(`req: ${request.url.slice(1)}`);
    }).listen(8080);
    done();
  };
};

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _st = require('st');

var _st2 = _interopRequireDefault(_st);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let dbg = (0, _debug2.default)('metalsmith-smsftr');
//# sourceMappingURL=dev-server.js.map