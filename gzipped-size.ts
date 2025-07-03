import * as zlib from 'zlib'
import * as fs from 'fs'
import * as util from 'util'
import * as path from 'path'

// Promisify zlib.gzip and fs.stat for easier async/await usage
const gzip = util.promisify(zlib.gzip)
const stat = util.promisify(fs.stat)
const unlink = util.promisify(fs.unlink)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

/**
 * Gzips a file, gets the size of the gzipped file, and then deletes the gzipped file.
 * This function should work on macOS, Windows, and Linux without external dependencies.
 *
 * @param filePath The path to the file to be gzipped.
 * @returns A Promise that resolves with the size of the gzipped file in bytes.
 * @throws An error if any step (gzipping, stat, or deletion) fails.
 */
export async function gzippedSize(filePath: string): Promise<number> {
  const gzippedFilePath = `${filePath}.gz`

  try {
    // 1. Read the file content
    const fileContent = await readFile(filePath)

    // 2. Gzip the file content
    const gzippedContent = await gzip(fileContent)

    // 3. Write the gzipped content to a new file
    await writeFile(gzippedFilePath, gzippedContent)

    // 4. Get the size of the gzipped file
    const stats = await stat(gzippedFilePath)
    const gzippedSize = stats.size

    // 5. Delete the gzipped archive
    await unlink(gzippedFilePath)

    return gzippedSize
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error)
    // Attempt to clean up the gzipped file if it was created before the error
    try {
      await unlink(gzippedFilePath)
    } catch (cleanupError) {
      // Ignore cleanup errors, the primary error is more important
    }
    throw error // Re-throw the original error
  }
}
