import { isLocale } from '@/lib/i18n'
import { getDictionary } from '../dictionaries'
import { notFound } from 'next/navigation'
import { Hero } from '@/components/landing/hero'
import { Benefits } from '@/components/landing/benefits'
import { HowItWorks } from '@/components/landing/how-it-works'
import { ClosingSection } from '@/components/landing/closing-section'
import { Footer } from '@/components/landing/footer'

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = await getDictionary(locale)
  return (
    <main>
      <h1 className="sr-only">{dict.hero.title}</h1>
      <Hero />
      <Benefits />
      <HowItWorks />
      <ClosingSection />
      <Footer />
    </main>
  )
}
