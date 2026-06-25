import { isLocale } from '@/lib/i18n'
import { getDictionary } from '../dictionaries'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site/header'
import { Hero } from '@/components/site/hero'
import { SavingsStatus } from '@/components/site/savings-status'
import { Partners } from '@/components/site/partners'
import { Categories } from '@/components/site/categories'
import { Emergency } from '@/components/site/emergency'
import { ValueBenefits } from '@/components/site/value-benefits'
import { Registration } from '@/components/site/registration'
import { Telemedicine } from '@/components/site/telemedicine'
import { SiteFooter } from '@/components/site/footer'

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
        <SavingsStatus locale={locale} />
        <Partners locale={locale} />
        <Categories locale={locale} />
        <Emergency locale={locale} />
        <ValueBenefits locale={locale} />
        <Registration locale={locale} />
        <Telemedicine locale={locale} />
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}
