import { db, nowIso, normalizeKeyPart } from '../db.js'

export type FollowStatus = 'todo' | 'contacted' | 'replied' | 'closed'

export type ResearcherRecord = {
  id: string
  name: string
  name_zh: string | null
  continent: string | null
  country_or_region: string | null
  institution: string | null
  research_area: string | null
  homepage_url: string | null
  recruiting_url: string | null
  email: string | null
  phone: string | null
  wechat: string | null
  notes: string | null
  group_name: string | null
  follow_status: FollowStatus | null
  created_at: string
  updated_at: string
}

export type ResearcherPatch = Partial<
  Omit<ResearcherRecord, 'id' | 'created_at' | 'updated_at'>
>

export type ListFilters = {
  q?: string
  continent?: string
  countryOrRegion?: string
  institution?: string
  groupName?: string
  followStatus?: FollowStatus
  tagIds?: string[]
}

function toDbValue(value: unknown) {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value === 'string') {
    const v = value.trim()
    return v.length ? v : null
  }
  return String(value)
}

export function findExistingIdByCompositeKey(input: {
  name: string
  institution?: string | null
  homepageUrl?: string | null
}) {
  const nameKey = normalizeKeyPart(input.name)
  const instKey = normalizeKeyPart(input.institution ?? '')
  const homeKey = normalizeKeyPart(input.homepageUrl ?? '')

  const row = db
    .prepare(
      `
      SELECT id
      FROM researchers
      WHERE lower(trim(name)) = ?
        AND lower(trim(COALESCE(institution, ''))) = ?
        AND lower(trim(COALESCE(homepage_url, ''))) = ?
      LIMIT 1
    `,
    )
    .get(nameKey, instKey, homeKey) as { id: string } | undefined

  return row?.id ?? null
}

export function upsertResearcher(params: {
  id: string
  record: Omit<ResearcherRecord, 'id' | 'created_at' | 'updated_at'>
  mode: 'insert' | 'update'
}) {
  const now = nowIso()
  const v = params.record

  if (params.mode === 'insert') {
    db.prepare(
      `
      INSERT INTO researchers (
        id, name, name_zh, continent, country_or_region, institution, research_area,
        homepage_url, recruiting_url, email, phone, wechat, notes, group_name, follow_status,
        created_at, updated_at
      ) VALUES (
        @id, @name, @name_zh, @continent, @country_or_region, @institution, @research_area,
        @homepage_url, @recruiting_url, @email, @phone, @wechat, @notes, @group_name, @follow_status,
        @created_at, @updated_at
      )
    `,
    ).run({
      id: params.id,
      name: toDbValue(v.name),
      name_zh: toDbValue(v.name_zh),
      continent: toDbValue(v.continent),
      country_or_region: toDbValue(v.country_or_region),
      institution: toDbValue(v.institution),
      research_area: toDbValue(v.research_area),
      homepage_url: toDbValue(v.homepage_url),
      recruiting_url: toDbValue(v.recruiting_url),
      email: toDbValue(v.email),
      phone: toDbValue(v.phone),
      wechat: toDbValue(v.wechat),
      notes: toDbValue(v.notes),
      group_name: toDbValue(v.group_name),
      follow_status: toDbValue(v.follow_status),
      created_at: now,
      updated_at: now,
    })
    return
  }

  db.prepare(
    `
    UPDATE researchers
    SET
      name = @name,
      name_zh = @name_zh,
      continent = @continent,
      country_or_region = @country_or_region,
      institution = @institution,
      research_area = @research_area,
      homepage_url = @homepage_url,
      recruiting_url = @recruiting_url,
      email = @email,
      phone = @phone,
      wechat = @wechat,
      notes = @notes,
      group_name = @group_name,
      follow_status = @follow_status,
      updated_at = @updated_at
    WHERE id = @id
  `,
  ).run({
    id: params.id,
    name: toDbValue(v.name),
    name_zh: toDbValue(v.name_zh),
    continent: toDbValue(v.continent),
    country_or_region: toDbValue(v.country_or_region),
    institution: toDbValue(v.institution),
    research_area: toDbValue(v.research_area),
    homepage_url: toDbValue(v.homepage_url),
    recruiting_url: toDbValue(v.recruiting_url),
    email: toDbValue(v.email),
    phone: toDbValue(v.phone),
    wechat: toDbValue(v.wechat),
    notes: toDbValue(v.notes),
    group_name: toDbValue(v.group_name),
    follow_status: toDbValue(v.follow_status),
    updated_at: now,
  })
}

export function getResearcherById(id: string) {
  const row = db
    .prepare(`SELECT * FROM researchers WHERE id = ?`)
    .get(id) as ResearcherRecord | undefined
  return row ?? null
}

export function listResearchers(filters: ListFilters) {
  const where: string[] = []
  const params: Record<string, unknown> = {}

  if (filters.q && filters.q.trim().length) {
    where.push(
      `(name LIKE @q OR name_zh LIKE @q OR institution LIKE @q OR research_area LIKE @q OR notes LIKE @q)`,
    )
    params.q = `%${filters.q.trim()}%`
  }

  if (filters.continent && filters.continent.trim().length) {
    where.push(`continent = @continent`)
    params.continent = filters.continent.trim()
  }

  if (filters.countryOrRegion && filters.countryOrRegion.trim().length) {
    where.push(`country_or_region = @country`)
    params.country = filters.countryOrRegion.trim()
  }

  if (filters.institution && filters.institution.trim().length) {
    where.push(`institution = @institution`)
    params.institution = filters.institution.trim()
  }

  if (filters.groupName && filters.groupName.trim().length) {
    where.push(`group_name = @groupName`)
    params.groupName = filters.groupName.trim()
  }

  if (filters.followStatus) {
    where.push(`follow_status = @followStatus`)
    params.followStatus = filters.followStatus
  }

  const tagIds = (filters.tagIds ?? []).filter((t) => t.trim().length)
  const tagJoinNeeded = tagIds.length > 0

  if (!tagJoinNeeded) {
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
    const rows = db
      .prepare(
        `
        SELECT *
        FROM researchers
        ${whereSql}
        ORDER BY updated_at DESC
      `,
      )
      .all(params) as ResearcherRecord[]
    return rows
  }

  tagIds.forEach((id, i) => {
    params[`tag_${i}`] = id
  })

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const tagWhere = `rt.tag_id IN (${tagIds.map((_, i) => `@tag_${i}`).join(', ')})`
  const fullWhere = whereSql.length
    ? `${whereSql} AND ${tagWhere}`
    : `WHERE ${tagWhere}`

  const rows = db
    .prepare(
      `
      SELECT r.*
      FROM researchers r
      JOIN researcher_tags rt ON rt.researcher_id = r.id
      ${fullWhere}
      GROUP BY r.id
      HAVING COUNT(DISTINCT rt.tag_id) = ${tagIds.length}
      ORDER BY r.updated_at DESC
    `,
    )
    .all(params) as ResearcherRecord[]
  return rows
}

export function updateResearcher(id: string, patch: ResearcherPatch) {
  const existing = getResearcherById(id)
  if (!existing) return null

  const next: Omit<ResearcherRecord, 'id' | 'created_at' | 'updated_at'> = {
    name: patch.name ?? existing.name,
    name_zh: (patch.name_zh ?? existing.name_zh) as string | null,
    continent: (patch.continent ?? existing.continent) as string | null,
    country_or_region: (patch.country_or_region ??
      existing.country_or_region) as string | null,
    institution: (patch.institution ?? existing.institution) as string | null,
    research_area: (patch.research_area ?? existing.research_area) as string | null,
    homepage_url: (patch.homepage_url ?? existing.homepage_url) as string | null,
    recruiting_url: (patch.recruiting_url ??
      existing.recruiting_url) as string | null,
    email: (patch.email ?? existing.email) as string | null,
    phone: (patch.phone ?? existing.phone) as string | null,
    wechat: (patch.wechat ?? existing.wechat) as string | null,
    notes: (patch.notes ?? existing.notes) as string | null,
    group_name: (patch.group_name ?? existing.group_name) as string | null,
    follow_status: (patch.follow_status ??
      existing.follow_status) as FollowStatus | null,
  }

  upsertResearcher({ id, record: next, mode: 'update' })
  return getResearcherById(id)
}
