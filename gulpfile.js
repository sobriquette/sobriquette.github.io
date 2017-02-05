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
var cssMinifyLocation = ['styles/css/*.css', '!styles/css/*.min.css'];
var jsMinifyLocation = ['scripts/js/*.js', '!scripts/js/*.min.js'];

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
    return gulp.src('styles/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpIf('grayscale.scss', header(banner, { pkg: pkg })))
        .pipe(gulp.dest('styles/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Watchers
gulp.task('watch', function() {
    gulp.watch('styles/scss/**/*.scss', ['sass']);
    gulp.watch('*.html', browserSync.reload);
    gulp.watch('scripts/js/**/*.js', browserSync.reload);
});

// Optimize images
gulp.task('images', function() {
    return gulp.src('assets/img/**/*.+(png|jpg|gif|svg)')
        // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('dist/assets/img'))
});

// Copy misc assets to dist
gulp.task('assets', function() {
    return gulp.src('assets/misc/*.{ico,pdf}')
        .pipe(gulp.dest('dist/assets/misc'))
});

// Minify compiled CSS
gulp.task('minify-css', ['sass'], function() {
    return gulp.src(cssMinifyLocation)
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('styles/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify JS
gulp.task('minify-js', function() {
    return gulp.src(jsMinifyLocation)
        .pipe(uglify())
        .pipe(gulpIf('grayscale.js', header(banner, { pkg: pkg })))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('scripts/js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify and concatenate JS and CSS files
gulp.task('useref', function() {
    return gulp.src('*.html')
        .pipe(useref())
        .pipe(gulp.dest('dist'))
});

// Copy vendor JS
gulp.task('vendor-js', function() {
    return gulp.src('scripts/vendor/**/*')
        .pipe(gulp.dest('dist/scripts/vendor'))
})

// Copy fonts
gulp.task('fonts', function() {
    return gulp.src('styles/fonts/**/*')
        .pipe(gulp.dest('dist/styles/fonts'))
});

// Copy vendor libraries from /node_modules into /vendor
gulp.task('copy', function() {
    gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulpIf('*.js', gulp.dest('scripts/vendor/bootstrap')))
        .pipe(gulpIf(['*.scss', '*.css'], gulp.dest('styles/vendor/bootstrap')))

    gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('scripts/vendor/jquery'))

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
    return del.sync(['dist/**/*', '!dist/assets/**/*']);
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
        ['images', 'assets', 'useref', 'vendor-js', 'fonts', 'copy', 'vendor'], 
        callback
    )
    console.log('Building project');
});

// Dev task with browserSync
gulp.task('dev', ['browserSync', 'sass', 'useref'], function() {
    gulp.watch('styles/scss/**/*.scss', ['sass']);
    gulp.watch(cssMinifyLocation, ['minify-css']);
    gulp.watch('scripts/js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('*.html', browserSync.reload);
    gulp.watch('scripts/js/**/*.js', browserSync.reload);
});