const stylelint = require('stylelint')
const atImport = require('postcss-import')
const customProperties = require('postcss-custom-properties')
const selector = require('postcss-custom-selectors')
const nested = require('postcss-nested')
const sorting = require('postcss-sorting')

module.exports = {
  plugins: [
    stylelint(),
    atImport({
      path: 'src/css',
    }),
    selector(),
    customProperties(),
    sorting(),
    nested()
  ]
}
