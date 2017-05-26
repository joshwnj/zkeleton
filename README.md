# zkeleton

[![Greenkeeper badge](https://badges.greenkeeper.io/joshwnj/zkeleton.svg)](https://greenkeeper.io/)

Experiment: what happens if we take a css library like [skeleton](https://github.com/dhg/Skeleton/) and package it up as [cmz](http://github.com/joshwnj/cmz) modules & atoms?

## Run the example

```
npm install
npm run build:example
open dist/index.html
```

![](https://github.com/joshwnj/zkeleton/blob/master/example.png)

You can also [view the example here](https://joshwnj.github.io/zkeleton/)

Or [try it out on codepen](https://codepen.io/joshwnj/pen/ryJqaO?editors=0010)

## Theming

To get default colors, just use:

```js
const z = require('zkeleton')
```

If you'd like custom colors, use this instead:

```js
const z = require('zkeleton/custom')({
  highlight1: 'pink',
  highlight2: 'hotpink'
})
```

A full list of the colors that can be overridden is in `src/custom.js`:

```
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
```

## Thanks

- [skeleton](https://github.com/dhg/Skeleton/)
