#!/usr/bin/env bun
/**
 * IS GZIP A HONEST PROXY FOR WHAT A CONSUMER DOWNLOADS?
 *
 * The per-bundle budgets in `bin/bundles.ts` are gzip. Consumers get brotli.
 * For TOTAL size the two track closely — but a leanness pass does not report
 * totals, it reports DELTAS, and the question is whether a delta in gzip
 * predicts the delta a consumer actually pays.
 *
 * Written because a pre-release critique asserted it does not, with figures
 * that existed nowhere in the repo. A claim used to reject a proposal has to
 * be reproducible by the next person: `bun tools/compression-proxy.ts`.
 */
import { gzipSync, brotliCompressSync, constants } from 'node:zlib'

const br = (b: Uint8Array): number =>
  brotliCompressSync(b, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  }).length
const gz = (b: Uint8Array): number => gzipSync(b).length
const enc = new TextEncoder()

const base = await Bun.file('dist/module.js').text()
console.log(`baseline dist/module.js  gz ${gz(enc.encode(base))}  br ${br(enc.encode(base))}`)
console.log(`\n${'edit'.padEnd(46)} ${'Δgz'.padStart(7)} ${'Δbr'.padStart(7)}   br/gz`)

const bGz = gz(enc.encode(base))
const bBr = br(enc.encode(base))
const row = (name: string, mutated: string): [number, number] => {
  const dGz = gz(enc.encode(mutated)) - bGz
  const dBr = br(enc.encode(mutated)) - bBr
  const ratio = dGz === 0 ? NaN : dBr / dGz
  console.log(
    `${name.padEnd(46)} ${String(dGz).padStart(7)} ${String(dBr).padStart(7)}   ${ratio.toFixed(2)}`
  )
  return [dGz, dBr]
}

// THE CASE THAT MATTERS: de-duplication is what a leanness pass finds most.
// gzip's window is 32 kB; a repeat further away than that is invisible to it
// and plainly visible to brotli's much larger window.
const block = base.slice(2000, 2400)
const far = base.slice(0, 60000) + block + base.slice(60000)
const near = base.slice(0, 2500) + block + base.slice(2500)

const rows: Array<[number, number]> = []
rows.push(row('duplicate a 400-char block ~58 kB away', far))
rows.push(row('duplicate the same block ~100 chars away', near))
rows.push(row('add a NEW 100-char error string', base + `\nconst _m = ${JSON.stringify('Refusing: the path names a list item by index, which moves when the list reorders; name it by id instead.')}\n`))
rows.push(row('add 400 chars of incompressible base64', base + '\n// ' + btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(300)))) + '\n'))
rows.push(row('delete 400 chars', base.slice(0, 2000) + base.slice(2400)))

const mean = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length
const r = (() => {
  const x = rows.map((p) => p[0]), y = rows.map((p) => p[1])
  const mx = mean(x), my = mean(y)
  const num = x.reduce((a, _, i) => a + (x[i] - mx) * (y[i] - my), 0)
  const den = Math.sqrt(x.reduce((a, v) => a + (v - mx) ** 2, 0) * y.reduce((a, v) => a + (v - my) ** 2, 0))
  return num / den
})()
console.log(`\nPearson r over all edits: ${r.toFixed(3)}`)
const noBlob = rows.slice(0, 3).concat([rows[4]])
const r2 = (() => {
  const x = noBlob.map((p) => p[0]), y = noBlob.map((p) => p[1])
  const mx = mean(x), my = mean(y)
  const num = x.reduce((a, _, i) => a + (x[i] - mx) * (y[i] - my), 0)
  const den = Math.sqrt(x.reduce((a, v) => a + (v - mx) ** 2, 0) * y.reduce((a, v) => a + (v - my) ** 2, 0))
  return num / den
})()
console.log(`excluding the incompressible blob: ${r2.toFixed(3)}`)
