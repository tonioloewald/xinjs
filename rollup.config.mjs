export default [
  {
    input: 'build/index.js',
    output: {
      file: 'dist/index.js',
      format: 'cjs'
    }
  },
  {
    input: 'build/index.js',
    output: {
      file: 'dist/index.mjs',
      format: 'esm'
    }
  },
  {
    input: 'build/index.js',
    output: {
      name: 'xi',
      file: 'dist/index.iife.js',
      format: 'iife'
    }
  }
]
