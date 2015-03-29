//Include gulp
var gulp = require('gulp');

//Include plugins
var gutil = require('gulp-util');
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var livereload = require('gulp-livereload');

//Styles
gulp.task('sass-theme', function() {
	gulp.src('./sass/style.scss')
		.pipe(sass())
		.pipe(gulp.dest('./'))
		.pipe(livereload());
});

gulp.task('sass-foundation', function() {
	gulp.src('./foundation/scss/foundation.scss')
		.pipe(sass())
		.pipe(gulp.dest('./foundation/'))
		.pipe(livereload());
});

gulp.task('sass-normalize', function() {
	gulp.src('./foundation/scss/normalize.scss')
		.pipe(sass())
		.pipe(gulp.dest('./foundation/'))
		.pipe(livereload());
});

//Scripts
gulp.task('scripts-theme', function() {
	gulp.src(['./js/lib/*.js'])
		.pipe(sourcemaps.init())
		.pipe(concat('all.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./js/dist/'));
});

gulp.task('scripts-foundation', function() {
	gulp.src([
		'./foundation/js/foundation/foundation.js',
		'./foundation/js/foundation/foundation.abide.js',
		'./foundation/js/foundation/foundation.accordion.js',
		'./foundation/js/foundation/foundation.alert.js',
		'./foundation/js/foundation/foundation.clearing.js',
		'./foundation/js/foundation/foundation.dropdown.js',
		'./foundation/js/foundation/foundation.equalizer.js',
		'./foundation/js/foundation/foundation.interchange.js',
		'./foundation/js/foundation/foundation.joyride.js',
		'./foundation/js/foundation/foundation.magellan.js',
		'./foundation/js/foundation/foundation.offcanvas.js',
		'./foundation/js/foundation/foundation.orbit.js',
		'./foundation/js/foundation/foundation.reveal.js',
		'./foundation/js/foundation/foundation.slider.js',
		'./foundation/js/foundation/foundation.tab.js',
		'./foundation/js/foundation/foundation.tooltip.js',
		'./foundation/js/foundation/foundation.topbar.js'
		])
		.pipe(sourcemaps.init())
		.pipe(concat('foundation-all.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./foundation/js/'));
});

//JSHint
gulp.task('lint', function() {
	return gulp.src('./js/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter(stylish));
});

//Watch
gulp.task('watch', function() {
	livereload.listen();
	//watch scss files
	gulp.watch('sass/**/*.scss', ['sass-theme']);
	gulp.watch('foundation/scss/**/*.scss', ['sass-foundation']);
	gulp.watch('foundation/scss/normalize.scss', ['sass-normalize']);
	
	//watch js files
	gulp.watch('js/lib/*.js', ['scripts-theme', 'lint']);
});

gulp.task('default', ['sass-theme', 'sass-foundation', 'sass-normalize', 'scripts-theme', 'scripts-foundation', 'lint', 'watch']);