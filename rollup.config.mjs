export default [
  {
    input: 'build/index.js',
    output: {
      file: 'dist/index.js',
      format: 'cjs'
    },
    external: ['react']
  },
  {
    input: 'build/index.js',
    output: {
      file: 'dist/index.mjs',
      format: 'esm'
    },
    external: ['react']
  }
]
