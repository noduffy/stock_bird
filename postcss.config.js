// postcss.config.js (修正後)
export default {
  plugins: {
    '@tailwindcss/postcss': {}, // ← v4ではこちらを使います
    'autoprefixer': {},
  },
}