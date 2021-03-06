var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var sourcemaps = require('gulp-sourcemaps');
var minifyCSS = require('gulp-minify-css');
var rename = require("gulp-rename");
var del = require('del');

var paths = {
    scripts: ['public/js/app.js/','public/js/controllers.js/','public/js/directives.js/','public/js/filters.js/','public/js/services.js/','public/js/socket.js/'],
    js: 'public/js/*/',
    images: 'public/images/**/*',
    css:'public/css/*'
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use all packages available on npm
gulp.task('clean', function(cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    del(['build'], cb);
});

gulp.task('css',['clean'], function() {
    gulp.src(paths.css)
        .pipe(minifyCSS({keepBreaks:true}))
        .pipe(rename('acgfun.min.css'))
        .pipe(gulp.dest('public/css'))
});

gulp.task('scripts', ['clean'], function() {
    // Minify and copy all JavaScript (except vendor scripts)
    // with sourcemaps all the way down
    return gulp.src(paths.scripts)
        .pipe(uglify({mangle: false}))
        .pipe(concat('acgfun.min.js'))
        .pipe(rename('acgfun.min.js'))
        .pipe(gulp.dest('public/js'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(paths.js, ['scripts']);
    gulp.watch(paths.images, ['images']);
    gulp.watch(paths.css, ['css']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['css','scripts','watch']);