import { cn } from '@/lib/utils'

export default function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
  },
) {
  const { className, variant = 'primary', size = 'md', ...rest } = props
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-9 px-3' : 'h-10 px-4',
        variant === 'primary' &&
          'border-zinc-900 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200',
        variant === 'ghost' &&
          'border-zinc-200 bg-white/60 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:hover:bg-zinc-900/60',
        variant === 'danger' &&
          'border-rose-600 bg-rose-600 text-white hover:bg-rose-500 dark:border-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400',
        className,
      )}
    />
  )
}

