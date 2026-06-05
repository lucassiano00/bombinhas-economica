const STEPS = [
  { number: '1', title: 'Cadastre-se', description: 'Preencha seus dados e dos seus dependentes' },
  { number: '2', title: 'Pague R$ 49,90', description: 'Via PIX (brasileiros) ou Western Union (estrangeiros) — taxa única' },
  { number: '3', title: 'Economize', description: 'Apresente o cartão digital nos estabelecimentos parceiros' },
]

export function HowItWorks() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Como funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
