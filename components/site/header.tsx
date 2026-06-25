import Link from 'next/link'
import type { Locale } from '@/lib/i18n'

const NAV = [
  { label: 'TURISTAS', href: '#turistas' },
  { label: 'MORADORES', href: '#moradores' },
  { label: 'EMPRESAS', href: '#empresas' },
  { label: 'CONTATO', href: '#contato' },
]

export function SiteHeader({ locale }: { locale: Locale }) {
  return (
    <header className="bg-navy text-white">
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

        {/* Nav */}
        <nav className="hidden items-center gap-7 md:flex">
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
      </div>
    </header>
  )
}
