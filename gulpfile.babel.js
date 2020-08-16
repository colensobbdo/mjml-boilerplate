"use strict";

import fs from "fs";
import path from "path";

import browser from "browser-sync";
import gulp from "gulp";
import data from "gulp-data";
import flatten from "gulp-flatten";
import imagemin from 'gulp-imagemin';
import mjmlGulp from "gulp-mjml";
import newer from 'gulp-newer';
import nunjucks from "gulp-nunjucks-render";
import mjml from "mjml";
import rimraf from "rimraf";

const PATHS = {
  src: "./src/{layouts,partials,templates}/**/*.mjml",
  layouts: "./src/layouts/",
  partials: "./src/partials/",
  templates: "./src/templates/**/*.mjml",
  images: {
    src: './src/**/*.{jpg,jpeg,png,gif}',
    dist: './dist/html'
  },
  mjml: {
    src: "./dist/mjml/**/*.mjml",
    dist: "./dist/mjml/",
  },
  dist: "./dist/html/",
};

/**
 * @param done
 */
export const clean = (done) => {
  rimraf("./dist/*", done);
};

const loadData = (file) => {
  const FILE_DIR = path.parse(file.path).dir;
  const FILE_NAME = path.parse(file.path).name;
  const JSON_FILE = `${FILE_DIR}/${FILE_NAME}.json`;

  // Check that the file exists.
  if (fs.existsSync(JSON_FILE)) {
    return JSON.parse(fs.readFileSync(JSON_FILE, "utf8"));
  }

  return {};
};

/**
 * @param done
 */
export const images = (done) => {
  gulp.src(PATHS.images.src)
    .pipe(newer(PATHS.images.dist))
    .pipe(imagemin({
      verbose: true
    }))
    .pipe(flatten({ includeParents: -2} ))
    .pipe(gulp.dest(PATHS.dist))
    .pipe(gulp.dest(PATHS.mjml.dist))
    .pipe(browser.stream());
  done();
};

/**
 * @returns {*}
 */
export const buildTemplates = () => {
  return gulp
    .src(PATHS.templates)
    .pipe(data((file) => loadData(file)))
    .pipe(
      nunjucks({
        path: [PATHS.layouts, PATHS.partials],
        envOptions: {
          noCache: true,
        },
        inheritExtension: true,
      })
    )
    .pipe(gulp.dest(PATHS.mjml.dist));
};

/**
 * @returns {*}
 */
export const buildMjml = () => {
  const options = {
    beautify: true,
    minify: false,
  };

  return gulp
    .src(PATHS.mjml.src)
    .pipe(mjmlGulp(mjml, options))
    .pipe(gulp.dest(PATHS.dist));
};

/**
 * @param done
 */
export const server = (done) => {
  const options = {
    server: {
      baseDir: PATHS.dist,
      directory: true,
    },
    port: "8000",
    notify: false,
  };

  browser.init(options);
  done();
};

export const watch = () => {
  gulp
    .watch(PATHS.src)
    .on("all", gulp.series(gulp.parallel(buildTemplates, images), buildMjml, browser.reload));
};

gulp.task("build", gulp.series(clean, gulp.parallel(buildTemplates, images), buildMjml));

gulp.task("default", gulp.series("build", gulp.parallel(server, watch)));
