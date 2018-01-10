'use strict';

var gulp = require('gulp-help')(require('gulp'));
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var sassImporter = require('./sass-importer');
const config = require('../build.conf');

gulp.task('move-required-core-files', 'Move required sass files', function() {
  return gulp
    .src(config.paths.ngPackngrBuildRequiredFiles)
    .pipe(gulp.dest('deploy/platform/core'));
});

gulp.task('compile-core-sass', 'compile some core sass to css', function() {
  return gulp
    .src(config.paths.ngPackngrCompileStyles)
    .pipe(sourcemaps.init())
    .pipe(sass({
      errLogToConsole: true,
      importer: sassImporter,
    }))
    .pipe(postcss([autoprefixer({
        browsers: [
          'last 2 versions',
          'ie 11'
        ]
      })]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('deploy/platform/core'));
});