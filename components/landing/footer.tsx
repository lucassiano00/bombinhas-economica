export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
      <div className="max-w-4xl mx-auto space-y-2">
        <div className="flex flex-wrap justify-center gap-6 mb-3">
          <a href="/politica-cookies" className="hover:text-white transition-colors">Política de Cookies</a>
          <a href="/privacidade" className="hover:text-white transition-colors">Segurança e Privacidade</a>
        </div>
        <p>CNPJ: {process.env.NEXT_PUBLIC_CNPJ}</p>
        <p>Contato: {process.env.NEXT_PUBLIC_CONTACT_EMAIL}</p>
      </div>
    </footer>
  )
}
