const { fileLoader, is_dev, is_prod } = require('./gulpfile.utils');
const { events } = require('./gulpfile.events');
const { } = require('./gulpfile.favicons');

const { dest, parallel, series, src, watch } = require('gulp');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const ejs = require("gulp-ejs")
const gclean = require('gulp-clean');
const gulpif = require('gulp-if');
const htmlmin = require('gulp-htmlmin');
const log = require('gulplog');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const ghpages = require('gh-pages');


const browserSync = require('browser-sync').create();

ejs.__EJS__.fileLoader = fileLoader;

function clean() {
  return src(['dist/', 'generated/', '!**/.gitkeep'], { read: false, allowEmpty: true })
    .pipe(gclean({ force: true }));
}

function javascript() {
  return browserify({
    entries: 'app/common.js',
    debug: is_dev,
  })
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(gulpif(is_dev, sourcemaps.init(({ loadMaps: true }))))
    .pipe(gulpif(is_prod, uglify()))
    .on('error', log.error)
    .pipe(gulpif(is_dev, sourcemaps.write()))
    .pipe(rename({ extname: '.js' }))
    .pipe(dest('generated/'));
}

function styles() {
  return src(['app/*.scss'])
    .pipe(gulpif(is_dev, sourcemaps.init()))
    .pipe(ejs({}, { async: false }))
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
    .pipe(ejs({ events: events() }, { async: false }))
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

const build = parallel(
  'generateFavicon',
  series(
    parallel(
      styles,
      javascript,
      statics,
      'generateEventImages',
      'generateEvents'),
    templates));

function serve() {
  browserSync.init({
    server: "./dist",
  });

  watch("app/**/*").on('change', series(build, browserSync.reload));
}

function publishGhPages(cb) {
  ghpages.publish('dist', cb)
}

exports.build = build;
exports.clean = clean;
exports.default = build;
exports.events = parallel('generateEventImages', 'generateEvents');
exports.js = javascript;
exports.publishGhPages = publishGhPages;
exports.serve = series(build, serve);
exports.styles = styles;
exports.templates = templates;
