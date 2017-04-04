'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  return (files, metalsmith, done) => {
    let cloudinary = metalsmith.metadata().cloudinary;
    let images = (0, _multimatch2.default)(Object.keys(cloudinary), options.imageMask);
    let articles = (0, _multimatch2.default)(Object.keys(files), options.articleMask);
    articles.forEach(file => {
      if (files[file].cover) {
        files[file].cover = cloudinary[files[file].cover];
        return;
      }
      let key;
      key = Math.floor(file.length / 2);
      key = file.charCodeAt(key);
      key = key % images.length;
      key = images[key];
      files[file].cover = cloudinary[key];
    });
    done();
  };
};

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _multimatch = require('multimatch');

var _multimatch2 = _interopRequireDefault(_multimatch);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const dbg = (0, _debug2.default)(_config2.default.get('project-name'));
//# sourceMappingURL=default-covers.js.map