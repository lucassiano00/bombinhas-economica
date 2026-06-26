'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import type { Locale } from '@/lib/i18n'

const NAV = [
  { label: 'TURISTAS',  href: '#turistas' },
  { label: 'MORADORES', href: '#moradores' },
  { label: 'EMPRESAS',  href: '#empresas' },
  { label: 'CONTATO',   href: '#contato' },
]

export function SiteHeader({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="relative z-40 bg-navy text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex flex-col leading-none">
          <span className="text-2xl font-extrabold tracking-tight">
            Bombinhas<span className="text-teal">+</span>
          </span>
          <span className="text-[0.7rem] font-semibold tracking-[0.2em] text-gold">
            ECONÔMICA
          </span>
        </Link>

        {/* Nav (desktop) */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Navegação principal">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-semibold tracking-wide text-white/90 transition-colors hover:text-gold"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="flex items-center gap-1 text-sm font-semibold">
            <Link
              href="/pt"
              className={`flex items-center gap-1 rounded px-2 py-1 ${
                locale === 'pt' ? 'text-white' : 'text-white/55 hover:text-white'
              }`}
            >
              <span aria-hidden>🇧🇷</span> PT
            </Link>
            <span className="text-white/30">|</span>
            <Link
              href="/es"
              className={`flex items-center gap-1 rounded px-2 py-1 ${
                locale === 'es' ? 'text-white' : 'text-white/55 hover:text-white'
              }`}
            >
              <span aria-hidden>🇪🇸</span> ES
            </Link>
          </div>

          {/* Mobile menu toggle — min 44×44px touch target */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20 md:hidden"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <nav
          id="mobile-nav"
          className="absolute left-0 right-0 top-full border-t border-white/10 bg-navy px-4 py-2 shadow-lg md:hidden"
          aria-label="Navegação mobile"
        >
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-semibold text-white/90 transition-colors hover:text-gold"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
