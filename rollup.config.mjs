export default [
  {
    input: 'ts-build/index.js',
    output: {
      file: 'dist/xin.js',
      format: 'cjs'
    }
  },
  {
    input: 'ts-build/index.js',
    output: {
      file: 'dist/xin.mjs',
      format: 'esm'
    }
  },
  {
    input: 'ts-build/index.js',
    output: {
      name: 'xi',
      file: 'dist/xin.iife.js',
      format: 'iife'
    }
  }
]
