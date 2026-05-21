import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { apiGet } from '@/lib/api'
import Badge from '@/components/ui/Badge'

type Summary = { total: number; continents: number; countries: number; recent7d: number }
type StatRow = { key: string; count: number }

const geoUrl = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json'

function normalizeKey(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

function colorForCount(c: number) {
  if (c <= 0) return 'rgba(24,24,27,0.06)'
  if (c === 1) return 'rgba(37,99,235,0.20)'
  if (c <= 3) return 'rgba(37,99,235,0.32)'
  if (c <= 6) return 'rgba(37,99,235,0.44)'
  if (c <= 10) return 'rgba(37,99,235,0.56)'
  return 'rgba(37,99,235,0.70)'
}

export default function Insights() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [byContinent, setByContinent] = useState<StatRow[]>([])
  const [byCountry, setByCountry] = useState<StatRow[]>([])

  useEffect(() => {
    apiGet<Summary>('/api/stats/summary').then((r) => {
      if (r.success) setSummary(r.data)
    })
    apiGet<StatRow[]>('/api/stats/by-continent').then((r) => {
      if (r.success) setByContinent(r.data)
    })
    apiGet<StatRow[]>('/api/stats/by-country').then((r) => {
      if (r.success) setByCountry(r.data)
    })
  }, [])

  const countryCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of byCountry) m.set(normalizeKey(r.key), r.count)
    return m
  }, [byCountry])

  const countryKeyToLabel = useMemo(() => {
    const m = new Map<string, string>()
    for (const r of byCountry) m.set(normalizeKey(r.key), r.key)
    return m
  }, [byCountry])

  const topCountries = useMemo(() => byCountry.slice(0, 12), [byCountry])

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
        <div className="text-lg font-semibold tracking-tight">统计与地图</div>
        <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          点击地图或国家榜单可直接联动筛选通讯录
        </div>
      </div>

      {summary ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">总人数</div>
            <div className="mt-2 text-2xl font-semibold">{summary.total}</div>
          </div>
          <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">国家/地区数</div>
            <div className="mt-2 text-2xl font-semibold">{summary.countries}</div>
          </div>
          <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">大洲数</div>
            <div className="mt-2 text-2xl font-semibold">{summary.continents}</div>
          </div>
          <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">近 7 天新增</div>
            <div className="mt-2 text-2xl font-semibold">{summary.recent7d}</div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">世界分布（按国家/地区）</div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Badge>浅 → 深</Badge>
              <span>人数</span>
            </div>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200/70 bg-white/40 dark:border-zinc-800/60 dark:bg-zinc-950/30">
            <ComposableMap projectionConfig={{ scale: 145 }} style={{ width: '100%', height: 'auto' }}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const rawName =
                      (geo.properties as any)?.name ??
                      (geo.properties as any)?.NAME ??
                      ''
                    const key = normalizeKey(String(rawName))
                    const c = countryCounts.get(key) ?? 0
                    const label = countryKeyToLabel.get(key) ?? String(rawName)

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={colorForCount(c)}
                        stroke="rgba(24,24,27,0.10)"
                        style={{
                          default: { outline: 'none' },
                          hover: { outline: 'none', fill: colorForCount(Math.max(c, 1)) },
                          pressed: { outline: 'none' },
                        }}
                        onClick={() => {
                          if (!label || label === 'Unknown') return
                          const sp = new URLSearchParams()
                          sp.set('countryOrRegion', label)
                          navigate(`/?${sp.toString()}`)
                        }}
                      />
                    )
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>
          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            地图匹配依赖国家/地区名称一致性；如你的 Excel 使用缩写（例如 HK/US），建议导入后统一名称以获得更准确的着色。
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
            <div className="text-sm font-semibold">按大洲统计</div>
            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byContinent} margin={{ left: 8, right: 8 }}>
                  <XAxis dataKey="key" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={28} />
                  <Tooltip />
                  <Bar dataKey="count" fill="rgba(37,99,235,0.75)" radius={[6, 6, 2, 2]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
            <div className="text-sm font-semibold">国家/地区 Top</div>
            <div className="mt-3 space-y-2">
              {topCountries.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => {
                    const sp = new URLSearchParams()
                    sp.set('countryOrRegion', r.key)
                    navigate(`/?${sp.toString()}`)
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-200/70 bg-white/60 px-3 py-2 text-left text-sm text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-800/60 dark:bg-zinc-950/30 dark:text-zinc-100 dark:hover:bg-zinc-900/60"
                >
                  <span className="truncate">{r.key}</span>
                  <Badge tone="gold">{r.count}</Badge>
                </button>
              ))}
              {!topCountries.length ? (
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  还没有数据，先去导入吧
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

