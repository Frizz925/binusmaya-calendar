var gulp = require('gulp');
var sass = require('gulp-sass');
var path = require('path');
var browserSync = require('browser-sync');
var webpack = require('webpack-stream');
var webpackConfig = require('./webpack.config');

var assetPath = path.join(__dirname, "../../public/assets");

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

    gulp.watch(assetPath + '/**/*.js', browserSync.reload);
    gulp.watch('./src/pug/**/*.pug', browserSync.reload);
});

gulp.task('sass', function() {
    return gulp.src('./src/sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(assetPath + '/css'))
        .pipe(browserSync.stream());
});

gulp.task('webpack:watch', function() {
    var options = Object.assign({
        watch: true
    }, webpackConfig);
    return gulp.src('./src/**/index.js')
        .pipe(webpack(options))
        .pipe(gulp.dest(assetPath + '/js'));
});

gulp.task('webpack', function() {
    return gulp.src('./src/**/index.js')
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest(assetPath + '/js'));
});

