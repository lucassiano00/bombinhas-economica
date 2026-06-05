import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="bg-blue-700 text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Economize SC!</h1>
        <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto">
          Pague uma taxa única de R$ 49,90 e economize entre R$ 500,00 e mais de R$ 1.000,00 durante as suas férias.
        </p>
        <Link href="/cadastro">
          <Button className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 text-lg px-8 py-4 h-auto">
            Quero meu crédito agora
          </Button>
        </Link>
      </div>
    </section>
  )
}
