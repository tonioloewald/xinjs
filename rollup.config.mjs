export default [
  {
    input: 'dist/index.js',
    output: {
      file: 'cdn/index.js',
      format: 'cjs'
    },
    external: ['react']
  },
  {
    input: 'dist/index.js',
    output: {
      file: 'cdn/index.mjs',
      format: 'esm'
    },
    external: ['react']
  }
]
