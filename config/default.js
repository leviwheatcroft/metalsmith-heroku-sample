module.exports = {
  'project-name': 'metalsmith-heroku-sample',
  meta: {
    site: 'metalsmith heroku sample',
    description: 'build all the things bitch!',
    generator: 'Metalsmith',
    url: 'http://metalsmith-heroku-sample.s3-website-ap-southeast-2.amazonaws.com',
    liveReload: process.argv[2] === 'serve'
  },
  aws: {
    // edit
    bucketUrl: 'http://metalsmith-heroku-sample.s3-website-ap-southeast-2.amazonaws.com',
    // edit
    AWS_ACCESS_KEY_ID: 'AKIAIX4XWGHLV6U2SPHQ',
    // edit
    AWS_SECRET_ACCESS_KEY: 'CcjqyZgR6RpVkYEMDiD4kLNmEwVlSFHN47MbvSz8'
  },
  'metalsmith-google-drive': {
    auth: {
      'client_id': 'your client id',
      'client_secret': 'your client secret',
      'redirect_uris': [
        'urn:ietf:wg:oauth:2.0:oob',
        'http://localhost'
      ]
    },
    token: {
      // token will be provided via console when you auth first time
    },

    // you should put your own ids here, but these one's are shared publicly
    // anyway
    'images-folder-id': '0B1QpLgu4mpt8XzJWb2ZoaE5HeU0',
    'articles-folder-id': '0B1QpLgu4mpt8UEJEOVBreDd5NkE'
  },
  'metalsmith-cloudinary': {
    cloud_name: 'metalsmith-heroku-sample',
    api_key: 'your key',
    api_secret: 'your secret'
  }
}
