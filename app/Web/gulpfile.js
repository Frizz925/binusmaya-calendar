var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var path = require('path');
var browserSync = require('browser-sync');
var webpack = require('webpack');
var forever = require('gulp-forever-monitor');

var assetPath = path.join(__dirname, "../../public/assets");

gulp.task('default', ['build']);

gulp.task('build', ['sass', 'webpack']);

gulp.task('watch', ['build', 'webpack:watch'], function() {
    gulp.watch('./src/sass/**/*.scss', ['sass']);
});

gulp.task('serve', ['watch', 'forever'], function() {
    browserSync.init({
        host: "localhost",
        port: 3000,
        proxy: "http://localhost",
        open: false
    });

    gulp.watch(assetPath + '/**/*.js', browserSync.reload);
    gulp.watch('./src/pug/**/*.pug', browserSync.reload);
});

gulp.task('forever', function() {
    forever('index.js', {
        sourceDir: path.resolve("."),
        watch: true,
        watchDirectory: path.resolve("./src"),
        watchIgnorePatterns: [".*", "pug/**", "sass/**", "client/**"]
    }).on('watch:restart', function(info) {
        console.error('Restaring script because ' + info.file + ' changed');
    });
});

gulp.task('sass', function() {
    return gulp.src('./src/sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(assetPath + '/css'))
        .pipe(browserSync.stream());
});

var webpackCallback = function(cb) {
    var done = false;
    return function(err, stats) {
        if (err) throw new gutil.PluginError("[webpack]", err);
        gutil.log("[webpack]", stats.toString());
        if (!done) {
            done = true;
            cb();
        }
    };
};

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

