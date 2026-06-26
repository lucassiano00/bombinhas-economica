import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
        variant === 'primary' && 'bg-gold text-navy font-extrabold rounded-full hover:bg-gold-deep',
        variant === 'secondary' && 'bg-navy text-surface font-semibold rounded-lg hover:bg-navy-800',
        variant === 'danger' && 'bg-danger text-surface font-semibold rounded-lg',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
