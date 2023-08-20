const { src, dest, watch, parallel, series } = require('gulp');

const gulp = require('gulp');
const scss = require('gulp-sass');
const concat = require('gulp-concat')
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const cleanCss = require('gulp-clean-css');
const rename = require('gulp-rename');
const mediaGroup = require('gulp-group-css-media-queries');
const shorthand = require('gulp-shorthand');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const fonter = require('gulp-fonter');

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app'
        },
        notify: false
    });
};

function styles() {
    return src('app/scss/style.scss')
        .pipe(scss({
            outputStyle: 'expanded'
        }))
        .pipe(mediaGroup())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true,
        }))
        .pipe(cleanCss({
            level: { 1: { specialComments: 0 } },
            format: 'beautify'
        }))
        .pipe(dest('app/css'))
        .pipe(shorthand())
        .pipe(cleanCss())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
};


function scripts() {
    return src([
        './app/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

gulp.task('otf2ttf', function () {
    return src('app/fonts/*.otf')
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest('app/fonts'))
})

function fonts() {
    src('app/fonts/**/*')
        .pipe(ttf2woff())
        .pipe(dest('app/dist/fonts'));
    return src('app/fonts/**/*')
        .pipe(ttf2woff2())
        .pipe(dest('app/dist/fonts'));
}

function images() {
    return src('app/images/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest('dist/images'))
};

function cleanDist() {
    return del('dist')
};

function build() {
    return src([
        'app/css/*.css',
        'app/js/main.min.js',
        'app/*.html'
    ], { base: 'app' })
        .pipe(dest('dist'))
};

function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app?*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.cleanDist = cleanDist;
exports.images = images;
exports.fonts = fonts;


exports.build = series(cleanDist, images, fonts, build);
exports.default = parallel(styles, scripts, browsersync, watching);