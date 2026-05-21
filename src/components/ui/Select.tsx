import { cn } from '@/lib/utils'

export default function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  const { className, ...rest } = props
  return (
    <select
      {...rest}
      className={cn(
        'h-10 w-full rounded-lg border border-zinc-200 bg-white/70 px-3 text-sm text-zinc-900 shadow-[0_1px_0_rgba(0,0,0,0.04)] outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:focus:border-zinc-600',
        className,
      )}
    />
  )
}

