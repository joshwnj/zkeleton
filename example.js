(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const upsertCss = require('./lib/upsert-css')
const createName = require('./lib/create-name')

function isName (val) {
  if (!val) { return false }
  return /^[a-zA-Z][a-zA-Z0-9-_]*$/.test(val)
}

function addSemis (raw) {
  return raw.replace(/([^;])\n/g, '$1;\n')
}

function cmz (prefix, raw) {
  if (!isName(prefix)) {
    return new CmzAtom(createName(), prefix)
  }

  return new (typeof raw === 'string' ? CmzAtom : CmzMod)(prefix, raw)
}

function CmzMod (prefix, raw) {
  // we'll use the same prefix for all atoms in this family
  this._prefix = prefix || createName()
  this._atoms = {}
  if (raw) { this.add(raw) }
}

CmzMod.prototype.add = function (raw) {
  const self = this
  Object.keys(raw).forEach(function (k) {
    if (raw[k] instanceof CmzAtom) {
      // families can include pre-created atoms
      self._addAtom(k, raw[k])
      return
    }

    const name = self._prefix + '__' + k
    if (Array.isArray(raw[k])) {
      var comps = []
      var rules = []
      raw[k].forEach(function (item) {
        if (item instanceof CmzAtom || isName(item)) {
          comps.push(item)
        } else {
          rules.push(item)
        }
      })
      self._addAtom(k, new CmzAtom(name, rules))
      if (comps.length) {
        self[k].compose(comps)
      }
    } else {
      // use the family key to make the classname a bit more descriptive
      self._addAtom(k, new CmzAtom(name, raw[k]))
    }
  })
  return this
}

CmzMod.prototype._addAtom = function (key, atom) {
  // expose atoms directly (but warn if there's a name clash)
  if (this[key]) {
    console.warn('[cmz] %s already exists in module %s', key, this._prefix)
  }
  this[key] = this._atoms[key] = atom
}

// compose 2 families together
CmzMod.prototype.compose = function (other) {
  const self = this
  Object.keys(other._atoms).forEach(function (k) {
    if (self._atoms[k]) {
      self._atoms[k].compose(other[k])
    } else {
      self._addAtom(k, other[k])
    }
  })

  return this
}

function CmzAtom (name, raw) {
  this.name = name || createName()
  this.raw = raw
  this.comps = []
}

CmzAtom.prototype.hasCss = function () {
  return this.raw && this.raw.length > 0
}

CmzAtom.prototype.getCss = function () {
  if (!this.hasCss()) { return '' }

  const parts = typeof this.raw === 'string' ? [this.raw] : this.raw

  const wrapped = []
  const unwrapped = []
  parts.forEach(function (part) {
    // if no placeholder was given, we need to wrap it ourselves
    const isWrapped = part.indexOf('&') >= 0
    const group = isWrapped ? wrapped : unwrapped
    group.push(part)
  })

  const selector = '.' + this.name
  var output = ''

  if (unwrapped.length) {
    output += selector + ' {' + addSemis(unwrapped.join('\n')) + '}'

    if (wrapped.length) { output += '\n' }
  }

  if (wrapped.length) {
    // replace the placeholder with the unique name
    output += wrapped.map(function (part) {
      return part.replace(/&/g, selector)
    }).join('\n')
  }

  return output
}

CmzAtom.prototype.toString = function () {
  // need to call toString() on the comps first,
  // so that they appear higher in source
  const fullName = this.getFullName()

  // only need to insert css if we have any
  const css = this.getCss()
  css && upsertCss(this.name, css)

  return fullName
}

CmzAtom.prototype.getFullName = function () {
  const comps = this.comps.join(' ')
  return this.hasCss()
    ? this.name + (comps && (' ' + comps))
    : comps
}

CmzAtom.prototype.compose = function (comps) {
  if (!Array.isArray(comps)) { comps = [comps] }
  this.comps = this.comps.concat(comps)
  return this
}

cmz.Mod = CmzMod
cmz.Atom = CmzAtom
cmz.reset = createName.reset

module.exports = cmz

},{"./lib/create-name":2,"./lib/upsert-css":3}],2:[function(require,module,exports){
var nameCounter = 0
module.exports = function createName () {
  const name = 'cmz-' + nameCounter
  nameCounter += 1
  return name
}
module.exports.reset = function () {
  nameCounter = 0
}

},{}],3:[function(require,module,exports){
module.exports = function upsertCss (id, css) {
  if (typeof document === 'undefined') { return }

  const head = document.querySelector('head')
  var el = head.querySelector('style[data-cmz="' + id + '"]')

  if (!el) {
    el = document.createElement('style')
    el.setAttribute('type', 'text/css')
    el.setAttribute('data-cmz', id)
    head.appendChild(el)
  }

  if (el.styleSheet) {
    el.styleSheet.cssText = css
  } else {
    el.textContent = css
  }

  return el
}

},{}],4:[function(require,module,exports){
// example: binding classnames to an element
const cmz = require('cmz')
const h = require('hyperscript')
const z = require('../src/custom')({
  highlight1: 'pink',
  highlight2: 'hotpink'
})

// first we define a module from zkeleton atoms
const mod = cmz('Zkeleton-Example', {
  Root: [ z.Layout.container ],
  Row: [ z.Layout.row ],

  Form: [ z.Forms.root ],
  Label: [ z.Forms.label ],
  Input: [ z.Forms.input, z.Layout.fullWidth ],
  Select: [ z.Forms.input, z.Layout.fullWidth ],
  Textarea: [ z.Forms.input, z.Layout.fullWidth ]
})

// next we'll bind the classnames to the elements
const {
  Root,
  Row,

  Form,
  Label,
  Input,
  Select,
  Textarea
} = wrap(mod._atoms, {
  Form: 'form',
  Label: 'label',
  Input: 'input',
  Select: 'select',
  Textarea: 'textarea'
})

const el = document.getElementById('root')

el.innerHTML = Root([
  // we can also create functions that produce families of elements
  Heading(1, 'Heading 1'),
  Heading(2, 'Heading 2'),
  Heading(3, 'Heading 3'),

  Button('Normal button'),
  ' ',
  Button({ primary: true }, 'Primary button'),

  Form([
    Row([
      Col(6, [
        Label('Your email'),
        Input({
          type: 'email',
          placeholder: 'text@example.com'
        })
      ]),
      Col(6, [
        Label('Reason for contacting'),
        Select([
          h('option', 'Questions')
        ])
      ])
    ]),

    Label('Message'),
    Textarea({ placeholder: 'Hi Dave...' }),

    Button({ primary: true }, 'Submit')
  ])
]).outerHTML

// ----

function wrap (atoms, tags={}) {
  const output = {}
  Object.keys(atoms).forEach(k => {
    output[k] = h.bind(null, tags[k] || 'div', { className: atoms[k].toString() })
  })
  return output
}

function Col (num, attr, children) {
  return h('div', { className: z.Layout['col' + num] }, attr, children)
}

function Button (attr, children) {
  const className = z.Buttons[(attr.primary) ? 'primary' : 'normal']
  return h('button', { className }, attr, children)
}

function Heading (level, attr, children) {
  const tag = 'h' + level
  return h(tag, { className: z.Typo[tag] }, attr, children)
}

},{"../src/custom":12,"cmz":1,"hyperscript":9}],5:[function(require,module,exports){
require('./example-hx')

},{"./example-hx":4}],6:[function(require,module,exports){

},{}],7:[function(require,module,exports){
/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */

/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
module.exports = (function split(undef) {

  var nativeSplit = String.prototype.split,
    compliantExecNpcg = /()??/.exec("")[1] === undef,
    // NPCG: nonparticipating capturing group
    self;

  self = function(str, separator, limit) {
    // If `separator` is not a regex, use `nativeSplit`
    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
      return nativeSplit.call(str, separator, limit);
    }
    var output = [],
      flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
      (separator.sticky ? "y" : ""),
      // Firefox 3+
      lastLastIndex = 0,
      // Make `global` and avoid `lastIndex` issues by working with a copy
      separator = new RegExp(separator.source, flags + "g"),
      separator2, match, lastIndex, lastLength;
    str += ""; // Type-convert
    if (!compliantExecNpcg) {
      // Doesn't need flags gy, but they don't hurt
      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
    }
    /* Values for `limit`, per the spec:
     * If undefined: 4294967295 // Math.pow(2, 32) - 1
     * If 0, Infinity, or NaN: 0
     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
     * If other: Type-convert, then use the above rules
     */
    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
    limit >>> 0; // ToUint32(limit)
    while (match = separator.exec(str)) {
      // `separator.lastIndex` is not reliable cross-browser
      lastIndex = match.index + match[0].length;
      if (lastIndex > lastLastIndex) {
        output.push(str.slice(lastLastIndex, match.index));
        // Fix browsers whose `exec` methods don't consistently return `undefined` for
        // nonparticipating capturing groups
        if (!compliantExecNpcg && match.length > 1) {
          match[0].replace(separator2, function() {
            for (var i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undef) {
                match[i] = undef;
              }
            }
          });
        }
        if (match.length > 1 && match.index < str.length) {
          Array.prototype.push.apply(output, match.slice(1));
        }
        lastLength = match[0].length;
        lastLastIndex = lastIndex;
        if (output.length >= limit) {
          break;
        }
      }
      if (separator.lastIndex === match.index) {
        separator.lastIndex++; // Avoid an infinite loop
      }
    }
    if (lastLastIndex === str.length) {
      if (lastLength || !separator.test("")) {
        output.push("");
      }
    } else {
      output.push(str.slice(lastLastIndex));
    }
    return output.length > limit ? output.slice(0, limit) : output;
  };

  return self;
})();

},{}],8:[function(require,module,exports){
// contains, add, remove, toggle
var indexof = require('indexof')

module.exports = ClassList

function ClassList(elem) {
    var cl = elem.classList

    if (cl) {
        return cl
    }

    var classList = {
        add: add
        , remove: remove
        , contains: contains
        , toggle: toggle
        , toString: $toString
        , length: 0
        , item: item
    }

    return classList

    function add(token) {
        var list = getTokens()
        if (indexof(list, token) > -1) {
            return
        }
        list.push(token)
        setTokens(list)
    }

    function remove(token) {
        var list = getTokens()
            , index = indexof(list, token)

        if (index === -1) {
            return
        }

        list.splice(index, 1)
        setTokens(list)
    }

    function contains(token) {
        return indexof(getTokens(), token) > -1
    }

    function toggle(token) {
        if (contains(token)) {
            remove(token)
            return false
        } else {
            add(token)
            return true
        }
    }

    function $toString() {
        return elem.className
    }

    function item(index) {
        var tokens = getTokens()
        return tokens[index] || null
    }

    function getTokens() {
        var className = elem.className

        return filter(className.split(" "), isTruthy)
    }

    function setTokens(list) {
        var length = list.length

        elem.className = list.join(" ")
        classList.length = length

        for (var i = 0; i < list.length; i++) {
            classList[i] = list[i]
        }

        delete list[length]
    }
}

function filter (arr, fn) {
    var ret = []
    for (var i = 0; i < arr.length; i++) {
        if (fn(arr[i])) ret.push(arr[i])
    }
    return ret
}

function isTruthy(value) {
    return !!value
}

},{"indexof":10}],9:[function(require,module,exports){
var split = require('browser-split')
var ClassList = require('class-list')

var w = typeof window === 'undefined' ? require('html-element') : window
var document = w.document
var Text = w.Text

function context () {

  var cleanupFuncs = []

  function h() {
    var args = [].slice.call(arguments), e = null
    function item (l) {
      var r
      function parseClass (string) {
        // Our minimal parser doesn’t understand escaping CSS special
        // characters like `#`. Don’t use them. More reading:
        // https://mathiasbynens.be/notes/css-escapes .

        var m = split(string, /([\.#]?[^\s#.]+)/)
        if(/^\.|#/.test(m[1]))
          e = document.createElement('div')
        forEach(m, function (v) {
          var s = v.substring(1,v.length)
          if(!v) return
          if(!e)
            e = document.createElement(v)
          else if (v[0] === '.')
            ClassList(e).add(s)
          else if (v[0] === '#')
            e.setAttribute('id', s)
        })
      }

      if(l == null)
        ;
      else if('string' === typeof l) {
        if(!e)
          parseClass(l)
        else
          e.appendChild(r = document.createTextNode(l))
      }
      else if('number' === typeof l
        || 'boolean' === typeof l
        || l instanceof Date
        || l instanceof RegExp ) {
          e.appendChild(r = document.createTextNode(l.toString()))
      }
      //there might be a better way to handle this...
      else if (isArray(l))
        forEach(l, item)
      else if(isNode(l))
        e.appendChild(r = l)
      else if(l instanceof Text)
        e.appendChild(r = l)
      else if ('object' === typeof l) {
        for (var k in l) {
          if('function' === typeof l[k]) {
            if(/^on\w+/.test(k)) {
              (function (k, l) { // capture k, l in the closure
                if (e.addEventListener){
                  e.addEventListener(k.substring(2), l[k], false)
                  cleanupFuncs.push(function(){
                    e.removeEventListener(k.substring(2), l[k], false)
                  })
                }else{
                  e.attachEvent(k, l[k])
                  cleanupFuncs.push(function(){
                    e.detachEvent(k, l[k])
                  })
                }
              })(k, l)
            } else {
              // observable
              e[k] = l[k]()
              cleanupFuncs.push(l[k](function (v) {
                e[k] = v
              }))
            }
          }
          else if(k === 'style') {
            if('string' === typeof l[k]) {
              e.style.cssText = l[k]
            }else{
              for (var s in l[k]) (function(s, v) {
                if('function' === typeof v) {
                  // observable
                  e.style.setProperty(s, v())
                  cleanupFuncs.push(v(function (val) {
                    e.style.setProperty(s, val)
                  }))
                } else
                  var match = l[k][s].match(/(.*)\W+!important\W*$/);
                  if (match) {
                    e.style.setProperty(s, match[1], 'important')
                  } else {
                    e.style.setProperty(s, l[k][s])
                  }
              })(s, l[k][s])
            }
          } else if(k === 'attrs') {
            for (var v in l[k]) {
              e.setAttribute(v, l[k][v])
            }
          }
          else if (k.substr(0, 5) === "data-") {
            e.setAttribute(k, l[k])
          } else {
            e[k] = l[k]
          }
        }
      } else if ('function' === typeof l) {
        //assume it's an observable!
        var v = l()
        e.appendChild(r = isNode(v) ? v : document.createTextNode(v))

        cleanupFuncs.push(l(function (v) {
          if(isNode(v) && r.parentElement)
            r.parentElement.replaceChild(v, r), r = v
          else
            r.textContent = v
        }))
      }

      return r
    }
    while(args.length)
      item(args.shift())

    return e
  }

  h.cleanup = function () {
    for (var i = 0; i < cleanupFuncs.length; i++){
      cleanupFuncs[i]()
    }
    cleanupFuncs.length = 0
  }

  return h
}

var h = module.exports = context()
h.context = context

function isNode (el) {
  return el && el.nodeName && el.nodeType
}

function forEach (arr, fn) {
  if (arr.forEach) return arr.forEach(fn)
  for (var i = 0; i < arr.length; i++) fn(arr[i], i)
}

function isArray (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]'
}



},{"browser-split":7,"class-list":8,"html-element":6}],10:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],11:[function(require,module,exports){
function wrap (raw) {
  if (raw.indexOf('&') >= 0) { return raw }
  return '& { ' + raw + ' }'
}

module.exports = function (size, css) {
  return `
@media (min-width: ${size}px) {
  ${wrap(css)}
}`
}

},{}],12:[function(require,module,exports){
// css based on https://github.com/dhg/Skeleton/

const cmz = require('cmz')
const atMedia = require('./at-media')

const defaultColors = {
  grey1: '#222',
  grey2: '#333',
  grey3: '#555',
  grey4: '#888',
  grey5: '#BBB',
  grey6: '#D1D1D1',

  white: '#FFF',

  highlight1: '#1EAEDB',
  highlight2: '#33C3F0'
}


module.exports = function (colors) {
  colors = colors ? Object.assign({}, defaultColors, colors) : defaultColors

  const Typo = cmz('Typo', {
    base: `
  line-height: 1.6;
  font-weight: 400;
  font-family: Helvetica, Arial, sans-serif;
  color: ${colors.grey1};
  `
  })

  Typo.add({
    heading: [
      Typo.base,
      `
    margin-top: 0;
    margin-bottom: 2rem;
    font-weight: 300;
    letter-spacing: -.1rem;
    `
    ]
  })

  Typo.add({
    h1: [
      Typo.heading,
      `
    font-size: 4.0rem;
    line-height: 1.2;
    `,
      atMedia(550, 'font-size: 5.0rem')
    ],

    h2: [
      Typo.heading,
      'font-size: 3.6rem',
      'line-height: 1.25',
      atMedia(550, 'font-size: 4.2rem')
    ],

    h3: [
      Typo.heading,
      `
    font-size: 3.0rem;
    line-height: 1.3;
    `,
      atMedia(550, 'font-size: 3.6rem')
    ]
  })

  const Buttons = cmz('Buttons', {
    normal: `
& {
  display: inline-block;
  height: 38px;
  padding: 0 30px;
  margin-bottom: 1rem;
  color: ${colors.grey3};
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  line-height: 38px;
  letter-spacing: .1rem;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
  background-color: transparent;
  border-radius: 4px;
  border: 1px solid ${colors.grey5};
  cursor: pointer;
  box-sizing: border-box;
}

&:hover,
&:focus {
  color: ${colors.grey2};
  border-color: ${colors.grey4};
  outline: 0;
}
`
  })

  Buttons.add({
    primary: [
      Buttons.normal,
      `
& {
  color: ${colors.white};
  background-color: ${colors.highlight2};
  border-color: ${colors.highlight2};
}

&:hover,
&:focus {
  color: ${colors.white};
  background-color: ${colors.highlight1};
  border-color: ${colors.highlight1};
}
`
    ]
  })

  const Forms = cmz('Forms', {
    root: [
      Typo.base,
      'margin-bottom: 2.5rem'
    ],

    input: `
& {
  font-size: 12px;
  height: 38px;
  padding: 6px 10px; /* The 6px vertically centers text on FF, ignored by Webkit */
  background-color: ${colors.white};
  border: 1px solid ${colors.grey6};
  border-radius: 4px;
  box-shadow: none;
  box-sizing: border-box;
  margin-bottom: 1.5rem;

  /* Removes awkward default styles on some inputs for iOS */
  -webkit-appearance: none;
     -moz-appearance: none;
          appearance: none;
}

&:focus {
  border: 1px solid ${colors.highlight2}x;
  outline: 0;
}
`,

    label: `
  display: block;
  margin-bottom: .5rem;
  font-weight: 600;
  `,

    labelBody: `
  display: inline-block;
  margin-left: .5rem;
  font-weight: normal;
  `,

    fieldset: `
  padding: 0;
  border-width: 0;
  `,

    checkbox: `
  display: inline
`,
    radio: `
  display: inline
`
  })

  Forms.add({
    textarea: [
      Forms.input,
      `
    min-height: 65px;
    padding-top: 6px;
    padding-bottom: 6px;
    `
    ]
  })

  const Layout = cmz('Layout', {
    clearSelf: `
&:after {
  content: "";
  display: table;
  clear: both;
}
  `
  })

  Layout.add({
    container: [
      `
    position: relative;
    width: 100%;
    max-width: 960px;
    margin: 0 auto;
    padding: 0 20px;
    box-sizing: border-box;
    `,
      atMedia(400, `
      width: 85%;
      padding: 0
    `),
      atMedia(550, `
      width: 80%;
    `),
      Layout.clearSelf
    ],

    row: [
      Layout.clearSelf
    ],

    fullWidth: [
      'width: 100%',
      'box-sizing: border-box'
    ]
  })

  Layout.add({
    column: [
      Layout.fullWidth,
      'float: left',
      atMedia(550, `
& {
  margin-left: 4%;
}

&:first-child {
  margin-left: 0;
}
`)
    ]
  })

  Layout.add({
    col6: [
      Layout.column,
      atMedia(550, 'width: 48%')
    ]
  })

  return {
    colors,
    Buttons,
    Forms,
    Layout,
    Typo
  }
}

},{"./at-media":11,"cmz":1}]},{},[5]);
