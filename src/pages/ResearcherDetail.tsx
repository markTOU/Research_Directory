import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiGet, apiJson, isApiError } from '@/lib/api'
import type { Researcher, Tag } from '@/lib/types'
import DetailHeader from '@/components/researcher/DetailHeader'
import BasicInfoCard from '@/components/researcher/BasicInfoCard'
import ContactCard from '@/components/researcher/ContactCard'
import TagCard from '@/components/researcher/TagCard'
import NotesCard from '@/components/researcher/NotesCard'

type DetailPayload = Researcher & { tagIds: string[] }

export default function ResearcherDetail() {
  const { id } = useParams()

  const [detail, setDetail] = useState<DetailPayload | null>(null)
  const [draft, setDraft] = useState<DetailPayload | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setError(null)
    apiGet<DetailPayload>(`/api/researchers/${id}`).then((r) => {
      if (isApiError(r)) {
        setError(r.error)
        return
      }
      setDetail(r.data)
      setDraft(r.data)
    })
    apiGet<Tag[]>('/api/tags').then((r) => {
      if (r.success) setTags(r.data)
    })
  }, [id])

  const dirty = useMemo(() => {
    if (!detail || !draft) return false
    const a = { ...draft, tagIds: [...draft.tagIds].sort() }
    const b = { ...detail, tagIds: [...detail.tagIds].sort() }
    return JSON.stringify(a) !== JSON.stringify(b)
  }, [detail, draft])

  function setField<K extends keyof DetailPayload>(key: K, value: DetailPayload[K]) {
    if (!draft) return
    setDraft({ ...draft, [key]: value })
  }

  async function save() {
    if (!id || !draft) return
    setSaving(true)
    setError(null)

    const patch = {
      name: draft.name,
      name_zh: draft.name_zh,
      continent: draft.continent,
      country_or_region: draft.country_or_region,
      institution: draft.institution,
      research_area: draft.research_area,
      homepage_url: draft.homepage_url,
      recruiting_url: draft.recruiting_url,
      email: draft.email,
      phone: draft.phone,
      wechat: draft.wechat,
      notes: draft.notes,
      group_name: draft.group_name,
      follow_status: draft.follow_status,
    }

    const r1 = await apiJson<Researcher>(`/api/researchers/${id}`, {
      method: 'PATCH',
      body: patch,
    })
    if (isApiError(r1)) {
      setError(r1.error)
      setSaving(false)
      return
    }

    const r2 = await apiJson<{ tagIds: string[] }>(`/api/researchers/${id}/tags`, {
      method: 'PUT',
      body: { tagIds: draft.tagIds },
    })
    if (isApiError(r2)) {
      setError(r2.error)
      setSaving(false)
      return
    }

    const next: DetailPayload = { ...(r1.data as any), tagIds: r2.data.tagIds }
    setDetail(next)
    setDraft(next)
    setSaving(false)
  }

  async function createTag() {
    const name = newTagName.trim()
    if (!name.length) return
    const r = await apiJson<Tag>('/api/tags', { method: 'POST', body: { name } })
    if (isApiError(r)) {
      setError(r.error)
      return
    }
    setTags((prev) => [...prev, r.data].sort((a, b) => a.name.localeCompare(b.name)))
    setNewTagName('')
  }

  function toggleTag(tagId: string) {
    if (!draft) return
    const next = new Set(draft.tagIds)
    if (next.has(tagId)) next.delete(tagId)
    else next.add(tagId)
    setField('tagIds', Array.from(next))
  }

  if (!draft) {
    return (
      <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          {error ? `加载失败：${error}` : '加载中…'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DetailHeader draft={draft} dirty={dirty} saving={saving} onSave={save} />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BasicInfoCard draft={draft} onChange={setField} />
        <ContactCard draft={draft} onChange={setField} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TagCard
          draft={draft}
          tags={tags}
          newTagName={newTagName}
          onNewTagNameChange={setNewTagName}
          onCreateTag={createTag}
          onToggleTag={toggleTag}
        />
        <NotesCard draft={draft} onChange={setField} />
      </div>
    </div>
  )
}
