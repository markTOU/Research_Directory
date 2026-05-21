import Input from '@/components/ui/Input'
import type { Researcher } from '@/lib/types'

type Draft = Researcher & { tagIds: string[] }

export default function ContactCard(props: {
  draft: Draft
  onChange: <K extends keyof Draft>(key: K, value: Draft[K]) => void
}) {
  const d = props.draft

  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
      <div className="text-sm font-semibold">方向 / 联系方式 / 链接</div>
      <div className="mt-3 grid grid-cols-1 gap-3">
        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">研究方向</div>
          <textarea
            value={d.research_area ?? ''}
            onChange={(e) => props.onChange('research_area', e.target.value as any)}
            className="min-h-24 w-full resize-none rounded-lg border border-zinc-200 bg-white/70 px-3 py-2 text-sm text-zinc-900 shadow-[0_1px_0_rgba(0,0,0,0.04)] outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:focus:border-zinc-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">邮箱</div>
            <Input
              value={d.email ?? ''}
              onChange={(e) => props.onChange('email', e.target.value as any)}
            />
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">电话</div>
            <Input
              value={d.phone ?? ''}
              onChange={(e) => props.onChange('phone', e.target.value as any)}
            />
          </div>
        </div>

        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">微信</div>
          <Input
            value={d.wechat ?? ''}
            onChange={(e) => props.onChange('wechat', e.target.value as any)}
          />
        </div>

        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">个人主页</div>
          <Input
            value={d.homepage_url ?? ''}
            onChange={(e) => props.onChange('homepage_url', e.target.value as any)}
          />
        </div>

        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">招生网站</div>
          <Input
            value={d.recruiting_url ?? ''}
            onChange={(e) => props.onChange('recruiting_url', e.target.value as any)}
          />
        </div>
      </div>
    </div>
  )
}

