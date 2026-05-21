import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'

const overridden = process.env.RESEARCH_DIRECTORY_DB_PATH
const dataDir = overridden
  ? path.dirname(overridden)
  : path.resolve(process.cwd(), 'api', '.data')
const dbPath = overridden ? overridden : path.join(dataDir, 'research-directory.sqlite')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

export const db = new Database(dbPath)

db.pragma('foreign_keys = ON')

db.exec(`
CREATE TABLE IF NOT EXISTS researchers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_zh TEXT,
  continent TEXT,
  country_or_region TEXT,
  institution TEXT,
  research_area TEXT,
  homepage_url TEXT,
  recruiting_url TEXT,
  email TEXT,
  phone TEXT,
  wechat TEXT,
  notes TEXT,
  group_name TEXT,
  follow_status TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_researchers_name ON researchers(name);
CREATE INDEX IF NOT EXISTS idx_researchers_institution ON researchers(institution);
CREATE INDEX IF NOT EXISTS idx_researchers_continent ON researchers(continent);
CREATE INDEX IF NOT EXISTS idx_researchers_country ON researchers(country_or_region);
CREATE INDEX IF NOT EXISTS idx_researchers_group ON researchers(group_name);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS researcher_tags (
  researcher_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (researcher_id, tag_id),
  FOREIGN KEY (researcher_id) REFERENCES researchers(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_researcher_tags_tag ON researcher_tags(tag_id);
`)

export function nowIso() {
  return new Date().toISOString()
}

export function normalizeKeyPart(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim().toLowerCase()
}
