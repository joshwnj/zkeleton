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
const zkeleton = require('../src')
const Typo = zkeleton.Typo
const Buttons = zkeleton.Buttons
const Forms = zkeleton.Forms
const Layout = zkeleton.Layout

const el = document.getElementById('root')

el.innerHTML = `
<div class="${Layout.container}">
  <h1 class="${Typo.h1}">Heading 1</h1>
  <h2 class="${Typo.h2}">Heading 2</h2>
  <h3 class="${Typo.h3}">Heading 3</h3>

  <button class="${Buttons.normal}">Normal button</button>
  <button class="${Buttons.primary}">Primary button</button>

  <form class="${Forms.root}">
    <div class="${Layout.row}">
      <div class="${Layout.col6}">
        <label class="${Forms.label}">Your email</label>
        <input class="${Forms.input} ${Layout.fullWidth}" type="email" placeholder="text@example.com">
      </div>

      <div class="${Layout.col6}">
        <label class="${Forms.label}">Reason for contacting</label>
        <select class="${Forms.input} ${Layout.fullWidth}">
          <option>Questions</option>
        </select>
      </div>
    </div>

    <label class="${Forms.label}">Message</label>
    <textarea class="${Forms.input} ${Layout.fullWidth}" placeholder="Hi Dave..."></textarea>

    <button class="${Buttons.primary}">Submit</button>
  </form>
</div>
`

},{"../src":5}],5:[function(require,module,exports){
// css based on https://github.com/dhg/Skeleton/

const cmz = require('cmz')

const colors = {
  grey1: '#222',
  grey2: '#333',
  grey3: '#555',
  grey4: '#888',
  grey5: '#BBB',
  grey6: '#D1D1D1',

  white: '#FFF',

  blue1: '#1EAEDB',
  blue2: '#33C3F0'
}

function wrap (raw) {
  if (raw.indexOf('&') >= 0) { return raw }
  return '& { ' + raw + ' }'
}

function atMedia (size, css) {
  return `
@media (min-width: ${size}px) {
  ${wrap(css)}
}`
}

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
  background-color: ${colors.blue2};
  border-color: ${colors.blue2};
}

&:hover,
&:focus {
  color: ${colors.white};
  background-color: ${colors.blue1};
  border-color: ${colors.blue1};
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
  border: 1px solid ${colors.blue2}x;
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

module.exports.colors = colors
module.exports.Buttons = Buttons
module.exports.Forms = Forms
module.exports.Layout = Layout
module.exports.Typo = Typo

},{"cmz":1}]},{},[4]);
