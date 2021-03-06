Using Foundation Build 2015-03-28
https://github.com/zurb/bower-foundation
https://github.com/zurb/bower-foundation.git



**Installation**
_heptagonally comes with a basic `gulpfile.js`, a `package.json` file and a blank `.gitignore` if you're into that sort of thing.

1. Install gulp globally:
```
$ npm install --global gulp
```

2. Install gulp in your project devDependencies:
```
$ npm install --save-dev gulp
```

3. Install the gulp plugins that are included in this theme:
```
$ npm install --save-dev gulp-util gulp-watch gulp-sourcemaps gulp-sass gulp-concat gulp-jshint jshint-stylish gulp-livereload
```



**Sass**
Underscores Sass is compiled into the main theme stylesheet, `style.css`
Foundation Sass and `normalize.scss` are compiled separately in the `foundation` folder, and enqueued in `functions.php`


**JS**
Foundations JS is all concatenated into a `foundations-all.js` file, which is enqueued in `functions.php`.

Individual plugins are all included by default, but can be removed from the concatenated file by commenting out the individual scripts in `gulpfile.js`. Example:
```javascript
	gulp.task('scripts-foundation', function() {
	gulp.src([
		'./foundation/js/foundation/foundation.js',
		'./foundation/js/foundation/foundation.abide.js',
		//'./foundation/js/foundation/foundation.accordion.js',
		//'./foundation/js/foundation/foundation.alert.js',
		'./foundation/js/foundation/foundation.clearing.js',
		'./foundation/js/foundation/foundation.dropdown.js',
		'./foundation/js/foundation/foundation.equalizer.js',
		'./foundation/js/foundation/foundation.interchange.js',
		'./foundation/js/foundation/foundation.joyride.js',
		'./foundation/js/foundation/foundation.magellan.js',
		//'./foundation/js/foundation/foundation.offcanvas.js',
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
```
These files are *not* watched.

Modernizer is enqueued separately in `functions.php`




[![Build Status](https://travis-ci.org/Automattic/_s.svg?branch=master)](https://travis-ci.org/Automattic/_s)

_s
===

Hi. I'm a starter theme called `_s`, or `underscores`, if you like. I'm a theme meant for hacking so don't use me as a Parent Theme. Instead try turning me into the next, most awesome, WordPress theme out there. That's what I'm here for.

My ultra-minimal CSS might make me look like theme tartare but that means less stuff to get in your way when you're designing your awesome theme. Here are some of the other more interesting things you'll find here:

* A just right amount of lean, well-commented, modern, HTML5 templates.
* A helpful 404 template.
* A sample custom header implementation in `inc/custom-header.php` that can be activated by uncommenting one line in `functions.php` and adding the code snippet found in the comments of `inc/custom-header.php` to your `header.php` template.
* Custom template tags in `inc/template-tags.php` that keep your templates clean and neat and prevent code duplication.
* Some small tweaks in `inc/extras.php` that can improve your theming experience.
* A script at `js/navigation.js` that makes your menu a toggled dropdown on small screens (like your phone), ready for CSS artistry. It's enqueued in `functions.php`.
* 2 sample CSS layouts in `layouts/` for a sidebar on either side of your content.
* Smartly organized starter CSS in `style.css` that will help you to quickly get your design off the ground.
* Licensed under GPLv2 or later. :) Use it to make something cool.

Getting Started
---------------

If you want to keep it simple, head over to http://underscores.me and generate your `_s` based theme from there. You just input the name of the theme you want to create, click the "Generate" button, and you get your ready-to-awesomize starter theme.

If you want to set things up manually, download `_s` from GitHub. The first thing you want to do is copy the `_s` directory and change the name to something else (like, say, `megatherium`), and then you'll need to do a five-step find and replace on the name in all the templates.

1. Search for `'_s'` (inside single quotations) to capture the text domain.
2. Search for `_s_` to capture all the function names.
3. Search for `Text Domain: _s` in style.css.
4. Search for <code>&nbsp;_s</code> (with a space before it) to capture DocBlocks.
5. Search for `_s-` to capture prefixed handles.

OR

* Search for: `'_s'` and replace with: `'megatherium'`
* Search for: `_s_` and replace with: `megatherium_`
* Search for: `Text Domain: _s` and replace with: `Text Domain: megatherium` in style.css.
* Search for: <code>&nbsp;_s</code> and replace with: <code>&nbsp;Megatherium</code>
* Search for: `_s-` and replace with: `megatherium-`

Then, update the stylesheet header in `style.css` and the links in `footer.php` with your own information. Next, update or delete this readme.

Now you're ready to go! The next step is easy to say, but harder to do: make an awesome WordPress theme. :)

Good luck!
