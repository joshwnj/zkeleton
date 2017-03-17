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
