import * as React from 'react'
import { cn } from '../../lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'purple' | 'cyan'
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const variants = {
    default:
      'border-transparent bg-indigo-500/15 text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-300 font-medium',
    secondary:
      'border-transparent bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
    destructive:
      'border-transparent bg-rose-500/15 text-rose-700 dark:bg-rose-500/25 dark:text-rose-300',
    outline:
      'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300',
    success:
      'border-transparent bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300',
    warning:
      'border-transparent bg-amber-500/15 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300',
    purple:
      'border-transparent bg-purple-500/15 text-purple-700 dark:bg-purple-500/25 dark:text-purple-300',
    cyan:
      'border-transparent bg-cyan-500/15 text-cyan-700 dark:bg-cyan-500/25 dark:text-cyan-300',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
