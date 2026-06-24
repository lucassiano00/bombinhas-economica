// proxy.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { resolveLocale, needsLocalePrefix } from '@/lib/i18n'

export default auth((req) => {
  const { pathname } = req.nextUrl

  // 1. Locale routing: redirect unprefixed paths to the resolved locale.
  if (needsLocalePrefix(pathname)) {
    const locale = resolveLocale(req.headers.get('accept-language'))
    const url = req.nextUrl.clone()
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
    return NextResponse.redirect(url)
  }

  // 2. Role guards, locale-aware. pathname is /<locale>/<rest...>.
  const [, locale, ...restParts] = pathname.split('/')
  const rest = '/' + restParts.join('/')
  const role = req.auth?.user?.role
  const loginUrl = new URL(`/${locale}/auth/login`, req.url)

  if (rest.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(loginUrl)
  }
  if (rest.startsWith('/parceiro') && role !== 'partner') {
    return NextResponse.redirect(loginUrl)
  }
  if (rest.startsWith('/cliente') && role !== 'client') {
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  // Run on everything except API, Next internals, and files with an extension.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
