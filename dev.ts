import * as path from 'path'
import { statSync } from 'fs'
import { watch } from 'chokidar'
import { $ } from 'bun'

const PORT = 8018
const PROJECT_ROOT = import.meta.dir
const PUBLIC = path.resolve(PROJECT_ROOT, 'www')
const DIST = path.resolve(PROJECT_ROOT, 'dist')
const CDN = path.resolve(PROJECT_ROOT, 'cdn')
const isSPA = true

async function prebuild() {
  await $`rm -rf ${DIST}`
  await $`rm -rf ${CDN}`
  await $`rm -rf ${PUBLIC}`
  await $`mkdir ${DIST}`
  await $`mkdir ${CDN}`
  await $`mkdir ${PUBLIC}`

  // await $`bun docs.js`
  await $`cp README.md ${PUBLIC}`
}

async function build() {
  console.time('build')
  let result

  await $`cp demo/static/* ${PUBLIC}`

  try {
    await $`bun tsc ./src/index.ts --declaration --emitDeclarationOnly --target esnext --outDir dist`
  } catch (e) {
    console.log('types created')
  }

  result = await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: DIST,
    sourcemap: 'linked',
    format: 'esm',
    minify: true,
  })
  if (!result.success) {
    console.error('dist build failed')
    for (const message of result.logs) {
      console.error(message)
    }
    return
  }

  result = await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: CDN,
    sourcemap: 'linked',
    format: 'esm',
    minify: true,
  })
  if (!result.success) {
    console.error('cdn build failed')
    for (const message of result.logs) {
      console.error(message)
    }
    return
  }

  await Bun.build({
    entrypoints: ['./demo/index.ts'],
    outdir: PUBLIC,
    target: 'browser',
    sourcemap: 'linked',
    minify: true,
  })
  if (!result.success) {
    console.error('demo build failed')
    for (const message of result.logs) {
      console.error(message)
    }
    return
  }

  console.timeEnd('build')
}

watch(['README.md', './src']).on('change', prebuild)
watch('./demo').on('change', build)

prebuild().then(build)

function serveFromDir(config: {
  directory: string
  path: string
}): Response | null {
  let basePath = path.join(config.directory, config.path)
  const suffixes = ['', '.html', 'index.html']

  for (const suffix of suffixes) {
    try {
      const pathWithSuffix = path.join(basePath, suffix)
      const stat = statSync(pathWithSuffix)
      if (stat && stat.isFile()) {
        return new Response(Bun.file(pathWithSuffix))
      }
    } catch (err) {}
  }

  return null
}

const server = Bun.serve({
  port: PORT,
  tls: {
    key: Bun.file('./tls/key.pem'),
    cert: Bun.file('./tls/certificate.pem'),
  },
  fetch(request) {
    let reqPath = new URL(request.url).pathname
    console.log(request.method, reqPath)
    if (reqPath === '/') reqPath = '/index.html'

    const buildResponse = serveFromDir({
      directory: PUBLIC,
      path: reqPath,
    })
    if (buildResponse) return buildResponse

    if (isSPA) {
      const spaResponse = serveFromDir({
        directory: PUBLIC,
        path: '/index.html',
      })
      console.log(spaResponse)
      if (spaResponse) return spaResponse
    }
    return new Response('File not found', {
      status: 404,
    })
  },
})

console.log(`Listening on https://localhost:${PORT}`)
