import { cn } from '@/lib/utils'

export default function Badge(props: { children: React.ReactNode; tone?: 'neutral' | 'blue' | 'gold' }) {
  const tone = props.tone ?? 'neutral'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        tone === 'neutral' &&
          'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200',
        tone === 'blue' &&
          'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200',
        tone === 'gold' &&
          'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200',
      )}
    >
      {props.children}
    </span>
  )
}

