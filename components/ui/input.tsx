import { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'bg-field px-3 py-2 border rounded-lg placeholder:text-ink placeholder:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-colors',
          error ? 'border-danger' : 'border-border',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
