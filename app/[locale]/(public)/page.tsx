import { isLocale } from '@/lib/i18n'
import { getDictionary } from '../dictionaries'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site/header'
import { Hero } from '@/components/site/hero'
import { ValueBenefits } from '@/components/site/value-benefits'
import { OffersCarousel } from '@/components/site/offers-carousel'
import { Steps } from '@/components/site/steps'
import { Registration } from '@/components/site/registration'
import { Categories } from '@/components/site/categories'
import { Trust } from '@/components/site/trust'
import { Telemedicine } from '@/components/site/telemedicine'
import { Emergency } from '@/components/site/emergency'
import { Partners } from '@/components/site/partners'
import { SiteFooter } from '@/components/site/footer'
import { StickyCta } from '@/components/site/sticky-cta'

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)

  return (
    <>
      <h1 className="sr-only">{dict.hero.title}</h1>
      <SiteHeader locale={locale} />
      <main>
        <Hero locale={locale} />
        <ValueBenefits locale={locale} />
        <OffersCarousel locale={locale} />
        <Steps locale={locale} />
        <Registration locale={locale} />
        <Categories locale={locale} />
        <Trust locale={locale} />
        <Telemedicine locale={locale} />
        <Emergency locale={locale} />
        <Partners locale={locale} />
      </main>
      <SiteFooter locale={locale} />
      <StickyCta locale={locale} />
    </>
  )
}
