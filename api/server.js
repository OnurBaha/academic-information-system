import { createApp } from 'json-server/lib/app.js'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { NormalizedAdapter } from 'json-server/lib/adapters/normalized-adapter.js'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = join(__dirname, '..', 'db.json')

// Lowdb adapter + json-server v1 app
const adapter = new JSONFile(dbPath)
const normalizedAdapter = new NormalizedAdapter(adapter)
const db = new Low(normalizedAdapter, {})
await db.read()

// json-server v1'in createApp fonksiyonu bir tinyhttp App döndürür.
// Vercel, Node.js http.IncomingMessage ve http.ServerResponse ile çalışır,
// bu yüzden tinyhttp app handler'ını doğrudan export ediyoruz.
const app = createApp(db, { logger: false })

// Vercel serverless function handler
export default function handler(req, res) {
  // /api prefix'ini soy: /api/users → /users
  req.url = req.url.replace(/^\/api/, '') || '/'
  // tinyhttp app'i express gibi (req, res, next) kabul eder
  app.handler(req, res)
}
