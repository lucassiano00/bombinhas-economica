'use client'
import { useState } from 'react'

const CITIES = ['Bombinhas', 'Itapema', 'Meia Praia', 'Balneário Camboriú'] as const
type City = typeof CITIES[number]

const SEGMENTS = [
  'Mercados', 'Combustível', 'Farmácias', 'Artigos de praia',
  'Banana Bolt', 'Barco Pirata', 'Pubs', 'Pizzarias',
  'Sorveterias', 'Restaurantes', 'Açougues', 'Serviços de emergência',
  'Padarias', 'Beto Carreiro', 'Parques aquáticos', 'Compras em Brusque',
]

export function Benefits() {
  const [activeCity, setActiveCity] = useState<City>('Bombinhas')

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">Benefícios</h2>
        <p className="text-center text-gray-600 mb-8">
          Aqui estão todos os benefícios com descontos para você gastar menos e curtir mais!
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCity === city
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-400'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SEGMENTS.map((segment) => (
            <div key={segment} className="bg-white rounded-lg p-3 text-center text-sm font-medium text-gray-700 border border-gray-200 shadow-sm">
              {segment}
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-500 mt-6">
          Os estabelecimentos são exibidos conforme sua localização atual.
        </p>
      </div>
    </section>
  )
}
