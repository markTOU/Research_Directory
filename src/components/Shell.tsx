import { NavLink } from 'react-router-dom'
import { BookOpen, Upload, Map, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

function NavItem(props: {
  to: string
  label: string
  icon: React.ReactNode
}) {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
          isActive
            ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
            : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900/60',
        )
      }
      end={props.to === '/'}
    >
      <span className="opacity-80 group-hover:opacity-100">{props.icon}</span>
      <span className="font-medium">{props.label}</span>
    </NavLink>
  )
}

export default function Shell(props: { children: React.ReactNode }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_10%_10%,rgba(24,24,27,0.06),transparent_55%),radial-gradient(900px_circle_at_80%_20%,rgba(24,24,27,0.05),transparent_55%)] px-4 py-6 text-zinc-900 dark:bg-[radial-gradient(1200px_circle_at_10%_10%,rgba(244,244,245,0.08),transparent_55%),radial-gradient(900px_circle_at_80%_20%,rgba(244,244,245,0.06),transparent_55%)] dark:text-zinc-100">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/60">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold tracking-wide">
                Research Directory
              </div>
              <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                科研人员通讯录
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200/70 bg-white/60 text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800/60 dark:bg-zinc-950/50 dark:text-zinc-200 dark:hover:bg-zinc-900/60"
              aria-label="切换主题"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          <div className="mt-4 space-y-1">
            <NavItem to="/" label="通讯录" icon={<BookOpen size={16} />} />
            <NavItem to="/import" label="导入" icon={<Upload size={16} />} />
            <NavItem to="/insights" label="统计地图" icon={<Map size={16} />} />
          </div>

          <div className="mt-5 rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-3 text-xs text-zinc-600 dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:text-zinc-300">
            支持：多 Sheet 分组导入、标签、跟进状态、地图联动筛选
          </div>
        </aside>

        <main className="min-w-0">{props.children}</main>
      </div>
    </div>
  )
}

