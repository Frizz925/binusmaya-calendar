const gulp = require('gulp');
const gutil = require('gulp-util');
const notify = require('gulp-notify');
const sass = require('gulp-sass');
const path = require('path');
const browserSync = require('browser-sync');
const webpack = require('webpack');
const forever = require('gulp-forever-monitor');

const assetPath = path.join(__dirname, "../public/assets");
const errorHandler = function(name) {
    return notify.onError(function(err) {
        console.error(`[${name}] ${err}`);
        return `${name} build failed!`;
    });
};

const webpackCallback = function(cb) {
    var done = false;
    var onError = errorHandler('webpack');
    return function(err, stats) {
        if (err) {
            onError(err);
        } else {
            gutil.log("[webpack]", stats.toString());
            if (!done) {
                done = true;
                cb();
            }
        }
    };
};

gulp.task('default', ['build']);

gulp.task('build', ['sass', 'webpack']);

gulp.task('watch', ['build', 'webpack:watch'], function() {
    gulp.watch('./src/sass/**/*.scss', ['sass']);
});

gulp.task('serve', ['watch'], function() {
    browserSync.init({
        host: "localhost",
        port: 3000,
        proxy: "http://localhost",
        open: false
    });

    gulp.watch(assetPath + '/js/**/*.js', browserSync.reload);
    gulp.watch('./src/pug/**/*.pug', browserSync.reload);
});

gulp.task('sass', function() {
    var onError = errorHandler('sass');
    return gulp.src('./src/sass/*.scss')
        .pipe(sass().on('error', onError))
        .pipe(gulp.dest(assetPath + '/css'))
        .pipe(browserSync.stream());
});

gulp.task('webpack:watch', function(cb) {
    var options = Object.assign({
        watch: true
    }, require('./webpack.config'));
    webpack(options, webpackCallback(cb));
});

gulp.task('webpack', function(cb) {
    var options = require('./webpack.config');
    webpack(options, webpackCallback(cb));
});

gulp.task('forever', function() {
    process.env.NODE_PATH = "./src";
    forever('index.js', {
        sourceDir: path.resolve("."),
        watch: true,
        watchDirectory: path.resolve("./src"),
        watchIgnorePatterns: [".*", "pug/**", "sass/**", "client/**"]
    }).on('watch:restart', function(info) {
        console.error(`Restarting script because ${info.file} changed`);
    });
});
