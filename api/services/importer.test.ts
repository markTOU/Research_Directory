import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import * as XLSX from 'xlsx'

test('xlsx preview + commit (insert/update)', async () => {
  process.env.RESEARCH_DIRECTORY_DB_PATH = path.join(
    os.tmpdir(),
    `research-directory-test-${crypto.randomUUID()}.sqlite`,
  )

  const { previewWorkbook, commitWorkbook } = await import('./importer.js')
  const { db } = await import('../db.js')

  const sheetName = 'External PI'
  const rows = [
    {
      姓名: 'Changhong Zhao (赵常宏)',
      大洲: 'Asia',
      国别: 'HK',
      学校: 'Chinese University of Hong Kong',
      研究方向: 'AI security',
      个人主页: 'https://example.com',
      招生网站: 'https://example.com/admission',
    },
  ]

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer

  const preview = previewWorkbook(buffer)
  assert.equal(preview.sheets.length, 1)
  assert.equal(preview.sheets[0].sheetName, sheetName)
  assert.equal(preview.suggestedMapping.name, '姓名')
  assert.equal(preview.suggestedMapping.countryOrRegion, '国别')

  const r1 = commitWorkbook({
    buffer,
    selectedSheets: [],
    mapping: preview.suggestedMapping,
    mode: 'insert',
  })
  assert.equal(r1.inserted, 1)
  assert.equal(r1.updated, 0)

  const count1 = db.prepare(`SELECT COUNT(*) as c FROM researchers`).get() as {
    c: number
  }
  assert.equal(count1.c, 1)

  const rows2 = [
    {
      姓名: 'Changhong Zhao (赵常宏)',
      大洲: 'Asia',
      国别: 'Hong Kong',
      学校: 'Chinese University of Hong Kong',
      研究方向: 'Updated Area',
      个人主页: 'https://example.com',
      招生网站: 'https://example.com/admission',
    },
  ]
  const wb2 = XLSX.utils.book_new()
  const ws2 = XLSX.utils.json_to_sheet(rows2)
  XLSX.utils.book_append_sheet(wb2, ws2, sheetName)
  const buffer2 = XLSX.write(wb2, { type: 'buffer', bookType: 'xlsx' }) as Buffer

  const r2 = commitWorkbook({
    buffer: buffer2,
    selectedSheets: [sheetName],
    mapping: preview.suggestedMapping,
    mode: 'update',
  })
  assert.equal(r2.updated, 1)

  const updated = db
    .prepare(`SELECT research_area as v, country_or_region as c FROM researchers LIMIT 1`)
    .get() as { v: string; c: string }
  assert.equal(updated.v, 'Updated Area')
  assert.equal(updated.c, 'Hong Kong')
})

