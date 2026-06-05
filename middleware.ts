import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const role = req.auth?.user?.role

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
  if (pathname.startsWith('/parceiro') && role !== 'partner') {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
  if (pathname.startsWith('/cliente') && role !== 'client') {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/parceiro/:path*', '/cliente/:path*'],
}
