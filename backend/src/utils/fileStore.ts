import { promises as fs } from 'fs'
import { resolve } from 'path'

const baseDir = resolve(process.cwd(), 'data')

async function ensureDir() {
  await fs.mkdir(baseDir, { recursive: true })
}

export async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    await ensureDir()
    const fullPath = resolve(baseDir, fileName)
    const data = await fs.readFile(fullPath, 'utf8')
    return JSON.parse(data) as T
  } catch {
    return fallback
  }
}

export async function writeJson<T>(fileName: string, data: T): Promise<void> {
  await ensureDir()
  const fullPath = resolve(baseDir, fileName)
  await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf8')
}


