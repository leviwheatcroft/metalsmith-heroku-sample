'use strict';

var _metalsmith = require('metalsmith');

var _metalsmith2 = _interopRequireDefault(_metalsmith);

var _metalsmithMarkdown = require('metalsmith-markdown');

var _metalsmithMarkdown2 = _interopRequireDefault(_metalsmithMarkdown);

var _metalsmithLayouts = require('metalsmith-layouts');

var _metalsmithLayouts2 = _interopRequireDefault(_metalsmithLayouts);

var _metalsmithLess = require('metalsmith-less');

var _metalsmithLess2 = _interopRequireDefault(_metalsmithLess);

var _metalsmithFingerprint = require('metalsmith-fingerprint');

var _metalsmithFingerprint2 = _interopRequireDefault(_metalsmithFingerprint);

var _metalsmithCollections = require('metalsmith-collections');

var _metalsmithCollections2 = _interopRequireDefault(_metalsmithCollections);

var _metalsmithTags = require('metalsmith-tags');

var _metalsmithTags2 = _interopRequireDefault(_metalsmithTags);

var _metalsmithS = require('metalsmith-s3');

var _metalsmithS2 = _interopRequireDefault(_metalsmithS);

var _metalsmithFilemetadata = require('metalsmith-filemetadata');

var _metalsmithFilemetadata2 = _interopRequireDefault(_metalsmithFilemetadata);

var _metalsmithCloudinary = require('metalsmith-cloudinary');

var _metalsmithCloudinary2 = _interopRequireDefault(_metalsmithCloudinary);

var _metalsmithDrafts = require('metalsmith-drafts');

var _metalsmithDrafts2 = _interopRequireDefault(_metalsmithDrafts);

var _metalsmithMove = require('metalsmith-move');

var _metalsmithMove2 = _interopRequireDefault(_metalsmithMove);

var _metalsmithMimeType = require('metalsmith-mime-type');

var _metalsmithMimeType2 = _interopRequireDefault(_metalsmithMimeType);

var _metalsmithMapsite = require('metalsmith-mapsite');

var _metalsmithMapsite2 = _interopRequireDefault(_metalsmithMapsite);

var _metalsmithUglify = require('metalsmith-uglify');

var _metalsmithUglify2 = _interopRequireDefault(_metalsmithUglify);

var _metalsmithGoogleDrive = require('metalsmith-google-drive');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _metalsmithHttpUi = require('metalsmith-http-ui');

var _metalsmithHttpUi2 = _interopRequireDefault(_metalsmithHttpUi);

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _handlebarsCloudinary = require('handlebars-cloudinary');

var _handlebarsCloudinary2 = _interopRequireDefault(_handlebarsCloudinary);

var _markedCloudinary = require('marked-cloudinary');

var _markedCloudinary2 = _interopRequireDefault(_markedCloudinary);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _defaultCovers = require('./plugins/default-covers');

var _defaultCovers2 = _interopRequireDefault(_defaultCovers);

var _redirects = require('./plugins/redirects');

var _redirects2 = _interopRequireDefault(_redirects);

var _devServer = require('./plugins/dev-server');

var _devServer2 = _interopRequireDefault(_devServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import writemetadata from 'metalsmith-writemetadata'

let dbg = (0, _debug2.default)('metalsmith-heroku-sample');

// import {
//   keys,
//   each
// } from 'lodash'
// import multimatch from 'multimatch'

dbg('bucket', _config2.default.get('aws.bucket'));
if (process.argv[2] === 'httpRun') {
  (0, _metalsmithHttpUi2.default)();
} else if (process.argv[2] === 'deploy') {
  compile().use((0, _metalsmithS2.default)({
    action: 'write',
    region: _config2.default.get('aws.region'),
    bucket: _config2.default.get('aws.bucket')
  })).build(err => dbg(err || 'deployed'));
} else if (process.argv[2] === 'serve') {
  compile().use((0, _devServer2.default)()).build(err => dbg(err || 'serving'));
}

function compile() {
  // set up auth for s3
  process.env['AWS_ACCESS_KEY_ID'] = _config2.default.aws['AWS_ACCESS_KEY_ID'];
  process.env['AWS_SECRET_ACCESS_KEY'] = _config2.default.aws['AWS_SECRET_ACCESS_KEY'];

  // cloudinary helper for handlebars
  _handlebars2.default.registerHelper('cloudinary', (0, _handlebarsCloudinary2.default)(_config2.default.get('metalsmith-cloudinary').cloud_name));

  // render images in markdown with cloudinary args.
  const renderer = new _marked2.default.Renderer();
  renderer.image = (0, _markedCloudinary2.default)(_config2.default.get('metalsmith-cloudinary').cloud_name);

  return (0, _metalsmith2.default)(__dirname).metadata(_config2.default.get('meta'))

  // redirects
  .use((0, _redirects2.default)())

  // ============================================================== styles & js ==
  .use((0, _metalsmithLess2.default)({
    pattern: ['styles/*.less'],
    useDynamicSourceMap: true
  })).use((0, _metalsmithUglify2.default)({
    nameTemplate: '[name].[ext]',
    sourceMap: true
  })).use((0, _metalsmithMove2.default)({
    '**/*.less': false
  })).use((0, _metalsmithFingerprint2.default)({
    pattern: ['**/*.js', '**/*.css']
  }))

  // =================================================================== images ==
  .use((0, _metalsmithGoogleDrive.plugin)({
    auth: _config2.default.get('metalsmith-google-drive').auth,
    src: _config2.default.get('metalsmith-google-drive')['images-folder-id'],
    dest: 'images',
    invalidateCache: false
  })).use((0, _metalsmithCloudinary2.default)(Object.assign({}, _config2.default.get('metalsmith-cloudinary'), {
    push: 'images/**',
    invalidateCache: false
  })))

  // ========================================================= pages & articles ==
  .use((0, _metalsmithGoogleDrive.plugin)({
    auth: _config2.default.get('metalsmith-google-drive').auth,
    src: _config2.default.get('metalsmith-google-drive')['articles-folder-id'],
    dest: 'articles',
    invalidateCache: false
  })).use((0, _metalsmithDrafts2.default)()).use((0, _metalsmithMarkdown2.default)({ renderer })).use((0, _metalsmithMove2.default)({
    '**/*.html': '{dir}/{name}'
  })).use((0, _metalsmithTags2.default)({
    path: 'tags/:tag',
    layout: 'cleanBlogTag.hbs'
  })).use((0, _metalsmithFilemetadata2.default)([{
    pattern: 'tags/*',
    metadata: { 'title': 'articles tagged {tag}' }
  }, {
    // mapsite reads 'lastmod'
    pattern: ['articles/*'],
    metadata: {
      'lastmod': '{lastmod}',
      'displayDate': '{displayDate}'
    },
    tokens: {
      displayDate: meta => {
        if (!meta.modifiedDate) return ''; // return empty string, not false
        return (0, _moment2.default)(meta.modifiedDate).format('MMMM Do YYYY');
      },
      lastmod: meta => {
        if (!meta.modifiedDate) return ''; // return empty string, not false
        return (0, _moment2.default)(meta.modifiedDate).format('YYYY-MM-DD');
      }
    }
  }])).use((0, _metalsmithCollections2.default)({
    articles: {
      pattern: 'articles/*',
      sortBy: 'modifiedDate',
      reverse: true
    },
    recentPosts: {
      pattern: 'articles/*',
      sortBy: 'modifiedDate',
      reverse: true,
      limit: 5
    }
  })).use((0, _defaultCovers2.default)({
    imageMask: 'images/default*',
    articleMask: ['articles/*', 'tags/*', 'index']
  })).use((0, _metalsmithLayouts2.default)({
    engine: 'handlebars',
    directory: 'layouts',
    partials: 'layouts/cleanBlog',
    pattern: ['index', 'articles/*']
  })).use((0, _metalsmithMapsite2.default)({
    hostname: _config2.default.get('meta').url,
    pattern: ['**/*', '!**/*.*']
  })).use((0, _metalsmithMimeType2.default)(['**/*', '!**/*.*']));
}
//# sourceMappingURL=index.js.map