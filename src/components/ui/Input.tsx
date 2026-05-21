import { cn } from '@/lib/utils'

export default function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  const { className, ...rest } = props
  return (
    <input
      {...rest}
      className={cn(
        'h-10 w-full rounded-lg border border-zinc-200 bg-white/70 px-3 text-sm text-zinc-900 shadow-[0_1px_0_rgba(0,0,0,0.04)] outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600',
        className,
      )}
    />
  )
}

