import { useMemo, useState } from 'react'
import { CheckCircle2, FileSpreadsheet, Upload, Wand2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import { apiForm, isApiError } from '@/lib/api'

type ImportField =
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

type PreviewData = {
  sheets: {
    sheetName: string
    rowCount: number
    columns: string[]
    previewRows: Record<string, unknown>[]
  }[]
  suggestedMapping: Partial<Record<ImportField, string>>
  fields: ImportField[]
}

type CommitResult = { inserted: number; updated: number; skipped: number; invalid: number }

function fieldLabel(f: ImportField) {
  const map: Record<ImportField, string> = {
    name: '姓名',
    nameZh: '中文名',
    continent: '大洲',
    countryOrRegion: '国家/地区',
    institution: '学校/机构',
    researchArea: '研究方向',
    homepageUrl: '个人主页',
    recruitingUrl: '招生网站',
    email: '邮箱',
    phone: '电话',
    wechat: '微信',
    notes: '备注',
  }
  return map[f]
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [selectedSheets, setSelectedSheets] = useState<string[]>([])
  const [mapping, setMapping] = useState<Partial<Record<ImportField, string>>>({})
  const [mode, setMode] = useState<'skip' | 'update' | 'insert'>('update')
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CommitResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const allColumns = useMemo(() => {
    if (!preview) return []
    return Array.from(new Set(preview.sheets.flatMap((s) => s.columns))).sort((a, b) => a.localeCompare(b))
  }, [preview])

  function toggleSheet(name: string) {
    const next = new Set(selectedSheets)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    setSelectedSheets(Array.from(next))
  }

  async function doPreview() {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    const form = new FormData()
    form.append('file', file)

    const r = await apiForm<PreviewData>('/api/import/xlsx', { method: 'POST', form })
    if (isApiError(r)) {
      setError(r.error)
      setLoading(false)
      return
    }

    setPreview(r.data)
    setSelectedSheets(r.data.sheets.map((s) => s.sheetName))
    setMapping(r.data.suggestedMapping ?? {})
    setStep(2)
    setLoading(false)
  }

  async function doCommit() {
    if (!file || !preview) return
    setLoading(true)
    setError(null)
    setResult(null)

    const form = new FormData()
    form.append('file', file)
    form.append('mode', mode)
    form.append('selectedSheets', JSON.stringify(selectedSheets))
    form.append('mapping', JSON.stringify(mapping))

    const r = await apiForm<CommitResult>('/api/import/commit', { method: 'POST', form })
    if (isApiError(r)) {
      setError(r.error)
      setLoading(false)
      return
    }

    setResult(r.data)
    setStep(3)
    setLoading(false)
  }

  const validToCommit = Boolean(mapping.name && (selectedSheets.length || (preview?.sheets.length ?? 0) === 0))

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold tracking-tight">导入 Excel</div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              上传 xlsx → 预览与字段映射 → 导入并去重
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge tone={step >= 1 ? 'blue' : 'neutral'}>1 上传</Badge>
            <Badge tone={step >= 2 ? 'blue' : 'neutral'}>2 映射</Badge>
            <Badge tone={step >= 3 ? 'blue' : 'neutral'}>3 完成</Badge>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
          <div className="text-sm font-semibold">1) 上传文件</div>
          <div className="mt-3 space-y-3">
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-zinc-300 bg-white/60 px-4 py-4 text-sm text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-200 dark:hover:bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={18} className="opacity-80" />
                <div className="min-w-0">
                  <div className="font-medium">
                    {file ? file.name : '选择 .xlsx 文件'}
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {file ? `${Math.round(file.size / 1024)} KB` : '支持多 Sheet，默认按 Sheet 自动分组'}
                  </div>
                </div>
              </div>
              <input
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null
                  setFile(f)
                  setPreview(null)
                  setResult(null)
                  setStep(1)
                }}
              />
              <Upload size={18} className="opacity-70" />
            </label>

            <Button onClick={doPreview} disabled={!file || loading}>
              <Wand2 size={16} />
              {loading ? '解析中…' : '解析预览'}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
          <div className="text-sm font-semibold">2) 选择 Sheet 与去重策略</div>
          <div className="mt-3 space-y-3">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Sheet（导入后会作为“分组”保存）</div>
            <div className="flex flex-wrap gap-2">
              {(preview?.sheets ?? []).map((s) => {
                const active = selectedSheets.includes(s.sheetName)
                return (
                  <button
                    key={s.sheetName}
                    type="button"
                    onClick={() => toggleSheet(s.sheetName)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                      active
                        ? 'border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
                        : 'border-zinc-200 bg-white/70 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200 dark:hover:bg-zinc-900/60'
                    }`}
                  >
                    {s.sheetName} <span className="opacity-70">({s.rowCount})</span>
                  </button>
                )
              })}
              {!preview ? (
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  解析后显示
                </div>
              ) : null}
            </div>

            <div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">重复记录策略</div>
              <Select value={mode} onChange={(e) => setMode(e.target.value as any)}>
                <option value="update">更新已有（推荐）</option>
                <option value="skip">跳过重复</option>
                <option value="insert">全部插入（允许重复）</option>
              </Select>
            </div>

            <Button onClick={doCommit} disabled={!preview || !validToCommit || loading}>
              <CheckCircle2 size={16} />
              {loading ? '导入中…' : '开始导入'}
            </Button>
          </div>
        </div>
      </div>

      {preview ? (
        <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-semibold">字段映射</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              至少需要映射“姓名”才能导入
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {preview.fields.map((f) => (
              <div key={f} className="grid grid-cols-[120px_1fr] items-center gap-2">
                <div className="text-xs text-zinc-600 dark:text-zinc-300">{fieldLabel(f)}</div>
                <Select
                  value={mapping[f] ?? ''}
                  onChange={(e) => setMapping((prev) => ({ ...prev, [f]: e.target.value }))}
                >
                  <option value="">不导入</option>
                  {allColumns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            <div className="text-sm font-semibold">预览</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {preview.sheets.slice(0, 4).map((s) => (
                <div
                  key={s.sheetName}
                  className="rounded-xl border border-zinc-200/70 bg-white/60 p-3 dark:border-zinc-800/60 dark:bg-zinc-950/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">{s.sheetName}</div>
                    <Badge tone="gold">{s.rowCount} 行</Badge>
                  </div>
                  <div className="mt-2 overflow-auto rounded-lg border border-zinc-200/70 dark:border-zinc-800/60">
                    <table className="min-w-full text-left text-xs">
                      <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-300">
                        <tr>
                          {s.columns.slice(0, 5).map((c) => (
                            <th key={c} className="whitespace-nowrap px-2 py-2 font-medium">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.previewRows.slice(0, 5).map((r, i) => (
                          <tr
                            key={i}
                            className="border-t border-zinc-200/70 dark:border-zinc-800/60"
                          >
                            {s.columns.slice(0, 5).map((c) => (
                              <td key={c} className="max-w-[220px] truncate px-2 py-2 text-zinc-700 dark:text-zinc-200">
                                {String(r[c] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          <div className="text-sm font-semibold">导入完成</div>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            <span>新增 {result.inserted}</span>
            <span>更新 {result.updated}</span>
            <span>跳过 {result.skipped}</span>
            <span>无效 {result.invalid}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
