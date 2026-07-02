'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

/**
 * CTA fixo do mobile — aparece quando o hero (com o CTA principal) sai de vista
 * e se recolhe quando o footer (que tem o CTA final) entra, para nunca duplicar.
 * Casey (uma mão, distraída) sempre tem o "comprar" no polegar.
 */
export function StickyCta({ locale }: { locale: Locale }) {
  const es = locale === 'es'
  const [on, setOn] = useState(false)
  const heroGone = useRef(false)
  const footerVisible = useRef(false)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const hero = document.querySelector('main > section:first-of-type')
    const footer = document.querySelector('footer')
    if (!hero || !footer) return

    const update = () => setOn(heroGone.current && !footerVisible.current)
    const heroIo = new IntersectionObserver(([e]) => {
      heroGone.current = !e.isIntersecting
      update()
    })
    const footerIo = new IntersectionObserver(([e]) => {
      footerVisible.current = e.isIntersecting
      update()
    })
    heroIo.observe(hero)
    footerIo.observe(footer)
    return () => {
      heroIo.disconnect()
      footerIo.disconnect()
    }
  }, [])

  return (
    <div
      className={`sticky-cta fixed inset-x-0 bottom-0 z-30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden ${on ? 'is-on' : ''}`}
      aria-hidden={!on}
    >
      <Link
        href={`/${locale}/cadastro`}
        tabIndex={on ? 0 : -1}
        className="press flex items-center justify-center gap-2.5 rounded-full bg-gold py-3.5 text-sm font-extrabold tracking-wide text-navy shadow-[0_10px_30px_-8px_rgba(8,26,61,.5)] hover:bg-gold-deep"
      >
        <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
        {es ? 'QUIERO AHORRAR — R$ 99/AÑO' : 'QUERO ECONOMIZAR — R$ 99/ANO'}
      </Link>
    </div>
  )
}
