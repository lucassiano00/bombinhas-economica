import { Hero } from '@/components/landing/hero'
import { Benefits } from '@/components/landing/benefits'
import { HowItWorks } from '@/components/landing/how-it-works'
import { ClosingSection } from '@/components/landing/closing-section'
import { Footer } from '@/components/landing/footer'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Benefits />
      <HowItWorks />
      <ClosingSection />
      <Footer />
    </main>
  )
}
