import crypto from 'crypto'
import * as XLSX from 'xlsx'
import { findExistingIdByCompositeKey, upsertResearcher } from '../repositories/researchers.js'

export type ImportField =
  | 'name'
  | 'nameZh'
  | 'continent'
  | 'countryOrRegion'
  | 'institution'
  | 'researchArea'
  | 'homepageUrl'
  | 'recruitingUrl'
  | 'email'
  | 'phone'
  | 'wechat'
  | 'notes'

export type FieldMapping = Partial<Record<ImportField, string>>

export type ImportMode = 'skip' | 'update' | 'insert'

export type SheetPreview = {
  sheetName: string
  rowCount: number
  columns: string[]
  previewRows: Record<string, unknown>[]
}

const defaultFieldOrder: ImportField[] = [
  'name',
  'nameZh',
  'continent',
  'countryOrRegion',
  'institution',
  'researchArea',
  'homepageUrl',
  'recruitingUrl',
  'email',
  'phone',
  'wechat',
  'notes',
]

function str(v: unknown) {
  if (v === undefined || v === null) return null
  if (typeof v === 'string') {
    const t = v.trim()
    return t.length ? t : null
  }
  return String(v).trim().length ? String(v).trim() : null
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '')
}

function inferMapping(columns: string[]): FieldMapping {
  const map: FieldMapping = {}
  const normToOriginal = new Map<string, string>()
  for (const c of columns) normToOriginal.set(normalizeHeader(c), c)

  const candidates: Record<ImportField, string[]> = {
    name: ['姓名', 'name', 'researcher', 'pi', '导师', '教师', 'professor'],
    nameZh: ['中文名', '姓名中文', 'namezh', 'name_zh'],
    continent: ['大洲', 'continent', 'regioncontinent'],
    countryOrRegion: ['国家', '国别', '国家地区', 'country', 'countryorregion', '地区'],
    institution: ['学校', '院校', '单位', '机构', 'institution', 'university', 'affiliation'],
    researchArea: ['研究方向', '方向', 'research', 'researcharea', 'interests', 'topic'],
    homepageUrl: ['个人主页', '主页', 'homepage', 'website', 'url'],
    recruitingUrl: ['招生网站', '招生', 'recruit', 'admission', 'position', 'phd', 'job'],
    email: ['邮箱', 'email', 'mail'],
    phone: ['电话', '手机', 'phone', 'tel'],
    wechat: ['微信', 'wechat', 'wx'],
    notes: ['备注', 'notes', 'comment', 'memo'],
  }

  for (const field of defaultFieldOrder) {
    const keys = candidates[field]
    const found = Array.from(normToOriginal.entries()).find(([norm]) =>
      keys.some((k) => norm.includes(normalizeHeader(k))),
    )
    if (found) map[field] = found[1]
  }

  return map
}

function splitName(value: string) {
  const trimmed = value.trim()
  const m = trimmed.match(/^(.+?)\s*\((.+?)\)\s*$/)
  if (!m) return { name: trimmed, nameZh: null as string | null }
  return { name: m[1].trim(), nameZh: m[2].trim() }
}

function normalizeCountryOrRegion(value: string | null) {
  if (!value) return null
  const v = value.trim()
  if (!v.length) return null
  const upper = v.toUpperCase()

  const direct: Record<string, string> = {
    HK: 'Hong Kong',
    HONGKONG: 'Hong Kong',
    'HONG KONG': 'Hong Kong',
    US: 'United States of America',
    USA: 'United States of America',
    'U.S.': 'United States of America',
    'U.S.A.': 'United States of America',
    UK: 'United Kingdom',
    'U.K.': 'United Kingdom',
  }

  const hit = direct[upper.replace(/\s+/g, ' ')]
  return hit ?? v
}

export function previewWorkbook(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const previews: SheetPreview[] = []

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
      raw: false,
    })

    const columns = Array.from(
      new Set(rows.flatMap((r) => Object.keys(r))),
    ).filter((c) => c.trim().length)

    previews.push({
      sheetName,
      rowCount: rows.length,
      columns,
      previewRows: rows.slice(0, 10),
    })
  }

  const allColumns = Array.from(
    new Set(previews.flatMap((p) => p.columns)),
  )

  return {
    sheets: previews,
    suggestedMapping: inferMapping(allColumns),
    fields: defaultFieldOrder,
  }
}

export function commitWorkbook(params: {
  buffer: Buffer
  selectedSheets: string[]
  mapping: FieldMapping
  mode: ImportMode
}) {
  const workbook = XLSX.read(params.buffer, { type: 'buffer' })
  const mapping = params.mapping
  const selectedSheets = params.selectedSheets.length
    ? params.selectedSheets
    : workbook.SheetNames

  let inserted = 0
  let updated = 0
  let skipped = 0
  let invalid = 0

  for (const sheetName of workbook.SheetNames) {
    if (!selectedSheets.includes(sheetName)) continue

    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: null,
      raw: false,
    })

    for (const row of rows) {
      const rawName = mapping.name ? str(row[mapping.name]) : null
      if (!rawName) {
        invalid += 1
        continue
      }

      const nameParts = splitName(rawName)
      const nameZh =
        (mapping.nameZh ? str(row[mapping.nameZh]) : null) ?? nameParts.nameZh

      const record = {
        name: nameParts.name,
        name_zh: nameZh,
        continent: mapping.continent ? str(row[mapping.continent]) : null,
        country_or_region: normalizeCountryOrRegion(
          mapping.countryOrRegion ? str(row[mapping.countryOrRegion]) : null,
        ),
        institution: mapping.institution ? str(row[mapping.institution]) : null,
        research_area: mapping.researchArea ? str(row[mapping.researchArea]) : null,
        homepage_url: mapping.homepageUrl ? str(row[mapping.homepageUrl]) : null,
        recruiting_url: mapping.recruitingUrl
          ? str(row[mapping.recruitingUrl])
          : null,
        email: mapping.email ? str(row[mapping.email]) : null,
        phone: mapping.phone ? str(row[mapping.phone]) : null,
        wechat: mapping.wechat ? str(row[mapping.wechat]) : null,
        notes: mapping.notes ? str(row[mapping.notes]) : null,
        group_name: sheetName,
        follow_status: null,
      }

      const existingId = findExistingIdByCompositeKey({
        name: record.name,
        institution: record.institution,
        homepageUrl: record.homepage_url,
      })

      if (existingId) {
        if (params.mode === 'skip') {
          skipped += 1
          continue
        }
        if (params.mode === 'insert') {
          const id = crypto.randomUUID()
          upsertResearcher({ id, record, mode: 'insert' })
          inserted += 1
          continue
        }

        upsertResearcher({ id: existingId, record, mode: 'update' })
        updated += 1
        continue
      }

      const id = crypto.randomUUID()
      upsertResearcher({ id, record, mode: 'insert' })
      inserted += 1
    }
  }

  return {
    inserted,
    updated,
    skipped,
    invalid,
  }
}
