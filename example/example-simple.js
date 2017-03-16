const zkeleton = require('../src')
const {
  Typo,
  Buttons,
  Forms,
  Layout
} = zkeleton

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
