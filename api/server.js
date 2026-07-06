import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, '..', 'db.json')

// In-memory store — cold start'ta db.json'dan yüklenir
// Vercel'de writes geçicidir (fonksiyon kapanınca sıfırlanır), demo için yeterli
let store = null
function getStore() {
  if (!store) store = JSON.parse(readFileSync(dbPath, 'utf-8'))
  return store
}

function send(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  res.end(JSON.stringify(data))
}

async function readBody(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => { raw += chunk })
    req.on('end', () => { try { resolve(JSON.parse(raw)) } catch { resolve({}) } })
  })
}

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 200
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.end()
  }

  try {
    const db = getStore()

    // Vercel rewrites /api/users → /api/server?path=users
    // /api/users/123 → /api/server?path=users%2F123 ya da path=users&path=123
    const rawPath = req.query?.path ?? ''
    const segments = Array.isArray(rawPath)
      ? rawPath
      : rawPath.split('/').filter(Boolean)

    const resource = segments[0]
    const id = segments[1]

    // Kök endpoint: tüm collection isimlerini listele
    if (!resource) return send(res, 200, Object.keys(db))

    // Collection bulunamazsa 404
    if (!(resource in db)) {
      return send(res, 404, { error: `'${resource}' collection bulunamadı` })
    }

    const collection = db[resource]

    // ─── GET ────────────────────────────────────────────────────────────────
    if (req.method === 'GET') {
      if (id !== undefined) {
        const item = Array.isArray(collection)
          ? collection.find((i) => String(i.id) === String(id))
          : null
        return item
          ? send(res, 200, item)
          : send(res, 404, { error: 'Not Found' })
      }

      // Collection döndür + query param filtreleme (path hariç)
      let data = Array.isArray(collection) ? [...collection] : collection
      if (Array.isArray(data)) {
        const { path: _p, ...filters } = req.query ?? {}
        for (const [key, value] of Object.entries(filters)) {
          if (!key.startsWith('_')) {
            data = data.filter((item) => String(item[key]) === String(value))
          }
        }
      }
      return send(res, 200, data)
    }

    // ─── POST ───────────────────────────────────────────────────────────────
    if (req.method === 'POST') {
      if (!Array.isArray(collection)) return send(res, 400, { error: 'POST sadece array collection\'lara yapılabilir' })
      const body = await readBody(req)
      const newItem = { id: String(Date.now()), ...body }
      collection.push(newItem)
      return send(res, 201, newItem)
    }

    // ─── PUT / PATCH ─────────────────────────────────────────────────────────
    if (req.method === 'PUT' || req.method === 'PATCH') {
      if (!id) return send(res, 400, { error: 'PUT/PATCH için ID gerekli' })
      if (!Array.isArray(collection)) return send(res, 400, { error: 'Array olmayan collection güncellenemez' })
      const idx = collection.findIndex((i) => String(i.id) === String(id))
      if (idx === -1) return send(res, 404, { error: 'Not Found' })
      const body = await readBody(req)
      collection[idx] = req.method === 'PUT'
        ? { id, ...body }
        : { ...collection[idx], ...body }
      return send(res, 200, collection[idx])
    }

    // ─── DELETE ─────────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      if (!id) return send(res, 400, { error: 'DELETE için ID gerekli' })
      if (!Array.isArray(collection)) return send(res, 400, { error: 'Array olmayan collection\'dan silinemez' })
      const idx = collection.findIndex((i) => String(i.id) === String(id))
      if (idx === -1) return send(res, 404, { error: 'Not Found' })
      const [deleted] = collection.splice(idx, 1)
      return send(res, 200, deleted)
    }

    send(res, 405, { error: 'Method Not Allowed' })
  } catch (err) {
    send(res, 500, { error: err.message })
  }
}
