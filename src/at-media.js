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
