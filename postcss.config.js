export default {
  plugins: {
    'postcss-import': {}, // Resolve @import statements first
    cssnano: {
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
        normalizeWhitespace: true,
        minifyFontValues: true,
        minifyGradients: true,
      }]
    }
  }
}