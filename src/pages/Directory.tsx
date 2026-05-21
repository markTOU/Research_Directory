import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ExternalLink, Search, X } from 'lucide-react'
import { apiGet, isApiError } from '@/lib/api'
import type { Researcher, Tag } from '@/lib/types'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

type Facets = {
  continents: string[]
  countries: string[]
  groups: string[]
}

type ResearcherListItem = Researcher & { tagIds: string[] }

function statusLabel(v: string | null) {
  if (v === 'todo') return '待联系'
  if (v === 'contacted') return '已联系'
  if (v === 'replied') return '已回信'
  if (v === 'closed') return '已结束'
  return '未设置'
}

function buildQuery(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v && v.trim().length) sp.set(k, v.trim())
  }
  const s = sp.toString()
  return s.length ? `?${s}` : ''
}

export default function Directory() {
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const continent = searchParams.get('continent') ?? ''
  const countryOrRegion = searchParams.get('countryOrRegion') ?? ''
  const groupName = searchParams.get('groupName') ?? ''
  const followStatus = searchParams.get('followStatus') ?? ''
  const tagIds = (searchParams.get('tagIds') ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const [facets, setFacets] = useState<Facets>({
    continents: [],
    countries: [],
    groups: [],
  })
  const [tags, setTags] = useState<Tag[]>([])
  const [rows, setRows] = useState<ResearcherListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tagMap = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags])

  useEffect(() => {
    apiGet<Facets>('/api/stats/facets').then((r) => {
      if (r.success) setFacets(r.data)
    })
    apiGet<Tag[]>('/api/tags').then((r) => {
      if (r.success) setTags(r.data)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)

    const query = buildQuery({
      q,
      continent,
      countryOrRegion,
      groupName,
      followStatus,
      tagIds: tagIds.length ? tagIds.join(',') : undefined,
    })

    apiGet<ResearcherListItem[]>(`/api/researchers${query}`)
      .then((r) => {
        if (isApiError(r)) {
          setError(r.error)
          setRows([])
          return
        }
        setRows(r.data)
      })
      .finally(() => setLoading(false))
  }, [q, continent, countryOrRegion, groupName, followStatus, tagIds.join(',')])

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (!value.trim().length) next.delete(key)
    else next.set(key, value)
    setSearchParams(next)
  }

  function toggleTag(id: string) {
    const next = new Set(tagIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setParam('tagIds', Array.from(next).join(','))
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams())
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold tracking-tight">通讯录</div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {loading ? '正在查询…' : `共 ${rows.length} 条`}
              {error ? `（错误：${error}）` : ''}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X size={16} />
              清除筛选
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <Input
                value={q}
                onChange={(e) => setParam('q', e.target.value)}
                placeholder="搜索：姓名 / 学校 / 研究方向 / 备注…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <Select
              value={continent}
              onChange={(e) => setParam('continent', e.target.value)}
            >
              <option value="">大洲（全部）</option>
              {facets.continents.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-2">
            <Select
              value={countryOrRegion}
              onChange={(e) => setParam('countryOrRegion', e.target.value)}
            >
              <option value="">国家/地区（全部）</option>
              {facets.countries.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-2">
            <Select
              value={groupName}
              onChange={(e) => setParam('groupName', e.target.value)}
            >
              <option value="">分组（全部）</option>
              {facets.groups.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-1">
            <Select
              value={followStatus}
              onChange={(e) => setParam('followStatus', e.target.value)}
            >
              <option value="">状态</option>
              <option value="todo">待联系</option>
              <option value="contacted">已联系</option>
              <option value="replied">已回信</option>
              <option value="closed">已结束</option>
            </Select>
          </div>
        </div>

        {tags.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => {
              const active = tagIds.includes(t.id)
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs font-medium transition',
                    active
                      ? 'border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
                      : 'border-zinc-200 bg-white/70 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200 dark:hover:bg-zinc-900/60',
                  )}
                >
                  {t.name}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/researcher/${r.id}`}
                    className="truncate text-base font-semibold tracking-tight hover:underline"
                  >
                    {r.name}
                  </Link>
                  {r.name_zh ? <Badge>{r.name_zh}</Badge> : null}
                  {r.group_name ? <Badge tone="gold">{r.group_name}</Badge> : null}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {r.institution ? <span className="truncate">{r.institution}</span> : null}
                  {r.country_or_region ? (
                    <span className="truncate">· {r.country_or_region}</span>
                  ) : null}
                  {r.continent ? <span className="truncate">· {r.continent}</span> : null}
                </div>
                {r.research_area ? (
                  <div className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {r.research_area}
                  </div>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <Badge tone="blue">{statusLabel(r.follow_status)}</Badge>
                <div className="flex items-center gap-2">
                  {r.homepage_url ? (
                    <a
                      href={r.homepage_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white/60 px-3 text-xs font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:hover:bg-zinc-900/60"
                    >
                      <ExternalLink size={14} />
                      主页
                    </a>
                  ) : null}
                  {r.recruiting_url ? (
                    <a
                      href={r.recruiting_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white/60 px-3 text-xs font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:hover:bg-zinc-900/60"
                    >
                      <ExternalLink size={14} />
                      招生
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            {r.tagIds.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {r.tagIds.map((id) => {
                  const t = tagMap.get(id)
                  if (!t) return null
                  return <Badge key={id}>{t.name}</Badge>
                })}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
