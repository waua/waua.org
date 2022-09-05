const fs = require('fs');
const path = require('path');
const imageDataUri = require('image-data-uri');

exports.env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
exports.is_prod = exports.env === 'production';
exports.is_dev = !exports.is_prod;

console.log(`env = ${exports.env}, process.env.NODE_ENV = ${process.env.NODE_ENV}`)

exports.fileLoader = function (filePath) {
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
};
