import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import { commitWorkbook, previewWorkbook, type FieldMapping } from '../services/importer.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post(
  '/xlsx',
  upload.single('file'),
  (req: Request, res: Response) => {
    const file = req.file
    if (!file?.buffer) {
      res.status(400).json({ success: false, error: 'missing_file' })
      return
    }

    try {
      const result = previewWorkbook(file.buffer)
      res.json({ success: true, data: result })
    } catch {
      res.status(400).json({ success: false, error: 'parse_failed' })
    }
  },
)

router.post(
  '/commit',
  upload.single('file'),
  (req: Request, res: Response) => {
    const file = req.file
    if (!file?.buffer) {
      res.status(400).json({ success: false, error: 'missing_file' })
      return
    }

    const mode =
      req.body?.mode === 'skip' || req.body?.mode === 'update' || req.body?.mode === 'insert'
        ? req.body.mode
        : 'update'

    const selectedSheets: string[] = (() => {
      if (typeof req.body?.selectedSheets !== 'string') return []
      try {
        const parsed = JSON.parse(req.body.selectedSheets)
        if (Array.isArray(parsed)) return parsed.map(String)
      } catch {}
      return []
    })()

    const mapping: FieldMapping = (() => {
      if (typeof req.body?.mapping !== 'string') return {}
      try {
        const parsed = JSON.parse(req.body.mapping) as Record<string, unknown>
        const next: Record<string, string> = {}
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === 'string' && v.trim().length) next[k] = v.trim()
        }
        return next
      } catch {
        return {}
      }
    })()

    try {
      const result = commitWorkbook({
        buffer: file.buffer,
        selectedSheets: selectedSheets.length ? selectedSheets : [],
        mapping,
        mode,
      })
      res.json({ success: true, data: result })
    } catch {
      res.status(400).json({ success: false, error: 'commit_failed' })
    }
  },
)

export default router

