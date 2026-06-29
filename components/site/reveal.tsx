'use client'

import { useEffect, useRef, type ElementType, type ReactNode } from 'react'
import { clsx } from 'clsx'

/**
 * Scroll-reveal wrapper. Renders its class server-side (so the `.js`-gated CSS
 * hides it before paint — no flash), then adds `is-in` once it scrolls into view.
 *
 * - `group`: stagger direct children (use for real lists/grids), else reveal as one block.
 * - Respects `prefers-reduced-motion` and degrades gracefully without IntersectionObserver.
 */
export function Reveal({
  as: Tag = 'div',
  group = false,
  className,
  children,
}: {
  as?: ElementType
  group?: boolean
  className?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in')
      return
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add('is-in')
            obs.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )
    io.observe(el)

    // Safety net: if the observer never fires (background tab, odd renderer),
    // reveal after a short delay so content can't get stuck hidden.
    const fallback = window.setTimeout(() => el.classList.add('is-in'), 1500)

    return () => {
      io.disconnect()
      window.clearTimeout(fallback)
    }
  }, [])

  return (
    <Tag ref={ref} className={clsx(group ? 'reveal-group' : 'reveal', className)}>
      {children}
    </Tag>
  )
}
