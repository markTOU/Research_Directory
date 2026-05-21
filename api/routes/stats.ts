import { Router, type Request, type Response } from 'express'
import { db } from '../db.js'

const router = Router()

router.get('/summary', (req: Request, res: Response) => {
  const total = db.prepare(`SELECT COUNT(*) as c FROM researchers`).get() as {
    c: number
  }
  const continents = db
    .prepare(
      `SELECT COUNT(DISTINCT continent) as c FROM researchers WHERE continent IS NOT NULL AND trim(continent) != ''`,
    )
    .get() as { c: number }
  const countries = db
    .prepare(
      `SELECT COUNT(DISTINCT country_or_region) as c FROM researchers WHERE country_or_region IS NOT NULL AND trim(country_or_region) != ''`,
    )
    .get() as { c: number }

  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  const recent = db
    .prepare(`SELECT COUNT(*) as c FROM researchers WHERE created_at >= ?`)
    .get(since) as { c: number }

  res.json({
    success: true,
    data: {
      total: total.c,
      continents: continents.c,
      countries: countries.c,
      recent7d: recent.c,
    },
  })
})

router.get('/by-continent', (req: Request, res: Response) => {
  const rows = db
    .prepare(
      `
      SELECT COALESCE(continent, 'Unknown') as key, COUNT(*) as count
      FROM researchers
      GROUP BY COALESCE(continent, 'Unknown')
      ORDER BY count DESC
    `,
    )
    .all() as { key: string; count: number }[]
  res.json({ success: true, data: rows })
})

router.get('/by-country', (req: Request, res: Response) => {
  const rows = db
    .prepare(
      `
      SELECT COALESCE(country_or_region, 'Unknown') as key, COUNT(*) as count
      FROM researchers
      GROUP BY COALESCE(country_or_region, 'Unknown')
      ORDER BY count DESC
      LIMIT 200
    `,
    )
    .all() as { key: string; count: number }[]
  res.json({ success: true, data: rows })
})

router.get('/facets', (req: Request, res: Response) => {
  const continents = db
    .prepare(
      `SELECT DISTINCT continent as v FROM researchers WHERE continent IS NOT NULL AND trim(continent) != '' ORDER BY continent`,
    )
    .all() as { v: string }[]
  const countries = db
    .prepare(
      `SELECT DISTINCT country_or_region as v FROM researchers WHERE country_or_region IS NOT NULL AND trim(country_or_region) != '' ORDER BY country_or_region`,
    )
    .all() as { v: string }[]
  const groups = db
    .prepare(
      `SELECT DISTINCT group_name as v FROM researchers WHERE group_name IS NOT NULL AND trim(group_name) != '' ORDER BY group_name`,
    )
    .all() as { v: string }[]

  res.json({
    success: true,
    data: {
      continents: continents.map((x) => x.v),
      countries: countries.map((x) => x.v),
      groups: groups.map((x) => x.v),
    },
  })
})

export default router

