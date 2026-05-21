import { db, nowIso } from '../db.js'
import crypto from 'crypto'

export type TagRecord = {
  id: string
  name: string
  color: string | null
  created_at: string
}

export function listTags() {
  return db.prepare(`SELECT * FROM tags ORDER BY name ASC`).all() as TagRecord[]
}

export function createTag(input: { name: string; color?: string | null }) {
  const name = input.name.trim()
  const id = crypto.randomUUID()
  const createdAt = nowIso()
  const color = input.color ? input.color.trim() : null

  db.prepare(
    `INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)`,
  ).run(id, name, color, createdAt)

  return db.prepare(`SELECT * FROM tags WHERE id = ?`).get(id) as TagRecord
}

export function setResearcherTags(researcherId: string, tagIds: string[]) {
  const tx = db.transaction(() => {
    db.prepare(`DELETE FROM researcher_tags WHERE researcher_id = ?`).run(
      researcherId,
    )

    const stmt = db.prepare(
      `INSERT INTO researcher_tags (researcher_id, tag_id, created_at) VALUES (?, ?, ?)`,
    )
    const now = nowIso()
    for (const tagId of tagIds) {
      stmt.run(researcherId, tagId, now)
    }
  })
  tx()
}

export function getResearcherTagIds(researcherId: string) {
  const rows = db
    .prepare(
      `SELECT tag_id as tagId FROM researcher_tags WHERE researcher_id = ? ORDER BY tag_id`,
    )
    .all(researcherId) as { tagId: string }[]
  return rows.map((r) => r.tagId)
}

