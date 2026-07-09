'use client'

import { useEffect, useState } from 'react'
import { Smartphone } from 'lucide-react'

// Android/Chrome dispara `beforeinstallprompt`; guardamos o evento e o botão
// abre o prompt nativo de instalação. iOS não tem API — o botão vira instrução.
// O componente não renderiza nada se já instalado ou se não for instalável.
type BIPEvent = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> }

export function InstallButton({ es }: { es: boolean }) {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [ios, setIos] = useState(false)
  const [hint, setHint] = useState(false)

  useEffect(() => {
    if (typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches) return
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BIPEvent)
    }
    const onInstalled = () => setDeferred(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    // iOS Safari fora do modo standalone: sem API de prompt — mostra instrução
    const nav = navigator as Navigator & { standalone?: boolean }
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !nav.standalone)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!deferred && !ios) return null

  async function install() {
    if (deferred) {
      await deferred.prompt()
      const { outcome } = await deferred.userChoice
      if (outcome === 'accepted') setDeferred(null)
      return
    }
    setHint(!hint) // iOS: alterna a instrução
  }

  return (
    <div className="w-full">
      {/* Terceiro nível de hierarquia: utilitário (texto), não compete com o
          CTA dourado nem com "Ver como funciona" (outline). */}
      <button
        onClick={install}
        className="press inline-flex items-center gap-2 px-1 py-3 text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
      >
        <Smartphone className="h-4 w-4" strokeWidth={2.25} />
        {es ? 'Instalar la app' : 'Instalar o app'}
      </button>
      {hint && (
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-white/80">
          {es
            ? 'En iPhone: tocá el botón Compartir y elegí “Agregar a inicio”.'
            : 'No iPhone: toque o botão Compartilhar e escolha “Adicionar à Tela de Início”.'}
        </p>
      )}
    </div>
  )
}
