import { createApp } from 'json-server/lib/app.js'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { NormalizedAdapter } from 'json-server/lib/adapters/normalized-adapter.js'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, '..', 'db.json')

// Singleton: fonksiyon her çağrıldığında yeniden oluşturma
let appInstance = null

async function getApp() {
  if (appInstance) return appInstance
  const adapter = new JSONFile(dbPath)
  const normalizedAdapter = new NormalizedAdapter(adapter)
  const db = new Low(normalizedAdapter, {})
  await db.read()
  appInstance = createApp(db, { logger: false })
  return appInstance
}

export default async function handler(req, res) {
  try {
    const app = await getApp()

    // Vercel, /api/users → /api/server?path=users şeklinde rewrite yapar.
    // Bu yüzden path query param'ından gerçek resource path'ini yeniden kuruyoruz.
    const pathValue = req.query?.path ?? ''
    const pathStr = Array.isArray(pathValue) ? pathValue.join('/') : pathValue

    // Diğer query param'larını koru (örn. ?role=student), sadece 'path'i sil
    const url = new URL(req.url, 'http://localhost')
    url.searchParams.delete('path')
    const remainingQuery = url.searchParams.toString()

    req.url = '/' + pathStr + (remainingQuery ? '?' + remainingQuery : '')

    app.handler(req, res)
  } catch (err) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: err.message, stack: err.stack }))
  }
}
