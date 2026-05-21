import { Router, type Request, type Response } from 'express'
import { db } from '../db.js'
import {
  getResearcherById,
  listResearchers,
  updateResearcher,
  type FollowStatus,
} from '../repositories/researchers.js'
import {
  getResearcherTagIds,
  setResearcherTags,
} from '../repositories/tags.js'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const q = typeof req.query.q === 'string' ? req.query.q : undefined
  const continent =
    typeof req.query.continent === 'string' ? req.query.continent : undefined
  const countryOrRegion =
    typeof req.query.countryOrRegion === 'string'
      ? req.query.countryOrRegion
      : undefined
  const institution =
    typeof req.query.institution === 'string' ? req.query.institution : undefined
  const groupName =
    typeof req.query.groupName === 'string' ? req.query.groupName : undefined
  const followStatus =
    typeof req.query.followStatus === 'string'
      ? (req.query.followStatus as FollowStatus)
      : undefined
  const tagIds =
    typeof req.query.tagIds === 'string'
      ? req.query.tagIds.split(',').map((t) => t.trim()).filter(Boolean)
      : []

  const rows = listResearchers({
    q,
    continent,
    countryOrRegion,
    institution,
    groupName,
    followStatus,
    tagIds,
  })

  if (!rows.length) {
    res.json({ success: true, data: [] })
    return
  }

  const idParams = rows.map((_, i) => `@id_${i}`).join(', ')
  const params: Record<string, string> = {}
  rows.forEach((r, i) => {
    params[`id_${i}`] = r.id
  })

  const tagRows = db
    .prepare(
      `SELECT researcher_id as researcherId, tag_id as tagId FROM researcher_tags WHERE researcher_id IN (${idParams})`,
    )
    .all(params) as { researcherId: string; tagId: string }[]

  const tagMap = new Map<string, string[]>()
  for (const tr of tagRows) {
    const arr = tagMap.get(tr.researcherId) ?? []
    arr.push(tr.tagId)
    tagMap.set(tr.researcherId, arr)
  }

  res.json({
    success: true,
    data: rows.map((r) => ({ ...r, tagIds: tagMap.get(r.id) ?? [] })),
  })
})

router.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id
  const row = getResearcherById(id)
  if (!row) {
    res.status(404).json({ success: false, error: 'not_found' })
    return
  }

  const tagIds = getResearcherTagIds(id)
  res.json({ success: true, data: { ...row, tagIds } })
})

router.patch('/:id', (req: Request, res: Response) => {
  const id = req.params.id
  const patch = req.body ?? {}
  const next = updateResearcher(id, patch)
  if (!next) {
    res.status(404).json({ success: false, error: 'not_found' })
    return
  }
  res.json({ success: true, data: next })
})

router.put('/:id/tags', (req: Request, res: Response) => {
  const id = req.params.id
  const tagIds = Array.isArray(req.body?.tagIds)
    ? (req.body.tagIds as unknown[]).map(String)
    : []

  const row = getResearcherById(id)
  if (!row) {
    res.status(404).json({ success: false, error: 'not_found' })
    return
  }

  setResearcherTags(id, tagIds)
  res.json({ success: true, data: { tagIds: getResearcherTagIds(id) } })
})

export default router
