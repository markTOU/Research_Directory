import { Tag as TagIcon } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { Researcher, Tag } from '@/lib/types'
import { cn } from '@/lib/utils'

type Draft = Researcher & { tagIds: string[] }

export default function TagCard(props: {
  draft: Draft
  tags: Tag[]
  newTagName: string
  onNewTagNameChange: (v: string) => void
  onCreateTag: () => void
  onToggleTag: (tagId: string) => void
}) {
  const d = props.draft

  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">标签</div>
        <div className="inline-flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <TagIcon size={14} />
          {d.tagIds.length} 个
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {props.tags.map((t) => {
          const active = d.tagIds.includes(t.id)
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => props.onToggleTag(t.id)}
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

      <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
        <Input
          value={props.newTagName}
          onChange={(e) => props.onNewTagNameChange(e.target.value)}
          placeholder="新增标签名称…"
        />
        <Button variant="ghost" onClick={props.onCreateTag}>
          新增
        </Button>
      </div>
    </div>
  )
}

