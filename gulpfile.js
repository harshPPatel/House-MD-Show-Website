var { parallel, src, dest, task, watch } = require('gulp'),
  htmlmin = require('gulp-htmlmin'),
  cleanCSS = require('gulp-clean-css'),
  uglify = require('gulp-uglify'),
  pump = require('pump'),
  concat = require('gulp-concat'),
  sass = require('gulp-sass'),
  imagemin = require('gulp-imagemin'),
  autoprefixer = require('gulp-autoprefixer'),
  plumber = require('gulp-plumber'),
  browserSync = require('browser-sync'),
  pug = require('gulp-pug');

var pugSource = 'source/pug/*.pug',
  sassSource = 'source/sass/**/*.sass',
  jsVendorSource = 'source/js/vendors/*.js',
  jsCrossPlatformSource = 'source/js/crossPlatform/*.js',
  jsMainSource = 'source/js/*.js',
  imageSource = 'source/img/*',
  faviconSource = 'source/favicon/*',
  jsonSource = 'source/json/*.json';

var htmlDestination = 'build/',
  cssDestination = 'build/assets/css/',
  jsDestination = 'build/assets/js/',
  imageDestination = 'build/assets/img/',
  faviconDestination = 'build/assets/favicon/',
  jsonDestination = 'build/assets/json/';

// HTML Task
task('html', function(cb) {
  return src(pugSource)
    .pipe(pug())
    .pipe(plumber())
    .pipe(
      htmlmin({
        collapseWhitespace: true
      })
    )
    .pipe(dest(htmlDestination));
  cb();
});

// SASS Task
task('sass', function(cb) {
  return src(sassSource)
    .pipe(
      sass({
        outputStyle: 'compressed'
      })
    )
    .pipe(plumber())
    .pipe(
      autoprefixer({
        browsers: ['cover 99.5%']
      })
    )
    .pipe(
      cleanCSS({
        compatibility: 'ie8'
      })
    )
    .pipe(concat('styles.css'))
    .pipe(dest(cssDestination));
  cb();
});

// Vendor JS Task
task('vendorJS', function(cb) {
  pump(
    [
      src(jsVendorSource),
      plumber(),
      concat('vendors.js'),
      uglify(),
      dest(jsDestination)
    ],
    cb
  );
});

// Cross Platform JavaScript Task
task('crossPlatformJS', function(cb) {
  pump([src(jsCrossPlatformSource), plumber(), dest(jsDestination)], cb);
});

// App javaScript Task
task('appJS', function(cb) {
  pump(
    [
      src(jsMainSource),
      plumber(),
      concat('app.js'),
      uglify(),
      dest(jsDestination)
    ],
    cb
  );
});

// Image task
task('image', function(cb) {
  return src(imageSource)
    .pipe(imagemin())
    .pipe(plumber())
    .pipe(dest(imageDestination));
  cb();
});

// Favicon Task
task('favicon', function(cb) {
  return src(faviconSource)
    .pipe(plumber())
    .pipe(dest(faviconDestination));
  cb();
});

// JSON Task
task('json', function(cb) {
  return src(jsonSource)
    .pipe(plumber())
    .pipe(dest(jsonDestination));
  cb();
});

// Watch Task
task('watch', function(cb) {
  browserSync.init({
    server: {
      baseDir: './build'
    },
    notify: false
  });

  watch('source/pug/**/*.pug', task('html'));
  watch(sassSource, task('sass'));
  watch(jsCrossPlatformSource, task('crossPlatformJS'));
  watch(jsVendorSource, task('vendorJS'));
  watch(jsMainSource, task('appJS'));
  watch(imageSource, task('image'));
  watch(faviconSource, task('favicon'));
  watch(jsonSource, task('json'));
  watch([
    'build/*.html',
    'build/assets/css/*.css',
    'build/assets/js/*.js',
    '.build/assets/img/*',
    'build/assets/favicon/*',
    'build/assets/json/*.json'
  ]).on('change', browserSync.reload);
  cb();
});

// Default task
exports.default = parallel(
  task('html'),
  task('sass'),
  task('crossPlatformJS'),
  task('vendorJS'),
  task('appJS'),
  task('image'),
  task('favicon'),
  task('json'),
  task('watch')
);
