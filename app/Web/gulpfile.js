var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');

gulp.task('watch', function() {
    gulp.watch('./src/sass/**/*.scss', ['sass']);
});

gulp.task('serve', ['watch'], function() {
    browserSync.init({
        host: "localhost",
        port: 3000,
        proxy: "http://localhost",
        open: false
    });

    gulp.watch('./src/jade/**/*.jade', browserSync.reload);
});

gulp.task('sass', function() {
    return gulp.src('./src/sass/*.scss')
        .pipe(sass().on('error', gulp.logError))
        .pipe(gulp.dest('../../public/assets/css'))
        .pipe(browserSync.stream());
});
