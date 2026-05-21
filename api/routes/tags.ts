import { Router, type Request, type Response } from 'express'
import { createTag, listTags } from '../repositories/tags.js'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: listTags() })
})

router.post('/', (req: Request, res: Response) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const color = typeof req.body?.color === 'string' ? req.body.color.trim() : null

  if (!name.length) {
    res.status(400).json({ success: false, error: 'invalid_name' })
    return
  }

  try {
    const tag = createTag({ name, color })
    res.json({ success: true, data: tag })
  } catch {
    res.status(409).json({ success: false, error: 'duplicate' })
  }
})

export default router

