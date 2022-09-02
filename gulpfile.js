const DEST = 'dist';
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const is_prod = env === 'production';
const is_dev = !is_prod;

require('./gulpfile.favicons');

const { dest, parallel, series, src, watch, task } = require('gulp');
const gclean = require('gulp-clean');
const browserify = require('browserify');
const gulpif = require('gulp-if');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const log = require('gulplog');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const ejs = require("gulp-ejs")
const htmlmin = require('gulp-htmlmin');

const imageDataUri = require('image-data-uri');
const browserSync = require('browser-sync').create();
const fs = require('fs');
const path = require('path');

function dataUri(filePath) {
  return imageDataUri.encodeFromFile(filePath);
}

ejs.__EJS__.fileLoader = function(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contents = fs.readFileSync(filePath);

  switch (ext) {
    case '.jpg':
    case '.jpeg':
    case '.jfif':
      return imageDataUri.encode(contents, 'JPEG');
    case '.png':
      return imageDataUri.encode(contents, 'PNG');
    case '.webp':
      return imageDataUri.encode(contents, 'WEBP');
    case '.gif':
      return imageDataUri.encode(contents, 'GIF');
    default:
      return contents;
  }
}

function clean() {
  return src(['dist/', 'generated/'], {read: false, allowEmpty: true})
    .pipe(gclean({force: true }));
}

function javascript() {
  return browserify({
      entries: 'app/common.js',
      debug: is_dev,
    })
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(gulpif(is_dev, sourcemaps.init(({loadMaps: true}))))
    .pipe(gulpif(is_prod, uglify()))
    .on('error', log.error)
    .pipe(gulpif(is_dev, sourcemaps.write()))
    .pipe(rename({ extname: '.js' }))
    .pipe(dest('generated/'));
}

function styles() {
  return src(['app/*.scss'])
    .pipe(gulpif(is_dev, sourcemaps.init()))
    .pipe(ejs(
      { dataUri },
      { async: false }))
    .pipe(sass({
        outputStyle: is_prod ? 'compressed' : 'expanded',
       })
      .on('error', sass.logError))
    .pipe(gulpif(is_dev, sourcemaps.write()))
    .pipe(rename({ extname: '.css' }))
    .pipe(dest('generated/'));
}

function statics() {
  return src([
      'app/*.html',
      'app/*.txt',
      'app/favicon.*',
    ])
    .pipe(dest('dist/'))
}

function templates() {
  return src('app/*.ejs')
    .pipe(ejs(
      { dataUri },
      { async: false }))
    .pipe(rename({ extname: '.html' }))
    .pipe(gulpif(is_prod, htmlmin({ 
      collapseWhitespace: true,
      removeComments: true,
      removeEmptyElements: true,
      removeRedundantAttributes: true,
      // minifyJS: true,
    })))
    .pipe(dest('dist/'));
}

const build = parallel('generate-favicon', series(parallel(styles, javascript, statics), templates));

function serve() {
  browserSync.init({
    server: "./dist",
  });

  watch("app/**/*").on('change', series(build, browserSync.reload));
}

exports.clean = clean;
exports.build = build;
exports.js = javascript;
exports.styles = styles;
exports.templates = templates;
exports.default = build;
exports.serve = series(build, serve);
