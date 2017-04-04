import Metalsmith from 'metalsmith'
import markdown from 'metalsmith-markdown'
import layouts from 'metalsmith-layouts'
import less from 'metalsmith-less'
import fingerprint from 'metalsmith-fingerprint'
import collections from 'metalsmith-collections'
import tags from 'metalsmith-tags'
import s3 from 'metalsmith-s3'
import filemetadata from 'metalsmith-filemetadata'
import cloudinary from 'metalsmith-cloudinary'
import drafts from 'metalsmith-drafts'
import move from 'metalsmith-move'
import mimeType from 'metalsmith-mime-type'
import mapsite from 'metalsmith-mapsite'
import uglify from 'metalsmith-uglify'
import {
  plugin as drive
} from 'metalsmith-google-drive'

// import {
//   keys,
//   each
// } from 'lodash'
// import multimatch from 'multimatch'
import moment from 'moment'
import httpUi from 'metalsmith-http-ui'
import Handlebars from 'handlebars'
import debug from 'debug'
import marked from 'marked'
import handlebarsCloudinary from 'handlebars-cloudinary'
import markedCloudinary from 'marked-cloudinary'
import config from 'config'

import defaultCovers from './plugins/default-covers'
import redirects from './plugins/redirects'
import devServer from './plugins/dev-server'
// import writemetadata from 'metalsmith-writemetadata'

let dbg = debug('metalsmith-heroku-sample')
dbg('bucket', config.get('aws.bucket'))
if (process.argv[2] === 'httpRun') {
  httpUi()
} else if (process.argv[2] === 'deploy') {
  compile()
  .use(s3({
    action: 'write',
    region: config.get('aws.region'),
    bucket: config.get('aws.bucket')
  }))
  .build((err) => dbg(err || 'deployed'))
} else if (process.argv[2] === 'serve') {
  compile()
  .use(devServer())
  .build((err) => dbg(err || 'serving'))
}

function compile () {
  // set up auth for s3
  process.env['AWS_ACCESS_KEY_ID'] = config.aws['AWS_ACCESS_KEY_ID']
  process.env['AWS_SECRET_ACCESS_KEY'] = config.aws['AWS_SECRET_ACCESS_KEY']

  // cloudinary helper for handlebars
  Handlebars.registerHelper(
    'cloudinary',
    handlebarsCloudinary(config.get('metalsmith-cloudinary').cloud_name)
  )

  // render images in markdown with cloudinary args.
  const renderer = new marked.Renderer()
  renderer.image = markedCloudinary(config.get('metalsmith-cloudinary').cloud_name)

  return Metalsmith(__dirname)
  .metadata(config.get('meta'))

  // redirects
  .use(redirects())

  // ============================================================== styles & js ==
  .use(less({
    pattern: [ 'styles/*.less' ],
    useDynamicSourceMap: true
  }))
  .use(uglify({
    nameTemplate: '[name].[ext]',
    sourceMap: true
  }))
  .use(move({
    '**/*.less': false
  }))
  .use(fingerprint({
    pattern: [
      '**/*.js',
      '**/*.css'
    ]
  }))

  // =================================================================== images ==
  .use(drive({
    auth: config.get('metalsmith-google-drive').auth,
    src: config.get('metalsmith-google-drive')['images-folder-id'],
    dest: 'images',
    invalidateCache: false
  }))
  .use(cloudinary(
    Object.assign(
      {},
      config.get('metalsmith-cloudinary'),
      {
        push: 'images/**',
        invalidateCache: false
      }
    )
  ))

  // ========================================================= pages & articles ==
  .use(drive({
    auth: config.get('metalsmith-google-drive').auth,
    src: config.get('metalsmith-google-drive')['articles-folder-id'],
    dest: 'articles',
    invalidateCache: false
  }))
  .use(drafts())
  .use(markdown({ renderer }))

  .use(move({
    '**/*.html': '{dir}/{name}'
  }))
  .use(tags({
    path: 'tags/:tag',
    layout: 'cleanBlogTag.hbs'
  }))
  .use(filemetadata([
    {
      pattern: 'tags/*',
      metadata: { 'title': 'articles tagged {tag}' }
    },
    {
      // mapsite reads 'lastmod'
      pattern: [ 'articles/*' ],
      metadata: {
        'lastmod': '{lastmod}',
        'displayDate': '{displayDate}'
      },
      tokens: {
        displayDate: (meta) => {
          if (!meta.modifiedDate) return '' // return empty string, not false
          return moment(meta.modifiedDate).format('MMMM Do YYYY')
        },
        lastmod: (meta) => {
          if (!meta.modifiedDate) return '' // return empty string, not false
          return moment(meta.modifiedDate).format('YYYY-MM-DD')
        }
      }
    }
  ]))
  .use(collections({
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
  }))
  .use(defaultCovers({
    imageMask: 'images/default*',
    articleMask: [
      'articles/*',
      'tags/*',
      'index'
    ]
  }))
  .use(layouts({
    engine: 'handlebars',
    directory: 'layouts',
    partials: 'layouts/cleanBlog',
    pattern: [
      'index',
      'articles/*'
    ]
  }))

  .use(mapsite({
    hostname: config.get('meta').url,
    pattern: [
      '**/*',
      '!**/*.*'
    ]
  }))
  .use(mimeType([
    '**/*',
    '!**/*.*'
  ]))
}
