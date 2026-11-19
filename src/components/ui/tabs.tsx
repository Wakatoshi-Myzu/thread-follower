import * as React from 'react'
import { cn } from '../../lib/utils'

interface TabsContextValue {
  value: string
  onValueChange: (val: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (val: string) => void
  className?: string
  children: React.ReactNode
}) {
  const [activeValue, setActiveValue] = React.useState(defaultValue || '')
  const currentVal = value !== undefined ? value : activeValue
  const setVal = onValueChange || setActiveValue

  return (
    <TabsContext.Provider value={{ value: currentVal, onValueChange: setVal }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'inline-flex h-11 items-center justify-start rounded-xl bg-slate-100/90 p-1 text-slate-500 backdrop-blur-sm dark:bg-slate-800/80 dark:text-slate-400 gap-1 border border-slate-200/50 dark:border-slate-700/50',
        className
      )}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  className,
  children,
  icon,
}: {
  value: string
  className?: string
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  const isSelected = context.value === value

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50',
        isSelected
          ? 'bg-white text-indigo-700 shadow-sm font-semibold dark:bg-slate-900 dark:text-indigo-300'
          : 'hover:text-slate-900 hover:bg-white/40 dark:hover:text-slate-200 dark:hover:bg-slate-700/40',
        className
      )}
    >
      {icon}
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string
  className?: string
  children: React.ReactNode
}) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')

  if (context.value !== value) return null

  return (
    <div
      className={cn(
        'mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 animate-in fade-in-50 duration-200',
        className
      )}
    >
      {children}
    </div>
  )
}
