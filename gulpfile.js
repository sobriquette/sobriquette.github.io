'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');
var gulpIf = require('gulp-if');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var pkg = require('./package.json');

// Set the banner content
var banner = ['/*!\n',
    ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
    ' */\n',
    ''
].join('');

// Compile sass files from /sass into /css
gulp.task('sass', function() {
    return gulp.src('sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Watchers
gulp.task('watch', function() {
    gulp.watch('sass/**/*.scss', ['sass']);
    gulp.watch('*.html', browserSync.reload);
    gulp.watch('js/**/*.js', browserSync.reload);
});

// Optimize images
gulp.task('images', function() {
    return gulp.src('img/**/*.+(png|jpg|gif|svg)')
        // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('dist/img'))
});

// Minify compiled CSS
gulp.task('minify-css', ['sass'], function() {
    return gulp.src('css/grayscale.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify JS
gulp.task('minify-js', function() {
    return gulp.src('js/grayscale.js')
        .pipe(uglify())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify and concatenate JS and CSS files
gulp.task('useref', function() {
    return gulp.src('*.html')
        .pipe(useref())
        // Minifies only if a JavaScript file
        .pipe(gulpIf('*.js', uglify()))
        // Minifies only if it's a CSS file
        .pipe(gulpIf('*.css', cleanCSS({ compatibility: 'ie8' })))
        .pipe(gulp.dest('dist'))
});

// Copy fonts
gulp.task('fonts', function() {
    return gulp.src('fonts/**/*')
        .pipe(gulp.dest('dist/fonts'))
});

// Copy vendor libraries from /node_modules into /vendor
gulp.task('copy', function() {
    gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulp.dest('vendor/bootstrap'))

    gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('vendor/jquery'))

    gulp.src([
            'node_modules/font-awesome/**',
            '!node_modules/font-awesome/**/*.map',
            '!node_modules/font-awesome/.npmignore',
            '!node_modules/font-awesome/*.txt',
            '!node_modules/font-awesome/*.md',
            '!node_modules/font-awesome/*.json'
        ])
        .pipe(gulp.dest('vendor/font-awesome'))
})

// Copy vendor files into dist
gulp.task('vendor', function() {
    return gulp.src('vendor/**/*')
        .pipe(gulp.dest('dist/vendor'))
});

// Clean up files that are no longer used
gulp.task('clean', function() {
    return del.sync('dist').then(function(callback) {
        return cache.clearAll(callback);
    });
});

gulp.task('clean:dist', function() {
    return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'sobriquette.github.io'
        },
    })
})

// Run everything
gulp.task('default', function(callback) {
    runSequence(['sass', 'browserSync'], 'watch',
        callback
    )
});

gulp.task('build', function (callback) {
    runSequence(
        'clean:dist',
        'sass',
        ['images', 'useref', 'fonts', 'copy', 'vendor'], 
        callback
    )
    console.log('Building project');
});

// Dev task with browserSync
gulp.task('dev', ['browserSync', 'sass', 'useref'], function() {
    gulp.watch('sass/**/*.scss', ['sass']);
    gulp.watch('css/*.css', ['minify-css']);
    gulp.watch('js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('*.html', browserSync.reload);
    gulp.watch('js/**/*.js', browserSync.reload);
});