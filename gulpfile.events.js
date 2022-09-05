const rect_variants = [384, 768, 1024, 1536, 2048];
const square_variants = [384, 512, 768, 1024];

const { src, dest, task } = require('gulp');
const ejs = require("gulp-ejs");
const gulpif = require('gulp-if');
const htmlmin = require('gulp-htmlmin');
const merge = require('merge-stream');
const rename = require('gulp-rename');
const scaleImages = require('gulp-scale-images');
const flatMap = require('flat-map').default;

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { fileLoader, is_prod } = require('./gulpfile.utils');

const imageSource = (base_name, suffix, size) => base_name + suffix + `.${size}w.webp`;
const imageSourceSet = (base_name, suffix, sizes) => sizes.map(size => imageSource(base_name, suffix, size) + ` ${size}w`).join(', ');

const addressRegex = /((?<name>.+),\s*)?((?<street>.+),\s*)((?<city>[\w\s]+),\s*)((?<state>\w{2}),?\s*)(?<zip>\d{5})\s*/

function templateParams(ev) {
  const e = structuredClone(ev);
  e.base_name = path.basename(e.template, path.extname(e.template));
  e.html_name = e.base_name + '.html';
  e.start_time = Date.parse(e.start);
  e.end_time = Date.parse(e.end);
  e.address = addressRegex.exec(e.location).groups;
  e.cover_rect_srcset = imageSourceSet(e.base_name, '.rect', rect_variants);
  e.cover_rect_min = imageSource(e.base_name, '.rect', Math.min(...rect_variants));
  e.cover_rect_max = imageSource(e.base_name, '.rect', Math.max(...rect_variants));
  e.cover_square_srcset = imageSourceSet(e.base_name, '.square', square_variants);;
  e.cover_square_min = imageSource(e.base_name, '.square', Math.min(...square_variants));
  e.cover_square_max = imageSource(e.base_name, '.square', Math.max(...square_variants));
  return e;
}

ejs.__EJS__.fileLoader = fileLoader;

function events() {
  const events = yaml
    .load(fs.readFileSync('app/events/events.yaml', 'utf8'))
    .map(templateParams);

  for (const e of events) {
    e.events = events;
  }

  return events;
}

exports.events = events;

function generateImageTasks(pathFunc, suffix, widths) {
  return events().map(e =>
    src('./app/events/' + pathFunc(e))
      .pipe(rename({
        dirname: '.',           // move to the top directory
        basename: e.base_name, // match name of the template
        suffix: suffix,
      }))
      .pipe(flatMap(function (file, cb) {
        const variant = function (maxWidth) {
          const f = file.clone();
          f.scale = {
            maxWidth,
            format: 'webp',
            options: { nearLossless: true }
          };
          return f;
        };

        cb(null, widths.map(variant));
      }))
      .pipe(scaleImages())
      .pipe(dest('dist/'))
  );
}

function generateEventImages() {
  const rect_img_tasks = generateImageTasks(
    pathFunc = e => e.cover_rect,
    suffix = '.rect',
    widths = rect_variants,
  );

  const square_img_tasks = generateImageTasks(
    pathFunc = e => e.cover_square,
    suffix = '.square',
    widths = square_variants,
  );

  return merge(rect_img_tasks.concat(square_img_tasks));
};

function generateEvents() {
  const template_tasks = events().map((e) =>
    src(path.join('app/events/', e.template))
      .pipe(ejs(e, { async: false }))
      .pipe(rename({ extname: '.html', dirname: '.' }))
      .pipe(gulpif(is_prod, htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyElements: true,
        removeRedundantAttributes: true,
        minifyJS: true,
      })))
      .pipe(dest('dist/'))
  );

  return merge(template_tasks);
};

task('generateEventImages', generateEventImages);
task('generateEvents', generateEvents);
