import gulp from 'gulp';
import changedInPlace from 'gulp-changed-in-place';
import plumber from 'gulp-plumber';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import notify from 'gulp-notify';
import rename from 'gulp-rename';
import project from '../aurelia.json';
import {CLIOptions} from 'aurelia-cli';

function configurePluginEnvironment() {
  let env = CLIOptions.getEnvironment();

  return gulp.src(`aurelia_project/environments/${env}.js`)
    .pipe(changedInPlace({firstPass: true}))
    .pipe(rename('environment.js'))
    .pipe(gulp.dest(project.paths.root));
}

function buildPluginJavaScript() {
  return gulp.src(project.customPlugins.source)
    .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
    .pipe(changedInPlace({firstPass: true}))
    .pipe(babel(project.transpiler.options))
    .pipe(gulp.dest('plugins/'))
}

function copyResourceFiles() {
  return gulp.src(project.customPlugins.resources)
    .pipe(changedInPlace({firstPass: true}))
    .pipe(gulp.dest('plugins/'))
}

export default gulp.series(
  configurePluginEnvironment,
  buildPluginJavaScript,
  copyResourceFiles
);
