'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  return (files, metalsmith, done) => {
    let redirects = [];
    _readline2.default.createInterface({
      input: (0, _fs.createReadStream)('redirects.csv')
    }).on('line', line => {
      line = line.split(',');
      redirects.push({ src: line[0], dest: line[1] });
    }).on('close', () => {
      metalsmith.metadata((0, _lodash.extend)(metalsmith.metadata(), { redirects }));
      (0, _lodash.each)(redirects, r => dbg(`${r.src} > ${r.dest}`));
      done();
    });
  };
};

var _lodash = require('lodash');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _fs = require('fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let dbg = (0, _debug2.default)('redirects');
//# sourceMappingURL=redirects.js.map