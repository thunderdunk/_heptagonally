/*
 * Foundation Responsive Library
 * http://foundation.zurb.com
 * Copyright 2014, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/

(function ($, window, document, undefined) {
  'use strict';

  var header_helpers = function (class_array) {
    var i = class_array.length;
    var head = $('head');

    while (i--) {
      if (head.has('.' + class_array[i]).length === 0) {
        head.append('<meta class="' + class_array[i] + '" />');
      }
    }
  };

  header_helpers([
    'foundation-mq-small',
    'foundation-mq-small-only',
    'foundation-mq-medium',
    'foundation-mq-medium-only',
    'foundation-mq-large',
    'foundation-mq-large-only',
    'foundation-mq-xlarge',
    'foundation-mq-xlarge-only',
    'foundation-mq-xxlarge',
    'foundation-data-attribute-namespace']);

  // Enable FastClick if present

  $(function () {
    if (typeof FastClick !== 'undefined') {
      // Don't attach to body if undefined
      if (typeof document.body !== 'undefined') {
        FastClick.attach(document.body);
      }
    }
  });

  // private Fast Selector wrapper,
  // returns jQuery object. Only use where
  // getElementById is not available.
  var S = function (selector, context) {
    if (typeof selector === 'string') {
      if (context) {
        var cont;
        if (context.jquery) {
          cont = context[0];
          if (!cont) {
            return context;
          }
        } else {
          cont = context;
        }
        return $(cont.querySelectorAll(selector));
      }

      return $(document.querySelectorAll(selector));
    }

    return $(selector, context);
  };

  // Namespace functions.

  var attr_name = function (init) {
    var arr = [];
    if (!init) {
      arr.push('data');
    }
    if (this.namespace.length > 0) {
      arr.push(this.namespace);
    }
    arr.push(this.name);

    return arr.join('-');
  };

  var add_namespace = function (str) {
    var parts = str.split('-'),
        i = parts.length,
        arr = [];

    while (i--) {
      if (i !== 0) {
        arr.push(parts[i]);
      } else {
        if (this.namespace.length > 0) {
          arr.push(this.namespace, parts[i]);
        } else {
          arr.push(parts[i]);
        }
      }
    }

    return arr.reverse().join('-');
  };

  // Event binding and data-options updating.

  var bindings = function (method, options) {
    var self = this,
        bind = function(){
          var $this = S(this),
              should_bind_events = !$this.data(self.attr_name(true) + '-init');
          $this.data(self.attr_name(true) + '-init', $.extend({}, self.settings, (options || method), self.data_options($this)));

          if (should_bind_events) {
            self.events(this);
          }
        };

    if (S(this.scope).is('[' + this.attr_name() +']')) {
      bind.call(this.scope);
    } else {
      S('[' + this.attr_name() +']', this.scope).each(bind);
    }
    // # Patch to fix #5043 to move this *after* the if/else clause in order for Backbone and similar frameworks to have improved control over event binding and data-options updating.
    if (typeof method === 'string') {
      return this[method].call(this, options);
    }

  };

  var single_image_loaded = function (image, callback) {
    function loaded () {
      callback(image[0]);
    }

    function bindLoad () {
      this.one('load', loaded);

      if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
        var src = this.attr( 'src' ),
            param = src.match( /\?/ ) ? '&' : '?';

        param += 'random=' + (new Date()).getTime();
        this.attr('src', src + param);
      }
    }

    if (!image.attr('src')) {
      loaded();
      return;
    }

    if (image[0].complete || image[0].readyState === 4) {
      loaded();
    } else {
      bindLoad.call(image);
    }
  };

  /*
    https://github.com/paulirish/matchMedia.js
  */

  window.matchMedia = window.matchMedia || (function ( doc ) {

    'use strict';

    var bool,
        docElem = doc.documentElement,
        refNode = docElem.firstElementChild || docElem.firstChild,
        // fakeBody required for <FF4 when executed in <head>
        fakeBody = doc.createElement( 'body' ),
        div = doc.createElement( 'div' );

    div.id = 'mq-test-1';
    div.style.cssText = 'position:absolute;top:-100em';
    fakeBody.style.background = 'none';
    fakeBody.appendChild(div);

    return function (q) {

      div.innerHTML = '&shy;<style media="' + q + '"> #mq-test-1 { width: 42px; }</style>';

      docElem.insertBefore( fakeBody, refNode );
      bool = div.offsetWidth === 42;
      docElem.removeChild( fakeBody );

      return {
        matches : bool,
        media : q
      };

    };

  }( document ));

  /*
   * jquery.requestAnimationFrame
   * https://github.com/gnarf37/jquery-requestAnimationFrame
   * Requires jQuery 1.8+
   *
   * Copyright (c) 2012 Corey Frang
   * Licensed under the MIT license.
   */

  (function(jQuery) {


  // requestAnimationFrame polyfill adapted from Erik Möller
  // fixes from Paul Irish and Tino Zijdel
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

  var animating,
      lastTime = 0,
      vendors = ['webkit', 'moz'],
      requestAnimationFrame = window.requestAnimationFrame,
      cancelAnimationFrame = window.cancelAnimationFrame,
      jqueryFxAvailable = 'undefined' !== typeof jQuery.fx;

  for (; lastTime < vendors.length && !requestAnimationFrame; lastTime++) {
    requestAnimationFrame = window[ vendors[lastTime] + 'RequestAnimationFrame' ];
    cancelAnimationFrame = cancelAnimationFrame ||
      window[ vendors[lastTime] + 'CancelAnimationFrame' ] ||
      window[ vendors[lastTime] + 'CancelRequestAnimationFrame' ];
  }

  function raf() {
    if (animating) {
      requestAnimationFrame(raf);

      if (jqueryFxAvailable) {
        jQuery.fx.tick();
      }
    }
  }

  if (requestAnimationFrame) {
    // use rAF
    window.requestAnimationFrame = requestAnimationFrame;
    window.cancelAnimationFrame = cancelAnimationFrame;

    if (jqueryFxAvailable) {
      jQuery.fx.timer = function (timer) {
        if (timer() && jQuery.timers.push(timer) && !animating) {
          animating = true;
          raf();
        }
      };

      jQuery.fx.stop = function () {
        animating = false;
      };
    }
  } else {
    // polyfill
    window.requestAnimationFrame = function (callback) {
      var currTime = new Date().getTime(),
        timeToCall = Math.max(0, 16 - (currTime - lastTime)),
        id = window.setTimeout(function () {
          callback(currTime + timeToCall);
        }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };

  }

  }( $ ));

  function removeQuotes (string) {
    if (typeof string === 'string' || string instanceof String) {
      string = string.replace(/^['\\/"]+|(;\s?})+|['\\/"]+$/g, '');
    }

    return string;
  }

  window.Foundation = {
    name : 'Foundation',

    version : '5.5.1',

    media_queries : {
      'small'       : S('.foundation-mq-small').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'small-only'  : S('.foundation-mq-small-only').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'medium'      : S('.foundation-mq-medium').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'medium-only' : S('.foundation-mq-medium-only').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'large'       : S('.foundation-mq-large').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'large-only'  : S('.foundation-mq-large-only').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'xlarge'      : S('.foundation-mq-xlarge').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'xlarge-only' : S('.foundation-mq-xlarge-only').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'xxlarge'     : S('.foundation-mq-xxlarge').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, '')
    },

    stylesheet : $('<style></style>').appendTo('head')[0].sheet,

    global : {
      namespace : undefined
    },

    init : function (scope, libraries, method, options, response) {
      var args = [scope, method, options, response],
          responses = [];

      // check RTL
      this.rtl = /rtl/i.test(S('html').attr('dir'));

      // set foundation global scope
      this.scope = scope || this.scope;

      this.set_namespace();

      if (libraries && typeof libraries === 'string' && !/reflow/i.test(libraries)) {
        if (this.libs.hasOwnProperty(libraries)) {
          responses.push(this.init_lib(libraries, args));
        }
      } else {
        for (var lib in this.libs) {
          responses.push(this.init_lib(lib, libraries));
        }
      }

      S(window).load(function () {
        S(window)
          .trigger('resize.fndtn.clearing')
          .trigger('resize.fndtn.dropdown')
          .trigger('resize.fndtn.equalizer')
          .trigger('resize.fndtn.interchange')
          .trigger('resize.fndtn.joyride')
          .trigger('resize.fndtn.magellan')
          .trigger('resize.fndtn.topbar')
          .trigger('resize.fndtn.slider');
      });

      return scope;
    },

    init_lib : function (lib, args) {
      if (this.libs.hasOwnProperty(lib)) {
        this.patch(this.libs[lib]);

        if (args && args.hasOwnProperty(lib)) {
            if (typeof this.libs[lib].settings !== 'undefined') {
              $.extend(true, this.libs[lib].settings, args[lib]);
            } else if (typeof this.libs[lib].defaults !== 'undefined') {
              $.extend(true, this.libs[lib].defaults, args[lib]);
            }
          return this.libs[lib].init.apply(this.libs[lib], [this.scope, args[lib]]);
        }

        args = args instanceof Array ? args : new Array(args);
        return this.libs[lib].init.apply(this.libs[lib], args);
      }

      return function () {};
    },

    patch : function (lib) {
      lib.scope = this.scope;
      lib.namespace = this.global.namespace;
      lib.rtl = this.rtl;
      lib['data_options'] = this.utils.data_options;
      lib['attr_name'] = attr_name;
      lib['add_namespace'] = add_namespace;
      lib['bindings'] = bindings;
      lib['S'] = this.utils.S;
    },

    inherit : function (scope, methods) {
      var methods_arr = methods.split(' '),
          i = methods_arr.length;

      while (i--) {
        if (this.utils.hasOwnProperty(methods_arr[i])) {
          scope[methods_arr[i]] = this.utils[methods_arr[i]];
        }
      }
    },

    set_namespace : function () {

      // Description:
      //    Don't bother reading the namespace out of the meta tag
      //    if the namespace has been set globally in javascript
      //
      // Example:
      //    Foundation.global.namespace = 'my-namespace';
      // or make it an empty string:
      //    Foundation.global.namespace = '';
      //
      //

      // If the namespace has not been set (is undefined), try to read it out of the meta element.
      // Otherwise use the globally defined namespace, even if it's empty ('')
      var namespace = ( this.global.namespace === undefined ) ? $('.foundation-data-attribute-namespace').css('font-family') : this.global.namespace;

      // Finally, if the namsepace is either undefined or false, set it to an empty string.
      // Otherwise use the namespace value.
      this.global.namespace = ( namespace === undefined || /false/i.test(namespace) ) ? '' : namespace;
    },

    libs : {},

    // methods that can be inherited in libraries
    utils : {

      // Description:
      //    Fast Selector wrapper returns jQuery object. Only use where getElementById
      //    is not available.
      //
      // Arguments:
      //    Selector (String): CSS selector describing the element(s) to be
      //    returned as a jQuery object.
      //
      //    Scope (String): CSS selector describing the area to be searched. Default
      //    is document.
      //
      // Returns:
      //    Element (jQuery Object): jQuery object containing elements matching the
      //    selector within the scope.
      S : S,

      // Description:
      //    Executes a function a max of once every n milliseconds
      //
      // Arguments:
      //    Func (Function): Function to be throttled.
      //
      //    Delay (Integer): Function execution threshold in milliseconds.
      //
      // Returns:
      //    Lazy_function (Function): Function with throttling applied.
      throttle : function (func, delay) {
        var timer = null;

        return function () {
          var context = this, args = arguments;

          if (timer == null) {
            timer = setTimeout(function () {
              func.apply(context, args);
              timer = null;
            }, delay);
          }
        };
      },

      // Description:
      //    Executes a function when it stops being invoked for n seconds
      //    Modified version of _.debounce() http://underscorejs.org
      //
      // Arguments:
      //    Func (Function): Function to be debounced.
      //
      //    Delay (Integer): Function execution threshold in milliseconds.
      //
      //    Immediate (Bool): Whether the function should be called at the beginning
      //    of the delay instead of the end. Default is false.
      //
      // Returns:
      //    Lazy_function (Function): Function with debouncing applied.
      debounce : function (func, delay, immediate) {
        var timeout, result;
        return function () {
          var context = this, args = arguments;
          var later = function () {
            timeout = null;
            if (!immediate) {
              result = func.apply(context, args);
            }
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, delay);
          if (callNow) {
            result = func.apply(context, args);
          }
          return result;
        };
      },

      // Description:
      //    Parses data-options attribute
      //
      // Arguments:
      //    El (jQuery Object): Element to be parsed.
      //
      // Returns:
      //    Options (Javascript Object): Contents of the element's data-options
      //    attribute.
      data_options : function (el, data_attr_name) {
        data_attr_name = data_attr_name || 'options';
        var opts = {}, ii, p, opts_arr,
            data_options = function (el) {
              var namespace = Foundation.global.namespace;

              if (namespace.length > 0) {
                return el.data(namespace + '-' + data_attr_name);
              }

              return el.data(data_attr_name);
            };

        var cached_options = data_options(el);

        if (typeof cached_options === 'object') {
          return cached_options;
        }

        opts_arr = (cached_options || ':').split(';');
        ii = opts_arr.length;

        function isNumber (o) {
          return !isNaN (o - 0) && o !== null && o !== '' && o !== false && o !== true;
        }

        function trim (str) {
          if (typeof str === 'string') {
            return $.trim(str);
          }
          return str;
        }

        while (ii--) {
          p = opts_arr[ii].split(':');
          p = [p[0], p.slice(1).join(':')];

          if (/true/i.test(p[1])) {
            p[1] = true;
          }
          if (/false/i.test(p[1])) {
            p[1] = false;
          }
          if (isNumber(p[1])) {
            if (p[1].indexOf('.') === -1) {
              p[1] = parseInt(p[1], 10);
            } else {
              p[1] = parseFloat(p[1]);
            }
          }

          if (p.length === 2 && p[0].length > 0) {
            opts[trim(p[0])] = trim(p[1]);
          }
        }

        return opts;
      },

      // Description:
      //    Adds JS-recognizable media queries
      //
      // Arguments:
      //    Media (String): Key string for the media query to be stored as in
      //    Foundation.media_queries
      //
      //    Class (String): Class name for the generated <meta> tag
      register_media : function (media, media_class) {
        if (Foundation.media_queries[media] === undefined) {
          $('head').append('<meta class="' + media_class + '"/>');
          Foundation.media_queries[media] = removeQuotes($('.' + media_class).css('font-family'));
        }
      },

      // Description:
      //    Add custom CSS within a JS-defined media query
      //
      // Arguments:
      //    Rule (String): CSS rule to be appended to the document.
      //
      //    Media (String): Optional media query string for the CSS rule to be
      //    nested under.
      add_custom_rule : function (rule, media) {
        if (media === undefined && Foundation.stylesheet) {
          Foundation.stylesheet.insertRule(rule, Foundation.stylesheet.cssRules.length);
        } else {
          var query = Foundation.media_queries[media];

          if (query !== undefined) {
            Foundation.stylesheet.insertRule('@media ' +
              Foundation.media_queries[media] + '{ ' + rule + ' }', Foundation.stylesheet.cssRules.length);
          }
        }
      },

      // Description:
      //    Performs a callback function when an image is fully loaded
      //
      // Arguments:
      //    Image (jQuery Object): Image(s) to check if loaded.
      //
      //    Callback (Function): Function to execute when image is fully loaded.
      image_loaded : function (images, callback) {
        var self = this,
            unloaded = images.length;

        function pictures_has_height(images) {
          var pictures_number = images.length;

          for (var i = pictures_number - 1; i >= 0; i--) {
            if(images.attr('height') === undefined) {
              return false;
            };
          };

          return true;
        }

        if (unloaded === 0 || pictures_has_height(images)) {
          callback(images);
        }

        images.each(function () {
          single_image_loaded(self.S(this), function () {
            unloaded -= 1;
            if (unloaded === 0) {
              callback(images);
            }
          });
        });
      },

      // Description:
      //    Returns a random, alphanumeric string
      //
      // Arguments:
      //    Length (Integer): Length of string to be generated. Defaults to random
      //    integer.
      //
      // Returns:
      //    Rand (String): Pseudo-random, alphanumeric string.
      random_str : function () {
        if (!this.fidx) {
          this.fidx = 0;
        }
        this.prefix = this.prefix || [(this.name || 'F'), (+new Date).toString(36)].join('-');

        return this.prefix + (this.fidx++).toString(36);
      },

      // Description:
      //    Helper for window.matchMedia
      //
      // Arguments:
      //    mq (String): Media query
      //
      // Returns:
      //    (Boolean): Whether the media query passes or not
      match : function (mq) {
        return window.matchMedia(mq).matches;
      },

      // Description:
      //    Helpers for checking Foundation default media queries with JS
      //
      // Returns:
      //    (Boolean): Whether the media query passes or not

      is_small_up : function () {
        return this.match(Foundation.media_queries.small);
      },

      is_medium_up : function () {
        return this.match(Foundation.media_queries.medium);
      },

      is_large_up : function () {
        return this.match(Foundation.media_queries.large);
      },

      is_xlarge_up : function () {
        return this.match(Foundation.media_queries.xlarge);
      },

      is_xxlarge_up : function () {
        return this.match(Foundation.media_queries.xxlarge);
      },

      is_small_only : function () {
        return !this.is_medium_up() && !this.is_large_up() && !this.is_xlarge_up() && !this.is_xxlarge_up();
      },

      is_medium_only : function () {
        return this.is_medium_up() && !this.is_large_up() && !this.is_xlarge_up() && !this.is_xxlarge_up();
      },

      is_large_only : function () {
        return this.is_medium_up() && this.is_large_up() && !this.is_xlarge_up() && !this.is_xxlarge_up();
      },

      is_xlarge_only : function () {
        return this.is_medium_up() && this.is_large_up() && this.is_xlarge_up() && !this.is_xxlarge_up();
      },

      is_xxlarge_only : function () {
        return this.is_medium_up() && this.is_large_up() && this.is_xlarge_up() && this.is_xxlarge_up();
      }
    }
  };

  $.fn.foundation = function () {
    var args = Array.prototype.slice.call(arguments, 0);

    return this.each(function () {
      Foundation.init.apply(Foundation, [this].concat(args));
      return this;
    });
  };

}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.abide = {
    name : 'abide',

    version : '5.5.1',

    settings : {
      live_validate : true,
      validate_on_blur : true,
      // validate_on: 'tab', // tab (when user tabs between fields), change (input changes), manual (call custom events) 
      focus_on_invalid : true,
      error_labels : true, // labels with a for="inputId" will recieve an `error` class
      error_class : 'error',
      timeout : 1000,
      patterns : {
        alpha : /^[a-zA-Z]+$/,
        alpha_numeric : /^[a-zA-Z0-9]+$/,
        integer : /^[-+]?\d+$/,
        number : /^[-+]?\d*(?:[\.\,]\d+)?$/,

        // amex, visa, diners
        card : /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
        cvv : /^([0-9]){3,4}$/,

        // http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#valid-e-mail-address
        email : /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,

        // http://blogs.lse.ac.uk/lti/2008/04/23/a-regular-expression-to-match-any-url/
        url: /^(https?|ftp|file|ssh):\/\/([-;:&=\+\$,\w]+@{1})?([-A-Za-z0-9\.]+)+:?(\d+)?((\/[-\+~%\/\.\w]+)?\??([-\+=&;%@\.\w]+)?#?([\w]+)?)?/,
        // abc.de
        domain : /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,8}$/,

        datetime : /^([0-2][0-9]{3})\-([0-1][0-9])\-([0-3][0-9])T([0-5][0-9])\:([0-5][0-9])\:([0-5][0-9])(Z|([\-\+]([0-1][0-9])\:00))$/,
        // YYYY-MM-DD
        date : /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))$/,
        // HH:MM:SS
        time : /^(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}$/,
        dateISO : /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/,
        // MM/DD/YYYY
        month_day_year : /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d{4}$/,
        // DD/MM/YYYY
        day_month_year : /^(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.]\d{4}$/,

        // #FFF or #FFFFFF
        color : /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
      },
      validators : {
        equalTo : function (el, required, parent) {
          var from  = document.getElementById(el.getAttribute(this.add_namespace('data-equalto'))).value,
              to    = el.value,
              valid = (from === to);

          return valid;
        }
      }
    },

    timer : null,

    init : function (scope, method, options) {
      this.bindings(method, options);
    },

    events : function (scope) {
      var self = this,
          form = self.S(scope).attr('novalidate', 'novalidate'),
          settings = form.data(this.attr_name(true) + '-init') || {};

      this.invalid_attr = this.add_namespace('data-invalid');

      function validate(originalSelf, e) {
        clearTimeout(self.timer);
        self.timer = setTimeout(function () {
          self.validate([originalSelf], e);
        }.bind(originalSelf), settings.timeout);
      }


      form
        .off('.abide')
        .on('submit.fndtn.abide', function (e) {
          var is_ajax = /ajax/i.test(self.S(this).attr(self.attr_name()));
          return self.validate(self.S(this).find('input, textarea, select').not(":hidden, [data-abide-ignore]").get(), e, is_ajax);
        })
        .on('validate.fndtn.abide', function (e) {
          if (settings.validate_on === 'manual') {
            self.validate([e.target], e);
          }
        })
        .on('reset', function (e) {
          return self.reset($(this), e);          
        })
        .find('input, textarea, select').not(":hidden, [data-abide-ignore]")
          .off('.abide')
          .on('blur.fndtn.abide change.fndtn.abide', function (e) {
            // old settings fallback
            // will be deprecated with F6 release
            if (settings.validate_on_blur && settings.validate_on_blur === true) {
              validate(this, e);
            }
            // new settings combining validate options into one setting
            if (settings.validate_on === 'change') {
              validate(this, e);
            }
          })
          .on('keydown.fndtn.abide', function (e) {
            // old settings fallback
            // will be deprecated with F6 release
            if (settings.live_validate && settings.live_validate === true && e.which != 9) {
              validate(this, e);
            }
            // new settings combining validate options into one setting
            if (settings.validate_on === 'tab' && e.which === 9) {
              validate(this, e);
            }
            else if (settings.validate_on === 'change') {
              validate(this, e);
            }
          })
          .on('focus', function (e) {
            if (navigator.userAgent.match(/iPad|iPhone|Android|BlackBerry|Windows Phone|webOS/i)) {
              $('html, body').animate({
                  scrollTop: $(e.target).offset().top
              }, 100);
            } 
          });
    },

    reset : function (form, e) {
      var self = this;
      form.removeAttr(self.invalid_attr);

      $('[' + self.invalid_attr + ']', form).removeAttr(self.invalid_attr);
      $('.' + self.settings.error_class, form).not('small').removeClass(self.settings.error_class);
      $(':input', form).not(':button, :submit, :reset, :hidden, [data-abide-ignore]').val('').removeAttr(self.invalid_attr);
    },

    validate : function (els, e, is_ajax) {
      var validations = this.parse_patterns(els),
          validation_count = validations.length,
          form = this.S(els[0]).closest('form'),
          submit_event = /submit/.test(e.type);

      // Has to count up to make sure the focus gets applied to the top error
      for (var i = 0; i < validation_count; i++) {
        if (!validations[i] && (submit_event || is_ajax)) {
          if (this.settings.focus_on_invalid) {
            els[i].focus();
          }
          form.trigger('invalid.fndtn.abide');
          this.S(els[i]).closest('form').attr(this.invalid_attr, '');
          return false;
        }
      }

      if (submit_event || is_ajax) {
        form.trigger('valid.fndtn.abide');
      }

      form.removeAttr(this.invalid_attr);

      if (is_ajax) {
        return false;
      }

      return true;
    },

    parse_patterns : function (els) {
      var i = els.length,
          el_patterns = [];

      while (i--) {
        el_patterns.push(this.pattern(els[i]));
      }

      return this.check_validation_and_apply_styles(el_patterns);
    },

    pattern : function (el) {
      var type = el.getAttribute('type'),
          required = typeof el.getAttribute('required') === 'string';

      var pattern = el.getAttribute('pattern') || '';

      if (this.settings.patterns.hasOwnProperty(pattern) && pattern.length > 0) {
        return [el, this.settings.patterns[pattern], required];
      } else if (pattern.length > 0) {
        return [el, new RegExp(pattern), required];
      }

      if (this.settings.patterns.hasOwnProperty(type)) {
        return [el, this.settings.patterns[type], required];
      }

      pattern = /.*/;

      return [el, pattern, required];
    },

    // TODO: Break this up into smaller methods, getting hard to read.
    check_validation_and_apply_styles : function (el_patterns) {
      var i = el_patterns.length,
          validations = [],
          form = this.S(el_patterns[0][0]).closest('[data-' + this.attr_name(true) + ']'),
          settings = form.data(this.attr_name(true) + '-init') || {};
      while (i--) {
        var el = el_patterns[i][0],
            required = el_patterns[i][2],
            value = el.value.trim(),
            direct_parent = this.S(el).parent(),
            validator = el.getAttribute(this.add_namespace('data-abide-validator')),
            is_radio = el.type === 'radio',
            is_checkbox = el.type === 'checkbox',
            label = this.S('label[for="' + el.getAttribute('id') + '"]'),
            valid_length = (required) ? (el.value.length > 0) : true,
            el_validations = [];

        var parent, valid;

        // support old way to do equalTo validations
        if (el.getAttribute(this.add_namespace('data-equalto'))) { validator = 'equalTo' }

        if (!direct_parent.is('label')) {
          parent = direct_parent;
        } else {
          parent = direct_parent.parent();
        }

        if (is_radio && required) {
          el_validations.push(this.valid_radio(el, required));
        } else if (is_checkbox && required) {
          el_validations.push(this.valid_checkbox(el, required));

        } else if (validator) {
          // Validate using each of the specified (space-delimited) validators.
          var validators = validator.split(' ');
          var last_valid = true, all_valid = true;
          for (var iv = 0; iv < validators.length; iv++) {
              valid = this.settings.validators[validators[iv]].apply(this, [el, required, parent])
              el_validations.push(valid);
              all_valid = valid && last_valid;
              last_valid = valid;
          }
          if (all_valid) {
              this.S(el).removeAttr(this.invalid_attr);
              parent.removeClass('error');
              $(el).triggerHandler('valid');
          } else {
              this.S(el).attr(this.invalid_attr, '');
              parent.addClass('error');
              $(el).triggerHandler('invalid');
          }
        } else {

          if (el_patterns[i][1].test(value) && valid_length ||
            !required && el.value.length < 1 || $(el).attr('disabled')) {
            el_validations.push(true);
          } else {
            el_validations.push(false);
          }

          el_validations = [el_validations.every(function (valid) {return valid;})];

          if (el_validations[0]) {
            this.S(el).removeAttr(this.invalid_attr);
            el.setAttribute('aria-invalid', 'false');
            el.removeAttribute('aria-describedby');
            parent.removeClass(this.settings.error_class);
            if (label.length > 0 && this.settings.error_labels) {
              label.removeClass(this.settings.error_class).removeAttr('role');
            }
            $(el).triggerHandler('valid');
          } else {
            this.S(el).attr(this.invalid_attr, '');
            el.setAttribute('aria-invalid', 'true');

            // Try to find the error associated with the input
            var errorElem = parent.find('small.' + this.settings.error_class, 'span.' + this.settings.error_class);
            var errorID = errorElem.length > 0 ? errorElem[0].id : '';
            if (errorID.length > 0) {
              el.setAttribute('aria-describedby', errorID);
            }

            // el.setAttribute('aria-describedby', $(el).find('.error')[0].id);
            parent.addClass(this.settings.error_class);
            if (label.length > 0 && this.settings.error_labels) {
              label.addClass(this.settings.error_class).attr('role', 'alert');
            }
            $(el).triggerHandler('invalid');
          }
        }
        validations = validations.concat(el_validations);
      }
      return validations;
    },

    valid_checkbox : function (el, required) {
      var el = this.S(el),
          valid = (el.is(':checked') || !required || el.get(0).getAttribute('disabled'));

      if (valid) {
        el.removeAttr(this.invalid_attr).parent().removeClass(this.settings.error_class);
        $(el).triggerHandler('valid');
      } else {
        el.attr(this.invalid_attr, '').parent().addClass(this.settings.error_class);
        $(el).triggerHandler('invalid');
      }

      return valid;
    },

    valid_radio : function (el, required) {
      var name = el.getAttribute('name'),
          group = this.S(el).closest('[data-' + this.attr_name(true) + ']').find("[name='" + name + "']"),
          count = group.length,
          valid = false,
          disabled = false;

      // Has to count up to make sure the focus gets applied to the top error
        for (var i=0; i < count; i++) {
            if( group[i].getAttribute('disabled') ){
                disabled=true;
                valid=true;
            } else {
                if (group[i].checked){
                    valid = true;
                } else {
                    if( disabled ){
                        valid = false;
                    }
                }
            }
        }

      // Has to count up to make sure the focus gets applied to the top error
      for (var i = 0; i < count; i++) {
        if (valid) {
          this.S(group[i]).removeAttr(this.invalid_attr).parent().removeClass(this.settings.error_class);
          $(group[i]).triggerHandler('valid');
        } else {
          this.S(group[i]).attr(this.invalid_attr, '').parent().addClass(this.settings.error_class);
          $(group[i]).triggerHandler('invalid');
        }
      }

      return valid;
    },

    valid_equal : function (el, required, parent) {
      var from  = document.getElementById(el.getAttribute(this.add_namespace('data-equalto'))).value,
          to    = el.value,
          valid = (from === to);

      if (valid) {
        this.S(el).removeAttr(this.invalid_attr);
        parent.removeClass(this.settings.error_class);
        if (label.length > 0 && settings.error_labels) {
          label.removeClass(this.settings.error_class);
        }
      } else {
        this.S(el).attr(this.invalid_attr, '');
        parent.addClass(this.settings.error_class);
        if (label.length > 0 && settings.error_labels) {
          label.addClass(this.settings.error_class);
        }
      }

      return valid;
    },

    valid_oneof : function (el, required, parent, doNotValidateOthers) {
      var el = this.S(el),
        others = this.S('[' + this.add_namespace('data-oneof') + ']'),
        valid = others.filter(':checked').length > 0;

      if (valid) {
        el.removeAttr(this.invalid_attr).parent().removeClass(this.settings.error_class);
      } else {
        el.attr(this.invalid_attr, '').parent().addClass(this.settings.error_class);
      }

      if (!doNotValidateOthers) {
        var _this = this;
        others.each(function () {
          _this.valid_oneof.call(_this, this, null, null, true);
        });
      }

      return valid;
    },

    reflow : function(scope, options) {
      var self = this,
          form = self.S('[' + this.attr_name() + ']').attr('novalidate', 'novalidate');
          self.S(form).each(function (idx, el) {
            self.events(el);
          });
    }
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.accordion = {
    name : 'accordion',

    version : '5.5.1',

    settings : {
      content_class : 'content',
      active_class : 'active',
      multi_expand : false,
      toggleable : true,
      callback : function () {}
    },

    init : function (scope, method, options) {
      this.bindings(method, options);
    },

    events : function (instance) {
      var self = this;
      var S = this.S;
      self.create(this.S(instance));

      S(this.scope)
      .off('.fndtn.accordion')
      .on('click.fndtn.accordion', '[' + this.attr_name() + '] > dd > a, [' + this.attr_name() + '] > li > a', function (e) {
        var accordion = S(this).closest('[' + self.attr_name() + ']'),
            groupSelector = self.attr_name() + '=' + accordion.attr(self.attr_name()),
            settings = accordion.data(self.attr_name(true) + '-init') || self.settings,
            target = S('#' + this.href.split('#')[1]),
            aunts = $('> dd, > li', accordion),
            siblings = aunts.children('.' + settings.content_class),
            active_content = siblings.filter('.' + settings.active_class);

        e.preventDefault();

        if (accordion.attr(self.attr_name())) {
          siblings = siblings.add('[' + groupSelector + '] dd > ' + '.' + settings.content_class + ', [' + groupSelector + '] li > ' + '.' + settings.content_class);
          aunts = aunts.add('[' + groupSelector + '] dd, [' + groupSelector + '] li');
        }

        if (settings.toggleable && target.is(active_content)) {
          target.parent('dd, li').toggleClass(settings.active_class, false);
          target.toggleClass(settings.active_class, false);
          S(this).attr('aria-expanded', function(i, attr){
              return attr === 'true' ? 'false' : 'true';
          });
          settings.callback(target);
          target.triggerHandler('toggled', [accordion]);
          accordion.triggerHandler('toggled', [target]);
          return;
        }

        if (!settings.multi_expand) {
          siblings.removeClass(settings.active_class);
          aunts.removeClass(settings.active_class);
          aunts.children('a').attr('aria-expanded','false');
        }

        target.addClass(settings.active_class).parent().addClass(settings.active_class);
        settings.callback(target);
        target.triggerHandler('toggled', [accordion]);
        accordion.triggerHandler('toggled', [target]);
        S(this).attr('aria-expanded','true');
      });
    },

    create: function($instance) {
      var self = this,
          accordion = $instance,
          aunts = $('> .accordion-navigation', accordion),
          settings = accordion.data(self.attr_name(true) + '-init') || self.settings;

      aunts.children('a').attr('aria-expanded','false');
      aunts.has('.' + settings.content_class + '.' + settings.active_class).children('a').attr('aria-expanded','true');

      if (settings.multi_expand) {
        $instance.attr('aria-multiselectable','true');
      }
    },

    off : function () {},

    reflow : function () {}
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.alert = {
    name : 'alert',

    version : '5.5.1',

    settings : {
      callback : function () {}
    },

    init : function (scope, method, options) {
      this.bindings(method, options);
    },

    events : function () {
      var self = this,
          S = this.S;

      $(this.scope).off('.alert').on('click.fndtn.alert', '[' + this.attr_name() + '] .close', function (e) {
        var alertBox = S(this).closest('[' + self.attr_name() + ']'),
            settings = alertBox.data(self.attr_name(true) + '-init') || self.settings;

        e.preventDefault();
        if (Modernizr.csstransitions) {
          alertBox.addClass('alert-close');
          alertBox.on('transitionend webkitTransitionEnd oTransitionEnd', function (e) {
            S(this).trigger('close.fndtn.alert').remove();
            settings.callback();
          });
        } else {
          alertBox.fadeOut(300, function () {
            S(this).trigger('close.fndtn.alert').remove();
            settings.callback();
          });
        }
      });
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.clearing = {
    name : 'clearing',

    version : '5.5.1',

    settings : {
      templates : {
        viewing : '<a href="#" class="clearing-close">&times;</a>' +
          '<div class="visible-img" style="display: none"><div class="clearing-touch-label"></div><img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D" alt="" />' +
          '<p class="clearing-caption"></p><a href="#" class="clearing-main-prev"><span></span></a>' +
          '<a href="#" class="clearing-main-next"><span></span></a></div>'
      },

      // comma delimited list of selectors that, on click, will close clearing,
      // add 'div.clearing-blackout, div.visible-img' to close on background click
      close_selectors : '.clearing-close, div.clearing-blackout',

      // Default to the entire li element.
      open_selectors : '',

      // Image will be skipped in carousel.
      skip_selector : '',

      touch_label : '',

      // event initializers and locks
      init : false,
      locked : false
    },

    init : function (scope, method, options) {
      var self = this;
      Foundation.inherit(this, 'throttle image_loaded');

      this.bindings(method, options);

      if (self.S(this.scope).is('[' + this.attr_name() + ']')) {
        this.assemble(self.S('li', this.scope));
      } else {
        self.S('[' + this.attr_name() + ']', this.scope).each(function () {
          self.assemble(self.S('li', this));
        });
      }
    },

    events : function (scope) {
      var self = this,
          S = self.S,
          $scroll_container = $('.scroll-container');

      if ($scroll_container.length > 0) {
        this.scope = $scroll_container;
      }

      S(this.scope)
        .off('.clearing')
        .on('click.fndtn.clearing', 'ul[' + this.attr_name() + '] li ' + this.settings.open_selectors,
          function (e, current, target) {
            var current = current || S(this),
                target = target || current,
                next = current.next('li'),
                settings = current.closest('[' + self.attr_name() + ']').data(self.attr_name(true) + '-init'),
                image = S(e.target);

            e.preventDefault();

            if (!settings) {
              self.init();
              settings = current.closest('[' + self.attr_name() + ']').data(self.attr_name(true) + '-init');
            }

            // if clearing is open and the current image is
            // clicked, go to the next image in sequence
            if (target.hasClass('visible') &&
              current[0] === target[0] &&
              next.length > 0 && self.is_open(current)) {
              target = next;
              image = S('img', target);
            }

            // set current and target to the clicked li if not otherwise defined.
            self.open(image, current, target);
            self.update_paddles(target);
          })

        .on('click.fndtn.clearing', '.clearing-main-next',
          function (e) { self.nav(e, 'next') })
        .on('click.fndtn.clearing', '.clearing-main-prev',
          function (e) { self.nav(e, 'prev') })
        .on('click.fndtn.clearing', this.settings.close_selectors,
          function (e) { Foundation.libs.clearing.close(e, this) });

      $(document).on('keydown.fndtn.clearing',
          function (e) { self.keydown(e) });

      S(window).off('.clearing').on('resize.fndtn.clearing',
        function () { self.resize() });

      this.swipe_events(scope);
    },

    swipe_events : function (scope) {
      var self = this,
      S = self.S;

      S(this.scope)
        .on('touchstart.fndtn.clearing', '.visible-img', function (e) {
          if (!e.touches) { e = e.originalEvent; }
          var data = {
                start_page_x : e.touches[0].pageX,
                start_page_y : e.touches[0].pageY,
                start_time : (new Date()).getTime(),
                delta_x : 0,
                is_scrolling : undefined
              };

          S(this).data('swipe-transition', data);
          e.stopPropagation();
        })
        .on('touchmove.fndtn.clearing', '.visible-img', function (e) {
          if (!e.touches) {
            e = e.originalEvent;
          }
          // Ignore pinch/zoom events
          if (e.touches.length > 1 || e.scale && e.scale !== 1) {
            return;
          }

          var data = S(this).data('swipe-transition');

          if (typeof data === 'undefined') {
            data = {};
          }

          data.delta_x = e.touches[0].pageX - data.start_page_x;

          if (Foundation.rtl) {
            data.delta_x = -data.delta_x;
          }

          if (typeof data.is_scrolling === 'undefined') {
            data.is_scrolling = !!( data.is_scrolling || Math.abs(data.delta_x) < Math.abs(e.touches[0].pageY - data.start_page_y) );
          }

          if (!data.is_scrolling && !data.active) {
            e.preventDefault();
            var direction = (data.delta_x < 0) ? 'next' : 'prev';
            data.active = true;
            self.nav(e, direction);
          }
        })
        .on('touchend.fndtn.clearing', '.visible-img', function (e) {
          S(this).data('swipe-transition', {});
          e.stopPropagation();
        });
    },

    assemble : function ($li) {
      var $el = $li.parent();

      if ($el.parent().hasClass('carousel')) {
        return;
      }

      $el.after('<div id="foundationClearingHolder"></div>');

      var grid = $el.detach(),
          grid_outerHTML = '';

      if (grid[0] == null) {
        return;
      } else {
        grid_outerHTML = grid[0].outerHTML;
      }

      var holder = this.S('#foundationClearingHolder'),
          settings = $el.data(this.attr_name(true) + '-init'),
          data = {
            grid : '<div class="carousel">' + grid_outerHTML + '</div>',
            viewing : settings.templates.viewing
          },
          wrapper = '<div class="clearing-assembled"><div>' + data.viewing +
            data.grid + '</div></div>',
          touch_label = this.settings.touch_label;

      if (Modernizr.touch) {
        wrapper = $(wrapper).find('.clearing-touch-label').html(touch_label).end();
      }

      holder.after(wrapper).remove();
    },

    open : function ($image, current, target) {
      var self = this,
          body = $(document.body),
          root = target.closest('.clearing-assembled'),
          container = self.S('div', root).first(),
          visible_image = self.S('.visible-img', container),
          image = self.S('img', visible_image).not($image),
          label = self.S('.clearing-touch-label', container),
          error = false;

      // Event to disable scrolling on touch devices when Clearing is activated
      $('body').on('touchmove', function (e) {
        e.preventDefault();
      });

      image.error(function () {
        error = true;
      });

      function startLoad() {
        setTimeout(function () {
          this.image_loaded(image, function () {
            if (image.outerWidth() === 1 && !error) {
              startLoad.call(this);
            } else {
              cb.call(this, image);
            }
          }.bind(this));
        }.bind(this), 100);
      }

      function cb (image) {
        var $image = $(image);
        $image.css('visibility', 'visible');
        $image.trigger('imageVisible');
        // toggle the gallery
        body.css('overflow', 'hidden');
        root.addClass('clearing-blackout');
        container.addClass('clearing-container');
        visible_image.show();
        this.fix_height(target)
          .caption(self.S('.clearing-caption', visible_image), self.S('img', target))
          .center_and_label(image, label)
          .shift(current, target, function () {
            target.closest('li').siblings().removeClass('visible');
            target.closest('li').addClass('visible');
          });
        visible_image.trigger('opened.fndtn.clearing')
      }

      if (!this.locked()) {
        visible_image.trigger('open.fndtn.clearing');
        // set the image to the selected thumbnail
        image
          .attr('src', this.load($image))
          .css('visibility', 'hidden');

        startLoad.call(this);
      }
    },

    close : function (e, el) {
      e.preventDefault();

      var root = (function (target) {
            if (/blackout/.test(target.selector)) {
              return target;
            } else {
              return target.closest('.clearing-blackout');
            }
          }($(el))),
          body = $(document.body), container, visible_image;

      if (el === e.target && root) {
        body.css('overflow', '');
        container = $('div', root).first();
        visible_image = $('.visible-img', container);
        visible_image.trigger('close.fndtn.clearing');
        this.settings.prev_index = 0;
        $('ul[' + this.attr_name() + ']', root)
          .attr('style', '').closest('.clearing-blackout')
          .removeClass('clearing-blackout');
        container.removeClass('clearing-container');
        visible_image.hide();
        visible_image.trigger('closed.fndtn.clearing');
      }

      // Event to re-enable scrolling on touch devices
      $('body').off('touchmove');

      return false;
    },

    is_open : function (current) {
      return current.parent().prop('style').length > 0;
    },

    keydown : function (e) {
      var clearing = $('.clearing-blackout ul[' + this.attr_name() + ']'),
          NEXT_KEY = this.rtl ? 37 : 39,
          PREV_KEY = this.rtl ? 39 : 37,
          ESC_KEY = 27;

      if (e.which === NEXT_KEY) {
        this.go(clearing, 'next');
      }
      if (e.which === PREV_KEY) {
        this.go(clearing, 'prev');
      }
      if (e.which === ESC_KEY) {
        this.S('a.clearing-close').trigger('click.fndtn.clearing');
      }
    },

    nav : function (e, direction) {
      var clearing = $('ul[' + this.attr_name() + ']', '.clearing-blackout');

      e.preventDefault();
      this.go(clearing, direction);
    },

    resize : function () {
      var image = $('img', '.clearing-blackout .visible-img'),
          label = $('.clearing-touch-label', '.clearing-blackout');

      if (image.length) {
        this.center_and_label(image, label);
        image.trigger('resized.fndtn.clearing')
      }
    },

    // visual adjustments
    fix_height : function (target) {
      var lis = target.parent().children(),
          self = this;

      lis.each(function () {
        var li = self.S(this),
            image = li.find('img');

        if (li.height() > image.outerHeight()) {
          li.addClass('fix-height');
        }
      })
      .closest('ul')
      .width(lis.length * 100 + '%');

      return this;
    },

    update_paddles : function (target) {
      target = target.closest('li');
      var visible_image = target
        .closest('.carousel')
        .siblings('.visible-img');

      if (target.next().length > 0) {
        this.S('.clearing-main-next', visible_image).removeClass('disabled');
      } else {
        this.S('.clearing-main-next', visible_image).addClass('disabled');
      }

      if (target.prev().length > 0) {
        this.S('.clearing-main-prev', visible_image).removeClass('disabled');
      } else {
        this.S('.clearing-main-prev', visible_image).addClass('disabled');
      }
    },

    center_and_label : function (target, label) {
      if (!this.rtl && label.length > 0) {
        label.css({
          marginLeft : -(label.outerWidth() / 2),
          marginTop : -(target.outerHeight() / 2)-label.outerHeight()-10
        });
      } else {
        label.css({
          marginRight : -(label.outerWidth() / 2),
          marginTop : -(target.outerHeight() / 2)-label.outerHeight()-10,
          left: 'auto',
          right: '50%'
        });
      }
      return this;
    },

    // image loading and preloading

    load : function ($image) {
      var href;

      if ($image[0].nodeName === 'A') {
        href = $image.attr('href');
      } else {
        href = $image.closest('a').attr('href');
      }

      this.preload($image);

      if (href) {
        return href;
      }
      return $image.attr('src');
    },

    preload : function ($image) {
      this
        .img($image.closest('li').next())
        .img($image.closest('li').prev());
    },

    img : function (img) {
      if (img.length) {
        var new_img = new Image(),
            new_a = this.S('a', img);

        if (new_a.length) {
          new_img.src = new_a.attr('href');
        } else {
          new_img.src = this.S('img', img).attr('src');
        }
      }
      return this;
    },

    // image caption

    caption : function (container, $image) {
      var caption = $image.attr('data-caption');

      if (caption) {
        container
          .html(caption)
          .show();
      } else {
        container
          .text('')
          .hide();
      }
      return this;
    },

    // directional methods

    go : function ($ul, direction) {
      var current = this.S('.visible', $ul),
          target = current[direction]();

      // Check for skip selector.
      if (this.settings.skip_selector && target.find(this.settings.skip_selector).length != 0) {
        target = target[direction]();
      }

      if (target.length) {
        this.S('img', target)
          .trigger('click.fndtn.clearing', [current, target])
          .trigger('change.fndtn.clearing');
      }
    },

    shift : function (current, target, callback) {
      var clearing = target.parent(),
          old_index = this.settings.prev_index || target.index(),
          direction = this.direction(clearing, current, target),
          dir = this.rtl ? 'right' : 'left',
          left = parseInt(clearing.css('left'), 10),
          width = target.outerWidth(),
          skip_shift;

      var dir_obj = {};

      // we use jQuery animate instead of CSS transitions because we
      // need a callback to unlock the next animation
      // needs support for RTL **
      if (target.index() !== old_index && !/skip/.test(direction)) {
        if (/left/.test(direction)) {
          this.lock();
          dir_obj[dir] = left + width;
          clearing.animate(dir_obj, 300, this.unlock());
        } else if (/right/.test(direction)) {
          this.lock();
          dir_obj[dir] = left - width;
          clearing.animate(dir_obj, 300, this.unlock());
        }
      } else if (/skip/.test(direction)) {
        // the target image is not adjacent to the current image, so
        // do we scroll right or not
        skip_shift = target.index() - this.settings.up_count;
        this.lock();

        if (skip_shift > 0) {
          dir_obj[dir] = -(skip_shift * width);
          clearing.animate(dir_obj, 300, this.unlock());
        } else {
          dir_obj[dir] = 0;
          clearing.animate(dir_obj, 300, this.unlock());
        }
      }

      callback();
    },

    direction : function ($el, current, target) {
      var lis = this.S('li', $el),
          li_width = lis.outerWidth() + (lis.outerWidth() / 4),
          up_count = Math.floor(this.S('.clearing-container').outerWidth() / li_width) - 1,
          target_index = lis.index(target),
          response;

      this.settings.up_count = up_count;

      if (this.adjacent(this.settings.prev_index, target_index)) {
        if ((target_index > up_count) && target_index > this.settings.prev_index) {
          response = 'right';
        } else if ((target_index > up_count - 1) && target_index <= this.settings.prev_index) {
          response = 'left';
        } else {
          response = false;
        }
      } else {
        response = 'skip';
      }

      this.settings.prev_index = target_index;

      return response;
    },

    adjacent : function (current_index, target_index) {
      for (var i = target_index + 1; i >= target_index - 1; i--) {
        if (i === current_index) {
          return true;
        }
      }
      return false;
    },

    // lock management

    lock : function () {
      this.settings.locked = true;
    },

    unlock : function () {
      this.settings.locked = false;
    },

    locked : function () {
      return this.settings.locked;
    },

    off : function () {
      this.S(this.scope).off('.fndtn.clearing');
      this.S(window).off('.fndtn.clearing');
    },

    reflow : function () {
      this.init();
    }
  };

}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.dropdown = {
    name : 'dropdown',

    version : '5.5.1',

    settings : {
      active_class : 'open',
      disabled_class : 'disabled',
      mega_class : 'mega',
      align : 'bottom',
      pip : 'default',
      is_hover : false,
      hover_timeout : 150,
      opened : function () {},
      closed : function () {}
    },

    init : function (scope, method, options) {
      Foundation.inherit(this, 'throttle');

      $.extend(true, this.settings, method, options);
      this.bindings(method, options);
    },

    events : function (scope) {
      var self = this,
          S = self.S;

      S(this.scope)
        .off('.dropdown')
        .on('click.fndtn.dropdown', '[' + this.attr_name() + ']', function (e) {
          var settings = S(this).data(self.attr_name(true) + '-init') || self.settings;
          if (!settings.is_hover || Modernizr.touch) {
            e.preventDefault();
            if (S(this).parent('[data-reveal-id]')) {
              e.stopPropagation();
            }
            self.toggle($(this));
          }
        })
        .on('mouseenter.fndtn.dropdown', '[' + this.attr_name() + '], [' + this.attr_name() + '-content]', function (e) {
          var $this = S(this),
              dropdown,
              target;

          clearTimeout(self.timeout);

          if ($this.data(self.data_attr())) {
            dropdown = S('#' + $this.data(self.data_attr()));
            target = $this;
            self.last_target = target;
          } else {
            dropdown = $this;

            if (self.last_target) {
              target = self.last_target;
            } else {
              target = S("[" + self.attr_name() + "='" + dropdown.attr('id') + "']");
            }
          }

          var settings = target.data(self.attr_name(true) + '-init') || self.settings;

          if (S(e.currentTarget).data(self.data_attr()) && settings.is_hover) {
            self.closeall.call(self);
          }

          if (settings.is_hover) {
            self.open.apply(self, [dropdown, target]);
          }
        })
        .on('mouseleave.fndtn.dropdown', '[' + this.attr_name() + '], [' + this.attr_name() + '-content]', function (e) {
          var $this = S(this);
          var settings;

          if ($this.data(self.data_attr())) {
              settings = $this.data(self.data_attr(true) + '-init') || self.settings;
          } else {
              var target   = S('[' + self.attr_name() + '="' + S(this).attr('id') + '"]'),
                  settings = target.data(self.attr_name(true) + '-init') || self.settings;
          }

          self.timeout = setTimeout(function () {
            if ($this.data(self.data_attr())) {
              if (settings.is_hover) {
                self.close.call(self, S('#' + $this.data(self.data_attr())));
              }
            } else {
              if (settings.is_hover) {
                self.close.call(self, $this);
              }
            }
          }.bind(this), settings.hover_timeout);
        })
        .on('click.fndtn.dropdown', function (e) {
          var parent = S(e.target).closest('[' + self.attr_name() + '-content]');
          var links  = parent.find('a');

          if (links.length > 0 && parent.attr('aria-autoclose') !== 'false') {
              self.close.call(self, S('[' + self.attr_name() + '-content]'));
          }

          if (e.target !== document && !$.contains(document.documentElement, e.target)) {
            return;
          }

          if (S(e.target).closest('[' + self.attr_name() + ']').length > 0) {
            return;
          }

          if (!(S(e.target).data('revealId')) &&
            (parent.length > 0 && (S(e.target).is('[' + self.attr_name() + '-content]') ||
              $.contains(parent.first()[0], e.target)))) {
            e.stopPropagation();
            return;
          }

          self.close.call(self, S('[' + self.attr_name() + '-content]'));
        })
        .on('opened.fndtn.dropdown', '[' + self.attr_name() + '-content]', function () {
          self.settings.opened.call(this);
        })
        .on('closed.fndtn.dropdown', '[' + self.attr_name() + '-content]', function () {
          self.settings.closed.call(this);
        });

      S(window)
        .off('.dropdown')
        .on('resize.fndtn.dropdown', self.throttle(function () {
          self.resize.call(self);
        }, 50));

      this.resize();
    },

    close : function (dropdown) {
      var self = this;
      dropdown.each(function (idx) {
        var original_target = $('[' + self.attr_name() + '=' + dropdown[idx].id + ']') || $('aria-controls=' + dropdown[idx].id + ']');
        original_target.attr('aria-expanded', 'false');
        if (self.S(this).hasClass(self.settings.active_class)) {
          self.S(this)
            .css(Foundation.rtl ? 'right' : 'left', '-99999px')
            .attr('aria-hidden', 'true')
            .removeClass(self.settings.active_class)
            .prev('[' + self.attr_name() + ']')
            .removeClass(self.settings.active_class)
            .removeData('target');

          self.S(this).trigger('closed.fndtn.dropdown', [dropdown]);
        }
      });
      dropdown.removeClass('f-open-' + this.attr_name(true));
    },

    closeall : function () {
      var self = this;
      $.each(self.S('.f-open-' + this.attr_name(true)), function () {
        self.close.call(self, self.S(this));
      });
    },

    open : function (dropdown, target) {
      this
        .css(dropdown
        .addClass(this.settings.active_class), target);
      dropdown.prev('[' + this.attr_name() + ']').addClass(this.settings.active_class);
      dropdown.data('target', target.get(0)).trigger('opened.fndtn.dropdown', [dropdown, target]);
      dropdown.attr('aria-hidden', 'false');
      target.attr('aria-expanded', 'true');
      dropdown.focus();
      dropdown.addClass('f-open-' + this.attr_name(true));
    },

    data_attr : function () {
      if (this.namespace.length > 0) {
        return this.namespace + '-' + this.name;
      }

      return this.name;
    },

    toggle : function (target) {
      if (target.hasClass(this.settings.disabled_class)) {
        return;
      }
      var dropdown = this.S('#' + target.data(this.data_attr()));
      if (dropdown.length === 0) {
        // No dropdown found, not continuing
        return;
      }

      this.close.call(this, this.S('[' + this.attr_name() + '-content]').not(dropdown));

      if (dropdown.hasClass(this.settings.active_class)) {
        this.close.call(this, dropdown);
        if (dropdown.data('target') !== target.get(0)) {
          this.open.call(this, dropdown, target);
        }
      } else {
        this.open.call(this, dropdown, target);
      }
    },

    resize : function () {
      var dropdown = this.S('[' + this.attr_name() + '-content].open');
      var target = $(dropdown.data("target"));

      if (dropdown.length && target.length) {
        this.css(dropdown, target);
      }
    },

    css : function (dropdown, target) {
      var left_offset = Math.max((target.width() - dropdown.width()) / 2, 8),
          settings = target.data(this.attr_name(true) + '-init') || this.settings,
          parentOverflow = dropdown.parent().css('overflow-y') || dropdown.parent().css('overflow');

      this.clear_idx();



      if (this.small()) {
        var p = this.dirs.bottom.call(dropdown, target, settings);

        dropdown.attr('style', '').removeClass('drop-left drop-right drop-top').css({
          position : 'absolute',
          width : '95%',
          'max-width' : 'none',
          top : p.top
        });

        dropdown.css(Foundation.rtl ? 'right' : 'left', left_offset);
      }
      // detect if dropdown is in an overflow container
      else if (parentOverflow !== 'visible') {
        var offset = target[0].offsetTop + target[0].offsetHeight;

        dropdown.attr('style', '').css({
          position : 'absolute',
          top : offset
        });

        dropdown.css(Foundation.rtl ? 'right' : 'left', left_offset);
      }
      else {

        this.style(dropdown, target, settings);
      }

      return dropdown;
    },

    style : function (dropdown, target, settings) {
      var css = $.extend({position : 'absolute'},
        this.dirs[settings.align].call(dropdown, target, settings));

      dropdown.attr('style', '').css(css);
    },

    // return CSS property object
    // `this` is the dropdown
    dirs : {
      // Calculate target offset
      _base : function (t) {
        var o_p = this.offsetParent(),
            o = o_p.offset(),
            p = t.offset();

        p.top -= o.top;
        p.left -= o.left;

        //set some flags on the p object to pass along
        p.missRight = false;
        p.missTop = false;
        p.missLeft = false;
        p.leftRightFlag = false;

        //lets see if the panel will be off the screen
        //get the actual width of the page and store it
        p.bodyWidth = window.innerWidth;
        if (document.getElementsByClassName('row')[0]) {
          p.bodyWidth = document.getElementsByClassName('row')[0].clientWidth;
        }

        return p;
      },

      _position_bottom : function(d,t,s,p) {
        if(d.outerWidth() > t.outerWidth()) {
          //miss right
          if (p.left + d.outerWidth() > p.bodyWidth) {
            //miss left
            if(p.left - (d.outerWidth() - t.outerWidth()) < 0) {
              // set triggered right if the dropdown won't fit inside the first .row
              // in either the left or right orientation.
              p.triggeredRight = true;
              p.missLeft = true;
            } else {
              p.missRight = true;
            }
          }
        }

        if (t.outerWidth() > d.outerWidth() && s.pip == 'center') {
          p.offset = (t.outerWidth() - d.outerWidth()) / 2;
        }
        else if (p.triggeredRight) {
          if(d.outerWidth() < p.bodyWidth) {
            p.offset = (p.bodyWidth - p.left) - d.outerWidth();
          } else {
            p.offset = -p.left;
          }
        }
        else if (p.missRight || self.rtl) {
          p.offset = -d.outerWidth() + t.outerWidth();
        } else {
          p.offset = 0;
        }

        return p;
      },

      top : function (t, s) {
        var self = Foundation.libs.dropdown,
            p = self.dirs._base.call(this, t),
            offsetTop = -this.outerHeight();

        p = self.dirs._position_bottom(this,t,s,p);

        this.addClass('drop-top');

        //miss top
        if (t.offset().top <= this.outerHeight()) {
          p.missTop = true;
          p.leftRightFlag = true;
          this.removeClass('drop-top');
          offsetTop = t.outerHeight();
        }

        if (self.rtl || t.outerWidth() < this.outerWidth() || self.small() || this.hasClass(s.mega_menu)) {
          self.adjust_pip(this,t,s,p);
        }

        return {left : p.left + p.offset, top : p.top + offsetTop};
      },

      bottom : function (t, s) {
        var self = Foundation.libs.dropdown,
            p = self.dirs._base.call(this, t);
        
        p = self.dirs._position_bottom(this,t,s,p);       

        // Is this if statement really worth it?
        // I assume it is here to avoid unnecessary sheet.insertRule calls, but how expensive are they?
        if (p.offset || t.outerWidth() < this.outerWidth() || self.small() || this.hasClass(s.mega_menu)) {
          self.adjust_pip(this,t,s,p);
        }

        return {left : p.left + p.offset, top : p.top + t.outerHeight()};
      },

      left : function (t, s) {
        var self = Foundation.libs.dropdown,
            p = self.dirs._base.call(this, t);
        p.offset = -this.outerWidth();

        this.addClass('drop-left');

        //miss left
        if (p.left - this.outerWidth() <= 0) {
          p.missLeft = true;
          p.missRight = false;
          p.top = p.top + t.outerHeight();
          this.removeClass('drop-left');
          p = self.dirs._position_bottom(this,t,s,p);
          self.adjust_pip(this,t,s,p);
        } else {
          self.adjust_pip_vertical(this,t,s,p);
        }

        return {left : p.left + p.offset, top : p.top};
      },

      right : function (t, s) {
        var self = Foundation.libs.dropdown,
            p = self.dirs._base.call(this, t);

        p.offset = t.outerWidth();

        this.addClass('drop-right');

        //miss right
        if (p.left + this.outerWidth() + t.outerWidth() > p.bodyWidth) {
          p.missRight = true;
          p.missLeft = false;
          p.top = p.top + t.outerHeight();
          this.removeClass('drop-right');
          p = self.dirs._position_bottom(this,t,s,p);
          self.adjust_pip(this,t,s,p);
        } else {
          p.triggeredRight = true;
          self.adjust_pip_vertical(this,t,s,p);
        }

        var self = Foundation.libs.dropdown;

        if (t.outerWidth() < this.outerWidth() || self.small() || this.hasClass(s.mega_menu)) {
          self.adjust_pip(this, t, s, p);
        }

        return {left : p.left + t.outerWidth(), top : p.top};
      }
    },

    // Insert rule to style psuedo elements
    adjust_pip : function (dropdown, target, settings, position) {
      var sheet = Foundation.stylesheet,
          pip_offset_base = 8;

      if (dropdown.hasClass(settings.mega_class)) {
        pip_offset_base = position.left + (target.outerWidth()/2) - 8;
      }
      else if (this.small()) {
        pip_offset_base = position.left;
        if (settings.pip == 'center') {
          pip_offset_base += (target.outerWidth()/2) - 15;
        }
      }
      else if (settings.pip == 'center') {
        if(target.outerWidth() < dropdown.outerWidth()){
          pip_offset_base = (target.outerWidth()/2) - position.offset - 7;
        } else {
          pip_offset_base = (dropdown.outerWidth()/2) - 7;
        }
      }
      else if (position.missRight) {
        pip_offset_base += target.outerWidth() - 30;
      }

      this.rule_idx = sheet.cssRules.length;

      //default
      var sel_before = '.f-dropdown.open:before',
          sel_after  = '.f-dropdown.open:after',
          css_before = 'left: ' + pip_offset_base + 'px;',
          css_after  = 'left: ' + (pip_offset_base - 1) + 'px;';

      if (sheet.insertRule) {
        sheet.insertRule([sel_before, '{', css_before, '}'].join(' '), this.rule_idx);
        sheet.insertRule([sel_after, '{', css_after, '}'].join(' '), this.rule_idx + 1);
      } else {
        sheet.addRule(sel_before, css_before, this.rule_idx);
        sheet.addRule(sel_after, css_after, this.rule_idx + 1);
      }
    },

    adjust_pip_vertical : function (dropdown,target,settings,position) {
      var sheet = Foundation.stylesheet,
          pip_offset_base = 10,
          pip_halfheight = 14;

      if (settings.pip == 'center') {
        pip_offset_base = (target.outerHeight() - pip_halfheight) / 2;
      }

      this.rule_idx = sheet.cssRules.length;

      //default
      var sel_before = '.f-dropdown.open:before',
          sel_after  = '.f-dropdown.open:after',
          css_before = 'top: ' + pip_offset_base + 'px;',
          css_after  = 'top: ' + (pip_offset_base - 1) + 'px;';
        
      if (sheet.insertRule) {
        sheet.insertRule([sel_before, '{', css_before, '}'].join(' '), this.rule_idx);
        sheet.insertRule([sel_after, '{', css_after, '}'].join(' '), this.rule_idx + 1);
      } else {
        sheet.addRule(sel_before, css_before, this.rule_idx);
        sheet.addRule(sel_after, css_after, this.rule_idx + 1);
      }
    },

    // Remove old dropdown rule index
    clear_idx : function () {
      var sheet = Foundation.stylesheet;

      if (typeof this.rule_idx !== 'undefined') {
        sheet.deleteRule(this.rule_idx);
        sheet.deleteRule(this.rule_idx);
        delete this.rule_idx;
      }
    },

    small : function () {
      return matchMedia(Foundation.media_queries.small).matches &&
        !matchMedia(Foundation.media_queries.medium).matches;
    },

    off : function () {
      this.S(this.scope).off('.fndtn.dropdown');
      this.S('html, body').off('.fndtn.dropdown');
      this.S(window).off('.fndtn.dropdown');
      this.S('[data-dropdown-content]').off('.fndtn.dropdown');
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.equalizer = {
    name : 'equalizer',

    version : '5.5.1',

    settings : {
      use_tallest : true,
      before_height_change : $.noop,
      after_height_change : $.noop,
      equalize_on_stack : false
    },

    init : function (scope, method, options) {
      Foundation.inherit(this, 'image_loaded');
      this.bindings(method, options);
      this.reflow();
    },

    events : function () {
      this.S(window).off('.equalizer').on('resize.fndtn.equalizer', function (e) {
        this.reflow();
      }.bind(this));
    },

    equalize : function (equalizer) {
      var isStacked = false,
          group = equalizer.data('equalizer'),
          vals = group ? equalizer.find('['+this.attr_name()+'-watch="'+group+'"]:visible') : equalizer.find('['+this.attr_name()+'-watch]:visible'),
          settings = equalizer.data(this.attr_name(true)+'-init') || this.settings,
          firstTopOffset;

      if (vals.length === 0) {
        return;
      }
      
      settings.before_height_change();
      equalizer.trigger('before-height-change.fndth.equalizer');
      vals.height('inherit');
      
      if (settings.equalize_on_stack === false) {
        firstTopOffset = vals.first().offset().top;
        vals.each(function () {
          if ($(this).offset().top !== firstTopOffset) {
            isStacked = true;
            return false;
          }
        });
        if (isStacked) {
          return;
        }
      }

      var heights = vals.map(function () { return $(this).outerHeight(false) }).get();

      if (settings.use_tallest) {
        var max = Math.max.apply(null, heights);
        vals.css('height', max);
      } else {
        var min = Math.min.apply(null, heights);
        vals.css('height', min);
      }
      
      settings.after_height_change();
      equalizer.trigger('after-height-change.fndtn.equalizer');
    },

    reflow : function () {
      var self = this;

      this.S('[' + this.attr_name() + ']', this.scope).each(function () {
        var $eq_target = $(this);
        self.image_loaded(self.S('img', this), function () {
          self.equalize($eq_target)
        });
      });
    }
  };
})(jQuery, window, window.document);

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.interchange = {
    name : 'interchange',

    version : '5.5.1',

    cache : {},

    images_loaded : false,
    nodes_loaded : false,

    settings : {
      load_attr : 'interchange',

      named_queries : {
        'default'     : 'only screen',
        'small'       : Foundation.media_queries['small'],
        'small-only'  : Foundation.media_queries['small-only'],
        'medium'      : Foundation.media_queries['medium'],
        'medium-only' : Foundation.media_queries['medium-only'],
        'large'       : Foundation.media_queries['large'],
        'large-only'  : Foundation.media_queries['large-only'],
        'xlarge'      : Foundation.media_queries['xlarge'],
        'xlarge-only' : Foundation.media_queries['xlarge-only'],
        'xxlarge'     : Foundation.media_queries['xxlarge'],
        'landscape'   : 'only screen and (orientation: landscape)',
        'portrait'    : 'only screen and (orientation: portrait)',
        'retina'      : 'only screen and (-webkit-min-device-pixel-ratio: 2),' +
          'only screen and (min--moz-device-pixel-ratio: 2),' +
          'only screen and (-o-min-device-pixel-ratio: 2/1),' +
          'only screen and (min-device-pixel-ratio: 2),' +
          'only screen and (min-resolution: 192dpi),' +
          'only screen and (min-resolution: 2dppx)'
      },

      directives : {
        replace : function (el, path, trigger) {
          // The trigger argument, if called within the directive, fires
          // an event named after the directive on the element, passing
          // any parameters along to the event that you pass to trigger.
          //
          // ex. trigger(), trigger([a, b, c]), or trigger(a, b, c)
          //
          // This allows you to bind a callback like so:
          // $('#interchangeContainer').on('replace', function (e, a, b, c) {
          //   console.log($(this).html(), a, b, c);
          // });

          if (el !== null && /IMG/.test(el[0].nodeName)) {
            var orig_path = el[0].src;

            if (new RegExp(path, 'i').test(orig_path)) {
              return;
            }

            el.attr("src", path);

            return trigger(el[0].src);
          }
          var last_path = el.data(this.data_attr + '-last-path'),
              self = this;

          if (last_path == path) {
            return;
          }

          if (/\.(gif|jpg|jpeg|tiff|png)([?#].*)?/i.test(path)) {
            $(el).css('background-image', 'url(' + path + ')');
            el.data('interchange-last-path', path);
            return trigger(path);
          }

          return $.get(path, function (response) {
            el.html(response);
            el.data(self.data_attr + '-last-path', path);
            trigger();
          });

        }
      }
    },

    init : function (scope, method, options) {
      Foundation.inherit(this, 'throttle random_str');

      this.data_attr = this.set_data_attr();
      $.extend(true, this.settings, method, options);
      this.bindings(method, options);
      this.reflow();
    },

    get_media_hash : function () {
        var mediaHash = '';
        for (var queryName in this.settings.named_queries ) {
            mediaHash += matchMedia(this.settings.named_queries[queryName]).matches.toString();
        }
        return mediaHash;
    },

    events : function () {
      var self = this, prevMediaHash;

      $(window)
        .off('.interchange')
        .on('resize.fndtn.interchange', self.throttle(function () {
            var currMediaHash = self.get_media_hash();
            if (currMediaHash !== prevMediaHash) {
                self.resize();
            }
            prevMediaHash = currMediaHash;
        }, 50));

      return this;
    },

    resize : function () {
      var cache = this.cache;

      if (!this.images_loaded || !this.nodes_loaded) {
        setTimeout($.proxy(this.resize, this), 50);
        return;
      }

      for (var uuid in cache) {
        if (cache.hasOwnProperty(uuid)) {
          var passed = this.results(uuid, cache[uuid]);
          if (passed) {
            this.settings.directives[passed
              .scenario[1]].call(this, passed.el, passed.scenario[0], (function (passed) {
                if (arguments[0] instanceof Array) {
                  var args = arguments[0];
                } else {
                  var args = Array.prototype.slice.call(arguments, 0);
                }

                return function() {
                  passed.el.trigger(passed.scenario[1], args);
                }
              }(passed)));
          }
        }
      }

    },

    results : function (uuid, scenarios) {
      var count = scenarios.length;

      if (count > 0) {
        var el = this.S('[' + this.add_namespace('data-uuid') + '="' + uuid + '"]');

        while (count--) {
          var mq, rule = scenarios[count][2];
          if (this.settings.named_queries.hasOwnProperty(rule)) {
            mq = matchMedia(this.settings.named_queries[rule]);
          } else {
            mq = matchMedia(rule);
          }
          if (mq.matches) {
            return {el : el, scenario : scenarios[count]};
          }
        }
      }

      return false;
    },

    load : function (type, force_update) {
      if (typeof this['cached_' + type] === 'undefined' || force_update) {
        this['update_' + type]();
      }

      return this['cached_' + type];
    },

    update_images : function () {
      var images = this.S('img[' + this.data_attr + ']'),
          count = images.length,
          i = count,
          loaded_count = 0,
          data_attr = this.data_attr;

      this.cache = {};
      this.cached_images = [];
      this.images_loaded = (count === 0);

      while (i--) {
        loaded_count++;
        if (images[i]) {
          var str = images[i].getAttribute(data_attr) || '';

          if (str.length > 0) {
            this.cached_images.push(images[i]);
          }
        }

        if (loaded_count === count) {
          this.images_loaded = true;
          this.enhance('images');
        }
      }

      return this;
    },

    update_nodes : function () {
      var nodes = this.S('[' + this.data_attr + ']').not('img'),
          count = nodes.length,
          i = count,
          loaded_count = 0,
          data_attr = this.data_attr;

      this.cached_nodes = [];
      this.nodes_loaded = (count === 0);

      while (i--) {
        loaded_count++;
        var str = nodes[i].getAttribute(data_attr) || '';

        if (str.length > 0) {
          this.cached_nodes.push(nodes[i]);
        }

        if (loaded_count === count) {
          this.nodes_loaded = true;
          this.enhance('nodes');
        }
      }

      return this;
    },

    enhance : function (type) {
      var i = this['cached_' + type].length;

      while (i--) {
        this.object($(this['cached_' + type][i]));
      }

      return $(window).trigger('resize.fndtn.interchange');
    },

    convert_directive : function (directive) {

      var trimmed = this.trim(directive);

      if (trimmed.length > 0) {
        return trimmed;
      }

      return 'replace';
    },

    parse_scenario : function (scenario) {
      // This logic had to be made more complex since some users were using commas in the url path
      // So we cannot simply just split on a comma

      var directive_match = scenario[0].match(/(.+),\s*(\w+)\s*$/),
      // getting the mq has gotten a bit complicated since we started accounting for several use cases
      // of URLs. For now we'll continue to match these scenarios, but we may consider having these scenarios
      // as nested objects or arrays in F6.
      // regex: match everything before close parenthesis for mq
      media_query         = scenario[1].match(/(.*)\)/);

      if (directive_match) {
        var path  = directive_match[1],
        directive = directive_match[2];

      } else {
        var cached_split = scenario[0].split(/,\s*$/),
        path             = cached_split[0],
        directive        = '';
      }

      return [this.trim(path), this.convert_directive(directive), this.trim(media_query[1])];
    },

    object : function (el) {
      var raw_arr = this.parse_data_attr(el),
          scenarios = [],
          i = raw_arr.length;

      if (i > 0) {
        while (i--) {
          // split array between comma delimited content and mq
          // regex: comma, optional space, open parenthesis
          var scenario = raw_arr[i].split(/,\s?\(/);

          if (scenario.length > 1) {
            var params = this.parse_scenario(scenario);
            scenarios.push(params);
          }
        }
      }

      return this.store(el, scenarios);
    },

    store : function (el, scenarios) {
      var uuid = this.random_str(),
          current_uuid = el.data(this.add_namespace('uuid', true));

      if (this.cache[current_uuid]) {
        return this.cache[current_uuid];
      }

      el.attr(this.add_namespace('data-uuid'), uuid);
      return this.cache[uuid] = scenarios;
    },

    trim : function (str) {

      if (typeof str === 'string') {
        return $.trim(str);
      }

      return str;
    },

    set_data_attr : function (init) {
      if (init) {
        if (this.namespace.length > 0) {
          return this.namespace + '-' + this.settings.load_attr;
        }

        return this.settings.load_attr;
      }

      if (this.namespace.length > 0) {
        return 'data-' + this.namespace + '-' + this.settings.load_attr;
      }

      return 'data-' + this.settings.load_attr;
    },

    parse_data_attr : function (el) {
      var raw = el.attr(this.attr_name()).split(/\[(.*?)\]/),
          i = raw.length,
          output = [];

      while (i--) {
        if (raw[i].replace(/[\W\d]+/, '').length > 4) {
          output.push(raw[i]);
        }
      }

      return output;
    },

    reflow : function () {
      this.load('images', true);
      this.load('nodes', true);
    }

  };

}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  var Modernizr = Modernizr || false;

  Foundation.libs.joyride = {
    name : 'joyride',

    version : '5.5.1',

    defaults : {
      expose                   : false,     // turn on or off the expose feature
      modal                    : true,      // Whether to cover page with modal during the tour
      keyboard                 : true,      // enable left, right and esc keystrokes
      tip_location             : 'bottom',  // 'top' or 'bottom' in relation to parent
      nub_position             : 'auto',    // override on a per tooltip bases
      scroll_speed             : 1500,      // Page scrolling speed in milliseconds, 0 = no scroll animation
      scroll_animation         : 'linear',  // supports 'swing' and 'linear', extend with jQuery UI.
      timer                    : 0,         // 0 = no timer , all other numbers = timer in milliseconds
      start_timer_on_click     : true,      // true or false - true requires clicking the first button start the timer
      start_offset             : 0,         // the index of the tooltip you want to start on (index of the li)
      next_button              : true,      // true or false to control whether a next button is used
      prev_button              : true,      // true or false to control whether a prev button is used
      tip_animation            : 'fade',    // 'pop' or 'fade' in each tip
      pause_after              : [],        // array of indexes where to pause the tour after
      exposed                  : [],        // array of expose elements
      tip_animation_fade_speed : 300,       // when tipAnimation = 'fade' this is speed in milliseconds for the transition
      cookie_monster           : false,     // true or false to control whether cookies are used
      cookie_name              : 'joyride', // Name the cookie you'll use
      cookie_domain            : false,     // Will this cookie be attached to a domain, ie. '.notableapp.com'
      cookie_expires           : 365,       // set when you would like the cookie to expire.
      tip_container            : 'body',    // Where will the tip be attached
      abort_on_close           : true,      // When true, the close event will not fire any callback
      tip_location_patterns    : {
        top : ['bottom'],
        bottom : [], // bottom should not need to be repositioned
        left : ['right', 'top', 'bottom'],
        right : ['left', 'top', 'bottom']
      },
      post_ride_callback     : function () {},    // A method to call once the tour closes (canceled or complete)
      post_step_callback     : function () {},    // A method to call after each step
      pre_step_callback      : function () {},    // A method to call before each step
      pre_ride_callback      : function () {},    // A method to call before the tour starts (passed index, tip, and cloned exposed element)
      post_expose_callback   : function () {},    // A method to call after an element has been exposed
      template : { // HTML segments for tip layout
        link          : '<a href="#close" class="joyride-close-tip">&times;</a>',
        timer         : '<div class="joyride-timer-indicator-wrap"><span class="joyride-timer-indicator"></span></div>',
        tip           : '<div class="joyride-tip-guide"><span class="joyride-nub"></span></div>',
        wrapper       : '<div class="joyride-content-wrapper"></div>',
        button        : '<a href="#" class="small button joyride-next-tip"></a>',
        prev_button   : '<a href="#" class="small button joyride-prev-tip"></a>',
        modal         : '<div class="joyride-modal-bg"></div>',
        expose        : '<div class="joyride-expose-wrapper"></div>',
        expose_cover  : '<div class="joyride-expose-cover"></div>'
      },
      expose_add_class : '' // One or more space-separated class names to be added to exposed element
    },

    init : function (scope, method, options) {
      Foundation.inherit(this, 'throttle random_str');

      this.settings = this.settings || $.extend({}, this.defaults, (options || method));

      this.bindings(method, options)
    },

    go_next : function () {
      if (this.settings.$li.next().length < 1) {
        this.end();
      } else if (this.settings.timer > 0) {
        clearTimeout(this.settings.automate);
        this.hide();
        this.show();
        this.startTimer();
      } else {
        this.hide();
        this.show();
      }
    },

    go_prev : function () {
      if (this.settings.$li.prev().length < 1) {
        // Do nothing if there are no prev element
      } else if (this.settings.timer > 0) {
        clearTimeout(this.settings.automate);
        this.hide();
        this.show(null, true);
        this.startTimer();
      } else {
        this.hide();
        this.show(null, true);
      }
    },

    events : function () {
      var self = this;

      $(this.scope)
        .off('.joyride')
        .on('click.fndtn.joyride', '.joyride-next-tip, .joyride-modal-bg', function (e) {
          e.preventDefault();
          this.go_next()
        }.bind(this))
        .on('click.fndtn.joyride', '.joyride-prev-tip', function (e) {
          e.preventDefault();
          this.go_prev();
        }.bind(this))

        .on('click.fndtn.joyride', '.joyride-close-tip', function (e) {
          e.preventDefault();
          this.end(this.settings.abort_on_close);
        }.bind(this))

        .on('keyup.fndtn.joyride', function (e) {
          // Don't do anything if keystrokes are disabled
          // or if the joyride is not being shown
          if (!this.settings.keyboard || !this.settings.riding) {
            return;
          }

          switch (e.which) {
            case 39: // right arrow
              e.preventDefault();
              this.go_next();
              break;
            case 37: // left arrow
              e.preventDefault();
              this.go_prev();
              break;
            case 27: // escape
              e.preventDefault();
              this.end(this.settings.abort_on_close);
          }
        }.bind(this));

      $(window)
        .off('.joyride')
        .on('resize.fndtn.joyride', self.throttle(function () {
          if ($('[' + self.attr_name() + ']').length > 0 && self.settings.$next_tip && self.settings.riding) {
            if (self.settings.exposed.length > 0) {
              var $els = $(self.settings.exposed);

              $els.each(function () {
                var $this = $(this);
                self.un_expose($this);
                self.expose($this);
              });
            }

            if (self.is_phone()) {
              self.pos_phone();
            } else {
              self.pos_default(false);
            }
          }
        }, 100));
    },

    start : function () {
      var self = this,
          $this = $('[' + this.attr_name() + ']', this.scope),
          integer_settings = ['timer', 'scrollSpeed', 'startOffset', 'tipAnimationFadeSpeed', 'cookieExpires'],
          int_settings_count = integer_settings.length;

      if (!$this.length > 0) {
        return;
      }

      if (!this.settings.init) {
        this.events();
      }

      this.settings = $this.data(this.attr_name(true) + '-init');

      // non configureable settings
      this.settings.$content_el = $this;
      this.settings.$body = $(this.settings.tip_container);
      this.settings.body_offset = $(this.settings.tip_container).position();
      this.settings.$tip_content = this.settings.$content_el.find('> li');
      this.settings.paused = false;
      this.settings.attempts = 0;
      this.settings.riding = true;

      // can we create cookies?
      if (typeof $.cookie !== 'function') {
        this.settings.cookie_monster = false;
      }

      // generate the tips and insert into dom.
      if (!this.settings.cookie_monster || this.settings.cookie_monster && !$.cookie(this.settings.cookie_name)) {
        this.settings.$tip_content.each(function (index) {
          var $this = $(this);
          this.settings = $.extend({}, self.defaults, self.data_options($this));

          // Make sure that settings parsed from data_options are integers where necessary
          var i = int_settings_count;
          while (i--) {
            self.settings[integer_settings[i]] = parseInt(self.settings[integer_settings[i]], 10);
          }
          self.create({$li : $this, index : index});
        });

        // show first tip
        if (!this.settings.start_timer_on_click && this.settings.timer > 0) {
          this.show('init');
          this.startTimer();
        } else {
          this.show('init');
        }

      }
    },

    resume : function () {
      this.set_li();
      this.show();
    },

    tip_template : function (opts) {
      var $blank, content;

      opts.tip_class = opts.tip_class || '';

      $blank = $(this.settings.template.tip).addClass(opts.tip_class);
      content = $.trim($(opts.li).html()) +
        this.prev_button_text(opts.prev_button_text, opts.index) +
        this.button_text(opts.button_text) +
        this.settings.template.link +
        this.timer_instance(opts.index);

      $blank.append($(this.settings.template.wrapper));
      $blank.first().attr(this.add_namespace('data-index'), opts.index);
      $('.joyride-content-wrapper', $blank).append(content);

      return $blank[0];
    },

    timer_instance : function (index) {
      var txt;

      if ((index === 0 && this.settings.start_timer_on_click && this.settings.timer > 0) || this.settings.timer === 0) {
        txt = '';
      } else {
        txt = $(this.settings.template.timer)[0].outerHTML;
      }
      return txt;
    },

    button_text : function (txt) {
      if (this.settings.tip_settings.next_button) {
        txt = $.trim(txt) || 'Next';
        txt = $(this.settings.template.button).append(txt)[0].outerHTML;
      } else {
        txt = '';
      }
      return txt;
    },

    prev_button_text : function (txt, idx) {
      if (this.settings.tip_settings.prev_button) {
        txt = $.trim(txt) || 'Previous';

        // Add the disabled class to the button if it's the first element
        if (idx == 0) {
          txt = $(this.settings.template.prev_button).append(txt).addClass('disabled')[0].outerHTML;
        } else {
          txt = $(this.settings.template.prev_button).append(txt)[0].outerHTML;
        }
      } else {
        txt = '';
      }
      return txt;
    },

    create : function (opts) {
      this.settings.tip_settings = $.extend({}, this.settings, this.data_options(opts.$li));
      var buttonText = opts.$li.attr(this.add_namespace('data-button')) || opts.$li.attr(this.add_namespace('data-text')),
          prevButtonText = opts.$li.attr(this.add_namespace('data-button-prev')) || opts.$li.attr(this.add_namespace('data-prev-text')),
        tipClass = opts.$li.attr('class'),
        $tip_content = $(this.tip_template({
          tip_class : tipClass,
          index : opts.index,
          button_text : buttonText,
          prev_button_text : prevButtonText,
          li : opts.$li
        }));

      $(this.settings.tip_container).append($tip_content);
    },

    show : function (init, is_prev) {
      var $timer = null;

      // are we paused?
      if (this.settings.$li === undefined || ($.inArray(this.settings.$li.index(), this.settings.pause_after) === -1)) {

        // don't go to the next li if the tour was paused
        if (this.settings.paused) {
          this.settings.paused = false;
        } else {
          this.set_li(init, is_prev);
        }

        this.settings.attempts = 0;

        if (this.settings.$li.length && this.settings.$target.length > 0) {
          if (init) { //run when we first start
            this.settings.pre_ride_callback(this.settings.$li.index(), this.settings.$next_tip);
            if (this.settings.modal) {
              this.show_modal();
            }
          }

          this.settings.pre_step_callback(this.settings.$li.index(), this.settings.$next_tip);

          if (this.settings.modal && this.settings.expose) {
            this.expose();
          }

          this.settings.tip_settings = $.extend({}, this.settings, this.data_options(this.settings.$li));

          this.settings.timer = parseInt(this.settings.timer, 10);

          this.settings.tip_settings.tip_location_pattern = this.settings.tip_location_patterns[this.settings.tip_settings.tip_location];

          // scroll and hide bg if not modal
          if (!/body/i.test(this.settings.$target.selector)) {
            var joyridemodalbg = $('.joyride-modal-bg');
            if (/pop/i.test(this.settings.tipAnimation)) {
                joyridemodalbg.hide();
            } else {
                joyridemodalbg.fadeOut(this.settings.tipAnimationFadeSpeed);
            }
            this.scroll_to();
          }

          if (this.is_phone()) {
            this.pos_phone(true);
          } else {
            this.pos_default(true);
          }

          $timer = this.settings.$next_tip.find('.joyride-timer-indicator');

          if (/pop/i.test(this.settings.tip_animation)) {

            $timer.width(0);

            if (this.settings.timer > 0) {

              this.settings.$next_tip.show();

              setTimeout(function () {
                $timer.animate({
                  width : $timer.parent().width()
                }, this.settings.timer, 'linear');
              }.bind(this), this.settings.tip_animation_fade_speed);

            } else {
              this.settings.$next_tip.show();

            }

          } else if (/fade/i.test(this.settings.tip_animation)) {

            $timer.width(0);

            if (this.settings.timer > 0) {

              this.settings.$next_tip
                .fadeIn(this.settings.tip_animation_fade_speed)
                .show();

              setTimeout(function () {
                $timer.animate({
                  width : $timer.parent().width()
                }, this.settings.timer, 'linear');
              }.bind(this), this.settings.tip_animation_fade_speed);

            } else {
              this.settings.$next_tip.fadeIn(this.settings.tip_animation_fade_speed);
            }
          }

          this.settings.$current_tip = this.settings.$next_tip;

        // skip non-existant targets
        } else if (this.settings.$li && this.settings.$target.length < 1) {

          this.show(init, is_prev);

        } else {

          this.end();

        }
      } else {

        this.settings.paused = true;

      }

    },

    is_phone : function () {
      return matchMedia(Foundation.media_queries.small).matches &&
        !matchMedia(Foundation.media_queries.medium).matches;
    },

    hide : function () {
      if (this.settings.modal && this.settings.expose) {
        this.un_expose();
      }

      if (!this.settings.modal) {
        $('.joyride-modal-bg').hide();
      }

      // Prevent scroll bouncing...wait to remove from layout
      this.settings.$current_tip.css('visibility', 'hidden');
      setTimeout($.proxy(function () {
        this.hide();
        this.css('visibility', 'visible');
      }, this.settings.$current_tip), 0);
      this.settings.post_step_callback(this.settings.$li.index(),
        this.settings.$current_tip);
    },

    set_li : function (init, is_prev) {
      if (init) {
        this.settings.$li = this.settings.$tip_content.eq(this.settings.start_offset);
        this.set_next_tip();
        this.settings.$current_tip = this.settings.$next_tip;
      } else {
        if (is_prev) {
          this.settings.$li = this.settings.$li.prev();
        } else {
          this.settings.$li = this.settings.$li.next();
        }
        this.set_next_tip();
      }

      this.set_target();
    },

    set_next_tip : function () {
      this.settings.$next_tip = $('.joyride-tip-guide').eq(this.settings.$li.index());
      this.settings.$next_tip.data('closed', '');
    },

    set_target : function () {
      var cl = this.settings.$li.attr(this.add_namespace('data-class')),
          id = this.settings.$li.attr(this.add_namespace('data-id')),
          $sel = function () {
            if (id) {
              return $(document.getElementById(id));
            } else if (cl) {
              return $('.' + cl).first();
            } else {
              return $('body');
            }
          };

      this.settings.$target = $sel();
    },

    scroll_to : function () {
      var window_half, tipOffset;

      window_half = $(window).height() / 2;
      tipOffset = Math.ceil(this.settings.$target.offset().top - window_half + this.settings.$next_tip.outerHeight());

      if (tipOffset != 0) {
        $('html, body').stop().animate({
          scrollTop : tipOffset
        }, this.settings.scroll_speed, 'swing');
      }
    },

    paused : function () {
      return ($.inArray((this.settings.$li.index() + 1), this.settings.pause_after) === -1);
    },

    restart : function () {
      this.hide();
      this.settings.$li = undefined;
      this.show('init');
    },

    pos_default : function (init) {
      var $nub = this.settings.$next_tip.find('.joyride-nub'),
          nub_width = Math.ceil($nub.outerWidth() / 2),
          nub_height = Math.ceil($nub.outerHeight() / 2),
          toggle = init || false;

      // tip must not be "display: none" to calculate position
      if (toggle) {
        this.settings.$next_tip.css('visibility', 'hidden');
        this.settings.$next_tip.show();
      }

      if (!/body/i.test(this.settings.$target.selector)) {
          var topAdjustment = this.settings.tip_settings.tipAdjustmentY ? parseInt(this.settings.tip_settings.tipAdjustmentY) : 0,
              leftAdjustment = this.settings.tip_settings.tipAdjustmentX ? parseInt(this.settings.tip_settings.tipAdjustmentX) : 0;

          if (this.bottom()) {
            if (this.rtl) {
              this.settings.$next_tip.css({
                top : (this.settings.$target.offset().top + nub_height + this.settings.$target.outerHeight() + topAdjustment),
                left : this.settings.$target.offset().left + this.settings.$target.outerWidth() - this.settings.$next_tip.outerWidth() + leftAdjustment});
            } else {
              this.settings.$next_tip.css({
                top : (this.settings.$target.offset().top + nub_height + this.settings.$target.outerHeight() + topAdjustment),
                left : this.settings.$target.offset().left + leftAdjustment});
            }

            this.nub_position($nub, this.settings.tip_settings.nub_position, 'top');

          } else if (this.top()) {
            if (this.rtl) {
              this.settings.$next_tip.css({
                top : (this.settings.$target.offset().top - this.settings.$next_tip.outerHeight() - nub_height + topAdjustment),
                left : this.settings.$target.offset().left + this.settings.$target.outerWidth() - this.settings.$next_tip.outerWidth()});
            } else {
              this.settings.$next_tip.css({
                top : (this.settings.$target.offset().top - this.settings.$next_tip.outerHeight() - nub_height + topAdjustment),
                left : this.settings.$target.offset().left + leftAdjustment});
            }

            this.nub_position($nub, this.settings.tip_settings.nub_position, 'bottom');

          } else if (this.right()) {

            this.settings.$next_tip.css({
              top : this.settings.$target.offset().top + topAdjustment,
              left : (this.settings.$target.outerWidth() + this.settings.$target.offset().left + nub_width + leftAdjustment)});

            this.nub_position($nub, this.settings.tip_settings.nub_position, 'left');

          } else if (this.left()) {

            this.settings.$next_tip.css({
              top : this.settings.$target.offset().top + topAdjustment,
              left : (this.settings.$target.offset().left - this.settings.$next_tip.outerWidth() - nub_width + leftAdjustment)});

            this.nub_position($nub, this.settings.tip_settings.nub_position, 'right');

          }

          if (!this.visible(this.corners(this.settings.$next_tip)) && this.settings.attempts < this.settings.tip_settings.tip_location_pattern.length) {

            $nub.removeClass('bottom')
              .removeClass('top')
              .removeClass('right')
              .removeClass('left');

            this.settings.tip_settings.tip_location = this.settings.tip_settings.tip_location_pattern[this.settings.attempts];

            this.settings.attempts++;

            this.pos_default();

          }

      } else if (this.settings.$li.length) {

        this.pos_modal($nub);

      }

      if (toggle) {
        this.settings.$next_tip.hide();
        this.settings.$next_tip.css('visibility', 'visible');
      }

    },

    pos_phone : function (init) {
      var tip_height = this.settings.$next_tip.outerHeight(),
          tip_offset = this.settings.$next_tip.offset(),
          target_height = this.settings.$target.outerHeight(),
          $nub = $('.joyride-nub', this.settings.$next_tip),
          nub_height = Math.ceil($nub.outerHeight() / 2),
          toggle = init || false;

      $nub.removeClass('bottom')
        .removeClass('top')
        .removeClass('right')
        .removeClass('left');

      if (toggle) {
        this.settings.$next_tip.css('visibility', 'hidden');
        this.settings.$next_tip.show();
      }

      if (!/body/i.test(this.settings.$target.selector)) {

        if (this.top()) {

            this.settings.$next_tip.offset({top : this.settings.$target.offset().top - tip_height - nub_height});
            $nub.addClass('bottom');

        } else {

          this.settings.$next_tip.offset({top : this.settings.$target.offset().top + target_height + nub_height});
          $nub.addClass('top');

        }

      } else if (this.settings.$li.length) {
        this.pos_modal($nub);
      }

      if (toggle) {
        this.settings.$next_tip.hide();
        this.settings.$next_tip.css('visibility', 'visible');
      }
    },

    pos_modal : function ($nub) {
      this.center();
      $nub.hide();

      this.show_modal();
    },

    show_modal : function () {
      if (!this.settings.$next_tip.data('closed')) {
        var joyridemodalbg =  $('.joyride-modal-bg');
        if (joyridemodalbg.length < 1) {
          var joyridemodalbg = $(this.settings.template.modal);
          joyridemodalbg.appendTo('body');
        }

        if (/pop/i.test(this.settings.tip_animation)) {
            joyridemodalbg.show();
        } else {
            joyridemodalbg.fadeIn(this.settings.tip_animation_fade_speed);
        }
      }
    },

    expose : function () {
      var expose,
          exposeCover,
          el,
          origCSS,
          origClasses,
          randId = 'expose-' + this.random_str(6);

      if (arguments.length > 0 && arguments[0] instanceof $) {
        el = arguments[0];
      } else if (this.settings.$target && !/body/i.test(this.settings.$target.selector)) {
        el = this.settings.$target;
      } else {
        return false;
      }

      if (el.length < 1) {
        if (window.console) {
          console.error('element not valid', el);
        }
        return false;
      }

      expose = $(this.settings.template.expose);
      this.settings.$body.append(expose);
      expose.css({
        top : el.offset().top,
        left : el.offset().left,
        width : el.outerWidth(true),
        height : el.outerHeight(true)
      });

      exposeCover = $(this.settings.template.expose_cover);

      origCSS = {
        zIndex : el.css('z-index'),
        position : el.css('position')
      };

      origClasses = el.attr('class') == null ? '' : el.attr('class');

      el.css('z-index', parseInt(expose.css('z-index')) + 1);

      if (origCSS.position == 'static') {
        el.css('position', 'relative');
      }

      el.data('expose-css', origCSS);
      el.data('orig-class', origClasses);
      el.attr('class', origClasses + ' ' + this.settings.expose_add_class);

      exposeCover.css({
        top : el.offset().top,
        left : el.offset().left,
        width : el.outerWidth(true),
        height : el.outerHeight(true)
      });

      if (this.settings.modal) {
        this.show_modal();
      }

      this.settings.$body.append(exposeCover);
      expose.addClass(randId);
      exposeCover.addClass(randId);
      el.data('expose', randId);
      this.settings.post_expose_callback(this.settings.$li.index(), this.settings.$next_tip, el);
      this.add_exposed(el);
    },

    un_expose : function () {
      var exposeId,
          el,
          expose,
          origCSS,
          origClasses,
          clearAll = false;

      if (arguments.length > 0 && arguments[0] instanceof $) {
        el = arguments[0];
      } else if (this.settings.$target && !/body/i.test(this.settings.$target.selector)) {
        el = this.settings.$target;
      } else {
        return false;
      }

      if (el.length < 1) {
        if (window.console) {
          console.error('element not valid', el);
        }
        return false;
      }

      exposeId = el.data('expose');
      expose = $('.' + exposeId);

      if (arguments.length > 1) {
        clearAll = arguments[1];
      }

      if (clearAll === true) {
        $('.joyride-expose-wrapper,.joyride-expose-cover').remove();
      } else {
        expose.remove();
      }

      origCSS = el.data('expose-css');

      if (origCSS.zIndex == 'auto') {
        el.css('z-index', '');
      } else {
        el.css('z-index', origCSS.zIndex);
      }

      if (origCSS.position != el.css('position')) {
        if (origCSS.position == 'static') {// this is default, no need to set it.
          el.css('position', '');
        } else {
          el.css('position', origCSS.position);
        }
      }

      origClasses = el.data('orig-class');
      el.attr('class', origClasses);
      el.removeData('orig-classes');

      el.removeData('expose');
      el.removeData('expose-z-index');
      this.remove_exposed(el);
    },

    add_exposed : function (el) {
      this.settings.exposed = this.settings.exposed || [];
      if (el instanceof $ || typeof el === 'object') {
        this.settings.exposed.push(el[0]);
      } else if (typeof el == 'string') {
        this.settings.exposed.push(el);
      }
    },

    remove_exposed : function (el) {
      var search, i;
      if (el instanceof $) {
        search = el[0]
      } else if (typeof el == 'string') {
        search = el;
      }

      this.settings.exposed = this.settings.exposed || [];
      i = this.settings.exposed.length;

      while (i--) {
        if (this.settings.exposed[i] == search) {
          this.settings.exposed.splice(i, 1);
          return;
        }
      }
    },

    center : function () {
      var $w = $(window);

      this.settings.$next_tip.css({
        top : ((($w.height() - this.settings.$next_tip.outerHeight()) / 2) + $w.scrollTop()),
        left : ((($w.width() - this.settings.$next_tip.outerWidth()) / 2) + $w.scrollLeft())
      });

      return true;
    },

    bottom : function () {
      return /bottom/i.test(this.settings.tip_settings.tip_location);
    },

    top : function () {
      return /top/i.test(this.settings.tip_settings.tip_location);
    },

    right : function () {
      return /right/i.test(this.settings.tip_settings.tip_location);
    },

    left : function () {
      return /left/i.test(this.settings.tip_settings.tip_location);
    },

    corners : function (el) {
      var w = $(window),
          window_half = w.height() / 2,
          //using this to calculate since scroll may not have finished yet.
          tipOffset = Math.ceil(this.settings.$target.offset().top - window_half + this.settings.$next_tip.outerHeight()),
          right = w.width() + w.scrollLeft(),
          offsetBottom =  w.height() + tipOffset,
          bottom = w.height() + w.scrollTop(),
          top = w.scrollTop();

      if (tipOffset < top) {
        if (tipOffset < 0) {
          top = 0;
        } else {
          top = tipOffset;
        }
      }

      if (offsetBottom > bottom) {
        bottom = offsetBottom;
      }

      return [
        el.offset().top < top,
        right < el.offset().left + el.outerWidth(),
        bottom < el.offset().top + el.outerHeight(),
        w.scrollLeft() > el.offset().left
      ];
    },

    visible : function (hidden_corners) {
      var i = hidden_corners.length;

      while (i--) {
        if (hidden_corners[i]) {
          return false;
        }
      }

      return true;
    },

    nub_position : function (nub, pos, def) {
      if (pos === 'auto') {
        nub.addClass(def);
      } else {
        nub.addClass(pos);
      }
    },

    startTimer : function () {
      if (this.settings.$li.length) {
        this.settings.automate = setTimeout(function () {
          this.hide();
          this.show();
          this.startTimer();
        }.bind(this), this.settings.timer);
      } else {
        clearTimeout(this.settings.automate);
      }
    },

    end : function (abort) {
      if (this.settings.cookie_monster) {
        $.cookie(this.settings.cookie_name, 'ridden', {expires : this.settings.cookie_expires, domain : this.settings.cookie_domain});
      }

      if (this.settings.timer > 0) {
        clearTimeout(this.settings.automate);
      }

      if (this.settings.modal && this.settings.expose) {
        this.un_expose();
      }

      // Unplug keystrokes listener
      $(this.scope).off('keyup.joyride')

      this.settings.$next_tip.data('closed', true);
      this.settings.riding = false;

      $('.joyride-modal-bg').hide();
      this.settings.$current_tip.hide();

      if (typeof abort === 'undefined' || abort === false) {
        this.settings.post_step_callback(this.settings.$li.index(), this.settings.$current_tip);
        this.settings.post_ride_callback(this.settings.$li.index(), this.settings.$current_tip);
      }

      $('.joyride-tip-guide').remove();
    },

    off : function () {
      $(this.scope).off('.joyride');
      $(window).off('.joyride');
      $('.joyride-close-tip, .joyride-next-tip, .joyride-modal-bg').off('.joyride');
      $('.joyride-tip-guide, .joyride-modal-bg').remove();
      clearTimeout(this.settings.automate);
      this.settings = {};
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs['magellan-expedition'] = {
    name : 'magellan-expedition',

    version : '5.5.1',

    settings : {
      active_class : 'active',
      threshold : 0, // pixels from the top of the expedition for it to become fixes
      destination_threshold : 20, // pixels from the top of destination for it to be considered active
      throttle_delay : 30, // calculation throttling to increase framerate
      fixed_top : 0, // top distance in pixels assigend to the fixed element on scroll
      offset_by_height : true,  // whether to offset the destination by the expedition height. Usually you want this to be true, unless your expedition is on the side.
      duration : 700, // animation duration time
      easing : 'swing' // animation easing
    },

    init : function (scope, method, options) {
      Foundation.inherit(this, 'throttle');
      this.bindings(method, options);
    },

    events : function () {
      var self = this,
          S = self.S,
          settings = self.settings;

      // initialize expedition offset
      self.set_expedition_position();

      S(self.scope)
        .off('.magellan')
        .on('click.fndtn.magellan', '[' + self.add_namespace('data-magellan-arrival') + '] a[href^="#"]', function (e) {
          e.preventDefault();
          var expedition = $(this).closest('[' + self.attr_name() + ']'),
              settings = expedition.data('magellan-expedition-init'),
              hash = this.hash.split('#').join(''),
              target = $('a[name="' + hash + '"]');

          if (target.length === 0) {
            target = $('#' + hash);

          }

          // Account for expedition height if fixed position
          var scroll_top = target.offset().top - settings.destination_threshold + 1;
          if (settings.offset_by_height) {
            scroll_top = scroll_top - expedition.outerHeight();
          }
          $('html, body').stop().animate({
            'scrollTop' : scroll_top
          }, settings.duration, settings.easing, function () {
            if (history.pushState) {
              history.pushState(null, null, '#' + hash);
            } else {
              location.hash = '#' + hash;
            }
          });
        })
        .on('scroll.fndtn.magellan', self.throttle(this.check_for_arrivals.bind(this), settings.throttle_delay));
    },

    check_for_arrivals : function () {
      var self = this;
      self.update_arrivals();
      self.update_expedition_positions();
    },

    set_expedition_position : function () {
      var self = this;
      $('[' + this.attr_name() + '=fixed]', self.scope).each(function (idx, el) {
        var expedition = $(this),
            settings = expedition.data('magellan-expedition-init'),
            styles = expedition.attr('styles'), // save styles
            top_offset, fixed_top;

        expedition.attr('style', '');
        top_offset = expedition.offset().top + settings.threshold;

        //set fixed-top by attribute
        fixed_top = parseInt(expedition.data('magellan-fixed-top'));
        if (!isNaN(fixed_top)) {
          self.settings.fixed_top = fixed_top;
        }

        expedition.data(self.data_attr('magellan-top-offset'), top_offset);
        expedition.attr('style', styles);
      });
    },

    update_expedition_positions : function () {
      var self = this,
          window_top_offset = $(window).scrollTop();

      $('[' + this.attr_name() + '=fixed]', self.scope).each(function () {
        var expedition = $(this),
            settings = expedition.data('magellan-expedition-init'),
            styles = expedition.attr('style'), // save styles
            top_offset = expedition.data('magellan-top-offset');

        //scroll to the top distance
        if (window_top_offset + self.settings.fixed_top >= top_offset) {
          // Placeholder allows height calculations to be consistent even when
          // appearing to switch between fixed/non-fixed placement
          var placeholder = expedition.prev('[' + self.add_namespace('data-magellan-expedition-clone') + ']');
          if (placeholder.length === 0) {
            placeholder = expedition.clone();
            placeholder.removeAttr(self.attr_name());
            placeholder.attr(self.add_namespace('data-magellan-expedition-clone'), '');
            expedition.before(placeholder);
          }
          expedition.css({position :'fixed', top : settings.fixed_top}).addClass('fixed');
        } else {
          expedition.prev('[' + self.add_namespace('data-magellan-expedition-clone') + ']').remove();
          expedition.attr('style', styles).css('position', '').css('top', '').removeClass('fixed');
        }
      });
    },

    update_arrivals : function () {
      var self = this,
          window_top_offset = $(window).scrollTop();

      $('[' + this.attr_name() + ']', self.scope).each(function () {
        var expedition = $(this),
            settings = expedition.data(self.attr_name(true) + '-init'),
            offsets = self.offsets(expedition, window_top_offset),
            arrivals = expedition.find('[' + self.add_namespace('data-magellan-arrival') + ']'),
            active_item = false;
        offsets.each(function (idx, item) {
          if (item.viewport_offset >= item.top_offset) {
            var arrivals = expedition.find('[' + self.add_namespace('data-magellan-arrival') + ']');
            arrivals.not(item.arrival).removeClass(settings.active_class);
            item.arrival.addClass(settings.active_class);
            active_item = true;
            return true;
          }
        });

        if (!active_item) {
          arrivals.removeClass(settings.active_class);
        }
      });
    },

    offsets : function (expedition, window_offset) {
      var self = this,
          settings = expedition.data(self.attr_name(true) + '-init'),
          viewport_offset = window_offset;

      return expedition.find('[' + self.add_namespace('data-magellan-arrival') + ']').map(function (idx, el) {
        var name = $(this).data(self.data_attr('magellan-arrival')),
            dest = $('[' + self.add_namespace('data-magellan-destination') + '=' + name + ']');
        if (dest.length > 0) {
          var top_offset = dest.offset().top - settings.destination_threshold;
          if (settings.offset_by_height) {
            top_offset = top_offset - expedition.outerHeight();
          }
          top_offset = Math.floor(top_offset);
          return {
            destination : dest,
            arrival : $(this),
            top_offset : top_offset,
            viewport_offset : viewport_offset
          }
        }
      }).sort(function (a, b) {
        if (a.top_offset < b.top_offset) {
          return -1;
        }
        if (a.top_offset > b.top_offset) {
          return 1;
        }
        return 0;
      });
    },

    data_attr : function (str) {
      if (this.namespace.length > 0) {
        return this.namespace + '-' + str;
      }

      return str;
    },

    off : function () {
      this.S(this.scope).off('.magellan');
      this.S(window).off('.magellan');
    },

    reflow : function () {
      var self = this;
      // remove placeholder expeditions used for height calculation purposes
      $('[' + self.add_namespace('data-magellan-expedition-clone') + ']', self.scope).remove();
    }
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.offcanvas = {
    name : 'offcanvas',

    version : '5.5.1',

    settings : {
      open_method : 'move',
      close_on_click : false
    },

    init : function (scope, method, options) {
      this.bindings(method, options);
    },

    events : function () {
      var self = this,
          S = self.S,
          move_class = '',
          right_postfix = '',
          left_postfix = '';

      if (this.settings.open_method === 'move') {
        move_class = 'move-';
        right_postfix = 'right';
        left_postfix = 'left';
      } else if (this.settings.open_method === 'overlap_single') {
        move_class = 'offcanvas-overlap-';
        right_postfix = 'right';
        left_postfix = 'left';
      } else if (this.settings.open_method === 'overlap') {
        move_class = 'offcanvas-overlap';
      }

      S(this.scope).off('.offcanvas')
        .on('click.fndtn.offcanvas', '.left-off-canvas-toggle', function (e) {
          self.click_toggle_class(e, move_class + right_postfix);
          if (self.settings.open_method !== 'overlap') {
            S('.left-submenu').removeClass(move_class + right_postfix);
          }
          $('.left-off-canvas-toggle').attr('aria-expanded', 'true');
        })
        .on('click.fndtn.offcanvas', '.left-off-canvas-menu a', function (e) {
          var settings = self.get_settings(e);
          var parent = S(this).parent();

          if (settings.close_on_click && !parent.hasClass('has-submenu') && !parent.hasClass('back')) {
            self.hide.call(self, move_class + right_postfix, self.get_wrapper(e));
            parent.parent().removeClass(move_class + right_postfix);
          } else if (S(this).parent().hasClass('has-submenu')) {
            e.preventDefault();
            S(this).siblings('.left-submenu').toggleClass(move_class + right_postfix);
          } else if (parent.hasClass('back')) {
            e.preventDefault();
            parent.parent().removeClass(move_class + right_postfix);
          }
          $('.left-off-canvas-toggle').attr('aria-expanded', 'true');
        })
        .on('click.fndtn.offcanvas', '.right-off-canvas-toggle', function (e) {
          self.click_toggle_class(e, move_class + left_postfix);
          if (self.settings.open_method !== 'overlap') {
            S('.right-submenu').removeClass(move_class + left_postfix);
          }
          $('.right-off-canvas-toggle').attr('aria-expanded', 'true');
        })
        .on('click.fndtn.offcanvas', '.right-off-canvas-menu a', function (e) {
          var settings = self.get_settings(e);
          var parent = S(this).parent();

          if (settings.close_on_click && !parent.hasClass('has-submenu') && !parent.hasClass('back')) {
            self.hide.call(self, move_class + left_postfix, self.get_wrapper(e));
            parent.parent().removeClass(move_class + left_postfix);
          } else if (S(this).parent().hasClass('has-submenu')) {
            e.preventDefault();
            S(this).siblings('.right-submenu').toggleClass(move_class + left_postfix);
          } else if (parent.hasClass('back')) {
            e.preventDefault();
            parent.parent().removeClass(move_class + left_postfix);
          }
          $('.right-off-canvas-toggle').attr('aria-expanded', 'true');
        })
        .on('click.fndtn.offcanvas', '.exit-off-canvas', function (e) {
          self.click_remove_class(e, move_class + left_postfix);
          S('.right-submenu').removeClass(move_class + left_postfix);
          if (right_postfix) {
            self.click_remove_class(e, move_class + right_postfix);
            S('.left-submenu').removeClass(move_class + left_postfix);
          }
          $('.right-off-canvas-toggle').attr('aria-expanded', 'true');
        })
        .on('click.fndtn.offcanvas', '.exit-off-canvas', function (e) {
          self.click_remove_class(e, move_class + left_postfix);
          $('.left-off-canvas-toggle').attr('aria-expanded', 'false');
          if (right_postfix) {
            self.click_remove_class(e, move_class + right_postfix);
            $('.right-off-canvas-toggle').attr('aria-expanded', 'false');
          }
        });
    },

    toggle : function (class_name, $off_canvas) {
      $off_canvas = $off_canvas || this.get_wrapper();
      if ($off_canvas.is('.' + class_name)) {
        this.hide(class_name, $off_canvas);
      } else {
        this.show(class_name, $off_canvas);
      }
    },

    show : function (class_name, $off_canvas) {
      $off_canvas = $off_canvas || this.get_wrapper();
      $off_canvas.trigger('open.fndtn.offcanvas');
      $off_canvas.addClass(class_name);
    },

    hide : function (class_name, $off_canvas) {
      $off_canvas = $off_canvas || this.get_wrapper();
      $off_canvas.trigger('close.fndtn.offcanvas');
      $off_canvas.removeClass(class_name);
    },

    click_toggle_class : function (e, class_name) {
      e.preventDefault();
      var $off_canvas = this.get_wrapper(e);
      this.toggle(class_name, $off_canvas);
    },

    click_remove_class : function (e, class_name) {
      e.preventDefault();
      var $off_canvas = this.get_wrapper(e);
      this.hide(class_name, $off_canvas);
    },

    get_settings : function (e) {
      var offcanvas  = this.S(e.target).closest('[' + this.attr_name() + ']');
      return offcanvas.data(this.attr_name(true) + '-init') || this.settings;
    },

    get_wrapper : function (e) {
      var $off_canvas = this.S(e ? e.target : this.scope).closest('.off-canvas-wrap');

      if ($off_canvas.length === 0) {
        $off_canvas = this.S('.off-canvas-wrap');
      }
      return $off_canvas;
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  var noop = function () {};

  var Orbit = function (el, settings) {
    // Don't reinitialize plugin
    if (el.hasClass(settings.slides_container_class)) {
      return this;
    }

    var self = this,
        container,
        slides_container = el,
        number_container,
        bullets_container,
        timer_container,
        idx = 0,
        animate,
        timer,
        locked = false,
        adjust_height_after = false;

    self.slides = function () {
      return slides_container.children(settings.slide_selector);
    };

    self.slides().first().addClass(settings.active_slide_class);

    self.update_slide_number = function (index) {
      if (settings.slide_number) {
        number_container.find('span:first').text(parseInt(index) + 1);
        number_container.find('span:last').text(self.slides().length);
      }
      if (settings.bullets) {
        bullets_container.children().removeClass(settings.bullets_active_class);
        $(bullets_container.children().get(index)).addClass(settings.bullets_active_class);
      }
    };

    self.update_active_link = function (index) {
      var link = $('[data-orbit-link="' + self.slides().eq(index).attr('data-orbit-slide') + '"]');
      link.siblings().removeClass(settings.bullets_active_class);
      link.addClass(settings.bullets_active_class);
    };

    self.build_markup = function () {
      slides_container.wrap('<div class="' + settings.container_class + '"></div>');
      container = slides_container.parent();
      slides_container.addClass(settings.slides_container_class);

      if (settings.stack_on_small) {
        container.addClass(settings.stack_on_small_class);
      }

      if (settings.navigation_arrows) {
        container.append($('<a href="#"><span></span></a>').addClass(settings.prev_class));
        container.append($('<a href="#"><span></span></a>').addClass(settings.next_class));
      }

      if (settings.timer) {
        timer_container = $('<div>').addClass(settings.timer_container_class);
        timer_container.append('<span>');
        timer_container.append($('<div>').addClass(settings.timer_progress_class));
        timer_container.addClass(settings.timer_paused_class);
        container.append(timer_container);
      }

      if (settings.slide_number) {
        number_container = $('<div>').addClass(settings.slide_number_class);
        number_container.append('<span></span> ' + settings.slide_number_text + ' <span></span>');
        container.append(number_container);
      }

      if (settings.bullets) {
        bullets_container = $('<ol>').addClass(settings.bullets_container_class);
        container.append(bullets_container);
        bullets_container.wrap('<div class="orbit-bullets-container"></div>');
        self.slides().each(function (idx, el) {
          var bullet = $('<li>').attr('data-orbit-slide', idx).on('click', self.link_bullet);;
          bullets_container.append(bullet);
        });
      }

    };

    self._goto = function (next_idx, start_timer) {
      // if (locked) {return false;}
      if (next_idx === idx) {return false;}
      if (typeof timer === 'object') {timer.restart();}
      var slides = self.slides();

      var dir = 'next';
      locked = true;
      if (next_idx < idx) {dir = 'prev';}
      if (next_idx >= slides.length) {
        if (!settings.circular) {
          return false;
        }
        next_idx = 0;
      } else if (next_idx < 0) {
        if (!settings.circular) {
          return false;
        }
        next_idx = slides.length - 1;
      }

      var current = $(slides.get(idx));
      var next = $(slides.get(next_idx));

      current.css('zIndex', 2);
      current.removeClass(settings.active_slide_class);
      next.css('zIndex', 4).addClass(settings.active_slide_class);

      slides_container.trigger('before-slide-change.fndtn.orbit');
      settings.before_slide_change();
      self.update_active_link(next_idx);

      var callback = function () {
        var unlock = function () {
          idx = next_idx;
          locked = false;
          if (start_timer === true) {timer = self.create_timer(); timer.start();}
          self.update_slide_number(idx);
          slides_container.trigger('after-slide-change.fndtn.orbit', [{slide_number : idx, total_slides : slides.length}]);
          settings.after_slide_change(idx, slides.length);
        };
        if (slides_container.outerHeight() != next.outerHeight() && settings.variable_height) {
          slides_container.animate({'height': next.outerHeight()}, 250, 'linear', unlock);
        } else {
          unlock();
        }
      };

      if (slides.length === 1) {callback(); return false;}

      var start_animation = function () {
        if (dir === 'next') {animate.next(current, next, callback);}
        if (dir === 'prev') {animate.prev(current, next, callback);}
      };

      if (next.outerHeight() > slides_container.outerHeight() && settings.variable_height) {
        slides_container.animate({'height': next.outerHeight()}, 250, 'linear', start_animation);
      } else {
        start_animation();
      }
    };

    self.next = function (e) {
      e.stopImmediatePropagation();
      e.preventDefault();
      self._goto(idx + 1);
    };

    self.prev = function (e) {
      e.stopImmediatePropagation();
      e.preventDefault();
      self._goto(idx - 1);
    };

    self.link_custom = function (e) {
      e.preventDefault();
      var link = $(this).attr('data-orbit-link');
      if ((typeof link === 'string') && (link = $.trim(link)) != '') {
        var slide = container.find('[data-orbit-slide=' + link + ']');
        if (slide.index() != -1) {self._goto(slide.index());}
      }
    };

    self.link_bullet = function (e) {
      var index = $(this).attr('data-orbit-slide');
      if ((typeof index === 'string') && (index = $.trim(index)) != '') {
        if (isNaN(parseInt(index))) {
          var slide = container.find('[data-orbit-slide=' + index + ']');
          if (slide.index() != -1) {self._goto(slide.index() + 1);}
        } else {
          self._goto(parseInt(index));
        }
      }

    }

    self.timer_callback = function () {
      self._goto(idx + 1, true);
    }

    self.compute_dimensions = function () {
      var current = $(self.slides().get(idx));
      var h = current.outerHeight();
      if (!settings.variable_height) {
        self.slides().each(function(){
          if ($(this).outerHeight() > h) { h = $(this).outerHeight(); }
        });
      }
      slides_container.height(h);
    };

    self.create_timer = function () {
      var t = new Timer(
        container.find('.' + settings.timer_container_class),
        settings,
        self.timer_callback
      );
      return t;
    };

    self.stop_timer = function () {
      if (typeof timer === 'object') {
        timer.stop();
      }
    };

    self.toggle_timer = function () {
      var t = container.find('.' + settings.timer_container_class);
      if (t.hasClass(settings.timer_paused_class)) {
        if (typeof timer === 'undefined') {timer = self.create_timer();}
        timer.start();
      } else {
        if (typeof timer === 'object') {timer.stop();}
      }
    };

    self.init = function () {
      self.build_markup();
      if (settings.timer) {
        timer = self.create_timer();
        Foundation.utils.image_loaded(this.slides().children('img'), timer.start);
      }
      animate = new FadeAnimation(settings, slides_container);
      if (settings.animation === 'slide') {
        animate = new SlideAnimation(settings, slides_container);
      }

      container.on('click', '.' + settings.next_class, self.next);
      container.on('click', '.' + settings.prev_class, self.prev);

      if (settings.next_on_click) {
        container.on('click', '.' + settings.slides_container_class + ' [data-orbit-slide]', self.link_bullet);
      }

      container.on('click', self.toggle_timer);
      if (settings.swipe) {
        container.on('touchstart.fndtn.orbit', function (e) {
          if (!e.touches) {e = e.originalEvent;}
          var data = {
            start_page_x : e.touches[0].pageX,
            start_page_y : e.touches[0].pageY,
            start_time : (new Date()).getTime(),
            delta_x : 0,
            is_scrolling : undefined
          };
          container.data('swipe-transition', data);
          e.stopPropagation();
        })
        .on('touchmove.fndtn.orbit', function (e) {
          if (!e.touches) {
            e = e.originalEvent;
          }
          // Ignore pinch/zoom events
          if (e.touches.length > 1 || e.scale && e.scale !== 1) {
            return;
          }

          var data = container.data('swipe-transition');
          if (typeof data === 'undefined') {data = {};}

          data.delta_x = e.touches[0].pageX - data.start_page_x;

          if ( typeof data.is_scrolling === 'undefined') {
            data.is_scrolling = !!( data.is_scrolling || Math.abs(data.delta_x) < Math.abs(e.touches[0].pageY - data.start_page_y) );
          }

          if (!data.is_scrolling && !data.active) {
            e.preventDefault();
            var direction = (data.delta_x < 0) ? (idx + 1) : (idx - 1);
            data.active = true;
            self._goto(direction);
          }
        })
        .on('touchend.fndtn.orbit', function (e) {
          container.data('swipe-transition', {});
          e.stopPropagation();
        })
      }
      container.on('mouseenter.fndtn.orbit', function (e) {
        if (settings.timer && settings.pause_on_hover) {
          self.stop_timer();
        }
      })
      .on('mouseleave.fndtn.orbit', function (e) {
        if (settings.timer && settings.resume_on_mouseout) {
          timer.start();
        }
      });

      $(document).on('click', '[data-orbit-link]', self.link_custom);
      $(window).on('load resize', self.compute_dimensions);
      Foundation.utils.image_loaded(this.slides().children('img'), self.compute_dimensions);
      Foundation.utils.image_loaded(this.slides().children('img'), function () {
        container.prev('.' + settings.preloader_class).css('display', 'none');
        self.update_slide_number(0);
        self.update_active_link(0);
        slides_container.trigger('ready.fndtn.orbit');
      });
    };

    self.init();
  };

  var Timer = function (el, settings, callback) {
    var self = this,
        duration = settings.timer_speed,
        progress = el.find('.' + settings.timer_progress_class),
        start,
        timeout,
        left = -1;

    this.update_progress = function (w) {
      var new_progress = progress.clone();
      new_progress.attr('style', '');
      new_progress.css('width', w + '%');
      progress.replaceWith(new_progress);
      progress = new_progress;
    };

    this.restart = function () {
      clearTimeout(timeout);
      el.addClass(settings.timer_paused_class);
      left = -1;
      self.update_progress(0);
    };

    this.start = function () {
      if (!el.hasClass(settings.timer_paused_class)) {return true;}
      left = (left === -1) ? duration : left;
      el.removeClass(settings.timer_paused_class);
      start = new Date().getTime();
      progress.animate({'width' : '100%'}, left, 'linear');
      timeout = setTimeout(function () {
        self.restart();
        callback();
      }, left);
      el.trigger('timer-started.fndtn.orbit')
    };

    this.stop = function () {
      if (el.hasClass(settings.timer_paused_class)) {return true;}
      clearTimeout(timeout);
      el.addClass(settings.timer_paused_class);
      var end = new Date().getTime();
      left = left - (end - start);
      var w = 100 - ((left / duration) * 100);
      self.update_progress(w);
      el.trigger('timer-stopped.fndtn.orbit');
    };
  };

  var SlideAnimation = function (settings, container) {
    var duration = settings.animation_speed;
    var is_rtl = ($('html[dir=rtl]').length === 1);
    var margin = is_rtl ? 'marginRight' : 'marginLeft';
    var animMargin = {};
    animMargin[margin] = '0%';

    this.next = function (current, next, callback) {
      current.animate({marginLeft : '-100%'}, duration);
      next.animate(animMargin, duration, function () {
        current.css(margin, '100%');
        callback();
      });
    };

    this.prev = function (current, prev, callback) {
      current.animate({marginLeft : '100%'}, duration);
      prev.css(margin, '-100%');
      prev.animate(animMargin, duration, function () {
        current.css(margin, '100%');
        callback();
      });
    };
  };

  var FadeAnimation = function (settings, container) {
    var duration = settings.animation_speed;
    var is_rtl = ($('html[dir=rtl]').length === 1);
    var margin = is_rtl ? 'marginRight' : 'marginLeft';

    this.next = function (current, next, callback) {
      next.css({'margin' : '0%', 'opacity' : '0.01'});
      next.animate({'opacity' :'1'}, duration, 'linear', function () {
        current.css('margin', '100%');
        callback();
      });
    };

    this.prev = function (current, prev, callback) {
      prev.css({'margin' : '0%', 'opacity' : '0.01'});
      prev.animate({'opacity' : '1'}, duration, 'linear', function () {
        current.css('margin', '100%');
        callback();
      });
    };
  };

  Foundation.libs = Foundation.libs || {};

  Foundation.libs.orbit = {
    name : 'orbit',

    version : '5.5.1',

    settings : {
      animation : 'slide',
      timer_speed : 10000,
      pause_on_hover : true,
      resume_on_mouseout : false,
      next_on_click : true,
      animation_speed : 500,
      stack_on_small : false,
      navigation_arrows : true,
      slide_number : true,
      slide_number_text : 'of',
      container_class : 'orbit-container',
      stack_on_small_class : 'orbit-stack-on-small',
      next_class : 'orbit-next',
      prev_class : 'orbit-prev',
      timer_container_class : 'orbit-timer',
      timer_paused_class : 'paused',
      timer_progress_class : 'orbit-progress',
      slides_container_class : 'orbit-slides-container',
      preloader_class : 'preloader',
      slide_selector : '*',
      bullets_container_class : 'orbit-bullets',
      bullets_active_class : 'active',
      slide_number_class : 'orbit-slide-number',
      caption_class : 'orbit-caption',
      active_slide_class : 'active',
      orbit_transition_class : 'orbit-transitioning',
      bullets : true,
      circular : true,
      timer : true,
      variable_height : false,
      swipe : true,
      before_slide_change : noop,
      after_slide_change : noop
    },

    init : function (scope, method, options) {
      var self = this;
      this.bindings(method, options);
    },

    events : function (instance) {
      var orbit_instance = new Orbit(this.S(instance), this.S(instance).data('orbit-init'));
      this.S(instance).data(this.name + '-instance', orbit_instance);
    },

    reflow : function () {
      var self = this;

      if (self.S(self.scope).is('[data-orbit]')) {
        var $el = self.S(self.scope);
        var instance = $el.data(self.name + '-instance');
        instance.compute_dimensions();
      } else {
        self.S('[data-orbit]', self.scope).each(function (idx, el) {
          var $el = self.S(el);
          var opts = self.data_options($el);
          var instance = $el.data(self.name + '-instance');
          instance.compute_dimensions();
        });
      }
    }
  };

}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.reveal = {
    name : 'reveal',

    version : '5.5.1',

    locked : false,

    settings : {
      animation : 'fadeAndPop',
      animation_speed : 250,
      close_on_background_click : true,
      close_on_esc : true,
      dismiss_modal_class : 'close-reveal-modal',
      multiple_opened : false,
      bg_class : 'reveal-modal-bg',
      root_element : 'body',
      open : function(){},
      opened : function(){},
      close : function(){},
      closed : function(){},
      on_ajax_error: $.noop,
      bg : $('.reveal-modal-bg'),
      css : {
        open : {
          'opacity' : 0,
          'visibility' : 'visible',
          'display' : 'block'
        },
        close : {
          'opacity' : 1,
          'visibility' : 'hidden',
          'display' : 'none'
        }
      }
    },

    init : function (scope, method, options) {
      $.extend(true, this.settings, method, options);
      this.bindings(method, options);
    },

    events : function (scope) {
      var self = this,
          S = self.S;

      S(this.scope)
        .off('.reveal')
        .on('click.fndtn.reveal', '[' + this.add_namespace('data-reveal-id') + ']:not([disabled])', function (e) {
          e.preventDefault();

          if (!self.locked) {
            var element = S(this),
                ajax = element.data(self.data_attr('reveal-ajax')),
                replaceContentSel = element.data(self.data_attr('reveal-replace-content'));

            self.locked = true;

            if (typeof ajax === 'undefined') {
              self.open.call(self, element);
            } else {
              var url = ajax === true ? element.attr('href') : ajax;
              self.open.call(self, element, {url : url}, { replaceContentSel : replaceContentSel });
            }
          }
        });

      S(document)
        .on('click.fndtn.reveal', this.close_targets(), function (e) {
          e.preventDefault();
          if (!self.locked) {
            var settings = S('[' + self.attr_name() + '].open').data(self.attr_name(true) + '-init') || self.settings,
                bg_clicked = S(e.target)[0] === S('.' + settings.bg_class)[0];

            if (bg_clicked) {
              if (settings.close_on_background_click) {
                e.stopPropagation();
              } else {
                return;
              }
            }

            self.locked = true;
            self.close.call(self, bg_clicked ? S('[' + self.attr_name() + '].open:not(.toback)') : S(this).closest('[' + self.attr_name() + ']'));
          }
        });

      if (S('[' + self.attr_name() + ']', this.scope).length > 0) {
        S(this.scope)
          // .off('.reveal')
          .on('open.fndtn.reveal', this.settings.open)
          .on('opened.fndtn.reveal', this.settings.opened)
          .on('opened.fndtn.reveal', this.open_video)
          .on('close.fndtn.reveal', this.settings.close)
          .on('closed.fndtn.reveal', this.settings.closed)
          .on('closed.fndtn.reveal', this.close_video);
      } else {
        S(this.scope)
          // .off('.reveal')
          .on('open.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.open)
          .on('opened.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.opened)
          .on('opened.fndtn.reveal', '[' + self.attr_name() + ']', this.open_video)
          .on('close.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.close)
          .on('closed.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.closed)
          .on('closed.fndtn.reveal', '[' + self.attr_name() + ']', this.close_video);
      }

      return true;
    },

    // PATCH #3: turning on key up capture only when a reveal window is open
    key_up_on : function (scope) {
      var self = this;

      // PATCH #1: fixing multiple keyup event trigger from single key press
      self.S('body').off('keyup.fndtn.reveal').on('keyup.fndtn.reveal', function ( event ) {
        var open_modal = self.S('[' + self.attr_name() + '].open'),
            settings = open_modal.data(self.attr_name(true) + '-init') || self.settings ;
        // PATCH #2: making sure that the close event can be called only while unlocked,
        //           so that multiple keyup.fndtn.reveal events don't prevent clean closing of the reveal window.
        if ( settings && event.which === 27  && settings.close_on_esc && !self.locked) { // 27 is the keycode for the Escape key
          self.close.call(self, open_modal);
        }
      });

      return true;
    },

    // PATCH #3: turning on key up capture only when a reveal window is open
    key_up_off : function (scope) {
      this.S('body').off('keyup.fndtn.reveal');
      return true;
    },

    open : function (target, ajax_settings) {
      var self = this,
          modal;

      if (target) {
        if (typeof target.selector !== 'undefined') {
          // Find the named node; only use the first one found, since the rest of the code assumes there's only one node
          modal = self.S('#' + target.data(self.data_attr('reveal-id'))).first();
        } else {
          modal = self.S(this.scope);

          ajax_settings = target;
        }
      } else {
        modal = self.S(this.scope);
      }

      var settings = modal.data(self.attr_name(true) + '-init');
      settings = settings || this.settings;


      if (modal.hasClass('open') && target.attr('data-reveal-id') == modal.attr('id')) {
        return self.close(modal);
      }

      if (!modal.hasClass('open')) {
        var open_modal = self.S('[' + self.attr_name() + '].open');

        if (typeof modal.data('css-top') === 'undefined') {
          modal.data('css-top', parseInt(modal.css('top'), 10))
            .data('offset', this.cache_offset(modal));
        }

        modal.attr('tabindex','0').attr('aria-hidden','false');

        this.key_up_on(modal);    // PATCH #3: turning on key up capture only when a reveal window is open

        // Prevent namespace event from triggering twice
        modal.on('open.fndtn.reveal', function(e) {
          if (e.namespace !== 'fndtn.reveal') return;
        });

        modal.on('open.fndtn.reveal').trigger('open.fndtn.reveal');

        if (open_modal.length < 1) {
          this.toggle_bg(modal, true);
        }

        if (typeof ajax_settings === 'string') {
          ajax_settings = {
            url : ajax_settings
          };
        }

        if (typeof ajax_settings === 'undefined' || !ajax_settings.url) {
          if (open_modal.length > 0) {
            if (settings.multiple_opened) {
              self.to_back(open_modal);
            } else {
              self.hide(open_modal, settings.css.close);
            }
          }

          this.show(modal, settings.css.open);
        } else {
          var old_success = typeof ajax_settings.success !== 'undefined' ? ajax_settings.success : null;
          $.extend(ajax_settings, {
            success : function (data, textStatus, jqXHR) {
              if ( $.isFunction(old_success) ) {
                var result = old_success(data, textStatus, jqXHR);
                if (typeof result == 'string') {
                  data = result;
                }
              }

              if (typeof options !== 'undefined' && typeof options.replaceContentSel !== 'undefined') {
                modal.find(options.replaceContentSel).html(data);
              } else {
                modal.html(data);
              }

              self.S(modal).foundation('section', 'reflow');
              self.S(modal).children().foundation();

              if (open_modal.length > 0) {
                if (settings.multiple_opened) {
                  self.to_back(open_modal);
                } else {
                  self.hide(open_modal, settings.css.close);
                }
              }
              self.show(modal, settings.css.open);
            }
          });

          // check for if user initalized with error callback
          if (settings.on_ajax_error !== $.noop) {
            $.extend(ajax_settings, {
              error : settings.on_ajax_error
            });
          }

          $.ajax(ajax_settings);
        }
      }
      self.S(window).trigger('resize');
    },

    close : function (modal) {
      var modal = modal && modal.length ? modal : this.S(this.scope),
          open_modals = this.S('[' + this.attr_name() + '].open'),
          settings = modal.data(this.attr_name(true) + '-init') || this.settings,
          self = this;

      if (open_modals.length > 0) {

        modal.removeAttr('tabindex','0').attr('aria-hidden','true');

        this.locked = true;
        this.key_up_off(modal);   // PATCH #3: turning on key up capture only when a reveal window is open

        modal.trigger('close.fndtn.reveal');

        if ((settings.multiple_opened && open_modals.length === 1) || !settings.multiple_opened || modal.length > 1) {
          self.toggle_bg(modal, false);
          self.to_front(modal);
        }

        if (settings.multiple_opened) {
          self.hide(modal, settings.css.close, settings);
          self.to_front($($.makeArray(open_modals).reverse()[1]));
        } else {
          self.hide(open_modals, settings.css.close, settings);
        }
      }
    },

    close_targets : function () {
      var base = '.' + this.settings.dismiss_modal_class;

      if (this.settings.close_on_background_click) {
        return base + ', .' + this.settings.bg_class;
      }

      return base;
    },

    toggle_bg : function (modal, state) {
      if (this.S('.' + this.settings.bg_class).length === 0) {
        this.settings.bg = $('<div />', {'class': this.settings.bg_class})
          .appendTo('body').hide();
      }

      var visible = this.settings.bg.filter(':visible').length > 0;
      if ( state != visible ) {
        if ( state == undefined ? visible : !state ) {
          this.hide(this.settings.bg);
        } else {
          this.show(this.settings.bg);
        }
      }
    },

    show : function (el, css) {
      // is modal
      if (css) {
        var settings = el.data(this.attr_name(true) + '-init') || this.settings,
            root_element = settings.root_element,
            context = this;

        if (el.parent(root_element).length === 0) {
          var placeholder = el.wrap('<div style="display: none;" />').parent();

          el.on('closed.fndtn.reveal.wrapped', function () {
            el.detach().appendTo(placeholder);
            el.unwrap().unbind('closed.fndtn.reveal.wrapped');
          });

          el.detach().appendTo(root_element);
        }

        var animData = getAnimationData(settings.animation);
        if (!animData.animate) {
          this.locked = false;
        }
        if (animData.pop) {
          css.top = $(window).scrollTop() - el.data('offset') + 'px';
          var end_css = {
            top: $(window).scrollTop() + el.data('css-top') + 'px',
            opacity: 1
          };

          return setTimeout(function () {
            return el
              .css(css)
              .animate(end_css, settings.animation_speed, 'linear', function () {
                context.locked = false;
                el.trigger('opened.fndtn.reveal');
              })
              .addClass('open');
          }, settings.animation_speed / 2);
        }

        if (animData.fade) {
          css.top = $(window).scrollTop() + el.data('css-top') + 'px';
          var end_css = {opacity: 1};

          return setTimeout(function () {
            return el
              .css(css)
              .animate(end_css, settings.animation_speed, 'linear', function () {
                context.locked = false;
                el.trigger('opened.fndtn.reveal');
              })
              .addClass('open');
          }, settings.animation_speed / 2);
        }

        return el.css(css).show().css({opacity : 1}).addClass('open').trigger('opened.fndtn.reveal');
      }

      var settings = this.settings;

      // should we animate the background?
      if (getAnimationData(settings.animation).fade) {
        return el.fadeIn(settings.animation_speed / 2);
      }

      this.locked = false;

      return el.show();
    },

    to_back : function(el) {
      el.addClass('toback');
    },

    to_front : function(el) {
      el.removeClass('toback');
    },

    hide : function (el, css) {
      // is modal
      if (css) {
        var settings = el.data(this.attr_name(true) + '-init'),
            context = this;
        settings = settings || this.settings;

        var animData = getAnimationData(settings.animation);
        if (!animData.animate) {
          this.locked = false;
        }
        if (animData.pop) {
          var end_css = {
            top: - $(window).scrollTop() - el.data('offset') + 'px',
            opacity: 0
          };

          return setTimeout(function () {
            return el
              .animate(end_css, settings.animation_speed, 'linear', function () {
                context.locked = false;
                el.css(css).trigger('closed.fndtn.reveal');
              })
              .removeClass('open');
          }, settings.animation_speed / 2);
        }

        if (animData.fade) {
          var end_css = {opacity : 0};

          return setTimeout(function () {
            return el
              .animate(end_css, settings.animation_speed, 'linear', function () {
                context.locked = false;
                el.css(css).trigger('closed.fndtn.reveal');
              })
              .removeClass('open');
          }, settings.animation_speed / 2);
        }

        return el.hide().css(css).removeClass('open').trigger('closed.fndtn.reveal');
      }

      var settings = this.settings;

      // should we animate the background?
      if (getAnimationData(settings.animation).fade) {
        return el.fadeOut(settings.animation_speed / 2);
      }

      return el.hide();
    },

    close_video : function (e) {
      var video = $('.flex-video', e.target),
          iframe = $('iframe', video);

      if (iframe.length > 0) {
        iframe.attr('data-src', iframe[0].src);
        iframe.attr('src', iframe.attr('src'));
        video.hide();
      }
    },

    open_video : function (e) {
      var video = $('.flex-video', e.target),
          iframe = video.find('iframe');

      if (iframe.length > 0) {
        var data_src = iframe.attr('data-src');
        if (typeof data_src === 'string') {
          iframe[0].src = iframe.attr('data-src');
        } else {
          var src = iframe[0].src;
          iframe[0].src = undefined;
          iframe[0].src = src;
        }
        video.show();
      }
    },

    data_attr : function (str) {
      if (this.namespace.length > 0) {
        return this.namespace + '-' + str;
      }

      return str;
    },

    cache_offset : function (modal) {
      var offset = modal.show().height() + parseInt(modal.css('top'), 10) + modal.scrollY;

      modal.hide();

      return offset;
    },

    off : function () {
      $(this.scope).off('.fndtn.reveal');
    },

    reflow : function () {}
  };

  /*
   * getAnimationData('popAndFade') // {animate: true,  pop: true,  fade: true}
   * getAnimationData('fade')       // {animate: true,  pop: false, fade: true}
   * getAnimationData('pop')        // {animate: true,  pop: true,  fade: false}
   * getAnimationData('foo')        // {animate: false, pop: false, fade: false}
   * getAnimationData(null)         // {animate: false, pop: false, fade: false}
   */
  function getAnimationData(str) {
    var fade = /fade/i.test(str);
    var pop = /pop/i.test(str);
    return {
      animate : fade || pop,
      pop : pop,
      fade : fade
    };
  }
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.slider = {
    name : 'slider',

    version : '5.5.1',

    settings : {
      start : 0,
      end : 100,
      step : 1,
      precision : null,
      initial : null,
      display_selector : '',
      vertical : false,
      trigger_input_change : false,
      on_change : function () {}
    },

    cache : {},

    init : function (scope, method, options) {
      Foundation.inherit(this, 'throttle');
      this.bindings(method, options);
      this.reflow();
    },

    events : function () {
      var self = this;

      $(this.scope)
        .off('.slider')
        .on('mousedown.fndtn.slider touchstart.fndtn.slider pointerdown.fndtn.slider',
        '[' + self.attr_name() + ']:not(.disabled, [disabled]) .range-slider-handle', function (e) {
          if (!self.cache.active) {
            e.preventDefault();
            self.set_active_slider($(e.target));
          }
        })
        .on('mousemove.fndtn.slider touchmove.fndtn.slider pointermove.fndtn.slider', function (e) {
          if (!!self.cache.active) {
            e.preventDefault();
            if ($.data(self.cache.active[0], 'settings').vertical) {
              var scroll_offset = 0;
              if (!e.pageY) {
                scroll_offset = window.scrollY;
              }
              self.calculate_position(self.cache.active, self.get_cursor_position(e, 'y') + scroll_offset);
            } else {
              self.calculate_position(self.cache.active, self.get_cursor_position(e, 'x'));
            }
          }
        })
        .on('mouseup.fndtn.slider touchend.fndtn.slider pointerup.fndtn.slider', function (e) {
          self.remove_active_slider();
        })
        .on('change.fndtn.slider', function (e) {
          self.settings.on_change();
        });

      self.S(window)
        .on('resize.fndtn.slider', self.throttle(function (e) {
          self.reflow();
        }, 300));

      // update slider value as users change input value
      this.S('[' + this.attr_name() + ']').each(function () {
        var slider = $(this),
            handle = slider.children('.range-slider-handle')[0],
            settings = self.initialize_settings(handle);

        if (settings.display_selector != '') {
          $(settings.display_selector).each(function(){
            if (this.hasOwnProperty('value')) {
              $(this).change(function(){
                // is there a better way to do this?
                slider.foundation("slider", "set_value", $(this).val());
              });
            }
          });
        }
      });
    },

    get_cursor_position : function (e, xy) {
      var pageXY = 'page' + xy.toUpperCase(),
          clientXY = 'client' + xy.toUpperCase(),
          position;

      if (typeof e[pageXY] !== 'undefined') {
        position = e[pageXY];
      } else if (typeof e.originalEvent[clientXY] !== 'undefined') {
        position = e.originalEvent[clientXY];
      } else if (e.originalEvent.touches && e.originalEvent.touches[0] && typeof e.originalEvent.touches[0][clientXY] !== 'undefined') {
        position = e.originalEvent.touches[0][clientXY];
      } else if (e.currentPoint && typeof e.currentPoint[xy] !== 'undefined') {
        position = e.currentPoint[xy];
      }

      return position;
    },

    set_active_slider : function ($handle) {
      this.cache.active = $handle;
    },

    remove_active_slider : function () {
      this.cache.active = null;
    },

    calculate_position : function ($handle, cursor_x) {
      var self = this,
          settings = $.data($handle[0], 'settings'),
          handle_l = $.data($handle[0], 'handle_l'),
          handle_o = $.data($handle[0], 'handle_o'),
          bar_l = $.data($handle[0], 'bar_l'),
          bar_o = $.data($handle[0], 'bar_o');

      requestAnimationFrame(function () {
        var pct;

        if (Foundation.rtl && !settings.vertical) {
          pct = self.limit_to(((bar_o + bar_l - cursor_x) / bar_l), 0, 1);
        } else {
          pct = self.limit_to(((cursor_x - bar_o) / bar_l), 0, 1);
        }

        pct = settings.vertical ? 1 - pct : pct;

        var norm = self.normalized_value(pct, settings.start, settings.end, settings.step, settings.precision);

        self.set_ui($handle, norm);
      });
    },

    set_ui : function ($handle, value) {
      var settings = $.data($handle[0], 'settings'),
          handle_l = $.data($handle[0], 'handle_l'),
          bar_l = $.data($handle[0], 'bar_l'),
          norm_pct = this.normalized_percentage(value, settings.start, settings.end),
          handle_offset = norm_pct * (bar_l - handle_l) - 1,
          progress_bar_length = norm_pct * 100,
          $handle_parent = $handle.parent(),
          $hidden_inputs = $handle.parent().children('input[type=hidden]');

      if (Foundation.rtl && !settings.vertical) {
        handle_offset = -handle_offset;
      }

      handle_offset = settings.vertical ? -handle_offset + bar_l - handle_l + 1 : handle_offset;
      this.set_translate($handle, handle_offset, settings.vertical);

      if (settings.vertical) {
        $handle.siblings('.range-slider-active-segment').css('height', progress_bar_length + '%');
      } else {
        $handle.siblings('.range-slider-active-segment').css('width', progress_bar_length + '%');
      }

      $handle_parent.attr(this.attr_name(), value).trigger('change.fndtn.slider');

      $hidden_inputs.val(value);
      if (settings.trigger_input_change) {
          $hidden_inputs.trigger('change');
      }

      if (!$handle[0].hasAttribute('aria-valuemin')) {
        $handle.attr({
          'aria-valuemin' : settings.start,
          'aria-valuemax' : settings.end
        });
      }
      $handle.attr('aria-valuenow', value);

      if (settings.display_selector != '') {
        $(settings.display_selector).each(function () {
          if (this.hasAttribute('value')) {
            $(this).val(value);
          } else {
            $(this).text(value);
          }
        });
      }

    },

    normalized_percentage : function (val, start, end) {
      return Math.min(1, (val - start) / (end - start));
    },

    normalized_value : function (val, start, end, step, precision) {
      var range = end - start,
          point = val * range,
          mod = (point - (point % step)) / step,
          rem = point % step,
          round = ( rem >= step * 0.5 ? step : 0);
      return ((mod * step + round) + start).toFixed(precision);
    },

    set_translate : function (ele, offset, vertical) {
      if (vertical) {
        $(ele)
          .css('-webkit-transform', 'translateY(' + offset + 'px)')
          .css('-moz-transform', 'translateY(' + offset + 'px)')
          .css('-ms-transform', 'translateY(' + offset + 'px)')
          .css('-o-transform', 'translateY(' + offset + 'px)')
          .css('transform', 'translateY(' + offset + 'px)');
      } else {
        $(ele)
          .css('-webkit-transform', 'translateX(' + offset + 'px)')
          .css('-moz-transform', 'translateX(' + offset + 'px)')
          .css('-ms-transform', 'translateX(' + offset + 'px)')
          .css('-o-transform', 'translateX(' + offset + 'px)')
          .css('transform', 'translateX(' + offset + 'px)');
      }
    },

    limit_to : function (val, min, max) {
      return Math.min(Math.max(val, min), max);
    },

    initialize_settings : function (handle) {
      var settings = $.extend({}, this.settings, this.data_options($(handle).parent())),
          decimal_places_match_result;

      if (settings.precision === null) {
        decimal_places_match_result = ('' + settings.step).match(/\.([\d]*)/);
        settings.precision = decimal_places_match_result && decimal_places_match_result[1] ? decimal_places_match_result[1].length : 0;
      }

      if (settings.vertical) {
        $.data(handle, 'bar_o', $(handle).parent().offset().top);
        $.data(handle, 'bar_l', $(handle).parent().outerHeight());
        $.data(handle, 'handle_o', $(handle).offset().top);
        $.data(handle, 'handle_l', $(handle).outerHeight());
      } else {
        $.data(handle, 'bar_o', $(handle).parent().offset().left);
        $.data(handle, 'bar_l', $(handle).parent().outerWidth());
        $.data(handle, 'handle_o', $(handle).offset().left);
        $.data(handle, 'handle_l', $(handle).outerWidth());
      }

      $.data(handle, 'bar', $(handle).parent());
      return $.data(handle, 'settings', settings);
    },

    set_initial_position : function ($ele) {
      var settings = $.data($ele.children('.range-slider-handle')[0], 'settings'),
          initial = ((typeof settings.initial == 'number' && !isNaN(settings.initial)) ? settings.initial : Math.floor((settings.end - settings.start) * 0.5 / settings.step) * settings.step + settings.start),
          $handle = $ele.children('.range-slider-handle');
      this.set_ui($handle, initial);
    },

    set_value : function (value) {
      var self = this;
      $('[' + self.attr_name() + ']', this.scope).each(function () {
        $(this).attr(self.attr_name(), value);
      });
      if (!!$(this.scope).attr(self.attr_name())) {
        $(this.scope).attr(self.attr_name(), value);
      }
      self.reflow();
    },

    reflow : function () {
      var self = this;
      self.S('[' + this.attr_name() + ']').each(function () {
        var handle = $(this).children('.range-slider-handle')[0],
            val = $(this).attr(self.attr_name());
        self.initialize_settings(handle);

        if (val) {
          self.set_ui($(handle), parseFloat(val));
        } else {
          self.set_initial_position($(this));
        }
      });
    }
  };

}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.tab = {
    name : 'tab',

    version : '5.5.1',

    settings : {
      active_class : 'active',
      callback : function () {},
      deep_linking : false,
      scroll_to_content : true,
      is_hover : false
    },

    default_tab_hashes : [],

    init : function (scope, method, options) {
      var self = this,
          S = this.S;

	  // Store the default active tabs which will be referenced when the
	  // location hash is absent, as in the case of navigating the tabs and
	  // returning to the first viewing via the browser Back button.
	  S('[' + this.attr_name() + '] > .active > a', this.scope).each(function () {
	    self.default_tab_hashes.push(this.hash);
	  });

      // store the initial href, which is used to allow correct behaviour of the
      // browser back button when deep linking is turned on.
      self.entry_location = window.location.href;

      this.bindings(method, options);
      this.handle_location_hash_change();
    },

    events : function () {
      var self = this,
          S = this.S;

      var usual_tab_behavior =  function (e, target) {
          var settings = S(target).closest('[' + self.attr_name() + ']').data(self.attr_name(true) + '-init');
          if (!settings.is_hover || Modernizr.touch) {
            e.preventDefault();
            e.stopPropagation();
            self.toggle_active_tab(S(target).parent());
          }
        };

      S(this.scope)
        .off('.tab')
        // Key event: focus/tab key
        .on('keydown.fndtn.tab', '[' + this.attr_name() + '] > * > a', function(e) {
          var el = this;
          var keyCode = e.keyCode || e.which;
            // if user pressed tab key
            if (keyCode == 9) { 
              e.preventDefault();
              // TODO: Change usual_tab_behavior into accessibility function?
              usual_tab_behavior(e, el);
            } 
        })
        // Click event: tab title
        .on('click.fndtn.tab', '[' + this.attr_name() + '] > * > a', function(e) {
          var el = this;
          usual_tab_behavior(e, el);
        })
        // Hover event: tab title
        .on('mouseenter.fndtn.tab', '[' + this.attr_name() + '] > * > a', function (e) {
          var settings = S(this).closest('[' + self.attr_name() + ']').data(self.attr_name(true) + '-init');
          if (settings.is_hover) {
            self.toggle_active_tab(S(this).parent());
          }
        });

      // Location hash change event
      S(window).on('hashchange.fndtn.tab', function (e) {
        e.preventDefault();
        self.handle_location_hash_change();
      });
    },

    handle_location_hash_change : function () {

      var self = this,
          S = this.S;

      S('[' + this.attr_name() + ']', this.scope).each(function () {
        var settings = S(this).data(self.attr_name(true) + '-init');
        if (settings.deep_linking) {
          // Match the location hash to a label
          var hash;
          if (settings.scroll_to_content) {
            hash = self.scope.location.hash;
          } else {
            // prefix the hash to prevent anchor scrolling
            hash = self.scope.location.hash.replace('fndtn-', '');
          }
          if (hash != '') {
            // Check whether the location hash references a tab content div or
            // another element on the page (inside or outside the tab content div)
            var hash_element = S(hash);
            if (hash_element.hasClass('content') && hash_element.parent().hasClass('tabs-content')) {
              // Tab content div
              self.toggle_active_tab($('[' + self.attr_name() + '] > * > a[href=' + hash + ']').parent());
            } else {
              // Not the tab content div. If inside the tab content, find the
              // containing tab and toggle it as active.
              var hash_tab_container_id = hash_element.closest('.content').attr('id');
              if (hash_tab_container_id != undefined) {
                self.toggle_active_tab($('[' + self.attr_name() + '] > * > a[href=#' + hash_tab_container_id + ']').parent(), hash);
              }
            }
          } else {
            // Reference the default tab hashes which were initialized in the init function
            for (var ind = 0; ind < self.default_tab_hashes.length; ind++) {
              self.toggle_active_tab($('[' + self.attr_name() + '] > * > a[href=' + self.default_tab_hashes[ind] + ']').parent());
            }
          }
        }
       });
     },

    toggle_active_tab : function (tab, location_hash) {
      var self = this,
          S = self.S,
          tabs = tab.closest('[' + this.attr_name() + ']'),
          tab_link = tab.find('a'),
          anchor = tab.children('a').first(),
          target_hash = '#' + anchor.attr('href').split('#')[1],
          target = S(target_hash),
          siblings = tab.siblings(),
          settings = tabs.data(this.attr_name(true) + '-init'),
          interpret_keyup_action = function (e) {
            // Light modification of Heydon Pickering's Practical ARIA Examples: http://heydonworks.com/practical_aria_examples/js/a11y.js

            // define current, previous and next (possible) tabs

            var $original = $(this);
            var $prev = $(this).parents('li').prev().children('[role="tab"]');
            var $next = $(this).parents('li').next().children('[role="tab"]');
            var $target;

            // find the direction (prev or next)

            switch (e.keyCode) {
              case 37:
                $target = $prev;
                break;
              case 39:
                $target = $next;
                break;
              default:
                $target = false
                  break;
            }

            if ($target.length) {
              $original.attr({
                'tabindex' : '-1',
                'aria-selected' : null
              });
              $target.attr({
                'tabindex' : '0',
                'aria-selected' : true
              }).focus();
            }

            // Hide panels

            $('[role="tabpanel"]')
              .attr('aria-hidden', 'true');

            // Show panel which corresponds to target

            $('#' + $(document.activeElement).attr('href').substring(1))
              .attr('aria-hidden', null);

          },
          go_to_hash = function(hash) {
            // This function allows correct behaviour of the browser's back button when deep linking is enabled. Without it
            // the user would get continually redirected to the default hash.
            var is_entry_location = window.location.href === self.entry_location,
                default_hash = settings.scroll_to_content ? self.default_tab_hashes[0] : is_entry_location ? window.location.hash :'fndtn-' + self.default_tab_hashes[0].replace('#', '')

            if (!(is_entry_location && hash === default_hash)) {
              window.location.hash = hash;
            }
          };

      // allow usage of data-tab-content attribute instead of href
      if (anchor.data('tab-content')) {
        target_hash = '#' + anchor.data('tab-content').split('#')[1];
        target = S(target_hash);
      }

      if (settings.deep_linking) {

        if (settings.scroll_to_content) {

          // retain current hash to scroll to content
          go_to_hash(location_hash || target_hash);

          if (location_hash == undefined || location_hash == target_hash) {
            tab.parent()[0].scrollIntoView();
          } else {
            S(target_hash)[0].scrollIntoView();
          }
        } else {
          // prefix the hashes so that the browser doesn't scroll down
          if (location_hash != undefined) {
            go_to_hash('fndtn-' + location_hash.replace('#', ''));
          } else {
            go_to_hash('fndtn-' + target_hash.replace('#', ''));
          }
        }
      }

      // WARNING: The activation and deactivation of the tab content must
      // occur after the deep linking in order to properly refresh the browser
      // window (notably in Chrome).
      // Clean up multiple attr instances to done once
      tab.addClass(settings.active_class).triggerHandler('opened');
      tab_link.attr({'aria-selected' : 'true',  tabindex : 0});
      siblings.removeClass(settings.active_class)
      siblings.find('a').attr({'aria-selected' : 'false',  tabindex : -1});
      target.siblings().removeClass(settings.active_class).attr({'aria-hidden' : 'true',  tabindex : -1});
      target.addClass(settings.active_class).attr('aria-hidden', 'false').removeAttr('tabindex');
      settings.callback(tab);
      target.triggerHandler('toggled', [tab]);
      tabs.triggerHandler('toggled', [target]);

      tab_link.off('keydown').on('keydown', interpret_keyup_action );
    },

    data_attr : function (str) {
      if (this.namespace.length > 0) {
        return this.namespace + '-' + str;
      }

      return str;
    },

    off : function () {},

    reflow : function () {}
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.tooltip = {
    name : 'tooltip',

    version : '5.5.1',

    settings : {
      additional_inheritable_classes : [],
      tooltip_class : '.tooltip',
      append_to : 'body',
      touch_close_text : 'Tap To Close',
      disable_for_touch : false,
      hover_delay : 200,
      show_on : 'all',
      tip_template : function (selector, content) {
        return '<span data-selector="' + selector + '" id="' + selector + '" class="'
          + Foundation.libs.tooltip.settings.tooltip_class.substring(1)
          + '" role="tooltip">' + content + '<span class="nub"></span></span>';
      }
    },

    cache : {},

    init : function (scope, method, options) {
      Foundation.inherit(this, 'random_str');
      this.bindings(method, options);
    },

    should_show : function (target, tip) {
      var settings = $.extend({}, this.settings, this.data_options(target));

      if (settings.show_on === 'all') {
        return true;
      } else if (this.small() && settings.show_on === 'small') {
        return true;
      } else if (this.medium() && settings.show_on === 'medium') {
        return true;
      } else if (this.large() && settings.show_on === 'large') {
        return true;
      }
      return false;
    },

    medium : function () {
      return matchMedia(Foundation.media_queries['medium']).matches;
    },

    large : function () {
      return matchMedia(Foundation.media_queries['large']).matches;
    },

    events : function (instance) {
      var self = this,
          S = self.S;

      self.create(this.S(instance));

      function _startShow(elt, $this, immediate) {
        if (elt.timer) {
          return;
        }

        if (immediate) {
          elt.timer = null;
          self.showTip($this);
        } else {
          elt.timer = setTimeout(function () {
            elt.timer = null;
            self.showTip($this);
          }.bind(elt), self.settings.hover_delay);
        }
      }

      function _startHide(elt, $this) {
        if (elt.timer) {
          clearTimeout(elt.timer);
          elt.timer = null;
        }

        self.hide($this);
      }

      $(this.scope)
        .off('.tooltip')
        .on('mouseenter.fndtn.tooltip mouseleave.fndtn.tooltip touchstart.fndtn.tooltip MSPointerDown.fndtn.tooltip',
          '[' + this.attr_name() + ']', function (e) {
          var $this = S(this),
              settings = $.extend({}, self.settings, self.data_options($this)),
              is_touch = false;

          if (Modernizr.touch && /touchstart|MSPointerDown/i.test(e.type) && S(e.target).is('a')) {
            return false;
          }

          if (/mouse/i.test(e.type) && self.ie_touch(e)) {
            return false;
          }
          
          if ($this.hasClass('open')) {
            if (Modernizr.touch && /touchstart|MSPointerDown/i.test(e.type)) {
              e.preventDefault();
            }
            self.hide($this);
          } else {
            if (settings.disable_for_touch && Modernizr.touch && /touchstart|MSPointerDown/i.test(e.type)) {
              return;
            } else if (!settings.disable_for_touch && Modernizr.touch && /touchstart|MSPointerDown/i.test(e.type)) {
              e.preventDefault();
              S(settings.tooltip_class + '.open').hide();
              is_touch = true;
              // close other open tooltips on touch
              if ($('.open[' + self.attr_name() + ']').length > 0) {
               var prevOpen = S($('.open[' + self.attr_name() + ']')[0]);
               self.hide(prevOpen);
              }
            }

            if (/enter|over/i.test(e.type)) {
              _startShow(this, $this);

            } else if (e.type === 'mouseout' || e.type === 'mouseleave') {
              _startHide(this, $this);
            } else {
              _startShow(this, $this, true);
            }
          }
        })
        .on('mouseleave.fndtn.tooltip touchstart.fndtn.tooltip MSPointerDown.fndtn.tooltip', '[' + this.attr_name() + '].open', function (e) {
          if (/mouse/i.test(e.type) && self.ie_touch(e)) {
            return false;
          }

          if ($(this).data('tooltip-open-event-type') == 'touch' && e.type == 'mouseleave') {
            return;
          } else if ($(this).data('tooltip-open-event-type') == 'mouse' && /MSPointerDown|touchstart/i.test(e.type)) {
            self.convert_to_touch($(this));
          } else {
            _startHide(this, $(this));
          }
        })
        .on('DOMNodeRemoved DOMAttrModified', '[' + this.attr_name() + ']:not(a)', function (e) {
          _startHide(this, S(this));
        });
    },

    ie_touch : function (e) {
      // How do I distinguish between IE11 and Windows Phone 8?????
      return false;
    },

    showTip : function ($target) {
      var $tip = this.getTip($target);
      if (this.should_show($target, $tip)) {
        return this.show($target);
      }
      return;
    },

    getTip : function ($target) {
      var selector = this.selector($target),
          settings = $.extend({}, this.settings, this.data_options($target)),
          tip = null;

      if (selector) {
        tip = this.S('span[data-selector="' + selector + '"]' + settings.tooltip_class);
      }

      return (typeof tip === 'object') ? tip : false;
    },

    selector : function ($target) {
      var dataSelector = $target.attr(this.attr_name()) || $target.attr('data-selector');

      if (typeof dataSelector != 'string') {
        dataSelector = this.random_str(6);
        $target
          .attr('data-selector', dataSelector)
          .attr('aria-describedby', dataSelector);
      }

      return dataSelector;
    },

    create : function ($target) {
      var self = this,
          settings = $.extend({}, this.settings, this.data_options($target)),
          tip_template = this.settings.tip_template;

      if (typeof settings.tip_template === 'string' && window.hasOwnProperty(settings.tip_template)) {
        tip_template = window[settings.tip_template];
      }

      var $tip = $(tip_template(this.selector($target), $('<div></div>').html($target.attr('title')).html())),
          classes = this.inheritable_classes($target);

      $tip.addClass(classes).appendTo(settings.append_to);

      if (Modernizr.touch) {
        $tip.append('<span class="tap-to-close">' + settings.touch_close_text + '</span>');
        $tip.on('touchstart.fndtn.tooltip MSPointerDown.fndtn.tooltip', function (e) {
          self.hide($target);
        });
      }

      $target.removeAttr('title').attr('title', '');
    },

    reposition : function (target, tip, classes) {
      var width, nub, nubHeight, nubWidth, column, objPos;

      tip.css('visibility', 'hidden').show();

      width = target.data('width');
      nub = tip.children('.nub');
      nubHeight = nub.outerHeight();
      nubWidth = nub.outerHeight();

      if (this.small()) {
        tip.css({'width' : '100%'});
      } else {
        tip.css({'width' : (width) ? width : 'auto'});
      }

      objPos = function (obj, top, right, bottom, left, width) {
        return obj.css({
          'top' : (top) ? top : 'auto',
          'bottom' : (bottom) ? bottom : 'auto',
          'left' : (left) ? left : 'auto',
          'right' : (right) ? right : 'auto'
        }).end();
      };

      objPos(tip, (target.offset().top + target.outerHeight() + 10), 'auto', 'auto', target.offset().left);

      if (this.small()) {
        objPos(tip, (target.offset().top + target.outerHeight() + 10), 'auto', 'auto', 12.5, $(this.scope).width());
        tip.addClass('tip-override');
        objPos(nub, -nubHeight, 'auto', 'auto', target.offset().left);
      } else {
        var left = target.offset().left;
        if (Foundation.rtl) {
          nub.addClass('rtl');
          left = target.offset().left + target.outerWidth() - tip.outerWidth();
        }
        objPos(tip, (target.offset().top + target.outerHeight() + 10), 'auto', 'auto', left);
        tip.removeClass('tip-override');
        if (classes && classes.indexOf('tip-top') > -1) {
          if (Foundation.rtl) {
            nub.addClass('rtl');
          }
          objPos(tip, (target.offset().top - tip.outerHeight()), 'auto', 'auto', left)
            .removeClass('tip-override');
        } else if (classes && classes.indexOf('tip-left') > -1) {
          objPos(tip, (target.offset().top + (target.outerHeight() / 2) - (tip.outerHeight() / 2)), 'auto', 'auto', (target.offset().left - tip.outerWidth() - nubHeight))
            .removeClass('tip-override');
          nub.removeClass('rtl');
        } else if (classes && classes.indexOf('tip-right') > -1) {
          objPos(tip, (target.offset().top + (target.outerHeight() / 2) - (tip.outerHeight() / 2)), 'auto', 'auto', (target.offset().left + target.outerWidth() + nubHeight))
            .removeClass('tip-override');
          nub.removeClass('rtl');
        }
      }

      tip.css('visibility', 'visible').hide();
    },

    small : function () {
      return matchMedia(Foundation.media_queries.small).matches &&
        !matchMedia(Foundation.media_queries.medium).matches;
    },

    inheritable_classes : function ($target) {
      var settings = $.extend({}, this.settings, this.data_options($target)),
          inheritables = ['tip-top', 'tip-left', 'tip-bottom', 'tip-right', 'radius', 'round'].concat(settings.additional_inheritable_classes),
          classes = $target.attr('class'),
          filtered = classes ? $.map(classes.split(' '), function (el, i) {
            if ($.inArray(el, inheritables) !== -1) {
              return el;
            }
          }).join(' ') : '';

      return $.trim(filtered);
    },

    convert_to_touch : function ($target) {
      var self = this,
          $tip = self.getTip($target),
          settings = $.extend({}, self.settings, self.data_options($target));

      if ($tip.find('.tap-to-close').length === 0) {
        $tip.append('<span class="tap-to-close">' + settings.touch_close_text + '</span>');
        $tip.on('click.fndtn.tooltip.tapclose touchstart.fndtn.tooltip.tapclose MSPointerDown.fndtn.tooltip.tapclose', function (e) {
          self.hide($target);
        });
      }

      $target.data('tooltip-open-event-type', 'touch');
    },

    show : function ($target) {
      var $tip = this.getTip($target);

      if ($target.data('tooltip-open-event-type') == 'touch') {
        this.convert_to_touch($target);
      }

      this.reposition($target, $tip, $target.attr('class'));
      $target.addClass('open');
      $tip.fadeIn(150);
    },

    hide : function ($target) {
      var $tip = this.getTip($target);
      $tip.fadeOut(150, function () {
        $tip.find('.tap-to-close').remove();
        $tip.off('click.fndtn.tooltip.tapclose MSPointerDown.fndtn.tapclose');
        $target.removeClass('open');
      });
    },

    off : function () {
      var self = this;
      this.S(this.scope).off('.fndtn.tooltip');
      this.S(this.settings.tooltip_class).each(function (i) {
        $('[' + self.attr_name() + ']').eq(i).attr('title', $(this).text());
      }).remove();
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.topbar = {
    name : 'topbar',

    version : '5.5.1',

    settings : {
      index : 0,
      start_offset : 0,
      sticky_class : 'sticky',
      custom_back_text : true,
      back_text : 'Back',
      mobile_show_parent_link : true,
      is_hover : true,
      scrolltop : true, // jump to top when sticky nav menu toggle is clicked
      sticky_on : 'all',
      dropdown_autoclose: true
    },

    init : function (section, method, options) {
      Foundation.inherit(this, 'add_custom_rule register_media throttle');
      var self = this;

      self.register_media('topbar', 'foundation-mq-topbar');

      this.bindings(method, options);

      self.S('[' + this.attr_name() + ']', this.scope).each(function () {
        var topbar = $(this),
            settings = topbar.data(self.attr_name(true) + '-init'),
            section = self.S('section, .top-bar-section', this);
        topbar.data('index', 0);
        var topbarContainer = topbar.parent();
        if (topbarContainer.hasClass('fixed') || self.is_sticky(topbar, topbarContainer, settings) ) {
          self.settings.sticky_class = settings.sticky_class;
          self.settings.sticky_topbar = topbar;
          topbar.data('height', topbarContainer.outerHeight());
          topbar.data('stickyoffset', topbarContainer.offset().top);
        } else {
          topbar.data('height', topbar.outerHeight());
        }

        if (!settings.assembled) {
          self.assemble(topbar);
        }

        if (settings.is_hover) {
          self.S('.has-dropdown', topbar).addClass('not-click');
        } else {
          self.S('.has-dropdown', topbar).removeClass('not-click');
        }

        // Pad body when sticky (scrolled) or fixed.
        self.add_custom_rule('.f-topbar-fixed { padding-top: ' + topbar.data('height') + 'px }');

        if (topbarContainer.hasClass('fixed')) {
          self.S('body').addClass('f-topbar-fixed');
        }
      });

    },

    is_sticky : function (topbar, topbarContainer, settings) {
      var sticky     = topbarContainer.hasClass(settings.sticky_class);
      var smallMatch = matchMedia(Foundation.media_queries.small).matches;
      var medMatch   = matchMedia(Foundation.media_queries.medium).matches;
      var lrgMatch   = matchMedia(Foundation.media_queries.large).matches;

      if (sticky && settings.sticky_on === 'all') {
        return true;
      }
      if (sticky && this.small() && settings.sticky_on.indexOf('small') !== -1) {
        if (smallMatch && !medMatch && !lrgMatch) { return true; }
      }
      if (sticky && this.medium() && settings.sticky_on.indexOf('medium') !== -1) {
        if (smallMatch && medMatch && !lrgMatch) { return true; }
      }
      if (sticky && this.large() && settings.sticky_on.indexOf('large') !== -1) {
        if (smallMatch && medMatch && lrgMatch) { return true; }
      }

       return false;
    },

    toggle : function (toggleEl) {
      var self = this,
          topbar;

      if (toggleEl) {
        topbar = self.S(toggleEl).closest('[' + this.attr_name() + ']');
      } else {
        topbar = self.S('[' + this.attr_name() + ']');
      }

      var settings = topbar.data(this.attr_name(true) + '-init');

      var section = self.S('section, .top-bar-section', topbar);

      if (self.breakpoint()) {
        if (!self.rtl) {
          section.css({left : '0%'});
          $('>.name', section).css({left : '100%'});
        } else {
          section.css({right : '0%'});
          $('>.name', section).css({right : '100%'});
        }

        self.S('li.moved', section).removeClass('moved');
        topbar.data('index', 0);

        topbar
          .toggleClass('expanded')
          .css('height', '');
      }

      if (settings.scrolltop) {
        if (!topbar.hasClass('expanded')) {
          if (topbar.hasClass('fixed')) {
            topbar.parent().addClass('fixed');
            topbar.removeClass('fixed');
            self.S('body').addClass('f-topbar-fixed');
          }
        } else if (topbar.parent().hasClass('fixed')) {
          if (settings.scrolltop) {
            topbar.parent().removeClass('fixed');
            topbar.addClass('fixed');
            self.S('body').removeClass('f-topbar-fixed');

            window.scrollTo(0, 0);
          } else {
            topbar.parent().removeClass('expanded');
          }
        }
      } else {
        if (self.is_sticky(topbar, topbar.parent(), settings)) {
          topbar.parent().addClass('fixed');
        }

        if (topbar.parent().hasClass('fixed')) {
          if (!topbar.hasClass('expanded')) {
            topbar.removeClass('fixed');
            topbar.parent().removeClass('expanded');
            self.update_sticky_positioning();
          } else {
            topbar.addClass('fixed');
            topbar.parent().addClass('expanded');
            self.S('body').addClass('f-topbar-fixed');
          }
        }
      }
    },

    timer : null,

    events : function (bar) {
      var self = this,
          S = this.S;

      S(this.scope)
        .off('.topbar')
        .on('click.fndtn.topbar', '[' + this.attr_name() + '] .toggle-topbar', function (e) {
          e.preventDefault();
          self.toggle(this);
        })
        .on('click.fndtn.topbar contextmenu.fndtn.topbar', '.top-bar .top-bar-section li a[href^="#"],[' + this.attr_name() + '] .top-bar-section li a[href^="#"]', function (e) {
            var li = $(this).closest('li'),
                topbar = li.closest('[' + self.attr_name() + ']'),
                settings = topbar.data(self.attr_name(true) + '-init');

            if (settings.dropdown_autoclose && settings.is_hover) {
              var hoverLi = $(this).closest('.hover');
              hoverLi.removeClass('hover');
            }
            if (self.breakpoint() && !li.hasClass('back') && !li.hasClass('has-dropdown')) {
              self.toggle();
            }

        })
        .on('click.fndtn.topbar', '[' + this.attr_name() + '] li.has-dropdown', function (e) {
          var li = S(this),
              target = S(e.target),
              topbar = li.closest('[' + self.attr_name() + ']'),
              settings = topbar.data(self.attr_name(true) + '-init');

          if (target.data('revealId')) {
            self.toggle();
            return;
          }

          if (self.breakpoint()) {
            return;
          }

          if (settings.is_hover && !Modernizr.touch) {
            return;
          }

          e.stopImmediatePropagation();

          if (li.hasClass('hover')) {
            li
              .removeClass('hover')
              .find('li')
              .removeClass('hover');

            li.parents('li.hover')
              .removeClass('hover');
          } else {
            li.addClass('hover');

            $(li).siblings().removeClass('hover');

            if (target[0].nodeName === 'A' && target.parent().hasClass('has-dropdown')) {
              e.preventDefault();
            }
          }
        })
        .on('click.fndtn.topbar', '[' + this.attr_name() + '] .has-dropdown>a', function (e) {
          if (self.breakpoint()) {

            e.preventDefault();

            var $this = S(this),
                topbar = $this.closest('[' + self.attr_name() + ']'),
                section = topbar.find('section, .top-bar-section'),
                dropdownHeight = $this.next('.dropdown').outerHeight(),
                $selectedLi = $this.closest('li');

            topbar.data('index', topbar.data('index') + 1);
            $selectedLi.addClass('moved');

            if (!self.rtl) {
              section.css({left : -(100 * topbar.data('index')) + '%'});
              section.find('>.name').css({left : 100 * topbar.data('index') + '%'});
            } else {
              section.css({right : -(100 * topbar.data('index')) + '%'});
              section.find('>.name').css({right : 100 * topbar.data('index') + '%'});
            }

            topbar.css('height', $this.siblings('ul').outerHeight(true) + topbar.data('height'));
          }
        });

      S(window).off('.topbar').on('resize.fndtn.topbar', self.throttle(function () {
          self.resize.call(self);
      }, 50)).trigger('resize.fndtn.topbar').load(function () {
          // Ensure that the offset is calculated after all of the pages resources have loaded
          S(this).trigger('resize.fndtn.topbar');
      });

      S('body').off('.topbar').on('click.fndtn.topbar', function (e) {
        var parent = S(e.target).closest('li').closest('li.hover');

        if (parent.length > 0) {
          return;
        }

        S('[' + self.attr_name() + '] li.hover').removeClass('hover');
      });

      // Go up a level on Click
      S(this.scope).on('click.fndtn.topbar', '[' + this.attr_name() + '] .has-dropdown .back', function (e) {
        e.preventDefault();

        var $this = S(this),
            topbar = $this.closest('[' + self.attr_name() + ']'),
            section = topbar.find('section, .top-bar-section'),
            settings = topbar.data(self.attr_name(true) + '-init'),
            $movedLi = $this.closest('li.moved'),
            $previousLevelUl = $movedLi.parent();

        topbar.data('index', topbar.data('index') - 1);

        if (!self.rtl) {
          section.css({left : -(100 * topbar.data('index')) + '%'});
          section.find('>.name').css({left : 100 * topbar.data('index') + '%'});
        } else {
          section.css({right : -(100 * topbar.data('index')) + '%'});
          section.find('>.name').css({right : 100 * topbar.data('index') + '%'});
        }

        if (topbar.data('index') === 0) {
          topbar.css('height', '');
        } else {
          topbar.css('height', $previousLevelUl.outerHeight(true) + topbar.data('height'));
        }

        setTimeout(function () {
          $movedLi.removeClass('moved');
        }, 300);
      });

      // Show dropdown menus when their items are focused
      S(this.scope).find('.dropdown a')
        .focus(function () {
          $(this).parents('.has-dropdown').addClass('hover');
        })
        .blur(function () {
          $(this).parents('.has-dropdown').removeClass('hover');
        });
    },

    resize : function () {
      var self = this;
      self.S('[' + this.attr_name() + ']').each(function () {
        var topbar = self.S(this),
            settings = topbar.data(self.attr_name(true) + '-init');

        var stickyContainer = topbar.parent('.' + self.settings.sticky_class);
        var stickyOffset;

        if (!self.breakpoint()) {
          var doToggle = topbar.hasClass('expanded');
          topbar
            .css('height', '')
            .removeClass('expanded')
            .find('li')
            .removeClass('hover');

            if (doToggle) {
              self.toggle(topbar);
            }
        }

        if (self.is_sticky(topbar, stickyContainer, settings)) {
          if (stickyContainer.hasClass('fixed')) {
            // Remove the fixed to allow for correct calculation of the offset.
            stickyContainer.removeClass('fixed');

            stickyOffset = stickyContainer.offset().top;
            if (self.S(document.body).hasClass('f-topbar-fixed')) {
              stickyOffset -= topbar.data('height');
            }

            topbar.data('stickyoffset', stickyOffset);
            stickyContainer.addClass('fixed');
          } else {
            stickyOffset = stickyContainer.offset().top;
            topbar.data('stickyoffset', stickyOffset);
          }
        }

      });
    },

    breakpoint : function () {
      return !matchMedia(Foundation.media_queries['topbar']).matches;
    },

    small : function () {
      return matchMedia(Foundation.media_queries['small']).matches;
    },

    medium : function () {
      return matchMedia(Foundation.media_queries['medium']).matches;
    },

    large : function () {
      return matchMedia(Foundation.media_queries['large']).matches;
    },

    assemble : function (topbar) {
      var self = this,
          settings = topbar.data(this.attr_name(true) + '-init'),
          section = self.S('section, .top-bar-section', topbar);

      // Pull element out of the DOM for manipulation
      section.detach();

      self.S('.has-dropdown>a', section).each(function () {
        var $link = self.S(this),
            $dropdown = $link.siblings('.dropdown'),
            url = $link.attr('href'),
            $titleLi;

        if (!$dropdown.find('.title.back').length) {

          if (settings.mobile_show_parent_link == true && url) {
            $titleLi = $('<li class="title back js-generated"><h5><a href="javascript:void(0)"></a></h5></li><li class="parent-link hide-for-large-up"><a class="parent-link js-generated" href="' + url + '">' + $link.html() +'</a></li>');
          } else {
            $titleLi = $('<li class="title back js-generated"><h5><a href="javascript:void(0)"></a></h5>');
          }

          // Copy link to subnav
          if (settings.custom_back_text == true) {
            $('h5>a', $titleLi).html(settings.back_text);
          } else {
            $('h5>a', $titleLi).html('&laquo; ' + $link.html());
          }
          $dropdown.prepend($titleLi);
        }
      });

      // Put element back in the DOM
      section.appendTo(topbar);

      // check for sticky
      this.sticky();

      this.assembled(topbar);
    },

    assembled : function (topbar) {
      topbar.data(this.attr_name(true), $.extend({}, topbar.data(this.attr_name(true)), {assembled : true}));
    },

    height : function (ul) {
      var total = 0,
          self = this;

      $('> li', ul).each(function () {
        total += self.S(this).outerHeight(true);
      });

      return total;
    },

    sticky : function () {
      var self = this;

      this.S(window).on('scroll', function () {
        self.update_sticky_positioning();
      });
    },

    update_sticky_positioning : function () {
      var klass = '.' + this.settings.sticky_class,
          $window = this.S(window),
          self = this;

      if (self.settings.sticky_topbar && self.is_sticky(this.settings.sticky_topbar,this.settings.sticky_topbar.parent(), this.settings)) {
        var distance = this.settings.sticky_topbar.data('stickyoffset') + this.settings.start_offset;
        if (!self.S(klass).hasClass('expanded')) {
          if ($window.scrollTop() > (distance)) {
            if (!self.S(klass).hasClass('fixed')) {
              self.S(klass).addClass('fixed');
              self.S('body').addClass('f-topbar-fixed');
            }
          } else if ($window.scrollTop() <= distance) {
            if (self.S(klass).hasClass('fixed')) {
              self.S(klass).removeClass('fixed');
              self.S('body').removeClass('f-topbar-fixed');
            }
          }
        }
      }
    },

    off : function () {
      this.S(this.scope).off('.fndtn.topbar');
      this.S(window).off('.fndtn.topbar');
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvdW5kYXRpb24uanMiLCJmb3VuZGF0aW9uLmFiaWRlLmpzIiwiZm91bmRhdGlvbi5hY2NvcmRpb24uanMiLCJmb3VuZGF0aW9uLmFsZXJ0LmpzIiwiZm91bmRhdGlvbi5jbGVhcmluZy5qcyIsImZvdW5kYXRpb24uZHJvcGRvd24uanMiLCJmb3VuZGF0aW9uLmVxdWFsaXplci5qcyIsImZvdW5kYXRpb24uaW50ZXJjaGFuZ2UuanMiLCJmb3VuZGF0aW9uLmpveXJpZGUuanMiLCJmb3VuZGF0aW9uLm1hZ2VsbGFuLmpzIiwiZm91bmRhdGlvbi5vZmZjYW52YXMuanMiLCJmb3VuZGF0aW9uLm9yYml0LmpzIiwiZm91bmRhdGlvbi5yZXZlYWwuanMiLCJmb3VuZGF0aW9uLnNsaWRlci5qcyIsImZvdW5kYXRpb24udGFiLmpzIiwiZm91bmRhdGlvbi50b29sdGlwLmpzIiwiZm91bmRhdGlvbi50b3BiYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25aQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN2lCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwNkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImZvdW5kYXRpb24tYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIEZvdW5kYXRpb24gUmVzcG9uc2l2ZSBMaWJyYXJ5XG4gKiBodHRwOi8vZm91bmRhdGlvbi56dXJiLmNvbVxuICogQ29weXJpZ2h0IDIwMTQsIFpVUkJcbiAqIEZyZWUgdG8gdXNlIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4qL1xuXG4oZnVuY3Rpb24gKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIGhlYWRlcl9oZWxwZXJzID0gZnVuY3Rpb24gKGNsYXNzX2FycmF5KSB7XG4gICAgdmFyIGkgPSBjbGFzc19hcnJheS5sZW5ndGg7XG4gICAgdmFyIGhlYWQgPSAkKCdoZWFkJyk7XG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBpZiAoaGVhZC5oYXMoJy4nICsgY2xhc3NfYXJyYXlbaV0pLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBoZWFkLmFwcGVuZCgnPG1ldGEgY2xhc3M9XCInICsgY2xhc3NfYXJyYXlbaV0gKyAnXCIgLz4nKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgaGVhZGVyX2hlbHBlcnMoW1xuICAgICdmb3VuZGF0aW9uLW1xLXNtYWxsJyxcbiAgICAnZm91bmRhdGlvbi1tcS1zbWFsbC1vbmx5JyxcbiAgICAnZm91bmRhdGlvbi1tcS1tZWRpdW0nLFxuICAgICdmb3VuZGF0aW9uLW1xLW1lZGl1bS1vbmx5JyxcbiAgICAnZm91bmRhdGlvbi1tcS1sYXJnZScsXG4gICAgJ2ZvdW5kYXRpb24tbXEtbGFyZ2Utb25seScsXG4gICAgJ2ZvdW5kYXRpb24tbXEteGxhcmdlJyxcbiAgICAnZm91bmRhdGlvbi1tcS14bGFyZ2Utb25seScsXG4gICAgJ2ZvdW5kYXRpb24tbXEteHhsYXJnZScsXG4gICAgJ2ZvdW5kYXRpb24tZGF0YS1hdHRyaWJ1dGUtbmFtZXNwYWNlJ10pO1xuXG4gIC8vIEVuYWJsZSBGYXN0Q2xpY2sgaWYgcHJlc2VudFxuXG4gICQoZnVuY3Rpb24gKCkge1xuICAgIGlmICh0eXBlb2YgRmFzdENsaWNrICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gRG9uJ3QgYXR0YWNoIHRvIGJvZHkgaWYgdW5kZWZpbmVkXG4gICAgICBpZiAodHlwZW9mIGRvY3VtZW50LmJvZHkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIEZhc3RDbGljay5hdHRhY2goZG9jdW1lbnQuYm9keSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAvLyBwcml2YXRlIEZhc3QgU2VsZWN0b3Igd3JhcHBlcixcbiAgLy8gcmV0dXJucyBqUXVlcnkgb2JqZWN0LiBPbmx5IHVzZSB3aGVyZVxuICAvLyBnZXRFbGVtZW50QnlJZCBpcyBub3QgYXZhaWxhYmxlLlxuICB2YXIgUyA9IGZ1bmN0aW9uIChzZWxlY3RvciwgY29udGV4dCkge1xuICAgIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICB2YXIgY29udDtcbiAgICAgICAgaWYgKGNvbnRleHQuanF1ZXJ5KSB7XG4gICAgICAgICAgY29udCA9IGNvbnRleHRbMF07XG4gICAgICAgICAgaWYgKCFjb250KSB7XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29udCA9IGNvbnRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICQoY29udC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAkKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gJChzZWxlY3RvciwgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gTmFtZXNwYWNlIGZ1bmN0aW9ucy5cblxuICB2YXIgYXR0cl9uYW1lID0gZnVuY3Rpb24gKGluaXQpIHtcbiAgICB2YXIgYXJyID0gW107XG4gICAgaWYgKCFpbml0KSB7XG4gICAgICBhcnIucHVzaCgnZGF0YScpO1xuICAgIH1cbiAgICBpZiAodGhpcy5uYW1lc3BhY2UubGVuZ3RoID4gMCkge1xuICAgICAgYXJyLnB1c2godGhpcy5uYW1lc3BhY2UpO1xuICAgIH1cbiAgICBhcnIucHVzaCh0aGlzLm5hbWUpO1xuXG4gICAgcmV0dXJuIGFyci5qb2luKCctJyk7XG4gIH07XG5cbiAgdmFyIGFkZF9uYW1lc3BhY2UgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KCctJyksXG4gICAgICAgIGkgPSBwYXJ0cy5sZW5ndGgsXG4gICAgICAgIGFyciA9IFtdO1xuXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgaWYgKGkgIT09IDApIHtcbiAgICAgICAgYXJyLnB1c2gocGFydHNbaV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMubmFtZXNwYWNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBhcnIucHVzaCh0aGlzLm5hbWVzcGFjZSwgcGFydHNbaV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFyci5wdXNoKHBhcnRzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBhcnIucmV2ZXJzZSgpLmpvaW4oJy0nKTtcbiAgfTtcblxuICAvLyBFdmVudCBiaW5kaW5nIGFuZCBkYXRhLW9wdGlvbnMgdXBkYXRpbmcuXG5cbiAgdmFyIGJpbmRpbmdzID0gZnVuY3Rpb24gKG1ldGhvZCwgb3B0aW9ucykge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgYmluZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgdmFyICR0aGlzID0gUyh0aGlzKSxcbiAgICAgICAgICAgICAgc2hvdWxkX2JpbmRfZXZlbnRzID0gISR0aGlzLmRhdGEoc2VsZi5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKTtcbiAgICAgICAgICAkdGhpcy5kYXRhKHNlbGYuYXR0cl9uYW1lKHRydWUpICsgJy1pbml0JywgJC5leHRlbmQoe30sIHNlbGYuc2V0dGluZ3MsIChvcHRpb25zIHx8IG1ldGhvZCksIHNlbGYuZGF0YV9vcHRpb25zKCR0aGlzKSkpO1xuXG4gICAgICAgICAgaWYgKHNob3VsZF9iaW5kX2V2ZW50cykge1xuICAgICAgICAgICAgc2VsZi5ldmVudHModGhpcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgaWYgKFModGhpcy5zY29wZSkuaXMoJ1snICsgdGhpcy5hdHRyX25hbWUoKSArJ10nKSkge1xuICAgICAgYmluZC5jYWxsKHRoaXMuc2NvcGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBTKCdbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyddJywgdGhpcy5zY29wZSkuZWFjaChiaW5kKTtcbiAgICB9XG4gICAgLy8gIyBQYXRjaCB0byBmaXggIzUwNDMgdG8gbW92ZSB0aGlzICphZnRlciogdGhlIGlmL2Vsc2UgY2xhdXNlIGluIG9yZGVyIGZvciBCYWNrYm9uZSBhbmQgc2ltaWxhciBmcmFtZXdvcmtzIHRvIGhhdmUgaW1wcm92ZWQgY29udHJvbCBvdmVyIGV2ZW50IGJpbmRpbmcgYW5kIGRhdGEtb3B0aW9ucyB1cGRhdGluZy5cbiAgICBpZiAodHlwZW9mIG1ldGhvZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB0aGlzW21ldGhvZF0uY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgfTtcblxuICB2YXIgc2luZ2xlX2ltYWdlX2xvYWRlZCA9IGZ1bmN0aW9uIChpbWFnZSwgY2FsbGJhY2spIHtcbiAgICBmdW5jdGlvbiBsb2FkZWQgKCkge1xuICAgICAgY2FsbGJhY2soaW1hZ2VbMF0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJpbmRMb2FkICgpIHtcbiAgICAgIHRoaXMub25lKCdsb2FkJywgbG9hZGVkKTtcblxuICAgICAgaWYgKC9NU0lFIChcXGQrXFwuXFxkKyk7Ly50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSB7XG4gICAgICAgIHZhciBzcmMgPSB0aGlzLmF0dHIoICdzcmMnICksXG4gICAgICAgICAgICBwYXJhbSA9IHNyYy5tYXRjaCggL1xcPy8gKSA/ICcmJyA6ICc/JztcblxuICAgICAgICBwYXJhbSArPSAncmFuZG9tPScgKyAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xuICAgICAgICB0aGlzLmF0dHIoJ3NyYycsIHNyYyArIHBhcmFtKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWltYWdlLmF0dHIoJ3NyYycpKSB7XG4gICAgICBsb2FkZWQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoaW1hZ2VbMF0uY29tcGxldGUgfHwgaW1hZ2VbMF0ucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgbG9hZGVkKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJpbmRMb2FkLmNhbGwoaW1hZ2UpO1xuICAgIH1cbiAgfTtcblxuICAvKlxuICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9wYXVsaXJpc2gvbWF0Y2hNZWRpYS5qc1xuICAqL1xuXG4gIHdpbmRvdy5tYXRjaE1lZGlhID0gd2luZG93Lm1hdGNoTWVkaWEgfHwgKGZ1bmN0aW9uICggZG9jICkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGJvb2wsXG4gICAgICAgIGRvY0VsZW0gPSBkb2MuZG9jdW1lbnRFbGVtZW50LFxuICAgICAgICByZWZOb2RlID0gZG9jRWxlbS5maXJzdEVsZW1lbnRDaGlsZCB8fCBkb2NFbGVtLmZpcnN0Q2hpbGQsXG4gICAgICAgIC8vIGZha2VCb2R5IHJlcXVpcmVkIGZvciA8RkY0IHdoZW4gZXhlY3V0ZWQgaW4gPGhlYWQ+XG4gICAgICAgIGZha2VCb2R5ID0gZG9jLmNyZWF0ZUVsZW1lbnQoICdib2R5JyApLFxuICAgICAgICBkaXYgPSBkb2MuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblxuICAgIGRpdi5pZCA9ICdtcS10ZXN0LTEnO1xuICAgIGRpdi5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmFic29sdXRlO3RvcDotMTAwZW0nO1xuICAgIGZha2VCb2R5LnN0eWxlLmJhY2tncm91bmQgPSAnbm9uZSc7XG4gICAgZmFrZUJvZHkuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICAgIHJldHVybiBmdW5jdGlvbiAocSkge1xuXG4gICAgICBkaXYuaW5uZXJIVE1MID0gJyZzaHk7PHN0eWxlIG1lZGlhPVwiJyArIHEgKyAnXCI+ICNtcS10ZXN0LTEgeyB3aWR0aDogNDJweDsgfTwvc3R5bGU+JztcblxuICAgICAgZG9jRWxlbS5pbnNlcnRCZWZvcmUoIGZha2VCb2R5LCByZWZOb2RlICk7XG4gICAgICBib29sID0gZGl2Lm9mZnNldFdpZHRoID09PSA0MjtcbiAgICAgIGRvY0VsZW0ucmVtb3ZlQ2hpbGQoIGZha2VCb2R5ICk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1hdGNoZXMgOiBib29sLFxuICAgICAgICBtZWRpYSA6IHFcbiAgICAgIH07XG5cbiAgICB9O1xuXG4gIH0oIGRvY3VtZW50ICkpO1xuXG4gIC8qXG4gICAqIGpxdWVyeS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL2duYXJmMzcvanF1ZXJ5LXJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgKiBSZXF1aXJlcyBqUXVlcnkgMS44K1xuICAgKlxuICAgKiBDb3B5cmlnaHQgKGMpIDIwMTIgQ29yZXkgRnJhbmdcbiAgICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICAgKi9cblxuICAoZnVuY3Rpb24oalF1ZXJ5KSB7XG5cblxuICAvLyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgcG9seWZpbGwgYWRhcHRlZCBmcm9tIEVyaWsgTcO2bGxlclxuICAvLyBmaXhlcyBmcm9tIFBhdWwgSXJpc2ggYW5kIFRpbm8gWmlqZGVsXG4gIC8vIGh0dHA6Ly9wYXVsaXJpc2guY29tLzIwMTEvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1hbmltYXRpbmcvXG4gIC8vIGh0dHA6Ly9teS5vcGVyYS5jb20vZW1vbGxlci9ibG9nLzIwMTEvMTIvMjAvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1lci1hbmltYXRpbmdcblxuICB2YXIgYW5pbWF0aW5nLFxuICAgICAgbGFzdFRpbWUgPSAwLFxuICAgICAgdmVuZG9ycyA9IFsnd2Via2l0JywgJ21veiddLFxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSxcbiAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lLFxuICAgICAganF1ZXJ5RnhBdmFpbGFibGUgPSAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIGpRdWVyeS5meDtcblxuICBmb3IgKDsgbGFzdFRpbWUgPCB2ZW5kb3JzLmxlbmd0aCAmJiAhcmVxdWVzdEFuaW1hdGlvbkZyYW1lOyBsYXN0VGltZSsrKSB7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93WyB2ZW5kb3JzW2xhc3RUaW1lXSArICdSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnIF07XG4gICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjYW5jZWxBbmltYXRpb25GcmFtZSB8fFxuICAgICAgd2luZG93WyB2ZW5kb3JzW2xhc3RUaW1lXSArICdDYW5jZWxBbmltYXRpb25GcmFtZScgXSB8fFxuICAgICAgd2luZG93WyB2ZW5kb3JzW2xhc3RUaW1lXSArICdDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnIF07XG4gIH1cblxuICBmdW5jdGlvbiByYWYoKSB7XG4gICAgaWYgKGFuaW1hdGluZykge1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJhZik7XG5cbiAgICAgIGlmIChqcXVlcnlGeEF2YWlsYWJsZSkge1xuICAgICAgICBqUXVlcnkuZngudGljaygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChyZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAvLyB1c2UgckFGXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjYW5jZWxBbmltYXRpb25GcmFtZTtcblxuICAgIGlmIChqcXVlcnlGeEF2YWlsYWJsZSkge1xuICAgICAgalF1ZXJ5LmZ4LnRpbWVyID0gZnVuY3Rpb24gKHRpbWVyKSB7XG4gICAgICAgIGlmICh0aW1lcigpICYmIGpRdWVyeS50aW1lcnMucHVzaCh0aW1lcikgJiYgIWFuaW1hdGluZykge1xuICAgICAgICAgIGFuaW1hdGluZyA9IHRydWU7XG4gICAgICAgICAgcmFmKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGpRdWVyeS5meC5zdG9wID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBhbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgIH07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIHBvbHlmaWxsXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgdmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCksXG4gICAgICAgIHRpbWVUb0NhbGwgPSBNYXRoLm1heCgwLCAxNiAtIChjdXJyVGltZSAtIGxhc3RUaW1lKSksXG4gICAgICAgIGlkID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNhbGxiYWNrKGN1cnJUaW1lICsgdGltZVRvQ2FsbCk7XG4gICAgICAgIH0sIHRpbWVUb0NhbGwpO1xuICAgICAgbGFzdFRpbWUgPSBjdXJyVGltZSArIHRpbWVUb0NhbGw7XG4gICAgICByZXR1cm4gaWQ7XG4gICAgfTtcblxuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KGlkKTtcbiAgICB9O1xuXG4gIH1cblxuICB9KCAkICkpO1xuXG4gIGZ1bmN0aW9uIHJlbW92ZVF1b3RlcyAoc3RyaW5nKSB7XG4gICAgaWYgKHR5cGVvZiBzdHJpbmcgPT09ICdzdHJpbmcnIHx8IHN0cmluZyBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoL15bJ1xcXFwvXCJdK3woO1xccz99KSt8WydcXFxcL1wiXSskL2csICcnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaW5nO1xuICB9XG5cbiAgd2luZG93LkZvdW5kYXRpb24gPSB7XG4gICAgbmFtZSA6ICdGb3VuZGF0aW9uJyxcblxuICAgIHZlcnNpb24gOiAnNS41LjEnLFxuXG4gICAgbWVkaWFfcXVlcmllcyA6IHtcbiAgICAgICdzbWFsbCcgICAgICAgOiBTKCcuZm91bmRhdGlvbi1tcS1zbWFsbCcpLmNzcygnZm9udC1mYW1pbHknKS5yZXBsYWNlKC9eW1xcL1xcXFwnXCJdK3woO1xccz99KSt8W1xcL1xcXFwnXCJdKyQvZywgJycpLFxuICAgICAgJ3NtYWxsLW9ubHknICA6IFMoJy5mb3VuZGF0aW9uLW1xLXNtYWxsLW9ubHknKS5jc3MoJ2ZvbnQtZmFtaWx5JykucmVwbGFjZSgvXltcXC9cXFxcJ1wiXSt8KDtcXHM/fSkrfFtcXC9cXFxcJ1wiXSskL2csICcnKSxcbiAgICAgICdtZWRpdW0nICAgICAgOiBTKCcuZm91bmRhdGlvbi1tcS1tZWRpdW0nKS5jc3MoJ2ZvbnQtZmFtaWx5JykucmVwbGFjZSgvXltcXC9cXFxcJ1wiXSt8KDtcXHM/fSkrfFtcXC9cXFxcJ1wiXSskL2csICcnKSxcbiAgICAgICdtZWRpdW0tb25seScgOiBTKCcuZm91bmRhdGlvbi1tcS1tZWRpdW0tb25seScpLmNzcygnZm9udC1mYW1pbHknKS5yZXBsYWNlKC9eW1xcL1xcXFwnXCJdK3woO1xccz99KSt8W1xcL1xcXFwnXCJdKyQvZywgJycpLFxuICAgICAgJ2xhcmdlJyAgICAgICA6IFMoJy5mb3VuZGF0aW9uLW1xLWxhcmdlJykuY3NzKCdmb250LWZhbWlseScpLnJlcGxhY2UoL15bXFwvXFxcXCdcIl0rfCg7XFxzP30pK3xbXFwvXFxcXCdcIl0rJC9nLCAnJyksXG4gICAgICAnbGFyZ2Utb25seScgIDogUygnLmZvdW5kYXRpb24tbXEtbGFyZ2Utb25seScpLmNzcygnZm9udC1mYW1pbHknKS5yZXBsYWNlKC9eW1xcL1xcXFwnXCJdK3woO1xccz99KSt8W1xcL1xcXFwnXCJdKyQvZywgJycpLFxuICAgICAgJ3hsYXJnZScgICAgICA6IFMoJy5mb3VuZGF0aW9uLW1xLXhsYXJnZScpLmNzcygnZm9udC1mYW1pbHknKS5yZXBsYWNlKC9eW1xcL1xcXFwnXCJdK3woO1xccz99KSt8W1xcL1xcXFwnXCJdKyQvZywgJycpLFxuICAgICAgJ3hsYXJnZS1vbmx5JyA6IFMoJy5mb3VuZGF0aW9uLW1xLXhsYXJnZS1vbmx5JykuY3NzKCdmb250LWZhbWlseScpLnJlcGxhY2UoL15bXFwvXFxcXCdcIl0rfCg7XFxzP30pK3xbXFwvXFxcXCdcIl0rJC9nLCAnJyksXG4gICAgICAneHhsYXJnZScgICAgIDogUygnLmZvdW5kYXRpb24tbXEteHhsYXJnZScpLmNzcygnZm9udC1mYW1pbHknKS5yZXBsYWNlKC9eW1xcL1xcXFwnXCJdK3woO1xccz99KSt8W1xcL1xcXFwnXCJdKyQvZywgJycpXG4gICAgfSxcblxuICAgIHN0eWxlc2hlZXQgOiAkKCc8c3R5bGU+PC9zdHlsZT4nKS5hcHBlbmRUbygnaGVhZCcpWzBdLnNoZWV0LFxuXG4gICAgZ2xvYmFsIDoge1xuICAgICAgbmFtZXNwYWNlIDogdW5kZWZpbmVkXG4gICAgfSxcblxuICAgIGluaXQgOiBmdW5jdGlvbiAoc2NvcGUsIGxpYnJhcmllcywgbWV0aG9kLCBvcHRpb25zLCByZXNwb25zZSkge1xuICAgICAgdmFyIGFyZ3MgPSBbc2NvcGUsIG1ldGhvZCwgb3B0aW9ucywgcmVzcG9uc2VdLFxuICAgICAgICAgIHJlc3BvbnNlcyA9IFtdO1xuXG4gICAgICAvLyBjaGVjayBSVExcbiAgICAgIHRoaXMucnRsID0gL3J0bC9pLnRlc3QoUygnaHRtbCcpLmF0dHIoJ2RpcicpKTtcblxuICAgICAgLy8gc2V0IGZvdW5kYXRpb24gZ2xvYmFsIHNjb3BlXG4gICAgICB0aGlzLnNjb3BlID0gc2NvcGUgfHwgdGhpcy5zY29wZTtcblxuICAgICAgdGhpcy5zZXRfbmFtZXNwYWNlKCk7XG5cbiAgICAgIGlmIChsaWJyYXJpZXMgJiYgdHlwZW9mIGxpYnJhcmllcyA9PT0gJ3N0cmluZycgJiYgIS9yZWZsb3cvaS50ZXN0KGxpYnJhcmllcykpIHtcbiAgICAgICAgaWYgKHRoaXMubGlicy5oYXNPd25Qcm9wZXJ0eShsaWJyYXJpZXMpKSB7XG4gICAgICAgICAgcmVzcG9uc2VzLnB1c2godGhpcy5pbml0X2xpYihsaWJyYXJpZXMsIGFyZ3MpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgbGliIGluIHRoaXMubGlicykge1xuICAgICAgICAgIHJlc3BvbnNlcy5wdXNoKHRoaXMuaW5pdF9saWIobGliLCBsaWJyYXJpZXMpKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBTKHdpbmRvdykubG9hZChmdW5jdGlvbiAoKSB7XG4gICAgICAgIFMod2luZG93KVxuICAgICAgICAgIC50cmlnZ2VyKCdyZXNpemUuZm5kdG4uY2xlYXJpbmcnKVxuICAgICAgICAgIC50cmlnZ2VyKCdyZXNpemUuZm5kdG4uZHJvcGRvd24nKVxuICAgICAgICAgIC50cmlnZ2VyKCdyZXNpemUuZm5kdG4uZXF1YWxpemVyJylcbiAgICAgICAgICAudHJpZ2dlcigncmVzaXplLmZuZHRuLmludGVyY2hhbmdlJylcbiAgICAgICAgICAudHJpZ2dlcigncmVzaXplLmZuZHRuLmpveXJpZGUnKVxuICAgICAgICAgIC50cmlnZ2VyKCdyZXNpemUuZm5kdG4ubWFnZWxsYW4nKVxuICAgICAgICAgIC50cmlnZ2VyKCdyZXNpemUuZm5kdG4udG9wYmFyJylcbiAgICAgICAgICAudHJpZ2dlcigncmVzaXplLmZuZHRuLnNsaWRlcicpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBzY29wZTtcbiAgICB9LFxuXG4gICAgaW5pdF9saWIgOiBmdW5jdGlvbiAobGliLCBhcmdzKSB7XG4gICAgICBpZiAodGhpcy5saWJzLmhhc093blByb3BlcnR5KGxpYikpIHtcbiAgICAgICAgdGhpcy5wYXRjaCh0aGlzLmxpYnNbbGliXSk7XG5cbiAgICAgICAgaWYgKGFyZ3MgJiYgYXJncy5oYXNPd25Qcm9wZXJ0eShsaWIpKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMubGlic1tsaWJdLnNldHRpbmdzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAkLmV4dGVuZCh0cnVlLCB0aGlzLmxpYnNbbGliXS5zZXR0aW5ncywgYXJnc1tsaWJdKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMubGlic1tsaWJdLmRlZmF1bHRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAkLmV4dGVuZCh0cnVlLCB0aGlzLmxpYnNbbGliXS5kZWZhdWx0cywgYXJnc1tsaWJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcy5saWJzW2xpYl0uaW5pdC5hcHBseSh0aGlzLmxpYnNbbGliXSwgW3RoaXMuc2NvcGUsIGFyZ3NbbGliXV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJncyA9IGFyZ3MgaW5zdGFuY2VvZiBBcnJheSA/IGFyZ3MgOiBuZXcgQXJyYXkoYXJncyk7XG4gICAgICAgIHJldHVybiB0aGlzLmxpYnNbbGliXS5pbml0LmFwcGx5KHRoaXMubGlic1tsaWJdLCBhcmdzKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHt9O1xuICAgIH0sXG5cbiAgICBwYXRjaCA6IGZ1bmN0aW9uIChsaWIpIHtcbiAgICAgIGxpYi5zY29wZSA9IHRoaXMuc2NvcGU7XG4gICAgICBsaWIubmFtZXNwYWNlID0gdGhpcy5nbG9iYWwubmFtZXNwYWNlO1xuICAgICAgbGliLnJ0bCA9IHRoaXMucnRsO1xuICAgICAgbGliWydkYXRhX29wdGlvbnMnXSA9IHRoaXMudXRpbHMuZGF0YV9vcHRpb25zO1xuICAgICAgbGliWydhdHRyX25hbWUnXSA9IGF0dHJfbmFtZTtcbiAgICAgIGxpYlsnYWRkX25hbWVzcGFjZSddID0gYWRkX25hbWVzcGFjZTtcbiAgICAgIGxpYlsnYmluZGluZ3MnXSA9IGJpbmRpbmdzO1xuICAgICAgbGliWydTJ10gPSB0aGlzLnV0aWxzLlM7XG4gICAgfSxcblxuICAgIGluaGVyaXQgOiBmdW5jdGlvbiAoc2NvcGUsIG1ldGhvZHMpIHtcbiAgICAgIHZhciBtZXRob2RzX2FyciA9IG1ldGhvZHMuc3BsaXQoJyAnKSxcbiAgICAgICAgICBpID0gbWV0aG9kc19hcnIubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGlmICh0aGlzLnV0aWxzLmhhc093blByb3BlcnR5KG1ldGhvZHNfYXJyW2ldKSkge1xuICAgICAgICAgIHNjb3BlW21ldGhvZHNfYXJyW2ldXSA9IHRoaXMudXRpbHNbbWV0aG9kc19hcnJbaV1dO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNldF9uYW1lc3BhY2UgOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIC8vIERlc2NyaXB0aW9uOlxuICAgICAgLy8gICAgRG9uJ3QgYm90aGVyIHJlYWRpbmcgdGhlIG5hbWVzcGFjZSBvdXQgb2YgdGhlIG1ldGEgdGFnXG4gICAgICAvLyAgICBpZiB0aGUgbmFtZXNwYWNlIGhhcyBiZWVuIHNldCBnbG9iYWxseSBpbiBqYXZhc2NyaXB0XG4gICAgICAvL1xuICAgICAgLy8gRXhhbXBsZTpcbiAgICAgIC8vICAgIEZvdW5kYXRpb24uZ2xvYmFsLm5hbWVzcGFjZSA9ICdteS1uYW1lc3BhY2UnO1xuICAgICAgLy8gb3IgbWFrZSBpdCBhbiBlbXB0eSBzdHJpbmc6XG4gICAgICAvLyAgICBGb3VuZGF0aW9uLmdsb2JhbC5uYW1lc3BhY2UgPSAnJztcbiAgICAgIC8vXG4gICAgICAvL1xuXG4gICAgICAvLyBJZiB0aGUgbmFtZXNwYWNlIGhhcyBub3QgYmVlbiBzZXQgKGlzIHVuZGVmaW5lZCksIHRyeSB0byByZWFkIGl0IG91dCBvZiB0aGUgbWV0YSBlbGVtZW50LlxuICAgICAgLy8gT3RoZXJ3aXNlIHVzZSB0aGUgZ2xvYmFsbHkgZGVmaW5lZCBuYW1lc3BhY2UsIGV2ZW4gaWYgaXQncyBlbXB0eSAoJycpXG4gICAgICB2YXIgbmFtZXNwYWNlID0gKCB0aGlzLmdsb2JhbC5uYW1lc3BhY2UgPT09IHVuZGVmaW5lZCApID8gJCgnLmZvdW5kYXRpb24tZGF0YS1hdHRyaWJ1dGUtbmFtZXNwYWNlJykuY3NzKCdmb250LWZhbWlseScpIDogdGhpcy5nbG9iYWwubmFtZXNwYWNlO1xuXG4gICAgICAvLyBGaW5hbGx5LCBpZiB0aGUgbmFtc2VwYWNlIGlzIGVpdGhlciB1bmRlZmluZWQgb3IgZmFsc2UsIHNldCBpdCB0byBhbiBlbXB0eSBzdHJpbmcuXG4gICAgICAvLyBPdGhlcndpc2UgdXNlIHRoZSBuYW1lc3BhY2UgdmFsdWUuXG4gICAgICB0aGlzLmdsb2JhbC5uYW1lc3BhY2UgPSAoIG5hbWVzcGFjZSA9PT0gdW5kZWZpbmVkIHx8IC9mYWxzZS9pLnRlc3QobmFtZXNwYWNlKSApID8gJycgOiBuYW1lc3BhY2U7XG4gICAgfSxcblxuICAgIGxpYnMgOiB7fSxcblxuICAgIC8vIG1ldGhvZHMgdGhhdCBjYW4gYmUgaW5oZXJpdGVkIGluIGxpYnJhcmllc1xuICAgIHV0aWxzIDoge1xuXG4gICAgICAvLyBEZXNjcmlwdGlvbjpcbiAgICAgIC8vICAgIEZhc3QgU2VsZWN0b3Igd3JhcHBlciByZXR1cm5zIGpRdWVyeSBvYmplY3QuIE9ubHkgdXNlIHdoZXJlIGdldEVsZW1lbnRCeUlkXG4gICAgICAvLyAgICBpcyBub3QgYXZhaWxhYmxlLlxuICAgICAgLy9cbiAgICAgIC8vIEFyZ3VtZW50czpcbiAgICAgIC8vICAgIFNlbGVjdG9yIChTdHJpbmcpOiBDU1Mgc2VsZWN0b3IgZGVzY3JpYmluZyB0aGUgZWxlbWVudChzKSB0byBiZVxuICAgICAgLy8gICAgcmV0dXJuZWQgYXMgYSBqUXVlcnkgb2JqZWN0LlxuICAgICAgLy9cbiAgICAgIC8vICAgIFNjb3BlIChTdHJpbmcpOiBDU1Mgc2VsZWN0b3IgZGVzY3JpYmluZyB0aGUgYXJlYSB0byBiZSBzZWFyY2hlZC4gRGVmYXVsdFxuICAgICAgLy8gICAgaXMgZG9jdW1lbnQuXG4gICAgICAvL1xuICAgICAgLy8gUmV0dXJuczpcbiAgICAgIC8vICAgIEVsZW1lbnQgKGpRdWVyeSBPYmplY3QpOiBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgZWxlbWVudHMgbWF0Y2hpbmcgdGhlXG4gICAgICAvLyAgICBzZWxlY3RvciB3aXRoaW4gdGhlIHNjb3BlLlxuICAgICAgUyA6IFMsXG5cbiAgICAgIC8vIERlc2NyaXB0aW9uOlxuICAgICAgLy8gICAgRXhlY3V0ZXMgYSBmdW5jdGlvbiBhIG1heCBvZiBvbmNlIGV2ZXJ5IG4gbWlsbGlzZWNvbmRzXG4gICAgICAvL1xuICAgICAgLy8gQXJndW1lbnRzOlxuICAgICAgLy8gICAgRnVuYyAoRnVuY3Rpb24pOiBGdW5jdGlvbiB0byBiZSB0aHJvdHRsZWQuXG4gICAgICAvL1xuICAgICAgLy8gICAgRGVsYXkgKEludGVnZXIpOiBGdW5jdGlvbiBleGVjdXRpb24gdGhyZXNob2xkIGluIG1pbGxpc2Vjb25kcy5cbiAgICAgIC8vXG4gICAgICAvLyBSZXR1cm5zOlxuICAgICAgLy8gICAgTGF6eV9mdW5jdGlvbiAoRnVuY3Rpb24pOiBGdW5jdGlvbiB3aXRoIHRocm90dGxpbmcgYXBwbGllZC5cbiAgICAgIHRocm90dGxlIDogZnVuY3Rpb24gKGZ1bmMsIGRlbGF5KSB7XG4gICAgICAgIHZhciB0aW1lciA9IG51bGw7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgICAgICBpZiAodGltZXIgPT0gbnVsbCkge1xuICAgICAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgICAgdGltZXIgPSBudWxsO1xuICAgICAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIERlc2NyaXB0aW9uOlxuICAgICAgLy8gICAgRXhlY3V0ZXMgYSBmdW5jdGlvbiB3aGVuIGl0IHN0b3BzIGJlaW5nIGludm9rZWQgZm9yIG4gc2Vjb25kc1xuICAgICAgLy8gICAgTW9kaWZpZWQgdmVyc2lvbiBvZiBfLmRlYm91bmNlKCkgaHR0cDovL3VuZGVyc2NvcmVqcy5vcmdcbiAgICAgIC8vXG4gICAgICAvLyBBcmd1bWVudHM6XG4gICAgICAvLyAgICBGdW5jIChGdW5jdGlvbik6IEZ1bmN0aW9uIHRvIGJlIGRlYm91bmNlZC5cbiAgICAgIC8vXG4gICAgICAvLyAgICBEZWxheSAoSW50ZWdlcik6IEZ1bmN0aW9uIGV4ZWN1dGlvbiB0aHJlc2hvbGQgaW4gbWlsbGlzZWNvbmRzLlxuICAgICAgLy9cbiAgICAgIC8vICAgIEltbWVkaWF0ZSAoQm9vbCk6IFdoZXRoZXIgdGhlIGZ1bmN0aW9uIHNob3VsZCBiZSBjYWxsZWQgYXQgdGhlIGJlZ2lubmluZ1xuICAgICAgLy8gICAgb2YgdGhlIGRlbGF5IGluc3RlYWQgb2YgdGhlIGVuZC4gRGVmYXVsdCBpcyBmYWxzZS5cbiAgICAgIC8vXG4gICAgICAvLyBSZXR1cm5zOlxuICAgICAgLy8gICAgTGF6eV9mdW5jdGlvbiAoRnVuY3Rpb24pOiBGdW5jdGlvbiB3aXRoIGRlYm91bmNpbmcgYXBwbGllZC5cbiAgICAgIGRlYm91bmNlIDogZnVuY3Rpb24gKGZ1bmMsIGRlbGF5LCBpbW1lZGlhdGUpIHtcbiAgICAgICAgdmFyIHRpbWVvdXQsIHJlc3VsdDtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgdmFyIGxhdGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoIWltbWVkaWF0ZSkge1xuICAgICAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCBkZWxheSk7XG4gICAgICAgICAgaWYgKGNhbGxOb3cpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgICB9LFxuXG4gICAgICAvLyBEZXNjcmlwdGlvbjpcbiAgICAgIC8vICAgIFBhcnNlcyBkYXRhLW9wdGlvbnMgYXR0cmlidXRlXG4gICAgICAvL1xuICAgICAgLy8gQXJndW1lbnRzOlxuICAgICAgLy8gICAgRWwgKGpRdWVyeSBPYmplY3QpOiBFbGVtZW50IHRvIGJlIHBhcnNlZC5cbiAgICAgIC8vXG4gICAgICAvLyBSZXR1cm5zOlxuICAgICAgLy8gICAgT3B0aW9ucyAoSmF2YXNjcmlwdCBPYmplY3QpOiBDb250ZW50cyBvZiB0aGUgZWxlbWVudCdzIGRhdGEtb3B0aW9uc1xuICAgICAgLy8gICAgYXR0cmlidXRlLlxuICAgICAgZGF0YV9vcHRpb25zIDogZnVuY3Rpb24gKGVsLCBkYXRhX2F0dHJfbmFtZSkge1xuICAgICAgICBkYXRhX2F0dHJfbmFtZSA9IGRhdGFfYXR0cl9uYW1lIHx8ICdvcHRpb25zJztcbiAgICAgICAgdmFyIG9wdHMgPSB7fSwgaWksIHAsIG9wdHNfYXJyLFxuICAgICAgICAgICAgZGF0YV9vcHRpb25zID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgIHZhciBuYW1lc3BhY2UgPSBGb3VuZGF0aW9uLmdsb2JhbC5uYW1lc3BhY2U7XG5cbiAgICAgICAgICAgICAgaWYgKG5hbWVzcGFjZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsLmRhdGEobmFtZXNwYWNlICsgJy0nICsgZGF0YV9hdHRyX25hbWUpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmV0dXJuIGVsLmRhdGEoZGF0YV9hdHRyX25hbWUpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICB2YXIgY2FjaGVkX29wdGlvbnMgPSBkYXRhX29wdGlvbnMoZWwpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgY2FjaGVkX29wdGlvbnMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgcmV0dXJuIGNhY2hlZF9vcHRpb25zO1xuICAgICAgICB9XG5cbiAgICAgICAgb3B0c19hcnIgPSAoY2FjaGVkX29wdGlvbnMgfHwgJzonKS5zcGxpdCgnOycpO1xuICAgICAgICBpaSA9IG9wdHNfYXJyLmxlbmd0aDtcblxuICAgICAgICBmdW5jdGlvbiBpc051bWJlciAobykge1xuICAgICAgICAgIHJldHVybiAhaXNOYU4gKG8gLSAwKSAmJiBvICE9PSBudWxsICYmIG8gIT09ICcnICYmIG8gIT09IGZhbHNlICYmIG8gIT09IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB0cmltIChzdHIpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHN0ciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiAkLnRyaW0oc3RyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlIChpaS0tKSB7XG4gICAgICAgICAgcCA9IG9wdHNfYXJyW2lpXS5zcGxpdCgnOicpO1xuICAgICAgICAgIHAgPSBbcFswXSwgcC5zbGljZSgxKS5qb2luKCc6JyldO1xuXG4gICAgICAgICAgaWYgKC90cnVlL2kudGVzdChwWzFdKSkge1xuICAgICAgICAgICAgcFsxXSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgvZmFsc2UvaS50ZXN0KHBbMV0pKSB7XG4gICAgICAgICAgICBwWzFdID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpc051bWJlcihwWzFdKSkge1xuICAgICAgICAgICAgaWYgKHBbMV0uaW5kZXhPZignLicpID09PSAtMSkge1xuICAgICAgICAgICAgICBwWzFdID0gcGFyc2VJbnQocFsxXSwgMTApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcFsxXSA9IHBhcnNlRmxvYXQocFsxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHAubGVuZ3RoID09PSAyICYmIHBbMF0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgb3B0c1t0cmltKHBbMF0pXSA9IHRyaW0ocFsxXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG9wdHM7XG4gICAgICB9LFxuXG4gICAgICAvLyBEZXNjcmlwdGlvbjpcbiAgICAgIC8vICAgIEFkZHMgSlMtcmVjb2duaXphYmxlIG1lZGlhIHF1ZXJpZXNcbiAgICAgIC8vXG4gICAgICAvLyBBcmd1bWVudHM6XG4gICAgICAvLyAgICBNZWRpYSAoU3RyaW5nKTogS2V5IHN0cmluZyBmb3IgdGhlIG1lZGlhIHF1ZXJ5IHRvIGJlIHN0b3JlZCBhcyBpblxuICAgICAgLy8gICAgRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzXG4gICAgICAvL1xuICAgICAgLy8gICAgQ2xhc3MgKFN0cmluZyk6IENsYXNzIG5hbWUgZm9yIHRoZSBnZW5lcmF0ZWQgPG1ldGE+IHRhZ1xuICAgICAgcmVnaXN0ZXJfbWVkaWEgOiBmdW5jdGlvbiAobWVkaWEsIG1lZGlhX2NsYXNzKSB7XG4gICAgICAgIGlmIChGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXNbbWVkaWFdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAkKCdoZWFkJykuYXBwZW5kKCc8bWV0YSBjbGFzcz1cIicgKyBtZWRpYV9jbGFzcyArICdcIi8+Jyk7XG4gICAgICAgICAgRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzW21lZGlhXSA9IHJlbW92ZVF1b3RlcygkKCcuJyArIG1lZGlhX2NsYXNzKS5jc3MoJ2ZvbnQtZmFtaWx5JykpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvLyBEZXNjcmlwdGlvbjpcbiAgICAgIC8vICAgIEFkZCBjdXN0b20gQ1NTIHdpdGhpbiBhIEpTLWRlZmluZWQgbWVkaWEgcXVlcnlcbiAgICAgIC8vXG4gICAgICAvLyBBcmd1bWVudHM6XG4gICAgICAvLyAgICBSdWxlIChTdHJpbmcpOiBDU1MgcnVsZSB0byBiZSBhcHBlbmRlZCB0byB0aGUgZG9jdW1lbnQuXG4gICAgICAvL1xuICAgICAgLy8gICAgTWVkaWEgKFN0cmluZyk6IE9wdGlvbmFsIG1lZGlhIHF1ZXJ5IHN0cmluZyBmb3IgdGhlIENTUyBydWxlIHRvIGJlXG4gICAgICAvLyAgICBuZXN0ZWQgdW5kZXIuXG4gICAgICBhZGRfY3VzdG9tX3J1bGUgOiBmdW5jdGlvbiAocnVsZSwgbWVkaWEpIHtcbiAgICAgICAgaWYgKG1lZGlhID09PSB1bmRlZmluZWQgJiYgRm91bmRhdGlvbi5zdHlsZXNoZWV0KSB7XG4gICAgICAgICAgRm91bmRhdGlvbi5zdHlsZXNoZWV0Lmluc2VydFJ1bGUocnVsZSwgRm91bmRhdGlvbi5zdHlsZXNoZWV0LmNzc1J1bGVzLmxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHF1ZXJ5ID0gRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzW21lZGlhXTtcblxuICAgICAgICAgIGlmIChxdWVyeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBGb3VuZGF0aW9uLnN0eWxlc2hlZXQuaW5zZXJ0UnVsZSgnQG1lZGlhICcgK1xuICAgICAgICAgICAgICBGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXNbbWVkaWFdICsgJ3sgJyArIHJ1bGUgKyAnIH0nLCBGb3VuZGF0aW9uLnN0eWxlc2hlZXQuY3NzUnVsZXMubGVuZ3RoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIERlc2NyaXB0aW9uOlxuICAgICAgLy8gICAgUGVyZm9ybXMgYSBjYWxsYmFjayBmdW5jdGlvbiB3aGVuIGFuIGltYWdlIGlzIGZ1bGx5IGxvYWRlZFxuICAgICAgLy9cbiAgICAgIC8vIEFyZ3VtZW50czpcbiAgICAgIC8vICAgIEltYWdlIChqUXVlcnkgT2JqZWN0KTogSW1hZ2UocykgdG8gY2hlY2sgaWYgbG9hZGVkLlxuICAgICAgLy9cbiAgICAgIC8vICAgIENhbGxiYWNrIChGdW5jdGlvbik6IEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBpbWFnZSBpcyBmdWxseSBsb2FkZWQuXG4gICAgICBpbWFnZV9sb2FkZWQgOiBmdW5jdGlvbiAoaW1hZ2VzLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICB1bmxvYWRlZCA9IGltYWdlcy5sZW5ndGg7XG5cbiAgICAgICAgZnVuY3Rpb24gcGljdHVyZXNfaGFzX2hlaWdodChpbWFnZXMpIHtcbiAgICAgICAgICB2YXIgcGljdHVyZXNfbnVtYmVyID0gaW1hZ2VzLmxlbmd0aDtcblxuICAgICAgICAgIGZvciAodmFyIGkgPSBwaWN0dXJlc19udW1iZXIgLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgaWYoaW1hZ2VzLmF0dHIoJ2hlaWdodCcpID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodW5sb2FkZWQgPT09IDAgfHwgcGljdHVyZXNfaGFzX2hlaWdodChpbWFnZXMpKSB7XG4gICAgICAgICAgY2FsbGJhY2soaW1hZ2VzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGltYWdlcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzaW5nbGVfaW1hZ2VfbG9hZGVkKHNlbGYuUyh0aGlzKSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdW5sb2FkZWQgLT0gMTtcbiAgICAgICAgICAgIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgICAgICAgICAgICBjYWxsYmFjayhpbWFnZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIERlc2NyaXB0aW9uOlxuICAgICAgLy8gICAgUmV0dXJucyBhIHJhbmRvbSwgYWxwaGFudW1lcmljIHN0cmluZ1xuICAgICAgLy9cbiAgICAgIC8vIEFyZ3VtZW50czpcbiAgICAgIC8vICAgIExlbmd0aCAoSW50ZWdlcik6IExlbmd0aCBvZiBzdHJpbmcgdG8gYmUgZ2VuZXJhdGVkLiBEZWZhdWx0cyB0byByYW5kb21cbiAgICAgIC8vICAgIGludGVnZXIuXG4gICAgICAvL1xuICAgICAgLy8gUmV0dXJuczpcbiAgICAgIC8vICAgIFJhbmQgKFN0cmluZyk6IFBzZXVkby1yYW5kb20sIGFscGhhbnVtZXJpYyBzdHJpbmcuXG4gICAgICByYW5kb21fc3RyIDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMuZmlkeCkge1xuICAgICAgICAgIHRoaXMuZmlkeCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcmVmaXggPSB0aGlzLnByZWZpeCB8fCBbKHRoaXMubmFtZSB8fCAnRicpLCAoK25ldyBEYXRlKS50b1N0cmluZygzNildLmpvaW4oJy0nKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5wcmVmaXggKyAodGhpcy5maWR4KyspLnRvU3RyaW5nKDM2KTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIERlc2NyaXB0aW9uOlxuICAgICAgLy8gICAgSGVscGVyIGZvciB3aW5kb3cubWF0Y2hNZWRpYVxuICAgICAgLy9cbiAgICAgIC8vIEFyZ3VtZW50czpcbiAgICAgIC8vICAgIG1xIChTdHJpbmcpOiBNZWRpYSBxdWVyeVxuICAgICAgLy9cbiAgICAgIC8vIFJldHVybnM6XG4gICAgICAvLyAgICAoQm9vbGVhbik6IFdoZXRoZXIgdGhlIG1lZGlhIHF1ZXJ5IHBhc3NlcyBvciBub3RcbiAgICAgIG1hdGNoIDogZnVuY3Rpb24gKG1xKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cubWF0Y2hNZWRpYShtcSkubWF0Y2hlcztcbiAgICAgIH0sXG5cbiAgICAgIC8vIERlc2NyaXB0aW9uOlxuICAgICAgLy8gICAgSGVscGVycyBmb3IgY2hlY2tpbmcgRm91bmRhdGlvbiBkZWZhdWx0IG1lZGlhIHF1ZXJpZXMgd2l0aCBKU1xuICAgICAgLy9cbiAgICAgIC8vIFJldHVybnM6XG4gICAgICAvLyAgICAoQm9vbGVhbik6IFdoZXRoZXIgdGhlIG1lZGlhIHF1ZXJ5IHBhc3NlcyBvciBub3RcblxuICAgICAgaXNfc21hbGxfdXAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllcy5zbWFsbCk7XG4gICAgICB9LFxuXG4gICAgICBpc19tZWRpdW1fdXAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllcy5tZWRpdW0pO1xuICAgICAgfSxcblxuICAgICAgaXNfbGFyZ2VfdXAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllcy5sYXJnZSk7XG4gICAgICB9LFxuXG4gICAgICBpc194bGFyZ2VfdXAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdGNoKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllcy54bGFyZ2UpO1xuICAgICAgfSxcblxuICAgICAgaXNfeHhsYXJnZV91cCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0Y2goRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzLnh4bGFyZ2UpO1xuICAgICAgfSxcblxuICAgICAgaXNfc21hbGxfb25seSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmlzX21lZGl1bV91cCgpICYmICF0aGlzLmlzX2xhcmdlX3VwKCkgJiYgIXRoaXMuaXNfeGxhcmdlX3VwKCkgJiYgIXRoaXMuaXNfeHhsYXJnZV91cCgpO1xuICAgICAgfSxcblxuICAgICAgaXNfbWVkaXVtX29ubHkgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzX21lZGl1bV91cCgpICYmICF0aGlzLmlzX2xhcmdlX3VwKCkgJiYgIXRoaXMuaXNfeGxhcmdlX3VwKCkgJiYgIXRoaXMuaXNfeHhsYXJnZV91cCgpO1xuICAgICAgfSxcblxuICAgICAgaXNfbGFyZ2Vfb25seSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNfbWVkaXVtX3VwKCkgJiYgdGhpcy5pc19sYXJnZV91cCgpICYmICF0aGlzLmlzX3hsYXJnZV91cCgpICYmICF0aGlzLmlzX3h4bGFyZ2VfdXAoKTtcbiAgICAgIH0sXG5cbiAgICAgIGlzX3hsYXJnZV9vbmx5IDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc19tZWRpdW1fdXAoKSAmJiB0aGlzLmlzX2xhcmdlX3VwKCkgJiYgdGhpcy5pc194bGFyZ2VfdXAoKSAmJiAhdGhpcy5pc194eGxhcmdlX3VwKCk7XG4gICAgICB9LFxuXG4gICAgICBpc194eGxhcmdlX29ubHkgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzX21lZGl1bV91cCgpICYmIHRoaXMuaXNfbGFyZ2VfdXAoKSAmJiB0aGlzLmlzX3hsYXJnZV91cCgpICYmIHRoaXMuaXNfeHhsYXJnZV91cCgpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAkLmZuLmZvdW5kYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICBGb3VuZGF0aW9uLmluaXQuYXBwbHkoRm91bmRhdGlvbiwgW3RoaXNdLmNvbmNhdChhcmdzKSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9KTtcbiAgfTtcblxufShqUXVlcnksIHdpbmRvdywgd2luZG93LmRvY3VtZW50KSk7XG4iLCI7KGZ1bmN0aW9uICgkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIEZvdW5kYXRpb24ubGlicy5hYmlkZSA9IHtcbiAgICBuYW1lIDogJ2FiaWRlJyxcblxuICAgIHZlcnNpb24gOiAnNS41LjEnLFxuXG4gICAgc2V0dGluZ3MgOiB7XG4gICAgICBsaXZlX3ZhbGlkYXRlIDogdHJ1ZSxcbiAgICAgIHZhbGlkYXRlX29uX2JsdXIgOiB0cnVlLFxuICAgICAgLy8gdmFsaWRhdGVfb246ICd0YWInLCAvLyB0YWIgKHdoZW4gdXNlciB0YWJzIGJldHdlZW4gZmllbGRzKSwgY2hhbmdlIChpbnB1dCBjaGFuZ2VzKSwgbWFudWFsIChjYWxsIGN1c3RvbSBldmVudHMpIFxuICAgICAgZm9jdXNfb25faW52YWxpZCA6IHRydWUsXG4gICAgICBlcnJvcl9sYWJlbHMgOiB0cnVlLCAvLyBsYWJlbHMgd2l0aCBhIGZvcj1cImlucHV0SWRcIiB3aWxsIHJlY2lldmUgYW4gYGVycm9yYCBjbGFzc1xuICAgICAgZXJyb3JfY2xhc3MgOiAnZXJyb3InLFxuICAgICAgdGltZW91dCA6IDEwMDAsXG4gICAgICBwYXR0ZXJucyA6IHtcbiAgICAgICAgYWxwaGEgOiAvXlthLXpBLVpdKyQvLFxuICAgICAgICBhbHBoYV9udW1lcmljIDogL15bYS16QS1aMC05XSskLyxcbiAgICAgICAgaW50ZWdlciA6IC9eWy0rXT9cXGQrJC8sXG4gICAgICAgIG51bWJlciA6IC9eWy0rXT9cXGQqKD86W1xcLlxcLF1cXGQrKT8kLyxcblxuICAgICAgICAvLyBhbWV4LCB2aXNhLCBkaW5lcnNcbiAgICAgICAgY2FyZCA6IC9eKD86NFswLTldezEyfSg/OlswLTldezN9KT98NVsxLTVdWzAtOV17MTR9fDYoPzowMTF8NVswLTldWzAtOV0pWzAtOV17MTJ9fDNbNDddWzAtOV17MTN9fDMoPzowWzAtNV18WzY4XVswLTldKVswLTldezExfXwoPzoyMTMxfDE4MDB8MzVcXGR7M30pXFxkezExfSkkLyxcbiAgICAgICAgY3Z2IDogL14oWzAtOV0pezMsNH0kLyxcblxuICAgICAgICAvLyBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS9zdGF0ZXMtb2YtdGhlLXR5cGUtYXR0cmlidXRlLmh0bWwjdmFsaWQtZS1tYWlsLWFkZHJlc3NcbiAgICAgICAgZW1haWwgOiAvXlthLXpBLVowLTkuISMkJSYnKitcXC89P15fYHt8fX4tXStAW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KD86XFwuW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KSskLyxcblxuICAgICAgICAvLyBodHRwOi8vYmxvZ3MubHNlLmFjLnVrL2x0aS8yMDA4LzA0LzIzL2EtcmVndWxhci1leHByZXNzaW9uLXRvLW1hdGNoLWFueS11cmwvXG4gICAgICAgIHVybDogL14oaHR0cHM/fGZ0cHxmaWxlfHNzaCk6XFwvXFwvKFstOzomPVxcK1xcJCxcXHddK0B7MX0pPyhbLUEtWmEtejAtOVxcLl0rKSs6PyhcXGQrKT8oKFxcL1stXFwrfiVcXC9cXC5cXHddKyk/XFw/PyhbLVxcKz0mOyVAXFwuXFx3XSspPyM/KFtcXHddKyk/KT8vLFxuICAgICAgICAvLyBhYmMuZGVcbiAgICAgICAgZG9tYWluIDogL14oW2EtekEtWjAtOV0oW2EtekEtWjAtOVxcLV17MCw2MX1bYS16QS1aMC05XSk/XFwuKStbYS16QS1aXXsyLDh9JC8sXG5cbiAgICAgICAgZGF0ZXRpbWUgOiAvXihbMC0yXVswLTldezN9KVxcLShbMC0xXVswLTldKVxcLShbMC0zXVswLTldKVQoWzAtNV1bMC05XSlcXDooWzAtNV1bMC05XSlcXDooWzAtNV1bMC05XSkoWnwoW1xcLVxcK10oWzAtMV1bMC05XSlcXDowMCkpJC8sXG4gICAgICAgIC8vIFlZWVktTU0tRERcbiAgICAgICAgZGF0ZSA6IC8oPzoxOXwyMClbMC05XXsyfS0oPzooPzowWzEtOV18MVswLTJdKS0oPzowWzEtOV18MVswLTldfDJbMC05XSl8KD86KD8hMDIpKD86MFsxLTldfDFbMC0yXSktKD86MzApKXwoPzooPzowWzEzNTc4XXwxWzAyXSktMzEpKSQvLFxuICAgICAgICAvLyBISDpNTTpTU1xuICAgICAgICB0aW1lIDogL14oMFswLTldfDFbMC05XXwyWzAtM10pKDpbMC01XVswLTldKXsyfSQvLFxuICAgICAgICBkYXRlSVNPIDogL15cXGR7NH1bXFwvXFwtXVxcZHsxLDJ9W1xcL1xcLV1cXGR7MSwyfSQvLFxuICAgICAgICAvLyBNTS9ERC9ZWVlZXG4gICAgICAgIG1vbnRoX2RheV95ZWFyIDogL14oMFsxLTldfDFbMDEyXSlbLSBcXC8uXSgwWzEtOV18WzEyXVswLTldfDNbMDFdKVstIFxcLy5dXFxkezR9JC8sXG4gICAgICAgIC8vIEREL01NL1lZWVlcbiAgICAgICAgZGF5X21vbnRoX3llYXIgOiAvXigwWzEtOV18WzEyXVswLTldfDNbMDFdKVstIFxcLy5dKDBbMS05XXwxWzAxMl0pWy0gXFwvLl1cXGR7NH0kLyxcblxuICAgICAgICAvLyAjRkZGIG9yICNGRkZGRkZcbiAgICAgICAgY29sb3IgOiAvXiM/KFthLWZBLUYwLTldezZ9fFthLWZBLUYwLTldezN9KSQvXG4gICAgICB9LFxuICAgICAgdmFsaWRhdG9ycyA6IHtcbiAgICAgICAgZXF1YWxUbyA6IGZ1bmN0aW9uIChlbCwgcmVxdWlyZWQsIHBhcmVudCkge1xuICAgICAgICAgIHZhciBmcm9tICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsLmdldEF0dHJpYnV0ZSh0aGlzLmFkZF9uYW1lc3BhY2UoJ2RhdGEtZXF1YWx0bycpKSkudmFsdWUsXG4gICAgICAgICAgICAgIHRvICAgID0gZWwudmFsdWUsXG4gICAgICAgICAgICAgIHZhbGlkID0gKGZyb20gPT09IHRvKTtcblxuICAgICAgICAgIHJldHVybiB2YWxpZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICB0aW1lciA6IG51bGwsXG5cbiAgICBpbml0IDogZnVuY3Rpb24gKHNjb3BlLCBtZXRob2QsIG9wdGlvbnMpIHtcbiAgICAgIHRoaXMuYmluZGluZ3MobWV0aG9kLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgZXZlbnRzIDogZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgZm9ybSA9IHNlbGYuUyhzY29wZSkuYXR0cignbm92YWxpZGF0ZScsICdub3ZhbGlkYXRlJyksXG4gICAgICAgICAgc2V0dGluZ3MgPSBmb3JtLmRhdGEodGhpcy5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKSB8fCB7fTtcblxuICAgICAgdGhpcy5pbnZhbGlkX2F0dHIgPSB0aGlzLmFkZF9uYW1lc3BhY2UoJ2RhdGEtaW52YWxpZCcpO1xuXG4gICAgICBmdW5jdGlvbiB2YWxpZGF0ZShvcmlnaW5hbFNlbGYsIGUpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYudGltZXIpO1xuICAgICAgICBzZWxmLnRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2VsZi52YWxpZGF0ZShbb3JpZ2luYWxTZWxmXSwgZSk7XG4gICAgICAgIH0uYmluZChvcmlnaW5hbFNlbGYpLCBzZXR0aW5ncy50aW1lb3V0KTtcbiAgICAgIH1cblxuXG4gICAgICBmb3JtXG4gICAgICAgIC5vZmYoJy5hYmlkZScpXG4gICAgICAgIC5vbignc3VibWl0LmZuZHRuLmFiaWRlJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICB2YXIgaXNfYWpheCA9IC9hamF4L2kudGVzdChzZWxmLlModGhpcykuYXR0cihzZWxmLmF0dHJfbmFtZSgpKSk7XG4gICAgICAgICAgcmV0dXJuIHNlbGYudmFsaWRhdGUoc2VsZi5TKHRoaXMpLmZpbmQoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0Jykubm90KFwiOmhpZGRlbiwgW2RhdGEtYWJpZGUtaWdub3JlXVwiKS5nZXQoKSwgZSwgaXNfYWpheCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5vbigndmFsaWRhdGUuZm5kdG4uYWJpZGUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGlmIChzZXR0aW5ncy52YWxpZGF0ZV9vbiA9PT0gJ21hbnVhbCcpIHtcbiAgICAgICAgICAgIHNlbGYudmFsaWRhdGUoW2UudGFyZ2V0XSwgZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAub24oJ3Jlc2V0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5yZXNldCgkKHRoaXMpLCBlKTsgICAgICAgICAgXG4gICAgICAgIH0pXG4gICAgICAgIC5maW5kKCdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCcpLm5vdChcIjpoaWRkZW4sIFtkYXRhLWFiaWRlLWlnbm9yZV1cIilcbiAgICAgICAgICAub2ZmKCcuYWJpZGUnKVxuICAgICAgICAgIC5vbignYmx1ci5mbmR0bi5hYmlkZSBjaGFuZ2UuZm5kdG4uYWJpZGUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgLy8gb2xkIHNldHRpbmdzIGZhbGxiYWNrXG4gICAgICAgICAgICAvLyB3aWxsIGJlIGRlcHJlY2F0ZWQgd2l0aCBGNiByZWxlYXNlXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MudmFsaWRhdGVfb25fYmx1ciAmJiBzZXR0aW5ncy52YWxpZGF0ZV9vbl9ibHVyID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgIHZhbGlkYXRlKHRoaXMsIGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gbmV3IHNldHRpbmdzIGNvbWJpbmluZyB2YWxpZGF0ZSBvcHRpb25zIGludG8gb25lIHNldHRpbmdcbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy52YWxpZGF0ZV9vbiA9PT0gJ2NoYW5nZScpIHtcbiAgICAgICAgICAgICAgdmFsaWRhdGUodGhpcywgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAub24oJ2tleWRvd24uZm5kdG4uYWJpZGUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgLy8gb2xkIHNldHRpbmdzIGZhbGxiYWNrXG4gICAgICAgICAgICAvLyB3aWxsIGJlIGRlcHJlY2F0ZWQgd2l0aCBGNiByZWxlYXNlXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MubGl2ZV92YWxpZGF0ZSAmJiBzZXR0aW5ncy5saXZlX3ZhbGlkYXRlID09PSB0cnVlICYmIGUud2hpY2ggIT0gOSkge1xuICAgICAgICAgICAgICB2YWxpZGF0ZSh0aGlzLCBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIG5ldyBzZXR0aW5ncyBjb21iaW5pbmcgdmFsaWRhdGUgb3B0aW9ucyBpbnRvIG9uZSBzZXR0aW5nXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MudmFsaWRhdGVfb24gPT09ICd0YWInICYmIGUud2hpY2ggPT09IDkpIHtcbiAgICAgICAgICAgICAgdmFsaWRhdGUodGhpcywgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzZXR0aW5ncy52YWxpZGF0ZV9vbiA9PT0gJ2NoYW5nZScpIHtcbiAgICAgICAgICAgICAgdmFsaWRhdGUodGhpcywgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAub24oJ2ZvY3VzJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9pUGFkfGlQaG9uZXxBbmRyb2lkfEJsYWNrQmVycnl8V2luZG93cyBQaG9uZXx3ZWJPUy9pKSkge1xuICAgICAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICBzY3JvbGxUb3A6ICQoZS50YXJnZXQpLm9mZnNldCgpLnRvcFxuICAgICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgICAgfSBcbiAgICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgcmVzZXQgOiBmdW5jdGlvbiAoZm9ybSwgZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgZm9ybS5yZW1vdmVBdHRyKHNlbGYuaW52YWxpZF9hdHRyKTtcblxuICAgICAgJCgnWycgKyBzZWxmLmludmFsaWRfYXR0ciArICddJywgZm9ybSkucmVtb3ZlQXR0cihzZWxmLmludmFsaWRfYXR0cik7XG4gICAgICAkKCcuJyArIHNlbGYuc2V0dGluZ3MuZXJyb3JfY2xhc3MsIGZvcm0pLm5vdCgnc21hbGwnKS5yZW1vdmVDbGFzcyhzZWxmLnNldHRpbmdzLmVycm9yX2NsYXNzKTtcbiAgICAgICQoJzppbnB1dCcsIGZvcm0pLm5vdCgnOmJ1dHRvbiwgOnN1Ym1pdCwgOnJlc2V0LCA6aGlkZGVuLCBbZGF0YS1hYmlkZS1pZ25vcmVdJykudmFsKCcnKS5yZW1vdmVBdHRyKHNlbGYuaW52YWxpZF9hdHRyKTtcbiAgICB9LFxuXG4gICAgdmFsaWRhdGUgOiBmdW5jdGlvbiAoZWxzLCBlLCBpc19hamF4KSB7XG4gICAgICB2YXIgdmFsaWRhdGlvbnMgPSB0aGlzLnBhcnNlX3BhdHRlcm5zKGVscyksXG4gICAgICAgICAgdmFsaWRhdGlvbl9jb3VudCA9IHZhbGlkYXRpb25zLmxlbmd0aCxcbiAgICAgICAgICBmb3JtID0gdGhpcy5TKGVsc1swXSkuY2xvc2VzdCgnZm9ybScpLFxuICAgICAgICAgIHN1Ym1pdF9ldmVudCA9IC9zdWJtaXQvLnRlc3QoZS50eXBlKTtcblxuICAgICAgLy8gSGFzIHRvIGNvdW50IHVwIHRvIG1ha2Ugc3VyZSB0aGUgZm9jdXMgZ2V0cyBhcHBsaWVkIHRvIHRoZSB0b3AgZXJyb3JcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsaWRhdGlvbl9jb3VudDsgaSsrKSB7XG4gICAgICAgIGlmICghdmFsaWRhdGlvbnNbaV0gJiYgKHN1Ym1pdF9ldmVudCB8fCBpc19hamF4KSkge1xuICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmZvY3VzX29uX2ludmFsaWQpIHtcbiAgICAgICAgICAgIGVsc1tpXS5mb2N1cygpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3JtLnRyaWdnZXIoJ2ludmFsaWQuZm5kdG4uYWJpZGUnKTtcbiAgICAgICAgICB0aGlzLlMoZWxzW2ldKS5jbG9zZXN0KCdmb3JtJykuYXR0cih0aGlzLmludmFsaWRfYXR0ciwgJycpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc3VibWl0X2V2ZW50IHx8IGlzX2FqYXgpIHtcbiAgICAgICAgZm9ybS50cmlnZ2VyKCd2YWxpZC5mbmR0bi5hYmlkZScpO1xuICAgICAgfVxuXG4gICAgICBmb3JtLnJlbW92ZUF0dHIodGhpcy5pbnZhbGlkX2F0dHIpO1xuXG4gICAgICBpZiAoaXNfYWpheCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBwYXJzZV9wYXR0ZXJucyA6IGZ1bmN0aW9uIChlbHMpIHtcbiAgICAgIHZhciBpID0gZWxzLmxlbmd0aCxcbiAgICAgICAgICBlbF9wYXR0ZXJucyA9IFtdO1xuXG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGVsX3BhdHRlcm5zLnB1c2godGhpcy5wYXR0ZXJuKGVsc1tpXSkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jaGVja192YWxpZGF0aW9uX2FuZF9hcHBseV9zdHlsZXMoZWxfcGF0dGVybnMpO1xuICAgIH0sXG5cbiAgICBwYXR0ZXJuIDogZnVuY3Rpb24gKGVsKSB7XG4gICAgICB2YXIgdHlwZSA9IGVsLmdldEF0dHJpYnV0ZSgndHlwZScpLFxuICAgICAgICAgIHJlcXVpcmVkID0gdHlwZW9mIGVsLmdldEF0dHJpYnV0ZSgncmVxdWlyZWQnKSA9PT0gJ3N0cmluZyc7XG5cbiAgICAgIHZhciBwYXR0ZXJuID0gZWwuZ2V0QXR0cmlidXRlKCdwYXR0ZXJuJykgfHwgJyc7XG5cbiAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBhdHRlcm5zLmhhc093blByb3BlcnR5KHBhdHRlcm4pICYmIHBhdHRlcm4ubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gW2VsLCB0aGlzLnNldHRpbmdzLnBhdHRlcm5zW3BhdHRlcm5dLCByZXF1aXJlZF07XG4gICAgICB9IGVsc2UgaWYgKHBhdHRlcm4ubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gW2VsLCBuZXcgUmVnRXhwKHBhdHRlcm4pLCByZXF1aXJlZF07XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBhdHRlcm5zLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG4gICAgICAgIHJldHVybiBbZWwsIHRoaXMuc2V0dGluZ3MucGF0dGVybnNbdHlwZV0sIHJlcXVpcmVkXTtcbiAgICAgIH1cblxuICAgICAgcGF0dGVybiA9IC8uKi87XG5cbiAgICAgIHJldHVybiBbZWwsIHBhdHRlcm4sIHJlcXVpcmVkXTtcbiAgICB9LFxuXG4gICAgLy8gVE9ETzogQnJlYWsgdGhpcyB1cCBpbnRvIHNtYWxsZXIgbWV0aG9kcywgZ2V0dGluZyBoYXJkIHRvIHJlYWQuXG4gICAgY2hlY2tfdmFsaWRhdGlvbl9hbmRfYXBwbHlfc3R5bGVzIDogZnVuY3Rpb24gKGVsX3BhdHRlcm5zKSB7XG4gICAgICB2YXIgaSA9IGVsX3BhdHRlcm5zLmxlbmd0aCxcbiAgICAgICAgICB2YWxpZGF0aW9ucyA9IFtdLFxuICAgICAgICAgIGZvcm0gPSB0aGlzLlMoZWxfcGF0dGVybnNbMF1bMF0pLmNsb3Nlc3QoJ1tkYXRhLScgKyB0aGlzLmF0dHJfbmFtZSh0cnVlKSArICddJyksXG4gICAgICAgICAgc2V0dGluZ3MgPSBmb3JtLmRhdGEodGhpcy5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKSB8fCB7fTtcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgdmFyIGVsID0gZWxfcGF0dGVybnNbaV1bMF0sXG4gICAgICAgICAgICByZXF1aXJlZCA9IGVsX3BhdHRlcm5zW2ldWzJdLFxuICAgICAgICAgICAgdmFsdWUgPSBlbC52YWx1ZS50cmltKCksXG4gICAgICAgICAgICBkaXJlY3RfcGFyZW50ID0gdGhpcy5TKGVsKS5wYXJlbnQoKSxcbiAgICAgICAgICAgIHZhbGlkYXRvciA9IGVsLmdldEF0dHJpYnV0ZSh0aGlzLmFkZF9uYW1lc3BhY2UoJ2RhdGEtYWJpZGUtdmFsaWRhdG9yJykpLFxuICAgICAgICAgICAgaXNfcmFkaW8gPSBlbC50eXBlID09PSAncmFkaW8nLFxuICAgICAgICAgICAgaXNfY2hlY2tib3ggPSBlbC50eXBlID09PSAnY2hlY2tib3gnLFxuICAgICAgICAgICAgbGFiZWwgPSB0aGlzLlMoJ2xhYmVsW2Zvcj1cIicgKyBlbC5nZXRBdHRyaWJ1dGUoJ2lkJykgKyAnXCJdJyksXG4gICAgICAgICAgICB2YWxpZF9sZW5ndGggPSAocmVxdWlyZWQpID8gKGVsLnZhbHVlLmxlbmd0aCA+IDApIDogdHJ1ZSxcbiAgICAgICAgICAgIGVsX3ZhbGlkYXRpb25zID0gW107XG5cbiAgICAgICAgdmFyIHBhcmVudCwgdmFsaWQ7XG5cbiAgICAgICAgLy8gc3VwcG9ydCBvbGQgd2F5IHRvIGRvIGVxdWFsVG8gdmFsaWRhdGlvbnNcbiAgICAgICAgaWYgKGVsLmdldEF0dHJpYnV0ZSh0aGlzLmFkZF9uYW1lc3BhY2UoJ2RhdGEtZXF1YWx0bycpKSkgeyB2YWxpZGF0b3IgPSAnZXF1YWxUbycgfVxuXG4gICAgICAgIGlmICghZGlyZWN0X3BhcmVudC5pcygnbGFiZWwnKSkge1xuICAgICAgICAgIHBhcmVudCA9IGRpcmVjdF9wYXJlbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFyZW50ID0gZGlyZWN0X3BhcmVudC5wYXJlbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc19yYWRpbyAmJiByZXF1aXJlZCkge1xuICAgICAgICAgIGVsX3ZhbGlkYXRpb25zLnB1c2godGhpcy52YWxpZF9yYWRpbyhlbCwgcmVxdWlyZWQpKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc19jaGVja2JveCAmJiByZXF1aXJlZCkge1xuICAgICAgICAgIGVsX3ZhbGlkYXRpb25zLnB1c2godGhpcy52YWxpZF9jaGVja2JveChlbCwgcmVxdWlyZWQpKTtcblxuICAgICAgICB9IGVsc2UgaWYgKHZhbGlkYXRvcikge1xuICAgICAgICAgIC8vIFZhbGlkYXRlIHVzaW5nIGVhY2ggb2YgdGhlIHNwZWNpZmllZCAoc3BhY2UtZGVsaW1pdGVkKSB2YWxpZGF0b3JzLlxuICAgICAgICAgIHZhciB2YWxpZGF0b3JzID0gdmFsaWRhdG9yLnNwbGl0KCcgJyk7XG4gICAgICAgICAgdmFyIGxhc3RfdmFsaWQgPSB0cnVlLCBhbGxfdmFsaWQgPSB0cnVlO1xuICAgICAgICAgIGZvciAodmFyIGl2ID0gMDsgaXYgPCB2YWxpZGF0b3JzLmxlbmd0aDsgaXYrKykge1xuICAgICAgICAgICAgICB2YWxpZCA9IHRoaXMuc2V0dGluZ3MudmFsaWRhdG9yc1t2YWxpZGF0b3JzW2l2XV0uYXBwbHkodGhpcywgW2VsLCByZXF1aXJlZCwgcGFyZW50XSlcbiAgICAgICAgICAgICAgZWxfdmFsaWRhdGlvbnMucHVzaCh2YWxpZCk7XG4gICAgICAgICAgICAgIGFsbF92YWxpZCA9IHZhbGlkICYmIGxhc3RfdmFsaWQ7XG4gICAgICAgICAgICAgIGxhc3RfdmFsaWQgPSB2YWxpZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGFsbF92YWxpZCkge1xuICAgICAgICAgICAgICB0aGlzLlMoZWwpLnJlbW92ZUF0dHIodGhpcy5pbnZhbGlkX2F0dHIpO1xuICAgICAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2xhc3MoJ2Vycm9yJyk7XG4gICAgICAgICAgICAgICQoZWwpLnRyaWdnZXJIYW5kbGVyKCd2YWxpZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuUyhlbCkuYXR0cih0aGlzLmludmFsaWRfYXR0ciwgJycpO1xuICAgICAgICAgICAgICBwYXJlbnQuYWRkQ2xhc3MoJ2Vycm9yJyk7XG4gICAgICAgICAgICAgICQoZWwpLnRyaWdnZXJIYW5kbGVyKCdpbnZhbGlkJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgaWYgKGVsX3BhdHRlcm5zW2ldWzFdLnRlc3QodmFsdWUpICYmIHZhbGlkX2xlbmd0aCB8fFxuICAgICAgICAgICAgIXJlcXVpcmVkICYmIGVsLnZhbHVlLmxlbmd0aCA8IDEgfHwgJChlbCkuYXR0cignZGlzYWJsZWQnKSkge1xuICAgICAgICAgICAgZWxfdmFsaWRhdGlvbnMucHVzaCh0cnVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxfdmFsaWRhdGlvbnMucHVzaChmYWxzZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZWxfdmFsaWRhdGlvbnMgPSBbZWxfdmFsaWRhdGlvbnMuZXZlcnkoZnVuY3Rpb24gKHZhbGlkKSB7cmV0dXJuIHZhbGlkO30pXTtcblxuICAgICAgICAgIGlmIChlbF92YWxpZGF0aW9uc1swXSkge1xuICAgICAgICAgICAgdGhpcy5TKGVsKS5yZW1vdmVBdHRyKHRoaXMuaW52YWxpZF9hdHRyKTtcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSgnYXJpYS1pbnZhbGlkJywgJ2ZhbHNlJyk7XG4gICAgICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtZGVzY3JpYmVkYnknKTtcbiAgICAgICAgICAgIHBhcmVudC5yZW1vdmVDbGFzcyh0aGlzLnNldHRpbmdzLmVycm9yX2NsYXNzKTtcbiAgICAgICAgICAgIGlmIChsYWJlbC5sZW5ndGggPiAwICYmIHRoaXMuc2V0dGluZ3MuZXJyb3JfbGFiZWxzKSB7XG4gICAgICAgICAgICAgIGxhYmVsLnJlbW92ZUNsYXNzKHRoaXMuc2V0dGluZ3MuZXJyb3JfY2xhc3MpLnJlbW92ZUF0dHIoJ3JvbGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICQoZWwpLnRyaWdnZXJIYW5kbGVyKCd2YWxpZCcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLlMoZWwpLmF0dHIodGhpcy5pbnZhbGlkX2F0dHIsICcnKTtcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSgnYXJpYS1pbnZhbGlkJywgJ3RydWUnKTtcblxuICAgICAgICAgICAgLy8gVHJ5IHRvIGZpbmQgdGhlIGVycm9yIGFzc29jaWF0ZWQgd2l0aCB0aGUgaW5wdXRcbiAgICAgICAgICAgIHZhciBlcnJvckVsZW0gPSBwYXJlbnQuZmluZCgnc21hbGwuJyArIHRoaXMuc2V0dGluZ3MuZXJyb3JfY2xhc3MsICdzcGFuLicgKyB0aGlzLnNldHRpbmdzLmVycm9yX2NsYXNzKTtcbiAgICAgICAgICAgIHZhciBlcnJvcklEID0gZXJyb3JFbGVtLmxlbmd0aCA+IDAgPyBlcnJvckVsZW1bMF0uaWQgOiAnJztcbiAgICAgICAgICAgIGlmIChlcnJvcklELmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKCdhcmlhLWRlc2NyaWJlZGJ5JywgZXJyb3JJRCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGVsLnNldEF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScsICQoZWwpLmZpbmQoJy5lcnJvcicpWzBdLmlkKTtcbiAgICAgICAgICAgIHBhcmVudC5hZGRDbGFzcyh0aGlzLnNldHRpbmdzLmVycm9yX2NsYXNzKTtcbiAgICAgICAgICAgIGlmIChsYWJlbC5sZW5ndGggPiAwICYmIHRoaXMuc2V0dGluZ3MuZXJyb3JfbGFiZWxzKSB7XG4gICAgICAgICAgICAgIGxhYmVsLmFkZENsYXNzKHRoaXMuc2V0dGluZ3MuZXJyb3JfY2xhc3MpLmF0dHIoJ3JvbGUnLCAnYWxlcnQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICQoZWwpLnRyaWdnZXJIYW5kbGVyKCdpbnZhbGlkJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhbGlkYXRpb25zID0gdmFsaWRhdGlvbnMuY29uY2F0KGVsX3ZhbGlkYXRpb25zKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWxpZGF0aW9ucztcbiAgICB9LFxuXG4gICAgdmFsaWRfY2hlY2tib3ggOiBmdW5jdGlvbiAoZWwsIHJlcXVpcmVkKSB7XG4gICAgICB2YXIgZWwgPSB0aGlzLlMoZWwpLFxuICAgICAgICAgIHZhbGlkID0gKGVsLmlzKCc6Y2hlY2tlZCcpIHx8ICFyZXF1aXJlZCB8fCBlbC5nZXQoMCkuZ2V0QXR0cmlidXRlKCdkaXNhYmxlZCcpKTtcblxuICAgICAgaWYgKHZhbGlkKSB7XG4gICAgICAgIGVsLnJlbW92ZUF0dHIodGhpcy5pbnZhbGlkX2F0dHIpLnBhcmVudCgpLnJlbW92ZUNsYXNzKHRoaXMuc2V0dGluZ3MuZXJyb3JfY2xhc3MpO1xuICAgICAgICAkKGVsKS50cmlnZ2VySGFuZGxlcigndmFsaWQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsLmF0dHIodGhpcy5pbnZhbGlkX2F0dHIsICcnKS5wYXJlbnQoKS5hZGRDbGFzcyh0aGlzLnNldHRpbmdzLmVycm9yX2NsYXNzKTtcbiAgICAgICAgJChlbCkudHJpZ2dlckhhbmRsZXIoJ2ludmFsaWQnKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZhbGlkO1xuICAgIH0sXG5cbiAgICB2YWxpZF9yYWRpbyA6IGZ1bmN0aW9uIChlbCwgcmVxdWlyZWQpIHtcbiAgICAgIHZhciBuYW1lID0gZWwuZ2V0QXR0cmlidXRlKCduYW1lJyksXG4gICAgICAgICAgZ3JvdXAgPSB0aGlzLlMoZWwpLmNsb3Nlc3QoJ1tkYXRhLScgKyB0aGlzLmF0dHJfbmFtZSh0cnVlKSArICddJykuZmluZChcIltuYW1lPSdcIiArIG5hbWUgKyBcIiddXCIpLFxuICAgICAgICAgIGNvdW50ID0gZ3JvdXAubGVuZ3RoLFxuICAgICAgICAgIHZhbGlkID0gZmFsc2UsXG4gICAgICAgICAgZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgICAgLy8gSGFzIHRvIGNvdW50IHVwIHRvIG1ha2Ugc3VyZSB0aGUgZm9jdXMgZ2V0cyBhcHBsaWVkIHRvIHRoZSB0b3AgZXJyb3JcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgaWYoIGdyb3VwW2ldLmdldEF0dHJpYnV0ZSgnZGlzYWJsZWQnKSApe1xuICAgICAgICAgICAgICAgIGRpc2FibGVkPXRydWU7XG4gICAgICAgICAgICAgICAgdmFsaWQ9dHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwW2ldLmNoZWNrZWQpe1xuICAgICAgICAgICAgICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoIGRpc2FibGVkICl7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgIC8vIEhhcyB0byBjb3VudCB1cCB0byBtYWtlIHN1cmUgdGhlIGZvY3VzIGdldHMgYXBwbGllZCB0byB0aGUgdG9wIGVycm9yXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgaWYgKHZhbGlkKSB7XG4gICAgICAgICAgdGhpcy5TKGdyb3VwW2ldKS5yZW1vdmVBdHRyKHRoaXMuaW52YWxpZF9hdHRyKS5wYXJlbnQoKS5yZW1vdmVDbGFzcyh0aGlzLnNldHRpbmdzLmVycm9yX2NsYXNzKTtcbiAgICAgICAgICAkKGdyb3VwW2ldKS50cmlnZ2VySGFuZGxlcigndmFsaWQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLlMoZ3JvdXBbaV0pLmF0dHIodGhpcy5pbnZhbGlkX2F0dHIsICcnKS5wYXJlbnQoKS5hZGRDbGFzcyh0aGlzLnNldHRpbmdzLmVycm9yX2NsYXNzKTtcbiAgICAgICAgICAkKGdyb3VwW2ldKS50cmlnZ2VySGFuZGxlcignaW52YWxpZCcpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB2YWxpZDtcbiAgICB9LFxuXG4gICAgdmFsaWRfZXF1YWwgOiBmdW5jdGlvbiAoZWwsIHJlcXVpcmVkLCBwYXJlbnQpIHtcbiAgICAgIHZhciBmcm9tICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsLmdldEF0dHJpYnV0ZSh0aGlzLmFkZF9uYW1lc3BhY2UoJ2RhdGEtZXF1YWx0bycpKSkudmFsdWUsXG4gICAgICAgICAgdG8gICAgPSBlbC52YWx1ZSxcbiAgICAgICAgICB2YWxpZCA9IChmcm9tID09PSB0byk7XG5cbiAgICAgIGlmICh2YWxpZCkge1xuICAgICAgICB0aGlzLlMoZWwpLnJlbW92ZUF0dHIodGhpcy5pbnZhbGlkX2F0dHIpO1xuICAgICAgICBwYXJlbnQucmVtb3ZlQ2xhc3ModGhpcy5zZXR0aW5ncy5lcnJvcl9jbGFzcyk7XG4gICAgICAgIGlmIChsYWJlbC5sZW5ndGggPiAwICYmIHNldHRpbmdzLmVycm9yX2xhYmVscykge1xuICAgICAgICAgIGxhYmVsLnJlbW92ZUNsYXNzKHRoaXMuc2V0dGluZ3MuZXJyb3JfY2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLlMoZWwpLmF0dHIodGhpcy5pbnZhbGlkX2F0dHIsICcnKTtcbiAgICAgICAgcGFyZW50LmFkZENsYXNzKHRoaXMuc2V0dGluZ3MuZXJyb3JfY2xhc3MpO1xuICAgICAgICBpZiAobGFiZWwubGVuZ3RoID4gMCAmJiBzZXR0aW5ncy5lcnJvcl9sYWJlbHMpIHtcbiAgICAgICAgICBsYWJlbC5hZGRDbGFzcyh0aGlzLnNldHRpbmdzLmVycm9yX2NsYXNzKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmFsaWQ7XG4gICAgfSxcblxuICAgIHZhbGlkX29uZW9mIDogZnVuY3Rpb24gKGVsLCByZXF1aXJlZCwgcGFyZW50LCBkb05vdFZhbGlkYXRlT3RoZXJzKSB7XG4gICAgICB2YXIgZWwgPSB0aGlzLlMoZWwpLFxuICAgICAgICBvdGhlcnMgPSB0aGlzLlMoJ1snICsgdGhpcy5hZGRfbmFtZXNwYWNlKCdkYXRhLW9uZW9mJykgKyAnXScpLFxuICAgICAgICB2YWxpZCA9IG90aGVycy5maWx0ZXIoJzpjaGVja2VkJykubGVuZ3RoID4gMDtcblxuICAgICAgaWYgKHZhbGlkKSB7XG4gICAgICAgIGVsLnJlbW92ZUF0dHIodGhpcy5pbnZhbGlkX2F0dHIpLnBhcmVudCgpLnJlbW92ZUNsYXNzKHRoaXMuc2V0dGluZ3MuZXJyb3JfY2xhc3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWwuYXR0cih0aGlzLmludmFsaWRfYXR0ciwgJycpLnBhcmVudCgpLmFkZENsYXNzKHRoaXMuc2V0dGluZ3MuZXJyb3JfY2xhc3MpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWRvTm90VmFsaWRhdGVPdGhlcnMpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgb3RoZXJzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIF90aGlzLnZhbGlkX29uZW9mLmNhbGwoX3RoaXMsIHRoaXMsIG51bGwsIG51bGwsIHRydWUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZhbGlkO1xuICAgIH0sXG5cbiAgICByZWZsb3cgOiBmdW5jdGlvbihzY29wZSwgb3B0aW9ucykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIGZvcm0gPSBzZWxmLlMoJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddJykuYXR0cignbm92YWxpZGF0ZScsICdub3ZhbGlkYXRlJyk7XG4gICAgICAgICAgc2VsZi5TKGZvcm0pLmVhY2goZnVuY3Rpb24gKGlkeCwgZWwpIHtcbiAgICAgICAgICAgIHNlbGYuZXZlbnRzKGVsKTtcbiAgICAgICAgICB9KTtcbiAgICB9XG4gIH07XG59KGpRdWVyeSwgd2luZG93LCB3aW5kb3cuZG9jdW1lbnQpKTtcbiIsIjsoZnVuY3Rpb24gKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgRm91bmRhdGlvbi5saWJzLmFjY29yZGlvbiA9IHtcbiAgICBuYW1lIDogJ2FjY29yZGlvbicsXG5cbiAgICB2ZXJzaW9uIDogJzUuNS4xJyxcblxuICAgIHNldHRpbmdzIDoge1xuICAgICAgY29udGVudF9jbGFzcyA6ICdjb250ZW50JyxcbiAgICAgIGFjdGl2ZV9jbGFzcyA6ICdhY3RpdmUnLFxuICAgICAgbXVsdGlfZXhwYW5kIDogZmFsc2UsXG4gICAgICB0b2dnbGVhYmxlIDogdHJ1ZSxcbiAgICAgIGNhbGxiYWNrIDogZnVuY3Rpb24gKCkge31cbiAgICB9LFxuXG4gICAgaW5pdCA6IGZ1bmN0aW9uIChzY29wZSwgbWV0aG9kLCBvcHRpb25zKSB7XG4gICAgICB0aGlzLmJpbmRpbmdzKG1ldGhvZCwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIGV2ZW50cyA6IGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIFMgPSB0aGlzLlM7XG4gICAgICBzZWxmLmNyZWF0ZSh0aGlzLlMoaW5zdGFuY2UpKTtcblxuICAgICAgUyh0aGlzLnNjb3BlKVxuICAgICAgLm9mZignLmZuZHRuLmFjY29yZGlvbicpXG4gICAgICAub24oJ2NsaWNrLmZuZHRuLmFjY29yZGlvbicsICdbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnXSA+IGRkID4gYSwgWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10gPiBsaSA+IGEnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgYWNjb3JkaW9uID0gUyh0aGlzKS5jbG9zZXN0KCdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnXScpLFxuICAgICAgICAgICAgZ3JvdXBTZWxlY3RvciA9IHNlbGYuYXR0cl9uYW1lKCkgKyAnPScgKyBhY2NvcmRpb24uYXR0cihzZWxmLmF0dHJfbmFtZSgpKSxcbiAgICAgICAgICAgIHNldHRpbmdzID0gYWNjb3JkaW9uLmRhdGEoc2VsZi5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKSB8fCBzZWxmLnNldHRpbmdzLFxuICAgICAgICAgICAgdGFyZ2V0ID0gUygnIycgKyB0aGlzLmhyZWYuc3BsaXQoJyMnKVsxXSksXG4gICAgICAgICAgICBhdW50cyA9ICQoJz4gZGQsID4gbGknLCBhY2NvcmRpb24pLFxuICAgICAgICAgICAgc2libGluZ3MgPSBhdW50cy5jaGlsZHJlbignLicgKyBzZXR0aW5ncy5jb250ZW50X2NsYXNzKSxcbiAgICAgICAgICAgIGFjdGl2ZV9jb250ZW50ID0gc2libGluZ3MuZmlsdGVyKCcuJyArIHNldHRpbmdzLmFjdGl2ZV9jbGFzcyk7XG5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGlmIChhY2NvcmRpb24uYXR0cihzZWxmLmF0dHJfbmFtZSgpKSkge1xuICAgICAgICAgIHNpYmxpbmdzID0gc2libGluZ3MuYWRkKCdbJyArIGdyb3VwU2VsZWN0b3IgKyAnXSBkZCA+ICcgKyAnLicgKyBzZXR0aW5ncy5jb250ZW50X2NsYXNzICsgJywgWycgKyBncm91cFNlbGVjdG9yICsgJ10gbGkgPiAnICsgJy4nICsgc2V0dGluZ3MuY29udGVudF9jbGFzcyk7XG4gICAgICAgICAgYXVudHMgPSBhdW50cy5hZGQoJ1snICsgZ3JvdXBTZWxlY3RvciArICddIGRkLCBbJyArIGdyb3VwU2VsZWN0b3IgKyAnXSBsaScpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLnRvZ2dsZWFibGUgJiYgdGFyZ2V0LmlzKGFjdGl2ZV9jb250ZW50KSkge1xuICAgICAgICAgIHRhcmdldC5wYXJlbnQoJ2RkLCBsaScpLnRvZ2dsZUNsYXNzKHNldHRpbmdzLmFjdGl2ZV9jbGFzcywgZmFsc2UpO1xuICAgICAgICAgIHRhcmdldC50b2dnbGVDbGFzcyhzZXR0aW5ncy5hY3RpdmVfY2xhc3MsIGZhbHNlKTtcbiAgICAgICAgICBTKHRoaXMpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmdW5jdGlvbihpLCBhdHRyKXtcbiAgICAgICAgICAgICAgcmV0dXJuIGF0dHIgPT09ICd0cnVlJyA/ICdmYWxzZScgOiAndHJ1ZSc7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgc2V0dGluZ3MuY2FsbGJhY2sodGFyZ2V0KTtcbiAgICAgICAgICB0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3RvZ2dsZWQnLCBbYWNjb3JkaW9uXSk7XG4gICAgICAgICAgYWNjb3JkaW9uLnRyaWdnZXJIYW5kbGVyKCd0b2dnbGVkJywgW3RhcmdldF0pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc2V0dGluZ3MubXVsdGlfZXhwYW5kKSB7XG4gICAgICAgICAgc2libGluZ3MucmVtb3ZlQ2xhc3Moc2V0dGluZ3MuYWN0aXZlX2NsYXNzKTtcbiAgICAgICAgICBhdW50cy5yZW1vdmVDbGFzcyhzZXR0aW5ncy5hY3RpdmVfY2xhc3MpO1xuICAgICAgICAgIGF1bnRzLmNoaWxkcmVuKCdhJykuYXR0cignYXJpYS1leHBhbmRlZCcsJ2ZhbHNlJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0YXJnZXQuYWRkQ2xhc3Moc2V0dGluZ3MuYWN0aXZlX2NsYXNzKS5wYXJlbnQoKS5hZGRDbGFzcyhzZXR0aW5ncy5hY3RpdmVfY2xhc3MpO1xuICAgICAgICBzZXR0aW5ncy5jYWxsYmFjayh0YXJnZXQpO1xuICAgICAgICB0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3RvZ2dsZWQnLCBbYWNjb3JkaW9uXSk7XG4gICAgICAgIGFjY29yZGlvbi50cmlnZ2VySGFuZGxlcigndG9nZ2xlZCcsIFt0YXJnZXRdKTtcbiAgICAgICAgUyh0aGlzKS5hdHRyKCdhcmlhLWV4cGFuZGVkJywndHJ1ZScpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZTogZnVuY3Rpb24oJGluc3RhbmNlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgYWNjb3JkaW9uID0gJGluc3RhbmNlLFxuICAgICAgICAgIGF1bnRzID0gJCgnPiAuYWNjb3JkaW9uLW5hdmlnYXRpb24nLCBhY2NvcmRpb24pLFxuICAgICAgICAgIHNldHRpbmdzID0gYWNjb3JkaW9uLmRhdGEoc2VsZi5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKSB8fCBzZWxmLnNldHRpbmdzO1xuXG4gICAgICBhdW50cy5jaGlsZHJlbignYScpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCdmYWxzZScpO1xuICAgICAgYXVudHMuaGFzKCcuJyArIHNldHRpbmdzLmNvbnRlbnRfY2xhc3MgKyAnLicgKyBzZXR0aW5ncy5hY3RpdmVfY2xhc3MpLmNoaWxkcmVuKCdhJykuYXR0cignYXJpYS1leHBhbmRlZCcsJ3RydWUnKTtcblxuICAgICAgaWYgKHNldHRpbmdzLm11bHRpX2V4cGFuZCkge1xuICAgICAgICAkaW5zdGFuY2UuYXR0cignYXJpYS1tdWx0aXNlbGVjdGFibGUnLCd0cnVlJyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG9mZiA6IGZ1bmN0aW9uICgpIHt9LFxuXG4gICAgcmVmbG93IDogZnVuY3Rpb24gKCkge31cbiAgfTtcbn0oalF1ZXJ5LCB3aW5kb3csIHdpbmRvdy5kb2N1bWVudCkpO1xuIiwiOyhmdW5jdGlvbiAoJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBGb3VuZGF0aW9uLmxpYnMuYWxlcnQgPSB7XG4gICAgbmFtZSA6ICdhbGVydCcsXG5cbiAgICB2ZXJzaW9uIDogJzUuNS4xJyxcblxuICAgIHNldHRpbmdzIDoge1xuICAgICAgY2FsbGJhY2sgOiBmdW5jdGlvbiAoKSB7fVxuICAgIH0sXG5cbiAgICBpbml0IDogZnVuY3Rpb24gKHNjb3BlLCBtZXRob2QsIG9wdGlvbnMpIHtcbiAgICAgIHRoaXMuYmluZGluZ3MobWV0aG9kLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgZXZlbnRzIDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIFMgPSB0aGlzLlM7XG5cbiAgICAgICQodGhpcy5zY29wZSkub2ZmKCcuYWxlcnQnKS5vbignY2xpY2suZm5kdG4uYWxlcnQnLCAnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10gLmNsb3NlJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIGFsZXJ0Qm94ID0gUyh0aGlzKS5jbG9zZXN0KCdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnXScpLFxuICAgICAgICAgICAgc2V0dGluZ3MgPSBhbGVydEJveC5kYXRhKHNlbGYuYXR0cl9uYW1lKHRydWUpICsgJy1pbml0JykgfHwgc2VsZi5zZXR0aW5ncztcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChNb2Rlcm5penIuY3NzdHJhbnNpdGlvbnMpIHtcbiAgICAgICAgICBhbGVydEJveC5hZGRDbGFzcygnYWxlcnQtY2xvc2UnKTtcbiAgICAgICAgICBhbGVydEJveC5vbigndHJhbnNpdGlvbmVuZCB3ZWJraXRUcmFuc2l0aW9uRW5kIG9UcmFuc2l0aW9uRW5kJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIFModGhpcykudHJpZ2dlcignY2xvc2UuZm5kdG4uYWxlcnQnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIHNldHRpbmdzLmNhbGxiYWNrKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWxlcnRCb3guZmFkZU91dCgzMDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIFModGhpcykudHJpZ2dlcignY2xvc2UuZm5kdG4uYWxlcnQnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIHNldHRpbmdzLmNhbGxiYWNrKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICByZWZsb3cgOiBmdW5jdGlvbiAoKSB7fVxuICB9O1xufShqUXVlcnksIHdpbmRvdywgd2luZG93LmRvY3VtZW50KSk7XG4iLCI7KGZ1bmN0aW9uICgkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIEZvdW5kYXRpb24ubGlicy5jbGVhcmluZyA9IHtcbiAgICBuYW1lIDogJ2NsZWFyaW5nJyxcblxuICAgIHZlcnNpb24gOiAnNS41LjEnLFxuXG4gICAgc2V0dGluZ3MgOiB7XG4gICAgICB0ZW1wbGF0ZXMgOiB7XG4gICAgICAgIHZpZXdpbmcgOiAnPGEgaHJlZj1cIiNcIiBjbGFzcz1cImNsZWFyaW5nLWNsb3NlXCI+JnRpbWVzOzwvYT4nICtcbiAgICAgICAgICAnPGRpdiBjbGFzcz1cInZpc2libGUtaW1nXCIgc3R5bGU9XCJkaXNwbGF5OiBub25lXCI+PGRpdiBjbGFzcz1cImNsZWFyaW5nLXRvdWNoLWxhYmVsXCI+PC9kaXY+PGltZyBzcmM9XCJkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUFEL0FDd0FBQUFBQVFBQkFBQUNBRHMlM0RcIiBhbHQ9XCJcIiAvPicgK1xuICAgICAgICAgICc8cCBjbGFzcz1cImNsZWFyaW5nLWNhcHRpb25cIj48L3A+PGEgaHJlZj1cIiNcIiBjbGFzcz1cImNsZWFyaW5nLW1haW4tcHJldlwiPjxzcGFuPjwvc3Bhbj48L2E+JyArXG4gICAgICAgICAgJzxhIGhyZWY9XCIjXCIgY2xhc3M9XCJjbGVhcmluZy1tYWluLW5leHRcIj48c3Bhbj48L3NwYW4+PC9hPjwvZGl2PidcbiAgICAgIH0sXG5cbiAgICAgIC8vIGNvbW1hIGRlbGltaXRlZCBsaXN0IG9mIHNlbGVjdG9ycyB0aGF0LCBvbiBjbGljaywgd2lsbCBjbG9zZSBjbGVhcmluZyxcbiAgICAgIC8vIGFkZCAnZGl2LmNsZWFyaW5nLWJsYWNrb3V0LCBkaXYudmlzaWJsZS1pbWcnIHRvIGNsb3NlIG9uIGJhY2tncm91bmQgY2xpY2tcbiAgICAgIGNsb3NlX3NlbGVjdG9ycyA6ICcuY2xlYXJpbmctY2xvc2UsIGRpdi5jbGVhcmluZy1ibGFja291dCcsXG5cbiAgICAgIC8vIERlZmF1bHQgdG8gdGhlIGVudGlyZSBsaSBlbGVtZW50LlxuICAgICAgb3Blbl9zZWxlY3RvcnMgOiAnJyxcblxuICAgICAgLy8gSW1hZ2Ugd2lsbCBiZSBza2lwcGVkIGluIGNhcm91c2VsLlxuICAgICAgc2tpcF9zZWxlY3RvciA6ICcnLFxuXG4gICAgICB0b3VjaF9sYWJlbCA6ICcnLFxuXG4gICAgICAvLyBldmVudCBpbml0aWFsaXplcnMgYW5kIGxvY2tzXG4gICAgICBpbml0IDogZmFsc2UsXG4gICAgICBsb2NrZWQgOiBmYWxzZVxuICAgIH0sXG5cbiAgICBpbml0IDogZnVuY3Rpb24gKHNjb3BlLCBtZXRob2QsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIEZvdW5kYXRpb24uaW5oZXJpdCh0aGlzLCAndGhyb3R0bGUgaW1hZ2VfbG9hZGVkJyk7XG5cbiAgICAgIHRoaXMuYmluZGluZ3MobWV0aG9kLCBvcHRpb25zKTtcblxuICAgICAgaWYgKHNlbGYuUyh0aGlzLnNjb3BlKS5pcygnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10nKSkge1xuICAgICAgICB0aGlzLmFzc2VtYmxlKHNlbGYuUygnbGknLCB0aGlzLnNjb3BlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLlMoJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddJywgdGhpcy5zY29wZSkuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2VsZi5hc3NlbWJsZShzZWxmLlMoJ2xpJywgdGhpcykpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZXZlbnRzIDogZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgUyA9IHNlbGYuUyxcbiAgICAgICAgICAkc2Nyb2xsX2NvbnRhaW5lciA9ICQoJy5zY3JvbGwtY29udGFpbmVyJyk7XG5cbiAgICAgIGlmICgkc2Nyb2xsX2NvbnRhaW5lci5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuc2NvcGUgPSAkc2Nyb2xsX2NvbnRhaW5lcjtcbiAgICAgIH1cblxuICAgICAgUyh0aGlzLnNjb3BlKVxuICAgICAgICAub2ZmKCcuY2xlYXJpbmcnKVxuICAgICAgICAub24oJ2NsaWNrLmZuZHRuLmNsZWFyaW5nJywgJ3VsWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10gbGkgJyArIHRoaXMuc2V0dGluZ3Mub3Blbl9zZWxlY3RvcnMsXG4gICAgICAgICAgZnVuY3Rpb24gKGUsIGN1cnJlbnQsIHRhcmdldCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnQgPSBjdXJyZW50IHx8IFModGhpcyksXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IGN1cnJlbnQsXG4gICAgICAgICAgICAgICAgbmV4dCA9IGN1cnJlbnQubmV4dCgnbGknKSxcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IGN1cnJlbnQuY2xvc2VzdCgnWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJ10nKS5kYXRhKHNlbGYuYXR0cl9uYW1lKHRydWUpICsgJy1pbml0JyksXG4gICAgICAgICAgICAgICAgaW1hZ2UgPSBTKGUudGFyZ2V0KTtcblxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAoIXNldHRpbmdzKSB7XG4gICAgICAgICAgICAgIHNlbGYuaW5pdCgpO1xuICAgICAgICAgICAgICBzZXR0aW5ncyA9IGN1cnJlbnQuY2xvc2VzdCgnWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJ10nKS5kYXRhKHNlbGYuYXR0cl9uYW1lKHRydWUpICsgJy1pbml0Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIGNsZWFyaW5nIGlzIG9wZW4gYW5kIHRoZSBjdXJyZW50IGltYWdlIGlzXG4gICAgICAgICAgICAvLyBjbGlja2VkLCBnbyB0byB0aGUgbmV4dCBpbWFnZSBpbiBzZXF1ZW5jZVxuICAgICAgICAgICAgaWYgKHRhcmdldC5oYXNDbGFzcygndmlzaWJsZScpICYmXG4gICAgICAgICAgICAgIGN1cnJlbnRbMF0gPT09IHRhcmdldFswXSAmJlxuICAgICAgICAgICAgICBuZXh0Lmxlbmd0aCA+IDAgJiYgc2VsZi5pc19vcGVuKGN1cnJlbnQpKSB7XG4gICAgICAgICAgICAgIHRhcmdldCA9IG5leHQ7XG4gICAgICAgICAgICAgIGltYWdlID0gUygnaW1nJywgdGFyZ2V0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc2V0IGN1cnJlbnQgYW5kIHRhcmdldCB0byB0aGUgY2xpY2tlZCBsaSBpZiBub3Qgb3RoZXJ3aXNlIGRlZmluZWQuXG4gICAgICAgICAgICBzZWxmLm9wZW4oaW1hZ2UsIGN1cnJlbnQsIHRhcmdldCk7XG4gICAgICAgICAgICBzZWxmLnVwZGF0ZV9wYWRkbGVzKHRhcmdldCk7XG4gICAgICAgICAgfSlcblxuICAgICAgICAub24oJ2NsaWNrLmZuZHRuLmNsZWFyaW5nJywgJy5jbGVhcmluZy1tYWluLW5leHQnLFxuICAgICAgICAgIGZ1bmN0aW9uIChlKSB7IHNlbGYubmF2KGUsICduZXh0JykgfSlcbiAgICAgICAgLm9uKCdjbGljay5mbmR0bi5jbGVhcmluZycsICcuY2xlYXJpbmctbWFpbi1wcmV2JyxcbiAgICAgICAgICBmdW5jdGlvbiAoZSkgeyBzZWxmLm5hdihlLCAncHJldicpIH0pXG4gICAgICAgIC5vbignY2xpY2suZm5kdG4uY2xlYXJpbmcnLCB0aGlzLnNldHRpbmdzLmNsb3NlX3NlbGVjdG9ycyxcbiAgICAgICAgICBmdW5jdGlvbiAoZSkgeyBGb3VuZGF0aW9uLmxpYnMuY2xlYXJpbmcuY2xvc2UoZSwgdGhpcykgfSk7XG5cbiAgICAgICQoZG9jdW1lbnQpLm9uKCdrZXlkb3duLmZuZHRuLmNsZWFyaW5nJyxcbiAgICAgICAgICBmdW5jdGlvbiAoZSkgeyBzZWxmLmtleWRvd24oZSkgfSk7XG5cbiAgICAgIFMod2luZG93KS5vZmYoJy5jbGVhcmluZycpLm9uKCdyZXNpemUuZm5kdG4uY2xlYXJpbmcnLFxuICAgICAgICBmdW5jdGlvbiAoKSB7IHNlbGYucmVzaXplKCkgfSk7XG5cbiAgICAgIHRoaXMuc3dpcGVfZXZlbnRzKHNjb3BlKTtcbiAgICB9LFxuXG4gICAgc3dpcGVfZXZlbnRzIDogZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBTID0gc2VsZi5TO1xuXG4gICAgICBTKHRoaXMuc2NvcGUpXG4gICAgICAgIC5vbigndG91Y2hzdGFydC5mbmR0bi5jbGVhcmluZycsICcudmlzaWJsZS1pbWcnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGlmICghZS50b3VjaGVzKSB7IGUgPSBlLm9yaWdpbmFsRXZlbnQ7IH1cbiAgICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBzdGFydF9wYWdlX3ggOiBlLnRvdWNoZXNbMF0ucGFnZVgsXG4gICAgICAgICAgICAgICAgc3RhcnRfcGFnZV95IDogZS50b3VjaGVzWzBdLnBhZ2VZLFxuICAgICAgICAgICAgICAgIHN0YXJ0X3RpbWUgOiAobmV3IERhdGUoKSkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgIGRlbHRhX3ggOiAwLFxuICAgICAgICAgICAgICAgIGlzX3Njcm9sbGluZyA6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgUyh0aGlzKS5kYXRhKCdzd2lwZS10cmFuc2l0aW9uJywgZGF0YSk7XG4gICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCd0b3VjaG1vdmUuZm5kdG4uY2xlYXJpbmcnLCAnLnZpc2libGUtaW1nJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBpZiAoIWUudG91Y2hlcykge1xuICAgICAgICAgICAgZSA9IGUub3JpZ2luYWxFdmVudDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gSWdub3JlIHBpbmNoL3pvb20gZXZlbnRzXG4gICAgICAgICAgaWYgKGUudG91Y2hlcy5sZW5ndGggPiAxIHx8IGUuc2NhbGUgJiYgZS5zY2FsZSAhPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBkYXRhID0gUyh0aGlzKS5kYXRhKCdzd2lwZS10cmFuc2l0aW9uJyk7XG5cbiAgICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBkYXRhID0ge307XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZGF0YS5kZWx0YV94ID0gZS50b3VjaGVzWzBdLnBhZ2VYIC0gZGF0YS5zdGFydF9wYWdlX3g7XG5cbiAgICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwpIHtcbiAgICAgICAgICAgIGRhdGEuZGVsdGFfeCA9IC1kYXRhLmRlbHRhX3g7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHR5cGVvZiBkYXRhLmlzX3Njcm9sbGluZyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGRhdGEuaXNfc2Nyb2xsaW5nID0gISEoIGRhdGEuaXNfc2Nyb2xsaW5nIHx8IE1hdGguYWJzKGRhdGEuZGVsdGFfeCkgPCBNYXRoLmFicyhlLnRvdWNoZXNbMF0ucGFnZVkgLSBkYXRhLnN0YXJ0X3BhZ2VfeSkgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIWRhdGEuaXNfc2Nyb2xsaW5nICYmICFkYXRhLmFjdGl2ZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdmFyIGRpcmVjdGlvbiA9IChkYXRhLmRlbHRhX3ggPCAwKSA/ICduZXh0JyA6ICdwcmV2JztcbiAgICAgICAgICAgIGRhdGEuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlbGYubmF2KGUsIGRpcmVjdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAub24oJ3RvdWNoZW5kLmZuZHRuLmNsZWFyaW5nJywgJy52aXNpYmxlLWltZycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgUyh0aGlzKS5kYXRhKCdzd2lwZS10cmFuc2l0aW9uJywge30pO1xuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhc3NlbWJsZSA6IGZ1bmN0aW9uICgkbGkpIHtcbiAgICAgIHZhciAkZWwgPSAkbGkucGFyZW50KCk7XG5cbiAgICAgIGlmICgkZWwucGFyZW50KCkuaGFzQ2xhc3MoJ2Nhcm91c2VsJykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAkZWwuYWZ0ZXIoJzxkaXYgaWQ9XCJmb3VuZGF0aW9uQ2xlYXJpbmdIb2xkZXJcIj48L2Rpdj4nKTtcblxuICAgICAgdmFyIGdyaWQgPSAkZWwuZGV0YWNoKCksXG4gICAgICAgICAgZ3JpZF9vdXRlckhUTUwgPSAnJztcblxuICAgICAgaWYgKGdyaWRbMF0gPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBncmlkX291dGVySFRNTCA9IGdyaWRbMF0ub3V0ZXJIVE1MO1xuICAgICAgfVxuXG4gICAgICB2YXIgaG9sZGVyID0gdGhpcy5TKCcjZm91bmRhdGlvbkNsZWFyaW5nSG9sZGVyJyksXG4gICAgICAgICAgc2V0dGluZ3MgPSAkZWwuZGF0YSh0aGlzLmF0dHJfbmFtZSh0cnVlKSArICctaW5pdCcpLFxuICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICBncmlkIDogJzxkaXYgY2xhc3M9XCJjYXJvdXNlbFwiPicgKyBncmlkX291dGVySFRNTCArICc8L2Rpdj4nLFxuICAgICAgICAgICAgdmlld2luZyA6IHNldHRpbmdzLnRlbXBsYXRlcy52aWV3aW5nXG4gICAgICAgICAgfSxcbiAgICAgICAgICB3cmFwcGVyID0gJzxkaXYgY2xhc3M9XCJjbGVhcmluZy1hc3NlbWJsZWRcIj48ZGl2PicgKyBkYXRhLnZpZXdpbmcgK1xuICAgICAgICAgICAgZGF0YS5ncmlkICsgJzwvZGl2PjwvZGl2PicsXG4gICAgICAgICAgdG91Y2hfbGFiZWwgPSB0aGlzLnNldHRpbmdzLnRvdWNoX2xhYmVsO1xuXG4gICAgICBpZiAoTW9kZXJuaXpyLnRvdWNoKSB7XG4gICAgICAgIHdyYXBwZXIgPSAkKHdyYXBwZXIpLmZpbmQoJy5jbGVhcmluZy10b3VjaC1sYWJlbCcpLmh0bWwodG91Y2hfbGFiZWwpLmVuZCgpO1xuICAgICAgfVxuXG4gICAgICBob2xkZXIuYWZ0ZXIod3JhcHBlcikucmVtb3ZlKCk7XG4gICAgfSxcblxuICAgIG9wZW4gOiBmdW5jdGlvbiAoJGltYWdlLCBjdXJyZW50LCB0YXJnZXQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICBib2R5ID0gJChkb2N1bWVudC5ib2R5KSxcbiAgICAgICAgICByb290ID0gdGFyZ2V0LmNsb3Nlc3QoJy5jbGVhcmluZy1hc3NlbWJsZWQnKSxcbiAgICAgICAgICBjb250YWluZXIgPSBzZWxmLlMoJ2RpdicsIHJvb3QpLmZpcnN0KCksXG4gICAgICAgICAgdmlzaWJsZV9pbWFnZSA9IHNlbGYuUygnLnZpc2libGUtaW1nJywgY29udGFpbmVyKSxcbiAgICAgICAgICBpbWFnZSA9IHNlbGYuUygnaW1nJywgdmlzaWJsZV9pbWFnZSkubm90KCRpbWFnZSksXG4gICAgICAgICAgbGFiZWwgPSBzZWxmLlMoJy5jbGVhcmluZy10b3VjaC1sYWJlbCcsIGNvbnRhaW5lciksXG4gICAgICAgICAgZXJyb3IgPSBmYWxzZTtcblxuICAgICAgLy8gRXZlbnQgdG8gZGlzYWJsZSBzY3JvbGxpbmcgb24gdG91Y2ggZGV2aWNlcyB3aGVuIENsZWFyaW5nIGlzIGFjdGl2YXRlZFxuICAgICAgJCgnYm9keScpLm9uKCd0b3VjaG1vdmUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9KTtcblxuICAgICAgaW1hZ2UuZXJyb3IoZnVuY3Rpb24gKCkge1xuICAgICAgICBlcnJvciA9IHRydWU7XG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gc3RhcnRMb2FkKCkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGlzLmltYWdlX2xvYWRlZChpbWFnZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGltYWdlLm91dGVyV2lkdGgoKSA9PT0gMSAmJiAhZXJyb3IpIHtcbiAgICAgICAgICAgICAgc3RhcnRMb2FkLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjYi5jYWxsKHRoaXMsIGltYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9LmJpbmQodGhpcyksIDEwMCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNiIChpbWFnZSkge1xuICAgICAgICB2YXIgJGltYWdlID0gJChpbWFnZSk7XG4gICAgICAgICRpbWFnZS5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgICAgICAkaW1hZ2UudHJpZ2dlcignaW1hZ2VWaXNpYmxlJyk7XG4gICAgICAgIC8vIHRvZ2dsZSB0aGUgZ2FsbGVyeVxuICAgICAgICBib2R5LmNzcygnb3ZlcmZsb3cnLCAnaGlkZGVuJyk7XG4gICAgICAgIHJvb3QuYWRkQ2xhc3MoJ2NsZWFyaW5nLWJsYWNrb3V0Jyk7XG4gICAgICAgIGNvbnRhaW5lci5hZGRDbGFzcygnY2xlYXJpbmctY29udGFpbmVyJyk7XG4gICAgICAgIHZpc2libGVfaW1hZ2Uuc2hvdygpO1xuICAgICAgICB0aGlzLmZpeF9oZWlnaHQodGFyZ2V0KVxuICAgICAgICAgIC5jYXB0aW9uKHNlbGYuUygnLmNsZWFyaW5nLWNhcHRpb24nLCB2aXNpYmxlX2ltYWdlKSwgc2VsZi5TKCdpbWcnLCB0YXJnZXQpKVxuICAgICAgICAgIC5jZW50ZXJfYW5kX2xhYmVsKGltYWdlLCBsYWJlbClcbiAgICAgICAgICAuc2hpZnQoY3VycmVudCwgdGFyZ2V0LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0YXJnZXQuY2xvc2VzdCgnbGknKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCd2aXNpYmxlJyk7XG4gICAgICAgICAgICB0YXJnZXQuY2xvc2VzdCgnbGknKS5hZGRDbGFzcygndmlzaWJsZScpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB2aXNpYmxlX2ltYWdlLnRyaWdnZXIoJ29wZW5lZC5mbmR0bi5jbGVhcmluZycpXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5sb2NrZWQoKSkge1xuICAgICAgICB2aXNpYmxlX2ltYWdlLnRyaWdnZXIoJ29wZW4uZm5kdG4uY2xlYXJpbmcnKTtcbiAgICAgICAgLy8gc2V0IHRoZSBpbWFnZSB0byB0aGUgc2VsZWN0ZWQgdGh1bWJuYWlsXG4gICAgICAgIGltYWdlXG4gICAgICAgICAgLmF0dHIoJ3NyYycsIHRoaXMubG9hZCgkaW1hZ2UpKVxuICAgICAgICAgIC5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG5cbiAgICAgICAgc3RhcnRMb2FkLmNhbGwodGhpcyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNsb3NlIDogZnVuY3Rpb24gKGUsIGVsKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHZhciByb290ID0gKGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmICgvYmxhY2tvdXQvLnRlc3QodGFyZ2V0LnNlbGVjdG9yKSkge1xuICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5jbG9zZXN0KCcuY2xlYXJpbmctYmxhY2tvdXQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KCQoZWwpKSksXG4gICAgICAgICAgYm9keSA9ICQoZG9jdW1lbnQuYm9keSksIGNvbnRhaW5lciwgdmlzaWJsZV9pbWFnZTtcblxuICAgICAgaWYgKGVsID09PSBlLnRhcmdldCAmJiByb290KSB7XG4gICAgICAgIGJvZHkuY3NzKCdvdmVyZmxvdycsICcnKTtcbiAgICAgICAgY29udGFpbmVyID0gJCgnZGl2Jywgcm9vdCkuZmlyc3QoKTtcbiAgICAgICAgdmlzaWJsZV9pbWFnZSA9ICQoJy52aXNpYmxlLWltZycsIGNvbnRhaW5lcik7XG4gICAgICAgIHZpc2libGVfaW1hZ2UudHJpZ2dlcignY2xvc2UuZm5kdG4uY2xlYXJpbmcnKTtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5wcmV2X2luZGV4ID0gMDtcbiAgICAgICAgJCgndWxbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnXScsIHJvb3QpXG4gICAgICAgICAgLmF0dHIoJ3N0eWxlJywgJycpLmNsb3Nlc3QoJy5jbGVhcmluZy1ibGFja291dCcpXG4gICAgICAgICAgLnJlbW92ZUNsYXNzKCdjbGVhcmluZy1ibGFja291dCcpO1xuICAgICAgICBjb250YWluZXIucmVtb3ZlQ2xhc3MoJ2NsZWFyaW5nLWNvbnRhaW5lcicpO1xuICAgICAgICB2aXNpYmxlX2ltYWdlLmhpZGUoKTtcbiAgICAgICAgdmlzaWJsZV9pbWFnZS50cmlnZ2VyKCdjbG9zZWQuZm5kdG4uY2xlYXJpbmcnKTtcbiAgICAgIH1cblxuICAgICAgLy8gRXZlbnQgdG8gcmUtZW5hYmxlIHNjcm9sbGluZyBvbiB0b3VjaCBkZXZpY2VzXG4gICAgICAkKCdib2R5Jykub2ZmKCd0b3VjaG1vdmUnKTtcblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBpc19vcGVuIDogZnVuY3Rpb24gKGN1cnJlbnQpIHtcbiAgICAgIHJldHVybiBjdXJyZW50LnBhcmVudCgpLnByb3AoJ3N0eWxlJykubGVuZ3RoID4gMDtcbiAgICB9LFxuXG4gICAga2V5ZG93biA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgY2xlYXJpbmcgPSAkKCcuY2xlYXJpbmctYmxhY2tvdXQgdWxbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnXScpLFxuICAgICAgICAgIE5FWFRfS0VZID0gdGhpcy5ydGwgPyAzNyA6IDM5LFxuICAgICAgICAgIFBSRVZfS0VZID0gdGhpcy5ydGwgPyAzOSA6IDM3LFxuICAgICAgICAgIEVTQ19LRVkgPSAyNztcblxuICAgICAgaWYgKGUud2hpY2ggPT09IE5FWFRfS0VZKSB7XG4gICAgICAgIHRoaXMuZ28oY2xlYXJpbmcsICduZXh0Jyk7XG4gICAgICB9XG4gICAgICBpZiAoZS53aGljaCA9PT0gUFJFVl9LRVkpIHtcbiAgICAgICAgdGhpcy5nbyhjbGVhcmluZywgJ3ByZXYnKTtcbiAgICAgIH1cbiAgICAgIGlmIChlLndoaWNoID09PSBFU0NfS0VZKSB7XG4gICAgICAgIHRoaXMuUygnYS5jbGVhcmluZy1jbG9zZScpLnRyaWdnZXIoJ2NsaWNrLmZuZHRuLmNsZWFyaW5nJyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG5hdiA6IGZ1bmN0aW9uIChlLCBkaXJlY3Rpb24pIHtcbiAgICAgIHZhciBjbGVhcmluZyA9ICQoJ3VsWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10nLCAnLmNsZWFyaW5nLWJsYWNrb3V0Jyk7XG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRoaXMuZ28oY2xlYXJpbmcsIGRpcmVjdGlvbik7XG4gICAgfSxcblxuICAgIHJlc2l6ZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpbWFnZSA9ICQoJ2ltZycsICcuY2xlYXJpbmctYmxhY2tvdXQgLnZpc2libGUtaW1nJyksXG4gICAgICAgICAgbGFiZWwgPSAkKCcuY2xlYXJpbmctdG91Y2gtbGFiZWwnLCAnLmNsZWFyaW5nLWJsYWNrb3V0Jyk7XG5cbiAgICAgIGlmIChpbWFnZS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5jZW50ZXJfYW5kX2xhYmVsKGltYWdlLCBsYWJlbCk7XG4gICAgICAgIGltYWdlLnRyaWdnZXIoJ3Jlc2l6ZWQuZm5kdG4uY2xlYXJpbmcnKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyB2aXN1YWwgYWRqdXN0bWVudHNcbiAgICBmaXhfaGVpZ2h0IDogZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgdmFyIGxpcyA9IHRhcmdldC5wYXJlbnQoKS5jaGlsZHJlbigpLFxuICAgICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgICBsaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBsaSA9IHNlbGYuUyh0aGlzKSxcbiAgICAgICAgICAgIGltYWdlID0gbGkuZmluZCgnaW1nJyk7XG5cbiAgICAgICAgaWYgKGxpLmhlaWdodCgpID4gaW1hZ2Uub3V0ZXJIZWlnaHQoKSkge1xuICAgICAgICAgIGxpLmFkZENsYXNzKCdmaXgtaGVpZ2h0Jyk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2xvc2VzdCgndWwnKVxuICAgICAgLndpZHRoKGxpcy5sZW5ndGggKiAxMDAgKyAnJScpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgdXBkYXRlX3BhZGRsZXMgOiBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICB0YXJnZXQgPSB0YXJnZXQuY2xvc2VzdCgnbGknKTtcbiAgICAgIHZhciB2aXNpYmxlX2ltYWdlID0gdGFyZ2V0XG4gICAgICAgIC5jbG9zZXN0KCcuY2Fyb3VzZWwnKVxuICAgICAgICAuc2libGluZ3MoJy52aXNpYmxlLWltZycpO1xuXG4gICAgICBpZiAodGFyZ2V0Lm5leHQoKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuUygnLmNsZWFyaW5nLW1haW4tbmV4dCcsIHZpc2libGVfaW1hZ2UpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5TKCcuY2xlYXJpbmctbWFpbi1uZXh0JywgdmlzaWJsZV9pbWFnZSkuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0YXJnZXQucHJldigpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5TKCcuY2xlYXJpbmctbWFpbi1wcmV2JywgdmlzaWJsZV9pbWFnZSkucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLlMoJy5jbGVhcmluZy1tYWluLXByZXYnLCB2aXNpYmxlX2ltYWdlKS5hZGRDbGFzcygnZGlzYWJsZWQnKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY2VudGVyX2FuZF9sYWJlbCA6IGZ1bmN0aW9uICh0YXJnZXQsIGxhYmVsKSB7XG4gICAgICBpZiAoIXRoaXMucnRsICYmIGxhYmVsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGFiZWwuY3NzKHtcbiAgICAgICAgICBtYXJnaW5MZWZ0IDogLShsYWJlbC5vdXRlcldpZHRoKCkgLyAyKSxcbiAgICAgICAgICBtYXJnaW5Ub3AgOiAtKHRhcmdldC5vdXRlckhlaWdodCgpIC8gMiktbGFiZWwub3V0ZXJIZWlnaHQoKS0xMFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxhYmVsLmNzcyh7XG4gICAgICAgICAgbWFyZ2luUmlnaHQgOiAtKGxhYmVsLm91dGVyV2lkdGgoKSAvIDIpLFxuICAgICAgICAgIG1hcmdpblRvcCA6IC0odGFyZ2V0Lm91dGVySGVpZ2h0KCkgLyAyKS1sYWJlbC5vdXRlckhlaWdodCgpLTEwLFxuICAgICAgICAgIGxlZnQ6ICdhdXRvJyxcbiAgICAgICAgICByaWdodDogJzUwJSdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gaW1hZ2UgbG9hZGluZyBhbmQgcHJlbG9hZGluZ1xuXG4gICAgbG9hZCA6IGZ1bmN0aW9uICgkaW1hZ2UpIHtcbiAgICAgIHZhciBocmVmO1xuXG4gICAgICBpZiAoJGltYWdlWzBdLm5vZGVOYW1lID09PSAnQScpIHtcbiAgICAgICAgaHJlZiA9ICRpbWFnZS5hdHRyKCdocmVmJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBocmVmID0gJGltYWdlLmNsb3Nlc3QoJ2EnKS5hdHRyKCdocmVmJyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucHJlbG9hZCgkaW1hZ2UpO1xuXG4gICAgICBpZiAoaHJlZikge1xuICAgICAgICByZXR1cm4gaHJlZjtcbiAgICAgIH1cbiAgICAgIHJldHVybiAkaW1hZ2UuYXR0cignc3JjJyk7XG4gICAgfSxcblxuICAgIHByZWxvYWQgOiBmdW5jdGlvbiAoJGltYWdlKSB7XG4gICAgICB0aGlzXG4gICAgICAgIC5pbWcoJGltYWdlLmNsb3Nlc3QoJ2xpJykubmV4dCgpKVxuICAgICAgICAuaW1nKCRpbWFnZS5jbG9zZXN0KCdsaScpLnByZXYoKSk7XG4gICAgfSxcblxuICAgIGltZyA6IGZ1bmN0aW9uIChpbWcpIHtcbiAgICAgIGlmIChpbWcubGVuZ3RoKSB7XG4gICAgICAgIHZhciBuZXdfaW1nID0gbmV3IEltYWdlKCksXG4gICAgICAgICAgICBuZXdfYSA9IHRoaXMuUygnYScsIGltZyk7XG5cbiAgICAgICAgaWYgKG5ld19hLmxlbmd0aCkge1xuICAgICAgICAgIG5ld19pbWcuc3JjID0gbmV3X2EuYXR0cignaHJlZicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ld19pbWcuc3JjID0gdGhpcy5TKCdpbWcnLCBpbWcpLmF0dHIoJ3NyYycpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gaW1hZ2UgY2FwdGlvblxuXG4gICAgY2FwdGlvbiA6IGZ1bmN0aW9uIChjb250YWluZXIsICRpbWFnZSkge1xuICAgICAgdmFyIGNhcHRpb24gPSAkaW1hZ2UuYXR0cignZGF0YS1jYXB0aW9uJyk7XG5cbiAgICAgIGlmIChjYXB0aW9uKSB7XG4gICAgICAgIGNvbnRhaW5lclxuICAgICAgICAgIC5odG1sKGNhcHRpb24pXG4gICAgICAgICAgLnNob3coKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRhaW5lclxuICAgICAgICAgIC50ZXh0KCcnKVxuICAgICAgICAgIC5oaWRlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gZGlyZWN0aW9uYWwgbWV0aG9kc1xuXG4gICAgZ28gOiBmdW5jdGlvbiAoJHVsLCBkaXJlY3Rpb24pIHtcbiAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5TKCcudmlzaWJsZScsICR1bCksXG4gICAgICAgICAgdGFyZ2V0ID0gY3VycmVudFtkaXJlY3Rpb25dKCk7XG5cbiAgICAgIC8vIENoZWNrIGZvciBza2lwIHNlbGVjdG9yLlxuICAgICAgaWYgKHRoaXMuc2V0dGluZ3Muc2tpcF9zZWxlY3RvciAmJiB0YXJnZXQuZmluZCh0aGlzLnNldHRpbmdzLnNraXBfc2VsZWN0b3IpLmxlbmd0aCAhPSAwKSB7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldFtkaXJlY3Rpb25dKCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0YXJnZXQubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuUygnaW1nJywgdGFyZ2V0KVxuICAgICAgICAgIC50cmlnZ2VyKCdjbGljay5mbmR0bi5jbGVhcmluZycsIFtjdXJyZW50LCB0YXJnZXRdKVxuICAgICAgICAgIC50cmlnZ2VyKCdjaGFuZ2UuZm5kdG4uY2xlYXJpbmcnKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc2hpZnQgOiBmdW5jdGlvbiAoY3VycmVudCwgdGFyZ2V0LCBjYWxsYmFjaykge1xuICAgICAgdmFyIGNsZWFyaW5nID0gdGFyZ2V0LnBhcmVudCgpLFxuICAgICAgICAgIG9sZF9pbmRleCA9IHRoaXMuc2V0dGluZ3MucHJldl9pbmRleCB8fCB0YXJnZXQuaW5kZXgoKSxcbiAgICAgICAgICBkaXJlY3Rpb24gPSB0aGlzLmRpcmVjdGlvbihjbGVhcmluZywgY3VycmVudCwgdGFyZ2V0KSxcbiAgICAgICAgICBkaXIgPSB0aGlzLnJ0bCA/ICdyaWdodCcgOiAnbGVmdCcsXG4gICAgICAgICAgbGVmdCA9IHBhcnNlSW50KGNsZWFyaW5nLmNzcygnbGVmdCcpLCAxMCksXG4gICAgICAgICAgd2lkdGggPSB0YXJnZXQub3V0ZXJXaWR0aCgpLFxuICAgICAgICAgIHNraXBfc2hpZnQ7XG5cbiAgICAgIHZhciBkaXJfb2JqID0ge307XG5cbiAgICAgIC8vIHdlIHVzZSBqUXVlcnkgYW5pbWF0ZSBpbnN0ZWFkIG9mIENTUyB0cmFuc2l0aW9ucyBiZWNhdXNlIHdlXG4gICAgICAvLyBuZWVkIGEgY2FsbGJhY2sgdG8gdW5sb2NrIHRoZSBuZXh0IGFuaW1hdGlvblxuICAgICAgLy8gbmVlZHMgc3VwcG9ydCBmb3IgUlRMICoqXG4gICAgICBpZiAodGFyZ2V0LmluZGV4KCkgIT09IG9sZF9pbmRleCAmJiAhL3NraXAvLnRlc3QoZGlyZWN0aW9uKSkge1xuICAgICAgICBpZiAoL2xlZnQvLnRlc3QoZGlyZWN0aW9uKSkge1xuICAgICAgICAgIHRoaXMubG9jaygpO1xuICAgICAgICAgIGRpcl9vYmpbZGlyXSA9IGxlZnQgKyB3aWR0aDtcbiAgICAgICAgICBjbGVhcmluZy5hbmltYXRlKGRpcl9vYmosIDMwMCwgdGhpcy51bmxvY2soKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoL3JpZ2h0Ly50ZXN0KGRpcmVjdGlvbikpIHtcbiAgICAgICAgICB0aGlzLmxvY2soKTtcbiAgICAgICAgICBkaXJfb2JqW2Rpcl0gPSBsZWZ0IC0gd2lkdGg7XG4gICAgICAgICAgY2xlYXJpbmcuYW5pbWF0ZShkaXJfb2JqLCAzMDAsIHRoaXMudW5sb2NrKCkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKC9za2lwLy50ZXN0KGRpcmVjdGlvbikpIHtcbiAgICAgICAgLy8gdGhlIHRhcmdldCBpbWFnZSBpcyBub3QgYWRqYWNlbnQgdG8gdGhlIGN1cnJlbnQgaW1hZ2UsIHNvXG4gICAgICAgIC8vIGRvIHdlIHNjcm9sbCByaWdodCBvciBub3RcbiAgICAgICAgc2tpcF9zaGlmdCA9IHRhcmdldC5pbmRleCgpIC0gdGhpcy5zZXR0aW5ncy51cF9jb3VudDtcbiAgICAgICAgdGhpcy5sb2NrKCk7XG5cbiAgICAgICAgaWYgKHNraXBfc2hpZnQgPiAwKSB7XG4gICAgICAgICAgZGlyX29ialtkaXJdID0gLShza2lwX3NoaWZ0ICogd2lkdGgpO1xuICAgICAgICAgIGNsZWFyaW5nLmFuaW1hdGUoZGlyX29iaiwgMzAwLCB0aGlzLnVubG9jaygpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkaXJfb2JqW2Rpcl0gPSAwO1xuICAgICAgICAgIGNsZWFyaW5nLmFuaW1hdGUoZGlyX29iaiwgMzAwLCB0aGlzLnVubG9jaygpKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjYWxsYmFjaygpO1xuICAgIH0sXG5cbiAgICBkaXJlY3Rpb24gOiBmdW5jdGlvbiAoJGVsLCBjdXJyZW50LCB0YXJnZXQpIHtcbiAgICAgIHZhciBsaXMgPSB0aGlzLlMoJ2xpJywgJGVsKSxcbiAgICAgICAgICBsaV93aWR0aCA9IGxpcy5vdXRlcldpZHRoKCkgKyAobGlzLm91dGVyV2lkdGgoKSAvIDQpLFxuICAgICAgICAgIHVwX2NvdW50ID0gTWF0aC5mbG9vcih0aGlzLlMoJy5jbGVhcmluZy1jb250YWluZXInKS5vdXRlcldpZHRoKCkgLyBsaV93aWR0aCkgLSAxLFxuICAgICAgICAgIHRhcmdldF9pbmRleCA9IGxpcy5pbmRleCh0YXJnZXQpLFxuICAgICAgICAgIHJlc3BvbnNlO1xuXG4gICAgICB0aGlzLnNldHRpbmdzLnVwX2NvdW50ID0gdXBfY291bnQ7XG5cbiAgICAgIGlmICh0aGlzLmFkamFjZW50KHRoaXMuc2V0dGluZ3MucHJldl9pbmRleCwgdGFyZ2V0X2luZGV4KSkge1xuICAgICAgICBpZiAoKHRhcmdldF9pbmRleCA+IHVwX2NvdW50KSAmJiB0YXJnZXRfaW5kZXggPiB0aGlzLnNldHRpbmdzLnByZXZfaW5kZXgpIHtcbiAgICAgICAgICByZXNwb25zZSA9ICdyaWdodCc7XG4gICAgICAgIH0gZWxzZSBpZiAoKHRhcmdldF9pbmRleCA+IHVwX2NvdW50IC0gMSkgJiYgdGFyZ2V0X2luZGV4IDw9IHRoaXMuc2V0dGluZ3MucHJldl9pbmRleCkge1xuICAgICAgICAgIHJlc3BvbnNlID0gJ2xlZnQnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3BvbnNlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3BvbnNlID0gJ3NraXAnO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNldHRpbmdzLnByZXZfaW5kZXggPSB0YXJnZXRfaW5kZXg7XG5cbiAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9LFxuXG4gICAgYWRqYWNlbnQgOiBmdW5jdGlvbiAoY3VycmVudF9pbmRleCwgdGFyZ2V0X2luZGV4KSB7XG4gICAgICBmb3IgKHZhciBpID0gdGFyZ2V0X2luZGV4ICsgMTsgaSA+PSB0YXJnZXRfaW5kZXggLSAxOyBpLS0pIHtcbiAgICAgICAgaWYgKGkgPT09IGN1cnJlbnRfaW5kZXgpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICAvLyBsb2NrIG1hbmFnZW1lbnRcblxuICAgIGxvY2sgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldHRpbmdzLmxvY2tlZCA9IHRydWU7XG4gICAgfSxcblxuICAgIHVubG9jayA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2V0dGluZ3MubG9ja2VkID0gZmFsc2U7XG4gICAgfSxcblxuICAgIGxvY2tlZCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldHRpbmdzLmxvY2tlZDtcbiAgICB9LFxuXG4gICAgb2ZmIDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5TKHRoaXMuc2NvcGUpLm9mZignLmZuZHRuLmNsZWFyaW5nJyk7XG4gICAgICB0aGlzLlMod2luZG93KS5vZmYoJy5mbmR0bi5jbGVhcmluZycpO1xuICAgIH0sXG5cbiAgICByZWZsb3cgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG4gIH07XG5cbn0oalF1ZXJ5LCB3aW5kb3csIHdpbmRvdy5kb2N1bWVudCkpO1xuIiwiOyhmdW5jdGlvbiAoJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBGb3VuZGF0aW9uLmxpYnMuZHJvcGRvd24gPSB7XG4gICAgbmFtZSA6ICdkcm9wZG93bicsXG5cbiAgICB2ZXJzaW9uIDogJzUuNS4xJyxcblxuICAgIHNldHRpbmdzIDoge1xuICAgICAgYWN0aXZlX2NsYXNzIDogJ29wZW4nLFxuICAgICAgZGlzYWJsZWRfY2xhc3MgOiAnZGlzYWJsZWQnLFxuICAgICAgbWVnYV9jbGFzcyA6ICdtZWdhJyxcbiAgICAgIGFsaWduIDogJ2JvdHRvbScsXG4gICAgICBwaXAgOiAnZGVmYXVsdCcsXG4gICAgICBpc19ob3ZlciA6IGZhbHNlLFxuICAgICAgaG92ZXJfdGltZW91dCA6IDE1MCxcbiAgICAgIG9wZW5lZCA6IGZ1bmN0aW9uICgpIHt9LFxuICAgICAgY2xvc2VkIDogZnVuY3Rpb24gKCkge31cbiAgICB9LFxuXG4gICAgaW5pdCA6IGZ1bmN0aW9uIChzY29wZSwgbWV0aG9kLCBvcHRpb25zKSB7XG4gICAgICBGb3VuZGF0aW9uLmluaGVyaXQodGhpcywgJ3Rocm90dGxlJyk7XG5cbiAgICAgICQuZXh0ZW5kKHRydWUsIHRoaXMuc2V0dGluZ3MsIG1ldGhvZCwgb3B0aW9ucyk7XG4gICAgICB0aGlzLmJpbmRpbmdzKG1ldGhvZCwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIGV2ZW50cyA6IGZ1bmN0aW9uIChzY29wZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIFMgPSBzZWxmLlM7XG5cbiAgICAgIFModGhpcy5zY29wZSlcbiAgICAgICAgLm9mZignLmRyb3Bkb3duJylcbiAgICAgICAgLm9uKCdjbGljay5mbmR0bi5kcm9wZG93bicsICdbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgdmFyIHNldHRpbmdzID0gUyh0aGlzKS5kYXRhKHNlbGYuYXR0cl9uYW1lKHRydWUpICsgJy1pbml0JykgfHwgc2VsZi5zZXR0aW5ncztcbiAgICAgICAgICBpZiAoIXNldHRpbmdzLmlzX2hvdmVyIHx8IE1vZGVybml6ci50b3VjaCkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKFModGhpcykucGFyZW50KCdbZGF0YS1yZXZlYWwtaWRdJykpIHtcbiAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYudG9nZ2xlKCQodGhpcykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdtb3VzZWVudGVyLmZuZHRuLmRyb3Bkb3duJywgJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddLCBbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnLWNvbnRlbnRdJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICB2YXIgJHRoaXMgPSBTKHRoaXMpLFxuICAgICAgICAgICAgICBkcm9wZG93bixcbiAgICAgICAgICAgICAgdGFyZ2V0O1xuXG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYudGltZW91dCk7XG5cbiAgICAgICAgICBpZiAoJHRoaXMuZGF0YShzZWxmLmRhdGFfYXR0cigpKSkge1xuICAgICAgICAgICAgZHJvcGRvd24gPSBTKCcjJyArICR0aGlzLmRhdGEoc2VsZi5kYXRhX2F0dHIoKSkpO1xuICAgICAgICAgICAgdGFyZ2V0ID0gJHRoaXM7XG4gICAgICAgICAgICBzZWxmLmxhc3RfdGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkcm9wZG93biA9ICR0aGlzO1xuXG4gICAgICAgICAgICBpZiAoc2VsZi5sYXN0X3RhcmdldCkge1xuICAgICAgICAgICAgICB0YXJnZXQgPSBzZWxmLmxhc3RfdGFyZ2V0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGFyZ2V0ID0gUyhcIltcIiArIHNlbGYuYXR0cl9uYW1lKCkgKyBcIj0nXCIgKyBkcm9wZG93bi5hdHRyKCdpZCcpICsgXCInXVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgc2V0dGluZ3MgPSB0YXJnZXQuZGF0YShzZWxmLmF0dHJfbmFtZSh0cnVlKSArICctaW5pdCcpIHx8IHNlbGYuc2V0dGluZ3M7XG5cbiAgICAgICAgICBpZiAoUyhlLmN1cnJlbnRUYXJnZXQpLmRhdGEoc2VsZi5kYXRhX2F0dHIoKSkgJiYgc2V0dGluZ3MuaXNfaG92ZXIpIHtcbiAgICAgICAgICAgIHNlbGYuY2xvc2VhbGwuY2FsbChzZWxmKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2V0dGluZ3MuaXNfaG92ZXIpIHtcbiAgICAgICAgICAgIHNlbGYub3Blbi5hcHBseShzZWxmLCBbZHJvcGRvd24sIHRhcmdldF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdtb3VzZWxlYXZlLmZuZHRuLmRyb3Bkb3duJywgJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddLCBbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnLWNvbnRlbnRdJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICB2YXIgJHRoaXMgPSBTKHRoaXMpO1xuICAgICAgICAgIHZhciBzZXR0aW5ncztcblxuICAgICAgICAgIGlmICgkdGhpcy5kYXRhKHNlbGYuZGF0YV9hdHRyKCkpKSB7XG4gICAgICAgICAgICAgIHNldHRpbmdzID0gJHRoaXMuZGF0YShzZWxmLmRhdGFfYXR0cih0cnVlKSArICctaW5pdCcpIHx8IHNlbGYuc2V0dGluZ3M7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdmFyIHRhcmdldCAgID0gUygnWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJz1cIicgKyBTKHRoaXMpLmF0dHIoJ2lkJykgKyAnXCJdJyksXG4gICAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHRhcmdldC5kYXRhKHNlbGYuYXR0cl9uYW1lKHRydWUpICsgJy1pbml0JykgfHwgc2VsZi5zZXR0aW5ncztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICgkdGhpcy5kYXRhKHNlbGYuZGF0YV9hdHRyKCkpKSB7XG4gICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5pc19ob3Zlcikge1xuICAgICAgICAgICAgICAgIHNlbGYuY2xvc2UuY2FsbChzZWxmLCBTKCcjJyArICR0aGlzLmRhdGEoc2VsZi5kYXRhX2F0dHIoKSkpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLmlzX2hvdmVyKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jbG9zZS5jYWxsKHNlbGYsICR0aGlzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0uYmluZCh0aGlzKSwgc2V0dGluZ3MuaG92ZXJfdGltZW91dCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignY2xpY2suZm5kdG4uZHJvcGRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIHZhciBwYXJlbnQgPSBTKGUudGFyZ2V0KS5jbG9zZXN0KCdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnLWNvbnRlbnRdJyk7XG4gICAgICAgICAgdmFyIGxpbmtzICA9IHBhcmVudC5maW5kKCdhJyk7XG5cbiAgICAgICAgICBpZiAobGlua3MubGVuZ3RoID4gMCAmJiBwYXJlbnQuYXR0cignYXJpYS1hdXRvY2xvc2UnKSAhPT0gJ2ZhbHNlJykge1xuICAgICAgICAgICAgICBzZWxmLmNsb3NlLmNhbGwoc2VsZiwgUygnWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJy1jb250ZW50XScpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZS50YXJnZXQgIT09IGRvY3VtZW50ICYmICEkLmNvbnRhaW5zKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgZS50YXJnZXQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKFMoZS50YXJnZXQpLmNsb3Nlc3QoJ1snICsgc2VsZi5hdHRyX25hbWUoKSArICddJykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghKFMoZS50YXJnZXQpLmRhdGEoJ3JldmVhbElkJykpICYmXG4gICAgICAgICAgICAocGFyZW50Lmxlbmd0aCA+IDAgJiYgKFMoZS50YXJnZXQpLmlzKCdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnLWNvbnRlbnRdJykgfHxcbiAgICAgICAgICAgICAgJC5jb250YWlucyhwYXJlbnQuZmlyc3QoKVswXSwgZS50YXJnZXQpKSkpIHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5jbG9zZS5jYWxsKHNlbGYsIFMoJ1snICsgc2VsZi5hdHRyX25hbWUoKSArICctY29udGVudF0nKSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignb3BlbmVkLmZuZHRuLmRyb3Bkb3duJywgJ1snICsgc2VsZi5hdHRyX25hbWUoKSArICctY29udGVudF0nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2VsZi5zZXR0aW5ncy5vcGVuZWQuY2FsbCh0aGlzKTtcbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdjbG9zZWQuZm5kdG4uZHJvcGRvd24nLCAnWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJy1jb250ZW50XScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzZWxmLnNldHRpbmdzLmNsb3NlZC5jYWxsKHRoaXMpO1xuICAgICAgICB9KTtcblxuICAgICAgUyh3aW5kb3cpXG4gICAgICAgIC5vZmYoJy5kcm9wZG93bicpXG4gICAgICAgIC5vbigncmVzaXplLmZuZHRuLmRyb3Bkb3duJywgc2VsZi50aHJvdHRsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2VsZi5yZXNpemUuY2FsbChzZWxmKTtcbiAgICAgICAgfSwgNTApKTtcblxuICAgICAgdGhpcy5yZXNpemUoKTtcbiAgICB9LFxuXG4gICAgY2xvc2UgOiBmdW5jdGlvbiAoZHJvcGRvd24pIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIGRyb3Bkb3duLmVhY2goZnVuY3Rpb24gKGlkeCkge1xuICAgICAgICB2YXIgb3JpZ2luYWxfdGFyZ2V0ID0gJCgnWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJz0nICsgZHJvcGRvd25baWR4XS5pZCArICddJykgfHwgJCgnYXJpYS1jb250cm9scz0nICsgZHJvcGRvd25baWR4XS5pZCArICddJyk7XG4gICAgICAgIG9yaWdpbmFsX3RhcmdldC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XG4gICAgICAgIGlmIChzZWxmLlModGhpcykuaGFzQ2xhc3Moc2VsZi5zZXR0aW5ncy5hY3RpdmVfY2xhc3MpKSB7XG4gICAgICAgICAgc2VsZi5TKHRoaXMpXG4gICAgICAgICAgICAuY3NzKEZvdW5kYXRpb24ucnRsID8gJ3JpZ2h0JyA6ICdsZWZ0JywgJy05OTk5OXB4JylcbiAgICAgICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJylcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhzZWxmLnNldHRpbmdzLmFjdGl2ZV9jbGFzcylcbiAgICAgICAgICAgIC5wcmV2KCdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnXScpXG4gICAgICAgICAgICAucmVtb3ZlQ2xhc3Moc2VsZi5zZXR0aW5ncy5hY3RpdmVfY2xhc3MpXG4gICAgICAgICAgICAucmVtb3ZlRGF0YSgndGFyZ2V0Jyk7XG5cbiAgICAgICAgICBzZWxmLlModGhpcykudHJpZ2dlcignY2xvc2VkLmZuZHRuLmRyb3Bkb3duJywgW2Ryb3Bkb3duXSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgZHJvcGRvd24ucmVtb3ZlQ2xhc3MoJ2Ytb3Blbi0nICsgdGhpcy5hdHRyX25hbWUodHJ1ZSkpO1xuICAgIH0sXG5cbiAgICBjbG9zZWFsbCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICQuZWFjaChzZWxmLlMoJy5mLW9wZW4tJyArIHRoaXMuYXR0cl9uYW1lKHRydWUpKSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLmNsb3NlLmNhbGwoc2VsZiwgc2VsZi5TKHRoaXMpKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBvcGVuIDogZnVuY3Rpb24gKGRyb3Bkb3duLCB0YXJnZXQpIHtcbiAgICAgIHRoaXNcbiAgICAgICAgLmNzcyhkcm9wZG93blxuICAgICAgICAuYWRkQ2xhc3ModGhpcy5zZXR0aW5ncy5hY3RpdmVfY2xhc3MpLCB0YXJnZXQpO1xuICAgICAgZHJvcGRvd24ucHJldignWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10nKS5hZGRDbGFzcyh0aGlzLnNldHRpbmdzLmFjdGl2ZV9jbGFzcyk7XG4gICAgICBkcm9wZG93bi5kYXRhKCd0YXJnZXQnLCB0YXJnZXQuZ2V0KDApKS50cmlnZ2VyKCdvcGVuZWQuZm5kdG4uZHJvcGRvd24nLCBbZHJvcGRvd24sIHRhcmdldF0pO1xuICAgICAgZHJvcGRvd24uYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcbiAgICAgIHRhcmdldC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKTtcbiAgICAgIGRyb3Bkb3duLmZvY3VzKCk7XG4gICAgICBkcm9wZG93bi5hZGRDbGFzcygnZi1vcGVuLScgKyB0aGlzLmF0dHJfbmFtZSh0cnVlKSk7XG4gICAgfSxcblxuICAgIGRhdGFfYXR0ciA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLm5hbWVzcGFjZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWVzcGFjZSArICctJyArIHRoaXMubmFtZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgICB9LFxuXG4gICAgdG9nZ2xlIDogZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgaWYgKHRhcmdldC5oYXNDbGFzcyh0aGlzLnNldHRpbmdzLmRpc2FibGVkX2NsYXNzKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgZHJvcGRvd24gPSB0aGlzLlMoJyMnICsgdGFyZ2V0LmRhdGEodGhpcy5kYXRhX2F0dHIoKSkpO1xuICAgICAgaWYgKGRyb3Bkb3duLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAvLyBObyBkcm9wZG93biBmb3VuZCwgbm90IGNvbnRpbnVpbmdcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNsb3NlLmNhbGwodGhpcywgdGhpcy5TKCdbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnLWNvbnRlbnRdJykubm90KGRyb3Bkb3duKSk7XG5cbiAgICAgIGlmIChkcm9wZG93bi5oYXNDbGFzcyh0aGlzLnNldHRpbmdzLmFjdGl2ZV9jbGFzcykpIHtcbiAgICAgICAgdGhpcy5jbG9zZS5jYWxsKHRoaXMsIGRyb3Bkb3duKTtcbiAgICAgICAgaWYgKGRyb3Bkb3duLmRhdGEoJ3RhcmdldCcpICE9PSB0YXJnZXQuZ2V0KDApKSB7XG4gICAgICAgICAgdGhpcy5vcGVuLmNhbGwodGhpcywgZHJvcGRvd24sIHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMub3Blbi5jYWxsKHRoaXMsIGRyb3Bkb3duLCB0YXJnZXQpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICByZXNpemUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZHJvcGRvd24gPSB0aGlzLlMoJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICctY29udGVudF0ub3BlbicpO1xuICAgICAgdmFyIHRhcmdldCA9ICQoZHJvcGRvd24uZGF0YShcInRhcmdldFwiKSk7XG5cbiAgICAgIGlmIChkcm9wZG93bi5sZW5ndGggJiYgdGFyZ2V0Lmxlbmd0aCkge1xuICAgICAgICB0aGlzLmNzcyhkcm9wZG93biwgdGFyZ2V0KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY3NzIDogZnVuY3Rpb24gKGRyb3Bkb3duLCB0YXJnZXQpIHtcbiAgICAgIHZhciBsZWZ0X29mZnNldCA9IE1hdGgubWF4KCh0YXJnZXQud2lkdGgoKSAtIGRyb3Bkb3duLndpZHRoKCkpIC8gMiwgOCksXG4gICAgICAgICAgc2V0dGluZ3MgPSB0YXJnZXQuZGF0YSh0aGlzLmF0dHJfbmFtZSh0cnVlKSArICctaW5pdCcpIHx8IHRoaXMuc2V0dGluZ3MsXG4gICAgICAgICAgcGFyZW50T3ZlcmZsb3cgPSBkcm9wZG93bi5wYXJlbnQoKS5jc3MoJ292ZXJmbG93LXknKSB8fCBkcm9wZG93bi5wYXJlbnQoKS5jc3MoJ292ZXJmbG93Jyk7XG5cbiAgICAgIHRoaXMuY2xlYXJfaWR4KCk7XG5cblxuXG4gICAgICBpZiAodGhpcy5zbWFsbCgpKSB7XG4gICAgICAgIHZhciBwID0gdGhpcy5kaXJzLmJvdHRvbS5jYWxsKGRyb3Bkb3duLCB0YXJnZXQsIHNldHRpbmdzKTtcblxuICAgICAgICBkcm9wZG93bi5hdHRyKCdzdHlsZScsICcnKS5yZW1vdmVDbGFzcygnZHJvcC1sZWZ0IGRyb3AtcmlnaHQgZHJvcC10b3AnKS5jc3Moe1xuICAgICAgICAgIHBvc2l0aW9uIDogJ2Fic29sdXRlJyxcbiAgICAgICAgICB3aWR0aCA6ICc5NSUnLFxuICAgICAgICAgICdtYXgtd2lkdGgnIDogJ25vbmUnLFxuICAgICAgICAgIHRvcCA6IHAudG9wXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRyb3Bkb3duLmNzcyhGb3VuZGF0aW9uLnJ0bCA/ICdyaWdodCcgOiAnbGVmdCcsIGxlZnRfb2Zmc2V0KTtcbiAgICAgIH1cbiAgICAgIC8vIGRldGVjdCBpZiBkcm9wZG93biBpcyBpbiBhbiBvdmVyZmxvdyBjb250YWluZXJcbiAgICAgIGVsc2UgaWYgKHBhcmVudE92ZXJmbG93ICE9PSAndmlzaWJsZScpIHtcbiAgICAgICAgdmFyIG9mZnNldCA9IHRhcmdldFswXS5vZmZzZXRUb3AgKyB0YXJnZXRbMF0ub2Zmc2V0SGVpZ2h0O1xuXG4gICAgICAgIGRyb3Bkb3duLmF0dHIoJ3N0eWxlJywgJycpLmNzcyh7XG4gICAgICAgICAgcG9zaXRpb24gOiAnYWJzb2x1dGUnLFxuICAgICAgICAgIHRvcCA6IG9mZnNldFxuICAgICAgICB9KTtcblxuICAgICAgICBkcm9wZG93bi5jc3MoRm91bmRhdGlvbi5ydGwgPyAncmlnaHQnIDogJ2xlZnQnLCBsZWZ0X29mZnNldCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcblxuICAgICAgICB0aGlzLnN0eWxlKGRyb3Bkb3duLCB0YXJnZXQsIHNldHRpbmdzKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRyb3Bkb3duO1xuICAgIH0sXG5cbiAgICBzdHlsZSA6IGZ1bmN0aW9uIChkcm9wZG93biwgdGFyZ2V0LCBzZXR0aW5ncykge1xuICAgICAgdmFyIGNzcyA9ICQuZXh0ZW5kKHtwb3NpdGlvbiA6ICdhYnNvbHV0ZSd9LFxuICAgICAgICB0aGlzLmRpcnNbc2V0dGluZ3MuYWxpZ25dLmNhbGwoZHJvcGRvd24sIHRhcmdldCwgc2V0dGluZ3MpKTtcblxuICAgICAgZHJvcGRvd24uYXR0cignc3R5bGUnLCAnJykuY3NzKGNzcyk7XG4gICAgfSxcblxuICAgIC8vIHJldHVybiBDU1MgcHJvcGVydHkgb2JqZWN0XG4gICAgLy8gYHRoaXNgIGlzIHRoZSBkcm9wZG93blxuICAgIGRpcnMgOiB7XG4gICAgICAvLyBDYWxjdWxhdGUgdGFyZ2V0IG9mZnNldFxuICAgICAgX2Jhc2UgOiBmdW5jdGlvbiAodCkge1xuICAgICAgICB2YXIgb19wID0gdGhpcy5vZmZzZXRQYXJlbnQoKSxcbiAgICAgICAgICAgIG8gPSBvX3Aub2Zmc2V0KCksXG4gICAgICAgICAgICBwID0gdC5vZmZzZXQoKTtcblxuICAgICAgICBwLnRvcCAtPSBvLnRvcDtcbiAgICAgICAgcC5sZWZ0IC09IG8ubGVmdDtcblxuICAgICAgICAvL3NldCBzb21lIGZsYWdzIG9uIHRoZSBwIG9iamVjdCB0byBwYXNzIGFsb25nXG4gICAgICAgIHAubWlzc1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgIHAubWlzc1RvcCA9IGZhbHNlO1xuICAgICAgICBwLm1pc3NMZWZ0ID0gZmFsc2U7XG4gICAgICAgIHAubGVmdFJpZ2h0RmxhZyA9IGZhbHNlO1xuXG4gICAgICAgIC8vbGV0cyBzZWUgaWYgdGhlIHBhbmVsIHdpbGwgYmUgb2ZmIHRoZSBzY3JlZW5cbiAgICAgICAgLy9nZXQgdGhlIGFjdHVhbCB3aWR0aCBvZiB0aGUgcGFnZSBhbmQgc3RvcmUgaXRcbiAgICAgICAgcC5ib2R5V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3JvdycpWzBdKSB7XG4gICAgICAgICAgcC5ib2R5V2lkdGggPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdyb3cnKVswXS5jbGllbnRXaWR0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwO1xuICAgICAgfSxcblxuICAgICAgX3Bvc2l0aW9uX2JvdHRvbSA6IGZ1bmN0aW9uKGQsdCxzLHApIHtcbiAgICAgICAgaWYoZC5vdXRlcldpZHRoKCkgPiB0Lm91dGVyV2lkdGgoKSkge1xuICAgICAgICAgIC8vbWlzcyByaWdodFxuICAgICAgICAgIGlmIChwLmxlZnQgKyBkLm91dGVyV2lkdGgoKSA+IHAuYm9keVdpZHRoKSB7XG4gICAgICAgICAgICAvL21pc3MgbGVmdFxuICAgICAgICAgICAgaWYocC5sZWZ0IC0gKGQub3V0ZXJXaWR0aCgpIC0gdC5vdXRlcldpZHRoKCkpIDwgMCkge1xuICAgICAgICAgICAgICAvLyBzZXQgdHJpZ2dlcmVkIHJpZ2h0IGlmIHRoZSBkcm9wZG93biB3b24ndCBmaXQgaW5zaWRlIHRoZSBmaXJzdCAucm93XG4gICAgICAgICAgICAgIC8vIGluIGVpdGhlciB0aGUgbGVmdCBvciByaWdodCBvcmllbnRhdGlvbi5cbiAgICAgICAgICAgICAgcC50cmlnZ2VyZWRSaWdodCA9IHRydWU7XG4gICAgICAgICAgICAgIHAubWlzc0xlZnQgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcC5taXNzUmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0Lm91dGVyV2lkdGgoKSA+IGQub3V0ZXJXaWR0aCgpICYmIHMucGlwID09ICdjZW50ZXInKSB7XG4gICAgICAgICAgcC5vZmZzZXQgPSAodC5vdXRlcldpZHRoKCkgLSBkLm91dGVyV2lkdGgoKSkgLyAyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHAudHJpZ2dlcmVkUmlnaHQpIHtcbiAgICAgICAgICBpZihkLm91dGVyV2lkdGgoKSA8IHAuYm9keVdpZHRoKSB7XG4gICAgICAgICAgICBwLm9mZnNldCA9IChwLmJvZHlXaWR0aCAtIHAubGVmdCkgLSBkLm91dGVyV2lkdGgoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcC5vZmZzZXQgPSAtcC5sZWZ0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChwLm1pc3NSaWdodCB8fCBzZWxmLnJ0bCkge1xuICAgICAgICAgIHAub2Zmc2V0ID0gLWQub3V0ZXJXaWR0aCgpICsgdC5vdXRlcldpZHRoKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcC5vZmZzZXQgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHA7XG4gICAgICB9LFxuXG4gICAgICB0b3AgOiBmdW5jdGlvbiAodCwgcykge1xuICAgICAgICB2YXIgc2VsZiA9IEZvdW5kYXRpb24ubGlicy5kcm9wZG93bixcbiAgICAgICAgICAgIHAgPSBzZWxmLmRpcnMuX2Jhc2UuY2FsbCh0aGlzLCB0KSxcbiAgICAgICAgICAgIG9mZnNldFRvcCA9IC10aGlzLm91dGVySGVpZ2h0KCk7XG5cbiAgICAgICAgcCA9IHNlbGYuZGlycy5fcG9zaXRpb25fYm90dG9tKHRoaXMsdCxzLHApO1xuXG4gICAgICAgIHRoaXMuYWRkQ2xhc3MoJ2Ryb3AtdG9wJyk7XG5cbiAgICAgICAgLy9taXNzIHRvcFxuICAgICAgICBpZiAodC5vZmZzZXQoKS50b3AgPD0gdGhpcy5vdXRlckhlaWdodCgpKSB7XG4gICAgICAgICAgcC5taXNzVG9wID0gdHJ1ZTtcbiAgICAgICAgICBwLmxlZnRSaWdodEZsYWcgPSB0cnVlO1xuICAgICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoJ2Ryb3AtdG9wJyk7XG4gICAgICAgICAgb2Zmc2V0VG9wID0gdC5vdXRlckhlaWdodCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGYucnRsIHx8IHQub3V0ZXJXaWR0aCgpIDwgdGhpcy5vdXRlcldpZHRoKCkgfHwgc2VsZi5zbWFsbCgpIHx8IHRoaXMuaGFzQ2xhc3Mocy5tZWdhX21lbnUpKSB7XG4gICAgICAgICAgc2VsZi5hZGp1c3RfcGlwKHRoaXMsdCxzLHApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtsZWZ0IDogcC5sZWZ0ICsgcC5vZmZzZXQsIHRvcCA6IHAudG9wICsgb2Zmc2V0VG9wfTtcbiAgICAgIH0sXG5cbiAgICAgIGJvdHRvbSA6IGZ1bmN0aW9uICh0LCBzKSB7XG4gICAgICAgIHZhciBzZWxmID0gRm91bmRhdGlvbi5saWJzLmRyb3Bkb3duLFxuICAgICAgICAgICAgcCA9IHNlbGYuZGlycy5fYmFzZS5jYWxsKHRoaXMsIHQpO1xuICAgICAgICBcbiAgICAgICAgcCA9IHNlbGYuZGlycy5fcG9zaXRpb25fYm90dG9tKHRoaXMsdCxzLHApOyAgICAgICBcblxuICAgICAgICAvLyBJcyB0aGlzIGlmIHN0YXRlbWVudCByZWFsbHkgd29ydGggaXQ/XG4gICAgICAgIC8vIEkgYXNzdW1lIGl0IGlzIGhlcmUgdG8gYXZvaWQgdW5uZWNlc3Nhcnkgc2hlZXQuaW5zZXJ0UnVsZSBjYWxscywgYnV0IGhvdyBleHBlbnNpdmUgYXJlIHRoZXk/XG4gICAgICAgIGlmIChwLm9mZnNldCB8fCB0Lm91dGVyV2lkdGgoKSA8IHRoaXMub3V0ZXJXaWR0aCgpIHx8IHNlbGYuc21hbGwoKSB8fCB0aGlzLmhhc0NsYXNzKHMubWVnYV9tZW51KSkge1xuICAgICAgICAgIHNlbGYuYWRqdXN0X3BpcCh0aGlzLHQscyxwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7bGVmdCA6IHAubGVmdCArIHAub2Zmc2V0LCB0b3AgOiBwLnRvcCArIHQub3V0ZXJIZWlnaHQoKX07XG4gICAgICB9LFxuXG4gICAgICBsZWZ0IDogZnVuY3Rpb24gKHQsIHMpIHtcbiAgICAgICAgdmFyIHNlbGYgPSBGb3VuZGF0aW9uLmxpYnMuZHJvcGRvd24sXG4gICAgICAgICAgICBwID0gc2VsZi5kaXJzLl9iYXNlLmNhbGwodGhpcywgdCk7XG4gICAgICAgIHAub2Zmc2V0ID0gLXRoaXMub3V0ZXJXaWR0aCgpO1xuXG4gICAgICAgIHRoaXMuYWRkQ2xhc3MoJ2Ryb3AtbGVmdCcpO1xuXG4gICAgICAgIC8vbWlzcyBsZWZ0XG4gICAgICAgIGlmIChwLmxlZnQgLSB0aGlzLm91dGVyV2lkdGgoKSA8PSAwKSB7XG4gICAgICAgICAgcC5taXNzTGVmdCA9IHRydWU7XG4gICAgICAgICAgcC5taXNzUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICBwLnRvcCA9IHAudG9wICsgdC5vdXRlckhlaWdodCgpO1xuICAgICAgICAgIHRoaXMucmVtb3ZlQ2xhc3MoJ2Ryb3AtbGVmdCcpO1xuICAgICAgICAgIHAgPSBzZWxmLmRpcnMuX3Bvc2l0aW9uX2JvdHRvbSh0aGlzLHQscyxwKTtcbiAgICAgICAgICBzZWxmLmFkanVzdF9waXAodGhpcyx0LHMscCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5hZGp1c3RfcGlwX3ZlcnRpY2FsKHRoaXMsdCxzLHApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtsZWZ0IDogcC5sZWZ0ICsgcC5vZmZzZXQsIHRvcCA6IHAudG9wfTtcbiAgICAgIH0sXG5cbiAgICAgIHJpZ2h0IDogZnVuY3Rpb24gKHQsIHMpIHtcbiAgICAgICAgdmFyIHNlbGYgPSBGb3VuZGF0aW9uLmxpYnMuZHJvcGRvd24sXG4gICAgICAgICAgICBwID0gc2VsZi5kaXJzLl9iYXNlLmNhbGwodGhpcywgdCk7XG5cbiAgICAgICAgcC5vZmZzZXQgPSB0Lm91dGVyV2lkdGgoKTtcblxuICAgICAgICB0aGlzLmFkZENsYXNzKCdkcm9wLXJpZ2h0Jyk7XG5cbiAgICAgICAgLy9taXNzIHJpZ2h0XG4gICAgICAgIGlmIChwLmxlZnQgKyB0aGlzLm91dGVyV2lkdGgoKSArIHQub3V0ZXJXaWR0aCgpID4gcC5ib2R5V2lkdGgpIHtcbiAgICAgICAgICBwLm1pc3NSaWdodCA9IHRydWU7XG4gICAgICAgICAgcC5taXNzTGVmdCA9IGZhbHNlO1xuICAgICAgICAgIHAudG9wID0gcC50b3AgKyB0Lm91dGVySGVpZ2h0KCk7XG4gICAgICAgICAgdGhpcy5yZW1vdmVDbGFzcygnZHJvcC1yaWdodCcpO1xuICAgICAgICAgIHAgPSBzZWxmLmRpcnMuX3Bvc2l0aW9uX2JvdHRvbSh0aGlzLHQscyxwKTtcbiAgICAgICAgICBzZWxmLmFkanVzdF9waXAodGhpcyx0LHMscCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcC50cmlnZ2VyZWRSaWdodCA9IHRydWU7XG4gICAgICAgICAgc2VsZi5hZGp1c3RfcGlwX3ZlcnRpY2FsKHRoaXMsdCxzLHApO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlbGYgPSBGb3VuZGF0aW9uLmxpYnMuZHJvcGRvd247XG5cbiAgICAgICAgaWYgKHQub3V0ZXJXaWR0aCgpIDwgdGhpcy5vdXRlcldpZHRoKCkgfHwgc2VsZi5zbWFsbCgpIHx8IHRoaXMuaGFzQ2xhc3Mocy5tZWdhX21lbnUpKSB7XG4gICAgICAgICAgc2VsZi5hZGp1c3RfcGlwKHRoaXMsIHQsIHMsIHApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtsZWZ0IDogcC5sZWZ0ICsgdC5vdXRlcldpZHRoKCksIHRvcCA6IHAudG9wfTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gSW5zZXJ0IHJ1bGUgdG8gc3R5bGUgcHN1ZWRvIGVsZW1lbnRzXG4gICAgYWRqdXN0X3BpcCA6IGZ1bmN0aW9uIChkcm9wZG93biwgdGFyZ2V0LCBzZXR0aW5ncywgcG9zaXRpb24pIHtcbiAgICAgIHZhciBzaGVldCA9IEZvdW5kYXRpb24uc3R5bGVzaGVldCxcbiAgICAgICAgICBwaXBfb2Zmc2V0X2Jhc2UgPSA4O1xuXG4gICAgICBpZiAoZHJvcGRvd24uaGFzQ2xhc3Moc2V0dGluZ3MubWVnYV9jbGFzcykpIHtcbiAgICAgICAgcGlwX29mZnNldF9iYXNlID0gcG9zaXRpb24ubGVmdCArICh0YXJnZXQub3V0ZXJXaWR0aCgpLzIpIC0gODtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHRoaXMuc21hbGwoKSkge1xuICAgICAgICBwaXBfb2Zmc2V0X2Jhc2UgPSBwb3NpdGlvbi5sZWZ0O1xuICAgICAgICBpZiAoc2V0dGluZ3MucGlwID09ICdjZW50ZXInKSB7XG4gICAgICAgICAgcGlwX29mZnNldF9iYXNlICs9ICh0YXJnZXQub3V0ZXJXaWR0aCgpLzIpIC0gMTU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHNldHRpbmdzLnBpcCA9PSAnY2VudGVyJykge1xuICAgICAgICBpZih0YXJnZXQub3V0ZXJXaWR0aCgpIDwgZHJvcGRvd24ub3V0ZXJXaWR0aCgpKXtcbiAgICAgICAgICBwaXBfb2Zmc2V0X2Jhc2UgPSAodGFyZ2V0Lm91dGVyV2lkdGgoKS8yKSAtIHBvc2l0aW9uLm9mZnNldCAtIDc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGlwX29mZnNldF9iYXNlID0gKGRyb3Bkb3duLm91dGVyV2lkdGgoKS8yKSAtIDc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHBvc2l0aW9uLm1pc3NSaWdodCkge1xuICAgICAgICBwaXBfb2Zmc2V0X2Jhc2UgKz0gdGFyZ2V0Lm91dGVyV2lkdGgoKSAtIDMwO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnJ1bGVfaWR4ID0gc2hlZXQuY3NzUnVsZXMubGVuZ3RoO1xuXG4gICAgICAvL2RlZmF1bHRcbiAgICAgIHZhciBzZWxfYmVmb3JlID0gJy5mLWRyb3Bkb3duLm9wZW46YmVmb3JlJyxcbiAgICAgICAgICBzZWxfYWZ0ZXIgID0gJy5mLWRyb3Bkb3duLm9wZW46YWZ0ZXInLFxuICAgICAgICAgIGNzc19iZWZvcmUgPSAnbGVmdDogJyArIHBpcF9vZmZzZXRfYmFzZSArICdweDsnLFxuICAgICAgICAgIGNzc19hZnRlciAgPSAnbGVmdDogJyArIChwaXBfb2Zmc2V0X2Jhc2UgLSAxKSArICdweDsnO1xuXG4gICAgICBpZiAoc2hlZXQuaW5zZXJ0UnVsZSkge1xuICAgICAgICBzaGVldC5pbnNlcnRSdWxlKFtzZWxfYmVmb3JlLCAneycsIGNzc19iZWZvcmUsICd9J10uam9pbignICcpLCB0aGlzLnJ1bGVfaWR4KTtcbiAgICAgICAgc2hlZXQuaW5zZXJ0UnVsZShbc2VsX2FmdGVyLCAneycsIGNzc19hZnRlciwgJ30nXS5qb2luKCcgJyksIHRoaXMucnVsZV9pZHggKyAxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNoZWV0LmFkZFJ1bGUoc2VsX2JlZm9yZSwgY3NzX2JlZm9yZSwgdGhpcy5ydWxlX2lkeCk7XG4gICAgICAgIHNoZWV0LmFkZFJ1bGUoc2VsX2FmdGVyLCBjc3NfYWZ0ZXIsIHRoaXMucnVsZV9pZHggKyAxKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWRqdXN0X3BpcF92ZXJ0aWNhbCA6IGZ1bmN0aW9uIChkcm9wZG93bix0YXJnZXQsc2V0dGluZ3MscG9zaXRpb24pIHtcbiAgICAgIHZhciBzaGVldCA9IEZvdW5kYXRpb24uc3R5bGVzaGVldCxcbiAgICAgICAgICBwaXBfb2Zmc2V0X2Jhc2UgPSAxMCxcbiAgICAgICAgICBwaXBfaGFsZmhlaWdodCA9IDE0O1xuXG4gICAgICBpZiAoc2V0dGluZ3MucGlwID09ICdjZW50ZXInKSB7XG4gICAgICAgIHBpcF9vZmZzZXRfYmFzZSA9ICh0YXJnZXQub3V0ZXJIZWlnaHQoKSAtIHBpcF9oYWxmaGVpZ2h0KSAvIDI7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucnVsZV9pZHggPSBzaGVldC5jc3NSdWxlcy5sZW5ndGg7XG5cbiAgICAgIC8vZGVmYXVsdFxuICAgICAgdmFyIHNlbF9iZWZvcmUgPSAnLmYtZHJvcGRvd24ub3BlbjpiZWZvcmUnLFxuICAgICAgICAgIHNlbF9hZnRlciAgPSAnLmYtZHJvcGRvd24ub3BlbjphZnRlcicsXG4gICAgICAgICAgY3NzX2JlZm9yZSA9ICd0b3A6ICcgKyBwaXBfb2Zmc2V0X2Jhc2UgKyAncHg7JyxcbiAgICAgICAgICBjc3NfYWZ0ZXIgID0gJ3RvcDogJyArIChwaXBfb2Zmc2V0X2Jhc2UgLSAxKSArICdweDsnO1xuICAgICAgICBcbiAgICAgIGlmIChzaGVldC5pbnNlcnRSdWxlKSB7XG4gICAgICAgIHNoZWV0Lmluc2VydFJ1bGUoW3NlbF9iZWZvcmUsICd7JywgY3NzX2JlZm9yZSwgJ30nXS5qb2luKCcgJyksIHRoaXMucnVsZV9pZHgpO1xuICAgICAgICBzaGVldC5pbnNlcnRSdWxlKFtzZWxfYWZ0ZXIsICd7JywgY3NzX2FmdGVyLCAnfSddLmpvaW4oJyAnKSwgdGhpcy5ydWxlX2lkeCArIDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2hlZXQuYWRkUnVsZShzZWxfYmVmb3JlLCBjc3NfYmVmb3JlLCB0aGlzLnJ1bGVfaWR4KTtcbiAgICAgICAgc2hlZXQuYWRkUnVsZShzZWxfYWZ0ZXIsIGNzc19hZnRlciwgdGhpcy5ydWxlX2lkeCArIDEpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBSZW1vdmUgb2xkIGRyb3Bkb3duIHJ1bGUgaW5kZXhcbiAgICBjbGVhcl9pZHggOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2hlZXQgPSBGb3VuZGF0aW9uLnN0eWxlc2hlZXQ7XG5cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5ydWxlX2lkeCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgc2hlZXQuZGVsZXRlUnVsZSh0aGlzLnJ1bGVfaWR4KTtcbiAgICAgICAgc2hlZXQuZGVsZXRlUnVsZSh0aGlzLnJ1bGVfaWR4KTtcbiAgICAgICAgZGVsZXRlIHRoaXMucnVsZV9pZHg7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNtYWxsIDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG1hdGNoTWVkaWEoRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzLnNtYWxsKS5tYXRjaGVzICYmXG4gICAgICAgICFtYXRjaE1lZGlhKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllcy5tZWRpdW0pLm1hdGNoZXM7XG4gICAgfSxcblxuICAgIG9mZiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuUyh0aGlzLnNjb3BlKS5vZmYoJy5mbmR0bi5kcm9wZG93bicpO1xuICAgICAgdGhpcy5TKCdodG1sLCBib2R5Jykub2ZmKCcuZm5kdG4uZHJvcGRvd24nKTtcbiAgICAgIHRoaXMuUyh3aW5kb3cpLm9mZignLmZuZHRuLmRyb3Bkb3duJyk7XG4gICAgICB0aGlzLlMoJ1tkYXRhLWRyb3Bkb3duLWNvbnRlbnRdJykub2ZmKCcuZm5kdG4uZHJvcGRvd24nKTtcbiAgICB9LFxuXG4gICAgcmVmbG93IDogZnVuY3Rpb24gKCkge31cbiAgfTtcbn0oalF1ZXJ5LCB3aW5kb3csIHdpbmRvdy5kb2N1bWVudCkpO1xuIiwiOyhmdW5jdGlvbiAoJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBGb3VuZGF0aW9uLmxpYnMuZXF1YWxpemVyID0ge1xuICAgIG5hbWUgOiAnZXF1YWxpemVyJyxcblxuICAgIHZlcnNpb24gOiAnNS41LjEnLFxuXG4gICAgc2V0dGluZ3MgOiB7XG4gICAgICB1c2VfdGFsbGVzdCA6IHRydWUsXG4gICAgICBiZWZvcmVfaGVpZ2h0X2NoYW5nZSA6ICQubm9vcCxcbiAgICAgIGFmdGVyX2hlaWdodF9jaGFuZ2UgOiAkLm5vb3AsXG4gICAgICBlcXVhbGl6ZV9vbl9zdGFjayA6IGZhbHNlXG4gICAgfSxcblxuICAgIGluaXQgOiBmdW5jdGlvbiAoc2NvcGUsIG1ldGhvZCwgb3B0aW9ucykge1xuICAgICAgRm91bmRhdGlvbi5pbmhlcml0KHRoaXMsICdpbWFnZV9sb2FkZWQnKTtcbiAgICAgIHRoaXMuYmluZGluZ3MobWV0aG9kLCBvcHRpb25zKTtcbiAgICAgIHRoaXMucmVmbG93KCk7XG4gICAgfSxcblxuICAgIGV2ZW50cyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuUyh3aW5kb3cpLm9mZignLmVxdWFsaXplcicpLm9uKCdyZXNpemUuZm5kdG4uZXF1YWxpemVyJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdGhpcy5yZWZsb3coKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIGVxdWFsaXplIDogZnVuY3Rpb24gKGVxdWFsaXplcikge1xuICAgICAgdmFyIGlzU3RhY2tlZCA9IGZhbHNlLFxuICAgICAgICAgIGdyb3VwID0gZXF1YWxpemVyLmRhdGEoJ2VxdWFsaXplcicpLFxuICAgICAgICAgIHZhbHMgPSBncm91cCA/IGVxdWFsaXplci5maW5kKCdbJyt0aGlzLmF0dHJfbmFtZSgpKyctd2F0Y2g9XCInK2dyb3VwKydcIl06dmlzaWJsZScpIDogZXF1YWxpemVyLmZpbmQoJ1snK3RoaXMuYXR0cl9uYW1lKCkrJy13YXRjaF06dmlzaWJsZScpLFxuICAgICAgICAgIHNldHRpbmdzID0gZXF1YWxpemVyLmRhdGEodGhpcy5hdHRyX25hbWUodHJ1ZSkrJy1pbml0JykgfHwgdGhpcy5zZXR0aW5ncyxcbiAgICAgICAgICBmaXJzdFRvcE9mZnNldDtcblxuICAgICAgaWYgKHZhbHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgc2V0dGluZ3MuYmVmb3JlX2hlaWdodF9jaGFuZ2UoKTtcbiAgICAgIGVxdWFsaXplci50cmlnZ2VyKCdiZWZvcmUtaGVpZ2h0LWNoYW5nZS5mbmR0aC5lcXVhbGl6ZXInKTtcbiAgICAgIHZhbHMuaGVpZ2h0KCdpbmhlcml0Jyk7XG4gICAgICBcbiAgICAgIGlmIChzZXR0aW5ncy5lcXVhbGl6ZV9vbl9zdGFjayA9PT0gZmFsc2UpIHtcbiAgICAgICAgZmlyc3RUb3BPZmZzZXQgPSB2YWxzLmZpcnN0KCkub2Zmc2V0KCkudG9wO1xuICAgICAgICB2YWxzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmICgkKHRoaXMpLm9mZnNldCgpLnRvcCAhPT0gZmlyc3RUb3BPZmZzZXQpIHtcbiAgICAgICAgICAgIGlzU3RhY2tlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGlzU3RhY2tlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgaGVpZ2h0cyA9IHZhbHMubWFwKGZ1bmN0aW9uICgpIHsgcmV0dXJuICQodGhpcykub3V0ZXJIZWlnaHQoZmFsc2UpIH0pLmdldCgpO1xuXG4gICAgICBpZiAoc2V0dGluZ3MudXNlX3RhbGxlc3QpIHtcbiAgICAgICAgdmFyIG1heCA9IE1hdGgubWF4LmFwcGx5KG51bGwsIGhlaWdodHMpO1xuICAgICAgICB2YWxzLmNzcygnaGVpZ2h0JywgbWF4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBtaW4gPSBNYXRoLm1pbi5hcHBseShudWxsLCBoZWlnaHRzKTtcbiAgICAgICAgdmFscy5jc3MoJ2hlaWdodCcsIG1pbik7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHNldHRpbmdzLmFmdGVyX2hlaWdodF9jaGFuZ2UoKTtcbiAgICAgIGVxdWFsaXplci50cmlnZ2VyKCdhZnRlci1oZWlnaHQtY2hhbmdlLmZuZHRuLmVxdWFsaXplcicpO1xuICAgIH0sXG5cbiAgICByZWZsb3cgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHRoaXMuUygnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10nLCB0aGlzLnNjb3BlKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyICRlcV90YXJnZXQgPSAkKHRoaXMpO1xuICAgICAgICBzZWxmLmltYWdlX2xvYWRlZChzZWxmLlMoJ2ltZycsIHRoaXMpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2VsZi5lcXVhbGl6ZSgkZXFfdGFyZ2V0KVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0pKGpRdWVyeSwgd2luZG93LCB3aW5kb3cuZG9jdW1lbnQpO1xuIiwiOyhmdW5jdGlvbiAoJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBGb3VuZGF0aW9uLmxpYnMuaW50ZXJjaGFuZ2UgPSB7XG4gICAgbmFtZSA6ICdpbnRlcmNoYW5nZScsXG5cbiAgICB2ZXJzaW9uIDogJzUuNS4xJyxcblxuICAgIGNhY2hlIDoge30sXG5cbiAgICBpbWFnZXNfbG9hZGVkIDogZmFsc2UsXG4gICAgbm9kZXNfbG9hZGVkIDogZmFsc2UsXG5cbiAgICBzZXR0aW5ncyA6IHtcbiAgICAgIGxvYWRfYXR0ciA6ICdpbnRlcmNoYW5nZScsXG5cbiAgICAgIG5hbWVkX3F1ZXJpZXMgOiB7XG4gICAgICAgICdkZWZhdWx0JyAgICAgOiAnb25seSBzY3JlZW4nLFxuICAgICAgICAnc21hbGwnICAgICAgIDogRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzWydzbWFsbCddLFxuICAgICAgICAnc21hbGwtb25seScgIDogRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzWydzbWFsbC1vbmx5J10sXG4gICAgICAgICdtZWRpdW0nICAgICAgOiBGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXNbJ21lZGl1bSddLFxuICAgICAgICAnbWVkaXVtLW9ubHknIDogRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzWydtZWRpdW0tb25seSddLFxuICAgICAgICAnbGFyZ2UnICAgICAgIDogRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzWydsYXJnZSddLFxuICAgICAgICAnbGFyZ2Utb25seScgIDogRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzWydsYXJnZS1vbmx5J10sXG4gICAgICAgICd4bGFyZ2UnICAgICAgOiBGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXNbJ3hsYXJnZSddLFxuICAgICAgICAneGxhcmdlLW9ubHknIDogRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzWyd4bGFyZ2Utb25seSddLFxuICAgICAgICAneHhsYXJnZScgICAgIDogRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzWyd4eGxhcmdlJ10sXG4gICAgICAgICdsYW5kc2NhcGUnICAgOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKScsXG4gICAgICAgICdwb3J0cmFpdCcgICAgOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpJyxcbiAgICAgICAgJ3JldGluYScgICAgICA6ICdvbmx5IHNjcmVlbiBhbmQgKC13ZWJraXQtbWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgICAgICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLS1tb3otZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAgICAgICAnb25seSBzY3JlZW4gYW5kICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyLzEpLCcgK1xuICAgICAgICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICAgICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAxOTJkcGkpLCcgK1xuICAgICAgICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAyZHBweCknXG4gICAgICB9LFxuXG4gICAgICBkaXJlY3RpdmVzIDoge1xuICAgICAgICByZXBsYWNlIDogZnVuY3Rpb24gKGVsLCBwYXRoLCB0cmlnZ2VyKSB7XG4gICAgICAgICAgLy8gVGhlIHRyaWdnZXIgYXJndW1lbnQsIGlmIGNhbGxlZCB3aXRoaW4gdGhlIGRpcmVjdGl2ZSwgZmlyZXNcbiAgICAgICAgICAvLyBhbiBldmVudCBuYW1lZCBhZnRlciB0aGUgZGlyZWN0aXZlIG9uIHRoZSBlbGVtZW50LCBwYXNzaW5nXG4gICAgICAgICAgLy8gYW55IHBhcmFtZXRlcnMgYWxvbmcgdG8gdGhlIGV2ZW50IHRoYXQgeW91IHBhc3MgdG8gdHJpZ2dlci5cbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIGV4LiB0cmlnZ2VyKCksIHRyaWdnZXIoW2EsIGIsIGNdKSwgb3IgdHJpZ2dlcihhLCBiLCBjKVxuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gVGhpcyBhbGxvd3MgeW91IHRvIGJpbmQgYSBjYWxsYmFjayBsaWtlIHNvOlxuICAgICAgICAgIC8vICQoJyNpbnRlcmNoYW5nZUNvbnRhaW5lcicpLm9uKCdyZXBsYWNlJywgZnVuY3Rpb24gKGUsIGEsIGIsIGMpIHtcbiAgICAgICAgICAvLyAgIGNvbnNvbGUubG9nKCQodGhpcykuaHRtbCgpLCBhLCBiLCBjKTtcbiAgICAgICAgICAvLyB9KTtcblxuICAgICAgICAgIGlmIChlbCAhPT0gbnVsbCAmJiAvSU1HLy50ZXN0KGVsWzBdLm5vZGVOYW1lKSkge1xuICAgICAgICAgICAgdmFyIG9yaWdfcGF0aCA9IGVsWzBdLnNyYztcblxuICAgICAgICAgICAgaWYgKG5ldyBSZWdFeHAocGF0aCwgJ2knKS50ZXN0KG9yaWdfcGF0aCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbC5hdHRyKFwic3JjXCIsIHBhdGgpO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJpZ2dlcihlbFswXS5zcmMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgbGFzdF9wYXRoID0gZWwuZGF0YSh0aGlzLmRhdGFfYXR0ciArICctbGFzdC1wYXRoJyksXG4gICAgICAgICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgaWYgKGxhc3RfcGF0aCA9PSBwYXRoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKC9cXC4oZ2lmfGpwZ3xqcGVnfHRpZmZ8cG5nKShbPyNdLiopPy9pLnRlc3QocGF0aCkpIHtcbiAgICAgICAgICAgICQoZWwpLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIHBhdGggKyAnKScpO1xuICAgICAgICAgICAgZWwuZGF0YSgnaW50ZXJjaGFuZ2UtbGFzdC1wYXRoJywgcGF0aCk7XG4gICAgICAgICAgICByZXR1cm4gdHJpZ2dlcihwYXRoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gJC5nZXQocGF0aCwgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBlbC5odG1sKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIGVsLmRhdGEoc2VsZi5kYXRhX2F0dHIgKyAnLWxhc3QtcGF0aCcsIHBhdGgpO1xuICAgICAgICAgICAgdHJpZ2dlcigpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaW5pdCA6IGZ1bmN0aW9uIChzY29wZSwgbWV0aG9kLCBvcHRpb25zKSB7XG4gICAgICBGb3VuZGF0aW9uLmluaGVyaXQodGhpcywgJ3Rocm90dGxlIHJhbmRvbV9zdHInKTtcblxuICAgICAgdGhpcy5kYXRhX2F0dHIgPSB0aGlzLnNldF9kYXRhX2F0dHIoKTtcbiAgICAgICQuZXh0ZW5kKHRydWUsIHRoaXMuc2V0dGluZ3MsIG1ldGhvZCwgb3B0aW9ucyk7XG4gICAgICB0aGlzLmJpbmRpbmdzKG1ldGhvZCwgb3B0aW9ucyk7XG4gICAgICB0aGlzLnJlZmxvdygpO1xuICAgIH0sXG5cbiAgICBnZXRfbWVkaWFfaGFzaCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG1lZGlhSGFzaCA9ICcnO1xuICAgICAgICBmb3IgKHZhciBxdWVyeU5hbWUgaW4gdGhpcy5zZXR0aW5ncy5uYW1lZF9xdWVyaWVzICkge1xuICAgICAgICAgICAgbWVkaWFIYXNoICs9IG1hdGNoTWVkaWEodGhpcy5zZXR0aW5ncy5uYW1lZF9xdWVyaWVzW3F1ZXJ5TmFtZV0pLm1hdGNoZXMudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWVkaWFIYXNoO1xuICAgIH0sXG5cbiAgICBldmVudHMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsIHByZXZNZWRpYUhhc2g7XG5cbiAgICAgICQod2luZG93KVxuICAgICAgICAub2ZmKCcuaW50ZXJjaGFuZ2UnKVxuICAgICAgICAub24oJ3Jlc2l6ZS5mbmR0bi5pbnRlcmNoYW5nZScsIHNlbGYudGhyb3R0bGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGN1cnJNZWRpYUhhc2ggPSBzZWxmLmdldF9tZWRpYV9oYXNoKCk7XG4gICAgICAgICAgICBpZiAoY3Vyck1lZGlhSGFzaCAhPT0gcHJldk1lZGlhSGFzaCkge1xuICAgICAgICAgICAgICAgIHNlbGYucmVzaXplKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcmV2TWVkaWFIYXNoID0gY3Vyck1lZGlhSGFzaDtcbiAgICAgICAgfSwgNTApKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIHJlc2l6ZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjYWNoZSA9IHRoaXMuY2FjaGU7XG5cbiAgICAgIGlmICghdGhpcy5pbWFnZXNfbG9hZGVkIHx8ICF0aGlzLm5vZGVzX2xvYWRlZCkge1xuICAgICAgICBzZXRUaW1lb3V0KCQucHJveHkodGhpcy5yZXNpemUsIHRoaXMpLCA1MCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgdXVpZCBpbiBjYWNoZSkge1xuICAgICAgICBpZiAoY2FjaGUuaGFzT3duUHJvcGVydHkodXVpZCkpIHtcbiAgICAgICAgICB2YXIgcGFzc2VkID0gdGhpcy5yZXN1bHRzKHV1aWQsIGNhY2hlW3V1aWRdKTtcbiAgICAgICAgICBpZiAocGFzc2VkKSB7XG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLmRpcmVjdGl2ZXNbcGFzc2VkXG4gICAgICAgICAgICAgIC5zY2VuYXJpb1sxXV0uY2FsbCh0aGlzLCBwYXNzZWQuZWwsIHBhc3NlZC5zY2VuYXJpb1swXSwgKGZ1bmN0aW9uIChwYXNzZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJndW1lbnRzWzBdIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgcGFzc2VkLmVsLnRyaWdnZXIocGFzc2VkLnNjZW5hcmlvWzFdLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0ocGFzc2VkKSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfSxcblxuICAgIHJlc3VsdHMgOiBmdW5jdGlvbiAodXVpZCwgc2NlbmFyaW9zKSB7XG4gICAgICB2YXIgY291bnQgPSBzY2VuYXJpb3MubGVuZ3RoO1xuXG4gICAgICBpZiAoY291bnQgPiAwKSB7XG4gICAgICAgIHZhciBlbCA9IHRoaXMuUygnWycgKyB0aGlzLmFkZF9uYW1lc3BhY2UoJ2RhdGEtdXVpZCcpICsgJz1cIicgKyB1dWlkICsgJ1wiXScpO1xuXG4gICAgICAgIHdoaWxlIChjb3VudC0tKSB7XG4gICAgICAgICAgdmFyIG1xLCBydWxlID0gc2NlbmFyaW9zW2NvdW50XVsyXTtcbiAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5uYW1lZF9xdWVyaWVzLmhhc093blByb3BlcnR5KHJ1bGUpKSB7XG4gICAgICAgICAgICBtcSA9IG1hdGNoTWVkaWEodGhpcy5zZXR0aW5ncy5uYW1lZF9xdWVyaWVzW3J1bGVdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbXEgPSBtYXRjaE1lZGlhKHJ1bGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobXEubWF0Y2hlcykge1xuICAgICAgICAgICAgcmV0dXJuIHtlbCA6IGVsLCBzY2VuYXJpbyA6IHNjZW5hcmlvc1tjb3VudF19O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIGxvYWQgOiBmdW5jdGlvbiAodHlwZSwgZm9yY2VfdXBkYXRlKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXNbJ2NhY2hlZF8nICsgdHlwZV0gPT09ICd1bmRlZmluZWQnIHx8IGZvcmNlX3VwZGF0ZSkge1xuICAgICAgICB0aGlzWyd1cGRhdGVfJyArIHR5cGVdKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzWydjYWNoZWRfJyArIHR5cGVdO1xuICAgIH0sXG5cbiAgICB1cGRhdGVfaW1hZ2VzIDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGltYWdlcyA9IHRoaXMuUygnaW1nWycgKyB0aGlzLmRhdGFfYXR0ciArICddJyksXG4gICAgICAgICAgY291bnQgPSBpbWFnZXMubGVuZ3RoLFxuICAgICAgICAgIGkgPSBjb3VudCxcbiAgICAgICAgICBsb2FkZWRfY291bnQgPSAwLFxuICAgICAgICAgIGRhdGFfYXR0ciA9IHRoaXMuZGF0YV9hdHRyO1xuXG4gICAgICB0aGlzLmNhY2hlID0ge307XG4gICAgICB0aGlzLmNhY2hlZF9pbWFnZXMgPSBbXTtcbiAgICAgIHRoaXMuaW1hZ2VzX2xvYWRlZCA9IChjb3VudCA9PT0gMCk7XG5cbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgbG9hZGVkX2NvdW50Kys7XG4gICAgICAgIGlmIChpbWFnZXNbaV0pIHtcbiAgICAgICAgICB2YXIgc3RyID0gaW1hZ2VzW2ldLmdldEF0dHJpYnV0ZShkYXRhX2F0dHIpIHx8ICcnO1xuXG4gICAgICAgICAgaWYgKHN0ci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmNhY2hlZF9pbWFnZXMucHVzaChpbWFnZXNbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsb2FkZWRfY291bnQgPT09IGNvdW50KSB7XG4gICAgICAgICAgdGhpcy5pbWFnZXNfbG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLmVuaGFuY2UoJ2ltYWdlcycpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICB1cGRhdGVfbm9kZXMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbm9kZXMgPSB0aGlzLlMoJ1snICsgdGhpcy5kYXRhX2F0dHIgKyAnXScpLm5vdCgnaW1nJyksXG4gICAgICAgICAgY291bnQgPSBub2Rlcy5sZW5ndGgsXG4gICAgICAgICAgaSA9IGNvdW50LFxuICAgICAgICAgIGxvYWRlZF9jb3VudCA9IDAsXG4gICAgICAgICAgZGF0YV9hdHRyID0gdGhpcy5kYXRhX2F0dHI7XG5cbiAgICAgIHRoaXMuY2FjaGVkX25vZGVzID0gW107XG4gICAgICB0aGlzLm5vZGVzX2xvYWRlZCA9IChjb3VudCA9PT0gMCk7XG5cbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgbG9hZGVkX2NvdW50Kys7XG4gICAgICAgIHZhciBzdHIgPSBub2Rlc1tpXS5nZXRBdHRyaWJ1dGUoZGF0YV9hdHRyKSB8fCAnJztcblxuICAgICAgICBpZiAoc3RyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB0aGlzLmNhY2hlZF9ub2Rlcy5wdXNoKG5vZGVzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsb2FkZWRfY291bnQgPT09IGNvdW50KSB7XG4gICAgICAgICAgdGhpcy5ub2Rlc19sb2FkZWQgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuZW5oYW5jZSgnbm9kZXMnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgZW5oYW5jZSA6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICB2YXIgaSA9IHRoaXNbJ2NhY2hlZF8nICsgdHlwZV0ubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIHRoaXMub2JqZWN0KCQodGhpc1snY2FjaGVkXycgKyB0eXBlXVtpXSkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJCh3aW5kb3cpLnRyaWdnZXIoJ3Jlc2l6ZS5mbmR0bi5pbnRlcmNoYW5nZScpO1xuICAgIH0sXG5cbiAgICBjb252ZXJ0X2RpcmVjdGl2ZSA6IGZ1bmN0aW9uIChkaXJlY3RpdmUpIHtcblxuICAgICAgdmFyIHRyaW1tZWQgPSB0aGlzLnRyaW0oZGlyZWN0aXZlKTtcblxuICAgICAgaWYgKHRyaW1tZWQubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gdHJpbW1lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICdyZXBsYWNlJztcbiAgICB9LFxuXG4gICAgcGFyc2Vfc2NlbmFyaW8gOiBmdW5jdGlvbiAoc2NlbmFyaW8pIHtcbiAgICAgIC8vIFRoaXMgbG9naWMgaGFkIHRvIGJlIG1hZGUgbW9yZSBjb21wbGV4IHNpbmNlIHNvbWUgdXNlcnMgd2VyZSB1c2luZyBjb21tYXMgaW4gdGhlIHVybCBwYXRoXG4gICAgICAvLyBTbyB3ZSBjYW5ub3Qgc2ltcGx5IGp1c3Qgc3BsaXQgb24gYSBjb21tYVxuXG4gICAgICB2YXIgZGlyZWN0aXZlX21hdGNoID0gc2NlbmFyaW9bMF0ubWF0Y2goLyguKyksXFxzKihcXHcrKVxccyokLyksXG4gICAgICAvLyBnZXR0aW5nIHRoZSBtcSBoYXMgZ290dGVuIGEgYml0IGNvbXBsaWNhdGVkIHNpbmNlIHdlIHN0YXJ0ZWQgYWNjb3VudGluZyBmb3Igc2V2ZXJhbCB1c2UgY2FzZXNcbiAgICAgIC8vIG9mIFVSTHMuIEZvciBub3cgd2UnbGwgY29udGludWUgdG8gbWF0Y2ggdGhlc2Ugc2NlbmFyaW9zLCBidXQgd2UgbWF5IGNvbnNpZGVyIGhhdmluZyB0aGVzZSBzY2VuYXJpb3NcbiAgICAgIC8vIGFzIG5lc3RlZCBvYmplY3RzIG9yIGFycmF5cyBpbiBGNi5cbiAgICAgIC8vIHJlZ2V4OiBtYXRjaCBldmVyeXRoaW5nIGJlZm9yZSBjbG9zZSBwYXJlbnRoZXNpcyBmb3IgbXFcbiAgICAgIG1lZGlhX3F1ZXJ5ICAgICAgICAgPSBzY2VuYXJpb1sxXS5tYXRjaCgvKC4qKVxcKS8pO1xuXG4gICAgICBpZiAoZGlyZWN0aXZlX21hdGNoKSB7XG4gICAgICAgIHZhciBwYXRoICA9IGRpcmVjdGl2ZV9tYXRjaFsxXSxcbiAgICAgICAgZGlyZWN0aXZlID0gZGlyZWN0aXZlX21hdGNoWzJdO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgY2FjaGVkX3NwbGl0ID0gc2NlbmFyaW9bMF0uc3BsaXQoLyxcXHMqJC8pLFxuICAgICAgICBwYXRoICAgICAgICAgICAgID0gY2FjaGVkX3NwbGl0WzBdLFxuICAgICAgICBkaXJlY3RpdmUgICAgICAgID0gJyc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBbdGhpcy50cmltKHBhdGgpLCB0aGlzLmNvbnZlcnRfZGlyZWN0aXZlKGRpcmVjdGl2ZSksIHRoaXMudHJpbShtZWRpYV9xdWVyeVsxXSldO1xuICAgIH0sXG5cbiAgICBvYmplY3QgOiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgIHZhciByYXdfYXJyID0gdGhpcy5wYXJzZV9kYXRhX2F0dHIoZWwpLFxuICAgICAgICAgIHNjZW5hcmlvcyA9IFtdLFxuICAgICAgICAgIGkgPSByYXdfYXJyLmxlbmd0aDtcblxuICAgICAgaWYgKGkgPiAwKSB7XG4gICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAvLyBzcGxpdCBhcnJheSBiZXR3ZWVuIGNvbW1hIGRlbGltaXRlZCBjb250ZW50IGFuZCBtcVxuICAgICAgICAgIC8vIHJlZ2V4OiBjb21tYSwgb3B0aW9uYWwgc3BhY2UsIG9wZW4gcGFyZW50aGVzaXNcbiAgICAgICAgICB2YXIgc2NlbmFyaW8gPSByYXdfYXJyW2ldLnNwbGl0KC8sXFxzP1xcKC8pO1xuXG4gICAgICAgICAgaWYgKHNjZW5hcmlvLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSB0aGlzLnBhcnNlX3NjZW5hcmlvKHNjZW5hcmlvKTtcbiAgICAgICAgICAgIHNjZW5hcmlvcy5wdXNoKHBhcmFtcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnN0b3JlKGVsLCBzY2VuYXJpb3MpO1xuICAgIH0sXG5cbiAgICBzdG9yZSA6IGZ1bmN0aW9uIChlbCwgc2NlbmFyaW9zKSB7XG4gICAgICB2YXIgdXVpZCA9IHRoaXMucmFuZG9tX3N0cigpLFxuICAgICAgICAgIGN1cnJlbnRfdXVpZCA9IGVsLmRhdGEodGhpcy5hZGRfbmFtZXNwYWNlKCd1dWlkJywgdHJ1ZSkpO1xuXG4gICAgICBpZiAodGhpcy5jYWNoZVtjdXJyZW50X3V1aWRdKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlW2N1cnJlbnRfdXVpZF07XG4gICAgICB9XG5cbiAgICAgIGVsLmF0dHIodGhpcy5hZGRfbmFtZXNwYWNlKCdkYXRhLXV1aWQnKSwgdXVpZCk7XG4gICAgICByZXR1cm4gdGhpcy5jYWNoZVt1dWlkXSA9IHNjZW5hcmlvcztcbiAgICB9LFxuXG4gICAgdHJpbSA6IGZ1bmN0aW9uIChzdHIpIHtcblxuICAgICAgaWYgKHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiAkLnRyaW0oc3RyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9LFxuXG4gICAgc2V0X2RhdGFfYXR0ciA6IGZ1bmN0aW9uIChpbml0KSB7XG4gICAgICBpZiAoaW5pdCkge1xuICAgICAgICBpZiAodGhpcy5uYW1lc3BhY2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLm5hbWVzcGFjZSArICctJyArIHRoaXMuc2V0dGluZ3MubG9hZF9hdHRyO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0dGluZ3MubG9hZF9hdHRyO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5uYW1lc3BhY2UubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gJ2RhdGEtJyArIHRoaXMubmFtZXNwYWNlICsgJy0nICsgdGhpcy5zZXR0aW5ncy5sb2FkX2F0dHI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAnZGF0YS0nICsgdGhpcy5zZXR0aW5ncy5sb2FkX2F0dHI7XG4gICAgfSxcblxuICAgIHBhcnNlX2RhdGFfYXR0ciA6IGZ1bmN0aW9uIChlbCkge1xuICAgICAgdmFyIHJhdyA9IGVsLmF0dHIodGhpcy5hdHRyX25hbWUoKSkuc3BsaXQoL1xcWyguKj8pXFxdLyksXG4gICAgICAgICAgaSA9IHJhdy5sZW5ndGgsXG4gICAgICAgICAgb3V0cHV0ID0gW107XG5cbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgaWYgKHJhd1tpXS5yZXBsYWNlKC9bXFxXXFxkXSsvLCAnJykubGVuZ3RoID4gNCkge1xuICAgICAgICAgIG91dHB1dC5wdXNoKHJhd1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9LFxuXG4gICAgcmVmbG93IDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5sb2FkKCdpbWFnZXMnLCB0cnVlKTtcbiAgICAgIHRoaXMubG9hZCgnbm9kZXMnLCB0cnVlKTtcbiAgICB9XG5cbiAgfTtcblxufShqUXVlcnksIHdpbmRvdywgd2luZG93LmRvY3VtZW50KSk7XG4iLCI7KGZ1bmN0aW9uICgkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBNb2Rlcm5penIgPSBNb2Rlcm5penIgfHwgZmFsc2U7XG5cbiAgRm91bmRhdGlvbi5saWJzLmpveXJpZGUgPSB7XG4gICAgbmFtZSA6ICdqb3lyaWRlJyxcblxuICAgIHZlcnNpb24gOiAnNS41LjEnLFxuXG4gICAgZGVmYXVsdHMgOiB7XG4gICAgICBleHBvc2UgICAgICAgICAgICAgICAgICAgOiBmYWxzZSwgICAgIC8vIHR1cm4gb24gb3Igb2ZmIHRoZSBleHBvc2UgZmVhdHVyZVxuICAgICAgbW9kYWwgICAgICAgICAgICAgICAgICAgIDogdHJ1ZSwgICAgICAvLyBXaGV0aGVyIHRvIGNvdmVyIHBhZ2Ugd2l0aCBtb2RhbCBkdXJpbmcgdGhlIHRvdXJcbiAgICAgIGtleWJvYXJkICAgICAgICAgICAgICAgICA6IHRydWUsICAgICAgLy8gZW5hYmxlIGxlZnQsIHJpZ2h0IGFuZCBlc2Mga2V5c3Ryb2tlc1xuICAgICAgdGlwX2xvY2F0aW9uICAgICAgICAgICAgIDogJ2JvdHRvbScsICAvLyAndG9wJyBvciAnYm90dG9tJyBpbiByZWxhdGlvbiB0byBwYXJlbnRcbiAgICAgIG51Yl9wb3NpdGlvbiAgICAgICAgICAgICA6ICdhdXRvJywgICAgLy8gb3ZlcnJpZGUgb24gYSBwZXIgdG9vbHRpcCBiYXNlc1xuICAgICAgc2Nyb2xsX3NwZWVkICAgICAgICAgICAgIDogMTUwMCwgICAgICAvLyBQYWdlIHNjcm9sbGluZyBzcGVlZCBpbiBtaWxsaXNlY29uZHMsIDAgPSBubyBzY3JvbGwgYW5pbWF0aW9uXG4gICAgICBzY3JvbGxfYW5pbWF0aW9uICAgICAgICAgOiAnbGluZWFyJywgIC8vIHN1cHBvcnRzICdzd2luZycgYW5kICdsaW5lYXInLCBleHRlbmQgd2l0aCBqUXVlcnkgVUkuXG4gICAgICB0aW1lciAgICAgICAgICAgICAgICAgICAgOiAwLCAgICAgICAgIC8vIDAgPSBubyB0aW1lciAsIGFsbCBvdGhlciBudW1iZXJzID0gdGltZXIgaW4gbWlsbGlzZWNvbmRzXG4gICAgICBzdGFydF90aW1lcl9vbl9jbGljayAgICAgOiB0cnVlLCAgICAgIC8vIHRydWUgb3IgZmFsc2UgLSB0cnVlIHJlcXVpcmVzIGNsaWNraW5nIHRoZSBmaXJzdCBidXR0b24gc3RhcnQgdGhlIHRpbWVyXG4gICAgICBzdGFydF9vZmZzZXQgICAgICAgICAgICAgOiAwLCAgICAgICAgIC8vIHRoZSBpbmRleCBvZiB0aGUgdG9vbHRpcCB5b3Ugd2FudCB0byBzdGFydCBvbiAoaW5kZXggb2YgdGhlIGxpKVxuICAgICAgbmV4dF9idXR0b24gICAgICAgICAgICAgIDogdHJ1ZSwgICAgICAvLyB0cnVlIG9yIGZhbHNlIHRvIGNvbnRyb2wgd2hldGhlciBhIG5leHQgYnV0dG9uIGlzIHVzZWRcbiAgICAgIHByZXZfYnV0dG9uICAgICAgICAgICAgICA6IHRydWUsICAgICAgLy8gdHJ1ZSBvciBmYWxzZSB0byBjb250cm9sIHdoZXRoZXIgYSBwcmV2IGJ1dHRvbiBpcyB1c2VkXG4gICAgICB0aXBfYW5pbWF0aW9uICAgICAgICAgICAgOiAnZmFkZScsICAgIC8vICdwb3AnIG9yICdmYWRlJyBpbiBlYWNoIHRpcFxuICAgICAgcGF1c2VfYWZ0ZXIgICAgICAgICAgICAgIDogW10sICAgICAgICAvLyBhcnJheSBvZiBpbmRleGVzIHdoZXJlIHRvIHBhdXNlIHRoZSB0b3VyIGFmdGVyXG4gICAgICBleHBvc2VkICAgICAgICAgICAgICAgICAgOiBbXSwgICAgICAgIC8vIGFycmF5IG9mIGV4cG9zZSBlbGVtZW50c1xuICAgICAgdGlwX2FuaW1hdGlvbl9mYWRlX3NwZWVkIDogMzAwLCAgICAgICAvLyB3aGVuIHRpcEFuaW1hdGlvbiA9ICdmYWRlJyB0aGlzIGlzIHNwZWVkIGluIG1pbGxpc2Vjb25kcyBmb3IgdGhlIHRyYW5zaXRpb25cbiAgICAgIGNvb2tpZV9tb25zdGVyICAgICAgICAgICA6IGZhbHNlLCAgICAgLy8gdHJ1ZSBvciBmYWxzZSB0byBjb250cm9sIHdoZXRoZXIgY29va2llcyBhcmUgdXNlZFxuICAgICAgY29va2llX25hbWUgICAgICAgICAgICAgIDogJ2pveXJpZGUnLCAvLyBOYW1lIHRoZSBjb29raWUgeW91J2xsIHVzZVxuICAgICAgY29va2llX2RvbWFpbiAgICAgICAgICAgIDogZmFsc2UsICAgICAvLyBXaWxsIHRoaXMgY29va2llIGJlIGF0dGFjaGVkIHRvIGEgZG9tYWluLCBpZS4gJy5ub3RhYmxlYXBwLmNvbSdcbiAgICAgIGNvb2tpZV9leHBpcmVzICAgICAgICAgICA6IDM2NSwgICAgICAgLy8gc2V0IHdoZW4geW91IHdvdWxkIGxpa2UgdGhlIGNvb2tpZSB0byBleHBpcmUuXG4gICAgICB0aXBfY29udGFpbmVyICAgICAgICAgICAgOiAnYm9keScsICAgIC8vIFdoZXJlIHdpbGwgdGhlIHRpcCBiZSBhdHRhY2hlZFxuICAgICAgYWJvcnRfb25fY2xvc2UgICAgICAgICAgIDogdHJ1ZSwgICAgICAvLyBXaGVuIHRydWUsIHRoZSBjbG9zZSBldmVudCB3aWxsIG5vdCBmaXJlIGFueSBjYWxsYmFja1xuICAgICAgdGlwX2xvY2F0aW9uX3BhdHRlcm5zICAgIDoge1xuICAgICAgICB0b3AgOiBbJ2JvdHRvbSddLFxuICAgICAgICBib3R0b20gOiBbXSwgLy8gYm90dG9tIHNob3VsZCBub3QgbmVlZCB0byBiZSByZXBvc2l0aW9uZWRcbiAgICAgICAgbGVmdCA6IFsncmlnaHQnLCAndG9wJywgJ2JvdHRvbSddLFxuICAgICAgICByaWdodCA6IFsnbGVmdCcsICd0b3AnLCAnYm90dG9tJ11cbiAgICAgIH0sXG4gICAgICBwb3N0X3JpZGVfY2FsbGJhY2sgICAgIDogZnVuY3Rpb24gKCkge30sICAgIC8vIEEgbWV0aG9kIHRvIGNhbGwgb25jZSB0aGUgdG91ciBjbG9zZXMgKGNhbmNlbGVkIG9yIGNvbXBsZXRlKVxuICAgICAgcG9zdF9zdGVwX2NhbGxiYWNrICAgICA6IGZ1bmN0aW9uICgpIHt9LCAgICAvLyBBIG1ldGhvZCB0byBjYWxsIGFmdGVyIGVhY2ggc3RlcFxuICAgICAgcHJlX3N0ZXBfY2FsbGJhY2sgICAgICA6IGZ1bmN0aW9uICgpIHt9LCAgICAvLyBBIG1ldGhvZCB0byBjYWxsIGJlZm9yZSBlYWNoIHN0ZXBcbiAgICAgIHByZV9yaWRlX2NhbGxiYWNrICAgICAgOiBmdW5jdGlvbiAoKSB7fSwgICAgLy8gQSBtZXRob2QgdG8gY2FsbCBiZWZvcmUgdGhlIHRvdXIgc3RhcnRzIChwYXNzZWQgaW5kZXgsIHRpcCwgYW5kIGNsb25lZCBleHBvc2VkIGVsZW1lbnQpXG4gICAgICBwb3N0X2V4cG9zZV9jYWxsYmFjayAgIDogZnVuY3Rpb24gKCkge30sICAgIC8vIEEgbWV0aG9kIHRvIGNhbGwgYWZ0ZXIgYW4gZWxlbWVudCBoYXMgYmVlbiBleHBvc2VkXG4gICAgICB0ZW1wbGF0ZSA6IHsgLy8gSFRNTCBzZWdtZW50cyBmb3IgdGlwIGxheW91dFxuICAgICAgICBsaW5rICAgICAgICAgIDogJzxhIGhyZWY9XCIjY2xvc2VcIiBjbGFzcz1cImpveXJpZGUtY2xvc2UtdGlwXCI+JnRpbWVzOzwvYT4nLFxuICAgICAgICB0aW1lciAgICAgICAgIDogJzxkaXYgY2xhc3M9XCJqb3lyaWRlLXRpbWVyLWluZGljYXRvci13cmFwXCI+PHNwYW4gY2xhc3M9XCJqb3lyaWRlLXRpbWVyLWluZGljYXRvclwiPjwvc3Bhbj48L2Rpdj4nLFxuICAgICAgICB0aXAgICAgICAgICAgIDogJzxkaXYgY2xhc3M9XCJqb3lyaWRlLXRpcC1ndWlkZVwiPjxzcGFuIGNsYXNzPVwiam95cmlkZS1udWJcIj48L3NwYW4+PC9kaXY+JyxcbiAgICAgICAgd3JhcHBlciAgICAgICA6ICc8ZGl2IGNsYXNzPVwiam95cmlkZS1jb250ZW50LXdyYXBwZXJcIj48L2Rpdj4nLFxuICAgICAgICBidXR0b24gICAgICAgIDogJzxhIGhyZWY9XCIjXCIgY2xhc3M9XCJzbWFsbCBidXR0b24gam95cmlkZS1uZXh0LXRpcFwiPjwvYT4nLFxuICAgICAgICBwcmV2X2J1dHRvbiAgIDogJzxhIGhyZWY9XCIjXCIgY2xhc3M9XCJzbWFsbCBidXR0b24gam95cmlkZS1wcmV2LXRpcFwiPjwvYT4nLFxuICAgICAgICBtb2RhbCAgICAgICAgIDogJzxkaXYgY2xhc3M9XCJqb3lyaWRlLW1vZGFsLWJnXCI+PC9kaXY+JyxcbiAgICAgICAgZXhwb3NlICAgICAgICA6ICc8ZGl2IGNsYXNzPVwiam95cmlkZS1leHBvc2Utd3JhcHBlclwiPjwvZGl2PicsXG4gICAgICAgIGV4cG9zZV9jb3ZlciAgOiAnPGRpdiBjbGFzcz1cImpveXJpZGUtZXhwb3NlLWNvdmVyXCI+PC9kaXY+J1xuICAgICAgfSxcbiAgICAgIGV4cG9zZV9hZGRfY2xhc3MgOiAnJyAvLyBPbmUgb3IgbW9yZSBzcGFjZS1zZXBhcmF0ZWQgY2xhc3MgbmFtZXMgdG8gYmUgYWRkZWQgdG8gZXhwb3NlZCBlbGVtZW50XG4gICAgfSxcblxuICAgIGluaXQgOiBmdW5jdGlvbiAoc2NvcGUsIG1ldGhvZCwgb3B0aW9ucykge1xuICAgICAgRm91bmRhdGlvbi5pbmhlcml0KHRoaXMsICd0aHJvdHRsZSByYW5kb21fc3RyJyk7XG5cbiAgICAgIHRoaXMuc2V0dGluZ3MgPSB0aGlzLnNldHRpbmdzIHx8ICQuZXh0ZW5kKHt9LCB0aGlzLmRlZmF1bHRzLCAob3B0aW9ucyB8fCBtZXRob2QpKTtcblxuICAgICAgdGhpcy5iaW5kaW5ncyhtZXRob2QsIG9wdGlvbnMpXG4gICAgfSxcblxuICAgIGdvX25leHQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncy4kbGkubmV4dCgpLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgdGhpcy5lbmQoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5zZXR0aW5ncy50aW1lciA+IDApIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc2V0dGluZ3MuYXV0b21hdGUpO1xuICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgdGhpcy5zaG93KCk7XG4gICAgICAgIHRoaXMuc3RhcnRUaW1lcigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIHRoaXMuc2hvdygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBnb19wcmV2IDogZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuJGxpLnByZXYoKS5sZW5ndGggPCAxKSB7XG4gICAgICAgIC8vIERvIG5vdGhpbmcgaWYgdGhlcmUgYXJlIG5vIHByZXYgZWxlbWVudFxuICAgICAgfSBlbHNlIGlmICh0aGlzLnNldHRpbmdzLnRpbWVyID4gMCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5zZXR0aW5ncy5hdXRvbWF0ZSk7XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICB0aGlzLnNob3cobnVsbCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuc3RhcnRUaW1lcigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIHRoaXMuc2hvdyhudWxsLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZXZlbnRzIDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkKHRoaXMuc2NvcGUpXG4gICAgICAgIC5vZmYoJy5qb3lyaWRlJylcbiAgICAgICAgLm9uKCdjbGljay5mbmR0bi5qb3lyaWRlJywgJy5qb3lyaWRlLW5leHQtdGlwLCAuam95cmlkZS1tb2RhbC1iZycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIHRoaXMuZ29fbmV4dCgpXG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICAgICAgLm9uKCdjbGljay5mbmR0bi5qb3lyaWRlJywgJy5qb3lyaWRlLXByZXYtdGlwJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgdGhpcy5nb19wcmV2KCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAub24oJ2NsaWNrLmZuZHRuLmpveXJpZGUnLCAnLmpveXJpZGUtY2xvc2UtdGlwJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgdGhpcy5lbmQodGhpcy5zZXR0aW5ncy5hYm9ydF9vbl9jbG9zZSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSlcblxuICAgICAgICAub24oJ2tleXVwLmZuZHRuLmpveXJpZGUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGtleXN0cm9rZXMgYXJlIGRpc2FibGVkXG4gICAgICAgICAgLy8gb3IgaWYgdGhlIGpveXJpZGUgaXMgbm90IGJlaW5nIHNob3duXG4gICAgICAgICAgaWYgKCF0aGlzLnNldHRpbmdzLmtleWJvYXJkIHx8ICF0aGlzLnNldHRpbmdzLnJpZGluZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgICAgY2FzZSAzOTogLy8gcmlnaHQgYXJyb3dcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICB0aGlzLmdvX25leHQoKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM3OiAvLyBsZWZ0IGFycm93XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgdGhpcy5nb19wcmV2KCk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyNzogLy8gZXNjYXBlXG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgdGhpcy5lbmQodGhpcy5zZXR0aW5ncy5hYm9ydF9vbl9jbG9zZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAkKHdpbmRvdylcbiAgICAgICAgLm9mZignLmpveXJpZGUnKVxuICAgICAgICAub24oJ3Jlc2l6ZS5mbmR0bi5qb3lyaWRlJywgc2VsZi50aHJvdHRsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKCQoJ1snICsgc2VsZi5hdHRyX25hbWUoKSArICddJykubGVuZ3RoID4gMCAmJiBzZWxmLnNldHRpbmdzLiRuZXh0X3RpcCAmJiBzZWxmLnNldHRpbmdzLnJpZGluZykge1xuICAgICAgICAgICAgaWYgKHNlbGYuc2V0dGluZ3MuZXhwb3NlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIHZhciAkZWxzID0gJChzZWxmLnNldHRpbmdzLmV4cG9zZWQpO1xuXG4gICAgICAgICAgICAgICRlbHMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgICAgICBzZWxmLnVuX2V4cG9zZSgkdGhpcyk7XG4gICAgICAgICAgICAgICAgc2VsZi5leHBvc2UoJHRoaXMpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNlbGYuaXNfcGhvbmUoKSkge1xuICAgICAgICAgICAgICBzZWxmLnBvc19waG9uZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc2VsZi5wb3NfZGVmYXVsdChmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LCAxMDApKTtcbiAgICB9LFxuXG4gICAgc3RhcnQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgJHRoaXMgPSAkKCdbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnXScsIHRoaXMuc2NvcGUpLFxuICAgICAgICAgIGludGVnZXJfc2V0dGluZ3MgPSBbJ3RpbWVyJywgJ3Njcm9sbFNwZWVkJywgJ3N0YXJ0T2Zmc2V0JywgJ3RpcEFuaW1hdGlvbkZhZGVTcGVlZCcsICdjb29raWVFeHBpcmVzJ10sXG4gICAgICAgICAgaW50X3NldHRpbmdzX2NvdW50ID0gaW50ZWdlcl9zZXR0aW5ncy5sZW5ndGg7XG5cbiAgICAgIGlmICghJHRoaXMubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5zZXR0aW5ncy5pbml0KSB7XG4gICAgICAgIHRoaXMuZXZlbnRzKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0dGluZ3MgPSAkdGhpcy5kYXRhKHRoaXMuYXR0cl9uYW1lKHRydWUpICsgJy1pbml0Jyk7XG5cbiAgICAgIC8vIG5vbiBjb25maWd1cmVhYmxlIHNldHRpbmdzXG4gICAgICB0aGlzLnNldHRpbmdzLiRjb250ZW50X2VsID0gJHRoaXM7XG4gICAgICB0aGlzLnNldHRpbmdzLiRib2R5ID0gJCh0aGlzLnNldHRpbmdzLnRpcF9jb250YWluZXIpO1xuICAgICAgdGhpcy5zZXR0aW5ncy5ib2R5X29mZnNldCA9ICQodGhpcy5zZXR0aW5ncy50aXBfY29udGFpbmVyKS5wb3NpdGlvbigpO1xuICAgICAgdGhpcy5zZXR0aW5ncy4kdGlwX2NvbnRlbnQgPSB0aGlzLnNldHRpbmdzLiRjb250ZW50X2VsLmZpbmQoJz4gbGknKTtcbiAgICAgIHRoaXMuc2V0dGluZ3MucGF1c2VkID0gZmFsc2U7XG4gICAgICB0aGlzLnNldHRpbmdzLmF0dGVtcHRzID0gMDtcbiAgICAgIHRoaXMuc2V0dGluZ3MucmlkaW5nID0gdHJ1ZTtcblxuICAgICAgLy8gY2FuIHdlIGNyZWF0ZSBjb29raWVzP1xuICAgICAgaWYgKHR5cGVvZiAkLmNvb2tpZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnNldHRpbmdzLmNvb2tpZV9tb25zdGVyID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIGdlbmVyYXRlIHRoZSB0aXBzIGFuZCBpbnNlcnQgaW50byBkb20uXG4gICAgICBpZiAoIXRoaXMuc2V0dGluZ3MuY29va2llX21vbnN0ZXIgfHwgdGhpcy5zZXR0aW5ncy5jb29raWVfbW9uc3RlciAmJiAhJC5jb29raWUodGhpcy5zZXR0aW5ncy5jb29raWVfbmFtZSkpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy4kdGlwX2NvbnRlbnQuZWFjaChmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgIHRoaXMuc2V0dGluZ3MgPSAkLmV4dGVuZCh7fSwgc2VsZi5kZWZhdWx0cywgc2VsZi5kYXRhX29wdGlvbnMoJHRoaXMpKTtcblxuICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHNldHRpbmdzIHBhcnNlZCBmcm9tIGRhdGFfb3B0aW9ucyBhcmUgaW50ZWdlcnMgd2hlcmUgbmVjZXNzYXJ5XG4gICAgICAgICAgdmFyIGkgPSBpbnRfc2V0dGluZ3NfY291bnQ7XG4gICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgc2VsZi5zZXR0aW5nc1tpbnRlZ2VyX3NldHRpbmdzW2ldXSA9IHBhcnNlSW50KHNlbGYuc2V0dGluZ3NbaW50ZWdlcl9zZXR0aW5nc1tpXV0sIDEwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2VsZi5jcmVhdGUoeyRsaSA6ICR0aGlzLCBpbmRleCA6IGluZGV4fSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHNob3cgZmlyc3QgdGlwXG4gICAgICAgIGlmICghdGhpcy5zZXR0aW5ncy5zdGFydF90aW1lcl9vbl9jbGljayAmJiB0aGlzLnNldHRpbmdzLnRpbWVyID4gMCkge1xuICAgICAgICAgIHRoaXMuc2hvdygnaW5pdCcpO1xuICAgICAgICAgIHRoaXMuc3RhcnRUaW1lcigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2hvdygnaW5pdCcpO1xuICAgICAgICB9XG5cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVzdW1lIDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zZXRfbGkoKTtcbiAgICAgIHRoaXMuc2hvdygpO1xuICAgIH0sXG5cbiAgICB0aXBfdGVtcGxhdGUgOiBmdW5jdGlvbiAob3B0cykge1xuICAgICAgdmFyICRibGFuaywgY29udGVudDtcblxuICAgICAgb3B0cy50aXBfY2xhc3MgPSBvcHRzLnRpcF9jbGFzcyB8fCAnJztcblxuICAgICAgJGJsYW5rID0gJCh0aGlzLnNldHRpbmdzLnRlbXBsYXRlLnRpcCkuYWRkQ2xhc3Mob3B0cy50aXBfY2xhc3MpO1xuICAgICAgY29udGVudCA9ICQudHJpbSgkKG9wdHMubGkpLmh0bWwoKSkgK1xuICAgICAgICB0aGlzLnByZXZfYnV0dG9uX3RleHQob3B0cy5wcmV2X2J1dHRvbl90ZXh0LCBvcHRzLmluZGV4KSArXG4gICAgICAgIHRoaXMuYnV0dG9uX3RleHQob3B0cy5idXR0b25fdGV4dCkgK1xuICAgICAgICB0aGlzLnNldHRpbmdzLnRlbXBsYXRlLmxpbmsgK1xuICAgICAgICB0aGlzLnRpbWVyX2luc3RhbmNlKG9wdHMuaW5kZXgpO1xuXG4gICAgICAkYmxhbmsuYXBwZW5kKCQodGhpcy5zZXR0aW5ncy50ZW1wbGF0ZS53cmFwcGVyKSk7XG4gICAgICAkYmxhbmsuZmlyc3QoKS5hdHRyKHRoaXMuYWRkX25hbWVzcGFjZSgnZGF0YS1pbmRleCcpLCBvcHRzLmluZGV4KTtcbiAgICAgICQoJy5qb3lyaWRlLWNvbnRlbnQtd3JhcHBlcicsICRibGFuaykuYXBwZW5kKGNvbnRlbnQpO1xuXG4gICAgICByZXR1cm4gJGJsYW5rWzBdO1xuICAgIH0sXG5cbiAgICB0aW1lcl9pbnN0YW5jZSA6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgdmFyIHR4dDtcblxuICAgICAgaWYgKChpbmRleCA9PT0gMCAmJiB0aGlzLnNldHRpbmdzLnN0YXJ0X3RpbWVyX29uX2NsaWNrICYmIHRoaXMuc2V0dGluZ3MudGltZXIgPiAwKSB8fCB0aGlzLnNldHRpbmdzLnRpbWVyID09PSAwKSB7XG4gICAgICAgIHR4dCA9ICcnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHh0ID0gJCh0aGlzLnNldHRpbmdzLnRlbXBsYXRlLnRpbWVyKVswXS5vdXRlckhUTUw7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHh0O1xuICAgIH0sXG5cbiAgICBidXR0b25fdGV4dCA6IGZ1bmN0aW9uICh0eHQpIHtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzLnRpcF9zZXR0aW5ncy5uZXh0X2J1dHRvbikge1xuICAgICAgICB0eHQgPSAkLnRyaW0odHh0KSB8fCAnTmV4dCc7XG4gICAgICAgIHR4dCA9ICQodGhpcy5zZXR0aW5ncy50ZW1wbGF0ZS5idXR0b24pLmFwcGVuZCh0eHQpWzBdLm91dGVySFRNTDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHR4dCA9ICcnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHR4dDtcbiAgICB9LFxuXG4gICAgcHJldl9idXR0b25fdGV4dCA6IGZ1bmN0aW9uICh0eHQsIGlkeCkge1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3MudGlwX3NldHRpbmdzLnByZXZfYnV0dG9uKSB7XG4gICAgICAgIHR4dCA9ICQudHJpbSh0eHQpIHx8ICdQcmV2aW91cyc7XG5cbiAgICAgICAgLy8gQWRkIHRoZSBkaXNhYmxlZCBjbGFzcyB0byB0aGUgYnV0dG9uIGlmIGl0J3MgdGhlIGZpcnN0IGVsZW1lbnRcbiAgICAgICAgaWYgKGlkeCA9PSAwKSB7XG4gICAgICAgICAgdHh0ID0gJCh0aGlzLnNldHRpbmdzLnRlbXBsYXRlLnByZXZfYnV0dG9uKS5hcHBlbmQodHh0KS5hZGRDbGFzcygnZGlzYWJsZWQnKVswXS5vdXRlckhUTUw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHh0ID0gJCh0aGlzLnNldHRpbmdzLnRlbXBsYXRlLnByZXZfYnV0dG9uKS5hcHBlbmQodHh0KVswXS5vdXRlckhUTUw7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHR4dCA9ICcnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHR4dDtcbiAgICB9LFxuXG4gICAgY3JlYXRlIDogZnVuY3Rpb24gKG9wdHMpIHtcbiAgICAgIHRoaXMuc2V0dGluZ3MudGlwX3NldHRpbmdzID0gJC5leHRlbmQoe30sIHRoaXMuc2V0dGluZ3MsIHRoaXMuZGF0YV9vcHRpb25zKG9wdHMuJGxpKSk7XG4gICAgICB2YXIgYnV0dG9uVGV4dCA9IG9wdHMuJGxpLmF0dHIodGhpcy5hZGRfbmFtZXNwYWNlKCdkYXRhLWJ1dHRvbicpKSB8fCBvcHRzLiRsaS5hdHRyKHRoaXMuYWRkX25hbWVzcGFjZSgnZGF0YS10ZXh0JykpLFxuICAgICAgICAgIHByZXZCdXR0b25UZXh0ID0gb3B0cy4kbGkuYXR0cih0aGlzLmFkZF9uYW1lc3BhY2UoJ2RhdGEtYnV0dG9uLXByZXYnKSkgfHwgb3B0cy4kbGkuYXR0cih0aGlzLmFkZF9uYW1lc3BhY2UoJ2RhdGEtcHJldi10ZXh0JykpLFxuICAgICAgICB0aXBDbGFzcyA9IG9wdHMuJGxpLmF0dHIoJ2NsYXNzJyksXG4gICAgICAgICR0aXBfY29udGVudCA9ICQodGhpcy50aXBfdGVtcGxhdGUoe1xuICAgICAgICAgIHRpcF9jbGFzcyA6IHRpcENsYXNzLFxuICAgICAgICAgIGluZGV4IDogb3B0cy5pbmRleCxcbiAgICAgICAgICBidXR0b25fdGV4dCA6IGJ1dHRvblRleHQsXG4gICAgICAgICAgcHJldl9idXR0b25fdGV4dCA6IHByZXZCdXR0b25UZXh0LFxuICAgICAgICAgIGxpIDogb3B0cy4kbGlcbiAgICAgICAgfSkpO1xuXG4gICAgICAkKHRoaXMuc2V0dGluZ3MudGlwX2NvbnRhaW5lcikuYXBwZW5kKCR0aXBfY29udGVudCk7XG4gICAgfSxcblxuICAgIHNob3cgOiBmdW5jdGlvbiAoaW5pdCwgaXNfcHJldikge1xuICAgICAgdmFyICR0aW1lciA9IG51bGw7XG5cbiAgICAgIC8vIGFyZSB3ZSBwYXVzZWQ/XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncy4kbGkgPT09IHVuZGVmaW5lZCB8fCAoJC5pbkFycmF5KHRoaXMuc2V0dGluZ3MuJGxpLmluZGV4KCksIHRoaXMuc2V0dGluZ3MucGF1c2VfYWZ0ZXIpID09PSAtMSkpIHtcblxuICAgICAgICAvLyBkb24ndCBnbyB0byB0aGUgbmV4dCBsaSBpZiB0aGUgdG91ciB3YXMgcGF1c2VkXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBhdXNlZCkge1xuICAgICAgICAgIHRoaXMuc2V0dGluZ3MucGF1c2VkID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zZXRfbGkoaW5pdCwgaXNfcHJldik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldHRpbmdzLmF0dGVtcHRzID0gMDtcblxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy4kbGkubGVuZ3RoICYmIHRoaXMuc2V0dGluZ3MuJHRhcmdldC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgaWYgKGluaXQpIHsgLy9ydW4gd2hlbiB3ZSBmaXJzdCBzdGFydFxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wcmVfcmlkZV9jYWxsYmFjayh0aGlzLnNldHRpbmdzLiRsaS5pbmRleCgpLCB0aGlzLnNldHRpbmdzLiRuZXh0X3RpcCk7XG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5tb2RhbCkge1xuICAgICAgICAgICAgICB0aGlzLnNob3dfbW9kYWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLnNldHRpbmdzLnByZV9zdGVwX2NhbGxiYWNrKHRoaXMuc2V0dGluZ3MuJGxpLmluZGV4KCksIHRoaXMuc2V0dGluZ3MuJG5leHRfdGlwKTtcblxuICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLm1vZGFsICYmIHRoaXMuc2V0dGluZ3MuZXhwb3NlKSB7XG4gICAgICAgICAgICB0aGlzLmV4cG9zZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuc2V0dGluZ3MudGlwX3NldHRpbmdzID0gJC5leHRlbmQoe30sIHRoaXMuc2V0dGluZ3MsIHRoaXMuZGF0YV9vcHRpb25zKHRoaXMuc2V0dGluZ3MuJGxpKSk7XG5cbiAgICAgICAgICB0aGlzLnNldHRpbmdzLnRpbWVyID0gcGFyc2VJbnQodGhpcy5zZXR0aW5ncy50aW1lciwgMTApO1xuXG4gICAgICAgICAgdGhpcy5zZXR0aW5ncy50aXBfc2V0dGluZ3MudGlwX2xvY2F0aW9uX3BhdHRlcm4gPSB0aGlzLnNldHRpbmdzLnRpcF9sb2NhdGlvbl9wYXR0ZXJuc1t0aGlzLnNldHRpbmdzLnRpcF9zZXR0aW5ncy50aXBfbG9jYXRpb25dO1xuXG4gICAgICAgICAgLy8gc2Nyb2xsIGFuZCBoaWRlIGJnIGlmIG5vdCBtb2RhbFxuICAgICAgICAgIGlmICghL2JvZHkvaS50ZXN0KHRoaXMuc2V0dGluZ3MuJHRhcmdldC5zZWxlY3RvcikpIHtcbiAgICAgICAgICAgIHZhciBqb3lyaWRlbW9kYWxiZyA9ICQoJy5qb3lyaWRlLW1vZGFsLWJnJyk7XG4gICAgICAgICAgICBpZiAoL3BvcC9pLnRlc3QodGhpcy5zZXR0aW5ncy50aXBBbmltYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgam95cmlkZW1vZGFsYmcuaGlkZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBqb3lyaWRlbW9kYWxiZy5mYWRlT3V0KHRoaXMuc2V0dGluZ3MudGlwQW5pbWF0aW9uRmFkZVNwZWVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsX3RvKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHRoaXMuaXNfcGhvbmUoKSkge1xuICAgICAgICAgICAgdGhpcy5wb3NfcGhvbmUodHJ1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucG9zX2RlZmF1bHQodHJ1ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgJHRpbWVyID0gdGhpcy5zZXR0aW5ncy4kbmV4dF90aXAuZmluZCgnLmpveXJpZGUtdGltZXItaW5kaWNhdG9yJyk7XG5cbiAgICAgICAgICBpZiAoL3BvcC9pLnRlc3QodGhpcy5zZXR0aW5ncy50aXBfYW5pbWF0aW9uKSkge1xuXG4gICAgICAgICAgICAkdGltZXIud2lkdGgoMCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnRpbWVyID4gMCkge1xuXG4gICAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MuJG5leHRfdGlwLnNob3coKTtcblxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkdGltZXIuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICB3aWR0aCA6ICR0aW1lci5wYXJlbnQoKS53aWR0aCgpXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5zZXR0aW5ncy50aW1lciwgJ2xpbmVhcicpO1xuICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIHRoaXMuc2V0dGluZ3MudGlwX2FuaW1hdGlvbl9mYWRlX3NwZWVkKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy4kbmV4dF90aXAuc2hvdygpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKC9mYWRlL2kudGVzdCh0aGlzLnNldHRpbmdzLnRpcF9hbmltYXRpb24pKSB7XG5cbiAgICAgICAgICAgICR0aW1lci53aWR0aCgwKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MudGltZXIgPiAwKSB7XG5cbiAgICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy4kbmV4dF90aXBcbiAgICAgICAgICAgICAgICAuZmFkZUluKHRoaXMuc2V0dGluZ3MudGlwX2FuaW1hdGlvbl9mYWRlX3NwZWVkKVxuICAgICAgICAgICAgICAgIC5zaG93KCk7XG5cbiAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJHRpbWVyLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgd2lkdGggOiAkdGltZXIucGFyZW50KCkud2lkdGgoKVxuICAgICAgICAgICAgICAgIH0sIHRoaXMuc2V0dGluZ3MudGltZXIsICdsaW5lYXInKTtcbiAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCB0aGlzLnNldHRpbmdzLnRpcF9hbmltYXRpb25fZmFkZV9zcGVlZCk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MuJG5leHRfdGlwLmZhZGVJbih0aGlzLnNldHRpbmdzLnRpcF9hbmltYXRpb25fZmFkZV9zcGVlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5zZXR0aW5ncy4kY3VycmVudF90aXAgPSB0aGlzLnNldHRpbmdzLiRuZXh0X3RpcDtcblxuICAgICAgICAvLyBza2lwIG5vbi1leGlzdGFudCB0YXJnZXRzXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zZXR0aW5ncy4kbGkgJiYgdGhpcy5zZXR0aW5ncy4kdGFyZ2V0Lmxlbmd0aCA8IDEpIHtcblxuICAgICAgICAgIHRoaXMuc2hvdyhpbml0LCBpc19wcmV2KTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgdGhpcy5lbmQoKTtcblxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgIHRoaXMuc2V0dGluZ3MucGF1c2VkID0gdHJ1ZTtcblxuICAgICAgfVxuXG4gICAgfSxcblxuICAgIGlzX3Bob25lIDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG1hdGNoTWVkaWEoRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzLnNtYWxsKS5tYXRjaGVzICYmXG4gICAgICAgICFtYXRjaE1lZGlhKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllcy5tZWRpdW0pLm1hdGNoZXM7XG4gICAgfSxcblxuICAgIGhpZGUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncy5tb2RhbCAmJiB0aGlzLnNldHRpbmdzLmV4cG9zZSkge1xuICAgICAgICB0aGlzLnVuX2V4cG9zZSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuc2V0dGluZ3MubW9kYWwpIHtcbiAgICAgICAgJCgnLmpveXJpZGUtbW9kYWwtYmcnKS5oaWRlKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFByZXZlbnQgc2Nyb2xsIGJvdW5jaW5nLi4ud2FpdCB0byByZW1vdmUgZnJvbSBsYXlvdXRcbiAgICAgIHRoaXMuc2V0dGluZ3MuJGN1cnJlbnRfdGlwLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgIHNldFRpbWVvdXQoJC5wcm94eShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICB0aGlzLmNzcygndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gICAgICB9LCB0aGlzLnNldHRpbmdzLiRjdXJyZW50X3RpcCksIDApO1xuICAgICAgdGhpcy5zZXR0aW5ncy5wb3N0X3N0ZXBfY2FsbGJhY2sodGhpcy5zZXR0aW5ncy4kbGkuaW5kZXgoKSxcbiAgICAgICAgdGhpcy5zZXR0aW5ncy4kY3VycmVudF90aXApO1xuICAgIH0sXG5cbiAgICBzZXRfbGkgOiBmdW5jdGlvbiAoaW5pdCwgaXNfcHJldikge1xuICAgICAgaWYgKGluaXQpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy4kbGkgPSB0aGlzLnNldHRpbmdzLiR0aXBfY29udGVudC5lcSh0aGlzLnNldHRpbmdzLnN0YXJ0X29mZnNldCk7XG4gICAgICAgIHRoaXMuc2V0X25leHRfdGlwKCk7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MuJGN1cnJlbnRfdGlwID0gdGhpcy5zZXR0aW5ncy4kbmV4dF90aXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNfcHJldikge1xuICAgICAgICAgIHRoaXMuc2V0dGluZ3MuJGxpID0gdGhpcy5zZXR0aW5ncy4kbGkucHJldigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2V0dGluZ3MuJGxpID0gdGhpcy5zZXR0aW5ncy4kbGkubmV4dCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0X25leHRfdGlwKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2V0X3RhcmdldCgpO1xuICAgIH0sXG5cbiAgICBzZXRfbmV4dF90aXAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnNldHRpbmdzLiRuZXh0X3RpcCA9ICQoJy5qb3lyaWRlLXRpcC1ndWlkZScpLmVxKHRoaXMuc2V0dGluZ3MuJGxpLmluZGV4KCkpO1xuICAgICAgdGhpcy5zZXR0aW5ncy4kbmV4dF90aXAuZGF0YSgnY2xvc2VkJywgJycpO1xuICAgIH0sXG5cbiAgICBzZXRfdGFyZ2V0IDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNsID0gdGhpcy5zZXR0aW5ncy4kbGkuYXR0cih0aGlzLmFkZF9uYW1lc3BhY2UoJ2RhdGEtY2xhc3MnKSksXG4gICAgICAgICAgaWQgPSB0aGlzLnNldHRpbmdzLiRsaS5hdHRyKHRoaXMuYWRkX25hbWVzcGFjZSgnZGF0YS1pZCcpKSxcbiAgICAgICAgICAkc2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGlkKSB7XG4gICAgICAgICAgICAgIHJldHVybiAkKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNsKSB7XG4gICAgICAgICAgICAgIHJldHVybiAkKCcuJyArIGNsKS5maXJzdCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuICQoJ2JvZHknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuXG4gICAgICB0aGlzLnNldHRpbmdzLiR0YXJnZXQgPSAkc2VsKCk7XG4gICAgfSxcblxuICAgIHNjcm9sbF90byA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB3aW5kb3dfaGFsZiwgdGlwT2Zmc2V0O1xuXG4gICAgICB3aW5kb3dfaGFsZiA9ICQod2luZG93KS5oZWlnaHQoKSAvIDI7XG4gICAgICB0aXBPZmZzZXQgPSBNYXRoLmNlaWwodGhpcy5zZXR0aW5ncy4kdGFyZ2V0Lm9mZnNldCgpLnRvcCAtIHdpbmRvd19oYWxmICsgdGhpcy5zZXR0aW5ncy4kbmV4dF90aXAub3V0ZXJIZWlnaHQoKSk7XG5cbiAgICAgIGlmICh0aXBPZmZzZXQgIT0gMCkge1xuICAgICAgICAkKCdodG1sLCBib2R5Jykuc3RvcCgpLmFuaW1hdGUoe1xuICAgICAgICAgIHNjcm9sbFRvcCA6IHRpcE9mZnNldFxuICAgICAgICB9LCB0aGlzLnNldHRpbmdzLnNjcm9sbF9zcGVlZCwgJ3N3aW5nJyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHBhdXNlZCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAoJC5pbkFycmF5KCh0aGlzLnNldHRpbmdzLiRsaS5pbmRleCgpICsgMSksIHRoaXMuc2V0dGluZ3MucGF1c2VfYWZ0ZXIpID09PSAtMSk7XG4gICAgfSxcblxuICAgIHJlc3RhcnQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmhpZGUoKTtcbiAgICAgIHRoaXMuc2V0dGluZ3MuJGxpID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5zaG93KCdpbml0Jyk7XG4gICAgfSxcblxuICAgIHBvc19kZWZhdWx0IDogZnVuY3Rpb24gKGluaXQpIHtcbiAgICAgIHZhciAkbnViID0gdGhpcy5zZXR0aW5ncy4kbmV4dF90aXAuZmluZCgnLmpveXJpZGUtbnViJyksXG4gICAgICAgICAgbnViX3dpZHRoID0gTWF0aC5jZWlsKCRudWIub3V0ZXJXaWR0aCgpIC8gMiksXG4gICAgICAgICAgbnViX2hlaWdodCA9IE1hdGguY2VpbCgkbnViLm91dGVySGVpZ2h0KCkgLyAyKSxcbiAgICAgICAgICB0b2dnbGUgPSBpbml0IHx8IGZhbHNlO1xuXG4gICAgICAvLyB0aXAgbXVzdCBub3QgYmUgXCJkaXNwbGF5OiBub25lXCIgdG8gY2FsY3VsYXRlIHBvc2l0aW9uXG4gICAgICBpZiAodG9nZ2xlKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MuJG5leHRfdGlwLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy4kbmV4dF90aXAuc2hvdygpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIS9ib2R5L2kudGVzdCh0aGlzLnNldHRpbmdzLiR0YXJnZXQuc2VsZWN0b3IpKSB7XG4gICAgICAgICAgdmFyIHRvcEFkanVzdG1lbnQgPSB0aGlzLnNldHRpbmdzLnRpcF9zZXR0aW5ncy50aXBBZGp1c3RtZW50WSA/IHBhcnNlSW50KHRoaXMuc2V0dGluZ3MudGlwX3NldHRpbmdzLnRpcEFkanVzdG1lbnRZKSA6IDAsXG4gICAgICAgICAgICAgIGxlZnRBZGp1c3RtZW50ID0gdGhpcy5zZXR0aW5ncy50aXBfc2V0dGluZ3MudGlwQWRqdXN0bWVudFggPyBwYXJzZUludCh0aGlzLnNldHRpbmdzLnRpcF9zZXR0aW5ncy50aXBBZGp1c3RtZW50WCkgOiAwO1xuXG4gICAgICAgICAgaWYgKHRoaXMuYm90dG9tKCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnJ0bCkge1xuICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzLiRuZXh0X3RpcC5jc3Moe1xuICAgICAgICAgICAgICAgIHRvcCA6ICh0aGlzLnNldHRpbmdzLiR0YXJnZXQub2Zmc2V0KCkudG9wICsgbnViX2hlaWdodCArIHRoaXMuc2V0dGluZ3MuJHRhcmdldC5vdXRlckhlaWdodCgpICsgdG9wQWRqdXN0bWVudCksXG4gICAgICAgICAgICAgICAgbGVmdCA6IHRoaXMuc2V0dGluZ3MuJHRhcmdldC5vZmZzZXQoKS5sZWZ0ICsgdGhpcy5zZXR0aW5ncy4kdGFyZ2V0Lm91dGVyV2lkdGgoKSAtIHRoaXMuc2V0dGluZ3MuJG5leHRfdGlwLm91dGVyV2lkdGgoKSArIGxlZnRBZGp1c3RtZW50fSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzLiRuZXh0X3RpcC5jc3Moe1xuICAgICAgICAgICAgICAgIHRvcCA6ICh0aGlzLnNldHRpbmdzLiR0YXJnZXQub2Zmc2V0KCkudG9wICsgbnViX2hlaWdodCArIHRoaXMuc2V0dGluZ3MuJHRhcmdldC5vdXRlckhlaWdodCgpICsgdG9wQWRqdXN0bWVudCksXG4gICAgICAgICAgICAgICAgbGVmdCA6IHRoaXMuc2V0dGluZ3MuJHRhcmdldC5vZmZzZXQoKS5sZWZ0ICsgbGVmdEFkanVzdG1lbnR9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5udWJfcG9zaXRpb24oJG51YiwgdGhpcy5zZXR0aW5ncy50aXBfc2V0dGluZ3MubnViX3Bvc2l0aW9uLCAndG9wJyk7XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudG9wKCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnJ0bCkge1xuICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzLiRuZXh0X3RpcC5jc3Moe1xuICAgICAgICAgICAgICAgIHRvcCA6ICh0aGlzLnNldHRpbmdzLiR0YXJnZXQub2Zmc2V0KCkudG9wIC0gdGhpcy5zZXR0aW5ncy4kbmV4dF90aXAub3V0ZXJIZWlnaHQoKSAtIG51Yl9oZWlnaHQgKyB0b3BBZGp1c3RtZW50KSxcbiAgICAgICAgICAgICAgICBsZWZ0IDogdGhpcy5zZXR0aW5ncy4kdGFyZ2V0Lm9mZnNldCgpLmxlZnQgKyB0aGlzLnNldHRpbmdzLiR0YXJnZXQub3V0ZXJXaWR0aCgpIC0gdGhpcy5zZXR0aW5ncy4kbmV4dF90aXAub3V0ZXJXaWR0aCgpfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzLiRuZXh0X3RpcC5jc3Moe1xuICAgICAgICAgICAgICAgIHRvcCA6ICh0aGlzLnNldHRpbmdzLiR0YXJnZXQub2Zmc2V0KCkudG9wIC0gdGhpcy5zZXR0aW5ncy4kbmV4dF90aXAub3V0ZXJIZWlnaHQoKSAtIG51Yl9oZWlnaHQgKyB0b3BBZGp1c3RtZW50KSxcbiAgICAgICAgICAgICAgICBsZWZ0IDogdGhpcy5zZXR0aW5ncy4kdGFyZ2V0Lm9mZnNldCgpLmxlZnQgKyBsZWZ0QWRqdXN0bWVudH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm51Yl9wb3NpdGlvbigkbnViLCB0aGlzLnNldHRpbmdzLnRpcF9zZXR0aW5ncy5udWJfcG9zaXRpb24sICdib3R0b20nKTtcblxuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5yaWdodCgpKSB7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MuJG5leHRfdGlwLmNzcyh7XG4gICAgICAgICAgICAgIHRvcCA6IHRoaXMuc2V0dGluZ3MuJHRhcmdldC5vZmZzZXQoKS50b3AgKyB0b3BBZGp1c3RtZW50LFxuICAgICAgICAgICAgICBsZWZ0IDogKHRoaXMuc2V0dGluZ3MuJHRhcmdldC5vdXRlcldpZHRoKCkgKyB0aGlzLnNldHRpbmdzLiR0YXJnZXQub2Zmc2V0KCkubGVmdCArIG51Yl93aWR0aCArIGxlZnRBZGp1c3RtZW50KX0pO1xuXG4gICAgICAgICAgICB0aGlzLm51Yl9wb3NpdGlvbigkbnViLCB0aGlzLnNldHRpbmdzLnRpcF9zZXR0aW5ncy5udWJfcG9zaXRpb24sICdsZWZ0Jyk7XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMubGVmdCgpKSB7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MuJG5leHRfdGlwLmNzcyh7XG4gICAgICAgICAgICAgIHRvcCA6IHRoaXMuc2V0dGluZ3MuJHRhcmdldC5vZmZzZXQoKS50b3AgKyB0b3BBZGp1c3RtZW50LFxuICAgICAgICAgICAgICBsZWZ0IDogKHRoaXMuc2V0dGluZ3MuJHRhcmdldC5vZmZzZXQoKS5sZWZ0IC0gdGhpcy5zZXR0aW5ncy4kbmV4dF90aXAub3V0ZXJXaWR0aCgpIC0gbnViX3dpZHRoICsgbGVmdEFkanVzdG1lbnQpfSk7XG5cbiAgICAgICAgICAgIHRoaXMubnViX3Bvc2l0aW9uKCRudWIsIHRoaXMuc2V0dGluZ3MudGlwX3NldHRpbmdzLm51Yl9wb3NpdGlvbiwgJ3JpZ2h0Jyk7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIXRoaXMudmlzaWJsZSh0aGlzLmNvcm5lcnModGhpcy5zZXR0aW5ncy4kbmV4dF90aXApKSAmJiB0aGlzLnNldHRpbmdzLmF0dGVtcHRzIDwgdGhpcy5zZXR0aW5ncy50aXBfc2V0dGluZ3MudGlwX2xvY2F0aW9uX3BhdHRlcm4ubGVuZ3RoKSB7XG5cbiAgICAgICAgICAgICRudWIucmVtb3ZlQ2xhc3MoJ2JvdHRvbScpXG4gICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygndG9wJylcbiAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdyaWdodCcpXG4gICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnbGVmdCcpO1xuXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLnRpcF9zZXR0aW5ncy50aXBfbG9jYXRpb24gPSB0aGlzLnNldHRpbmdzLnRpcF9zZXR0aW5ncy50aXBfbG9jYXRpb25fcGF0dGVyblt0aGlzLnNldHRpbmdzLmF0dGVtcHRzXTtcblxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5hdHRlbXB0cysrO1xuXG4gICAgICAgICAgICB0aGlzLnBvc19kZWZhdWx0KCk7XG5cbiAgICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5zZXR0aW5ncy4kbGkubGVuZ3RoKSB7XG5cbiAgICAgICAgdGhpcy5wb3NfbW9kYWwoJG51Yik7XG5cbiAgICAgIH1cblxuICAgICAgaWYgKHRvZ2dsZSkge1xuICAgICAgICB0aGlzLnNldHRpbmdzLiRuZXh0X3RpcC5oaWRlKCk7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MuJG5leHRfdGlwLmNzcygndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgcG9zX3Bob25lIDogZnVuY3Rpb24gKGluaXQpIHtcbiAgICAgIHZhciB0aXBfaGVpZ2h0ID0gdGhpcy5zZXR0aW5ncy4kbmV4dF90aXAub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICB0aXBfb2Zmc2V0ID0gdGhpcy5zZXR0aW5ncy4kbmV4dF90aXAub2Zmc2V0KCksXG4gICAgICAgICAgdGFyZ2V0X2hlaWdodCA9IHRoaXMuc2V0dGluZ3MuJHRhcmdldC5vdXRlckhlaWdodCgpLFxuICAgICAgICAgICRudWIgPSAkKCcuam95cmlkZS1udWInLCB0aGlzLnNldHRpbmdzLiRuZXh0X3RpcCksXG4gICAgICAgICAgbnViX2hlaWdodCA9IE1hdGguY2VpbCgkbnViLm91dGVySGVpZ2h0KCkgLyAyKSxcbiAgICAgICAgICB0b2dnbGUgPSBpbml0IHx8IGZhbHNlO1xuXG4gICAgICAkbnViLnJlbW92ZUNsYXNzKCdib3R0b20nKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ3RvcCcpXG4gICAgICAgIC5yZW1vdmVDbGFzcygncmlnaHQnKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2xlZnQnKTtcblxuICAgICAgaWYgKHRvZ2dsZSkge1xuICAgICAgICB0aGlzLnNldHRpbmdzLiRuZXh0X3RpcC5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MuJG5leHRfdGlwLnNob3coKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCEvYm9keS9pLnRlc3QodGhpcy5zZXR0aW5ncy4kdGFyZ2V0LnNlbGVjdG9yKSkge1xuXG4gICAgICAgIGlmICh0aGlzLnRvcCgpKSB7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MuJG5leHRfdGlwLm9mZnNldCh7dG9wIDogdGhpcy5zZXR0aW5ncy4kdGFyZ2V0Lm9mZnNldCgpLnRvcCAtIHRpcF9oZWlnaHQgLSBudWJfaGVpZ2h0fSk7XG4gICAgICAgICAgICAkbnViLmFkZENsYXNzKCdib3R0b20nKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgdGhpcy5zZXR0aW5ncy4kbmV4dF90aXAub2Zmc2V0KHt0b3AgOiB0aGlzLnNldHRpbmdzLiR0YXJnZXQub2Zmc2V0KCkudG9wICsgdGFyZ2V0X2hlaWdodCArIG51Yl9oZWlnaHR9KTtcbiAgICAgICAgICAkbnViLmFkZENsYXNzKCd0b3AnKTtcblxuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5zZXR0aW5ncy4kbGkubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMucG9zX21vZGFsKCRudWIpO1xuICAgICAgfVxuXG4gICAgICBpZiAodG9nZ2xlKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MuJG5leHRfdGlwLmhpZGUoKTtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy4kbmV4dF90aXAuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcG9zX21vZGFsIDogZnVuY3Rpb24gKCRudWIpIHtcbiAgICAgIHRoaXMuY2VudGVyKCk7XG4gICAgICAkbnViLmhpZGUoKTtcblxuICAgICAgdGhpcy5zaG93X21vZGFsKCk7XG4gICAgfSxcblxuICAgIHNob3dfbW9kYWwgOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIXRoaXMuc2V0dGluZ3MuJG5leHRfdGlwLmRhdGEoJ2Nsb3NlZCcpKSB7XG4gICAgICAgIHZhciBqb3lyaWRlbW9kYWxiZyA9ICAkKCcuam95cmlkZS1tb2RhbC1iZycpO1xuICAgICAgICBpZiAoam95cmlkZW1vZGFsYmcubGVuZ3RoIDwgMSkge1xuICAgICAgICAgIHZhciBqb3lyaWRlbW9kYWxiZyA9ICQodGhpcy5zZXR0aW5ncy50ZW1wbGF0ZS5tb2RhbCk7XG4gICAgICAgICAgam95cmlkZW1vZGFsYmcuYXBwZW5kVG8oJ2JvZHknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgvcG9wL2kudGVzdCh0aGlzLnNldHRpbmdzLnRpcF9hbmltYXRpb24pKSB7XG4gICAgICAgICAgICBqb3lyaWRlbW9kYWxiZy5zaG93KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqb3lyaWRlbW9kYWxiZy5mYWRlSW4odGhpcy5zZXR0aW5ncy50aXBfYW5pbWF0aW9uX2ZhZGVfc3BlZWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGV4cG9zZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBleHBvc2UsXG4gICAgICAgICAgZXhwb3NlQ292ZXIsXG4gICAgICAgICAgZWwsXG4gICAgICAgICAgb3JpZ0NTUyxcbiAgICAgICAgICBvcmlnQ2xhc3NlcyxcbiAgICAgICAgICByYW5kSWQgPSAnZXhwb3NlLScgKyB0aGlzLnJhbmRvbV9zdHIoNik7XG5cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiAkKSB7XG4gICAgICAgIGVsID0gYXJndW1lbnRzWzBdO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnNldHRpbmdzLiR0YXJnZXQgJiYgIS9ib2R5L2kudGVzdCh0aGlzLnNldHRpbmdzLiR0YXJnZXQuc2VsZWN0b3IpKSB7XG4gICAgICAgIGVsID0gdGhpcy5zZXR0aW5ncy4kdGFyZ2V0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZWwubGVuZ3RoIDwgMSkge1xuICAgICAgICBpZiAod2luZG93LmNvbnNvbGUpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdlbGVtZW50IG5vdCB2YWxpZCcsIGVsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGV4cG9zZSA9ICQodGhpcy5zZXR0aW5ncy50ZW1wbGF0ZS5leHBvc2UpO1xuICAgICAgdGhpcy5zZXR0aW5ncy4kYm9keS5hcHBlbmQoZXhwb3NlKTtcbiAgICAgIGV4cG9zZS5jc3Moe1xuICAgICAgICB0b3AgOiBlbC5vZmZzZXQoKS50b3AsXG4gICAgICAgIGxlZnQgOiBlbC5vZmZzZXQoKS5sZWZ0LFxuICAgICAgICB3aWR0aCA6IGVsLm91dGVyV2lkdGgodHJ1ZSksXG4gICAgICAgIGhlaWdodCA6IGVsLm91dGVySGVpZ2h0KHRydWUpXG4gICAgICB9KTtcblxuICAgICAgZXhwb3NlQ292ZXIgPSAkKHRoaXMuc2V0dGluZ3MudGVtcGxhdGUuZXhwb3NlX2NvdmVyKTtcblxuICAgICAgb3JpZ0NTUyA9IHtcbiAgICAgICAgekluZGV4IDogZWwuY3NzKCd6LWluZGV4JyksXG4gICAgICAgIHBvc2l0aW9uIDogZWwuY3NzKCdwb3NpdGlvbicpXG4gICAgICB9O1xuXG4gICAgICBvcmlnQ2xhc3NlcyA9IGVsLmF0dHIoJ2NsYXNzJykgPT0gbnVsbCA/ICcnIDogZWwuYXR0cignY2xhc3MnKTtcblxuICAgICAgZWwuY3NzKCd6LWluZGV4JywgcGFyc2VJbnQoZXhwb3NlLmNzcygnei1pbmRleCcpKSArIDEpO1xuXG4gICAgICBpZiAob3JpZ0NTUy5wb3NpdGlvbiA9PSAnc3RhdGljJykge1xuICAgICAgICBlbC5jc3MoJ3Bvc2l0aW9uJywgJ3JlbGF0aXZlJyk7XG4gICAgICB9XG5cbiAgICAgIGVsLmRhdGEoJ2V4cG9zZS1jc3MnLCBvcmlnQ1NTKTtcbiAgICAgIGVsLmRhdGEoJ29yaWctY2xhc3MnLCBvcmlnQ2xhc3Nlcyk7XG4gICAgICBlbC5hdHRyKCdjbGFzcycsIG9yaWdDbGFzc2VzICsgJyAnICsgdGhpcy5zZXR0aW5ncy5leHBvc2VfYWRkX2NsYXNzKTtcblxuICAgICAgZXhwb3NlQ292ZXIuY3NzKHtcbiAgICAgICAgdG9wIDogZWwub2Zmc2V0KCkudG9wLFxuICAgICAgICBsZWZ0IDogZWwub2Zmc2V0KCkubGVmdCxcbiAgICAgICAgd2lkdGggOiBlbC5vdXRlcldpZHRoKHRydWUpLFxuICAgICAgICBoZWlnaHQgOiBlbC5vdXRlckhlaWdodCh0cnVlKVxuICAgICAgfSk7XG5cbiAgICAgIGlmICh0aGlzLnNldHRpbmdzLm1vZGFsKSB7XG4gICAgICAgIHRoaXMuc2hvd19tb2RhbCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnNldHRpbmdzLiRib2R5LmFwcGVuZChleHBvc2VDb3Zlcik7XG4gICAgICBleHBvc2UuYWRkQ2xhc3MocmFuZElkKTtcbiAgICAgIGV4cG9zZUNvdmVyLmFkZENsYXNzKHJhbmRJZCk7XG4gICAgICBlbC5kYXRhKCdleHBvc2UnLCByYW5kSWQpO1xuICAgICAgdGhpcy5zZXR0aW5ncy5wb3N0X2V4cG9zZV9jYWxsYmFjayh0aGlzLnNldHRpbmdzLiRsaS5pbmRleCgpLCB0aGlzLnNldHRpbmdzLiRuZXh0X3RpcCwgZWwpO1xuICAgICAgdGhpcy5hZGRfZXhwb3NlZChlbCk7XG4gICAgfSxcblxuICAgIHVuX2V4cG9zZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBleHBvc2VJZCxcbiAgICAgICAgICBlbCxcbiAgICAgICAgICBleHBvc2UsXG4gICAgICAgICAgb3JpZ0NTUyxcbiAgICAgICAgICBvcmlnQ2xhc3NlcyxcbiAgICAgICAgICBjbGVhckFsbCA9IGZhbHNlO1xuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdIGluc3RhbmNlb2YgJCkge1xuICAgICAgICBlbCA9IGFyZ3VtZW50c1swXTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5zZXR0aW5ncy4kdGFyZ2V0ICYmICEvYm9keS9pLnRlc3QodGhpcy5zZXR0aW5ncy4kdGFyZ2V0LnNlbGVjdG9yKSkge1xuICAgICAgICBlbCA9IHRoaXMuc2V0dGluZ3MuJHRhcmdldDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGVsLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5jb25zb2xlKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignZWxlbWVudCBub3QgdmFsaWQnLCBlbCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBleHBvc2VJZCA9IGVsLmRhdGEoJ2V4cG9zZScpO1xuICAgICAgZXhwb3NlID0gJCgnLicgKyBleHBvc2VJZCk7XG5cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBjbGVhckFsbCA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNsZWFyQWxsID09PSB0cnVlKSB7XG4gICAgICAgICQoJy5qb3lyaWRlLWV4cG9zZS13cmFwcGVyLC5qb3lyaWRlLWV4cG9zZS1jb3ZlcicpLnJlbW92ZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXhwb3NlLnJlbW92ZSgpO1xuICAgICAgfVxuXG4gICAgICBvcmlnQ1NTID0gZWwuZGF0YSgnZXhwb3NlLWNzcycpO1xuXG4gICAgICBpZiAob3JpZ0NTUy56SW5kZXggPT0gJ2F1dG8nKSB7XG4gICAgICAgIGVsLmNzcygnei1pbmRleCcsICcnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsLmNzcygnei1pbmRleCcsIG9yaWdDU1MuekluZGV4KTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9yaWdDU1MucG9zaXRpb24gIT0gZWwuY3NzKCdwb3NpdGlvbicpKSB7XG4gICAgICAgIGlmIChvcmlnQ1NTLnBvc2l0aW9uID09ICdzdGF0aWMnKSB7Ly8gdGhpcyBpcyBkZWZhdWx0LCBubyBuZWVkIHRvIHNldCBpdC5cbiAgICAgICAgICBlbC5jc3MoJ3Bvc2l0aW9uJywgJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsLmNzcygncG9zaXRpb24nLCBvcmlnQ1NTLnBvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBvcmlnQ2xhc3NlcyA9IGVsLmRhdGEoJ29yaWctY2xhc3MnKTtcbiAgICAgIGVsLmF0dHIoJ2NsYXNzJywgb3JpZ0NsYXNzZXMpO1xuICAgICAgZWwucmVtb3ZlRGF0YSgnb3JpZy1jbGFzc2VzJyk7XG5cbiAgICAgIGVsLnJlbW92ZURhdGEoJ2V4cG9zZScpO1xuICAgICAgZWwucmVtb3ZlRGF0YSgnZXhwb3NlLXotaW5kZXgnKTtcbiAgICAgIHRoaXMucmVtb3ZlX2V4cG9zZWQoZWwpO1xuICAgIH0sXG5cbiAgICBhZGRfZXhwb3NlZCA6IGZ1bmN0aW9uIChlbCkge1xuICAgICAgdGhpcy5zZXR0aW5ncy5leHBvc2VkID0gdGhpcy5zZXR0aW5ncy5leHBvc2VkIHx8IFtdO1xuICAgICAgaWYgKGVsIGluc3RhbmNlb2YgJCB8fCB0eXBlb2YgZWwgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MuZXhwb3NlZC5wdXNoKGVsWzBdKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGVsID09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MuZXhwb3NlZC5wdXNoKGVsKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVtb3ZlX2V4cG9zZWQgOiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgIHZhciBzZWFyY2gsIGk7XG4gICAgICBpZiAoZWwgaW5zdGFuY2VvZiAkKSB7XG4gICAgICAgIHNlYXJjaCA9IGVsWzBdXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbCA9PSAnc3RyaW5nJykge1xuICAgICAgICBzZWFyY2ggPSBlbDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXR0aW5ncy5leHBvc2VkID0gdGhpcy5zZXR0aW5ncy5leHBvc2VkIHx8IFtdO1xuICAgICAgaSA9IHRoaXMuc2V0dGluZ3MuZXhwb3NlZC5sZW5ndGg7XG5cbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuZXhwb3NlZFtpXSA9PSBzZWFyY2gpIHtcbiAgICAgICAgICB0aGlzLnNldHRpbmdzLmV4cG9zZWQuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBjZW50ZXIgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHcgPSAkKHdpbmRvdyk7XG5cbiAgICAgIHRoaXMuc2V0dGluZ3MuJG5leHRfdGlwLmNzcyh7XG4gICAgICAgIHRvcCA6ICgoKCR3LmhlaWdodCgpIC0gdGhpcy5zZXR0aW5ncy4kbmV4dF90aXAub3V0ZXJIZWlnaHQoKSkgLyAyKSArICR3LnNjcm9sbFRvcCgpKSxcbiAgICAgICAgbGVmdCA6ICgoKCR3LndpZHRoKCkgLSB0aGlzLnNldHRpbmdzLiRuZXh0X3RpcC5vdXRlcldpZHRoKCkpIC8gMikgKyAkdy5zY3JvbGxMZWZ0KCkpXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIGJvdHRvbSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAvYm90dG9tL2kudGVzdCh0aGlzLnNldHRpbmdzLnRpcF9zZXR0aW5ncy50aXBfbG9jYXRpb24pO1xuICAgIH0sXG5cbiAgICB0b3AgOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gL3RvcC9pLnRlc3QodGhpcy5zZXR0aW5ncy50aXBfc2V0dGluZ3MudGlwX2xvY2F0aW9uKTtcbiAgICB9LFxuXG4gICAgcmlnaHQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gL3JpZ2h0L2kudGVzdCh0aGlzLnNldHRpbmdzLnRpcF9zZXR0aW5ncy50aXBfbG9jYXRpb24pO1xuICAgIH0sXG5cbiAgICBsZWZ0IDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIC9sZWZ0L2kudGVzdCh0aGlzLnNldHRpbmdzLnRpcF9zZXR0aW5ncy50aXBfbG9jYXRpb24pO1xuICAgIH0sXG5cbiAgICBjb3JuZXJzIDogZnVuY3Rpb24gKGVsKSB7XG4gICAgICB2YXIgdyA9ICQod2luZG93KSxcbiAgICAgICAgICB3aW5kb3dfaGFsZiA9IHcuaGVpZ2h0KCkgLyAyLFxuICAgICAgICAgIC8vdXNpbmcgdGhpcyB0byBjYWxjdWxhdGUgc2luY2Ugc2Nyb2xsIG1heSBub3QgaGF2ZSBmaW5pc2hlZCB5ZXQuXG4gICAgICAgICAgdGlwT2Zmc2V0ID0gTWF0aC5jZWlsKHRoaXMuc2V0dGluZ3MuJHRhcmdldC5vZmZzZXQoKS50b3AgLSB3aW5kb3dfaGFsZiArIHRoaXMuc2V0dGluZ3MuJG5leHRfdGlwLm91dGVySGVpZ2h0KCkpLFxuICAgICAgICAgIHJpZ2h0ID0gdy53aWR0aCgpICsgdy5zY3JvbGxMZWZ0KCksXG4gICAgICAgICAgb2Zmc2V0Qm90dG9tID0gIHcuaGVpZ2h0KCkgKyB0aXBPZmZzZXQsXG4gICAgICAgICAgYm90dG9tID0gdy5oZWlnaHQoKSArIHcuc2Nyb2xsVG9wKCksXG4gICAgICAgICAgdG9wID0gdy5zY3JvbGxUb3AoKTtcblxuICAgICAgaWYgKHRpcE9mZnNldCA8IHRvcCkge1xuICAgICAgICBpZiAodGlwT2Zmc2V0IDwgMCkge1xuICAgICAgICAgIHRvcCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9wID0gdGlwT2Zmc2V0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChvZmZzZXRCb3R0b20gPiBib3R0b20pIHtcbiAgICAgICAgYm90dG9tID0gb2Zmc2V0Qm90dG9tO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gW1xuICAgICAgICBlbC5vZmZzZXQoKS50b3AgPCB0b3AsXG4gICAgICAgIHJpZ2h0IDwgZWwub2Zmc2V0KCkubGVmdCArIGVsLm91dGVyV2lkdGgoKSxcbiAgICAgICAgYm90dG9tIDwgZWwub2Zmc2V0KCkudG9wICsgZWwub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgdy5zY3JvbGxMZWZ0KCkgPiBlbC5vZmZzZXQoKS5sZWZ0XG4gICAgICBdO1xuICAgIH0sXG5cbiAgICB2aXNpYmxlIDogZnVuY3Rpb24gKGhpZGRlbl9jb3JuZXJzKSB7XG4gICAgICB2YXIgaSA9IGhpZGRlbl9jb3JuZXJzLmxlbmd0aDtcblxuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICBpZiAoaGlkZGVuX2Nvcm5lcnNbaV0pIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIG51Yl9wb3NpdGlvbiA6IGZ1bmN0aW9uIChudWIsIHBvcywgZGVmKSB7XG4gICAgICBpZiAocG9zID09PSAnYXV0bycpIHtcbiAgICAgICAgbnViLmFkZENsYXNzKGRlZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBudWIuYWRkQ2xhc3MocG9zKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RhcnRUaW1lciA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzLiRsaS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5hdXRvbWF0ZSA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgIHRoaXMuc2hvdygpO1xuICAgICAgICAgIHRoaXMuc3RhcnRUaW1lcigpO1xuICAgICAgICB9LmJpbmQodGhpcyksIHRoaXMuc2V0dGluZ3MudGltZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc2V0dGluZ3MuYXV0b21hdGUpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBlbmQgOiBmdW5jdGlvbiAoYWJvcnQpIHtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzLmNvb2tpZV9tb25zdGVyKSB7XG4gICAgICAgICQuY29va2llKHRoaXMuc2V0dGluZ3MuY29va2llX25hbWUsICdyaWRkZW4nLCB7ZXhwaXJlcyA6IHRoaXMuc2V0dGluZ3MuY29va2llX2V4cGlyZXMsIGRvbWFpbiA6IHRoaXMuc2V0dGluZ3MuY29va2llX2RvbWFpbn0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5zZXR0aW5ncy50aW1lciA+IDApIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc2V0dGluZ3MuYXV0b21hdGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5zZXR0aW5ncy5tb2RhbCAmJiB0aGlzLnNldHRpbmdzLmV4cG9zZSkge1xuICAgICAgICB0aGlzLnVuX2V4cG9zZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBVbnBsdWcga2V5c3Ryb2tlcyBsaXN0ZW5lclxuICAgICAgJCh0aGlzLnNjb3BlKS5vZmYoJ2tleXVwLmpveXJpZGUnKVxuXG4gICAgICB0aGlzLnNldHRpbmdzLiRuZXh0X3RpcC5kYXRhKCdjbG9zZWQnLCB0cnVlKTtcbiAgICAgIHRoaXMuc2V0dGluZ3MucmlkaW5nID0gZmFsc2U7XG5cbiAgICAgICQoJy5qb3lyaWRlLW1vZGFsLWJnJykuaGlkZSgpO1xuICAgICAgdGhpcy5zZXR0aW5ncy4kY3VycmVudF90aXAuaGlkZSgpO1xuXG4gICAgICBpZiAodHlwZW9mIGFib3J0ID09PSAndW5kZWZpbmVkJyB8fCBhYm9ydCA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3N0X3N0ZXBfY2FsbGJhY2sodGhpcy5zZXR0aW5ncy4kbGkuaW5kZXgoKSwgdGhpcy5zZXR0aW5ncy4kY3VycmVudF90aXApO1xuICAgICAgICB0aGlzLnNldHRpbmdzLnBvc3RfcmlkZV9jYWxsYmFjayh0aGlzLnNldHRpbmdzLiRsaS5pbmRleCgpLCB0aGlzLnNldHRpbmdzLiRjdXJyZW50X3RpcCk7XG4gICAgICB9XG5cbiAgICAgICQoJy5qb3lyaWRlLXRpcC1ndWlkZScpLnJlbW92ZSgpO1xuICAgIH0sXG5cbiAgICBvZmYgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAkKHRoaXMuc2NvcGUpLm9mZignLmpveXJpZGUnKTtcbiAgICAgICQod2luZG93KS5vZmYoJy5qb3lyaWRlJyk7XG4gICAgICAkKCcuam95cmlkZS1jbG9zZS10aXAsIC5qb3lyaWRlLW5leHQtdGlwLCAuam95cmlkZS1tb2RhbC1iZycpLm9mZignLmpveXJpZGUnKTtcbiAgICAgICQoJy5qb3lyaWRlLXRpcC1ndWlkZSwgLmpveXJpZGUtbW9kYWwtYmcnKS5yZW1vdmUoKTtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnNldHRpbmdzLmF1dG9tYXRlKTtcbiAgICAgIHRoaXMuc2V0dGluZ3MgPSB7fTtcbiAgICB9LFxuXG4gICAgcmVmbG93IDogZnVuY3Rpb24gKCkge31cbiAgfTtcbn0oalF1ZXJ5LCB3aW5kb3csIHdpbmRvdy5kb2N1bWVudCkpO1xuIiwiOyhmdW5jdGlvbiAoJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBGb3VuZGF0aW9uLmxpYnNbJ21hZ2VsbGFuLWV4cGVkaXRpb24nXSA9IHtcbiAgICBuYW1lIDogJ21hZ2VsbGFuLWV4cGVkaXRpb24nLFxuXG4gICAgdmVyc2lvbiA6ICc1LjUuMScsXG5cbiAgICBzZXR0aW5ncyA6IHtcbiAgICAgIGFjdGl2ZV9jbGFzcyA6ICdhY3RpdmUnLFxuICAgICAgdGhyZXNob2xkIDogMCwgLy8gcGl4ZWxzIGZyb20gdGhlIHRvcCBvZiB0aGUgZXhwZWRpdGlvbiBmb3IgaXQgdG8gYmVjb21lIGZpeGVzXG4gICAgICBkZXN0aW5hdGlvbl90aHJlc2hvbGQgOiAyMCwgLy8gcGl4ZWxzIGZyb20gdGhlIHRvcCBvZiBkZXN0aW5hdGlvbiBmb3IgaXQgdG8gYmUgY29uc2lkZXJlZCBhY3RpdmVcbiAgICAgIHRocm90dGxlX2RlbGF5IDogMzAsIC8vIGNhbGN1bGF0aW9uIHRocm90dGxpbmcgdG8gaW5jcmVhc2UgZnJhbWVyYXRlXG4gICAgICBmaXhlZF90b3AgOiAwLCAvLyB0b3AgZGlzdGFuY2UgaW4gcGl4ZWxzIGFzc2lnZW5kIHRvIHRoZSBmaXhlZCBlbGVtZW50IG9uIHNjcm9sbFxuICAgICAgb2Zmc2V0X2J5X2hlaWdodCA6IHRydWUsICAvLyB3aGV0aGVyIHRvIG9mZnNldCB0aGUgZGVzdGluYXRpb24gYnkgdGhlIGV4cGVkaXRpb24gaGVpZ2h0LiBVc3VhbGx5IHlvdSB3YW50IHRoaXMgdG8gYmUgdHJ1ZSwgdW5sZXNzIHlvdXIgZXhwZWRpdGlvbiBpcyBvbiB0aGUgc2lkZS5cbiAgICAgIGR1cmF0aW9uIDogNzAwLCAvLyBhbmltYXRpb24gZHVyYXRpb24gdGltZVxuICAgICAgZWFzaW5nIDogJ3N3aW5nJyAvLyBhbmltYXRpb24gZWFzaW5nXG4gICAgfSxcblxuICAgIGluaXQgOiBmdW5jdGlvbiAoc2NvcGUsIG1ldGhvZCwgb3B0aW9ucykge1xuICAgICAgRm91bmRhdGlvbi5pbmhlcml0KHRoaXMsICd0aHJvdHRsZScpO1xuICAgICAgdGhpcy5iaW5kaW5ncyhtZXRob2QsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICBldmVudHMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgUyA9IHNlbGYuUyxcbiAgICAgICAgICBzZXR0aW5ncyA9IHNlbGYuc2V0dGluZ3M7XG5cbiAgICAgIC8vIGluaXRpYWxpemUgZXhwZWRpdGlvbiBvZmZzZXRcbiAgICAgIHNlbGYuc2V0X2V4cGVkaXRpb25fcG9zaXRpb24oKTtcblxuICAgICAgUyhzZWxmLnNjb3BlKVxuICAgICAgICAub2ZmKCcubWFnZWxsYW4nKVxuICAgICAgICAub24oJ2NsaWNrLmZuZHRuLm1hZ2VsbGFuJywgJ1snICsgc2VsZi5hZGRfbmFtZXNwYWNlKCdkYXRhLW1hZ2VsbGFuLWFycml2YWwnKSArICddIGFbaHJlZl49XCIjXCJdJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgdmFyIGV4cGVkaXRpb24gPSAkKHRoaXMpLmNsb3Nlc3QoJ1snICsgc2VsZi5hdHRyX25hbWUoKSArICddJyksXG4gICAgICAgICAgICAgIHNldHRpbmdzID0gZXhwZWRpdGlvbi5kYXRhKCdtYWdlbGxhbi1leHBlZGl0aW9uLWluaXQnKSxcbiAgICAgICAgICAgICAgaGFzaCA9IHRoaXMuaGFzaC5zcGxpdCgnIycpLmpvaW4oJycpLFxuICAgICAgICAgICAgICB0YXJnZXQgPSAkKCdhW25hbWU9XCInICsgaGFzaCArICdcIl0nKTtcblxuICAgICAgICAgIGlmICh0YXJnZXQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0YXJnZXQgPSAkKCcjJyArIGhhc2gpO1xuXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQWNjb3VudCBmb3IgZXhwZWRpdGlvbiBoZWlnaHQgaWYgZml4ZWQgcG9zaXRpb25cbiAgICAgICAgICB2YXIgc2Nyb2xsX3RvcCA9IHRhcmdldC5vZmZzZXQoKS50b3AgLSBzZXR0aW5ncy5kZXN0aW5hdGlvbl90aHJlc2hvbGQgKyAxO1xuICAgICAgICAgIGlmIChzZXR0aW5ncy5vZmZzZXRfYnlfaGVpZ2h0KSB7XG4gICAgICAgICAgICBzY3JvbGxfdG9wID0gc2Nyb2xsX3RvcCAtIGV4cGVkaXRpb24ub3V0ZXJIZWlnaHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgJCgnaHRtbCwgYm9keScpLnN0b3AoKS5hbmltYXRlKHtcbiAgICAgICAgICAgICdzY3JvbGxUb3AnIDogc2Nyb2xsX3RvcFxuICAgICAgICAgIH0sIHNldHRpbmdzLmR1cmF0aW9uLCBzZXR0aW5ncy5lYXNpbmcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChoaXN0b3J5LnB1c2hTdGF0ZSkge1xuICAgICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCAnIycgKyBoYXNoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGxvY2F0aW9uLmhhc2ggPSAnIycgKyBoYXNoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAub24oJ3Njcm9sbC5mbmR0bi5tYWdlbGxhbicsIHNlbGYudGhyb3R0bGUodGhpcy5jaGVja19mb3JfYXJyaXZhbHMuYmluZCh0aGlzKSwgc2V0dGluZ3MudGhyb3R0bGVfZGVsYXkpKTtcbiAgICB9LFxuXG4gICAgY2hlY2tfZm9yX2Fycml2YWxzIDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgc2VsZi51cGRhdGVfYXJyaXZhbHMoKTtcbiAgICAgIHNlbGYudXBkYXRlX2V4cGVkaXRpb25fcG9zaXRpb25zKCk7XG4gICAgfSxcblxuICAgIHNldF9leHBlZGl0aW9uX3Bvc2l0aW9uIDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgJCgnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJz1maXhlZF0nLCBzZWxmLnNjb3BlKS5lYWNoKGZ1bmN0aW9uIChpZHgsIGVsKSB7XG4gICAgICAgIHZhciBleHBlZGl0aW9uID0gJCh0aGlzKSxcbiAgICAgICAgICAgIHNldHRpbmdzID0gZXhwZWRpdGlvbi5kYXRhKCdtYWdlbGxhbi1leHBlZGl0aW9uLWluaXQnKSxcbiAgICAgICAgICAgIHN0eWxlcyA9IGV4cGVkaXRpb24uYXR0cignc3R5bGVzJyksIC8vIHNhdmUgc3R5bGVzXG4gICAgICAgICAgICB0b3Bfb2Zmc2V0LCBmaXhlZF90b3A7XG5cbiAgICAgICAgZXhwZWRpdGlvbi5hdHRyKCdzdHlsZScsICcnKTtcbiAgICAgICAgdG9wX29mZnNldCA9IGV4cGVkaXRpb24ub2Zmc2V0KCkudG9wICsgc2V0dGluZ3MudGhyZXNob2xkO1xuXG4gICAgICAgIC8vc2V0IGZpeGVkLXRvcCBieSBhdHRyaWJ1dGVcbiAgICAgICAgZml4ZWRfdG9wID0gcGFyc2VJbnQoZXhwZWRpdGlvbi5kYXRhKCdtYWdlbGxhbi1maXhlZC10b3AnKSk7XG4gICAgICAgIGlmICghaXNOYU4oZml4ZWRfdG9wKSkge1xuICAgICAgICAgIHNlbGYuc2V0dGluZ3MuZml4ZWRfdG9wID0gZml4ZWRfdG9wO1xuICAgICAgICB9XG5cbiAgICAgICAgZXhwZWRpdGlvbi5kYXRhKHNlbGYuZGF0YV9hdHRyKCdtYWdlbGxhbi10b3Atb2Zmc2V0JyksIHRvcF9vZmZzZXQpO1xuICAgICAgICBleHBlZGl0aW9uLmF0dHIoJ3N0eWxlJywgc3R5bGVzKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB1cGRhdGVfZXhwZWRpdGlvbl9wb3NpdGlvbnMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgd2luZG93X3RvcF9vZmZzZXQgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG5cbiAgICAgICQoJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICc9Zml4ZWRdJywgc2VsZi5zY29wZSkuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBleHBlZGl0aW9uID0gJCh0aGlzKSxcbiAgICAgICAgICAgIHNldHRpbmdzID0gZXhwZWRpdGlvbi5kYXRhKCdtYWdlbGxhbi1leHBlZGl0aW9uLWluaXQnKSxcbiAgICAgICAgICAgIHN0eWxlcyA9IGV4cGVkaXRpb24uYXR0cignc3R5bGUnKSwgLy8gc2F2ZSBzdHlsZXNcbiAgICAgICAgICAgIHRvcF9vZmZzZXQgPSBleHBlZGl0aW9uLmRhdGEoJ21hZ2VsbGFuLXRvcC1vZmZzZXQnKTtcblxuICAgICAgICAvL3Njcm9sbCB0byB0aGUgdG9wIGRpc3RhbmNlXG4gICAgICAgIGlmICh3aW5kb3dfdG9wX29mZnNldCArIHNlbGYuc2V0dGluZ3MuZml4ZWRfdG9wID49IHRvcF9vZmZzZXQpIHtcbiAgICAgICAgICAvLyBQbGFjZWhvbGRlciBhbGxvd3MgaGVpZ2h0IGNhbGN1bGF0aW9ucyB0byBiZSBjb25zaXN0ZW50IGV2ZW4gd2hlblxuICAgICAgICAgIC8vIGFwcGVhcmluZyB0byBzd2l0Y2ggYmV0d2VlbiBmaXhlZC9ub24tZml4ZWQgcGxhY2VtZW50XG4gICAgICAgICAgdmFyIHBsYWNlaG9sZGVyID0gZXhwZWRpdGlvbi5wcmV2KCdbJyArIHNlbGYuYWRkX25hbWVzcGFjZSgnZGF0YS1tYWdlbGxhbi1leHBlZGl0aW9uLWNsb25lJykgKyAnXScpO1xuICAgICAgICAgIGlmIChwbGFjZWhvbGRlci5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gZXhwZWRpdGlvbi5jbG9uZSgpO1xuICAgICAgICAgICAgcGxhY2Vob2xkZXIucmVtb3ZlQXR0cihzZWxmLmF0dHJfbmFtZSgpKTtcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyLmF0dHIoc2VsZi5hZGRfbmFtZXNwYWNlKCdkYXRhLW1hZ2VsbGFuLWV4cGVkaXRpb24tY2xvbmUnKSwgJycpO1xuICAgICAgICAgICAgZXhwZWRpdGlvbi5iZWZvcmUocGxhY2Vob2xkZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBleHBlZGl0aW9uLmNzcyh7cG9zaXRpb24gOidmaXhlZCcsIHRvcCA6IHNldHRpbmdzLmZpeGVkX3RvcH0pLmFkZENsYXNzKCdmaXhlZCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGV4cGVkaXRpb24ucHJldignWycgKyBzZWxmLmFkZF9uYW1lc3BhY2UoJ2RhdGEtbWFnZWxsYW4tZXhwZWRpdGlvbi1jbG9uZScpICsgJ10nKS5yZW1vdmUoKTtcbiAgICAgICAgICBleHBlZGl0aW9uLmF0dHIoJ3N0eWxlJywgc3R5bGVzKS5jc3MoJ3Bvc2l0aW9uJywgJycpLmNzcygndG9wJywgJycpLnJlbW92ZUNsYXNzKCdmaXhlZCcpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgdXBkYXRlX2Fycml2YWxzIDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIHdpbmRvd190b3Bfb2Zmc2V0ID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuXG4gICAgICAkKCdbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnXScsIHNlbGYuc2NvcGUpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZXhwZWRpdGlvbiA9ICQodGhpcyksXG4gICAgICAgICAgICBzZXR0aW5ncyA9IGV4cGVkaXRpb24uZGF0YShzZWxmLmF0dHJfbmFtZSh0cnVlKSArICctaW5pdCcpLFxuICAgICAgICAgICAgb2Zmc2V0cyA9IHNlbGYub2Zmc2V0cyhleHBlZGl0aW9uLCB3aW5kb3dfdG9wX29mZnNldCksXG4gICAgICAgICAgICBhcnJpdmFscyA9IGV4cGVkaXRpb24uZmluZCgnWycgKyBzZWxmLmFkZF9uYW1lc3BhY2UoJ2RhdGEtbWFnZWxsYW4tYXJyaXZhbCcpICsgJ10nKSxcbiAgICAgICAgICAgIGFjdGl2ZV9pdGVtID0gZmFsc2U7XG4gICAgICAgIG9mZnNldHMuZWFjaChmdW5jdGlvbiAoaWR4LCBpdGVtKSB7XG4gICAgICAgICAgaWYgKGl0ZW0udmlld3BvcnRfb2Zmc2V0ID49IGl0ZW0udG9wX29mZnNldCkge1xuICAgICAgICAgICAgdmFyIGFycml2YWxzID0gZXhwZWRpdGlvbi5maW5kKCdbJyArIHNlbGYuYWRkX25hbWVzcGFjZSgnZGF0YS1tYWdlbGxhbi1hcnJpdmFsJykgKyAnXScpO1xuICAgICAgICAgICAgYXJyaXZhbHMubm90KGl0ZW0uYXJyaXZhbCkucmVtb3ZlQ2xhc3Moc2V0dGluZ3MuYWN0aXZlX2NsYXNzKTtcbiAgICAgICAgICAgIGl0ZW0uYXJyaXZhbC5hZGRDbGFzcyhzZXR0aW5ncy5hY3RpdmVfY2xhc3MpO1xuICAgICAgICAgICAgYWN0aXZlX2l0ZW0gPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIWFjdGl2ZV9pdGVtKSB7XG4gICAgICAgICAgYXJyaXZhbHMucmVtb3ZlQ2xhc3Moc2V0dGluZ3MuYWN0aXZlX2NsYXNzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIG9mZnNldHMgOiBmdW5jdGlvbiAoZXhwZWRpdGlvbiwgd2luZG93X29mZnNldCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIHNldHRpbmdzID0gZXhwZWRpdGlvbi5kYXRhKHNlbGYuYXR0cl9uYW1lKHRydWUpICsgJy1pbml0JyksXG4gICAgICAgICAgdmlld3BvcnRfb2Zmc2V0ID0gd2luZG93X29mZnNldDtcblxuICAgICAgcmV0dXJuIGV4cGVkaXRpb24uZmluZCgnWycgKyBzZWxmLmFkZF9uYW1lc3BhY2UoJ2RhdGEtbWFnZWxsYW4tYXJyaXZhbCcpICsgJ10nKS5tYXAoZnVuY3Rpb24gKGlkeCwgZWwpIHtcbiAgICAgICAgdmFyIG5hbWUgPSAkKHRoaXMpLmRhdGEoc2VsZi5kYXRhX2F0dHIoJ21hZ2VsbGFuLWFycml2YWwnKSksXG4gICAgICAgICAgICBkZXN0ID0gJCgnWycgKyBzZWxmLmFkZF9uYW1lc3BhY2UoJ2RhdGEtbWFnZWxsYW4tZGVzdGluYXRpb24nKSArICc9JyArIG5hbWUgKyAnXScpO1xuICAgICAgICBpZiAoZGVzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdmFyIHRvcF9vZmZzZXQgPSBkZXN0Lm9mZnNldCgpLnRvcCAtIHNldHRpbmdzLmRlc3RpbmF0aW9uX3RocmVzaG9sZDtcbiAgICAgICAgICBpZiAoc2V0dGluZ3Mub2Zmc2V0X2J5X2hlaWdodCkge1xuICAgICAgICAgICAgdG9wX29mZnNldCA9IHRvcF9vZmZzZXQgLSBleHBlZGl0aW9uLm91dGVySGVpZ2h0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRvcF9vZmZzZXQgPSBNYXRoLmZsb29yKHRvcF9vZmZzZXQpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbiA6IGRlc3QsXG4gICAgICAgICAgICBhcnJpdmFsIDogJCh0aGlzKSxcbiAgICAgICAgICAgIHRvcF9vZmZzZXQgOiB0b3Bfb2Zmc2V0LFxuICAgICAgICAgICAgdmlld3BvcnRfb2Zmc2V0IDogdmlld3BvcnRfb2Zmc2V0XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIGlmIChhLnRvcF9vZmZzZXQgPCBiLnRvcF9vZmZzZXQpIHtcbiAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGEudG9wX29mZnNldCA+IGIudG9wX29mZnNldCkge1xuICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGRhdGFfYXR0ciA6IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgIGlmICh0aGlzLm5hbWVzcGFjZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWVzcGFjZSArICctJyArIHN0cjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9LFxuXG4gICAgb2ZmIDogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5TKHRoaXMuc2NvcGUpLm9mZignLm1hZ2VsbGFuJyk7XG4gICAgICB0aGlzLlMod2luZG93KS5vZmYoJy5tYWdlbGxhbicpO1xuICAgIH0sXG5cbiAgICByZWZsb3cgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAvLyByZW1vdmUgcGxhY2Vob2xkZXIgZXhwZWRpdGlvbnMgdXNlZCBmb3IgaGVpZ2h0IGNhbGN1bGF0aW9uIHB1cnBvc2VzXG4gICAgICAkKCdbJyArIHNlbGYuYWRkX25hbWVzcGFjZSgnZGF0YS1tYWdlbGxhbi1leHBlZGl0aW9uLWNsb25lJykgKyAnXScsIHNlbGYuc2NvcGUpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcbn0oalF1ZXJ5LCB3aW5kb3csIHdpbmRvdy5kb2N1bWVudCkpO1xuIiwiOyhmdW5jdGlvbiAoJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBGb3VuZGF0aW9uLmxpYnMub2ZmY2FudmFzID0ge1xuICAgIG5hbWUgOiAnb2ZmY2FudmFzJyxcblxuICAgIHZlcnNpb24gOiAnNS41LjEnLFxuXG4gICAgc2V0dGluZ3MgOiB7XG4gICAgICBvcGVuX21ldGhvZCA6ICdtb3ZlJyxcbiAgICAgIGNsb3NlX29uX2NsaWNrIDogZmFsc2VcbiAgICB9LFxuXG4gICAgaW5pdCA6IGZ1bmN0aW9uIChzY29wZSwgbWV0aG9kLCBvcHRpb25zKSB7XG4gICAgICB0aGlzLmJpbmRpbmdzKG1ldGhvZCwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIGV2ZW50cyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICBTID0gc2VsZi5TLFxuICAgICAgICAgIG1vdmVfY2xhc3MgPSAnJyxcbiAgICAgICAgICByaWdodF9wb3N0Zml4ID0gJycsXG4gICAgICAgICAgbGVmdF9wb3N0Zml4ID0gJyc7XG5cbiAgICAgIGlmICh0aGlzLnNldHRpbmdzLm9wZW5fbWV0aG9kID09PSAnbW92ZScpIHtcbiAgICAgICAgbW92ZV9jbGFzcyA9ICdtb3ZlLSc7XG4gICAgICAgIHJpZ2h0X3Bvc3RmaXggPSAncmlnaHQnO1xuICAgICAgICBsZWZ0X3Bvc3RmaXggPSAnbGVmdCc7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuc2V0dGluZ3Mub3Blbl9tZXRob2QgPT09ICdvdmVybGFwX3NpbmdsZScpIHtcbiAgICAgICAgbW92ZV9jbGFzcyA9ICdvZmZjYW52YXMtb3ZlcmxhcC0nO1xuICAgICAgICByaWdodF9wb3N0Zml4ID0gJ3JpZ2h0JztcbiAgICAgICAgbGVmdF9wb3N0Zml4ID0gJ2xlZnQnO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnNldHRpbmdzLm9wZW5fbWV0aG9kID09PSAnb3ZlcmxhcCcpIHtcbiAgICAgICAgbW92ZV9jbGFzcyA9ICdvZmZjYW52YXMtb3ZlcmxhcCc7XG4gICAgICB9XG5cbiAgICAgIFModGhpcy5zY29wZSkub2ZmKCcub2ZmY2FudmFzJylcbiAgICAgICAgLm9uKCdjbGljay5mbmR0bi5vZmZjYW52YXMnLCAnLmxlZnQtb2ZmLWNhbnZhcy10b2dnbGUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIHNlbGYuY2xpY2tfdG9nZ2xlX2NsYXNzKGUsIG1vdmVfY2xhc3MgKyByaWdodF9wb3N0Zml4KTtcbiAgICAgICAgICBpZiAoc2VsZi5zZXR0aW5ncy5vcGVuX21ldGhvZCAhPT0gJ292ZXJsYXAnKSB7XG4gICAgICAgICAgICBTKCcubGVmdC1zdWJtZW51JykucmVtb3ZlQ2xhc3MobW92ZV9jbGFzcyArIHJpZ2h0X3Bvc3RmaXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAkKCcubGVmdC1vZmYtY2FudmFzLXRvZ2dsZScpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuICAgICAgICB9KVxuICAgICAgICAub24oJ2NsaWNrLmZuZHRuLm9mZmNhbnZhcycsICcubGVmdC1vZmYtY2FudmFzLW1lbnUgYScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgdmFyIHNldHRpbmdzID0gc2VsZi5nZXRfc2V0dGluZ3MoZSk7XG4gICAgICAgICAgdmFyIHBhcmVudCA9IFModGhpcykucGFyZW50KCk7XG5cbiAgICAgICAgICBpZiAoc2V0dGluZ3MuY2xvc2Vfb25fY2xpY2sgJiYgIXBhcmVudC5oYXNDbGFzcygnaGFzLXN1Ym1lbnUnKSAmJiAhcGFyZW50Lmhhc0NsYXNzKCdiYWNrJykpIHtcbiAgICAgICAgICAgIHNlbGYuaGlkZS5jYWxsKHNlbGYsIG1vdmVfY2xhc3MgKyByaWdodF9wb3N0Zml4LCBzZWxmLmdldF93cmFwcGVyKGUpKTtcbiAgICAgICAgICAgIHBhcmVudC5wYXJlbnQoKS5yZW1vdmVDbGFzcyhtb3ZlX2NsYXNzICsgcmlnaHRfcG9zdGZpeCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChTKHRoaXMpLnBhcmVudCgpLmhhc0NsYXNzKCdoYXMtc3VibWVudScpKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBTKHRoaXMpLnNpYmxpbmdzKCcubGVmdC1zdWJtZW51JykudG9nZ2xlQ2xhc3MobW92ZV9jbGFzcyArIHJpZ2h0X3Bvc3RmaXgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocGFyZW50Lmhhc0NsYXNzKCdiYWNrJykpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHBhcmVudC5wYXJlbnQoKS5yZW1vdmVDbGFzcyhtb3ZlX2NsYXNzICsgcmlnaHRfcG9zdGZpeCk7XG4gICAgICAgICAgfVxuICAgICAgICAgICQoJy5sZWZ0LW9mZi1jYW52YXMtdG9nZ2xlJykuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignY2xpY2suZm5kdG4ub2ZmY2FudmFzJywgJy5yaWdodC1vZmYtY2FudmFzLXRvZ2dsZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgc2VsZi5jbGlja190b2dnbGVfY2xhc3MoZSwgbW92ZV9jbGFzcyArIGxlZnRfcG9zdGZpeCk7XG4gICAgICAgICAgaWYgKHNlbGYuc2V0dGluZ3Mub3Blbl9tZXRob2QgIT09ICdvdmVybGFwJykge1xuICAgICAgICAgICAgUygnLnJpZ2h0LXN1Ym1lbnUnKS5yZW1vdmVDbGFzcyhtb3ZlX2NsYXNzICsgbGVmdF9wb3N0Zml4KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgJCgnLnJpZ2h0LW9mZi1jYW52YXMtdG9nZ2xlJykuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignY2xpY2suZm5kdG4ub2ZmY2FudmFzJywgJy5yaWdodC1vZmYtY2FudmFzLW1lbnUgYScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgdmFyIHNldHRpbmdzID0gc2VsZi5nZXRfc2V0dGluZ3MoZSk7XG4gICAgICAgICAgdmFyIHBhcmVudCA9IFModGhpcykucGFyZW50KCk7XG5cbiAgICAgICAgICBpZiAoc2V0dGluZ3MuY2xvc2Vfb25fY2xpY2sgJiYgIXBhcmVudC5oYXNDbGFzcygnaGFzLXN1Ym1lbnUnKSAmJiAhcGFyZW50Lmhhc0NsYXNzKCdiYWNrJykpIHtcbiAgICAgICAgICAgIHNlbGYuaGlkZS5jYWxsKHNlbGYsIG1vdmVfY2xhc3MgKyBsZWZ0X3Bvc3RmaXgsIHNlbGYuZ2V0X3dyYXBwZXIoZSkpO1xuICAgICAgICAgICAgcGFyZW50LnBhcmVudCgpLnJlbW92ZUNsYXNzKG1vdmVfY2xhc3MgKyBsZWZ0X3Bvc3RmaXgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoUyh0aGlzKS5wYXJlbnQoKS5oYXNDbGFzcygnaGFzLXN1Ym1lbnUnKSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgUyh0aGlzKS5zaWJsaW5ncygnLnJpZ2h0LXN1Ym1lbnUnKS50b2dnbGVDbGFzcyhtb3ZlX2NsYXNzICsgbGVmdF9wb3N0Zml4KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHBhcmVudC5oYXNDbGFzcygnYmFjaycpKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBwYXJlbnQucGFyZW50KCkucmVtb3ZlQ2xhc3MobW92ZV9jbGFzcyArIGxlZnRfcG9zdGZpeCk7XG4gICAgICAgICAgfVxuICAgICAgICAgICQoJy5yaWdodC1vZmYtY2FudmFzLXRvZ2dsZScpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuICAgICAgICB9KVxuICAgICAgICAub24oJ2NsaWNrLmZuZHRuLm9mZmNhbnZhcycsICcuZXhpdC1vZmYtY2FudmFzJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBzZWxmLmNsaWNrX3JlbW92ZV9jbGFzcyhlLCBtb3ZlX2NsYXNzICsgbGVmdF9wb3N0Zml4KTtcbiAgICAgICAgICBTKCcucmlnaHQtc3VibWVudScpLnJlbW92ZUNsYXNzKG1vdmVfY2xhc3MgKyBsZWZ0X3Bvc3RmaXgpO1xuICAgICAgICAgIGlmIChyaWdodF9wb3N0Zml4KSB7XG4gICAgICAgICAgICBzZWxmLmNsaWNrX3JlbW92ZV9jbGFzcyhlLCBtb3ZlX2NsYXNzICsgcmlnaHRfcG9zdGZpeCk7XG4gICAgICAgICAgICBTKCcubGVmdC1zdWJtZW51JykucmVtb3ZlQ2xhc3MobW92ZV9jbGFzcyArIGxlZnRfcG9zdGZpeCk7XG4gICAgICAgICAgfVxuICAgICAgICAgICQoJy5yaWdodC1vZmYtY2FudmFzLXRvZ2dsZScpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuICAgICAgICB9KVxuICAgICAgICAub24oJ2NsaWNrLmZuZHRuLm9mZmNhbnZhcycsICcuZXhpdC1vZmYtY2FudmFzJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBzZWxmLmNsaWNrX3JlbW92ZV9jbGFzcyhlLCBtb3ZlX2NsYXNzICsgbGVmdF9wb3N0Zml4KTtcbiAgICAgICAgICAkKCcubGVmdC1vZmYtY2FudmFzLXRvZ2dsZScpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcbiAgICAgICAgICBpZiAocmlnaHRfcG9zdGZpeCkge1xuICAgICAgICAgICAgc2VsZi5jbGlja19yZW1vdmVfY2xhc3MoZSwgbW92ZV9jbGFzcyArIHJpZ2h0X3Bvc3RmaXgpO1xuICAgICAgICAgICAgJCgnLnJpZ2h0LW9mZi1jYW52YXMtdG9nZ2xlJykuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHRvZ2dsZSA6IGZ1bmN0aW9uIChjbGFzc19uYW1lLCAkb2ZmX2NhbnZhcykge1xuICAgICAgJG9mZl9jYW52YXMgPSAkb2ZmX2NhbnZhcyB8fCB0aGlzLmdldF93cmFwcGVyKCk7XG4gICAgICBpZiAoJG9mZl9jYW52YXMuaXMoJy4nICsgY2xhc3NfbmFtZSkpIHtcbiAgICAgICAgdGhpcy5oaWRlKGNsYXNzX25hbWUsICRvZmZfY2FudmFzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2hvdyhjbGFzc19uYW1lLCAkb2ZmX2NhbnZhcyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNob3cgOiBmdW5jdGlvbiAoY2xhc3NfbmFtZSwgJG9mZl9jYW52YXMpIHtcbiAgICAgICRvZmZfY2FudmFzID0gJG9mZl9jYW52YXMgfHwgdGhpcy5nZXRfd3JhcHBlcigpO1xuICAgICAgJG9mZl9jYW52YXMudHJpZ2dlcignb3Blbi5mbmR0bi5vZmZjYW52YXMnKTtcbiAgICAgICRvZmZfY2FudmFzLmFkZENsYXNzKGNsYXNzX25hbWUpO1xuICAgIH0sXG5cbiAgICBoaWRlIDogZnVuY3Rpb24gKGNsYXNzX25hbWUsICRvZmZfY2FudmFzKSB7XG4gICAgICAkb2ZmX2NhbnZhcyA9ICRvZmZfY2FudmFzIHx8IHRoaXMuZ2V0X3dyYXBwZXIoKTtcbiAgICAgICRvZmZfY2FudmFzLnRyaWdnZXIoJ2Nsb3NlLmZuZHRuLm9mZmNhbnZhcycpO1xuICAgICAgJG9mZl9jYW52YXMucmVtb3ZlQ2xhc3MoY2xhc3NfbmFtZSk7XG4gICAgfSxcblxuICAgIGNsaWNrX3RvZ2dsZV9jbGFzcyA6IGZ1bmN0aW9uIChlLCBjbGFzc19uYW1lKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgJG9mZl9jYW52YXMgPSB0aGlzLmdldF93cmFwcGVyKGUpO1xuICAgICAgdGhpcy50b2dnbGUoY2xhc3NfbmFtZSwgJG9mZl9jYW52YXMpO1xuICAgIH0sXG5cbiAgICBjbGlja19yZW1vdmVfY2xhc3MgOiBmdW5jdGlvbiAoZSwgY2xhc3NfbmFtZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdmFyICRvZmZfY2FudmFzID0gdGhpcy5nZXRfd3JhcHBlcihlKTtcbiAgICAgIHRoaXMuaGlkZShjbGFzc19uYW1lLCAkb2ZmX2NhbnZhcyk7XG4gICAgfSxcblxuICAgIGdldF9zZXR0aW5ncyA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgb2ZmY2FudmFzICA9IHRoaXMuUyhlLnRhcmdldCkuY2xvc2VzdCgnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10nKTtcbiAgICAgIHJldHVybiBvZmZjYW52YXMuZGF0YSh0aGlzLmF0dHJfbmFtZSh0cnVlKSArICctaW5pdCcpIHx8IHRoaXMuc2V0dGluZ3M7XG4gICAgfSxcblxuICAgIGdldF93cmFwcGVyIDogZnVuY3Rpb24gKGUpIHtcbiAgICAgIHZhciAkb2ZmX2NhbnZhcyA9IHRoaXMuUyhlID8gZS50YXJnZXQgOiB0aGlzLnNjb3BlKS5jbG9zZXN0KCcub2ZmLWNhbnZhcy13cmFwJyk7XG5cbiAgICAgIGlmICgkb2ZmX2NhbnZhcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgJG9mZl9jYW52YXMgPSB0aGlzLlMoJy5vZmYtY2FudmFzLXdyYXAnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAkb2ZmX2NhbnZhcztcbiAgICB9LFxuXG4gICAgcmVmbG93IDogZnVuY3Rpb24gKCkge31cbiAgfTtcbn0oalF1ZXJ5LCB3aW5kb3csIHdpbmRvdy5kb2N1bWVudCkpO1xuIiwiOyhmdW5jdGlvbiAoJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgbm9vcCA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gIHZhciBPcmJpdCA9IGZ1bmN0aW9uIChlbCwgc2V0dGluZ3MpIHtcbiAgICAvLyBEb24ndCByZWluaXRpYWxpemUgcGx1Z2luXG4gICAgaWYgKGVsLmhhc0NsYXNzKHNldHRpbmdzLnNsaWRlc19jb250YWluZXJfY2xhc3MpKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGNvbnRhaW5lcixcbiAgICAgICAgc2xpZGVzX2NvbnRhaW5lciA9IGVsLFxuICAgICAgICBudW1iZXJfY29udGFpbmVyLFxuICAgICAgICBidWxsZXRzX2NvbnRhaW5lcixcbiAgICAgICAgdGltZXJfY29udGFpbmVyLFxuICAgICAgICBpZHggPSAwLFxuICAgICAgICBhbmltYXRlLFxuICAgICAgICB0aW1lcixcbiAgICAgICAgbG9ja2VkID0gZmFsc2UsXG4gICAgICAgIGFkanVzdF9oZWlnaHRfYWZ0ZXIgPSBmYWxzZTtcblxuICAgIHNlbGYuc2xpZGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHNsaWRlc19jb250YWluZXIuY2hpbGRyZW4oc2V0dGluZ3Muc2xpZGVfc2VsZWN0b3IpO1xuICAgIH07XG5cbiAgICBzZWxmLnNsaWRlcygpLmZpcnN0KCkuYWRkQ2xhc3Moc2V0dGluZ3MuYWN0aXZlX3NsaWRlX2NsYXNzKTtcblxuICAgIHNlbGYudXBkYXRlX3NsaWRlX251bWJlciA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgaWYgKHNldHRpbmdzLnNsaWRlX251bWJlcikge1xuICAgICAgICBudW1iZXJfY29udGFpbmVyLmZpbmQoJ3NwYW46Zmlyc3QnKS50ZXh0KHBhcnNlSW50KGluZGV4KSArIDEpO1xuICAgICAgICBudW1iZXJfY29udGFpbmVyLmZpbmQoJ3NwYW46bGFzdCcpLnRleHQoc2VsZi5zbGlkZXMoKS5sZW5ndGgpO1xuICAgICAgfVxuICAgICAgaWYgKHNldHRpbmdzLmJ1bGxldHMpIHtcbiAgICAgICAgYnVsbGV0c19jb250YWluZXIuY2hpbGRyZW4oKS5yZW1vdmVDbGFzcyhzZXR0aW5ncy5idWxsZXRzX2FjdGl2ZV9jbGFzcyk7XG4gICAgICAgICQoYnVsbGV0c19jb250YWluZXIuY2hpbGRyZW4oKS5nZXQoaW5kZXgpKS5hZGRDbGFzcyhzZXR0aW5ncy5idWxsZXRzX2FjdGl2ZV9jbGFzcyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNlbGYudXBkYXRlX2FjdGl2ZV9saW5rID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICB2YXIgbGluayA9ICQoJ1tkYXRhLW9yYml0LWxpbms9XCInICsgc2VsZi5zbGlkZXMoKS5lcShpbmRleCkuYXR0cignZGF0YS1vcmJpdC1zbGlkZScpICsgJ1wiXScpO1xuICAgICAgbGluay5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKHNldHRpbmdzLmJ1bGxldHNfYWN0aXZlX2NsYXNzKTtcbiAgICAgIGxpbmsuYWRkQ2xhc3Moc2V0dGluZ3MuYnVsbGV0c19hY3RpdmVfY2xhc3MpO1xuICAgIH07XG5cbiAgICBzZWxmLmJ1aWxkX21hcmt1cCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNsaWRlc19jb250YWluZXIud3JhcCgnPGRpdiBjbGFzcz1cIicgKyBzZXR0aW5ncy5jb250YWluZXJfY2xhc3MgKyAnXCI+PC9kaXY+Jyk7XG4gICAgICBjb250YWluZXIgPSBzbGlkZXNfY29udGFpbmVyLnBhcmVudCgpO1xuICAgICAgc2xpZGVzX2NvbnRhaW5lci5hZGRDbGFzcyhzZXR0aW5ncy5zbGlkZXNfY29udGFpbmVyX2NsYXNzKTtcblxuICAgICAgaWYgKHNldHRpbmdzLnN0YWNrX29uX3NtYWxsKSB7XG4gICAgICAgIGNvbnRhaW5lci5hZGRDbGFzcyhzZXR0aW5ncy5zdGFja19vbl9zbWFsbF9jbGFzcyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzZXR0aW5ncy5uYXZpZ2F0aW9uX2Fycm93cykge1xuICAgICAgICBjb250YWluZXIuYXBwZW5kKCQoJzxhIGhyZWY9XCIjXCI+PHNwYW4+PC9zcGFuPjwvYT4nKS5hZGRDbGFzcyhzZXR0aW5ncy5wcmV2X2NsYXNzKSk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmQoJCgnPGEgaHJlZj1cIiNcIj48c3Bhbj48L3NwYW4+PC9hPicpLmFkZENsYXNzKHNldHRpbmdzLm5leHRfY2xhc3MpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNldHRpbmdzLnRpbWVyKSB7XG4gICAgICAgIHRpbWVyX2NvbnRhaW5lciA9ICQoJzxkaXY+JykuYWRkQ2xhc3Moc2V0dGluZ3MudGltZXJfY29udGFpbmVyX2NsYXNzKTtcbiAgICAgICAgdGltZXJfY29udGFpbmVyLmFwcGVuZCgnPHNwYW4+Jyk7XG4gICAgICAgIHRpbWVyX2NvbnRhaW5lci5hcHBlbmQoJCgnPGRpdj4nKS5hZGRDbGFzcyhzZXR0aW5ncy50aW1lcl9wcm9ncmVzc19jbGFzcykpO1xuICAgICAgICB0aW1lcl9jb250YWluZXIuYWRkQ2xhc3Moc2V0dGluZ3MudGltZXJfcGF1c2VkX2NsYXNzKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZCh0aW1lcl9jb250YWluZXIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2V0dGluZ3Muc2xpZGVfbnVtYmVyKSB7XG4gICAgICAgIG51bWJlcl9jb250YWluZXIgPSAkKCc8ZGl2PicpLmFkZENsYXNzKHNldHRpbmdzLnNsaWRlX251bWJlcl9jbGFzcyk7XG4gICAgICAgIG51bWJlcl9jb250YWluZXIuYXBwZW5kKCc8c3Bhbj48L3NwYW4+ICcgKyBzZXR0aW5ncy5zbGlkZV9udW1iZXJfdGV4dCArICcgPHNwYW4+PC9zcGFuPicpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kKG51bWJlcl9jb250YWluZXIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2V0dGluZ3MuYnVsbGV0cykge1xuICAgICAgICBidWxsZXRzX2NvbnRhaW5lciA9ICQoJzxvbD4nKS5hZGRDbGFzcyhzZXR0aW5ncy5idWxsZXRzX2NvbnRhaW5lcl9jbGFzcyk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmQoYnVsbGV0c19jb250YWluZXIpO1xuICAgICAgICBidWxsZXRzX2NvbnRhaW5lci53cmFwKCc8ZGl2IGNsYXNzPVwib3JiaXQtYnVsbGV0cy1jb250YWluZXJcIj48L2Rpdj4nKTtcbiAgICAgICAgc2VsZi5zbGlkZXMoKS5lYWNoKGZ1bmN0aW9uIChpZHgsIGVsKSB7XG4gICAgICAgICAgdmFyIGJ1bGxldCA9ICQoJzxsaT4nKS5hdHRyKCdkYXRhLW9yYml0LXNsaWRlJywgaWR4KS5vbignY2xpY2snLCBzZWxmLmxpbmtfYnVsbGV0KTs7XG4gICAgICAgICAgYnVsbGV0c19jb250YWluZXIuYXBwZW5kKGJ1bGxldCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgfTtcblxuICAgIHNlbGYuX2dvdG8gPSBmdW5jdGlvbiAobmV4dF9pZHgsIHN0YXJ0X3RpbWVyKSB7XG4gICAgICAvLyBpZiAobG9ja2VkKSB7cmV0dXJuIGZhbHNlO31cbiAgICAgIGlmIChuZXh0X2lkeCA9PT0gaWR4KSB7cmV0dXJuIGZhbHNlO31cbiAgICAgIGlmICh0eXBlb2YgdGltZXIgPT09ICdvYmplY3QnKSB7dGltZXIucmVzdGFydCgpO31cbiAgICAgIHZhciBzbGlkZXMgPSBzZWxmLnNsaWRlcygpO1xuXG4gICAgICB2YXIgZGlyID0gJ25leHQnO1xuICAgICAgbG9ja2VkID0gdHJ1ZTtcbiAgICAgIGlmIChuZXh0X2lkeCA8IGlkeCkge2RpciA9ICdwcmV2Jzt9XG4gICAgICBpZiAobmV4dF9pZHggPj0gc2xpZGVzLmxlbmd0aCkge1xuICAgICAgICBpZiAoIXNldHRpbmdzLmNpcmN1bGFyKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIG5leHRfaWR4ID0gMDtcbiAgICAgIH0gZWxzZSBpZiAobmV4dF9pZHggPCAwKSB7XG4gICAgICAgIGlmICghc2V0dGluZ3MuY2lyY3VsYXIpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dF9pZHggPSBzbGlkZXMubGVuZ3RoIC0gMTtcbiAgICAgIH1cblxuICAgICAgdmFyIGN1cnJlbnQgPSAkKHNsaWRlcy5nZXQoaWR4KSk7XG4gICAgICB2YXIgbmV4dCA9ICQoc2xpZGVzLmdldChuZXh0X2lkeCkpO1xuXG4gICAgICBjdXJyZW50LmNzcygnekluZGV4JywgMik7XG4gICAgICBjdXJyZW50LnJlbW92ZUNsYXNzKHNldHRpbmdzLmFjdGl2ZV9zbGlkZV9jbGFzcyk7XG4gICAgICBuZXh0LmNzcygnekluZGV4JywgNCkuYWRkQ2xhc3Moc2V0dGluZ3MuYWN0aXZlX3NsaWRlX2NsYXNzKTtcblxuICAgICAgc2xpZGVzX2NvbnRhaW5lci50cmlnZ2VyKCdiZWZvcmUtc2xpZGUtY2hhbmdlLmZuZHRuLm9yYml0Jyk7XG4gICAgICBzZXR0aW5ncy5iZWZvcmVfc2xpZGVfY2hhbmdlKCk7XG4gICAgICBzZWxmLnVwZGF0ZV9hY3RpdmVfbGluayhuZXh0X2lkeCk7XG5cbiAgICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHVubG9jayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZHggPSBuZXh0X2lkeDtcbiAgICAgICAgICBsb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgICBpZiAoc3RhcnRfdGltZXIgPT09IHRydWUpIHt0aW1lciA9IHNlbGYuY3JlYXRlX3RpbWVyKCk7IHRpbWVyLnN0YXJ0KCk7fVxuICAgICAgICAgIHNlbGYudXBkYXRlX3NsaWRlX251bWJlcihpZHgpO1xuICAgICAgICAgIHNsaWRlc19jb250YWluZXIudHJpZ2dlcignYWZ0ZXItc2xpZGUtY2hhbmdlLmZuZHRuLm9yYml0JywgW3tzbGlkZV9udW1iZXIgOiBpZHgsIHRvdGFsX3NsaWRlcyA6IHNsaWRlcy5sZW5ndGh9XSk7XG4gICAgICAgICAgc2V0dGluZ3MuYWZ0ZXJfc2xpZGVfY2hhbmdlKGlkeCwgc2xpZGVzLmxlbmd0aCk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChzbGlkZXNfY29udGFpbmVyLm91dGVySGVpZ2h0KCkgIT0gbmV4dC5vdXRlckhlaWdodCgpICYmIHNldHRpbmdzLnZhcmlhYmxlX2hlaWdodCkge1xuICAgICAgICAgIHNsaWRlc19jb250YWluZXIuYW5pbWF0ZSh7J2hlaWdodCc6IG5leHQub3V0ZXJIZWlnaHQoKX0sIDI1MCwgJ2xpbmVhcicsIHVubG9jayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdW5sb2NrKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmIChzbGlkZXMubGVuZ3RoID09PSAxKSB7Y2FsbGJhY2soKTsgcmV0dXJuIGZhbHNlO31cblxuICAgICAgdmFyIHN0YXJ0X2FuaW1hdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGRpciA9PT0gJ25leHQnKSB7YW5pbWF0ZS5uZXh0KGN1cnJlbnQsIG5leHQsIGNhbGxiYWNrKTt9XG4gICAgICAgIGlmIChkaXIgPT09ICdwcmV2Jykge2FuaW1hdGUucHJldihjdXJyZW50LCBuZXh0LCBjYWxsYmFjayk7fVxuICAgICAgfTtcblxuICAgICAgaWYgKG5leHQub3V0ZXJIZWlnaHQoKSA+IHNsaWRlc19jb250YWluZXIub3V0ZXJIZWlnaHQoKSAmJiBzZXR0aW5ncy52YXJpYWJsZV9oZWlnaHQpIHtcbiAgICAgICAgc2xpZGVzX2NvbnRhaW5lci5hbmltYXRlKHsnaGVpZ2h0JzogbmV4dC5vdXRlckhlaWdodCgpfSwgMjUwLCAnbGluZWFyJywgc3RhcnRfYW5pbWF0aW9uKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXJ0X2FuaW1hdGlvbigpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBzZWxmLm5leHQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHNlbGYuX2dvdG8oaWR4ICsgMSk7XG4gICAgfTtcblxuICAgIHNlbGYucHJldiA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgc2VsZi5fZ290byhpZHggLSAxKTtcbiAgICB9O1xuXG4gICAgc2VsZi5saW5rX2N1c3RvbSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgbGluayA9ICQodGhpcykuYXR0cignZGF0YS1vcmJpdC1saW5rJyk7XG4gICAgICBpZiAoKHR5cGVvZiBsaW5rID09PSAnc3RyaW5nJykgJiYgKGxpbmsgPSAkLnRyaW0obGluaykpICE9ICcnKSB7XG4gICAgICAgIHZhciBzbGlkZSA9IGNvbnRhaW5lci5maW5kKCdbZGF0YS1vcmJpdC1zbGlkZT0nICsgbGluayArICddJyk7XG4gICAgICAgIGlmIChzbGlkZS5pbmRleCgpICE9IC0xKSB7c2VsZi5fZ290byhzbGlkZS5pbmRleCgpKTt9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNlbGYubGlua19idWxsZXQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyIGluZGV4ID0gJCh0aGlzKS5hdHRyKCdkYXRhLW9yYml0LXNsaWRlJyk7XG4gICAgICBpZiAoKHR5cGVvZiBpbmRleCA9PT0gJ3N0cmluZycpICYmIChpbmRleCA9ICQudHJpbShpbmRleCkpICE9ICcnKSB7XG4gICAgICAgIGlmIChpc05hTihwYXJzZUludChpbmRleCkpKSB7XG4gICAgICAgICAgdmFyIHNsaWRlID0gY29udGFpbmVyLmZpbmQoJ1tkYXRhLW9yYml0LXNsaWRlPScgKyBpbmRleCArICddJyk7XG4gICAgICAgICAgaWYgKHNsaWRlLmluZGV4KCkgIT0gLTEpIHtzZWxmLl9nb3RvKHNsaWRlLmluZGV4KCkgKyAxKTt9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5fZ290byhwYXJzZUludChpbmRleCkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICBzZWxmLnRpbWVyX2NhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5fZ290byhpZHggKyAxLCB0cnVlKTtcbiAgICB9XG5cbiAgICBzZWxmLmNvbXB1dGVfZGltZW5zaW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gJChzZWxmLnNsaWRlcygpLmdldChpZHgpKTtcbiAgICAgIHZhciBoID0gY3VycmVudC5vdXRlckhlaWdodCgpO1xuICAgICAgaWYgKCFzZXR0aW5ncy52YXJpYWJsZV9oZWlnaHQpIHtcbiAgICAgICAgc2VsZi5zbGlkZXMoKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgaWYgKCQodGhpcykub3V0ZXJIZWlnaHQoKSA+IGgpIHsgaCA9ICQodGhpcykub3V0ZXJIZWlnaHQoKTsgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHNsaWRlc19jb250YWluZXIuaGVpZ2h0KGgpO1xuICAgIH07XG5cbiAgICBzZWxmLmNyZWF0ZV90aW1lciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB0ID0gbmV3IFRpbWVyKFxuICAgICAgICBjb250YWluZXIuZmluZCgnLicgKyBzZXR0aW5ncy50aW1lcl9jb250YWluZXJfY2xhc3MpLFxuICAgICAgICBzZXR0aW5ncyxcbiAgICAgICAgc2VsZi50aW1lcl9jYWxsYmFja1xuICAgICAgKTtcbiAgICAgIHJldHVybiB0O1xuICAgIH07XG5cbiAgICBzZWxmLnN0b3BfdGltZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAodHlwZW9mIHRpbWVyID09PSAnb2JqZWN0Jykge1xuICAgICAgICB0aW1lci5zdG9wKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNlbGYudG9nZ2xlX3RpbWVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHQgPSBjb250YWluZXIuZmluZCgnLicgKyBzZXR0aW5ncy50aW1lcl9jb250YWluZXJfY2xhc3MpO1xuICAgICAgaWYgKHQuaGFzQ2xhc3Moc2V0dGluZ3MudGltZXJfcGF1c2VkX2NsYXNzKSkge1xuICAgICAgICBpZiAodHlwZW9mIHRpbWVyID09PSAndW5kZWZpbmVkJykge3RpbWVyID0gc2VsZi5jcmVhdGVfdGltZXIoKTt9XG4gICAgICAgIHRpbWVyLnN0YXJ0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodHlwZW9mIHRpbWVyID09PSAnb2JqZWN0Jykge3RpbWVyLnN0b3AoKTt9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHNlbGYuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuYnVpbGRfbWFya3VwKCk7XG4gICAgICBpZiAoc2V0dGluZ3MudGltZXIpIHtcbiAgICAgICAgdGltZXIgPSBzZWxmLmNyZWF0ZV90aW1lcigpO1xuICAgICAgICBGb3VuZGF0aW9uLnV0aWxzLmltYWdlX2xvYWRlZCh0aGlzLnNsaWRlcygpLmNoaWxkcmVuKCdpbWcnKSwgdGltZXIuc3RhcnQpO1xuICAgICAgfVxuICAgICAgYW5pbWF0ZSA9IG5ldyBGYWRlQW5pbWF0aW9uKHNldHRpbmdzLCBzbGlkZXNfY29udGFpbmVyKTtcbiAgICAgIGlmIChzZXR0aW5ncy5hbmltYXRpb24gPT09ICdzbGlkZScpIHtcbiAgICAgICAgYW5pbWF0ZSA9IG5ldyBTbGlkZUFuaW1hdGlvbihzZXR0aW5ncywgc2xpZGVzX2NvbnRhaW5lcik7XG4gICAgICB9XG5cbiAgICAgIGNvbnRhaW5lci5vbignY2xpY2snLCAnLicgKyBzZXR0aW5ncy5uZXh0X2NsYXNzLCBzZWxmLm5leHQpO1xuICAgICAgY29udGFpbmVyLm9uKCdjbGljaycsICcuJyArIHNldHRpbmdzLnByZXZfY2xhc3MsIHNlbGYucHJldik7XG5cbiAgICAgIGlmIChzZXR0aW5ncy5uZXh0X29uX2NsaWNrKSB7XG4gICAgICAgIGNvbnRhaW5lci5vbignY2xpY2snLCAnLicgKyBzZXR0aW5ncy5zbGlkZXNfY29udGFpbmVyX2NsYXNzICsgJyBbZGF0YS1vcmJpdC1zbGlkZV0nLCBzZWxmLmxpbmtfYnVsbGV0KTtcbiAgICAgIH1cblxuICAgICAgY29udGFpbmVyLm9uKCdjbGljaycsIHNlbGYudG9nZ2xlX3RpbWVyKTtcbiAgICAgIGlmIChzZXR0aW5ncy5zd2lwZSkge1xuICAgICAgICBjb250YWluZXIub24oJ3RvdWNoc3RhcnQuZm5kdG4ub3JiaXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGlmICghZS50b3VjaGVzKSB7ZSA9IGUub3JpZ2luYWxFdmVudDt9XG4gICAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICBzdGFydF9wYWdlX3ggOiBlLnRvdWNoZXNbMF0ucGFnZVgsXG4gICAgICAgICAgICBzdGFydF9wYWdlX3kgOiBlLnRvdWNoZXNbMF0ucGFnZVksXG4gICAgICAgICAgICBzdGFydF90aW1lIDogKG5ldyBEYXRlKCkpLmdldFRpbWUoKSxcbiAgICAgICAgICAgIGRlbHRhX3ggOiAwLFxuICAgICAgICAgICAgaXNfc2Nyb2xsaW5nIDogdW5kZWZpbmVkXG4gICAgICAgICAgfTtcbiAgICAgICAgICBjb250YWluZXIuZGF0YSgnc3dpcGUtdHJhbnNpdGlvbicsIGRhdGEpO1xuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5vbigndG91Y2htb3ZlLmZuZHRuLm9yYml0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBpZiAoIWUudG91Y2hlcykge1xuICAgICAgICAgICAgZSA9IGUub3JpZ2luYWxFdmVudDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gSWdub3JlIHBpbmNoL3pvb20gZXZlbnRzXG4gICAgICAgICAgaWYgKGUudG91Y2hlcy5sZW5ndGggPiAxIHx8IGUuc2NhbGUgJiYgZS5zY2FsZSAhPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBkYXRhID0gY29udGFpbmVyLmRhdGEoJ3N3aXBlLXRyYW5zaXRpb24nKTtcbiAgICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnKSB7ZGF0YSA9IHt9O31cblxuICAgICAgICAgIGRhdGEuZGVsdGFfeCA9IGUudG91Y2hlc1swXS5wYWdlWCAtIGRhdGEuc3RhcnRfcGFnZV94O1xuXG4gICAgICAgICAgaWYgKCB0eXBlb2YgZGF0YS5pc19zY3JvbGxpbmcgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBkYXRhLmlzX3Njcm9sbGluZyA9ICEhKCBkYXRhLmlzX3Njcm9sbGluZyB8fCBNYXRoLmFicyhkYXRhLmRlbHRhX3gpIDwgTWF0aC5hYnMoZS50b3VjaGVzWzBdLnBhZ2VZIC0gZGF0YS5zdGFydF9wYWdlX3kpICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCFkYXRhLmlzX3Njcm9sbGluZyAmJiAhZGF0YS5hY3RpdmUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHZhciBkaXJlY3Rpb24gPSAoZGF0YS5kZWx0YV94IDwgMCkgPyAoaWR4ICsgMSkgOiAoaWR4IC0gMSk7XG4gICAgICAgICAgICBkYXRhLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBzZWxmLl9nb3RvKGRpcmVjdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAub24oJ3RvdWNoZW5kLmZuZHRuLm9yYml0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBjb250YWluZXIuZGF0YSgnc3dpcGUtdHJhbnNpdGlvbicsIHt9KTtcbiAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgY29udGFpbmVyLm9uKCdtb3VzZWVudGVyLmZuZHRuLm9yYml0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKHNldHRpbmdzLnRpbWVyICYmIHNldHRpbmdzLnBhdXNlX29uX2hvdmVyKSB7XG4gICAgICAgICAgc2VsZi5zdG9wX3RpbWVyKCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAub24oJ21vdXNlbGVhdmUuZm5kdG4ub3JiaXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoc2V0dGluZ3MudGltZXIgJiYgc2V0dGluZ3MucmVzdW1lX29uX21vdXNlb3V0KSB7XG4gICAgICAgICAgdGltZXIuc3RhcnQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdbZGF0YS1vcmJpdC1saW5rXScsIHNlbGYubGlua19jdXN0b20pO1xuICAgICAgJCh3aW5kb3cpLm9uKCdsb2FkIHJlc2l6ZScsIHNlbGYuY29tcHV0ZV9kaW1lbnNpb25zKTtcbiAgICAgIEZvdW5kYXRpb24udXRpbHMuaW1hZ2VfbG9hZGVkKHRoaXMuc2xpZGVzKCkuY2hpbGRyZW4oJ2ltZycpLCBzZWxmLmNvbXB1dGVfZGltZW5zaW9ucyk7XG4gICAgICBGb3VuZGF0aW9uLnV0aWxzLmltYWdlX2xvYWRlZCh0aGlzLnNsaWRlcygpLmNoaWxkcmVuKCdpbWcnKSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBjb250YWluZXIucHJldignLicgKyBzZXR0aW5ncy5wcmVsb2FkZXJfY2xhc3MpLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgICAgIHNlbGYudXBkYXRlX3NsaWRlX251bWJlcigwKTtcbiAgICAgICAgc2VsZi51cGRhdGVfYWN0aXZlX2xpbmsoMCk7XG4gICAgICAgIHNsaWRlc19jb250YWluZXIudHJpZ2dlcigncmVhZHkuZm5kdG4ub3JiaXQnKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBzZWxmLmluaXQoKTtcbiAgfTtcblxuICB2YXIgVGltZXIgPSBmdW5jdGlvbiAoZWwsIHNldHRpbmdzLCBjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgZHVyYXRpb24gPSBzZXR0aW5ncy50aW1lcl9zcGVlZCxcbiAgICAgICAgcHJvZ3Jlc3MgPSBlbC5maW5kKCcuJyArIHNldHRpbmdzLnRpbWVyX3Byb2dyZXNzX2NsYXNzKSxcbiAgICAgICAgc3RhcnQsXG4gICAgICAgIHRpbWVvdXQsXG4gICAgICAgIGxlZnQgPSAtMTtcblxuICAgIHRoaXMudXBkYXRlX3Byb2dyZXNzID0gZnVuY3Rpb24gKHcpIHtcbiAgICAgIHZhciBuZXdfcHJvZ3Jlc3MgPSBwcm9ncmVzcy5jbG9uZSgpO1xuICAgICAgbmV3X3Byb2dyZXNzLmF0dHIoJ3N0eWxlJywgJycpO1xuICAgICAgbmV3X3Byb2dyZXNzLmNzcygnd2lkdGgnLCB3ICsgJyUnKTtcbiAgICAgIHByb2dyZXNzLnJlcGxhY2VXaXRoKG5ld19wcm9ncmVzcyk7XG4gICAgICBwcm9ncmVzcyA9IG5ld19wcm9ncmVzcztcbiAgICB9O1xuXG4gICAgdGhpcy5yZXN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgZWwuYWRkQ2xhc3Moc2V0dGluZ3MudGltZXJfcGF1c2VkX2NsYXNzKTtcbiAgICAgIGxlZnQgPSAtMTtcbiAgICAgIHNlbGYudXBkYXRlX3Byb2dyZXNzKDApO1xuICAgIH07XG5cbiAgICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCFlbC5oYXNDbGFzcyhzZXR0aW5ncy50aW1lcl9wYXVzZWRfY2xhc3MpKSB7cmV0dXJuIHRydWU7fVxuICAgICAgbGVmdCA9IChsZWZ0ID09PSAtMSkgPyBkdXJhdGlvbiA6IGxlZnQ7XG4gICAgICBlbC5yZW1vdmVDbGFzcyhzZXR0aW5ncy50aW1lcl9wYXVzZWRfY2xhc3MpO1xuICAgICAgc3RhcnQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIHByb2dyZXNzLmFuaW1hdGUoeyd3aWR0aCcgOiAnMTAwJSd9LCBsZWZ0LCAnbGluZWFyJyk7XG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYucmVzdGFydCgpO1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfSwgbGVmdCk7XG4gICAgICBlbC50cmlnZ2VyKCd0aW1lci1zdGFydGVkLmZuZHRuLm9yYml0JylcbiAgICB9O1xuXG4gICAgdGhpcy5zdG9wID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGVsLmhhc0NsYXNzKHNldHRpbmdzLnRpbWVyX3BhdXNlZF9jbGFzcykpIHtyZXR1cm4gdHJ1ZTt9XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICBlbC5hZGRDbGFzcyhzZXR0aW5ncy50aW1lcl9wYXVzZWRfY2xhc3MpO1xuICAgICAgdmFyIGVuZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgbGVmdCA9IGxlZnQgLSAoZW5kIC0gc3RhcnQpO1xuICAgICAgdmFyIHcgPSAxMDAgLSAoKGxlZnQgLyBkdXJhdGlvbikgKiAxMDApO1xuICAgICAgc2VsZi51cGRhdGVfcHJvZ3Jlc3Modyk7XG4gICAgICBlbC50cmlnZ2VyKCd0aW1lci1zdG9wcGVkLmZuZHRuLm9yYml0Jyk7XG4gICAgfTtcbiAgfTtcblxuICB2YXIgU2xpZGVBbmltYXRpb24gPSBmdW5jdGlvbiAoc2V0dGluZ3MsIGNvbnRhaW5lcikge1xuICAgIHZhciBkdXJhdGlvbiA9IHNldHRpbmdzLmFuaW1hdGlvbl9zcGVlZDtcbiAgICB2YXIgaXNfcnRsID0gKCQoJ2h0bWxbZGlyPXJ0bF0nKS5sZW5ndGggPT09IDEpO1xuICAgIHZhciBtYXJnaW4gPSBpc19ydGwgPyAnbWFyZ2luUmlnaHQnIDogJ21hcmdpbkxlZnQnO1xuICAgIHZhciBhbmltTWFyZ2luID0ge307XG4gICAgYW5pbU1hcmdpblttYXJnaW5dID0gJzAlJztcblxuICAgIHRoaXMubmV4dCA9IGZ1bmN0aW9uIChjdXJyZW50LCBuZXh0LCBjYWxsYmFjaykge1xuICAgICAgY3VycmVudC5hbmltYXRlKHttYXJnaW5MZWZ0IDogJy0xMDAlJ30sIGR1cmF0aW9uKTtcbiAgICAgIG5leHQuYW5pbWF0ZShhbmltTWFyZ2luLCBkdXJhdGlvbiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBjdXJyZW50LmNzcyhtYXJnaW4sICcxMDAlJyk7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5wcmV2ID0gZnVuY3Rpb24gKGN1cnJlbnQsIHByZXYsIGNhbGxiYWNrKSB7XG4gICAgICBjdXJyZW50LmFuaW1hdGUoe21hcmdpbkxlZnQgOiAnMTAwJSd9LCBkdXJhdGlvbik7XG4gICAgICBwcmV2LmNzcyhtYXJnaW4sICctMTAwJScpO1xuICAgICAgcHJldi5hbmltYXRlKGFuaW1NYXJnaW4sIGR1cmF0aW9uLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGN1cnJlbnQuY3NzKG1hcmdpbiwgJzEwMCUnKTtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH07XG5cbiAgdmFyIEZhZGVBbmltYXRpb24gPSBmdW5jdGlvbiAoc2V0dGluZ3MsIGNvbnRhaW5lcikge1xuICAgIHZhciBkdXJhdGlvbiA9IHNldHRpbmdzLmFuaW1hdGlvbl9zcGVlZDtcbiAgICB2YXIgaXNfcnRsID0gKCQoJ2h0bWxbZGlyPXJ0bF0nKS5sZW5ndGggPT09IDEpO1xuICAgIHZhciBtYXJnaW4gPSBpc19ydGwgPyAnbWFyZ2luUmlnaHQnIDogJ21hcmdpbkxlZnQnO1xuXG4gICAgdGhpcy5uZXh0ID0gZnVuY3Rpb24gKGN1cnJlbnQsIG5leHQsIGNhbGxiYWNrKSB7XG4gICAgICBuZXh0LmNzcyh7J21hcmdpbicgOiAnMCUnLCAnb3BhY2l0eScgOiAnMC4wMSd9KTtcbiAgICAgIG5leHQuYW5pbWF0ZSh7J29wYWNpdHknIDonMSd9LCBkdXJhdGlvbiwgJ2xpbmVhcicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY3VycmVudC5jc3MoJ21hcmdpbicsICcxMDAlJyk7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5wcmV2ID0gZnVuY3Rpb24gKGN1cnJlbnQsIHByZXYsIGNhbGxiYWNrKSB7XG4gICAgICBwcmV2LmNzcyh7J21hcmdpbicgOiAnMCUnLCAnb3BhY2l0eScgOiAnMC4wMSd9KTtcbiAgICAgIHByZXYuYW5pbWF0ZSh7J29wYWNpdHknIDogJzEnfSwgZHVyYXRpb24sICdsaW5lYXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGN1cnJlbnQuY3NzKCdtYXJnaW4nLCAnMTAwJScpO1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfTtcblxuICBGb3VuZGF0aW9uLmxpYnMgPSBGb3VuZGF0aW9uLmxpYnMgfHwge307XG5cbiAgRm91bmRhdGlvbi5saWJzLm9yYml0ID0ge1xuICAgIG5hbWUgOiAnb3JiaXQnLFxuXG4gICAgdmVyc2lvbiA6ICc1LjUuMScsXG5cbiAgICBzZXR0aW5ncyA6IHtcbiAgICAgIGFuaW1hdGlvbiA6ICdzbGlkZScsXG4gICAgICB0aW1lcl9zcGVlZCA6IDEwMDAwLFxuICAgICAgcGF1c2Vfb25faG92ZXIgOiB0cnVlLFxuICAgICAgcmVzdW1lX29uX21vdXNlb3V0IDogZmFsc2UsXG4gICAgICBuZXh0X29uX2NsaWNrIDogdHJ1ZSxcbiAgICAgIGFuaW1hdGlvbl9zcGVlZCA6IDUwMCxcbiAgICAgIHN0YWNrX29uX3NtYWxsIDogZmFsc2UsXG4gICAgICBuYXZpZ2F0aW9uX2Fycm93cyA6IHRydWUsXG4gICAgICBzbGlkZV9udW1iZXIgOiB0cnVlLFxuICAgICAgc2xpZGVfbnVtYmVyX3RleHQgOiAnb2YnLFxuICAgICAgY29udGFpbmVyX2NsYXNzIDogJ29yYml0LWNvbnRhaW5lcicsXG4gICAgICBzdGFja19vbl9zbWFsbF9jbGFzcyA6ICdvcmJpdC1zdGFjay1vbi1zbWFsbCcsXG4gICAgICBuZXh0X2NsYXNzIDogJ29yYml0LW5leHQnLFxuICAgICAgcHJldl9jbGFzcyA6ICdvcmJpdC1wcmV2JyxcbiAgICAgIHRpbWVyX2NvbnRhaW5lcl9jbGFzcyA6ICdvcmJpdC10aW1lcicsXG4gICAgICB0aW1lcl9wYXVzZWRfY2xhc3MgOiAncGF1c2VkJyxcbiAgICAgIHRpbWVyX3Byb2dyZXNzX2NsYXNzIDogJ29yYml0LXByb2dyZXNzJyxcbiAgICAgIHNsaWRlc19jb250YWluZXJfY2xhc3MgOiAnb3JiaXQtc2xpZGVzLWNvbnRhaW5lcicsXG4gICAgICBwcmVsb2FkZXJfY2xhc3MgOiAncHJlbG9hZGVyJyxcbiAgICAgIHNsaWRlX3NlbGVjdG9yIDogJyonLFxuICAgICAgYnVsbGV0c19jb250YWluZXJfY2xhc3MgOiAnb3JiaXQtYnVsbGV0cycsXG4gICAgICBidWxsZXRzX2FjdGl2ZV9jbGFzcyA6ICdhY3RpdmUnLFxuICAgICAgc2xpZGVfbnVtYmVyX2NsYXNzIDogJ29yYml0LXNsaWRlLW51bWJlcicsXG4gICAgICBjYXB0aW9uX2NsYXNzIDogJ29yYml0LWNhcHRpb24nLFxuICAgICAgYWN0aXZlX3NsaWRlX2NsYXNzIDogJ2FjdGl2ZScsXG4gICAgICBvcmJpdF90cmFuc2l0aW9uX2NsYXNzIDogJ29yYml0LXRyYW5zaXRpb25pbmcnLFxuICAgICAgYnVsbGV0cyA6IHRydWUsXG4gICAgICBjaXJjdWxhciA6IHRydWUsXG4gICAgICB0aW1lciA6IHRydWUsXG4gICAgICB2YXJpYWJsZV9oZWlnaHQgOiBmYWxzZSxcbiAgICAgIHN3aXBlIDogdHJ1ZSxcbiAgICAgIGJlZm9yZV9zbGlkZV9jaGFuZ2UgOiBub29wLFxuICAgICAgYWZ0ZXJfc2xpZGVfY2hhbmdlIDogbm9vcFxuICAgIH0sXG5cbiAgICBpbml0IDogZnVuY3Rpb24gKHNjb3BlLCBtZXRob2QsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHRoaXMuYmluZGluZ3MobWV0aG9kLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgZXZlbnRzIDogZnVuY3Rpb24gKGluc3RhbmNlKSB7XG4gICAgICB2YXIgb3JiaXRfaW5zdGFuY2UgPSBuZXcgT3JiaXQodGhpcy5TKGluc3RhbmNlKSwgdGhpcy5TKGluc3RhbmNlKS5kYXRhKCdvcmJpdC1pbml0JykpO1xuICAgICAgdGhpcy5TKGluc3RhbmNlKS5kYXRhKHRoaXMubmFtZSArICctaW5zdGFuY2UnLCBvcmJpdF9pbnN0YW5jZSk7XG4gICAgfSxcblxuICAgIHJlZmxvdyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKHNlbGYuUyhzZWxmLnNjb3BlKS5pcygnW2RhdGEtb3JiaXRdJykpIHtcbiAgICAgICAgdmFyICRlbCA9IHNlbGYuUyhzZWxmLnNjb3BlKTtcbiAgICAgICAgdmFyIGluc3RhbmNlID0gJGVsLmRhdGEoc2VsZi5uYW1lICsgJy1pbnN0YW5jZScpO1xuICAgICAgICBpbnN0YW5jZS5jb21wdXRlX2RpbWVuc2lvbnMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuUygnW2RhdGEtb3JiaXRdJywgc2VsZi5zY29wZSkuZWFjaChmdW5jdGlvbiAoaWR4LCBlbCkge1xuICAgICAgICAgIHZhciAkZWwgPSBzZWxmLlMoZWwpO1xuICAgICAgICAgIHZhciBvcHRzID0gc2VsZi5kYXRhX29wdGlvbnMoJGVsKTtcbiAgICAgICAgICB2YXIgaW5zdGFuY2UgPSAkZWwuZGF0YShzZWxmLm5hbWUgKyAnLWluc3RhbmNlJyk7XG4gICAgICAgICAgaW5zdGFuY2UuY29tcHV0ZV9kaW1lbnNpb25zKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxufShqUXVlcnksIHdpbmRvdywgd2luZG93LmRvY3VtZW50KSk7XG4iLCI7KGZ1bmN0aW9uICgkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIEZvdW5kYXRpb24ubGlicy5yZXZlYWwgPSB7XG4gICAgbmFtZSA6ICdyZXZlYWwnLFxuXG4gICAgdmVyc2lvbiA6ICc1LjUuMScsXG5cbiAgICBsb2NrZWQgOiBmYWxzZSxcblxuICAgIHNldHRpbmdzIDoge1xuICAgICAgYW5pbWF0aW9uIDogJ2ZhZGVBbmRQb3AnLFxuICAgICAgYW5pbWF0aW9uX3NwZWVkIDogMjUwLFxuICAgICAgY2xvc2Vfb25fYmFja2dyb3VuZF9jbGljayA6IHRydWUsXG4gICAgICBjbG9zZV9vbl9lc2MgOiB0cnVlLFxuICAgICAgZGlzbWlzc19tb2RhbF9jbGFzcyA6ICdjbG9zZS1yZXZlYWwtbW9kYWwnLFxuICAgICAgbXVsdGlwbGVfb3BlbmVkIDogZmFsc2UsXG4gICAgICBiZ19jbGFzcyA6ICdyZXZlYWwtbW9kYWwtYmcnLFxuICAgICAgcm9vdF9lbGVtZW50IDogJ2JvZHknLFxuICAgICAgb3BlbiA6IGZ1bmN0aW9uKCl7fSxcbiAgICAgIG9wZW5lZCA6IGZ1bmN0aW9uKCl7fSxcbiAgICAgIGNsb3NlIDogZnVuY3Rpb24oKXt9LFxuICAgICAgY2xvc2VkIDogZnVuY3Rpb24oKXt9LFxuICAgICAgb25fYWpheF9lcnJvcjogJC5ub29wLFxuICAgICAgYmcgOiAkKCcucmV2ZWFsLW1vZGFsLWJnJyksXG4gICAgICBjc3MgOiB7XG4gICAgICAgIG9wZW4gOiB7XG4gICAgICAgICAgJ29wYWNpdHknIDogMCxcbiAgICAgICAgICAndmlzaWJpbGl0eScgOiAndmlzaWJsZScsXG4gICAgICAgICAgJ2Rpc3BsYXknIDogJ2Jsb2NrJ1xuICAgICAgICB9LFxuICAgICAgICBjbG9zZSA6IHtcbiAgICAgICAgICAnb3BhY2l0eScgOiAxLFxuICAgICAgICAgICd2aXNpYmlsaXR5JyA6ICdoaWRkZW4nLFxuICAgICAgICAgICdkaXNwbGF5JyA6ICdub25lJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGluaXQgOiBmdW5jdGlvbiAoc2NvcGUsIG1ldGhvZCwgb3B0aW9ucykge1xuICAgICAgJC5leHRlbmQodHJ1ZSwgdGhpcy5zZXR0aW5ncywgbWV0aG9kLCBvcHRpb25zKTtcbiAgICAgIHRoaXMuYmluZGluZ3MobWV0aG9kLCBvcHRpb25zKTtcbiAgICB9LFxuXG4gICAgZXZlbnRzIDogZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgUyA9IHNlbGYuUztcblxuICAgICAgUyh0aGlzLnNjb3BlKVxuICAgICAgICAub2ZmKCcucmV2ZWFsJylcbiAgICAgICAgLm9uKCdjbGljay5mbmR0bi5yZXZlYWwnLCAnWycgKyB0aGlzLmFkZF9uYW1lc3BhY2UoJ2RhdGEtcmV2ZWFsLWlkJykgKyAnXTpub3QoW2Rpc2FibGVkXSknLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgIGlmICghc2VsZi5sb2NrZWQpIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50ID0gUyh0aGlzKSxcbiAgICAgICAgICAgICAgICBhamF4ID0gZWxlbWVudC5kYXRhKHNlbGYuZGF0YV9hdHRyKCdyZXZlYWwtYWpheCcpKSxcbiAgICAgICAgICAgICAgICByZXBsYWNlQ29udGVudFNlbCA9IGVsZW1lbnQuZGF0YShzZWxmLmRhdGFfYXR0cigncmV2ZWFsLXJlcGxhY2UtY29udGVudCcpKTtcblxuICAgICAgICAgICAgc2VsZi5sb2NrZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGFqYXggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIHNlbGYub3Blbi5jYWxsKHNlbGYsIGVsZW1lbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdmFyIHVybCA9IGFqYXggPT09IHRydWUgPyBlbGVtZW50LmF0dHIoJ2hyZWYnKSA6IGFqYXg7XG4gICAgICAgICAgICAgIHNlbGYub3Blbi5jYWxsKHNlbGYsIGVsZW1lbnQsIHt1cmwgOiB1cmx9LCB7IHJlcGxhY2VDb250ZW50U2VsIDogcmVwbGFjZUNvbnRlbnRTZWwgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgUyhkb2N1bWVudClcbiAgICAgICAgLm9uKCdjbGljay5mbmR0bi5yZXZlYWwnLCB0aGlzLmNsb3NlX3RhcmdldHMoKSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgaWYgKCFzZWxmLmxvY2tlZCkge1xuICAgICAgICAgICAgdmFyIHNldHRpbmdzID0gUygnWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJ10ub3BlbicpLmRhdGEoc2VsZi5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKSB8fCBzZWxmLnNldHRpbmdzLFxuICAgICAgICAgICAgICAgIGJnX2NsaWNrZWQgPSBTKGUudGFyZ2V0KVswXSA9PT0gUygnLicgKyBzZXR0aW5ncy5iZ19jbGFzcylbMF07XG5cbiAgICAgICAgICAgIGlmIChiZ19jbGlja2VkKSB7XG4gICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5jbG9zZV9vbl9iYWNrZ3JvdW5kX2NsaWNrKSB7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5sb2NrZWQgPSB0cnVlO1xuICAgICAgICAgICAgc2VsZi5jbG9zZS5jYWxsKHNlbGYsIGJnX2NsaWNrZWQgPyBTKCdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnXS5vcGVuOm5vdCgudG9iYWNrKScpIDogUyh0aGlzKS5jbG9zZXN0KCdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnXScpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICBpZiAoUygnWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJ10nLCB0aGlzLnNjb3BlKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIFModGhpcy5zY29wZSlcbiAgICAgICAgICAvLyAub2ZmKCcucmV2ZWFsJylcbiAgICAgICAgICAub24oJ29wZW4uZm5kdG4ucmV2ZWFsJywgdGhpcy5zZXR0aW5ncy5vcGVuKVxuICAgICAgICAgIC5vbignb3BlbmVkLmZuZHRuLnJldmVhbCcsIHRoaXMuc2V0dGluZ3Mub3BlbmVkKVxuICAgICAgICAgIC5vbignb3BlbmVkLmZuZHRuLnJldmVhbCcsIHRoaXMub3Blbl92aWRlbylcbiAgICAgICAgICAub24oJ2Nsb3NlLmZuZHRuLnJldmVhbCcsIHRoaXMuc2V0dGluZ3MuY2xvc2UpXG4gICAgICAgICAgLm9uKCdjbG9zZWQuZm5kdG4ucmV2ZWFsJywgdGhpcy5zZXR0aW5ncy5jbG9zZWQpXG4gICAgICAgICAgLm9uKCdjbG9zZWQuZm5kdG4ucmV2ZWFsJywgdGhpcy5jbG9zZV92aWRlbyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBTKHRoaXMuc2NvcGUpXG4gICAgICAgICAgLy8gLm9mZignLnJldmVhbCcpXG4gICAgICAgICAgLm9uKCdvcGVuLmZuZHRuLnJldmVhbCcsICdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnXScsIHRoaXMuc2V0dGluZ3Mub3BlbilcbiAgICAgICAgICAub24oJ29wZW5lZC5mbmR0bi5yZXZlYWwnLCAnWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJ10nLCB0aGlzLnNldHRpbmdzLm9wZW5lZClcbiAgICAgICAgICAub24oJ29wZW5lZC5mbmR0bi5yZXZlYWwnLCAnWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJ10nLCB0aGlzLm9wZW5fdmlkZW8pXG4gICAgICAgICAgLm9uKCdjbG9zZS5mbmR0bi5yZXZlYWwnLCAnWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJ10nLCB0aGlzLnNldHRpbmdzLmNsb3NlKVxuICAgICAgICAgIC5vbignY2xvc2VkLmZuZHRuLnJldmVhbCcsICdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnXScsIHRoaXMuc2V0dGluZ3MuY2xvc2VkKVxuICAgICAgICAgIC5vbignY2xvc2VkLmZuZHRuLnJldmVhbCcsICdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnXScsIHRoaXMuY2xvc2VfdmlkZW8pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLy8gUEFUQ0ggIzM6IHR1cm5pbmcgb24ga2V5IHVwIGNhcHR1cmUgb25seSB3aGVuIGEgcmV2ZWFsIHdpbmRvdyBpcyBvcGVuXG4gICAga2V5X3VwX29uIDogZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIFBBVENIICMxOiBmaXhpbmcgbXVsdGlwbGUga2V5dXAgZXZlbnQgdHJpZ2dlciBmcm9tIHNpbmdsZSBrZXkgcHJlc3NcbiAgICAgIHNlbGYuUygnYm9keScpLm9mZigna2V5dXAuZm5kdG4ucmV2ZWFsJykub24oJ2tleXVwLmZuZHRuLnJldmVhbCcsIGZ1bmN0aW9uICggZXZlbnQgKSB7XG4gICAgICAgIHZhciBvcGVuX21vZGFsID0gc2VsZi5TKCdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnXS5vcGVuJyksXG4gICAgICAgICAgICBzZXR0aW5ncyA9IG9wZW5fbW9kYWwuZGF0YShzZWxmLmF0dHJfbmFtZSh0cnVlKSArICctaW5pdCcpIHx8IHNlbGYuc2V0dGluZ3MgO1xuICAgICAgICAvLyBQQVRDSCAjMjogbWFraW5nIHN1cmUgdGhhdCB0aGUgY2xvc2UgZXZlbnQgY2FuIGJlIGNhbGxlZCBvbmx5IHdoaWxlIHVubG9ja2VkLFxuICAgICAgICAvLyAgICAgICAgICAgc28gdGhhdCBtdWx0aXBsZSBrZXl1cC5mbmR0bi5yZXZlYWwgZXZlbnRzIGRvbid0IHByZXZlbnQgY2xlYW4gY2xvc2luZyBvZiB0aGUgcmV2ZWFsIHdpbmRvdy5cbiAgICAgICAgaWYgKCBzZXR0aW5ncyAmJiBldmVudC53aGljaCA9PT0gMjcgICYmIHNldHRpbmdzLmNsb3NlX29uX2VzYyAmJiAhc2VsZi5sb2NrZWQpIHsgLy8gMjcgaXMgdGhlIGtleWNvZGUgZm9yIHRoZSBFc2NhcGUga2V5XG4gICAgICAgICAgc2VsZi5jbG9zZS5jYWxsKHNlbGYsIG9wZW5fbW9kYWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8vIFBBVENIICMzOiB0dXJuaW5nIG9uIGtleSB1cCBjYXB0dXJlIG9ubHkgd2hlbiBhIHJldmVhbCB3aW5kb3cgaXMgb3BlblxuICAgIGtleV91cF9vZmYgOiBmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAgIHRoaXMuUygnYm9keScpLm9mZigna2V5dXAuZm5kdG4ucmV2ZWFsJyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgb3BlbiA6IGZ1bmN0aW9uICh0YXJnZXQsIGFqYXhfc2V0dGluZ3MpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICBtb2RhbDtcblxuICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICBpZiAodHlwZW9mIHRhcmdldC5zZWxlY3RvciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAvLyBGaW5kIHRoZSBuYW1lZCBub2RlOyBvbmx5IHVzZSB0aGUgZmlyc3Qgb25lIGZvdW5kLCBzaW5jZSB0aGUgcmVzdCBvZiB0aGUgY29kZSBhc3N1bWVzIHRoZXJlJ3Mgb25seSBvbmUgbm9kZVxuICAgICAgICAgIG1vZGFsID0gc2VsZi5TKCcjJyArIHRhcmdldC5kYXRhKHNlbGYuZGF0YV9hdHRyKCdyZXZlYWwtaWQnKSkpLmZpcnN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW9kYWwgPSBzZWxmLlModGhpcy5zY29wZSk7XG5cbiAgICAgICAgICBhamF4X3NldHRpbmdzID0gdGFyZ2V0O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtb2RhbCA9IHNlbGYuUyh0aGlzLnNjb3BlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHNldHRpbmdzID0gbW9kYWwuZGF0YShzZWxmLmF0dHJfbmFtZSh0cnVlKSArICctaW5pdCcpO1xuICAgICAgc2V0dGluZ3MgPSBzZXR0aW5ncyB8fCB0aGlzLnNldHRpbmdzO1xuXG5cbiAgICAgIGlmIChtb2RhbC5oYXNDbGFzcygnb3BlbicpICYmIHRhcmdldC5hdHRyKCdkYXRhLXJldmVhbC1pZCcpID09IG1vZGFsLmF0dHIoJ2lkJykpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuY2xvc2UobW9kYWwpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIW1vZGFsLmhhc0NsYXNzKCdvcGVuJykpIHtcbiAgICAgICAgdmFyIG9wZW5fbW9kYWwgPSBzZWxmLlMoJ1snICsgc2VsZi5hdHRyX25hbWUoKSArICddLm9wZW4nKTtcblxuICAgICAgICBpZiAodHlwZW9mIG1vZGFsLmRhdGEoJ2Nzcy10b3AnKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBtb2RhbC5kYXRhKCdjc3MtdG9wJywgcGFyc2VJbnQobW9kYWwuY3NzKCd0b3AnKSwgMTApKVxuICAgICAgICAgICAgLmRhdGEoJ29mZnNldCcsIHRoaXMuY2FjaGVfb2Zmc2V0KG1vZGFsKSk7XG4gICAgICAgIH1cblxuICAgICAgICBtb2RhbC5hdHRyKCd0YWJpbmRleCcsJzAnKS5hdHRyKCdhcmlhLWhpZGRlbicsJ2ZhbHNlJyk7XG5cbiAgICAgICAgdGhpcy5rZXlfdXBfb24obW9kYWwpOyAgICAvLyBQQVRDSCAjMzogdHVybmluZyBvbiBrZXkgdXAgY2FwdHVyZSBvbmx5IHdoZW4gYSByZXZlYWwgd2luZG93IGlzIG9wZW5cblxuICAgICAgICAvLyBQcmV2ZW50IG5hbWVzcGFjZSBldmVudCBmcm9tIHRyaWdnZXJpbmcgdHdpY2VcbiAgICAgICAgbW9kYWwub24oJ29wZW4uZm5kdG4ucmV2ZWFsJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGlmIChlLm5hbWVzcGFjZSAhPT0gJ2ZuZHRuLnJldmVhbCcpIHJldHVybjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbW9kYWwub24oJ29wZW4uZm5kdG4ucmV2ZWFsJykudHJpZ2dlcignb3Blbi5mbmR0bi5yZXZlYWwnKTtcblxuICAgICAgICBpZiAob3Blbl9tb2RhbC5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgdGhpcy50b2dnbGVfYmcobW9kYWwsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBhamF4X3NldHRpbmdzID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGFqYXhfc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICB1cmwgOiBhamF4X3NldHRpbmdzXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgYWpheF9zZXR0aW5ncyA9PT0gJ3VuZGVmaW5lZCcgfHwgIWFqYXhfc2V0dGluZ3MudXJsKSB7XG4gICAgICAgICAgaWYgKG9wZW5fbW9kYWwubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaWYgKHNldHRpbmdzLm11bHRpcGxlX29wZW5lZCkge1xuICAgICAgICAgICAgICBzZWxmLnRvX2JhY2sob3Blbl9tb2RhbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZWxmLmhpZGUob3Blbl9tb2RhbCwgc2V0dGluZ3MuY3NzLmNsb3NlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLnNob3cobW9kYWwsIHNldHRpbmdzLmNzcy5vcGVuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgb2xkX3N1Y2Nlc3MgPSB0eXBlb2YgYWpheF9zZXR0aW5ncy5zdWNjZXNzICE9PSAndW5kZWZpbmVkJyA/IGFqYXhfc2V0dGluZ3Muc3VjY2VzcyA6IG51bGw7XG4gICAgICAgICAgJC5leHRlbmQoYWpheF9zZXR0aW5ncywge1xuICAgICAgICAgICAgc3VjY2VzcyA6IGZ1bmN0aW9uIChkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUikge1xuICAgICAgICAgICAgICBpZiAoICQuaXNGdW5jdGlvbihvbGRfc3VjY2VzcykgKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG9sZF9zdWNjZXNzKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgZGF0YSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBvcHRpb25zLnJlcGxhY2VDb250ZW50U2VsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIG1vZGFsLmZpbmQob3B0aW9ucy5yZXBsYWNlQ29udGVudFNlbCkuaHRtbChkYXRhKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtb2RhbC5odG1sKGRhdGEpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgc2VsZi5TKG1vZGFsKS5mb3VuZGF0aW9uKCdzZWN0aW9uJywgJ3JlZmxvdycpO1xuICAgICAgICAgICAgICBzZWxmLlMobW9kYWwpLmNoaWxkcmVuKCkuZm91bmRhdGlvbigpO1xuXG4gICAgICAgICAgICAgIGlmIChvcGVuX21vZGFsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MubXVsdGlwbGVfb3BlbmVkKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLnRvX2JhY2sob3Blbl9tb2RhbCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHNlbGYuaGlkZShvcGVuX21vZGFsLCBzZXR0aW5ncy5jc3MuY2xvc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZWxmLnNob3cobW9kYWwsIHNldHRpbmdzLmNzcy5vcGVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIGNoZWNrIGZvciBpZiB1c2VyIGluaXRhbGl6ZWQgd2l0aCBlcnJvciBjYWxsYmFja1xuICAgICAgICAgIGlmIChzZXR0aW5ncy5vbl9hamF4X2Vycm9yICE9PSAkLm5vb3ApIHtcbiAgICAgICAgICAgICQuZXh0ZW5kKGFqYXhfc2V0dGluZ3MsIHtcbiAgICAgICAgICAgICAgZXJyb3IgOiBzZXR0aW5ncy5vbl9hamF4X2Vycm9yXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkLmFqYXgoYWpheF9zZXR0aW5ncyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNlbGYuUyh3aW5kb3cpLnRyaWdnZXIoJ3Jlc2l6ZScpO1xuICAgIH0sXG5cbiAgICBjbG9zZSA6IGZ1bmN0aW9uIChtb2RhbCkge1xuICAgICAgdmFyIG1vZGFsID0gbW9kYWwgJiYgbW9kYWwubGVuZ3RoID8gbW9kYWwgOiB0aGlzLlModGhpcy5zY29wZSksXG4gICAgICAgICAgb3Blbl9tb2RhbHMgPSB0aGlzLlMoJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddLm9wZW4nKSxcbiAgICAgICAgICBzZXR0aW5ncyA9IG1vZGFsLmRhdGEodGhpcy5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKSB8fCB0aGlzLnNldHRpbmdzLFxuICAgICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAob3Blbl9tb2RhbHMubGVuZ3RoID4gMCkge1xuXG4gICAgICAgIG1vZGFsLnJlbW92ZUF0dHIoJ3RhYmluZGV4JywnMCcpLmF0dHIoJ2FyaWEtaGlkZGVuJywndHJ1ZScpO1xuXG4gICAgICAgIHRoaXMubG9ja2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5rZXlfdXBfb2ZmKG1vZGFsKTsgICAvLyBQQVRDSCAjMzogdHVybmluZyBvbiBrZXkgdXAgY2FwdHVyZSBvbmx5IHdoZW4gYSByZXZlYWwgd2luZG93IGlzIG9wZW5cblxuICAgICAgICBtb2RhbC50cmlnZ2VyKCdjbG9zZS5mbmR0bi5yZXZlYWwnKTtcblxuICAgICAgICBpZiAoKHNldHRpbmdzLm11bHRpcGxlX29wZW5lZCAmJiBvcGVuX21vZGFscy5sZW5ndGggPT09IDEpIHx8ICFzZXR0aW5ncy5tdWx0aXBsZV9vcGVuZWQgfHwgbW9kYWwubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHNlbGYudG9nZ2xlX2JnKG1vZGFsLCBmYWxzZSk7XG4gICAgICAgICAgc2VsZi50b19mcm9udChtb2RhbCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2V0dGluZ3MubXVsdGlwbGVfb3BlbmVkKSB7XG4gICAgICAgICAgc2VsZi5oaWRlKG1vZGFsLCBzZXR0aW5ncy5jc3MuY2xvc2UsIHNldHRpbmdzKTtcbiAgICAgICAgICBzZWxmLnRvX2Zyb250KCQoJC5tYWtlQXJyYXkob3Blbl9tb2RhbHMpLnJldmVyc2UoKVsxXSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuaGlkZShvcGVuX21vZGFscywgc2V0dGluZ3MuY3NzLmNsb3NlLCBzZXR0aW5ncyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY2xvc2VfdGFyZ2V0cyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBiYXNlID0gJy4nICsgdGhpcy5zZXR0aW5ncy5kaXNtaXNzX21vZGFsX2NsYXNzO1xuXG4gICAgICBpZiAodGhpcy5zZXR0aW5ncy5jbG9zZV9vbl9iYWNrZ3JvdW5kX2NsaWNrKSB7XG4gICAgICAgIHJldHVybiBiYXNlICsgJywgLicgKyB0aGlzLnNldHRpbmdzLmJnX2NsYXNzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYmFzZTtcbiAgICB9LFxuXG4gICAgdG9nZ2xlX2JnIDogZnVuY3Rpb24gKG1vZGFsLCBzdGF0ZSkge1xuICAgICAgaWYgKHRoaXMuUygnLicgKyB0aGlzLnNldHRpbmdzLmJnX2NsYXNzKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5iZyA9ICQoJzxkaXYgLz4nLCB7J2NsYXNzJzogdGhpcy5zZXR0aW5ncy5iZ19jbGFzc30pXG4gICAgICAgICAgLmFwcGVuZFRvKCdib2R5JykuaGlkZSgpO1xuICAgICAgfVxuXG4gICAgICB2YXIgdmlzaWJsZSA9IHRoaXMuc2V0dGluZ3MuYmcuZmlsdGVyKCc6dmlzaWJsZScpLmxlbmd0aCA+IDA7XG4gICAgICBpZiAoIHN0YXRlICE9IHZpc2libGUgKSB7XG4gICAgICAgIGlmICggc3RhdGUgPT0gdW5kZWZpbmVkID8gdmlzaWJsZSA6ICFzdGF0ZSApIHtcbiAgICAgICAgICB0aGlzLmhpZGUodGhpcy5zZXR0aW5ncy5iZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zaG93KHRoaXMuc2V0dGluZ3MuYmcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNob3cgOiBmdW5jdGlvbiAoZWwsIGNzcykge1xuICAgICAgLy8gaXMgbW9kYWxcbiAgICAgIGlmIChjc3MpIHtcbiAgICAgICAgdmFyIHNldHRpbmdzID0gZWwuZGF0YSh0aGlzLmF0dHJfbmFtZSh0cnVlKSArICctaW5pdCcpIHx8IHRoaXMuc2V0dGluZ3MsXG4gICAgICAgICAgICByb290X2VsZW1lbnQgPSBzZXR0aW5ncy5yb290X2VsZW1lbnQsXG4gICAgICAgICAgICBjb250ZXh0ID0gdGhpcztcblxuICAgICAgICBpZiAoZWwucGFyZW50KHJvb3RfZWxlbWVudCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdmFyIHBsYWNlaG9sZGVyID0gZWwud3JhcCgnPGRpdiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCIgLz4nKS5wYXJlbnQoKTtcblxuICAgICAgICAgIGVsLm9uKCdjbG9zZWQuZm5kdG4ucmV2ZWFsLndyYXBwZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBlbC5kZXRhY2goKS5hcHBlbmRUbyhwbGFjZWhvbGRlcik7XG4gICAgICAgICAgICBlbC51bndyYXAoKS51bmJpbmQoJ2Nsb3NlZC5mbmR0bi5yZXZlYWwud3JhcHBlZCcpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgZWwuZGV0YWNoKCkuYXBwZW5kVG8ocm9vdF9lbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhbmltRGF0YSA9IGdldEFuaW1hdGlvbkRhdGEoc2V0dGluZ3MuYW5pbWF0aW9uKTtcbiAgICAgICAgaWYgKCFhbmltRGF0YS5hbmltYXRlKSB7XG4gICAgICAgICAgdGhpcy5sb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYW5pbURhdGEucG9wKSB7XG4gICAgICAgICAgY3NzLnRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKSAtIGVsLmRhdGEoJ29mZnNldCcpICsgJ3B4JztcbiAgICAgICAgICB2YXIgZW5kX2NzcyA9IHtcbiAgICAgICAgICAgIHRvcDogJCh3aW5kb3cpLnNjcm9sbFRvcCgpICsgZWwuZGF0YSgnY3NzLXRvcCcpICsgJ3B4JyxcbiAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsXG4gICAgICAgICAgICAgIC5jc3MoY3NzKVxuICAgICAgICAgICAgICAuYW5pbWF0ZShlbmRfY3NzLCBzZXR0aW5ncy5hbmltYXRpb25fc3BlZWQsICdsaW5lYXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5sb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBlbC50cmlnZ2VyKCdvcGVuZWQuZm5kdG4ucmV2ZWFsJyk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5hZGRDbGFzcygnb3BlbicpO1xuICAgICAgICAgIH0sIHNldHRpbmdzLmFuaW1hdGlvbl9zcGVlZCAvIDIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFuaW1EYXRhLmZhZGUpIHtcbiAgICAgICAgICBjc3MudG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpICsgZWwuZGF0YSgnY3NzLXRvcCcpICsgJ3B4JztcbiAgICAgICAgICB2YXIgZW5kX2NzcyA9IHtvcGFjaXR5OiAxfTtcblxuICAgICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBlbFxuICAgICAgICAgICAgICAuY3NzKGNzcylcbiAgICAgICAgICAgICAgLmFuaW1hdGUoZW5kX2Nzcywgc2V0dGluZ3MuYW5pbWF0aW9uX3NwZWVkLCAnbGluZWFyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQubG9ja2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZWwudHJpZ2dlcignb3BlbmVkLmZuZHRuLnJldmVhbCcpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICB9LCBzZXR0aW5ncy5hbmltYXRpb25fc3BlZWQgLyAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbC5jc3MoY3NzKS5zaG93KCkuY3NzKHtvcGFjaXR5IDogMX0pLmFkZENsYXNzKCdvcGVuJykudHJpZ2dlcignb3BlbmVkLmZuZHRuLnJldmVhbCcpO1xuICAgICAgfVxuXG4gICAgICB2YXIgc2V0dGluZ3MgPSB0aGlzLnNldHRpbmdzO1xuXG4gICAgICAvLyBzaG91bGQgd2UgYW5pbWF0ZSB0aGUgYmFja2dyb3VuZD9cbiAgICAgIGlmIChnZXRBbmltYXRpb25EYXRhKHNldHRpbmdzLmFuaW1hdGlvbikuZmFkZSkge1xuICAgICAgICByZXR1cm4gZWwuZmFkZUluKHNldHRpbmdzLmFuaW1hdGlvbl9zcGVlZCAvIDIpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmxvY2tlZCA9IGZhbHNlO1xuXG4gICAgICByZXR1cm4gZWwuc2hvdygpO1xuICAgIH0sXG5cbiAgICB0b19iYWNrIDogZnVuY3Rpb24oZWwpIHtcbiAgICAgIGVsLmFkZENsYXNzKCd0b2JhY2snKTtcbiAgICB9LFxuXG4gICAgdG9fZnJvbnQgOiBmdW5jdGlvbihlbCkge1xuICAgICAgZWwucmVtb3ZlQ2xhc3MoJ3RvYmFjaycpO1xuICAgIH0sXG5cbiAgICBoaWRlIDogZnVuY3Rpb24gKGVsLCBjc3MpIHtcbiAgICAgIC8vIGlzIG1vZGFsXG4gICAgICBpZiAoY3NzKSB7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9IGVsLmRhdGEodGhpcy5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKSxcbiAgICAgICAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgICBzZXR0aW5ncyA9IHNldHRpbmdzIHx8IHRoaXMuc2V0dGluZ3M7XG5cbiAgICAgICAgdmFyIGFuaW1EYXRhID0gZ2V0QW5pbWF0aW9uRGF0YShzZXR0aW5ncy5hbmltYXRpb24pO1xuICAgICAgICBpZiAoIWFuaW1EYXRhLmFuaW1hdGUpIHtcbiAgICAgICAgICB0aGlzLmxvY2tlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhbmltRGF0YS5wb3ApIHtcbiAgICAgICAgICB2YXIgZW5kX2NzcyA9IHtcbiAgICAgICAgICAgIHRvcDogLSAkKHdpbmRvdykuc2Nyb2xsVG9wKCkgLSBlbC5kYXRhKCdvZmZzZXQnKSArICdweCcsXG4gICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBlbFxuICAgICAgICAgICAgICAuYW5pbWF0ZShlbmRfY3NzLCBzZXR0aW5ncy5hbmltYXRpb25fc3BlZWQsICdsaW5lYXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5sb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBlbC5jc3MoY3NzKS50cmlnZ2VyKCdjbG9zZWQuZm5kdG4ucmV2ZWFsJyk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgICAgIH0sIHNldHRpbmdzLmFuaW1hdGlvbl9zcGVlZCAvIDIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFuaW1EYXRhLmZhZGUpIHtcbiAgICAgICAgICB2YXIgZW5kX2NzcyA9IHtvcGFjaXR5IDogMH07XG5cbiAgICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZWxcbiAgICAgICAgICAgICAgLmFuaW1hdGUoZW5kX2Nzcywgc2V0dGluZ3MuYW5pbWF0aW9uX3NwZWVkLCAnbGluZWFyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQubG9ja2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZWwuY3NzKGNzcykudHJpZ2dlcignY2xvc2VkLmZuZHRuLnJldmVhbCcpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICB9LCBzZXR0aW5ncy5hbmltYXRpb25fc3BlZWQgLyAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbC5oaWRlKCkuY3NzKGNzcykucmVtb3ZlQ2xhc3MoJ29wZW4nKS50cmlnZ2VyKCdjbG9zZWQuZm5kdG4ucmV2ZWFsJyk7XG4gICAgICB9XG5cbiAgICAgIHZhciBzZXR0aW5ncyA9IHRoaXMuc2V0dGluZ3M7XG5cbiAgICAgIC8vIHNob3VsZCB3ZSBhbmltYXRlIHRoZSBiYWNrZ3JvdW5kP1xuICAgICAgaWYgKGdldEFuaW1hdGlvbkRhdGEoc2V0dGluZ3MuYW5pbWF0aW9uKS5mYWRlKSB7XG4gICAgICAgIHJldHVybiBlbC5mYWRlT3V0KHNldHRpbmdzLmFuaW1hdGlvbl9zcGVlZCAvIDIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZWwuaGlkZSgpO1xuICAgIH0sXG5cbiAgICBjbG9zZV92aWRlbyA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgdmlkZW8gPSAkKCcuZmxleC12aWRlbycsIGUudGFyZ2V0KSxcbiAgICAgICAgICBpZnJhbWUgPSAkKCdpZnJhbWUnLCB2aWRlbyk7XG5cbiAgICAgIGlmIChpZnJhbWUubGVuZ3RoID4gMCkge1xuICAgICAgICBpZnJhbWUuYXR0cignZGF0YS1zcmMnLCBpZnJhbWVbMF0uc3JjKTtcbiAgICAgICAgaWZyYW1lLmF0dHIoJ3NyYycsIGlmcmFtZS5hdHRyKCdzcmMnKSk7XG4gICAgICAgIHZpZGVvLmhpZGUoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgb3Blbl92aWRlbyA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgdmlkZW8gPSAkKCcuZmxleC12aWRlbycsIGUudGFyZ2V0KSxcbiAgICAgICAgICBpZnJhbWUgPSB2aWRlby5maW5kKCdpZnJhbWUnKTtcblxuICAgICAgaWYgKGlmcmFtZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBkYXRhX3NyYyA9IGlmcmFtZS5hdHRyKCdkYXRhLXNyYycpO1xuICAgICAgICBpZiAodHlwZW9mIGRhdGFfc3JjID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlmcmFtZVswXS5zcmMgPSBpZnJhbWUuYXR0cignZGF0YS1zcmMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgc3JjID0gaWZyYW1lWzBdLnNyYztcbiAgICAgICAgICBpZnJhbWVbMF0uc3JjID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGlmcmFtZVswXS5zcmMgPSBzcmM7XG4gICAgICAgIH1cbiAgICAgICAgdmlkZW8uc2hvdygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBkYXRhX2F0dHIgOiBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICBpZiAodGhpcy5uYW1lc3BhY2UubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lc3BhY2UgKyAnLScgKyBzdHI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdHI7XG4gICAgfSxcblxuICAgIGNhY2hlX29mZnNldCA6IGZ1bmN0aW9uIChtb2RhbCkge1xuICAgICAgdmFyIG9mZnNldCA9IG1vZGFsLnNob3coKS5oZWlnaHQoKSArIHBhcnNlSW50KG1vZGFsLmNzcygndG9wJyksIDEwKSArIG1vZGFsLnNjcm9sbFk7XG5cbiAgICAgIG1vZGFsLmhpZGUoKTtcblxuICAgICAgcmV0dXJuIG9mZnNldDtcbiAgICB9LFxuXG4gICAgb2ZmIDogZnVuY3Rpb24gKCkge1xuICAgICAgJCh0aGlzLnNjb3BlKS5vZmYoJy5mbmR0bi5yZXZlYWwnKTtcbiAgICB9LFxuXG4gICAgcmVmbG93IDogZnVuY3Rpb24gKCkge31cbiAgfTtcblxuICAvKlxuICAgKiBnZXRBbmltYXRpb25EYXRhKCdwb3BBbmRGYWRlJykgLy8ge2FuaW1hdGU6IHRydWUsICBwb3A6IHRydWUsICBmYWRlOiB0cnVlfVxuICAgKiBnZXRBbmltYXRpb25EYXRhKCdmYWRlJykgICAgICAgLy8ge2FuaW1hdGU6IHRydWUsICBwb3A6IGZhbHNlLCBmYWRlOiB0cnVlfVxuICAgKiBnZXRBbmltYXRpb25EYXRhKCdwb3AnKSAgICAgICAgLy8ge2FuaW1hdGU6IHRydWUsICBwb3A6IHRydWUsICBmYWRlOiBmYWxzZX1cbiAgICogZ2V0QW5pbWF0aW9uRGF0YSgnZm9vJykgICAgICAgIC8vIHthbmltYXRlOiBmYWxzZSwgcG9wOiBmYWxzZSwgZmFkZTogZmFsc2V9XG4gICAqIGdldEFuaW1hdGlvbkRhdGEobnVsbCkgICAgICAgICAvLyB7YW5pbWF0ZTogZmFsc2UsIHBvcDogZmFsc2UsIGZhZGU6IGZhbHNlfVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0QW5pbWF0aW9uRGF0YShzdHIpIHtcbiAgICB2YXIgZmFkZSA9IC9mYWRlL2kudGVzdChzdHIpO1xuICAgIHZhciBwb3AgPSAvcG9wL2kudGVzdChzdHIpO1xuICAgIHJldHVybiB7XG4gICAgICBhbmltYXRlIDogZmFkZSB8fCBwb3AsXG4gICAgICBwb3AgOiBwb3AsXG4gICAgICBmYWRlIDogZmFkZVxuICAgIH07XG4gIH1cbn0oalF1ZXJ5LCB3aW5kb3csIHdpbmRvdy5kb2N1bWVudCkpO1xuIiwiOyhmdW5jdGlvbiAoJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBGb3VuZGF0aW9uLmxpYnMuc2xpZGVyID0ge1xuICAgIG5hbWUgOiAnc2xpZGVyJyxcblxuICAgIHZlcnNpb24gOiAnNS41LjEnLFxuXG4gICAgc2V0dGluZ3MgOiB7XG4gICAgICBzdGFydCA6IDAsXG4gICAgICBlbmQgOiAxMDAsXG4gICAgICBzdGVwIDogMSxcbiAgICAgIHByZWNpc2lvbiA6IG51bGwsXG4gICAgICBpbml0aWFsIDogbnVsbCxcbiAgICAgIGRpc3BsYXlfc2VsZWN0b3IgOiAnJyxcbiAgICAgIHZlcnRpY2FsIDogZmFsc2UsXG4gICAgICB0cmlnZ2VyX2lucHV0X2NoYW5nZSA6IGZhbHNlLFxuICAgICAgb25fY2hhbmdlIDogZnVuY3Rpb24gKCkge31cbiAgICB9LFxuXG4gICAgY2FjaGUgOiB7fSxcblxuICAgIGluaXQgOiBmdW5jdGlvbiAoc2NvcGUsIG1ldGhvZCwgb3B0aW9ucykge1xuICAgICAgRm91bmRhdGlvbi5pbmhlcml0KHRoaXMsICd0aHJvdHRsZScpO1xuICAgICAgdGhpcy5iaW5kaW5ncyhtZXRob2QsIG9wdGlvbnMpO1xuICAgICAgdGhpcy5yZWZsb3coKTtcbiAgICB9LFxuXG4gICAgZXZlbnRzIDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAkKHRoaXMuc2NvcGUpXG4gICAgICAgIC5vZmYoJy5zbGlkZXInKVxuICAgICAgICAub24oJ21vdXNlZG93bi5mbmR0bi5zbGlkZXIgdG91Y2hzdGFydC5mbmR0bi5zbGlkZXIgcG9pbnRlcmRvd24uZm5kdG4uc2xpZGVyJyxcbiAgICAgICAgJ1snICsgc2VsZi5hdHRyX25hbWUoKSArICddOm5vdCguZGlzYWJsZWQsIFtkaXNhYmxlZF0pIC5yYW5nZS1zbGlkZXItaGFuZGxlJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBpZiAoIXNlbGYuY2FjaGUuYWN0aXZlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBzZWxmLnNldF9hY3RpdmVfc2xpZGVyKCQoZS50YXJnZXQpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignbW91c2Vtb3ZlLmZuZHRuLnNsaWRlciB0b3VjaG1vdmUuZm5kdG4uc2xpZGVyIHBvaW50ZXJtb3ZlLmZuZHRuLnNsaWRlcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgaWYgKCEhc2VsZi5jYWNoZS5hY3RpdmUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGlmICgkLmRhdGEoc2VsZi5jYWNoZS5hY3RpdmVbMF0sICdzZXR0aW5ncycpLnZlcnRpY2FsKSB7XG4gICAgICAgICAgICAgIHZhciBzY3JvbGxfb2Zmc2V0ID0gMDtcbiAgICAgICAgICAgICAgaWYgKCFlLnBhZ2VZKSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xsX29mZnNldCA9IHdpbmRvdy5zY3JvbGxZO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNlbGYuY2FsY3VsYXRlX3Bvc2l0aW9uKHNlbGYuY2FjaGUuYWN0aXZlLCBzZWxmLmdldF9jdXJzb3JfcG9zaXRpb24oZSwgJ3knKSArIHNjcm9sbF9vZmZzZXQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc2VsZi5jYWxjdWxhdGVfcG9zaXRpb24oc2VsZi5jYWNoZS5hY3RpdmUsIHNlbGYuZ2V0X2N1cnNvcl9wb3NpdGlvbihlLCAneCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignbW91c2V1cC5mbmR0bi5zbGlkZXIgdG91Y2hlbmQuZm5kdG4uc2xpZGVyIHBvaW50ZXJ1cC5mbmR0bi5zbGlkZXInLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIHNlbGYucmVtb3ZlX2FjdGl2ZV9zbGlkZXIoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdjaGFuZ2UuZm5kdG4uc2xpZGVyJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBzZWxmLnNldHRpbmdzLm9uX2NoYW5nZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgc2VsZi5TKHdpbmRvdylcbiAgICAgICAgLm9uKCdyZXNpemUuZm5kdG4uc2xpZGVyJywgc2VsZi50aHJvdHRsZShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIHNlbGYucmVmbG93KCk7XG4gICAgICAgIH0sIDMwMCkpO1xuXG4gICAgICAvLyB1cGRhdGUgc2xpZGVyIHZhbHVlIGFzIHVzZXJzIGNoYW5nZSBpbnB1dCB2YWx1ZVxuICAgICAgdGhpcy5TKCdbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnXScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2xpZGVyID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGhhbmRsZSA9IHNsaWRlci5jaGlsZHJlbignLnJhbmdlLXNsaWRlci1oYW5kbGUnKVswXSxcbiAgICAgICAgICAgIHNldHRpbmdzID0gc2VsZi5pbml0aWFsaXplX3NldHRpbmdzKGhhbmRsZSk7XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLmRpc3BsYXlfc2VsZWN0b3IgIT0gJycpIHtcbiAgICAgICAgICAkKHNldHRpbmdzLmRpc3BsYXlfc2VsZWN0b3IpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc093blByb3BlcnR5KCd2YWx1ZScpKSB7XG4gICAgICAgICAgICAgICQodGhpcykuY2hhbmdlKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgLy8gaXMgdGhlcmUgYSBiZXR0ZXIgd2F5IHRvIGRvIHRoaXM/XG4gICAgICAgICAgICAgICAgc2xpZGVyLmZvdW5kYXRpb24oXCJzbGlkZXJcIiwgXCJzZXRfdmFsdWVcIiwgJCh0aGlzKS52YWwoKSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0X2N1cnNvcl9wb3NpdGlvbiA6IGZ1bmN0aW9uIChlLCB4eSkge1xuICAgICAgdmFyIHBhZ2VYWSA9ICdwYWdlJyArIHh5LnRvVXBwZXJDYXNlKCksXG4gICAgICAgICAgY2xpZW50WFkgPSAnY2xpZW50JyArIHh5LnRvVXBwZXJDYXNlKCksXG4gICAgICAgICAgcG9zaXRpb247XG5cbiAgICAgIGlmICh0eXBlb2YgZVtwYWdlWFldICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBwb3NpdGlvbiA9IGVbcGFnZVhZXTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGUub3JpZ2luYWxFdmVudFtjbGllbnRYWV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHBvc2l0aW9uID0gZS5vcmlnaW5hbEV2ZW50W2NsaWVudFhZXTtcbiAgICAgIH0gZWxzZSBpZiAoZS5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgJiYgZS5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0gJiYgdHlwZW9mIGUub3JpZ2luYWxFdmVudC50b3VjaGVzWzBdW2NsaWVudFhZXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcG9zaXRpb24gPSBlLm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXVtjbGllbnRYWV07XG4gICAgICB9IGVsc2UgaWYgKGUuY3VycmVudFBvaW50ICYmIHR5cGVvZiBlLmN1cnJlbnRQb2ludFt4eV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHBvc2l0aW9uID0gZS5jdXJyZW50UG9pbnRbeHldO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgfSxcblxuICAgIHNldF9hY3RpdmVfc2xpZGVyIDogZnVuY3Rpb24gKCRoYW5kbGUpIHtcbiAgICAgIHRoaXMuY2FjaGUuYWN0aXZlID0gJGhhbmRsZTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlX2FjdGl2ZV9zbGlkZXIgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNhY2hlLmFjdGl2ZSA9IG51bGw7XG4gICAgfSxcblxuICAgIGNhbGN1bGF0ZV9wb3NpdGlvbiA6IGZ1bmN0aW9uICgkaGFuZGxlLCBjdXJzb3JfeCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIHNldHRpbmdzID0gJC5kYXRhKCRoYW5kbGVbMF0sICdzZXR0aW5ncycpLFxuICAgICAgICAgIGhhbmRsZV9sID0gJC5kYXRhKCRoYW5kbGVbMF0sICdoYW5kbGVfbCcpLFxuICAgICAgICAgIGhhbmRsZV9vID0gJC5kYXRhKCRoYW5kbGVbMF0sICdoYW5kbGVfbycpLFxuICAgICAgICAgIGJhcl9sID0gJC5kYXRhKCRoYW5kbGVbMF0sICdiYXJfbCcpLFxuICAgICAgICAgIGJhcl9vID0gJC5kYXRhKCRoYW5kbGVbMF0sICdiYXJfbycpO1xuXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcGN0O1xuXG4gICAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCAmJiAhc2V0dGluZ3MudmVydGljYWwpIHtcbiAgICAgICAgICBwY3QgPSBzZWxmLmxpbWl0X3RvKCgoYmFyX28gKyBiYXJfbCAtIGN1cnNvcl94KSAvIGJhcl9sKSwgMCwgMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGN0ID0gc2VsZi5saW1pdF90bygoKGN1cnNvcl94IC0gYmFyX28pIC8gYmFyX2wpLCAwLCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBjdCA9IHNldHRpbmdzLnZlcnRpY2FsID8gMSAtIHBjdCA6IHBjdDtcblxuICAgICAgICB2YXIgbm9ybSA9IHNlbGYubm9ybWFsaXplZF92YWx1ZShwY3QsIHNldHRpbmdzLnN0YXJ0LCBzZXR0aW5ncy5lbmQsIHNldHRpbmdzLnN0ZXAsIHNldHRpbmdzLnByZWNpc2lvbik7XG5cbiAgICAgICAgc2VsZi5zZXRfdWkoJGhhbmRsZSwgbm9ybSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgc2V0X3VpIDogZnVuY3Rpb24gKCRoYW5kbGUsIHZhbHVlKSB7XG4gICAgICB2YXIgc2V0dGluZ3MgPSAkLmRhdGEoJGhhbmRsZVswXSwgJ3NldHRpbmdzJyksXG4gICAgICAgICAgaGFuZGxlX2wgPSAkLmRhdGEoJGhhbmRsZVswXSwgJ2hhbmRsZV9sJyksXG4gICAgICAgICAgYmFyX2wgPSAkLmRhdGEoJGhhbmRsZVswXSwgJ2Jhcl9sJyksXG4gICAgICAgICAgbm9ybV9wY3QgPSB0aGlzLm5vcm1hbGl6ZWRfcGVyY2VudGFnZSh2YWx1ZSwgc2V0dGluZ3Muc3RhcnQsIHNldHRpbmdzLmVuZCksXG4gICAgICAgICAgaGFuZGxlX29mZnNldCA9IG5vcm1fcGN0ICogKGJhcl9sIC0gaGFuZGxlX2wpIC0gMSxcbiAgICAgICAgICBwcm9ncmVzc19iYXJfbGVuZ3RoID0gbm9ybV9wY3QgKiAxMDAsXG4gICAgICAgICAgJGhhbmRsZV9wYXJlbnQgPSAkaGFuZGxlLnBhcmVudCgpLFxuICAgICAgICAgICRoaWRkZW5faW5wdXRzID0gJGhhbmRsZS5wYXJlbnQoKS5jaGlsZHJlbignaW5wdXRbdHlwZT1oaWRkZW5dJyk7XG5cbiAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCAmJiAhc2V0dGluZ3MudmVydGljYWwpIHtcbiAgICAgICAgaGFuZGxlX29mZnNldCA9IC1oYW5kbGVfb2Zmc2V0O1xuICAgICAgfVxuXG4gICAgICBoYW5kbGVfb2Zmc2V0ID0gc2V0dGluZ3MudmVydGljYWwgPyAtaGFuZGxlX29mZnNldCArIGJhcl9sIC0gaGFuZGxlX2wgKyAxIDogaGFuZGxlX29mZnNldDtcbiAgICAgIHRoaXMuc2V0X3RyYW5zbGF0ZSgkaGFuZGxlLCBoYW5kbGVfb2Zmc2V0LCBzZXR0aW5ncy52ZXJ0aWNhbCk7XG5cbiAgICAgIGlmIChzZXR0aW5ncy52ZXJ0aWNhbCkge1xuICAgICAgICAkaGFuZGxlLnNpYmxpbmdzKCcucmFuZ2Utc2xpZGVyLWFjdGl2ZS1zZWdtZW50JykuY3NzKCdoZWlnaHQnLCBwcm9ncmVzc19iYXJfbGVuZ3RoICsgJyUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRoYW5kbGUuc2libGluZ3MoJy5yYW5nZS1zbGlkZXItYWN0aXZlLXNlZ21lbnQnKS5jc3MoJ3dpZHRoJywgcHJvZ3Jlc3NfYmFyX2xlbmd0aCArICclJyk7XG4gICAgICB9XG5cbiAgICAgICRoYW5kbGVfcGFyZW50LmF0dHIodGhpcy5hdHRyX25hbWUoKSwgdmFsdWUpLnRyaWdnZXIoJ2NoYW5nZS5mbmR0bi5zbGlkZXInKTtcblxuICAgICAgJGhpZGRlbl9pbnB1dHMudmFsKHZhbHVlKTtcbiAgICAgIGlmIChzZXR0aW5ncy50cmlnZ2VyX2lucHV0X2NoYW5nZSkge1xuICAgICAgICAgICRoaWRkZW5faW5wdXRzLnRyaWdnZXIoJ2NoYW5nZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoISRoYW5kbGVbMF0uaGFzQXR0cmlidXRlKCdhcmlhLXZhbHVlbWluJykpIHtcbiAgICAgICAgJGhhbmRsZS5hdHRyKHtcbiAgICAgICAgICAnYXJpYS12YWx1ZW1pbicgOiBzZXR0aW5ncy5zdGFydCxcbiAgICAgICAgICAnYXJpYS12YWx1ZW1heCcgOiBzZXR0aW5ncy5lbmRcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICAkaGFuZGxlLmF0dHIoJ2FyaWEtdmFsdWVub3cnLCB2YWx1ZSk7XG5cbiAgICAgIGlmIChzZXR0aW5ncy5kaXNwbGF5X3NlbGVjdG9yICE9ICcnKSB7XG4gICAgICAgICQoc2V0dGluZ3MuZGlzcGxheV9zZWxlY3RvcikuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaGFzQXR0cmlidXRlKCd2YWx1ZScpKSB7XG4gICAgICAgICAgICAkKHRoaXMpLnZhbCh2YWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQodGhpcykudGV4dCh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICBub3JtYWxpemVkX3BlcmNlbnRhZ2UgOiBmdW5jdGlvbiAodmFsLCBzdGFydCwgZW5kKSB7XG4gICAgICByZXR1cm4gTWF0aC5taW4oMSwgKHZhbCAtIHN0YXJ0KSAvIChlbmQgLSBzdGFydCkpO1xuICAgIH0sXG5cbiAgICBub3JtYWxpemVkX3ZhbHVlIDogZnVuY3Rpb24gKHZhbCwgc3RhcnQsIGVuZCwgc3RlcCwgcHJlY2lzaW9uKSB7XG4gICAgICB2YXIgcmFuZ2UgPSBlbmQgLSBzdGFydCxcbiAgICAgICAgICBwb2ludCA9IHZhbCAqIHJhbmdlLFxuICAgICAgICAgIG1vZCA9IChwb2ludCAtIChwb2ludCAlIHN0ZXApKSAvIHN0ZXAsXG4gICAgICAgICAgcmVtID0gcG9pbnQgJSBzdGVwLFxuICAgICAgICAgIHJvdW5kID0gKCByZW0gPj0gc3RlcCAqIDAuNSA/IHN0ZXAgOiAwKTtcbiAgICAgIHJldHVybiAoKG1vZCAqIHN0ZXAgKyByb3VuZCkgKyBzdGFydCkudG9GaXhlZChwcmVjaXNpb24pO1xuICAgIH0sXG5cbiAgICBzZXRfdHJhbnNsYXRlIDogZnVuY3Rpb24gKGVsZSwgb2Zmc2V0LCB2ZXJ0aWNhbCkge1xuICAgICAgaWYgKHZlcnRpY2FsKSB7XG4gICAgICAgICQoZWxlKVxuICAgICAgICAgIC5jc3MoJy13ZWJraXQtdHJhbnNmb3JtJywgJ3RyYW5zbGF0ZVkoJyArIG9mZnNldCArICdweCknKVxuICAgICAgICAgIC5jc3MoJy1tb3otdHJhbnNmb3JtJywgJ3RyYW5zbGF0ZVkoJyArIG9mZnNldCArICdweCknKVxuICAgICAgICAgIC5jc3MoJy1tcy10cmFuc2Zvcm0nLCAndHJhbnNsYXRlWSgnICsgb2Zmc2V0ICsgJ3B4KScpXG4gICAgICAgICAgLmNzcygnLW8tdHJhbnNmb3JtJywgJ3RyYW5zbGF0ZVkoJyArIG9mZnNldCArICdweCknKVxuICAgICAgICAgIC5jc3MoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGVZKCcgKyBvZmZzZXQgKyAncHgpJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkKGVsZSlcbiAgICAgICAgICAuY3NzKCctd2Via2l0LXRyYW5zZm9ybScsICd0cmFuc2xhdGVYKCcgKyBvZmZzZXQgKyAncHgpJylcbiAgICAgICAgICAuY3NzKCctbW96LXRyYW5zZm9ybScsICd0cmFuc2xhdGVYKCcgKyBvZmZzZXQgKyAncHgpJylcbiAgICAgICAgICAuY3NzKCctbXMtdHJhbnNmb3JtJywgJ3RyYW5zbGF0ZVgoJyArIG9mZnNldCArICdweCknKVxuICAgICAgICAgIC5jc3MoJy1vLXRyYW5zZm9ybScsICd0cmFuc2xhdGVYKCcgKyBvZmZzZXQgKyAncHgpJylcbiAgICAgICAgICAuY3NzKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlWCgnICsgb2Zmc2V0ICsgJ3B4KScpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBsaW1pdF90byA6IGZ1bmN0aW9uICh2YWwsIG1pbiwgbWF4KSB7XG4gICAgICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgodmFsLCBtaW4pLCBtYXgpO1xuICAgIH0sXG5cbiAgICBpbml0aWFsaXplX3NldHRpbmdzIDogZnVuY3Rpb24gKGhhbmRsZSkge1xuICAgICAgdmFyIHNldHRpbmdzID0gJC5leHRlbmQoe30sIHRoaXMuc2V0dGluZ3MsIHRoaXMuZGF0YV9vcHRpb25zKCQoaGFuZGxlKS5wYXJlbnQoKSkpLFxuICAgICAgICAgIGRlY2ltYWxfcGxhY2VzX21hdGNoX3Jlc3VsdDtcblxuICAgICAgaWYgKHNldHRpbmdzLnByZWNpc2lvbiA9PT0gbnVsbCkge1xuICAgICAgICBkZWNpbWFsX3BsYWNlc19tYXRjaF9yZXN1bHQgPSAoJycgKyBzZXR0aW5ncy5zdGVwKS5tYXRjaCgvXFwuKFtcXGRdKikvKTtcbiAgICAgICAgc2V0dGluZ3MucHJlY2lzaW9uID0gZGVjaW1hbF9wbGFjZXNfbWF0Y2hfcmVzdWx0ICYmIGRlY2ltYWxfcGxhY2VzX21hdGNoX3Jlc3VsdFsxXSA/IGRlY2ltYWxfcGxhY2VzX21hdGNoX3Jlc3VsdFsxXS5sZW5ndGggOiAwO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2V0dGluZ3MudmVydGljYWwpIHtcbiAgICAgICAgJC5kYXRhKGhhbmRsZSwgJ2Jhcl9vJywgJChoYW5kbGUpLnBhcmVudCgpLm9mZnNldCgpLnRvcCk7XG4gICAgICAgICQuZGF0YShoYW5kbGUsICdiYXJfbCcsICQoaGFuZGxlKS5wYXJlbnQoKS5vdXRlckhlaWdodCgpKTtcbiAgICAgICAgJC5kYXRhKGhhbmRsZSwgJ2hhbmRsZV9vJywgJChoYW5kbGUpLm9mZnNldCgpLnRvcCk7XG4gICAgICAgICQuZGF0YShoYW5kbGUsICdoYW5kbGVfbCcsICQoaGFuZGxlKS5vdXRlckhlaWdodCgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQuZGF0YShoYW5kbGUsICdiYXJfbycsICQoaGFuZGxlKS5wYXJlbnQoKS5vZmZzZXQoKS5sZWZ0KTtcbiAgICAgICAgJC5kYXRhKGhhbmRsZSwgJ2Jhcl9sJywgJChoYW5kbGUpLnBhcmVudCgpLm91dGVyV2lkdGgoKSk7XG4gICAgICAgICQuZGF0YShoYW5kbGUsICdoYW5kbGVfbycsICQoaGFuZGxlKS5vZmZzZXQoKS5sZWZ0KTtcbiAgICAgICAgJC5kYXRhKGhhbmRsZSwgJ2hhbmRsZV9sJywgJChoYW5kbGUpLm91dGVyV2lkdGgoKSk7XG4gICAgICB9XG5cbiAgICAgICQuZGF0YShoYW5kbGUsICdiYXInLCAkKGhhbmRsZSkucGFyZW50KCkpO1xuICAgICAgcmV0dXJuICQuZGF0YShoYW5kbGUsICdzZXR0aW5ncycsIHNldHRpbmdzKTtcbiAgICB9LFxuXG4gICAgc2V0X2luaXRpYWxfcG9zaXRpb24gOiBmdW5jdGlvbiAoJGVsZSkge1xuICAgICAgdmFyIHNldHRpbmdzID0gJC5kYXRhKCRlbGUuY2hpbGRyZW4oJy5yYW5nZS1zbGlkZXItaGFuZGxlJylbMF0sICdzZXR0aW5ncycpLFxuICAgICAgICAgIGluaXRpYWwgPSAoKHR5cGVvZiBzZXR0aW5ncy5pbml0aWFsID09ICdudW1iZXInICYmICFpc05hTihzZXR0aW5ncy5pbml0aWFsKSkgPyBzZXR0aW5ncy5pbml0aWFsIDogTWF0aC5mbG9vcigoc2V0dGluZ3MuZW5kIC0gc2V0dGluZ3Muc3RhcnQpICogMC41IC8gc2V0dGluZ3Muc3RlcCkgKiBzZXR0aW5ncy5zdGVwICsgc2V0dGluZ3Muc3RhcnQpLFxuICAgICAgICAgICRoYW5kbGUgPSAkZWxlLmNoaWxkcmVuKCcucmFuZ2Utc2xpZGVyLWhhbmRsZScpO1xuICAgICAgdGhpcy5zZXRfdWkoJGhhbmRsZSwgaW5pdGlhbCk7XG4gICAgfSxcblxuICAgIHNldF92YWx1ZSA6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgJCgnWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJ10nLCB0aGlzLnNjb3BlKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS5hdHRyKHNlbGYuYXR0cl9uYW1lKCksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgaWYgKCEhJCh0aGlzLnNjb3BlKS5hdHRyKHNlbGYuYXR0cl9uYW1lKCkpKSB7XG4gICAgICAgICQodGhpcy5zY29wZSkuYXR0cihzZWxmLmF0dHJfbmFtZSgpLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgICBzZWxmLnJlZmxvdygpO1xuICAgIH0sXG5cbiAgICByZWZsb3cgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBzZWxmLlMoJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBoYW5kbGUgPSAkKHRoaXMpLmNoaWxkcmVuKCcucmFuZ2Utc2xpZGVyLWhhbmRsZScpWzBdLFxuICAgICAgICAgICAgdmFsID0gJCh0aGlzKS5hdHRyKHNlbGYuYXR0cl9uYW1lKCkpO1xuICAgICAgICBzZWxmLmluaXRpYWxpemVfc2V0dGluZ3MoaGFuZGxlKTtcblxuICAgICAgICBpZiAodmFsKSB7XG4gICAgICAgICAgc2VsZi5zZXRfdWkoJChoYW5kbGUpLCBwYXJzZUZsb2F0KHZhbCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuc2V0X2luaXRpYWxfcG9zaXRpb24oJCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxufShqUXVlcnksIHdpbmRvdywgd2luZG93LmRvY3VtZW50KSk7XG4iLCI7KGZ1bmN0aW9uICgkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIEZvdW5kYXRpb24ubGlicy50YWIgPSB7XG4gICAgbmFtZSA6ICd0YWInLFxuXG4gICAgdmVyc2lvbiA6ICc1LjUuMScsXG5cbiAgICBzZXR0aW5ncyA6IHtcbiAgICAgIGFjdGl2ZV9jbGFzcyA6ICdhY3RpdmUnLFxuICAgICAgY2FsbGJhY2sgOiBmdW5jdGlvbiAoKSB7fSxcbiAgICAgIGRlZXBfbGlua2luZyA6IGZhbHNlLFxuICAgICAgc2Nyb2xsX3RvX2NvbnRlbnQgOiB0cnVlLFxuICAgICAgaXNfaG92ZXIgOiBmYWxzZVxuICAgIH0sXG5cbiAgICBkZWZhdWx0X3RhYl9oYXNoZXMgOiBbXSxcblxuICAgIGluaXQgOiBmdW5jdGlvbiAoc2NvcGUsIG1ldGhvZCwgb3B0aW9ucykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIFMgPSB0aGlzLlM7XG5cblx0ICAvLyBTdG9yZSB0aGUgZGVmYXVsdCBhY3RpdmUgdGFicyB3aGljaCB3aWxsIGJlIHJlZmVyZW5jZWQgd2hlbiB0aGVcblx0ICAvLyBsb2NhdGlvbiBoYXNoIGlzIGFic2VudCwgYXMgaW4gdGhlIGNhc2Ugb2YgbmF2aWdhdGluZyB0aGUgdGFicyBhbmRcblx0ICAvLyByZXR1cm5pbmcgdG8gdGhlIGZpcnN0IHZpZXdpbmcgdmlhIHRoZSBicm93c2VyIEJhY2sgYnV0dG9uLlxuXHQgIFMoJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddID4gLmFjdGl2ZSA+IGEnLCB0aGlzLnNjb3BlKS5lYWNoKGZ1bmN0aW9uICgpIHtcblx0ICAgIHNlbGYuZGVmYXVsdF90YWJfaGFzaGVzLnB1c2godGhpcy5oYXNoKTtcblx0ICB9KTtcblxuICAgICAgLy8gc3RvcmUgdGhlIGluaXRpYWwgaHJlZiwgd2hpY2ggaXMgdXNlZCB0byBhbGxvdyBjb3JyZWN0IGJlaGF2aW91ciBvZiB0aGVcbiAgICAgIC8vIGJyb3dzZXIgYmFjayBidXR0b24gd2hlbiBkZWVwIGxpbmtpbmcgaXMgdHVybmVkIG9uLlxuICAgICAgc2VsZi5lbnRyeV9sb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuXG4gICAgICB0aGlzLmJpbmRpbmdzKG1ldGhvZCwgb3B0aW9ucyk7XG4gICAgICB0aGlzLmhhbmRsZV9sb2NhdGlvbl9oYXNoX2NoYW5nZSgpO1xuICAgIH0sXG5cbiAgICBldmVudHMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgUyA9IHRoaXMuUztcblxuICAgICAgdmFyIHVzdWFsX3RhYl9iZWhhdmlvciA9ICBmdW5jdGlvbiAoZSwgdGFyZ2V0KSB7XG4gICAgICAgICAgdmFyIHNldHRpbmdzID0gUyh0YXJnZXQpLmNsb3Nlc3QoJ1snICsgc2VsZi5hdHRyX25hbWUoKSArICddJykuZGF0YShzZWxmLmF0dHJfbmFtZSh0cnVlKSArICctaW5pdCcpO1xuICAgICAgICAgIGlmICghc2V0dGluZ3MuaXNfaG92ZXIgfHwgTW9kZXJuaXpyLnRvdWNoKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgc2VsZi50b2dnbGVfYWN0aXZlX3RhYihTKHRhcmdldCkucGFyZW50KCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgUyh0aGlzLnNjb3BlKVxuICAgICAgICAub2ZmKCcudGFiJylcbiAgICAgICAgLy8gS2V5IGV2ZW50OiBmb2N1cy90YWIga2V5XG4gICAgICAgIC5vbigna2V5ZG93bi5mbmR0bi50YWInLCAnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10gPiAqID4gYScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICB2YXIgZWwgPSB0aGlzO1xuICAgICAgICAgIHZhciBrZXlDb2RlID0gZS5rZXlDb2RlIHx8IGUud2hpY2g7XG4gICAgICAgICAgICAvLyBpZiB1c2VyIHByZXNzZWQgdGFiIGtleVxuICAgICAgICAgICAgaWYgKGtleUNvZGUgPT0gOSkgeyBcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAvLyBUT0RPOiBDaGFuZ2UgdXN1YWxfdGFiX2JlaGF2aW9yIGludG8gYWNjZXNzaWJpbGl0eSBmdW5jdGlvbj9cbiAgICAgICAgICAgICAgdXN1YWxfdGFiX2JlaGF2aW9yKGUsIGVsKTtcbiAgICAgICAgICAgIH0gXG4gICAgICAgIH0pXG4gICAgICAgIC8vIENsaWNrIGV2ZW50OiB0YWIgdGl0bGVcbiAgICAgICAgLm9uKCdjbGljay5mbmR0bi50YWInLCAnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10gPiAqID4gYScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICB2YXIgZWwgPSB0aGlzO1xuICAgICAgICAgIHVzdWFsX3RhYl9iZWhhdmlvcihlLCBlbCk7XG4gICAgICAgIH0pXG4gICAgICAgIC8vIEhvdmVyIGV2ZW50OiB0YWIgdGl0bGVcbiAgICAgICAgLm9uKCdtb3VzZWVudGVyLmZuZHRuLnRhYicsICdbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnXSA+ICogPiBhJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICB2YXIgc2V0dGluZ3MgPSBTKHRoaXMpLmNsb3Nlc3QoJ1snICsgc2VsZi5hdHRyX25hbWUoKSArICddJykuZGF0YShzZWxmLmF0dHJfbmFtZSh0cnVlKSArICctaW5pdCcpO1xuICAgICAgICAgIGlmIChzZXR0aW5ncy5pc19ob3Zlcikge1xuICAgICAgICAgICAgc2VsZi50b2dnbGVfYWN0aXZlX3RhYihTKHRoaXMpLnBhcmVudCgpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAvLyBMb2NhdGlvbiBoYXNoIGNoYW5nZSBldmVudFxuICAgICAgUyh3aW5kb3cpLm9uKCdoYXNoY2hhbmdlLmZuZHRuLnRhYicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc2VsZi5oYW5kbGVfbG9jYXRpb25faGFzaF9jaGFuZ2UoKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBoYW5kbGVfbG9jYXRpb25faGFzaF9jaGFuZ2UgOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICBTID0gdGhpcy5TO1xuXG4gICAgICBTKCdbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnXScsIHRoaXMuc2NvcGUpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2V0dGluZ3MgPSBTKHRoaXMpLmRhdGEoc2VsZi5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKTtcbiAgICAgICAgaWYgKHNldHRpbmdzLmRlZXBfbGlua2luZykge1xuICAgICAgICAgIC8vIE1hdGNoIHRoZSBsb2NhdGlvbiBoYXNoIHRvIGEgbGFiZWxcbiAgICAgICAgICB2YXIgaGFzaDtcbiAgICAgICAgICBpZiAoc2V0dGluZ3Muc2Nyb2xsX3RvX2NvbnRlbnQpIHtcbiAgICAgICAgICAgIGhhc2ggPSBzZWxmLnNjb3BlLmxvY2F0aW9uLmhhc2g7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHByZWZpeCB0aGUgaGFzaCB0byBwcmV2ZW50IGFuY2hvciBzY3JvbGxpbmdcbiAgICAgICAgICAgIGhhc2ggPSBzZWxmLnNjb3BlLmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnZm5kdG4tJywgJycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaGFzaCAhPSAnJykge1xuICAgICAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgbG9jYXRpb24gaGFzaCByZWZlcmVuY2VzIGEgdGFiIGNvbnRlbnQgZGl2IG9yXG4gICAgICAgICAgICAvLyBhbm90aGVyIGVsZW1lbnQgb24gdGhlIHBhZ2UgKGluc2lkZSBvciBvdXRzaWRlIHRoZSB0YWIgY29udGVudCBkaXYpXG4gICAgICAgICAgICB2YXIgaGFzaF9lbGVtZW50ID0gUyhoYXNoKTtcbiAgICAgICAgICAgIGlmIChoYXNoX2VsZW1lbnQuaGFzQ2xhc3MoJ2NvbnRlbnQnKSAmJiBoYXNoX2VsZW1lbnQucGFyZW50KCkuaGFzQ2xhc3MoJ3RhYnMtY29udGVudCcpKSB7XG4gICAgICAgICAgICAgIC8vIFRhYiBjb250ZW50IGRpdlxuICAgICAgICAgICAgICBzZWxmLnRvZ2dsZV9hY3RpdmVfdGFiKCQoJ1snICsgc2VsZi5hdHRyX25hbWUoKSArICddID4gKiA+IGFbaHJlZj0nICsgaGFzaCArICddJykucGFyZW50KCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gTm90IHRoZSB0YWIgY29udGVudCBkaXYuIElmIGluc2lkZSB0aGUgdGFiIGNvbnRlbnQsIGZpbmQgdGhlXG4gICAgICAgICAgICAgIC8vIGNvbnRhaW5pbmcgdGFiIGFuZCB0b2dnbGUgaXQgYXMgYWN0aXZlLlxuICAgICAgICAgICAgICB2YXIgaGFzaF90YWJfY29udGFpbmVyX2lkID0gaGFzaF9lbGVtZW50LmNsb3Nlc3QoJy5jb250ZW50JykuYXR0cignaWQnKTtcbiAgICAgICAgICAgICAgaWYgKGhhc2hfdGFiX2NvbnRhaW5lcl9pZCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnRvZ2dsZV9hY3RpdmVfdGFiKCQoJ1snICsgc2VsZi5hdHRyX25hbWUoKSArICddID4gKiA+IGFbaHJlZj0jJyArIGhhc2hfdGFiX2NvbnRhaW5lcl9pZCArICddJykucGFyZW50KCksIGhhc2gpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFJlZmVyZW5jZSB0aGUgZGVmYXVsdCB0YWIgaGFzaGVzIHdoaWNoIHdlcmUgaW5pdGlhbGl6ZWQgaW4gdGhlIGluaXQgZnVuY3Rpb25cbiAgICAgICAgICAgIGZvciAodmFyIGluZCA9IDA7IGluZCA8IHNlbGYuZGVmYXVsdF90YWJfaGFzaGVzLmxlbmd0aDsgaW5kKyspIHtcbiAgICAgICAgICAgICAgc2VsZi50b2dnbGVfYWN0aXZlX3RhYigkKCdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnXSA+ICogPiBhW2hyZWY9JyArIHNlbGYuZGVmYXVsdF90YWJfaGFzaGVzW2luZF0gKyAnXScpLnBhcmVudCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICB9KTtcbiAgICAgfSxcblxuICAgIHRvZ2dsZV9hY3RpdmVfdGFiIDogZnVuY3Rpb24gKHRhYiwgbG9jYXRpb25faGFzaCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIFMgPSBzZWxmLlMsXG4gICAgICAgICAgdGFicyA9IHRhYi5jbG9zZXN0KCdbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnXScpLFxuICAgICAgICAgIHRhYl9saW5rID0gdGFiLmZpbmQoJ2EnKSxcbiAgICAgICAgICBhbmNob3IgPSB0YWIuY2hpbGRyZW4oJ2EnKS5maXJzdCgpLFxuICAgICAgICAgIHRhcmdldF9oYXNoID0gJyMnICsgYW5jaG9yLmF0dHIoJ2hyZWYnKS5zcGxpdCgnIycpWzFdLFxuICAgICAgICAgIHRhcmdldCA9IFModGFyZ2V0X2hhc2gpLFxuICAgICAgICAgIHNpYmxpbmdzID0gdGFiLnNpYmxpbmdzKCksXG4gICAgICAgICAgc2V0dGluZ3MgPSB0YWJzLmRhdGEodGhpcy5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKSxcbiAgICAgICAgICBpbnRlcnByZXRfa2V5dXBfYWN0aW9uID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIC8vIExpZ2h0IG1vZGlmaWNhdGlvbiBvZiBIZXlkb24gUGlja2VyaW5nJ3MgUHJhY3RpY2FsIEFSSUEgRXhhbXBsZXM6IGh0dHA6Ly9oZXlkb253b3Jrcy5jb20vcHJhY3RpY2FsX2FyaWFfZXhhbXBsZXMvanMvYTExeS5qc1xuXG4gICAgICAgICAgICAvLyBkZWZpbmUgY3VycmVudCwgcHJldmlvdXMgYW5kIG5leHQgKHBvc3NpYmxlKSB0YWJzXG5cbiAgICAgICAgICAgIHZhciAkb3JpZ2luYWwgPSAkKHRoaXMpO1xuICAgICAgICAgICAgdmFyICRwcmV2ID0gJCh0aGlzKS5wYXJlbnRzKCdsaScpLnByZXYoKS5jaGlsZHJlbignW3JvbGU9XCJ0YWJcIl0nKTtcbiAgICAgICAgICAgIHZhciAkbmV4dCA9ICQodGhpcykucGFyZW50cygnbGknKS5uZXh0KCkuY2hpbGRyZW4oJ1tyb2xlPVwidGFiXCJdJyk7XG4gICAgICAgICAgICB2YXIgJHRhcmdldDtcblxuICAgICAgICAgICAgLy8gZmluZCB0aGUgZGlyZWN0aW9uIChwcmV2IG9yIG5leHQpXG5cbiAgICAgICAgICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XG4gICAgICAgICAgICAgIGNhc2UgMzc6XG4gICAgICAgICAgICAgICAgJHRhcmdldCA9ICRwcmV2O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgICAgICAgICR0YXJnZXQgPSAkbmV4dDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAkdGFyZ2V0ID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJHRhcmdldC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgJG9yaWdpbmFsLmF0dHIoe1xuICAgICAgICAgICAgICAgICd0YWJpbmRleCcgOiAnLTEnLFxuICAgICAgICAgICAgICAgICdhcmlhLXNlbGVjdGVkJyA6IG51bGxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICR0YXJnZXQuYXR0cih7XG4gICAgICAgICAgICAgICAgJ3RhYmluZGV4JyA6ICcwJyxcbiAgICAgICAgICAgICAgICAnYXJpYS1zZWxlY3RlZCcgOiB0cnVlXG4gICAgICAgICAgICAgIH0pLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEhpZGUgcGFuZWxzXG5cbiAgICAgICAgICAgICQoJ1tyb2xlPVwidGFicGFuZWxcIl0nKVxuICAgICAgICAgICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuXG4gICAgICAgICAgICAvLyBTaG93IHBhbmVsIHdoaWNoIGNvcnJlc3BvbmRzIHRvIHRhcmdldFxuXG4gICAgICAgICAgICAkKCcjJyArICQoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkuYXR0cignaHJlZicpLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgbnVsbCk7XG5cbiAgICAgICAgICB9LFxuICAgICAgICAgIGdvX3RvX2hhc2ggPSBmdW5jdGlvbihoYXNoKSB7XG4gICAgICAgICAgICAvLyBUaGlzIGZ1bmN0aW9uIGFsbG93cyBjb3JyZWN0IGJlaGF2aW91ciBvZiB0aGUgYnJvd3NlcidzIGJhY2sgYnV0dG9uIHdoZW4gZGVlcCBsaW5raW5nIGlzIGVuYWJsZWQuIFdpdGhvdXQgaXRcbiAgICAgICAgICAgIC8vIHRoZSB1c2VyIHdvdWxkIGdldCBjb250aW51YWxseSByZWRpcmVjdGVkIHRvIHRoZSBkZWZhdWx0IGhhc2guXG4gICAgICAgICAgICB2YXIgaXNfZW50cnlfbG9jYXRpb24gPSB3aW5kb3cubG9jYXRpb24uaHJlZiA9PT0gc2VsZi5lbnRyeV9sb2NhdGlvbixcbiAgICAgICAgICAgICAgICBkZWZhdWx0X2hhc2ggPSBzZXR0aW5ncy5zY3JvbGxfdG9fY29udGVudCA/IHNlbGYuZGVmYXVsdF90YWJfaGFzaGVzWzBdIDogaXNfZW50cnlfbG9jYXRpb24gPyB3aW5kb3cubG9jYXRpb24uaGFzaCA6J2ZuZHRuLScgKyBzZWxmLmRlZmF1bHRfdGFiX2hhc2hlc1swXS5yZXBsYWNlKCcjJywgJycpXG5cbiAgICAgICAgICAgIGlmICghKGlzX2VudHJ5X2xvY2F0aW9uICYmIGhhc2ggPT09IGRlZmF1bHRfaGFzaCkpIHtcbiAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBoYXNoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG5cbiAgICAgIC8vIGFsbG93IHVzYWdlIG9mIGRhdGEtdGFiLWNvbnRlbnQgYXR0cmlidXRlIGluc3RlYWQgb2YgaHJlZlxuICAgICAgaWYgKGFuY2hvci5kYXRhKCd0YWItY29udGVudCcpKSB7XG4gICAgICAgIHRhcmdldF9oYXNoID0gJyMnICsgYW5jaG9yLmRhdGEoJ3RhYi1jb250ZW50Jykuc3BsaXQoJyMnKVsxXTtcbiAgICAgICAgdGFyZ2V0ID0gUyh0YXJnZXRfaGFzaCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzZXR0aW5ncy5kZWVwX2xpbmtpbmcpIHtcblxuICAgICAgICBpZiAoc2V0dGluZ3Muc2Nyb2xsX3RvX2NvbnRlbnQpIHtcblxuICAgICAgICAgIC8vIHJldGFpbiBjdXJyZW50IGhhc2ggdG8gc2Nyb2xsIHRvIGNvbnRlbnRcbiAgICAgICAgICBnb190b19oYXNoKGxvY2F0aW9uX2hhc2ggfHwgdGFyZ2V0X2hhc2gpO1xuXG4gICAgICAgICAgaWYgKGxvY2F0aW9uX2hhc2ggPT0gdW5kZWZpbmVkIHx8IGxvY2F0aW9uX2hhc2ggPT0gdGFyZ2V0X2hhc2gpIHtcbiAgICAgICAgICAgIHRhYi5wYXJlbnQoKVswXS5zY3JvbGxJbnRvVmlldygpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBTKHRhcmdldF9oYXNoKVswXS5zY3JvbGxJbnRvVmlldygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBwcmVmaXggdGhlIGhhc2hlcyBzbyB0aGF0IHRoZSBicm93c2VyIGRvZXNuJ3Qgc2Nyb2xsIGRvd25cbiAgICAgICAgICBpZiAobG9jYXRpb25faGFzaCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGdvX3RvX2hhc2goJ2ZuZHRuLScgKyBsb2NhdGlvbl9oYXNoLnJlcGxhY2UoJyMnLCAnJykpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnb190b19oYXNoKCdmbmR0bi0nICsgdGFyZ2V0X2hhc2gucmVwbGFjZSgnIycsICcnKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFdBUk5JTkc6IFRoZSBhY3RpdmF0aW9uIGFuZCBkZWFjdGl2YXRpb24gb2YgdGhlIHRhYiBjb250ZW50IG11c3RcbiAgICAgIC8vIG9jY3VyIGFmdGVyIHRoZSBkZWVwIGxpbmtpbmcgaW4gb3JkZXIgdG8gcHJvcGVybHkgcmVmcmVzaCB0aGUgYnJvd3NlclxuICAgICAgLy8gd2luZG93IChub3RhYmx5IGluIENocm9tZSkuXG4gICAgICAvLyBDbGVhbiB1cCBtdWx0aXBsZSBhdHRyIGluc3RhbmNlcyB0byBkb25lIG9uY2VcbiAgICAgIHRhYi5hZGRDbGFzcyhzZXR0aW5ncy5hY3RpdmVfY2xhc3MpLnRyaWdnZXJIYW5kbGVyKCdvcGVuZWQnKTtcbiAgICAgIHRhYl9saW5rLmF0dHIoeydhcmlhLXNlbGVjdGVkJyA6ICd0cnVlJywgIHRhYmluZGV4IDogMH0pO1xuICAgICAgc2libGluZ3MucmVtb3ZlQ2xhc3Moc2V0dGluZ3MuYWN0aXZlX2NsYXNzKVxuICAgICAgc2libGluZ3MuZmluZCgnYScpLmF0dHIoeydhcmlhLXNlbGVjdGVkJyA6ICdmYWxzZScsICB0YWJpbmRleCA6IC0xfSk7XG4gICAgICB0YXJnZXQuc2libGluZ3MoKS5yZW1vdmVDbGFzcyhzZXR0aW5ncy5hY3RpdmVfY2xhc3MpLmF0dHIoeydhcmlhLWhpZGRlbicgOiAndHJ1ZScsICB0YWJpbmRleCA6IC0xfSk7XG4gICAgICB0YXJnZXQuYWRkQ2xhc3Moc2V0dGluZ3MuYWN0aXZlX2NsYXNzKS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpLnJlbW92ZUF0dHIoJ3RhYmluZGV4Jyk7XG4gICAgICBzZXR0aW5ncy5jYWxsYmFjayh0YWIpO1xuICAgICAgdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCd0b2dnbGVkJywgW3RhYl0pO1xuICAgICAgdGFicy50cmlnZ2VySGFuZGxlcigndG9nZ2xlZCcsIFt0YXJnZXRdKTtcblxuICAgICAgdGFiX2xpbmsub2ZmKCdrZXlkb3duJykub24oJ2tleWRvd24nLCBpbnRlcnByZXRfa2V5dXBfYWN0aW9uICk7XG4gICAgfSxcblxuICAgIGRhdGFfYXR0ciA6IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgIGlmICh0aGlzLm5hbWVzcGFjZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWVzcGFjZSArICctJyArIHN0cjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9LFxuXG4gICAgb2ZmIDogZnVuY3Rpb24gKCkge30sXG5cbiAgICByZWZsb3cgOiBmdW5jdGlvbiAoKSB7fVxuICB9O1xufShqUXVlcnksIHdpbmRvdywgd2luZG93LmRvY3VtZW50KSk7XG4iLCI7KGZ1bmN0aW9uICgkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIEZvdW5kYXRpb24ubGlicy50b29sdGlwID0ge1xuICAgIG5hbWUgOiAndG9vbHRpcCcsXG5cbiAgICB2ZXJzaW9uIDogJzUuNS4xJyxcblxuICAgIHNldHRpbmdzIDoge1xuICAgICAgYWRkaXRpb25hbF9pbmhlcml0YWJsZV9jbGFzc2VzIDogW10sXG4gICAgICB0b29sdGlwX2NsYXNzIDogJy50b29sdGlwJyxcbiAgICAgIGFwcGVuZF90byA6ICdib2R5JyxcbiAgICAgIHRvdWNoX2Nsb3NlX3RleHQgOiAnVGFwIFRvIENsb3NlJyxcbiAgICAgIGRpc2FibGVfZm9yX3RvdWNoIDogZmFsc2UsXG4gICAgICBob3Zlcl9kZWxheSA6IDIwMCxcbiAgICAgIHNob3dfb24gOiAnYWxsJyxcbiAgICAgIHRpcF90ZW1wbGF0ZSA6IGZ1bmN0aW9uIChzZWxlY3RvciwgY29udGVudCkge1xuICAgICAgICByZXR1cm4gJzxzcGFuIGRhdGEtc2VsZWN0b3I9XCInICsgc2VsZWN0b3IgKyAnXCIgaWQ9XCInICsgc2VsZWN0b3IgKyAnXCIgY2xhc3M9XCInXG4gICAgICAgICAgKyBGb3VuZGF0aW9uLmxpYnMudG9vbHRpcC5zZXR0aW5ncy50b29sdGlwX2NsYXNzLnN1YnN0cmluZygxKVxuICAgICAgICAgICsgJ1wiIHJvbGU9XCJ0b29sdGlwXCI+JyArIGNvbnRlbnQgKyAnPHNwYW4gY2xhc3M9XCJudWJcIj48L3NwYW4+PC9zcGFuPic7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNhY2hlIDoge30sXG5cbiAgICBpbml0IDogZnVuY3Rpb24gKHNjb3BlLCBtZXRob2QsIG9wdGlvbnMpIHtcbiAgICAgIEZvdW5kYXRpb24uaW5oZXJpdCh0aGlzLCAncmFuZG9tX3N0cicpO1xuICAgICAgdGhpcy5iaW5kaW5ncyhtZXRob2QsIG9wdGlvbnMpO1xuICAgIH0sXG5cbiAgICBzaG91bGRfc2hvdyA6IGZ1bmN0aW9uICh0YXJnZXQsIHRpcCkge1xuICAgICAgdmFyIHNldHRpbmdzID0gJC5leHRlbmQoe30sIHRoaXMuc2V0dGluZ3MsIHRoaXMuZGF0YV9vcHRpb25zKHRhcmdldCkpO1xuXG4gICAgICBpZiAoc2V0dGluZ3Muc2hvd19vbiA9PT0gJ2FsbCcpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuc21hbGwoKSAmJiBzZXR0aW5ncy5zaG93X29uID09PSAnc21hbGwnKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm1lZGl1bSgpICYmIHNldHRpbmdzLnNob3dfb24gPT09ICdtZWRpdW0nKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmxhcmdlKCkgJiYgc2V0dGluZ3Muc2hvd19vbiA9PT0gJ2xhcmdlJykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgbWVkaXVtIDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG1hdGNoTWVkaWEoRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzWydtZWRpdW0nXSkubWF0Y2hlcztcbiAgICB9LFxuXG4gICAgbGFyZ2UgOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbWF0Y2hNZWRpYShGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXNbJ2xhcmdlJ10pLm1hdGNoZXM7XG4gICAgfSxcblxuICAgIGV2ZW50cyA6IGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIFMgPSBzZWxmLlM7XG5cbiAgICAgIHNlbGYuY3JlYXRlKHRoaXMuUyhpbnN0YW5jZSkpO1xuXG4gICAgICBmdW5jdGlvbiBfc3RhcnRTaG93KGVsdCwgJHRoaXMsIGltbWVkaWF0ZSkge1xuICAgICAgICBpZiAoZWx0LnRpbWVyKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGltbWVkaWF0ZSkge1xuICAgICAgICAgIGVsdC50aW1lciA9IG51bGw7XG4gICAgICAgICAgc2VsZi5zaG93VGlwKCR0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbHQudGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGVsdC50aW1lciA9IG51bGw7XG4gICAgICAgICAgICBzZWxmLnNob3dUaXAoJHRoaXMpO1xuICAgICAgICAgIH0uYmluZChlbHQpLCBzZWxmLnNldHRpbmdzLmhvdmVyX2RlbGF5KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBfc3RhcnRIaWRlKGVsdCwgJHRoaXMpIHtcbiAgICAgICAgaWYgKGVsdC50aW1lcikge1xuICAgICAgICAgIGNsZWFyVGltZW91dChlbHQudGltZXIpO1xuICAgICAgICAgIGVsdC50aW1lciA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLmhpZGUoJHRoaXMpO1xuICAgICAgfVxuXG4gICAgICAkKHRoaXMuc2NvcGUpXG4gICAgICAgIC5vZmYoJy50b29sdGlwJylcbiAgICAgICAgLm9uKCdtb3VzZWVudGVyLmZuZHRuLnRvb2x0aXAgbW91c2VsZWF2ZS5mbmR0bi50b29sdGlwIHRvdWNoc3RhcnQuZm5kdG4udG9vbHRpcCBNU1BvaW50ZXJEb3duLmZuZHRuLnRvb2x0aXAnLFxuICAgICAgICAgICdbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgdmFyICR0aGlzID0gUyh0aGlzKSxcbiAgICAgICAgICAgICAgc2V0dGluZ3MgPSAkLmV4dGVuZCh7fSwgc2VsZi5zZXR0aW5ncywgc2VsZi5kYXRhX29wdGlvbnMoJHRoaXMpKSxcbiAgICAgICAgICAgICAgaXNfdG91Y2ggPSBmYWxzZTtcblxuICAgICAgICAgIGlmIChNb2Rlcm5penIudG91Y2ggJiYgL3RvdWNoc3RhcnR8TVNQb2ludGVyRG93bi9pLnRlc3QoZS50eXBlKSAmJiBTKGUudGFyZ2V0KS5pcygnYScpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKC9tb3VzZS9pLnRlc3QoZS50eXBlKSAmJiBzZWxmLmllX3RvdWNoKGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIGlmICgkdGhpcy5oYXNDbGFzcygnb3BlbicpKSB7XG4gICAgICAgICAgICBpZiAoTW9kZXJuaXpyLnRvdWNoICYmIC90b3VjaHN0YXJ0fE1TUG9pbnRlckRvd24vaS50ZXN0KGUudHlwZSkpIHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5oaWRlKCR0aGlzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHNldHRpbmdzLmRpc2FibGVfZm9yX3RvdWNoICYmIE1vZGVybml6ci50b3VjaCAmJiAvdG91Y2hzdGFydHxNU1BvaW50ZXJEb3duL2kudGVzdChlLnR5cGUpKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXNldHRpbmdzLmRpc2FibGVfZm9yX3RvdWNoICYmIE1vZGVybml6ci50b3VjaCAmJiAvdG91Y2hzdGFydHxNU1BvaW50ZXJEb3duL2kudGVzdChlLnR5cGUpKSB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgUyhzZXR0aW5ncy50b29sdGlwX2NsYXNzICsgJy5vcGVuJykuaGlkZSgpO1xuICAgICAgICAgICAgICBpc190b3VjaCA9IHRydWU7XG4gICAgICAgICAgICAgIC8vIGNsb3NlIG90aGVyIG9wZW4gdG9vbHRpcHMgb24gdG91Y2hcbiAgICAgICAgICAgICAgaWYgKCQoJy5vcGVuWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJ10nKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICB2YXIgcHJldk9wZW4gPSBTKCQoJy5vcGVuWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJ10nKVswXSk7XG4gICAgICAgICAgICAgICBzZWxmLmhpZGUocHJldk9wZW4pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgvZW50ZXJ8b3Zlci9pLnRlc3QoZS50eXBlKSkge1xuICAgICAgICAgICAgICBfc3RhcnRTaG93KHRoaXMsICR0aGlzKTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChlLnR5cGUgPT09ICdtb3VzZW91dCcgfHwgZS50eXBlID09PSAnbW91c2VsZWF2ZScpIHtcbiAgICAgICAgICAgICAgX3N0YXJ0SGlkZSh0aGlzLCAkdGhpcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBfc3RhcnRTaG93KHRoaXMsICR0aGlzLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignbW91c2VsZWF2ZS5mbmR0bi50b29sdGlwIHRvdWNoc3RhcnQuZm5kdG4udG9vbHRpcCBNU1BvaW50ZXJEb3duLmZuZHRuLnRvb2x0aXAnLCAnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10ub3BlbicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgaWYgKC9tb3VzZS9pLnRlc3QoZS50eXBlKSAmJiBzZWxmLmllX3RvdWNoKGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCQodGhpcykuZGF0YSgndG9vbHRpcC1vcGVuLWV2ZW50LXR5cGUnKSA9PSAndG91Y2gnICYmIGUudHlwZSA9PSAnbW91c2VsZWF2ZScpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9IGVsc2UgaWYgKCQodGhpcykuZGF0YSgndG9vbHRpcC1vcGVuLWV2ZW50LXR5cGUnKSA9PSAnbW91c2UnICYmIC9NU1BvaW50ZXJEb3dufHRvdWNoc3RhcnQvaS50ZXN0KGUudHlwZSkpIHtcbiAgICAgICAgICAgIHNlbGYuY29udmVydF90b190b3VjaCgkKHRoaXMpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3N0YXJ0SGlkZSh0aGlzLCAkKHRoaXMpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignRE9NTm9kZVJlbW92ZWQgRE9NQXR0ck1vZGlmaWVkJywgJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddOm5vdChhKScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgX3N0YXJ0SGlkZSh0aGlzLCBTKHRoaXMpKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGllX3RvdWNoIDogZnVuY3Rpb24gKGUpIHtcbiAgICAgIC8vIEhvdyBkbyBJIGRpc3Rpbmd1aXNoIGJldHdlZW4gSUUxMSBhbmQgV2luZG93cyBQaG9uZSA4Pz8/Pz9cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgc2hvd1RpcCA6IGZ1bmN0aW9uICgkdGFyZ2V0KSB7XG4gICAgICB2YXIgJHRpcCA9IHRoaXMuZ2V0VGlwKCR0YXJnZXQpO1xuICAgICAgaWYgKHRoaXMuc2hvdWxkX3Nob3coJHRhcmdldCwgJHRpcCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hvdygkdGFyZ2V0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9LFxuXG4gICAgZ2V0VGlwIDogZnVuY3Rpb24gKCR0YXJnZXQpIHtcbiAgICAgIHZhciBzZWxlY3RvciA9IHRoaXMuc2VsZWN0b3IoJHRhcmdldCksXG4gICAgICAgICAgc2V0dGluZ3MgPSAkLmV4dGVuZCh7fSwgdGhpcy5zZXR0aW5ncywgdGhpcy5kYXRhX29wdGlvbnMoJHRhcmdldCkpLFxuICAgICAgICAgIHRpcCA9IG51bGw7XG5cbiAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICB0aXAgPSB0aGlzLlMoJ3NwYW5bZGF0YS1zZWxlY3Rvcj1cIicgKyBzZWxlY3RvciArICdcIl0nICsgc2V0dGluZ3MudG9vbHRpcF9jbGFzcyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAodHlwZW9mIHRpcCA9PT0gJ29iamVjdCcpID8gdGlwIDogZmFsc2U7XG4gICAgfSxcblxuICAgIHNlbGVjdG9yIDogZnVuY3Rpb24gKCR0YXJnZXQpIHtcbiAgICAgIHZhciBkYXRhU2VsZWN0b3IgPSAkdGFyZ2V0LmF0dHIodGhpcy5hdHRyX25hbWUoKSkgfHwgJHRhcmdldC5hdHRyKCdkYXRhLXNlbGVjdG9yJyk7XG5cbiAgICAgIGlmICh0eXBlb2YgZGF0YVNlbGVjdG9yICE9ICdzdHJpbmcnKSB7XG4gICAgICAgIGRhdGFTZWxlY3RvciA9IHRoaXMucmFuZG9tX3N0cig2KTtcbiAgICAgICAgJHRhcmdldFxuICAgICAgICAgIC5hdHRyKCdkYXRhLXNlbGVjdG9yJywgZGF0YVNlbGVjdG9yKVxuICAgICAgICAgIC5hdHRyKCdhcmlhLWRlc2NyaWJlZGJ5JywgZGF0YVNlbGVjdG9yKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRhdGFTZWxlY3RvcjtcbiAgICB9LFxuXG4gICAgY3JlYXRlIDogZnVuY3Rpb24gKCR0YXJnZXQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICBzZXR0aW5ncyA9ICQuZXh0ZW5kKHt9LCB0aGlzLnNldHRpbmdzLCB0aGlzLmRhdGFfb3B0aW9ucygkdGFyZ2V0KSksXG4gICAgICAgICAgdGlwX3RlbXBsYXRlID0gdGhpcy5zZXR0aW5ncy50aXBfdGVtcGxhdGU7XG5cbiAgICAgIGlmICh0eXBlb2Ygc2V0dGluZ3MudGlwX3RlbXBsYXRlID09PSAnc3RyaW5nJyAmJiB3aW5kb3cuaGFzT3duUHJvcGVydHkoc2V0dGluZ3MudGlwX3RlbXBsYXRlKSkge1xuICAgICAgICB0aXBfdGVtcGxhdGUgPSB3aW5kb3dbc2V0dGluZ3MudGlwX3RlbXBsYXRlXTtcbiAgICAgIH1cblxuICAgICAgdmFyICR0aXAgPSAkKHRpcF90ZW1wbGF0ZSh0aGlzLnNlbGVjdG9yKCR0YXJnZXQpLCAkKCc8ZGl2PjwvZGl2PicpLmh0bWwoJHRhcmdldC5hdHRyKCd0aXRsZScpKS5odG1sKCkpKSxcbiAgICAgICAgICBjbGFzc2VzID0gdGhpcy5pbmhlcml0YWJsZV9jbGFzc2VzKCR0YXJnZXQpO1xuXG4gICAgICAkdGlwLmFkZENsYXNzKGNsYXNzZXMpLmFwcGVuZFRvKHNldHRpbmdzLmFwcGVuZF90byk7XG5cbiAgICAgIGlmIChNb2Rlcm5penIudG91Y2gpIHtcbiAgICAgICAgJHRpcC5hcHBlbmQoJzxzcGFuIGNsYXNzPVwidGFwLXRvLWNsb3NlXCI+JyArIHNldHRpbmdzLnRvdWNoX2Nsb3NlX3RleHQgKyAnPC9zcGFuPicpO1xuICAgICAgICAkdGlwLm9uKCd0b3VjaHN0YXJ0LmZuZHRuLnRvb2x0aXAgTVNQb2ludGVyRG93bi5mbmR0bi50b29sdGlwJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBzZWxmLmhpZGUoJHRhcmdldCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAkdGFyZ2V0LnJlbW92ZUF0dHIoJ3RpdGxlJykuYXR0cigndGl0bGUnLCAnJyk7XG4gICAgfSxcblxuICAgIHJlcG9zaXRpb24gOiBmdW5jdGlvbiAodGFyZ2V0LCB0aXAsIGNsYXNzZXMpIHtcbiAgICAgIHZhciB3aWR0aCwgbnViLCBudWJIZWlnaHQsIG51YldpZHRoLCBjb2x1bW4sIG9ialBvcztcblxuICAgICAgdGlwLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKS5zaG93KCk7XG5cbiAgICAgIHdpZHRoID0gdGFyZ2V0LmRhdGEoJ3dpZHRoJyk7XG4gICAgICBudWIgPSB0aXAuY2hpbGRyZW4oJy5udWInKTtcbiAgICAgIG51YkhlaWdodCA9IG51Yi5vdXRlckhlaWdodCgpO1xuICAgICAgbnViV2lkdGggPSBudWIub3V0ZXJIZWlnaHQoKTtcblxuICAgICAgaWYgKHRoaXMuc21hbGwoKSkge1xuICAgICAgICB0aXAuY3NzKHsnd2lkdGgnIDogJzEwMCUnfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aXAuY3NzKHsnd2lkdGgnIDogKHdpZHRoKSA/IHdpZHRoIDogJ2F1dG8nfSk7XG4gICAgICB9XG5cbiAgICAgIG9ialBvcyA9IGZ1bmN0aW9uIChvYmosIHRvcCwgcmlnaHQsIGJvdHRvbSwgbGVmdCwgd2lkdGgpIHtcbiAgICAgICAgcmV0dXJuIG9iai5jc3Moe1xuICAgICAgICAgICd0b3AnIDogKHRvcCkgPyB0b3AgOiAnYXV0bycsXG4gICAgICAgICAgJ2JvdHRvbScgOiAoYm90dG9tKSA/IGJvdHRvbSA6ICdhdXRvJyxcbiAgICAgICAgICAnbGVmdCcgOiAobGVmdCkgPyBsZWZ0IDogJ2F1dG8nLFxuICAgICAgICAgICdyaWdodCcgOiAocmlnaHQpID8gcmlnaHQgOiAnYXV0bydcbiAgICAgICAgfSkuZW5kKCk7XG4gICAgICB9O1xuXG4gICAgICBvYmpQb3ModGlwLCAodGFyZ2V0Lm9mZnNldCgpLnRvcCArIHRhcmdldC5vdXRlckhlaWdodCgpICsgMTApLCAnYXV0bycsICdhdXRvJywgdGFyZ2V0Lm9mZnNldCgpLmxlZnQpO1xuXG4gICAgICBpZiAodGhpcy5zbWFsbCgpKSB7XG4gICAgICAgIG9ialBvcyh0aXAsICh0YXJnZXQub2Zmc2V0KCkudG9wICsgdGFyZ2V0Lm91dGVySGVpZ2h0KCkgKyAxMCksICdhdXRvJywgJ2F1dG8nLCAxMi41LCAkKHRoaXMuc2NvcGUpLndpZHRoKCkpO1xuICAgICAgICB0aXAuYWRkQ2xhc3MoJ3RpcC1vdmVycmlkZScpO1xuICAgICAgICBvYmpQb3MobnViLCAtbnViSGVpZ2h0LCAnYXV0bycsICdhdXRvJywgdGFyZ2V0Lm9mZnNldCgpLmxlZnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGxlZnQgPSB0YXJnZXQub2Zmc2V0KCkubGVmdDtcbiAgICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKSB7XG4gICAgICAgICAgbnViLmFkZENsYXNzKCdydGwnKTtcbiAgICAgICAgICBsZWZ0ID0gdGFyZ2V0Lm9mZnNldCgpLmxlZnQgKyB0YXJnZXQub3V0ZXJXaWR0aCgpIC0gdGlwLm91dGVyV2lkdGgoKTtcbiAgICAgICAgfVxuICAgICAgICBvYmpQb3ModGlwLCAodGFyZ2V0Lm9mZnNldCgpLnRvcCArIHRhcmdldC5vdXRlckhlaWdodCgpICsgMTApLCAnYXV0bycsICdhdXRvJywgbGVmdCk7XG4gICAgICAgIHRpcC5yZW1vdmVDbGFzcygndGlwLW92ZXJyaWRlJyk7XG4gICAgICAgIGlmIChjbGFzc2VzICYmIGNsYXNzZXMuaW5kZXhPZigndGlwLXRvcCcpID4gLTEpIHtcbiAgICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwpIHtcbiAgICAgICAgICAgIG51Yi5hZGRDbGFzcygncnRsJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG9ialBvcyh0aXAsICh0YXJnZXQub2Zmc2V0KCkudG9wIC0gdGlwLm91dGVySGVpZ2h0KCkpLCAnYXV0bycsICdhdXRvJywgbGVmdClcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcygndGlwLW92ZXJyaWRlJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoY2xhc3NlcyAmJiBjbGFzc2VzLmluZGV4T2YoJ3RpcC1sZWZ0JykgPiAtMSkge1xuICAgICAgICAgIG9ialBvcyh0aXAsICh0YXJnZXQub2Zmc2V0KCkudG9wICsgKHRhcmdldC5vdXRlckhlaWdodCgpIC8gMikgLSAodGlwLm91dGVySGVpZ2h0KCkgLyAyKSksICdhdXRvJywgJ2F1dG8nLCAodGFyZ2V0Lm9mZnNldCgpLmxlZnQgLSB0aXAub3V0ZXJXaWR0aCgpIC0gbnViSGVpZ2h0KSlcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcygndGlwLW92ZXJyaWRlJyk7XG4gICAgICAgICAgbnViLnJlbW92ZUNsYXNzKCdydGwnKTtcbiAgICAgICAgfSBlbHNlIGlmIChjbGFzc2VzICYmIGNsYXNzZXMuaW5kZXhPZigndGlwLXJpZ2h0JykgPiAtMSkge1xuICAgICAgICAgIG9ialBvcyh0aXAsICh0YXJnZXQub2Zmc2V0KCkudG9wICsgKHRhcmdldC5vdXRlckhlaWdodCgpIC8gMikgLSAodGlwLm91dGVySGVpZ2h0KCkgLyAyKSksICdhdXRvJywgJ2F1dG8nLCAodGFyZ2V0Lm9mZnNldCgpLmxlZnQgKyB0YXJnZXQub3V0ZXJXaWR0aCgpICsgbnViSGVpZ2h0KSlcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcygndGlwLW92ZXJyaWRlJyk7XG4gICAgICAgICAgbnViLnJlbW92ZUNsYXNzKCdydGwnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aXAuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKS5oaWRlKCk7XG4gICAgfSxcblxuICAgIHNtYWxsIDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG1hdGNoTWVkaWEoRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzLnNtYWxsKS5tYXRjaGVzICYmXG4gICAgICAgICFtYXRjaE1lZGlhKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllcy5tZWRpdW0pLm1hdGNoZXM7XG4gICAgfSxcblxuICAgIGluaGVyaXRhYmxlX2NsYXNzZXMgOiBmdW5jdGlvbiAoJHRhcmdldCkge1xuICAgICAgdmFyIHNldHRpbmdzID0gJC5leHRlbmQoe30sIHRoaXMuc2V0dGluZ3MsIHRoaXMuZGF0YV9vcHRpb25zKCR0YXJnZXQpKSxcbiAgICAgICAgICBpbmhlcml0YWJsZXMgPSBbJ3RpcC10b3AnLCAndGlwLWxlZnQnLCAndGlwLWJvdHRvbScsICd0aXAtcmlnaHQnLCAncmFkaXVzJywgJ3JvdW5kJ10uY29uY2F0KHNldHRpbmdzLmFkZGl0aW9uYWxfaW5oZXJpdGFibGVfY2xhc3NlcyksXG4gICAgICAgICAgY2xhc3NlcyA9ICR0YXJnZXQuYXR0cignY2xhc3MnKSxcbiAgICAgICAgICBmaWx0ZXJlZCA9IGNsYXNzZXMgPyAkLm1hcChjbGFzc2VzLnNwbGl0KCcgJyksIGZ1bmN0aW9uIChlbCwgaSkge1xuICAgICAgICAgICAgaWYgKCQuaW5BcnJheShlbCwgaW5oZXJpdGFibGVzKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pLmpvaW4oJyAnKSA6ICcnO1xuXG4gICAgICByZXR1cm4gJC50cmltKGZpbHRlcmVkKTtcbiAgICB9LFxuXG4gICAgY29udmVydF90b190b3VjaCA6IGZ1bmN0aW9uICgkdGFyZ2V0KSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgJHRpcCA9IHNlbGYuZ2V0VGlwKCR0YXJnZXQpLFxuICAgICAgICAgIHNldHRpbmdzID0gJC5leHRlbmQoe30sIHNlbGYuc2V0dGluZ3MsIHNlbGYuZGF0YV9vcHRpb25zKCR0YXJnZXQpKTtcblxuICAgICAgaWYgKCR0aXAuZmluZCgnLnRhcC10by1jbG9zZScpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAkdGlwLmFwcGVuZCgnPHNwYW4gY2xhc3M9XCJ0YXAtdG8tY2xvc2VcIj4nICsgc2V0dGluZ3MudG91Y2hfY2xvc2VfdGV4dCArICc8L3NwYW4+Jyk7XG4gICAgICAgICR0aXAub24oJ2NsaWNrLmZuZHRuLnRvb2x0aXAudGFwY2xvc2UgdG91Y2hzdGFydC5mbmR0bi50b29sdGlwLnRhcGNsb3NlIE1TUG9pbnRlckRvd24uZm5kdG4udG9vbHRpcC50YXBjbG9zZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgc2VsZi5oaWRlKCR0YXJnZXQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgJHRhcmdldC5kYXRhKCd0b29sdGlwLW9wZW4tZXZlbnQtdHlwZScsICd0b3VjaCcpO1xuICAgIH0sXG5cbiAgICBzaG93IDogZnVuY3Rpb24gKCR0YXJnZXQpIHtcbiAgICAgIHZhciAkdGlwID0gdGhpcy5nZXRUaXAoJHRhcmdldCk7XG5cbiAgICAgIGlmICgkdGFyZ2V0LmRhdGEoJ3Rvb2x0aXAtb3Blbi1ldmVudC10eXBlJykgPT0gJ3RvdWNoJykge1xuICAgICAgICB0aGlzLmNvbnZlcnRfdG9fdG91Y2goJHRhcmdldCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVwb3NpdGlvbigkdGFyZ2V0LCAkdGlwLCAkdGFyZ2V0LmF0dHIoJ2NsYXNzJykpO1xuICAgICAgJHRhcmdldC5hZGRDbGFzcygnb3BlbicpO1xuICAgICAgJHRpcC5mYWRlSW4oMTUwKTtcbiAgICB9LFxuXG4gICAgaGlkZSA6IGZ1bmN0aW9uICgkdGFyZ2V0KSB7XG4gICAgICB2YXIgJHRpcCA9IHRoaXMuZ2V0VGlwKCR0YXJnZXQpO1xuICAgICAgJHRpcC5mYWRlT3V0KDE1MCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAkdGlwLmZpbmQoJy50YXAtdG8tY2xvc2UnKS5yZW1vdmUoKTtcbiAgICAgICAgJHRpcC5vZmYoJ2NsaWNrLmZuZHRuLnRvb2x0aXAudGFwY2xvc2UgTVNQb2ludGVyRG93bi5mbmR0bi50YXBjbG9zZScpO1xuICAgICAgICAkdGFyZ2V0LnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgb2ZmIDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdGhpcy5TKHRoaXMuc2NvcGUpLm9mZignLmZuZHRuLnRvb2x0aXAnKTtcbiAgICAgIHRoaXMuUyh0aGlzLnNldHRpbmdzLnRvb2x0aXBfY2xhc3MpLmVhY2goZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgJCgnWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJ10nKS5lcShpKS5hdHRyKCd0aXRsZScsICQodGhpcykudGV4dCgpKTtcbiAgICAgIH0pLnJlbW92ZSgpO1xuICAgIH0sXG5cbiAgICByZWZsb3cgOiBmdW5jdGlvbiAoKSB7fVxuICB9O1xufShqUXVlcnksIHdpbmRvdywgd2luZG93LmRvY3VtZW50KSk7XG4iLCI7KGZ1bmN0aW9uICgkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIEZvdW5kYXRpb24ubGlicy50b3BiYXIgPSB7XG4gICAgbmFtZSA6ICd0b3BiYXInLFxuXG4gICAgdmVyc2lvbiA6ICc1LjUuMScsXG5cbiAgICBzZXR0aW5ncyA6IHtcbiAgICAgIGluZGV4IDogMCxcbiAgICAgIHN0YXJ0X29mZnNldCA6IDAsXG4gICAgICBzdGlja3lfY2xhc3MgOiAnc3RpY2t5JyxcbiAgICAgIGN1c3RvbV9iYWNrX3RleHQgOiB0cnVlLFxuICAgICAgYmFja190ZXh0IDogJ0JhY2snLFxuICAgICAgbW9iaWxlX3Nob3dfcGFyZW50X2xpbmsgOiB0cnVlLFxuICAgICAgaXNfaG92ZXIgOiB0cnVlLFxuICAgICAgc2Nyb2xsdG9wIDogdHJ1ZSwgLy8ganVtcCB0byB0b3Agd2hlbiBzdGlja3kgbmF2IG1lbnUgdG9nZ2xlIGlzIGNsaWNrZWRcbiAgICAgIHN0aWNreV9vbiA6ICdhbGwnLFxuICAgICAgZHJvcGRvd25fYXV0b2Nsb3NlOiB0cnVlXG4gICAgfSxcblxuICAgIGluaXQgOiBmdW5jdGlvbiAoc2VjdGlvbiwgbWV0aG9kLCBvcHRpb25zKSB7XG4gICAgICBGb3VuZGF0aW9uLmluaGVyaXQodGhpcywgJ2FkZF9jdXN0b21fcnVsZSByZWdpc3Rlcl9tZWRpYSB0aHJvdHRsZScpO1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBzZWxmLnJlZ2lzdGVyX21lZGlhKCd0b3BiYXInLCAnZm91bmRhdGlvbi1tcS10b3BiYXInKTtcblxuICAgICAgdGhpcy5iaW5kaW5ncyhtZXRob2QsIG9wdGlvbnMpO1xuXG4gICAgICBzZWxmLlMoJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddJywgdGhpcy5zY29wZSkuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB0b3BiYXIgPSAkKHRoaXMpLFxuICAgICAgICAgICAgc2V0dGluZ3MgPSB0b3BiYXIuZGF0YShzZWxmLmF0dHJfbmFtZSh0cnVlKSArICctaW5pdCcpLFxuICAgICAgICAgICAgc2VjdGlvbiA9IHNlbGYuUygnc2VjdGlvbiwgLnRvcC1iYXItc2VjdGlvbicsIHRoaXMpO1xuICAgICAgICB0b3BiYXIuZGF0YSgnaW5kZXgnLCAwKTtcbiAgICAgICAgdmFyIHRvcGJhckNvbnRhaW5lciA9IHRvcGJhci5wYXJlbnQoKTtcbiAgICAgICAgaWYgKHRvcGJhckNvbnRhaW5lci5oYXNDbGFzcygnZml4ZWQnKSB8fCBzZWxmLmlzX3N0aWNreSh0b3BiYXIsIHRvcGJhckNvbnRhaW5lciwgc2V0dGluZ3MpICkge1xuICAgICAgICAgIHNlbGYuc2V0dGluZ3Muc3RpY2t5X2NsYXNzID0gc2V0dGluZ3Muc3RpY2t5X2NsYXNzO1xuICAgICAgICAgIHNlbGYuc2V0dGluZ3Muc3RpY2t5X3RvcGJhciA9IHRvcGJhcjtcbiAgICAgICAgICB0b3BiYXIuZGF0YSgnaGVpZ2h0JywgdG9wYmFyQ29udGFpbmVyLm91dGVySGVpZ2h0KCkpO1xuICAgICAgICAgIHRvcGJhci5kYXRhKCdzdGlja3lvZmZzZXQnLCB0b3BiYXJDb250YWluZXIub2Zmc2V0KCkudG9wKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b3BiYXIuZGF0YSgnaGVpZ2h0JywgdG9wYmFyLm91dGVySGVpZ2h0KCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzZXR0aW5ncy5hc3NlbWJsZWQpIHtcbiAgICAgICAgICBzZWxmLmFzc2VtYmxlKHRvcGJhcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2V0dGluZ3MuaXNfaG92ZXIpIHtcbiAgICAgICAgICBzZWxmLlMoJy5oYXMtZHJvcGRvd24nLCB0b3BiYXIpLmFkZENsYXNzKCdub3QtY2xpY2snKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLlMoJy5oYXMtZHJvcGRvd24nLCB0b3BiYXIpLnJlbW92ZUNsYXNzKCdub3QtY2xpY2snKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFBhZCBib2R5IHdoZW4gc3RpY2t5IChzY3JvbGxlZCkgb3IgZml4ZWQuXG4gICAgICAgIHNlbGYuYWRkX2N1c3RvbV9ydWxlKCcuZi10b3BiYXItZml4ZWQgeyBwYWRkaW5nLXRvcDogJyArIHRvcGJhci5kYXRhKCdoZWlnaHQnKSArICdweCB9Jyk7XG5cbiAgICAgICAgaWYgKHRvcGJhckNvbnRhaW5lci5oYXNDbGFzcygnZml4ZWQnKSkge1xuICAgICAgICAgIHNlbGYuUygnYm9keScpLmFkZENsYXNzKCdmLXRvcGJhci1maXhlZCcpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIH0sXG5cbiAgICBpc19zdGlja3kgOiBmdW5jdGlvbiAodG9wYmFyLCB0b3BiYXJDb250YWluZXIsIHNldHRpbmdzKSB7XG4gICAgICB2YXIgc3RpY2t5ICAgICA9IHRvcGJhckNvbnRhaW5lci5oYXNDbGFzcyhzZXR0aW5ncy5zdGlja3lfY2xhc3MpO1xuICAgICAgdmFyIHNtYWxsTWF0Y2ggPSBtYXRjaE1lZGlhKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllcy5zbWFsbCkubWF0Y2hlcztcbiAgICAgIHZhciBtZWRNYXRjaCAgID0gbWF0Y2hNZWRpYShGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXMubWVkaXVtKS5tYXRjaGVzO1xuICAgICAgdmFyIGxyZ01hdGNoICAgPSBtYXRjaE1lZGlhKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllcy5sYXJnZSkubWF0Y2hlcztcblxuICAgICAgaWYgKHN0aWNreSAmJiBzZXR0aW5ncy5zdGlja3lfb24gPT09ICdhbGwnKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHN0aWNreSAmJiB0aGlzLnNtYWxsKCkgJiYgc2V0dGluZ3Muc3RpY2t5X29uLmluZGV4T2YoJ3NtYWxsJykgIT09IC0xKSB7XG4gICAgICAgIGlmIChzbWFsbE1hdGNoICYmICFtZWRNYXRjaCAmJiAhbHJnTWF0Y2gpIHsgcmV0dXJuIHRydWU7IH1cbiAgICAgIH1cbiAgICAgIGlmIChzdGlja3kgJiYgdGhpcy5tZWRpdW0oKSAmJiBzZXR0aW5ncy5zdGlja3lfb24uaW5kZXhPZignbWVkaXVtJykgIT09IC0xKSB7XG4gICAgICAgIGlmIChzbWFsbE1hdGNoICYmIG1lZE1hdGNoICYmICFscmdNYXRjaCkgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgfVxuICAgICAgaWYgKHN0aWNreSAmJiB0aGlzLmxhcmdlKCkgJiYgc2V0dGluZ3Muc3RpY2t5X29uLmluZGV4T2YoJ2xhcmdlJykgIT09IC0xKSB7XG4gICAgICAgIGlmIChzbWFsbE1hdGNoICYmIG1lZE1hdGNoICYmIGxyZ01hdGNoKSB7IHJldHVybiB0cnVlOyB9XG4gICAgICB9XG5cbiAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIHRvZ2dsZSA6IGZ1bmN0aW9uICh0b2dnbGVFbCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIHRvcGJhcjtcblxuICAgICAgaWYgKHRvZ2dsZUVsKSB7XG4gICAgICAgIHRvcGJhciA9IHNlbGYuUyh0b2dnbGVFbCkuY2xvc2VzdCgnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRvcGJhciA9IHNlbGYuUygnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10nKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHNldHRpbmdzID0gdG9wYmFyLmRhdGEodGhpcy5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKTtcblxuICAgICAgdmFyIHNlY3Rpb24gPSBzZWxmLlMoJ3NlY3Rpb24sIC50b3AtYmFyLXNlY3Rpb24nLCB0b3BiYXIpO1xuXG4gICAgICBpZiAoc2VsZi5icmVha3BvaW50KCkpIHtcbiAgICAgICAgaWYgKCFzZWxmLnJ0bCkge1xuICAgICAgICAgIHNlY3Rpb24uY3NzKHtsZWZ0IDogJzAlJ30pO1xuICAgICAgICAgICQoJz4ubmFtZScsIHNlY3Rpb24pLmNzcyh7bGVmdCA6ICcxMDAlJ30pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlY3Rpb24uY3NzKHtyaWdodCA6ICcwJSd9KTtcbiAgICAgICAgICAkKCc+Lm5hbWUnLCBzZWN0aW9uKS5jc3Moe3JpZ2h0IDogJzEwMCUnfSk7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLlMoJ2xpLm1vdmVkJywgc2VjdGlvbikucmVtb3ZlQ2xhc3MoJ21vdmVkJyk7XG4gICAgICAgIHRvcGJhci5kYXRhKCdpbmRleCcsIDApO1xuXG4gICAgICAgIHRvcGJhclxuICAgICAgICAgIC50b2dnbGVDbGFzcygnZXhwYW5kZWQnKVxuICAgICAgICAgIC5jc3MoJ2hlaWdodCcsICcnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNldHRpbmdzLnNjcm9sbHRvcCkge1xuICAgICAgICBpZiAoIXRvcGJhci5oYXNDbGFzcygnZXhwYW5kZWQnKSkge1xuICAgICAgICAgIGlmICh0b3BiYXIuaGFzQ2xhc3MoJ2ZpeGVkJykpIHtcbiAgICAgICAgICAgIHRvcGJhci5wYXJlbnQoKS5hZGRDbGFzcygnZml4ZWQnKTtcbiAgICAgICAgICAgIHRvcGJhci5yZW1vdmVDbGFzcygnZml4ZWQnKTtcbiAgICAgICAgICAgIHNlbGYuUygnYm9keScpLmFkZENsYXNzKCdmLXRvcGJhci1maXhlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0b3BiYXIucGFyZW50KCkuaGFzQ2xhc3MoJ2ZpeGVkJykpIHtcbiAgICAgICAgICBpZiAoc2V0dGluZ3Muc2Nyb2xsdG9wKSB7XG4gICAgICAgICAgICB0b3BiYXIucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2ZpeGVkJyk7XG4gICAgICAgICAgICB0b3BiYXIuYWRkQ2xhc3MoJ2ZpeGVkJyk7XG4gICAgICAgICAgICBzZWxmLlMoJ2JvZHknKS5yZW1vdmVDbGFzcygnZi10b3BiYXItZml4ZWQnKTtcblxuICAgICAgICAgICAgd2luZG93LnNjcm9sbFRvKDAsIDApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b3BiYXIucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2V4cGFuZGVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2VsZi5pc19zdGlja3kodG9wYmFyLCB0b3BiYXIucGFyZW50KCksIHNldHRpbmdzKSkge1xuICAgICAgICAgIHRvcGJhci5wYXJlbnQoKS5hZGRDbGFzcygnZml4ZWQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0b3BiYXIucGFyZW50KCkuaGFzQ2xhc3MoJ2ZpeGVkJykpIHtcbiAgICAgICAgICBpZiAoIXRvcGJhci5oYXNDbGFzcygnZXhwYW5kZWQnKSkge1xuICAgICAgICAgICAgdG9wYmFyLnJlbW92ZUNsYXNzKCdmaXhlZCcpO1xuICAgICAgICAgICAgdG9wYmFyLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdleHBhbmRlZCcpO1xuICAgICAgICAgICAgc2VsZi51cGRhdGVfc3RpY2t5X3Bvc2l0aW9uaW5nKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRvcGJhci5hZGRDbGFzcygnZml4ZWQnKTtcbiAgICAgICAgICAgIHRvcGJhci5wYXJlbnQoKS5hZGRDbGFzcygnZXhwYW5kZWQnKTtcbiAgICAgICAgICAgIHNlbGYuUygnYm9keScpLmFkZENsYXNzKCdmLXRvcGJhci1maXhlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICB0aW1lciA6IG51bGwsXG5cbiAgICBldmVudHMgOiBmdW5jdGlvbiAoYmFyKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgUyA9IHRoaXMuUztcblxuICAgICAgUyh0aGlzLnNjb3BlKVxuICAgICAgICAub2ZmKCcudG9wYmFyJylcbiAgICAgICAgLm9uKCdjbGljay5mbmR0bi50b3BiYXInLCAnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10gLnRvZ2dsZS10b3BiYXInLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBzZWxmLnRvZ2dsZSh0aGlzKTtcbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdjbGljay5mbmR0bi50b3BiYXIgY29udGV4dG1lbnUuZm5kdG4udG9wYmFyJywgJy50b3AtYmFyIC50b3AtYmFyLXNlY3Rpb24gbGkgYVtocmVmXj1cIiNcIl0sWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10gLnRvcC1iYXItc2VjdGlvbiBsaSBhW2hyZWZePVwiI1wiXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgbGkgPSAkKHRoaXMpLmNsb3Nlc3QoJ2xpJyksXG4gICAgICAgICAgICAgICAgdG9wYmFyID0gbGkuY2xvc2VzdCgnWycgKyBzZWxmLmF0dHJfbmFtZSgpICsgJ10nKSxcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyA9IHRvcGJhci5kYXRhKHNlbGYuYXR0cl9uYW1lKHRydWUpICsgJy1pbml0Jyk7XG5cbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5kcm9wZG93bl9hdXRvY2xvc2UgJiYgc2V0dGluZ3MuaXNfaG92ZXIpIHtcbiAgICAgICAgICAgICAgdmFyIGhvdmVyTGkgPSAkKHRoaXMpLmNsb3Nlc3QoJy5ob3ZlcicpO1xuICAgICAgICAgICAgICBob3ZlckxpLnJlbW92ZUNsYXNzKCdob3ZlcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNlbGYuYnJlYWtwb2ludCgpICYmICFsaS5oYXNDbGFzcygnYmFjaycpICYmICFsaS5oYXNDbGFzcygnaGFzLWRyb3Bkb3duJykpIHtcbiAgICAgICAgICAgICAgc2VsZi50b2dnbGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KVxuICAgICAgICAub24oJ2NsaWNrLmZuZHRuLnRvcGJhcicsICdbJyArIHRoaXMuYXR0cl9uYW1lKCkgKyAnXSBsaS5oYXMtZHJvcGRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIHZhciBsaSA9IFModGhpcyksXG4gICAgICAgICAgICAgIHRhcmdldCA9IFMoZS50YXJnZXQpLFxuICAgICAgICAgICAgICB0b3BiYXIgPSBsaS5jbG9zZXN0KCdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnXScpLFxuICAgICAgICAgICAgICBzZXR0aW5ncyA9IHRvcGJhci5kYXRhKHNlbGYuYXR0cl9uYW1lKHRydWUpICsgJy1pbml0Jyk7XG5cbiAgICAgICAgICBpZiAodGFyZ2V0LmRhdGEoJ3JldmVhbElkJykpIHtcbiAgICAgICAgICAgIHNlbGYudG9nZ2xlKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlbGYuYnJlYWtwb2ludCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNldHRpbmdzLmlzX2hvdmVyICYmICFNb2Rlcm5penIudG91Y2gpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgaWYgKGxpLmhhc0NsYXNzKCdob3ZlcicpKSB7XG4gICAgICAgICAgICBsaVxuICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2hvdmVyJylcbiAgICAgICAgICAgICAgLmZpbmQoJ2xpJylcbiAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdob3ZlcicpO1xuXG4gICAgICAgICAgICBsaS5wYXJlbnRzKCdsaS5ob3ZlcicpXG4gICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnaG92ZXInKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGkuYWRkQ2xhc3MoJ2hvdmVyJyk7XG5cbiAgICAgICAgICAgICQobGkpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2hvdmVyJyk7XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXRbMF0ubm9kZU5hbWUgPT09ICdBJyAmJiB0YXJnZXQucGFyZW50KCkuaGFzQ2xhc3MoJ2hhcy1kcm9wZG93bicpKSB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignY2xpY2suZm5kdG4udG9wYmFyJywgJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddIC5oYXMtZHJvcGRvd24+YScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgaWYgKHNlbGYuYnJlYWtwb2ludCgpKSB7XG5cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgdmFyICR0aGlzID0gUyh0aGlzKSxcbiAgICAgICAgICAgICAgICB0b3BiYXIgPSAkdGhpcy5jbG9zZXN0KCdbJyArIHNlbGYuYXR0cl9uYW1lKCkgKyAnXScpLFxuICAgICAgICAgICAgICAgIHNlY3Rpb24gPSB0b3BiYXIuZmluZCgnc2VjdGlvbiwgLnRvcC1iYXItc2VjdGlvbicpLFxuICAgICAgICAgICAgICAgIGRyb3Bkb3duSGVpZ2h0ID0gJHRoaXMubmV4dCgnLmRyb3Bkb3duJykub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICAgICAgICAkc2VsZWN0ZWRMaSA9ICR0aGlzLmNsb3Nlc3QoJ2xpJyk7XG5cbiAgICAgICAgICAgIHRvcGJhci5kYXRhKCdpbmRleCcsIHRvcGJhci5kYXRhKCdpbmRleCcpICsgMSk7XG4gICAgICAgICAgICAkc2VsZWN0ZWRMaS5hZGRDbGFzcygnbW92ZWQnKTtcblxuICAgICAgICAgICAgaWYgKCFzZWxmLnJ0bCkge1xuICAgICAgICAgICAgICBzZWN0aW9uLmNzcyh7bGVmdCA6IC0oMTAwICogdG9wYmFyLmRhdGEoJ2luZGV4JykpICsgJyUnfSk7XG4gICAgICAgICAgICAgIHNlY3Rpb24uZmluZCgnPi5uYW1lJykuY3NzKHtsZWZ0IDogMTAwICogdG9wYmFyLmRhdGEoJ2luZGV4JykgKyAnJSd9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNlY3Rpb24uY3NzKHtyaWdodCA6IC0oMTAwICogdG9wYmFyLmRhdGEoJ2luZGV4JykpICsgJyUnfSk7XG4gICAgICAgICAgICAgIHNlY3Rpb24uZmluZCgnPi5uYW1lJykuY3NzKHtyaWdodCA6IDEwMCAqIHRvcGJhci5kYXRhKCdpbmRleCcpICsgJyUnfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRvcGJhci5jc3MoJ2hlaWdodCcsICR0aGlzLnNpYmxpbmdzKCd1bCcpLm91dGVySGVpZ2h0KHRydWUpICsgdG9wYmFyLmRhdGEoJ2hlaWdodCcpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICBTKHdpbmRvdykub2ZmKCcudG9wYmFyJykub24oJ3Jlc2l6ZS5mbmR0bi50b3BiYXInLCBzZWxmLnRocm90dGxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzZWxmLnJlc2l6ZS5jYWxsKHNlbGYpO1xuICAgICAgfSwgNTApKS50cmlnZ2VyKCdyZXNpemUuZm5kdG4udG9wYmFyJykubG9hZChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gRW5zdXJlIHRoYXQgdGhlIG9mZnNldCBpcyBjYWxjdWxhdGVkIGFmdGVyIGFsbCBvZiB0aGUgcGFnZXMgcmVzb3VyY2VzIGhhdmUgbG9hZGVkXG4gICAgICAgICAgUyh0aGlzKS50cmlnZ2VyKCdyZXNpemUuZm5kdG4udG9wYmFyJyk7XG4gICAgICB9KTtcblxuICAgICAgUygnYm9keScpLm9mZignLnRvcGJhcicpLm9uKCdjbGljay5mbmR0bi50b3BiYXInLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgcGFyZW50ID0gUyhlLnRhcmdldCkuY2xvc2VzdCgnbGknKS5jbG9zZXN0KCdsaS5ob3ZlcicpO1xuXG4gICAgICAgIGlmIChwYXJlbnQubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIFMoJ1snICsgc2VsZi5hdHRyX25hbWUoKSArICddIGxpLmhvdmVyJykucmVtb3ZlQ2xhc3MoJ2hvdmVyJyk7XG4gICAgICB9KTtcblxuICAgICAgLy8gR28gdXAgYSBsZXZlbCBvbiBDbGlja1xuICAgICAgUyh0aGlzLnNjb3BlKS5vbignY2xpY2suZm5kdG4udG9wYmFyJywgJ1snICsgdGhpcy5hdHRyX25hbWUoKSArICddIC5oYXMtZHJvcGRvd24gLmJhY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdmFyICR0aGlzID0gUyh0aGlzKSxcbiAgICAgICAgICAgIHRvcGJhciA9ICR0aGlzLmNsb3Nlc3QoJ1snICsgc2VsZi5hdHRyX25hbWUoKSArICddJyksXG4gICAgICAgICAgICBzZWN0aW9uID0gdG9wYmFyLmZpbmQoJ3NlY3Rpb24sIC50b3AtYmFyLXNlY3Rpb24nKSxcbiAgICAgICAgICAgIHNldHRpbmdzID0gdG9wYmFyLmRhdGEoc2VsZi5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKSxcbiAgICAgICAgICAgICRtb3ZlZExpID0gJHRoaXMuY2xvc2VzdCgnbGkubW92ZWQnKSxcbiAgICAgICAgICAgICRwcmV2aW91c0xldmVsVWwgPSAkbW92ZWRMaS5wYXJlbnQoKTtcblxuICAgICAgICB0b3BiYXIuZGF0YSgnaW5kZXgnLCB0b3BiYXIuZGF0YSgnaW5kZXgnKSAtIDEpO1xuXG4gICAgICAgIGlmICghc2VsZi5ydGwpIHtcbiAgICAgICAgICBzZWN0aW9uLmNzcyh7bGVmdCA6IC0oMTAwICogdG9wYmFyLmRhdGEoJ2luZGV4JykpICsgJyUnfSk7XG4gICAgICAgICAgc2VjdGlvbi5maW5kKCc+Lm5hbWUnKS5jc3Moe2xlZnQgOiAxMDAgKiB0b3BiYXIuZGF0YSgnaW5kZXgnKSArICclJ30pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlY3Rpb24uY3NzKHtyaWdodCA6IC0oMTAwICogdG9wYmFyLmRhdGEoJ2luZGV4JykpICsgJyUnfSk7XG4gICAgICAgICAgc2VjdGlvbi5maW5kKCc+Lm5hbWUnKS5jc3Moe3JpZ2h0IDogMTAwICogdG9wYmFyLmRhdGEoJ2luZGV4JykgKyAnJSd9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0b3BiYXIuZGF0YSgnaW5kZXgnKSA9PT0gMCkge1xuICAgICAgICAgIHRvcGJhci5jc3MoJ2hlaWdodCcsICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b3BiYXIuY3NzKCdoZWlnaHQnLCAkcHJldmlvdXNMZXZlbFVsLm91dGVySGVpZ2h0KHRydWUpICsgdG9wYmFyLmRhdGEoJ2hlaWdodCcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRtb3ZlZExpLnJlbW92ZUNsYXNzKCdtb3ZlZCcpO1xuICAgICAgICB9LCAzMDApO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFNob3cgZHJvcGRvd24gbWVudXMgd2hlbiB0aGVpciBpdGVtcyBhcmUgZm9jdXNlZFxuICAgICAgUyh0aGlzLnNjb3BlKS5maW5kKCcuZHJvcGRvd24gYScpXG4gICAgICAgIC5mb2N1cyhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuaGFzLWRyb3Bkb3duJykuYWRkQ2xhc3MoJ2hvdmVyJyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5ibHVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkKHRoaXMpLnBhcmVudHMoJy5oYXMtZHJvcGRvd24nKS5yZW1vdmVDbGFzcygnaG92ZXInKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlc2l6ZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHNlbGYuUygnWycgKyB0aGlzLmF0dHJfbmFtZSgpICsgJ10nKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHRvcGJhciA9IHNlbGYuUyh0aGlzKSxcbiAgICAgICAgICAgIHNldHRpbmdzID0gdG9wYmFyLmRhdGEoc2VsZi5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKTtcblxuICAgICAgICB2YXIgc3RpY2t5Q29udGFpbmVyID0gdG9wYmFyLnBhcmVudCgnLicgKyBzZWxmLnNldHRpbmdzLnN0aWNreV9jbGFzcyk7XG4gICAgICAgIHZhciBzdGlja3lPZmZzZXQ7XG5cbiAgICAgICAgaWYgKCFzZWxmLmJyZWFrcG9pbnQoKSkge1xuICAgICAgICAgIHZhciBkb1RvZ2dsZSA9IHRvcGJhci5oYXNDbGFzcygnZXhwYW5kZWQnKTtcbiAgICAgICAgICB0b3BiYXJcbiAgICAgICAgICAgIC5jc3MoJ2hlaWdodCcsICcnKVxuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdleHBhbmRlZCcpXG4gICAgICAgICAgICAuZmluZCgnbGknKVxuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdob3ZlcicpO1xuXG4gICAgICAgICAgICBpZiAoZG9Ub2dnbGUpIHtcbiAgICAgICAgICAgICAgc2VsZi50b2dnbGUodG9wYmFyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxmLmlzX3N0aWNreSh0b3BiYXIsIHN0aWNreUNvbnRhaW5lciwgc2V0dGluZ3MpKSB7XG4gICAgICAgICAgaWYgKHN0aWNreUNvbnRhaW5lci5oYXNDbGFzcygnZml4ZWQnKSkge1xuICAgICAgICAgICAgLy8gUmVtb3ZlIHRoZSBmaXhlZCB0byBhbGxvdyBmb3IgY29ycmVjdCBjYWxjdWxhdGlvbiBvZiB0aGUgb2Zmc2V0LlxuICAgICAgICAgICAgc3RpY2t5Q29udGFpbmVyLnJlbW92ZUNsYXNzKCdmaXhlZCcpO1xuXG4gICAgICAgICAgICBzdGlja3lPZmZzZXQgPSBzdGlja3lDb250YWluZXIub2Zmc2V0KCkudG9wO1xuICAgICAgICAgICAgaWYgKHNlbGYuUyhkb2N1bWVudC5ib2R5KS5oYXNDbGFzcygnZi10b3BiYXItZml4ZWQnKSkge1xuICAgICAgICAgICAgICBzdGlja3lPZmZzZXQgLT0gdG9wYmFyLmRhdGEoJ2hlaWdodCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0b3BiYXIuZGF0YSgnc3RpY2t5b2Zmc2V0Jywgc3RpY2t5T2Zmc2V0KTtcbiAgICAgICAgICAgIHN0aWNreUNvbnRhaW5lci5hZGRDbGFzcygnZml4ZWQnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RpY2t5T2Zmc2V0ID0gc3RpY2t5Q29udGFpbmVyLm9mZnNldCgpLnRvcDtcbiAgICAgICAgICAgIHRvcGJhci5kYXRhKCdzdGlja3lvZmZzZXQnLCBzdGlja3lPZmZzZXQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgYnJlYWtwb2ludCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiAhbWF0Y2hNZWRpYShGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXNbJ3RvcGJhciddKS5tYXRjaGVzO1xuICAgIH0sXG5cbiAgICBzbWFsbCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBtYXRjaE1lZGlhKEZvdW5kYXRpb24ubWVkaWFfcXVlcmllc1snc21hbGwnXSkubWF0Y2hlcztcbiAgICB9LFxuXG4gICAgbWVkaXVtIDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG1hdGNoTWVkaWEoRm91bmRhdGlvbi5tZWRpYV9xdWVyaWVzWydtZWRpdW0nXSkubWF0Y2hlcztcbiAgICB9LFxuXG4gICAgbGFyZ2UgOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbWF0Y2hNZWRpYShGb3VuZGF0aW9uLm1lZGlhX3F1ZXJpZXNbJ2xhcmdlJ10pLm1hdGNoZXM7XG4gICAgfSxcblxuICAgIGFzc2VtYmxlIDogZnVuY3Rpb24gKHRvcGJhcikge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIHNldHRpbmdzID0gdG9wYmFyLmRhdGEodGhpcy5hdHRyX25hbWUodHJ1ZSkgKyAnLWluaXQnKSxcbiAgICAgICAgICBzZWN0aW9uID0gc2VsZi5TKCdzZWN0aW9uLCAudG9wLWJhci1zZWN0aW9uJywgdG9wYmFyKTtcblxuICAgICAgLy8gUHVsbCBlbGVtZW50IG91dCBvZiB0aGUgRE9NIGZvciBtYW5pcHVsYXRpb25cbiAgICAgIHNlY3Rpb24uZGV0YWNoKCk7XG5cbiAgICAgIHNlbGYuUygnLmhhcy1kcm9wZG93bj5hJywgc2VjdGlvbikuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciAkbGluayA9IHNlbGYuUyh0aGlzKSxcbiAgICAgICAgICAgICRkcm9wZG93biA9ICRsaW5rLnNpYmxpbmdzKCcuZHJvcGRvd24nKSxcbiAgICAgICAgICAgIHVybCA9ICRsaW5rLmF0dHIoJ2hyZWYnKSxcbiAgICAgICAgICAgICR0aXRsZUxpO1xuXG4gICAgICAgIGlmICghJGRyb3Bkb3duLmZpbmQoJy50aXRsZS5iYWNrJykubGVuZ3RoKSB7XG5cbiAgICAgICAgICBpZiAoc2V0dGluZ3MubW9iaWxlX3Nob3dfcGFyZW50X2xpbmsgPT0gdHJ1ZSAmJiB1cmwpIHtcbiAgICAgICAgICAgICR0aXRsZUxpID0gJCgnPGxpIGNsYXNzPVwidGl0bGUgYmFjayBqcy1nZW5lcmF0ZWRcIj48aDU+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiPjwvYT48L2g1PjwvbGk+PGxpIGNsYXNzPVwicGFyZW50LWxpbmsgaGlkZS1mb3ItbGFyZ2UtdXBcIj48YSBjbGFzcz1cInBhcmVudC1saW5rIGpzLWdlbmVyYXRlZFwiIGhyZWY9XCInICsgdXJsICsgJ1wiPicgKyAkbGluay5odG1sKCkgKyc8L2E+PC9saT4nKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHRpdGxlTGkgPSAkKCc8bGkgY2xhc3M9XCJ0aXRsZSBiYWNrIGpzLWdlbmVyYXRlZFwiPjxoNT48YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCI+PC9hPjwvaDU+Jyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ29weSBsaW5rIHRvIHN1Ym5hdlxuICAgICAgICAgIGlmIChzZXR0aW5ncy5jdXN0b21fYmFja190ZXh0ID09IHRydWUpIHtcbiAgICAgICAgICAgICQoJ2g1PmEnLCAkdGl0bGVMaSkuaHRtbChzZXR0aW5ncy5iYWNrX3RleHQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKCdoNT5hJywgJHRpdGxlTGkpLmh0bWwoJyZsYXF1bzsgJyArICRsaW5rLmh0bWwoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgICRkcm9wZG93bi5wcmVwZW5kKCR0aXRsZUxpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIFB1dCBlbGVtZW50IGJhY2sgaW4gdGhlIERPTVxuICAgICAgc2VjdGlvbi5hcHBlbmRUbyh0b3BiYXIpO1xuXG4gICAgICAvLyBjaGVjayBmb3Igc3RpY2t5XG4gICAgICB0aGlzLnN0aWNreSgpO1xuXG4gICAgICB0aGlzLmFzc2VtYmxlZCh0b3BiYXIpO1xuICAgIH0sXG5cbiAgICBhc3NlbWJsZWQgOiBmdW5jdGlvbiAodG9wYmFyKSB7XG4gICAgICB0b3BiYXIuZGF0YSh0aGlzLmF0dHJfbmFtZSh0cnVlKSwgJC5leHRlbmQoe30sIHRvcGJhci5kYXRhKHRoaXMuYXR0cl9uYW1lKHRydWUpKSwge2Fzc2VtYmxlZCA6IHRydWV9KSk7XG4gICAgfSxcblxuICAgIGhlaWdodCA6IGZ1bmN0aW9uICh1bCkge1xuICAgICAgdmFyIHRvdGFsID0gMCxcbiAgICAgICAgICBzZWxmID0gdGhpcztcblxuICAgICAgJCgnPiBsaScsIHVsKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdG90YWwgKz0gc2VsZi5TKHRoaXMpLm91dGVySGVpZ2h0KHRydWUpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB0b3RhbDtcbiAgICB9LFxuXG4gICAgc3RpY2t5IDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB0aGlzLlMod2luZG93KS5vbignc2Nyb2xsJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLnVwZGF0ZV9zdGlja3lfcG9zaXRpb25pbmcoKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICB1cGRhdGVfc3RpY2t5X3Bvc2l0aW9uaW5nIDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGtsYXNzID0gJy4nICsgdGhpcy5zZXR0aW5ncy5zdGlja3lfY2xhc3MsXG4gICAgICAgICAgJHdpbmRvdyA9IHRoaXMuUyh3aW5kb3cpLFxuICAgICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAoc2VsZi5zZXR0aW5ncy5zdGlja3lfdG9wYmFyICYmIHNlbGYuaXNfc3RpY2t5KHRoaXMuc2V0dGluZ3Muc3RpY2t5X3RvcGJhcix0aGlzLnNldHRpbmdzLnN0aWNreV90b3BiYXIucGFyZW50KCksIHRoaXMuc2V0dGluZ3MpKSB7XG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHRoaXMuc2V0dGluZ3Muc3RpY2t5X3RvcGJhci5kYXRhKCdzdGlja3lvZmZzZXQnKSArIHRoaXMuc2V0dGluZ3Muc3RhcnRfb2Zmc2V0O1xuICAgICAgICBpZiAoIXNlbGYuUyhrbGFzcykuaGFzQ2xhc3MoJ2V4cGFuZGVkJykpIHtcbiAgICAgICAgICBpZiAoJHdpbmRvdy5zY3JvbGxUb3AoKSA+IChkaXN0YW5jZSkpIHtcbiAgICAgICAgICAgIGlmICghc2VsZi5TKGtsYXNzKS5oYXNDbGFzcygnZml4ZWQnKSkge1xuICAgICAgICAgICAgICBzZWxmLlMoa2xhc3MpLmFkZENsYXNzKCdmaXhlZCcpO1xuICAgICAgICAgICAgICBzZWxmLlMoJ2JvZHknKS5hZGRDbGFzcygnZi10b3BiYXItZml4ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKCR3aW5kb3cuc2Nyb2xsVG9wKCkgPD0gZGlzdGFuY2UpIHtcbiAgICAgICAgICAgIGlmIChzZWxmLlMoa2xhc3MpLmhhc0NsYXNzKCdmaXhlZCcpKSB7XG4gICAgICAgICAgICAgIHNlbGYuUyhrbGFzcykucmVtb3ZlQ2xhc3MoJ2ZpeGVkJyk7XG4gICAgICAgICAgICAgIHNlbGYuUygnYm9keScpLnJlbW92ZUNsYXNzKCdmLXRvcGJhci1maXhlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBvZmYgOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLlModGhpcy5zY29wZSkub2ZmKCcuZm5kdG4udG9wYmFyJyk7XG4gICAgICB0aGlzLlMod2luZG93KS5vZmYoJy5mbmR0bi50b3BiYXInKTtcbiAgICB9LFxuXG4gICAgcmVmbG93IDogZnVuY3Rpb24gKCkge31cbiAgfTtcbn0oalF1ZXJ5LCB3aW5kb3csIHdpbmRvdy5kb2N1bWVudCkpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9