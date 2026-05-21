import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { FollowStatus, Researcher } from '@/lib/types'

type Draft = Researcher & { tagIds: string[] }

export default function BasicInfoCard(props: {
  draft: Draft
  onChange: <K extends keyof Draft>(key: K, value: Draft[K]) => void
}) {
  const d = props.draft

  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
      <div className="text-sm font-semibold">基础信息</div>
      <div className="mt-3 grid grid-cols-1 gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">姓名</div>
            <Input value={d.name} onChange={(e) => props.onChange('name', e.target.value as any)} />
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">中文名</div>
            <Input
              value={d.name_zh ?? ''}
              onChange={(e) => props.onChange('name_zh', e.target.value as any)}
            />
          </div>
        </div>

        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">学校/机构</div>
          <Input
            value={d.institution ?? ''}
            onChange={(e) => props.onChange('institution', e.target.value as any)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">国家/地区</div>
            <Input
              value={d.country_or_region ?? ''}
              onChange={(e) => props.onChange('country_or_region', e.target.value as any)}
            />
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">大洲</div>
            <Input
              value={d.continent ?? ''}
              onChange={(e) => props.onChange('continent', e.target.value as any)}
            />
          </div>
        </div>

        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">分组（来自 Sheet）</div>
          <Input
            value={d.group_name ?? ''}
            onChange={(e) => props.onChange('group_name', e.target.value as any)}
          />
        </div>

        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">跟进状态</div>
          <Select
            value={d.follow_status ?? ''}
            onChange={(e) =>
              props.onChange(
                'follow_status',
                (e.target.value ? (e.target.value as FollowStatus) : null) as any,
              )
            }
          >
            <option value="">未设置</option>
            <option value="todo">待联系</option>
            <option value="contacted">已联系</option>
            <option value="replied">已回信</option>
            <option value="closed">已结束</option>
          </Select>
        </div>
      </div>
    </div>
  )
}

