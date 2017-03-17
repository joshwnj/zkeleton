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
} = wrap(mod.getAtoms(), {
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
