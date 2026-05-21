import type { Researcher } from '@/lib/types'

type Draft = Researcher & { tagIds: string[] }

export default function NotesCard(props: {
  draft: Draft
  onChange: <K extends keyof Draft>(key: K, value: Draft[K]) => void
}) {
  const d = props.draft

  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
      <div className="text-sm font-semibold">备注</div>
      <div className="mt-3">
        <textarea
          value={d.notes ?? ''}
          onChange={(e) => props.onChange('notes', e.target.value as any)}
          placeholder="记录沟通要点、下一步动作、链接备忘等…"
          className="min-h-40 w-full resize-none rounded-lg border border-zinc-200 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-[0_1px_0_rgba(0,0,0,0.04)] outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
        />
      </div>
    </div>
  )
}

