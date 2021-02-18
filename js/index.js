(function () {
  'use strict';

  /*
   * anime.js v3.2.1
   * (c) 2020 Julian Garnier
   * Released under the MIT license
   * animejs.com
   */

  // Defaults

  var defaultInstanceSettings = {
    update: null,
    begin: null,
    loopBegin: null,
    changeBegin: null,
    change: null,
    changeComplete: null,
    loopComplete: null,
    complete: null,
    loop: 1,
    direction: 'normal',
    autoplay: true,
    timelineOffset: 0
  };

  var defaultTweenSettings = {
    duration: 1000,
    delay: 0,
    endDelay: 0,
    easing: 'easeOutElastic(1, .5)',
    round: 0
  };

  var validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective', 'matrix', 'matrix3d'];

  // Caching

  var cache = {
    CSS: {},
    springs: {}
  };

  // Utils

  function minMax(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  function stringContains(str, text) {
    return str.indexOf(text) > -1;
  }

  function applyArguments(func, args) {
    return func.apply(null, args);
  }

  var is = {
    arr: function (a) { return Array.isArray(a); },
    obj: function (a) { return stringContains(Object.prototype.toString.call(a), 'Object'); },
    pth: function (a) { return is.obj(a) && a.hasOwnProperty('totalLength'); },
    svg: function (a) { return a instanceof SVGElement; },
    inp: function (a) { return a instanceof HTMLInputElement; },
    dom: function (a) { return a.nodeType || is.svg(a); },
    str: function (a) { return typeof a === 'string'; },
    fnc: function (a) { return typeof a === 'function'; },
    und: function (a) { return typeof a === 'undefined'; },
    nil: function (a) { return is.und(a) || a === null; },
    hex: function (a) { return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a); },
    rgb: function (a) { return /^rgb/.test(a); },
    hsl: function (a) { return /^hsl/.test(a); },
    col: function (a) { return (is.hex(a) || is.rgb(a) || is.hsl(a)); },
    key: function (a) { return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes'; },
  };

  // Easings

  function parseEasingParameters(string) {
    var match = /\(([^)]+)\)/.exec(string);
    return match ? match[1].split(',').map(function (p) { return parseFloat(p); }) : [];
  }

  // Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

  function spring(string, duration) {

    var params = parseEasingParameters(string);
    var mass = minMax(is.und(params[0]) ? 1 : params[0], .1, 100);
    var stiffness = minMax(is.und(params[1]) ? 100 : params[1], .1, 100);
    var damping = minMax(is.und(params[2]) ? 10 : params[2], .1, 100);
    var velocity =  minMax(is.und(params[3]) ? 0 : params[3], .1, 100);
    var w0 = Math.sqrt(stiffness / mass);
    var zeta = damping / (2 * Math.sqrt(stiffness * mass));
    var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
    var a = 1;
    var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

    function solver(t) {
      var progress = duration ? (duration * t) / 1000 : t;
      if (zeta < 1) {
        progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
      } else {
        progress = (a + b * progress) * Math.exp(-progress * w0);
      }
      if (t === 0 || t === 1) { return t; }
      return 1 - progress;
    }

    function getDuration() {
      var cached = cache.springs[string];
      if (cached) { return cached; }
      var frame = 1/6;
      var elapsed = 0;
      var rest = 0;
      while(true) {
        elapsed += frame;
        if (solver(elapsed) === 1) {
          rest++;
          if (rest >= 16) { break; }
        } else {
          rest = 0;
        }
      }
      var duration = elapsed * frame * 1000;
      cache.springs[string] = duration;
      return duration;
    }

    return duration ? solver : getDuration;

  }

  // Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function

  function steps(steps) {
    if ( steps === void 0 ) steps = 10;

    return function (t) { return Math.ceil((minMax(t, 0.000001, 1)) * steps) * (1 / steps); };
  }

  // BezierEasing https://github.com/gre/bezier-easing

  var bezier = (function () {

    var kSplineTableSize = 11;
    var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

    function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1 }
    function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1 }
    function C(aA1)      { return 3.0 * aA1 }

    function calcBezier(aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT }
    function getSlope(aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1) }

    function binarySubdivide(aX, aA, aB, mX1, mX2) {
      var currentX, currentT, i = 0;
      do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0.0) { aB = currentT; } else { aA = currentT; }
      } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
      return currentT;
    }

    function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
      for (var i = 0; i < 4; ++i) {
        var currentSlope = getSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0.0) { return aGuessT; }
        var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
      }
      return aGuessT;
    }

    function bezier(mX1, mY1, mX2, mY2) {

      if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) { return; }
      var sampleValues = new Float32Array(kSplineTableSize);

      if (mX1 !== mY1 || mX2 !== mY2) {
        for (var i = 0; i < kSplineTableSize; ++i) {
          sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
        }
      }

      function getTForX(aX) {

        var intervalStart = 0;
        var currentSample = 1;
        var lastSample = kSplineTableSize - 1;

        for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
          intervalStart += kSampleStepSize;
        }

        --currentSample;

        var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        var guessForT = intervalStart + dist * kSampleStepSize;
        var initialSlope = getSlope(guessForT, mX1, mX2);

        if (initialSlope >= 0.001) {
          return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        } else if (initialSlope === 0.0) {
          return guessForT;
        } else {
          return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
        }

      }

      return function (x) {
        if (mX1 === mY1 && mX2 === mY2) { return x; }
        if (x === 0 || x === 1) { return x; }
        return calcBezier(getTForX(x), mY1, mY2);
      }

    }

    return bezier;

  })();

  var penner = (function () {

    // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)

    var eases = { linear: function () { return function (t) { return t; }; } };

    var functionEasings = {
      Sine: function () { return function (t) { return 1 - Math.cos(t * Math.PI / 2); }; },
      Circ: function () { return function (t) { return 1 - Math.sqrt(1 - t * t); }; },
      Back: function () { return function (t) { return t * t * (3 * t - 2); }; },
      Bounce: function () { return function (t) {
        var pow2, b = 4;
        while (t < (( pow2 = Math.pow(2, --b)) - 1) / 11) {}
        return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow(( pow2 * 3 - 2 ) / 22 - t, 2)
      }; },
      Elastic: function (amplitude, period) {
        if ( amplitude === void 0 ) amplitude = 1;
        if ( period === void 0 ) period = .5;

        var a = minMax(amplitude, 1, 10);
        var p = minMax(period, .1, 2);
        return function (t) {
          return (t === 0 || t === 1) ? t : 
            -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
        }
      }
    };

    var baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];

    baseEasings.forEach(function (name, i) {
      functionEasings[name] = function () { return function (t) { return Math.pow(t, i + 2); }; };
    });

    Object.keys(functionEasings).forEach(function (name) {
      var easeIn = functionEasings[name];
      eases['easeIn' + name] = easeIn;
      eases['easeOut' + name] = function (a, b) { return function (t) { return 1 - easeIn(a, b)(1 - t); }; };
      eases['easeInOut' + name] = function (a, b) { return function (t) { return t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 
        1 - easeIn(a, b)(t * -2 + 2) / 2; }; };
      eases['easeOutIn' + name] = function (a, b) { return function (t) { return t < 0.5 ? (1 - easeIn(a, b)(1 - t * 2)) / 2 : 
        (easeIn(a, b)(t * 2 - 1) + 1) / 2; }; };
    });

    return eases;

  })();

  function parseEasings(easing, duration) {
    if (is.fnc(easing)) { return easing; }
    var name = easing.split('(')[0];
    var ease = penner[name];
    var args = parseEasingParameters(easing);
    switch (name) {
      case 'spring' : return spring(easing, duration);
      case 'cubicBezier' : return applyArguments(bezier, args);
      case 'steps' : return applyArguments(steps, args);
      default : return applyArguments(ease, args);
    }
  }

  // Strings

  function selectString(str) {
    try {
      var nodes = document.querySelectorAll(str);
      return nodes;
    } catch(e) {
      return;
    }
  }

  // Arrays

  function filterArray(arr, callback) {
    var len = arr.length;
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    var result = [];
    for (var i = 0; i < len; i++) {
      if (i in arr) {
        var val = arr[i];
        if (callback.call(thisArg, val, i, arr)) {
          result.push(val);
        }
      }
    }
    return result;
  }

  function flattenArray(arr) {
    return arr.reduce(function (a, b) { return a.concat(is.arr(b) ? flattenArray(b) : b); }, []);
  }

  function toArray(o) {
    if (is.arr(o)) { return o; }
    if (is.str(o)) { o = selectString(o) || o; }
    if (o instanceof NodeList || o instanceof HTMLCollection) { return [].slice.call(o); }
    return [o];
  }

  function arrayContains(arr, val) {
    return arr.some(function (a) { return a === val; });
  }

  // Objects

  function cloneObject(o) {
    var clone = {};
    for (var p in o) { clone[p] = o[p]; }
    return clone;
  }

  function replaceObjectProps(o1, o2) {
    var o = cloneObject(o1);
    for (var p in o1) { o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p]; }
    return o;
  }

  function mergeObjects(o1, o2) {
    var o = cloneObject(o1);
    for (var p in o2) { o[p] = is.und(o1[p]) ? o2[p] : o1[p]; }
    return o;
  }

  // Colors

  function rgbToRgba(rgbValue) {
    var rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
    return rgb ? ("rgba(" + (rgb[1]) + ",1)") : rgbValue;
  }

  function hexToRgba(hexValue) {
    var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    var hex = hexValue.replace(rgx, function (m, r, g, b) { return r + r + g + g + b + b; } );
    var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var r = parseInt(rgb[1], 16);
    var g = parseInt(rgb[2], 16);
    var b = parseInt(rgb[3], 16);
    return ("rgba(" + r + "," + g + "," + b + ",1)");
  }

  function hslToRgba(hslValue) {
    var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(hslValue);
    var h = parseInt(hsl[1], 10) / 360;
    var s = parseInt(hsl[2], 10) / 100;
    var l = parseInt(hsl[3], 10) / 100;
    var a = hsl[4] || 1;
    function hue2rgb(p, q, t) {
      if (t < 0) { t += 1; }
      if (t > 1) { t -= 1; }
      if (t < 1/6) { return p + (q - p) * 6 * t; }
      if (t < 1/2) { return q; }
      if (t < 2/3) { return p + (q - p) * (2/3 - t) * 6; }
      return p;
    }
    var r, g, b;
    if (s == 0) {
      r = g = b = l;
    } else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return ("rgba(" + (r * 255) + "," + (g * 255) + "," + (b * 255) + "," + a + ")");
  }

  function colorToRgb(val) {
    if (is.rgb(val)) { return rgbToRgba(val); }
    if (is.hex(val)) { return hexToRgba(val); }
    if (is.hsl(val)) { return hslToRgba(val); }
  }

  // Units

  function getUnit(val) {
    var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
    if (split) { return split[1]; }
  }

  function getTransformUnit(propName) {
    if (stringContains(propName, 'translate') || propName === 'perspective') { return 'px'; }
    if (stringContains(propName, 'rotate') || stringContains(propName, 'skew')) { return 'deg'; }
  }

  // Values

  function getFunctionValue(val, animatable) {
    if (!is.fnc(val)) { return val; }
    return val(animatable.target, animatable.id, animatable.total);
  }

  function getAttribute(el, prop) {
    return el.getAttribute(prop);
  }

  function convertPxToUnit(el, value, unit) {
    var valueUnit = getUnit(value);
    if (arrayContains([unit, 'deg', 'rad', 'turn'], valueUnit)) { return value; }
    var cached = cache.CSS[value + unit];
    if (!is.und(cached)) { return cached; }
    var baseline = 100;
    var tempEl = document.createElement(el.tagName);
    var parentEl = (el.parentNode && (el.parentNode !== document)) ? el.parentNode : document.body;
    parentEl.appendChild(tempEl);
    tempEl.style.position = 'absolute';
    tempEl.style.width = baseline + unit;
    var factor = baseline / tempEl.offsetWidth;
    parentEl.removeChild(tempEl);
    var convertedUnit = factor * parseFloat(value);
    cache.CSS[value + unit] = convertedUnit;
    return convertedUnit;
  }

  function getCSSValue(el, prop, unit) {
    if (prop in el.style) {
      var uppercasePropName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      var value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || '0';
      return unit ? convertPxToUnit(el, value, unit) : value;
    }
  }

  function getAnimationType(el, prop) {
    if (is.dom(el) && !is.inp(el) && (!is.nil(getAttribute(el, prop)) || (is.svg(el) && el[prop]))) { return 'attribute'; }
    if (is.dom(el) && arrayContains(validTransforms, prop)) { return 'transform'; }
    if (is.dom(el) && (prop !== 'transform' && getCSSValue(el, prop))) { return 'css'; }
    if (el[prop] != null) { return 'object'; }
  }

  function getElementTransforms(el) {
    if (!is.dom(el)) { return; }
    var str = el.style.transform || '';
    var reg  = /(\w+)\(([^)]*)\)/g;
    var transforms = new Map();
    var m; while (m = reg.exec(str)) { transforms.set(m[1], m[2]); }
    return transforms;
  }

  function getTransformValue(el, propName, animatable, unit) {
    var defaultVal = stringContains(propName, 'scale') ? 1 : 0 + getTransformUnit(propName);
    var value = getElementTransforms(el).get(propName) || defaultVal;
    if (animatable) {
      animatable.transforms.list.set(propName, value);
      animatable.transforms['last'] = propName;
    }
    return unit ? convertPxToUnit(el, value, unit) : value;
  }

  function getOriginalTargetValue(target, propName, unit, animatable) {
    switch (getAnimationType(target, propName)) {
      case 'transform': return getTransformValue(target, propName, animatable, unit);
      case 'css': return getCSSValue(target, propName, unit);
      case 'attribute': return getAttribute(target, propName);
      default: return target[propName] || 0;
    }
  }

  function getRelativeValue(to, from) {
    var operator = /^(\*=|\+=|-=)/.exec(to);
    if (!operator) { return to; }
    var u = getUnit(to) || 0;
    var x = parseFloat(from);
    var y = parseFloat(to.replace(operator[0], ''));
    switch (operator[0][0]) {
      case '+': return x + y + u;
      case '-': return x - y + u;
      case '*': return x * y + u;
    }
  }

  function validateValue(val, unit) {
    if (is.col(val)) { return colorToRgb(val); }
    if (/\s/g.test(val)) { return val; }
    var originalUnit = getUnit(val);
    var unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
    if (unit) { return unitLess + unit; }
    return unitLess;
  }

  // getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
  // adapted from https://gist.github.com/SebLambla/3e0550c496c236709744

  function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  function getCircleLength(el) {
    return Math.PI * 2 * getAttribute(el, 'r');
  }

  function getRectLength(el) {
    return (getAttribute(el, 'width') * 2) + (getAttribute(el, 'height') * 2);
  }

  function getLineLength(el) {
    return getDistance(
      {x: getAttribute(el, 'x1'), y: getAttribute(el, 'y1')}, 
      {x: getAttribute(el, 'x2'), y: getAttribute(el, 'y2')}
    );
  }

  function getPolylineLength(el) {
    var points = el.points;
    var totalLength = 0;
    var previousPos;
    for (var i = 0 ; i < points.numberOfItems; i++) {
      var currentPos = points.getItem(i);
      if (i > 0) { totalLength += getDistance(previousPos, currentPos); }
      previousPos = currentPos;
    }
    return totalLength;
  }

  function getPolygonLength(el) {
    var points = el.points;
    return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
  }

  // Path animation

  function getTotalLength(el) {
    if (el.getTotalLength) { return el.getTotalLength(); }
    switch(el.tagName.toLowerCase()) {
      case 'circle': return getCircleLength(el);
      case 'rect': return getRectLength(el);
      case 'line': return getLineLength(el);
      case 'polyline': return getPolylineLength(el);
      case 'polygon': return getPolygonLength(el);
    }
  }

  function setDashoffset(el) {
    var pathLength = getTotalLength(el);
    el.setAttribute('stroke-dasharray', pathLength);
    return pathLength;
  }

  // Motion path

  function getParentSvgEl(el) {
    var parentEl = el.parentNode;
    while (is.svg(parentEl)) {
      if (!is.svg(parentEl.parentNode)) { break; }
      parentEl = parentEl.parentNode;
    }
    return parentEl;
  }

  function getParentSvg(pathEl, svgData) {
    var svg = svgData || {};
    var parentSvgEl = svg.el || getParentSvgEl(pathEl);
    var rect = parentSvgEl.getBoundingClientRect();
    var viewBoxAttr = getAttribute(parentSvgEl, 'viewBox');
    var width = rect.width;
    var height = rect.height;
    var viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
    return {
      el: parentSvgEl,
      viewBox: viewBox,
      x: viewBox[0] / 1,
      y: viewBox[1] / 1,
      w: width,
      h: height,
      vW: viewBox[2],
      vH: viewBox[3]
    }
  }

  function getPath(path, percent) {
    var pathEl = is.str(path) ? selectString(path)[0] : path;
    var p = percent || 100;
    return function(property) {
      return {
        property: property,
        el: pathEl,
        svg: getParentSvg(pathEl),
        totalLength: getTotalLength(pathEl) * (p / 100)
      }
    }
  }

  function getPathProgress(path, progress, isPathTargetInsideSVG) {
    function point(offset) {
      if ( offset === void 0 ) offset = 0;

      var l = progress + offset >= 1 ? progress + offset : 0;
      return path.el.getPointAtLength(l);
    }
    var svg = getParentSvg(path.el, path.svg);
    var p = point();
    var p0 = point(-1);
    var p1 = point(+1);
    var scaleX = isPathTargetInsideSVG ? 1 : svg.w / svg.vW;
    var scaleY = isPathTargetInsideSVG ? 1 : svg.h / svg.vH;
    switch (path.property) {
      case 'x': return (p.x - svg.x) * scaleX;
      case 'y': return (p.y - svg.y) * scaleY;
      case 'angle': return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
    }
  }

  // Decompose value

  function decomposeValue(val, unit) {
    // const rgx = /-?\d*\.?\d+/g; // handles basic numbers
    // const rgx = /[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
    var rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
    var value = validateValue((is.pth(val) ? val.totalLength : val), unit) + '';
    return {
      original: value,
      numbers: value.match(rgx) ? value.match(rgx).map(Number) : [0],
      strings: (is.str(val) || unit) ? value.split(rgx) : []
    }
  }

  // Animatables

  function parseTargets(targets) {
    var targetsArray = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
    return filterArray(targetsArray, function (item, pos, self) { return self.indexOf(item) === pos; });
  }

  function getAnimatables(targets) {
    var parsed = parseTargets(targets);
    return parsed.map(function (t, i) {
      return {target: t, id: i, total: parsed.length, transforms: { list: getElementTransforms(t) } };
    });
  }

  // Properties

  function normalizePropertyTweens(prop, tweenSettings) {
    var settings = cloneObject(tweenSettings);
    // Override duration if easing is a spring
    if (/^spring/.test(settings.easing)) { settings.duration = spring(settings.easing); }
    if (is.arr(prop)) {
      var l = prop.length;
      var isFromTo = (l === 2 && !is.obj(prop[0]));
      if (!isFromTo) {
        // Duration divided by the number of tweens
        if (!is.fnc(tweenSettings.duration)) { settings.duration = tweenSettings.duration / l; }
      } else {
        // Transform [from, to] values shorthand to a valid tween value
        prop = {value: prop};
      }
    }
    var propArray = is.arr(prop) ? prop : [prop];
    return propArray.map(function (v, i) {
      var obj = (is.obj(v) && !is.pth(v)) ? v : {value: v};
      // Default delay value should only be applied to the first tween
      if (is.und(obj.delay)) { obj.delay = !i ? tweenSettings.delay : 0; }
      // Default endDelay value should only be applied to the last tween
      if (is.und(obj.endDelay)) { obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0; }
      return obj;
    }).map(function (k) { return mergeObjects(k, settings); });
  }


  function flattenKeyframes(keyframes) {
    var propertyNames = filterArray(flattenArray(keyframes.map(function (key) { return Object.keys(key); })), function (p) { return is.key(p); })
    .reduce(function (a,b) { if (a.indexOf(b) < 0) { a.push(b); } return a; }, []);
    var properties = {};
    var loop = function ( i ) {
      var propName = propertyNames[i];
      properties[propName] = keyframes.map(function (key) {
        var newKey = {};
        for (var p in key) {
          if (is.key(p)) {
            if (p == propName) { newKey.value = key[p]; }
          } else {
            newKey[p] = key[p];
          }
        }
        return newKey;
      });
    };

    for (var i = 0; i < propertyNames.length; i++) loop( i );
    return properties;
  }

  function getProperties(tweenSettings, params) {
    var properties = [];
    var keyframes = params.keyframes;
    if (keyframes) { params = mergeObjects(flattenKeyframes(keyframes), params); }
    for (var p in params) {
      if (is.key(p)) {
        properties.push({
          name: p,
          tweens: normalizePropertyTweens(params[p], tweenSettings)
        });
      }
    }
    return properties;
  }

  // Tweens

  function normalizeTweenValues(tween, animatable) {
    var t = {};
    for (var p in tween) {
      var value = getFunctionValue(tween[p], animatable);
      if (is.arr(value)) {
        value = value.map(function (v) { return getFunctionValue(v, animatable); });
        if (value.length === 1) { value = value[0]; }
      }
      t[p] = value;
    }
    t.duration = parseFloat(t.duration);
    t.delay = parseFloat(t.delay);
    return t;
  }

  function normalizeTweens(prop, animatable) {
    var previousTween;
    return prop.tweens.map(function (t) {
      var tween = normalizeTweenValues(t, animatable);
      var tweenValue = tween.value;
      var to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
      var toUnit = getUnit(to);
      var originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
      var previousValue = previousTween ? previousTween.to.original : originalValue;
      var from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
      var fromUnit = getUnit(from) || getUnit(originalValue);
      var unit = toUnit || fromUnit;
      if (is.und(to)) { to = previousValue; }
      tween.from = decomposeValue(from, unit);
      tween.to = decomposeValue(getRelativeValue(to, from), unit);
      tween.start = previousTween ? previousTween.end : 0;
      tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
      tween.easing = parseEasings(tween.easing, tween.duration);
      tween.isPath = is.pth(tweenValue);
      tween.isPathTargetInsideSVG = tween.isPath && is.svg(animatable.target);
      tween.isColor = is.col(tween.from.original);
      if (tween.isColor) { tween.round = 1; }
      previousTween = tween;
      return tween;
    });
  }

  // Tween progress

  var setProgressValue = {
    css: function (t, p, v) { return t.style[p] = v; },
    attribute: function (t, p, v) { return t.setAttribute(p, v); },
    object: function (t, p, v) { return t[p] = v; },
    transform: function (t, p, v, transforms, manual) {
      transforms.list.set(p, v);
      if (p === transforms.last || manual) {
        var str = '';
        transforms.list.forEach(function (value, prop) { str += prop + "(" + value + ") "; });
        t.style.transform = str;
      }
    }
  };

  // Set Value helper

  function setTargetsValue(targets, properties) {
    var animatables = getAnimatables(targets);
    animatables.forEach(function (animatable) {
      for (var property in properties) {
        var value = getFunctionValue(properties[property], animatable);
        var target = animatable.target;
        var valueUnit = getUnit(value);
        var originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
        var unit = valueUnit || getUnit(originalValue);
        var to = getRelativeValue(validateValue(value, unit), originalValue);
        var animType = getAnimationType(target, property);
        setProgressValue[animType](target, property, to, animatable.transforms, true);
      }
    });
  }

  // Animations

  function createAnimation(animatable, prop) {
    var animType = getAnimationType(animatable.target, prop.name);
    if (animType) {
      var tweens = normalizeTweens(prop, animatable);
      var lastTween = tweens[tweens.length - 1];
      return {
        type: animType,
        property: prop.name,
        animatable: animatable,
        tweens: tweens,
        duration: lastTween.end,
        delay: tweens[0].delay,
        endDelay: lastTween.endDelay
      }
    }
  }

  function getAnimations(animatables, properties) {
    return filterArray(flattenArray(animatables.map(function (animatable) {
      return properties.map(function (prop) {
        return createAnimation(animatable, prop);
      });
    })), function (a) { return !is.und(a); });
  }

  // Create Instance

  function getInstanceTimings(animations, tweenSettings) {
    var animLength = animations.length;
    var getTlOffset = function (anim) { return anim.timelineOffset ? anim.timelineOffset : 0; };
    var timings = {};
    timings.duration = animLength ? Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration; })) : tweenSettings.duration;
    timings.delay = animLength ? Math.min.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.delay; })) : tweenSettings.delay;
    timings.endDelay = animLength ? timings.duration - Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration - anim.endDelay; })) : tweenSettings.endDelay;
    return timings;
  }

  var instanceID = 0;

  function createNewInstance(params) {
    var instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
    var tweenSettings = replaceObjectProps(defaultTweenSettings, params);
    var properties = getProperties(tweenSettings, params);
    var animatables = getAnimatables(params.targets);
    var animations = getAnimations(animatables, properties);
    var timings = getInstanceTimings(animations, tweenSettings);
    var id = instanceID;
    instanceID++;
    return mergeObjects(instanceSettings, {
      id: id,
      children: [],
      animatables: animatables,
      animations: animations,
      duration: timings.duration,
      delay: timings.delay,
      endDelay: timings.endDelay
    });
  }

  // Core

  var activeInstances = [];

  var engine = (function () {
    var raf;

    function play() {
      if (!raf && (!isDocumentHidden() || !anime.suspendWhenDocumentHidden) && activeInstances.length > 0) {
        raf = requestAnimationFrame(step);
      }
    }
    function step(t) {
      // memo on algorithm issue:
      // dangerous iteration over mutable `activeInstances`
      // (that collection may be updated from within callbacks of `tick`-ed animation instances)
      var activeInstancesLength = activeInstances.length;
      var i = 0;
      while (i < activeInstancesLength) {
        var activeInstance = activeInstances[i];
        if (!activeInstance.paused) {
          activeInstance.tick(t);
          i++;
        } else {
          activeInstances.splice(i, 1);
          activeInstancesLength--;
        }
      }
      raf = i > 0 ? requestAnimationFrame(step) : undefined;
    }

    function handleVisibilityChange() {
      if (!anime.suspendWhenDocumentHidden) { return; }

      if (isDocumentHidden()) {
        // suspend ticks
        raf = cancelAnimationFrame(raf);
      } else { // is back to active tab
        // first adjust animations to consider the time that ticks were suspended
        activeInstances.forEach(
          function (instance) { return instance ._onDocumentVisibility(); }
        );
        engine();
      }
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return play;
  })();

  function isDocumentHidden() {
    return !!document && document.hidden;
  }

  // Public Instance

  function anime(params) {
    if ( params === void 0 ) params = {};


    var startTime = 0, lastTime = 0, now = 0;
    var children, childrenLength = 0;
    var resolve = null;

    function makePromise(instance) {
      var promise = window.Promise && new Promise(function (_resolve) { return resolve = _resolve; });
      instance.finished = promise;
      return promise;
    }

    var instance = createNewInstance(params);
    makePromise(instance);

    function toggleInstanceDirection() {
      var direction = instance.direction;
      if (direction !== 'alternate') {
        instance.direction = direction !== 'normal' ? 'normal' : 'reverse';
      }
      instance.reversed = !instance.reversed;
      children.forEach(function (child) { return child.reversed = instance.reversed; });
    }

    function adjustTime(time) {
      return instance.reversed ? instance.duration - time : time;
    }

    function resetTime() {
      startTime = 0;
      lastTime = adjustTime(instance.currentTime) * (1 / anime.speed);
    }

    function seekChild(time, child) {
      if (child) { child.seek(time - child.timelineOffset); }
    }

    function syncInstanceChildren(time) {
      if (!instance.reversePlayback) {
        for (var i = 0; i < childrenLength; i++) { seekChild(time, children[i]); }
      } else {
        for (var i$1 = childrenLength; i$1--;) { seekChild(time, children[i$1]); }
      }
    }

    function setAnimationsProgress(insTime) {
      var i = 0;
      var animations = instance.animations;
      var animationsLength = animations.length;
      while (i < animationsLength) {
        var anim = animations[i];
        var animatable = anim.animatable;
        var tweens = anim.tweens;
        var tweenLength = tweens.length - 1;
        var tween = tweens[tweenLength];
        // Only check for keyframes if there is more than one tween
        if (tweenLength) { tween = filterArray(tweens, function (t) { return (insTime < t.end); })[0] || tween; }
        var elapsed = minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
        var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
        var strings = tween.to.strings;
        var round = tween.round;
        var numbers = [];
        var toNumbersLength = tween.to.numbers.length;
        var progress = (void 0);
        for (var n = 0; n < toNumbersLength; n++) {
          var value = (void 0);
          var toNumber = tween.to.numbers[n];
          var fromNumber = tween.from.numbers[n] || 0;
          if (!tween.isPath) {
            value = fromNumber + (eased * (toNumber - fromNumber));
          } else {
            value = getPathProgress(tween.value, eased * toNumber, tween.isPathTargetInsideSVG);
          }
          if (round) {
            if (!(tween.isColor && n > 2)) {
              value = Math.round(value * round) / round;
            }
          }
          numbers.push(value);
        }
        // Manual Array.reduce for better performances
        var stringsLength = strings.length;
        if (!stringsLength) {
          progress = numbers[0];
        } else {
          progress = strings[0];
          for (var s = 0; s < stringsLength; s++) {
            strings[s];
            var b = strings[s + 1];
            var n$1 = numbers[s];
            if (!isNaN(n$1)) {
              if (!b) {
                progress += n$1 + ' ';
              } else {
                progress += n$1 + b;
              }
            }
          }
        }
        setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
        anim.currentValue = progress;
        i++;
      }
    }

    function setCallback(cb) {
      if (instance[cb] && !instance.passThrough) { instance[cb](instance); }
    }

    function countIteration() {
      if (instance.remaining && instance.remaining !== true) {
        instance.remaining--;
      }
    }

    function setInstanceProgress(engineTime) {
      var insDuration = instance.duration;
      var insDelay = instance.delay;
      var insEndDelay = insDuration - instance.endDelay;
      var insTime = adjustTime(engineTime);
      instance.progress = minMax((insTime / insDuration) * 100, 0, 100);
      instance.reversePlayback = insTime < instance.currentTime;
      if (children) { syncInstanceChildren(insTime); }
      if (!instance.began && instance.currentTime > 0) {
        instance.began = true;
        setCallback('begin');
      }
      if (!instance.loopBegan && instance.currentTime > 0) {
        instance.loopBegan = true;
        setCallback('loopBegin');
      }
      if (insTime <= insDelay && instance.currentTime !== 0) {
        setAnimationsProgress(0);
      }
      if ((insTime >= insEndDelay && instance.currentTime !== insDuration) || !insDuration) {
        setAnimationsProgress(insDuration);
      }
      if (insTime > insDelay && insTime < insEndDelay) {
        if (!instance.changeBegan) {
          instance.changeBegan = true;
          instance.changeCompleted = false;
          setCallback('changeBegin');
        }
        setCallback('change');
        setAnimationsProgress(insTime);
      } else {
        if (instance.changeBegan) {
          instance.changeCompleted = true;
          instance.changeBegan = false;
          setCallback('changeComplete');
        }
      }
      instance.currentTime = minMax(insTime, 0, insDuration);
      if (instance.began) { setCallback('update'); }
      if (engineTime >= insDuration) {
        lastTime = 0;
        countIteration();
        if (!instance.remaining) {
          instance.paused = true;
          if (!instance.completed) {
            instance.completed = true;
            setCallback('loopComplete');
            setCallback('complete');
            if (!instance.passThrough && 'Promise' in window) {
              resolve();
              makePromise(instance);
            }
          }
        } else {
          startTime = now;
          setCallback('loopComplete');
          instance.loopBegan = false;
          if (instance.direction === 'alternate') {
            toggleInstanceDirection();
          }
        }
      }
    }

    instance.reset = function() {
      var direction = instance.direction;
      instance.passThrough = false;
      instance.currentTime = 0;
      instance.progress = 0;
      instance.paused = true;
      instance.began = false;
      instance.loopBegan = false;
      instance.changeBegan = false;
      instance.completed = false;
      instance.changeCompleted = false;
      instance.reversePlayback = false;
      instance.reversed = direction === 'reverse';
      instance.remaining = instance.loop;
      children = instance.children;
      childrenLength = children.length;
      for (var i = childrenLength; i--;) { instance.children[i].reset(); }
      if (instance.reversed && instance.loop !== true || (direction === 'alternate' && instance.loop === 1)) { instance.remaining++; }
      setAnimationsProgress(instance.reversed ? instance.duration : 0);
    };

    // internal method (for engine) to adjust animation timings before restoring engine ticks (rAF)
    instance._onDocumentVisibility = resetTime;

    // Set Value helper

    instance.set = function(targets, properties) {
      setTargetsValue(targets, properties);
      return instance;
    };

    instance.tick = function(t) {
      now = t;
      if (!startTime) { startTime = now; }
      setInstanceProgress((now + (lastTime - startTime)) * anime.speed);
    };

    instance.seek = function(time) {
      setInstanceProgress(adjustTime(time));
    };

    instance.pause = function() {
      instance.paused = true;
      resetTime();
    };

    instance.play = function() {
      if (!instance.paused) { return; }
      if (instance.completed) { instance.reset(); }
      instance.paused = false;
      activeInstances.push(instance);
      resetTime();
      engine();
    };

    instance.reverse = function() {
      toggleInstanceDirection();
      instance.completed = instance.reversed ? false : true;
      resetTime();
    };

    instance.restart = function() {
      instance.reset();
      instance.play();
    };

    instance.remove = function(targets) {
      var targetsArray = parseTargets(targets);
      removeTargetsFromInstance(targetsArray, instance);
    };

    instance.reset();

    if (instance.autoplay) { instance.play(); }

    return instance;

  }

  // Remove targets from animation

  function removeTargetsFromAnimations(targetsArray, animations) {
    for (var a = animations.length; a--;) {
      if (arrayContains(targetsArray, animations[a].animatable.target)) {
        animations.splice(a, 1);
      }
    }
  }

  function removeTargetsFromInstance(targetsArray, instance) {
    var animations = instance.animations;
    var children = instance.children;
    removeTargetsFromAnimations(targetsArray, animations);
    for (var c = children.length; c--;) {
      var child = children[c];
      var childAnimations = child.animations;
      removeTargetsFromAnimations(targetsArray, childAnimations);
      if (!childAnimations.length && !child.children.length) { children.splice(c, 1); }
    }
    if (!animations.length && !children.length) { instance.pause(); }
  }

  function removeTargetsFromActiveInstances(targets) {
    var targetsArray = parseTargets(targets);
    for (var i = activeInstances.length; i--;) {
      var instance = activeInstances[i];
      removeTargetsFromInstance(targetsArray, instance);
    }
  }

  // Stagger helpers

  function stagger(val, params) {
    if ( params === void 0 ) params = {};

    var direction = params.direction || 'normal';
    var easing = params.easing ? parseEasings(params.easing) : null;
    var grid = params.grid;
    var axis = params.axis;
    var fromIndex = params.from || 0;
    var fromFirst = fromIndex === 'first';
    var fromCenter = fromIndex === 'center';
    var fromLast = fromIndex === 'last';
    var isRange = is.arr(val);
    var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
    var val2 = isRange ? parseFloat(val[1]) : 0;
    var unit = getUnit(isRange ? val[1] : val) || 0;
    var start = params.start || 0 + (isRange ? val1 : 0);
    var values = [];
    var maxValue = 0;
    return function (el, i, t) {
      if (fromFirst) { fromIndex = 0; }
      if (fromCenter) { fromIndex = (t - 1) / 2; }
      if (fromLast) { fromIndex = t - 1; }
      if (!values.length) {
        for (var index = 0; index < t; index++) {
          if (!grid) {
            values.push(Math.abs(fromIndex - index));
          } else {
            var fromX = !fromCenter ? fromIndex%grid[0] : (grid[0]-1)/2;
            var fromY = !fromCenter ? Math.floor(fromIndex/grid[0]) : (grid[1]-1)/2;
            var toX = index%grid[0];
            var toY = Math.floor(index/grid[0]);
            var distanceX = fromX - toX;
            var distanceY = fromY - toY;
            var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            if (axis === 'x') { value = -distanceX; }
            if (axis === 'y') { value = -distanceY; }
            values.push(value);
          }
          maxValue = Math.max.apply(Math, values);
        }
        if (easing) { values = values.map(function (val) { return easing(val / maxValue) * maxValue; }); }
        if (direction === 'reverse') { values = values.map(function (val) { return axis ? (val < 0) ? val * -1 : -val : Math.abs(maxValue - val); }); }
      }
      var spacing = isRange ? (val2 - val1) / maxValue : val1;
      return start + (spacing * (Math.round(values[i] * 100) / 100)) + unit;
    }
  }

  // Timeline

  function timeline(params) {
    if ( params === void 0 ) params = {};

    var tl = anime(params);
    tl.duration = 0;
    tl.add = function(instanceParams, timelineOffset) {
      var tlIndex = activeInstances.indexOf(tl);
      var children = tl.children;
      if (tlIndex > -1) { activeInstances.splice(tlIndex, 1); }
      function passThrough(ins) { ins.passThrough = true; }
      for (var i = 0; i < children.length; i++) { passThrough(children[i]); }
      var insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
      insParams.targets = insParams.targets || params.targets;
      var tlDuration = tl.duration;
      insParams.autoplay = false;
      insParams.direction = tl.direction;
      insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
      passThrough(tl);
      tl.seek(insParams.timelineOffset);
      var ins = anime(insParams);
      passThrough(ins);
      children.push(ins);
      var timings = getInstanceTimings(children, params);
      tl.delay = timings.delay;
      tl.endDelay = timings.endDelay;
      tl.duration = timings.duration;
      tl.seek(0);
      tl.reset();
      if (tl.autoplay) { tl.play(); }
      return tl;
    };
    return tl;
  }

  anime.version = '3.2.1';
  anime.speed = 1;
  // TODO:#review: naming, documentation
  anime.suspendWhenDocumentHidden = true;
  anime.running = activeInstances;
  anime.remove = removeTargetsFromActiveInstances;
  anime.get = getOriginalTargetValue;
  anime.set = setTargetsValue;
  anime.convertPx = convertPxToUnit;
  anime.path = getPath;
  anime.setDashoffset = setDashoffset;
  anime.stagger = stagger;
  anime.timeline = timeline;
  anime.easing = parseEasings;
  anime.penner = penner;
  anime.random = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };

  function menu() {
    var overlay = document.querySelector('.overlay');
    var navigation = document.querySelector('.navegacion');
    var body = document.querySelector('body');
    var elementBtn = document.querySelectorAll('.navegacion-btn');
    var burger = document.querySelector('.burger');

    function classToggle() {
      burger.classList.toggle('clicked');
      overlay.classList.toggle('show');
      navigation.classList.toggle('show');
      body.classList.toggle('overflow');
    }

    document.querySelector('.burger').addEventListener('click', classToggle);
    document.querySelector('.overlay').addEventListener('click', classToggle);

    for (var index = 0; index < elementBtn.length; index++) {
      elementBtn[index].addEventListener('click', function () {
        removeClass();
      });
    }

    function removeClass() {
      overlay.classList.remove('show');
      navigation.classList.remove('show');
      burger.classList.remove('clicked');
    }
  }

  var widthMobile = window.innerWidth > 0 ? window.innerWidth : screen.width;

  function changeLanguage() {
    var ara = document.querySelector('#aragones');
    var cas = document.querySelector('#castellano');
    var araDiv = document.querySelector('.aragones');
    var casDiv = document.querySelector('.castellano');

    ara.onclick = function () {
      casDiv.classList.remove('active');
      araDiv.classList.remove('hidden');
      araDiv.classList.toggle('active');
      casDiv.classList.toggle('hidden');
      ara.classList.remove('active');
      cas.classList.remove('hidden');
      ara.classList.toggle('hidden');
      cas.classList.toggle('active');
    };

    cas.onclick = function () {
      araDiv.classList.remove('active');
      casDiv.classList.remove('hidden');
      casDiv.classList.toggle('active');
      araDiv.classList.toggle('hidden');
      cas.classList.remove('active');
      ara.classList.remove('hidden');
      cas.classList.toggle('hidden');
      ara.classList.toggle('active');
    };
  }

  function animation() {
    anime.timeline().add({
      targets: '.header-title .letter',
      translateY: [0, '1.5rem'],
      translateZ: 0,
      duration: 750,
      delay: anime.stagger(500)
    }).add({
      targets: '.letter',
      translateY: ['1.5rem', '2rem'],
      translateZ: 0,
      rotate: 45,
      duration: 750,
      delay: anime.stagger(1000)
    });
  }

  changeLanguage();
  setTimeout(animation(), 1000);

  function scatterDesert() {
    var margin = {
      top: 24,
      right: 24,
      bottom: 48,
      left: 72
    };
    var width = 0;
    var height = 0;
    var w = 0;
    var h = 0;
    var chart = d3.select('.scatter-desert');
    var svg = chart.select('svg');
    var scales = {};
    var habitantes = ' hab/km2';
    var dataz;

    function setupScales() {
      var countX = d3.scaleLinear().domain([d3.min(dataz, function (d) {
        return d.densidad;
      }), d3.max(dataz, function (d) {
        return d.densidad;
      })]);
      var countY = d3.scaleLinear().domain([d3.min(dataz, function (d) {
        return d.densidad;
      }), d3.max(dataz, function (d) {
        return d.densidad;
      })]);
      scales.count = {
        x: countX,
        y: countY
      };
    }

    function setupElements() {
      var g = svg.select('.scatter-desert-container');
      g.append('g').attr('class', 'axis axis-x');
      g.append('g').attr('class', 'axis axis-y');
      g.append('g').attr('class', 'scatter-desert-container-bis');
      g.append('circle').attr('r', 3).attr('fill', '#B41248').attr('cy', '94%').attr('cx', '4%');
      g.append('text').text('Municipios con una densidad inferior a 10hab/km2').attr('y', '95%').attr('x', '5%');
    }

    function updateScales(width, height) {
      scales.count.x.range([0, width]);
      scales.count.y.range([height, 0]);
    }

    function drawAxes(g) {
      var axisX = d3.axisBottom(scales.count.x).tickFormat(d3.format('d')).ticks(0);
      g.select('.axis-x').attr('transform', "translate(0,".concat(height, ")")).call(axisX);
      var axisY = d3.axisLeft(scales.count.y).tickFormat(function (d) {
        return d + habitantes;
      }).tickSize(-width).ticks(10);
      g.select('.axis-y').call(axisY);
    }

    function updateChart(dataz) {
      w = chart.node().offsetWidth;
      h = 600;
      width = w - margin.left - margin.right;
      height = h - margin.top - margin.bottom;
      svg.attr('width', w).attr('height', h);
      var translate = "translate(".concat(margin.left, ",").concat(margin.top, ")");
      var g = svg.select('.scatter-desert-container');
      g.attr('transform', translate);
      updateScales(width, height);
      var container = chart.select('.scatter-desert-container-bis');
      var layer = container.selectAll('.circle-desert').data(dataz);
      var newLayer = layer.enter().append('circle').attr('class', 'circle-desert');
      layer.merge(newLayer).attr('cx', function (d) {
        return Math.random() * width;
      }).attr('cy', function (d) {
        return scales.count.y(d.densidad);
      }).attr('r', 3).attr('fill', function (d) {
        return d.densidad >= 10 ? '#3b2462' : '#B41248';
      }).attr('fill-opacity', 0.8);
      drawAxes(g);
    }

    function resize() {
      updateChart(dataz);
    }

    function loadData() {
      d3.csv('data/aragon-municipios.csv').then(function (data) {
        dataz = data;
        setupElements();
        setupScales();
        updateChart(dataz);
      });
    }

    window.addEventListener('resize', resize);
    loadData();
  }

  function aragonStack() {
    var margin = {
      top: 24,
      right: 8,
      bottom: 24,
      left: 32
    };
    var width = 0;
    var height = 0;
    var chart = d3.select('.aragon-stack');
    var svg = chart.select('svg');
    var scales = {};
    var dataz;
    var bisectDate = d3.bisector(function (d) {
      return d.year;
    }).left;
    var tooltipStack = chart.append('div').attr('class', 'tooltip tooltip-stack').style('opacity', 0);

    function setupScales() {
      var countX = d3.scaleTime().domain(d3.extent(dataz, function (d) {
        return d.year;
      }));
      var countY = d3.scaleLinear().domain([0, 100]);
      scales.count = {
        x: countX,
        y: countY
      };
    }

    function setupElements() {
      var g = svg.select('.aragon-stack-container');
      g.append('g').attr('class', 'axis axis-x');
      g.append('g').attr('class', 'axis axis-y');
      g.append('g').attr('class', 'aragon-stack-container-bis');
      g.append('text').attr('class', 'legend-aragon').attr('y', '70%').attr('x', '1%').text('Zaragoza');
      g.append('text').attr('class', 'legend-aragon').attr('y', '5%').attr('x', '1%').text('Huesca');
      g.append('text').attr('class', 'legend-aragon').attr('y', '30%').attr('x', '1%').text('Teruel');
    }

    function updateScales(width, height) {
      scales.count.x.range([0, width]);
      scales.count.y.range([height, 0]);
    }

    function drawAxes(g) {
      var axisX = d3.axisBottom(scales.count.x).tickFormat(d3.format('d')).tickPadding(7).ticks(9);
      g.select('.axis-x').attr('transform', "translate(0,".concat(height, ")")).call(axisX);
      var axisY = d3.axisLeft(scales.count.y).tickFormat(function (d) {
        return d + '%';
      }).tickSizeInner(-width).ticks(12);
      g.select('.axis-y').call(axisY);
    }

    function updateChart(dataz) {
      var w = chart.node().offsetWidth;
      var h = 600;
      width = w - margin.left - margin.right;
      height = h - margin.top - margin.bottom;
      svg.attr('width', w).attr('height', h);
      var translate = "translate(".concat(margin.left, ",").concat(margin.top, ")");
      var g = svg.select('.aragon-stack-container');
      g.attr('transform', translate);
      g.append('rect').attr('class', 'overlay-dos');
      g.append('g').attr('class', 'focus').style('display', 'none').append('line').attr('class', 'x-hover-line hover-line').attr('y1', 0);
      var keys = dataz.columns.slice(5);
      var area = d3.area().x(function (d) {
        return scales.count.x(d.data.year);
      }).y0(function (d) {
        return scales.count.y(d[0]);
      }).y1(function (d) {
        return scales.count.y(d[1]);
      }).curve(d3.curveCardinal.tension(0.6));
      var stack = d3.stack().keys(keys).order(d3.stackOrderInsideOut);
      var stackedData = stack(dataz);
      var colors = d3.scaleOrdinal().domain(keys).range(['#F67460', '#C54073', '#5A1C7C']);
      updateScales(width, height);
      var container = chart.select('.aragon-stack-container-bis');
      var layer = container.selectAll('.area-stack').data(stackedData);
      var newLayer = layer.enter().append('path').attr('class', 'area-stack');
      layer.merge(newLayer).transition().duration(600).ease(d3.easeLinear).attr('fill', function (d) {
        return colors(d.key);
      }).attr('d', area);
      var focus = g.select('.focus');
      var overlay = g.select('.overlay-dos');
      focus.select('.x-hover-line').attr('y2', height);
      overlay.attr('width', width + margin.left + margin.right).attr('height', height).on('mouseover', function () {
        focus.style('display', null);
      }).on('mouseout', function () {
        focus.style('display', 'none');
        tooltipStack.style('opacity', 0);
      }).on('mousemove', mousemove);

      function mousemove() {
        var w = chart.node().offsetWidth;
        var x0 = scales.count.x.invert(d3.mouse(this)[0]),
            i = bisectDate(dataz, x0, 1),
            d0 = dataz[i - 1],
            d1 = dataz[i],
            d = x0 - d0.year > d1.year - x0 ? d1 : d0;
        var positionX = scales.count.x(d.year) + 33;
        var postionWidthTooltip = positionX + 200;
        var positionRightTooltip = w - positionX;
        tooltipStack.style('opacity', 1).html("\n          <span class=\"tooltip-stack-number tooltip-stack-text\">".concat(d.year, "</span>\n          <span class=\"tooltip-stack-text\">Huesca: <span class=\"tooltip-number\">").concat(d.huescaP, "% - ").concat(d.huesca, " hab.</span></span>\n          <span class=\"tooltip-stack-text\">Teruel: <span class=\"tooltip-number\">").concat(d.teruelP, "% - ").concat(d.teruel, " hab.</span></span>\n          <span class=\"tooltip-stack-text\">Zaragoza: <span class=\"tooltip-number\">").concat(d.zaragozaP, "% - ").concat(d.zaragoza, " hab.</span></span>\n          <span class=\"tooltip-stack-text\">Total: <span class=\"tooltip-number\">").concat(d.aragon, " hab.</span></span>\n          ")).style('top', '35%').style('left', postionWidthTooltip > w ? 'auto' : positionX + 'px').style('right', postionWidthTooltip > w ? positionRightTooltip + 'px' : 'auto');
        focus.select('.x-hover-line').attr('transform', "translate(".concat(scales.count.x(d.year), ",0)"));
      }

      drawAxes(g);
    }

    function resize() {
      updateChart(dataz);
    }

    function loadData() {
      d3.csv('data/aragon-total.csv').then(function (data) {
        dataz = data;
        setupElements();
        setupScales();
        updateChart(dataz);
      });
    }

    window.addEventListener('resize', resize);
    loadData();
  }

  function line(csvFile, cities) {
    var margin = {
      top: 8,
      right: 8,
      bottom: 24,
      left: 8
    };
    var width = 0;
    var height = 0;
    var chart = d3.select(".line-".concat(cities));
    var svg = chart.select('svg');
    var scales = {};
    var dataz;
    var habitantes = 'hab';
    var containerTooltip = d3.select(".line-province-".concat(cities));
    var tooltipPopulation = containerTooltip.append('div').attr('class', 'tooltip tooltip-population').style('opacity', 0);
    var locale = d3.formatDefaultLocale({
      decimal: ',',
      thousands: '.',
      grouping: [3]
    });

    function setupScales() {
      var countX = d3.scaleTime().domain([d3.min(dataz, function (d) {
        return d.year;
      }), d3.max(dataz, function (d) {
        return d.year;
      })]);
      var countY = d3.scaleLinear().domain([d3.min(dataz, function (d) {
        return d.total / 1.25;
      }), d3.max(dataz, function (d) {
        return d.total * 1.25;
      })]);
      scales.count = {
        x: countX,
        y: countY
      };
    }

    function setupElements() {
      var g = svg.select(".line-".concat(cities, "-container"));
      g.append('g').attr('class', 'axis axis-x');
      g.append('g').attr('class', 'axis axis-y');
      g.append('g').attr('class', "line-".concat(cities, "-container-bis"));
    }

    function updateScales(width, height) {
      scales.count.x.range([90, width]);
      scales.count.y.range([height, 0]);
    }

    function drawAxes(g) {
      var axisX = d3.axisBottom(scales.count.x).tickFormat(d3.format('d')).ticks(9);
      g.select('.axis-x').attr('transform', "translate(0,".concat(height, ")")).call(axisX);
      var localeFormat = locale.format(',.0f');
      var axisY = d3.axisLeft(scales.count.y).tickFormat(function (d) {
        return "".concat(localeFormat(d), " ").concat(habitantes);
      }).ticks(6).tickSizeInner(-width);
      g.select('.axis-y').call(axisY);
      g.selectAll('.axis-y .tick text').attr('x', 80).attr('dy', -5);
    }

    function updateChart(dataz) {
      var w = chart.node().offsetWidth;
      var h = 550;
      width = w - margin.left - margin.right;
      height = h - margin.top - margin.bottom;
      svg.attr('width', w).attr('height', h);
      var translate = "translate(".concat(margin.left, ",").concat(margin.top, ")");
      var g = svg.select(".line-".concat(cities, "-container"));
      g.attr('transform', translate);
      var line = d3.line().x(function (d) {
        return scales.count.x(d.year);
      }).y(function (d) {
        return scales.count.y(d.total);
      });
      updateScales(width, height);
      var container = chart.select(".line-".concat(cities, "-container-bis"));
      var layer = container.selectAll('.line').data([dataz]);
      var newLayer = layer.enter().append('path').attr('class', 'line').attr('stroke-width', '1.5');
      var dots = container.selectAll('.circles').data(dataz);
      var dotsLayer = dots.enter().append('circle').attr('class', 'circles').attr('fill', '#531f4e');
      layer.merge(newLayer).attr('d', line);
      dots.merge(dotsLayer).on('mouseover', function (d) {
        var positionX = scales.count.x(d.year);
        var postionWidthTooltip = positionX + 270;
        var tooltipWidth = 210;
        var positionleft = "".concat(d3.event.pageX, "px");
        var positionright = "".concat(d3.event.pageX - tooltipWidth, "px");
        tooltipPopulation.transition();
        tooltipPopulation.style('opacity', 1).html("<p class=\"tooltip-deceased\">La poblaci\xF3n en <span class=\"tooltip-number\">".concat(d.year, "</span> era de <span class=\"tooltip-number\">").concat(d.total, "</span> habitantes<p/>")).style('left', postionWidthTooltip > w ? positionright : positionleft).style('top', "".concat(d3.event.pageY - 48, "px"));
      }).on('mouseout', function () {
        tooltipPopulation.transition().duration(200).style('opacity', 0);
      }).attr('cx', function (d) {
        return scales.count.x(d.year);
      }).attr('cy', function (d) {
        return scales.count.y(d.total);
      }).attr('r', 4);
      drawAxes(g);
    }

    function resize() {
      updateChart(dataz);
    }

    function loadData() {
      d3.csv(csvFile).then(function (data) {
        dataz = data;
        setupElements();
        setupScales();
        updateChart(dataz);
      });
    }

    window.addEventListener('resize', resize);
    loadData();
  }

  function barScatter(csvFile, cities) {
    var margin = {
      top: 0,
      right: 8,
      bottom: 64,
      left: 40
    };
    var width = 0;
    var height = 0;
    var w = 0;
    var h = 0;
    var chart = d3.select(".scatter-".concat(cities));
    var svg = chart.select('svg');
    var scales = {};
    var dataz;
    var symbolP = '%';
    var tooltip = chart.append('div').attr('class', 'tooltip tooltip-under-over').attr('id', 'tooltip-scatter').style('opacity', 0);

    function setupScales() {
      var countX = d3.scaleLinear().domain([0, 75]);
      var countY = d3.scaleLinear().domain([0, d3.max(dataz, function (d) {
        return d.menor * 1.75;
      })]);
      scales.count = {
        x: countX,
        y: countY
      };
    }

    function setupElements() {
      var g = svg.select(".scatter-".concat(cities, "-container"));
      g.append('g').attr('class', 'axis axis-x');
      g.append('g').attr('class', 'axis axis-y');
      g.append('g').attr('class', "scatter-".concat(cities, "-container-bis"));
      g.append('text').attr('class', 'legend').attr('y', '97%').attr('x', '35%').style('text-anchor', 'start').text('Mayores de 65 años');
      g.append('text').attr('class', 'legend').attr('x', '-350').attr('y', '-30').attr('transform', 'rotate(-90)').style('text-anchor', 'start').text('Menores de 18 años');
    }

    function updateScales(width, height) {
      scales.count.x.range([0, width]);
      scales.count.y.range([height, 20]);
    }

    function drawAxes(g) {
      var axisX = d3.axisBottom(scales.count.x).tickFormat(function (d) {
        return d + symbolP;
      }).tickPadding(11).ticks(10);
      g.select('.axis-x').attr('transform', "translate(0,".concat(height, ")")).call(axisX);
      var axisY = d3.axisLeft(scales.count.y).tickFormat(function (d) {
        return d + symbolP;
      }).tickSize(-width).ticks(5);
      g.select('.axis-y').call(axisY);
    }

    function updateChart(dataz) {
      w = chart.node().offsetWidth;
      h = 600;
      width = w - margin.left - margin.right;
      height = h - margin.top - margin.bottom;
      svg.attr('width', w).attr('height', h);
      var translate = "translate(".concat(margin.left, ",").concat(margin.top, ")");
      var g = svg.select(".scatter-".concat(cities, "-container"));
      g.attr('transform', translate);
      updateScales(width, height);
      var container = chart.select(".scatter-".concat(cities, "-container-bis"));
      var layer = container.selectAll('.scatter-circles').data(dataz);
      var newLayer = layer.enter().append('circle').attr('class', "scatter-".concat(cities, "-circles scatter-circles"));
      layer.merge(newLayer).on('mouseover', function (d) {
        tooltip.transition();
        tooltip.style('opacity', 1).html("<p class=\"tooltip-citi\">".concat(d.city, "<p/>\n            <p class=\"tooltip-population\">Habitantes: <span class=\"tooltip-number\">").concat(d.population, "</span><p/>\n            <p class=\"tooltip-over\">Mayores de 65: <span class=\"tooltip-number\">").concat(d.mayor, "%</span><p/>\n            <p class=\"tooltip-under\">Menores de 18: <span class=\"tooltip-number\">").concat(d.menor, "%</span><p/>\n            ")).style('left', w / 2 - 150 + 'px').style('top', 100 + 'px');
      }).on('mouseout', function (d) {
        tooltip.transition().duration(200).style('opacity', 0);
      }).attr('cx', function (d) {
        return scales.count.x(d.mayor);
      }).attr('cy', function (d) {
        return scales.count.y(d.menor);
      }).attr('r', 0).transition().duration(600).ease(d3.easeQuad).attr('cx', function (d) {
        return scales.count.x(d.mayor);
      }).attr('cy', function (d) {
        return scales.count.y(d.menor);
      }).attr('r', 6);
      drawAxes(g);
    }

    function clearFilter() {
      var selectButton = d3.select("#clear-filter-".concat(cities));
      selectButton.on('click', function () {
        d3.select("#percentage-over-city-".concat(cities, " option")).property('selected', '0');
        d3.select("#percentage-under-city-".concat(cities, " option")).property('selected', '0');
        d3.selectAll('.tooltip-percentage').remove().exit();
        new SlimSelect({
          select: "#percentage-over-city-".concat(cities),
          searchPlaceholder: 'Filtra tu municipio'
        });
        new SlimSelect({
          select: "#percentage-under-city-".concat(cities),
          searchPlaceholder: 'Filtra tu municipio'
        });
        new SlimSelect({
          select: "#select-city-".concat(cities),
          searchPlaceholder: 'Busca tu municipio'
        });
        d3.csv(csvFile).then(function (data) {
          dataz = data;
          dataz.forEach(function (d) {
            d.mayor = +d.mayor;
            d.menor = +d.menor;
            d.city = d.name;
          });
          updateChart(dataz);
        });
      });
    }

    clearFilter();

    function menuFilter() {
      d3.csv(csvFile).then(function (data) {
        var datos = data;
        var nest = d3.nest().key(function (d) {
          return d.name;
        }).entries(datos);
        var selectCity = d3.select("#filter-city-".concat(cities));
        selectCity.selectAll('option').data(nest).enter().append('option').attr('value', function (d) {
          return d.key;
        }).text(function (d) {
          return d.key;
        });
        selectCity.on('change', function () {
          d3.select(this).property('value');
          d3.select("#percentage-over-city-".concat(cities, " option")).property('selected', '0');
          d3.select("#percentage-under-city-".concat(cities, " option")).property('selected', '0');
          d3.selectAll('.tooltip-percentage').remove().exit();
          new SlimSelect({
            select: "#percentage-over-city-".concat(cities),
            searchPlaceholder: 'Filtra tu municipio'
          });
          new SlimSelect({
            select: "#percentage-under-city-".concat(cities),
            searchPlaceholder: 'Filtra tu municipio'
          });
          update();
        });
      });
    }

    function percentageOlder() {
      var selectPercentage = d3.select("#percentage-over-city-".concat(cities));
      selectPercentage.on('change', function () {
        d3.select("#percentage-under-city-".concat(cities, " option")).property('selected', '0');
        new SlimSelect({
          select: "#percentage-under-city-".concat(cities),
          searchPlaceholder: 'Filtra tu municipio'
        });
        new SlimSelect({
          select: "#select-city-".concat(cities),
          searchPlaceholder: 'Busca tu municipio'
        });
        var percentageCity = d3.select(this).property('value');
        d3.csv(csvFile).then(function (data) {
          dataz = data;
          d3.selectAll(".scatter-".concat(cities, "-circles")).transition().duration(400).attr('r', 0);
          dataz = dataz.filter(function (d) {
            return d.mayor > percentageCity;
          });
          chart.select(".scatter-".concat(cities, "-container-bis"));
          d3.selectAll('.tooltip-percentage').remove().exit();
          chart.append('div').attr('class', 'tooltip tooltip-percentage').html("\n            <p class=\"tooltip-population\"><span class=\"tooltip-number\">En ".concat(dataz.length, "</span> municipios el % de habitantes mayores de 65 a\xF1os es superior al <span class=\"tooltip-number\">").concat(percentageCity, "%</span>. <p/>\n            ")).style('right', margin.right + 'px').style('top', 50 + 'px');
          dataz.forEach(function (d) {
            d.city = d.name;
          });
          updateChart(dataz);
        });
      });
    }

    function percentageUnder() {
      var selectPercentage = d3.select("#percentage-under-city-".concat(cities));
      selectPercentage.on('change', function () {
        d3.select("#percentage-over-city-".concat(cities, " option")).property('selected', '0');
        new SlimSelect({
          select: "#percentage-over-city-".concat(cities),
          searchPlaceholder: 'Filtra tu municipio'
        });
        new SlimSelect({
          select: "#select-city-".concat(cities),
          searchPlaceholder: 'Busca tu municipio'
        });
        var percentageCity = d3.select(this).property('value');
        d3.csv(csvFile).then(function (data) {
          dataz = data;
          d3.selectAll(".scatter-".concat(cities, "-circles")).transition().duration(400).attr('r', 0);
          dataz = dataz.filter(function (d) {
            return d.menor > percentageCity;
          });
          chart.select(".scatter-".concat(cities, "-container-bis"));
          d3.selectAll('.tooltip-percentage').remove().exit();
          chart.append('div').attr('class', 'tooltip tooltip-percentage').html("\n            <p class=\"tooltip-population\"><span class=\"tooltip-number\">En ".concat(dataz.length, "</span> municipios el % de habitantes menores de 18 a\xF1os es superior al <span class=\"tooltip-number\">").concat(percentageCity, "%</span>. <p/>\n            ")).style('right', margin.right + 'px').style('top', 50 + 'px');
          dataz.forEach(function (d) {
            d.city = d.name;
          });
          updateChart(dataz);
        });
      });
    }

    function update(filterCity) {
      d3.csv(csvFile).then(function (data) {
        dataz = data;
        var valueCity = d3.select("#filter-city-".concat(cities)).property('value');
        var revalueCity = new RegExp('^' + valueCity + '$');
        d3.selectAll(".scatter-".concat(cities, "-circles")).transition().duration(400).attr('r', 0);
        dataz = dataz.filter(function (d) {
          return String(d.name).match(revalueCity);
        });
        dataz.forEach(function (d) {
          d.mayor = +d.mayor;
          d.menor = +d.menor;
          d.city = d.name;
        });
        updateChart(dataz);
      });
    }

    function resize() {
      updateChart(dataz);
    }

    function loadData() {
      d3.csv(csvFile).then(function (data) {
        dataz = data;
        dataz.forEach(function (d) {
          d.mayor = +d.mayor;
          d.menor = +d.menor;
          d.population = +d.population;
          d.city = d.name;
          d.over = d.percentagemayor;
          d.under = d.percentagemenor;
        });
        setupElements();
        setupScales();
        updateChart(dataz);
        menuFilter();
        percentageOlder();
        percentageUnder();
      });
    }

    window.addEventListener('resize', resize);
    loadData();
  }

  function barNegative(csvFile, cities) {
    var margin = {
      top: 24,
      right: 8,
      bottom: 24,
      left: 40
    };
    var width = 0;
    var height = 0;
    var w = 0;
    var h = 0;
    var chart = d3.select(".bar-negative-".concat(cities));
    var svg = chart.select('svg');
    var scales = {};
    var dataz;
    var tooltip = chart.append('div').attr('class', 'tooltip tooltip-negative').style('opacity', 0);

    function setupScales() {
      d3.min(dataz, function (d) {
        return d.saldo;
      });
      var saldoMax = d3.max(dataz, function (d) {
        return d.saldo;
      });
      var saldoMaxMax = 300;
      var countX = d3.scaleBand().domain(dataz.map(function (d) {
        return d.year;
      }));
      var countY = d3.scaleLinear().domain([d3.min(dataz, function (d) {
        return d.saldo * 2;
      }), d3.max(dataz, function (d) {
        return saldoMax < saldoMaxMax ? d3.max(dataz, function (d) {
          return d.saldo * 6;
        }) : d3.max(dataz, function (d) {
          return d.saldo * 2.5;
        });
      })]);
      scales.count = {
        x: countX,
        y: countY
      };
    }

    function setupElements() {
      var g = svg.select(".bar-negative-".concat(cities, "-container"));
      g.append('g').attr('class', 'axis axis-x');
      g.append('g').attr('class', 'axis axis-y');
      g.append('g').attr('class', "bar-negative-".concat(cities, "-container-bis"));
    }

    function updateScales(width, height) {
      scales.count.x.rangeRound([0, width]).paddingInner(0.2);
      scales.count.y.range([height, 0]);
    }

    function drawAxes(g) {
      var axisX = d3.axisBottom(scales.count.x).tickValues(scales.count.x.domain().filter(function (d, i) {
        return !(i % 6);
      }));
      g.select('.axis-x').attr('transform', "translate(0,".concat(height, ")")).call(axisX);
      var axisY = d3.axisLeft(scales.count.y).tickFormat(d3.format('d')).ticks(5).tickSize(-width).tickPadding(8);
      g.select('.axis-y').call(axisY);
    }

    function updateChart(dataz) {
      w = chart.node().offsetWidth;
      h = 600;
      width = w - margin.left - margin.right;
      height = h - margin.top - margin.bottom;
      svg.attr('width', w).attr('height', h);
      var translate = "translate(".concat(margin.left, ",").concat(margin.top, ")");
      var g = svg.select(".bar-negative-".concat(cities, "-container"));
      g.attr('transform', translate);
      updateScales(width, height);
      var container = chart.select(".bar-negative-".concat(cities, "-container-bis"));
      var layer = container.selectAll('.bar-vertical').data(dataz);
      var newLayer = layer.enter().append('rect').attr('class', function (d) {
        return d.saldo < 0 ? 'negative' : 'positive';
      });
      layer.merge(newLayer).on('mouseover', function (d) {
        tooltip.transition();
        tooltip.style('opacity', 1).html("\n            <p class=\"tooltip-year\"><span class=\"tooltip-number\">".concat(d.year, "</span><p/>\n            <p class=\"tooltip-born\">Nacidos: <span class=\"tooltip-number\">").concat(d.nacidos, "</span><p/>\n            <p class=\"tooltip-deceased\">Fallecidos: <span class=\"tooltip-number\">").concat(d.fallecidos, "</span><p/>\n            <p class=\"tooltip-deceased\">Saldo: <span class=\"tooltip-number\">").concat(d.saldo, "</span><p/>\n            ")).style('left', w / 2 - 100 + 'px').style('top', 50 + 'px');
      }).on('mouseout', function (d) {
        tooltip.transition().duration(200).style('opacity', 0);
      }).attr('width', scales.count.x.bandwidth()).attr('x', function (d) {
        return scales.count.x(d.year);
      }).attr('y', function (d) {
        return d.saldo > 0 ? scales.count.y(d.saldo) : scales.count.y(0);
      }).attr('height', function (d) {
        return Math.abs(scales.count.y(d.saldo) - scales.count.y(0));
      });
      drawAxes(g);
    }

    function resize() {
      updateChart(dataz);
    }

    function loadData() {
      d3.csv(csvFile).then(function (data) {
        dataz = data;
        setupElements();
        setupScales();
        updateChart(dataz);
      });
    }

    window.addEventListener('resize', resize);
    loadData();
  }

  function linePopulation(csvFile, cities) {
    var margin = {
      top: 16,
      right: 8,
      bottom: 24
    };
    margin.left = widthMobile > 544 ? 62 : 32;
    var width = 0;
    var height = 0;
    var chart = d3.select(".line-population-".concat(cities));
    var svg = chart.select('svg');
    var scales = {};
    var datos;
    var containerTooltip = d3.select(".".concat(cities, "-line"));
    var tooltipOver = chart.append('div').attr('class', 'tooltip tooltip-over');
    var tooltipPopulation = containerTooltip.append('div').attr('class', 'tooltip tooltip-population').style('opacity', 0);

    function setupScales() {
      var countX = d3.scaleTime().domain([d3.min(datos, function (d) {
        return d.year;
      }), d3.max(datos, function (d) {
        return d.year;
      })]);
      var countY = d3.scaleLinear().domain([0, d3.max(datos, function (d) {
        return d.population;
      }) * 1.25]);
      scales.count = {
        x: countX,
        y: countY
      };
    }

    function tooltips(data) {
      datos = data;
      chart.node().offsetWidth;
      var totalLose = datos[0].population - datos.slice(-1)[0].population;
      var totalWin = datos.slice(-1)[0].population - datos[0].population;
      var percentageL = (totalLose * 100 / datos[0].population).toFixed(2);
      var percentageW = (totalWin * 100 / datos[0].population).toFixed(2);
      var tooltipHeader = datos[0].population > datos.slice(-1)[0].population ? "<p class=\"tooltip-deceased\">Desde 1900 su poblaci\xF3n ha disminuido en un <span class=\"tooltip-number\">".concat(percentageL, "%</span><p/>") : "<p class=\"tooltip-deceased\">Desde 1900 su poblaci\xF3n ha aumentado en un <span class=\"tooltip-number\">".concat(percentageW, "%</span><p/>");
      var topPosition = datos[0].population > datos.slice(-1)[0].population ? '20px' : '90%';
      tooltipOver.data(datos).html(function (d) {
        return "\n        ".concat(tooltipHeader, "\n        <p class=\"tooltip-deceased\">Mayores de 65 a\xF1os en 2018: <span class=\"tooltip-number\">").concat(d.mayor, "%</span><p/>\n        <p class=\"tooltip-deceased\">Menores de 18 a\xF1os en 2018: <span class=\"tooltip-number\">").concat(d.menor, "%</span><p/>\n        ");
      }).transition().duration(300).style('top', "".concat(topPosition));
    }

    function setupElements() {
      var g = svg.select(".line-population-".concat(cities, "-container"));
      g.append('g').attr('class', 'axis axis-x');
      g.append('g').attr('class', 'axis axis-y');
      g.append('g').attr('class', "line-population-".concat(cities, "-container-bis"));
    }

    function updateScales(width, height) {
      scales.count.x.range([0, width - margin.right]);
      scales.count.y.range([height, 0]);
    }

    function drawAxes(g) {
      var axisX = d3.axisBottom(scales.count.x).tickPadding(4).tickFormat(d3.format('d')).ticks(13);
      g.select('.axis-x').attr('transform', "translate(0,".concat(height, ")")).transition().duration(300).ease(d3.easeLinear).call(axisX);
      var axisY = d3.axisLeft(scales.count.y).tickPadding(5).tickFormat(d3.format('d')).tickSize(-width).ticks(6);
      g.select('.axis-y').transition().duration(300).ease(d3.easeLinear).call(axisY);
    }

    function updateChart(data) {
      var w = chart.node().offsetWidth;
      var h = 500;
      width = w - margin.left - margin.right;
      height = h - margin.top - margin.bottom;
      svg.attr('width', w).attr('height', h);
      var translate = "translate(".concat(margin.left, ",").concat(margin.top, ")");
      var g = svg.select(".line-population-".concat(cities, "-container"));
      g.attr('transform', translate);
      var line = d3.line().x(function (d) {
        return scales.count.x(d.year);
      }).y(function (d) {
        return scales.count.y(d.population);
      });
      updateScales(width, height);
      var container = chart.select(".line-population-".concat(cities, "-container-bis"));
      var lines = container.selectAll('.lines').data([datos]);
      var dots = container.selectAll('.circles-population').remove().exit().data(datos);
      var newLines = lines.enter().append('path').attr('class', 'lines');
      lines.merge(newLines).transition().duration(400).ease(d3.easeLinear).attrTween('d', function (d) {
        var previous = d3.select(this).attr('d');
        var current = line(d);
        return d3.interpolatePath(previous, current);
      });
      var dotsLayer = dots.enter().append('circle').attr('class', 'circles-population').attr('fill', '#531f4e');
      dots.merge(dotsLayer).on('mouseover', function (d) {
        var positionX = scales.count.x(d.year);
        var postionWidthTooltip = positionX + 270;
        var tooltipWidth = 210;
        var positionleft = "".concat(d3.event.pageX, "px");
        var positionright = "".concat(d3.event.pageX - tooltipWidth, "px");
        tooltipPopulation.transition();
        tooltipPopulation.style('opacity', 1).html("<p class=\"tooltip-deceased\">La poblaci\xF3n en <span class=\"tooltip-number\">".concat(d.year, "</span> era de <span class=\"tooltip-number\">").concat(d.population, "</span> habitantes<p/>")).style('left', postionWidthTooltip > w ? positionright : positionleft).style('top', "".concat(d3.event.pageY - 48, "px"));
      }).on('mouseout', function () {
        tooltipPopulation.transition().duration(200).style('opacity', 0);
      }).attr('cx', function (d) {
        return scales.count.x(d.year);
      }).attr('cy', function (d) {
        return scales.count.y(d.population);
      }).attr('r', 0).transition().duration(400).ease(d3.easeLinear).attr('cx', function (d) {
        return scales.count.x(d.year);
      }).attr('cy', function (d) {
        return scales.count.y(d.population);
      }).attr('r', 4);
      drawAxes(g);
    }

    function update(mes) {
      d3.csv(csvFile).then(function (data) {
        datos = data;
        var valueCity = d3.select("#select-city-".concat(cities)).property('value');
        var revalueCity = new RegExp('^' + valueCity + '$');
        datos = datos.filter(function (d) {
          return String(d.name).match(revalueCity);
        });
        datos.forEach(function (d) {
          d.population = +d.population;
          d.year = +d.year;
        });
        scales.count.x.range([0, width]);
        scales.count.y.range([height, 0]);
        var countX = d3.scaleTime().domain([d3.min(datos, function (d) {
          return d.year;
        }), d3.max(datos, function (d) {
          return d.year;
        })]);
        var countY = d3.scaleLinear().domain([0, d3.max(datos, function (d) {
          return d.population;
        }) * 1.25]);
        scales.count = {
          x: countX,
          y: countY
        };
        updateChart();
        tooltips(datos);
      });
    }

    function menuMes() {
      d3.csv(csvFile).then(function (data) {
        datos = data;
        var nest = d3.nest().key(function (d) {
          return d.select;
        }).entries(datos);
        var selectCity = d3.select("#select-city-".concat(cities));
        selectCity.selectAll('option').data(nest).enter().append('option').attr('value', function (d) {
          return d.key;
        }).text(function (d) {
          return d.key;
        });
        selectCity.on('change', function () {
          d3.select(this).property('value');
          update();
        });
      });
    }

    function resize() {
      updateChart();
    }

    function loadData() {
      d3.csv(csvFile).then(function (data) {
        datos = data;
        datos.forEach(function (d) {
          d.year = +d.year;
          d.population = +d.population;
        });
        setupElements();
        setupScales();
        updateChart();
        datos[0].name;
        update();
      });
    }

    window.addEventListener('resize', resize);
    loadData();
    menuMes();
  }

  menu();
  scatterDesert();
  aragonStack();
  var cities = [{
    city: 'huesca',
    linePopulationCSV: 'data/huesca/huesca.csv',
    lineTotalCSV: 'data/huesca/huesca-total.csv',
    scatterUnderCSV: 'data/huesca/huesca-mayor-menor.csv',
    vegetativeCSV: 'data/huesca/saldo-vegetativo-total-huesca.csv'
  }, {
    city: 'teruel',
    linePopulationCSV: 'data/teruel/teruel.csv',
    lineTotalCSV: 'data/teruel/teruel-total.csv',
    scatterUnderCSV: 'data/teruel/teruel-mayor-menor.csv',
    vegetativeCSV: 'data/teruel/saldo-vegetativo-total-teruel.csv'
  }, {
    city: 'zaragoza',
    linePopulationCSV: 'data/zaragoza/zaragoza.csv',
    lineTotalCSV: 'data/zaragoza/zaragoza-total.csv',
    scatterUnderCSV: 'data/zaragoza/zaragoza-mayor-menor.csv',
    vegetativeCSV: 'data/zaragoza/saldo-vegetativo-total-zaragoza.csv'
  }];
  cities.map(function (element) {
    var city = element.city,
        linePopulationCSV = element.linePopulationCSV,
        lineTotalCSV = element.lineTotalCSV,
        scatterUnderCSV = element.scatterUnderCSV,
        vegetativeCSV = element.vegetativeCSV;
    linePopulation(linePopulationCSV, city);
    line(lineTotalCSV, city);
    barScatter(scatterUnderCSV, city);
    barNegative(vegetativeCSV, city);
  });
  new SlimSelect({
    select: '#select-city-teruel',
    searchPlaceholder: 'Busca tu municipio'
  });
  new SlimSelect({
    select: '#filter-city-teruel',
    searchPlaceholder: 'Filtra por municipio'
  });
  new SlimSelect({
    select: '#percentage-over-city-teruel',
    searchPlaceholder: 'Filtra tu municipio'
  });
  new SlimSelect({
    select: '#percentage-under-city-teruel',
    searchPlaceholder: 'Filtra tu municipio'
  });
  new SlimSelect({
    select: '#select-city-huesca',
    searchPlaceholder: 'Busca tu municipio'
  });
  new SlimSelect({
    select: '#filter-city-huesca',
    searchPlaceholder: 'Filtra tu municipio'
  });
  new SlimSelect({
    select: '#percentage-over-city-huesca',
    searchPlaceholder: 'Filtra tu municipio'
  });
  new SlimSelect({
    select: '#percentage-under-city-huesca',
    searchPlaceholder: 'Filtra tu municipio'
  });
  new SlimSelect({
    select: '#select-city-zaragoza',
    searchPlaceholder: 'Busca tu municipio'
  });
  new SlimSelect({
    select: '#filter-city-zaragoza',
    searchPlaceholder: 'Filtra tu municipio'
  });
  new SlimSelect({
    select: '#percentage-over-city-zaragoza',
    searchPlaceholder: 'Filtra tu municipio'
  });
  new SlimSelect({
    select: '#percentage-under-city-zaragoza',
    searchPlaceholder: 'Filtra tu municipio'
  });

}());
//# sourceMappingURL=index.js.map
