import debug from 'debug'
import multimatch from 'multimatch'
import config from 'config'

const dbg = debug(config.get('project-name'))

export default function (options) {
  return (files, metalsmith, done) => {
    let cloudinary = metalsmith.metadata().cloudinary
    let images = multimatch(Object.keys(cloudinary), options.imageMask)
    let articles = multimatch(Object.keys(files), options.articleMask)
    articles.forEach((file) => {
      if (files[file].cover) {
        files[file].cover = cloudinary[files[file].cover]
        return
      }
      let key
      key = Math.floor(file.length / 2)
      key = file.charCodeAt(key)
      key = key % images.length
      key = images[key]
      files[file].cover = cloudinary[key]
    })
    done()
  }
}
