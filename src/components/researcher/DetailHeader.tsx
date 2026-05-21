import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Save } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import type { Researcher, FollowStatus } from '@/lib/types'

type Draft = Researcher & { tagIds: string[] }

function statusLabel(v: FollowStatus | null) {
  if (v === 'todo') return '待联系'
  if (v === 'contacted') return '已联系'
  if (v === 'replied') return '已回信'
  if (v === 'closed') return '已结束'
  return '未设置'
}

export default function DetailHeader(props: {
  draft: Draft
  dirty: boolean
  saving: boolean
  onSave: () => void
}) {
  const d = props.draft

  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ArrowLeft size={16} />
            返回通讯录
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="text-lg font-semibold tracking-tight">{d.name}</div>
            {d.name_zh ? <Badge>{d.name_zh}</Badge> : null}
            {d.group_name ? <Badge tone="gold">{d.group_name}</Badge> : null}
            <Badge tone="blue">{statusLabel(d.follow_status)}</Badge>
          </div>
          {d.institution ? (
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {d.institution}
              {d.country_or_region ? ` · ${d.country_or_region}` : ''}
              {d.continent ? ` · ${d.continent}` : ''}
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {d.homepage_url ? (
            <a
              href={d.homepage_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white/60 px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:hover:bg-zinc-900/60"
            >
              <ExternalLink size={16} />
              主页
            </a>
          ) : null}
          {d.recruiting_url ? (
            <a
              href={d.recruiting_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white/60 px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:hover:bg-zinc-900/60"
            >
              <ExternalLink size={16} />
              招生
            </a>
          ) : null}
          <Button onClick={props.onSave} disabled={!props.dirty || props.saving}>
            <Save size={16} />
            {props.saving ? '保存中…' : '保存'}
          </Button>
        </div>
      </div>
    </div>
  )
}

