'use client'

import { useEffect, useRef } from 'react'

type Card = { number: string; holder: string; accent: string }

const CARDS: Card[] = [
  { number: '5212 0099 2026 0001', holder: 'LUCAS CASSIANO', accent: '#f5b50a' },
  { number: '5212 0099 2026 0148', holder: 'MARIA SILVA', accent: '#14b8b8' },
  { number: '5212 0099 2026 0277', holder: 'JOÃO PEREIRA', accent: '#3fc46f' },
  { number: '5212 0099 2026 0356', holder: 'ANA SOUZA', accent: '#6b9be0' },
  { number: '5212 0099 2026 0492', holder: 'CARLOS LIMA', accent: '#f5b50a' },
]

// Volumetric thickness slices (back face → edges → front face).
const THICK = [-1.47, -0.73, 0, 0.73, 1.47]
const CARDW = 300
const CARDH = 188

/** Deterministic pseudo-QR (7×7) derived from the card number — purely decorative. */
function qrCells(seed: string): boolean[] {
  const digits = seed.replace(/\D/g, '')
  return Array.from({ length: 49 }, (_, i) => {
    const a = digits.charCodeAt(i % digits.length) || 0
    return (a * (i + 7)) % 5 < 2
  })
}

/**
 * 3D cylinder card reel — continuous vertical scroll with mouse-parallax tilt,
 * real volumetric thickness, and a front/back flip as cards cycle.
 * Technique ported from a React demo; rebranded to the Bombinhas+ card.
 */
export function CardReel() {
  const reelRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const reel = reelRef.current
    if (!reel) return

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    const onMove = (e: MouseEvent) => {
      mouse.tx = Math.max(-1, Math.min(1, (e.clientX - innerWidth / 2) / (innerWidth / 2)))
      mouse.ty = Math.max(-1, Math.min(1, (e.clientY - innerHeight / 2) / (innerHeight / 2)))
    }
    const onLeave = () => {
      mouse.tx = 0
      mouse.ty = 0
    }
    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)

    let progress = 0
    let raf = 0
    const COUNT = CARDS.length
    const gap = 30
    const peek = -50
    const D = 1350

    const frame = () => {
      progress += 0.0018
      mouse.x += (mouse.tx - mouse.x) * 0.08
      mouse.y += (mouse.ty - mouse.y) * 0.08

      const H = reel.clientHeight || 470
      const ri = Math.round(progress)
      const diff = progress - ri
      const eased = Math.sign(diff) * Math.pow(Math.abs(diff) * 2, 4.2) / 2
      const vai = ri + eased

      for (let i = 0; i < COUNT; i++) {
        const card = cardsRef.current[i]
        if (!card) continue
        let offset = i - vai
        const half = COUNT / 2
        while (offset > half) offset -= COUNT
        while (offset < -half) offset += COUNT
        const abs = Math.abs(offset)
        const sign = Math.sign(offset)
        if (abs > 3.0) {
          card.style.visibility = 'hidden'
          continue
        }
        card.style.visibility = 'visible'

        let y = 0
        let z = 0
        let rot = 0
        if (abs <= 1) {
          const t = abs
          const e = t * t * (3 - 2 * t)
          y = -sign * (e * (CARDH + gap))
          z = 400 + e * (220 - 400)
          rot = e * 132
        } else if (abs <= 2) {
          const t = abs - 1
          const e = t * t * (3 - 2 * t)
          const yS = CARDH + gap
          const zS = 220
          const rS = 132
          const zE = -60
          const rE = 175
          const sE = D / (D - zE)
          const yE = (H / 2 - peek) / sE - CARDH / 2
          y = -sign * (yS + e * (yE - yS))
          z = zS + e * (zE - zS)
          rot = rS + e * (rE - rS)
        } else {
          const t = Math.min(abs - 2, 1)
          const e = t * t * (3 - 2 * t)
          const zS = -60
          const rS = 175
          const zE = -250
          const rE = 195
          const sE2 = D / (D - zS)
          const yE2 = (H / 2 - peek) / sE2 - CARDH / 2
          const sE3 = D / (D - zE)
          const yE3 = (H / 2 + 100) / sE3 + CARDH / 2
          y = -sign * (yE2 + e * (yE3 - yE2))
          z = zS + e * (zE - zS)
          rot = rS + e * (rE - rS)
        }

        const lrot = -sign * rot
        const cf = Math.max(0, 1 - abs)
        const tiltX = -mouse.y * 12 * cf
        const tiltY = mouse.x * 15 * cf
        card.style.zIndex = String(Math.round(z))
        card.style.transform = `translateY(${y.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateX(${(lrot + tiltX).toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) rotateZ(-3deg)`
      }
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      frame()
    } else {
      const tick = () => {
        frame()
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={reelRef}
      aria-hidden
      className="relative h-[470px] w-full overflow-hidden"
      style={{ perspective: '1350px', transformStyle: 'preserve-3d' }}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: CARDW, height: CARDH, transform: 'translate(-50%,-50%)', transformStyle: 'preserve-3d' }}
      >
        {CARDS.map((c, i) => (
          <div
            key={i}
            ref={(el) => {
              cardsRef.current[i] = el
            }}
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'visible', willChange: 'transform' }}
          >
            {THICK.map((z, L) => {
              const isFront = L === THICK.length - 1
              const isBack = L === 0
              if (!isFront && !isBack) {
                return (
                  <div
                    key={L}
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: '#16264a', border: '1px solid #1d3158', transform: `translateZ(${z}px)` }}
                  />
                )
              }
              if (isFront) {
                return (
                  <div
                    key={L}
                    className="absolute inset-0 overflow-hidden rounded-2xl text-white"
                    style={{
                      background: 'linear-gradient(150deg,#143063,#0a1c44 72%)',
                      border: '1px solid rgba(255,255,255,.12)',
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,.15)',
                      transform: `translateZ(${z}px)`,
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <span
                      className="pointer-events-none absolute"
                      style={{ top: '-40%', right: '-15%', width: '62%', height: '170%', background: `radial-gradient(closest-side, ${c.accent}33, transparent)` }}
                    />
                    <div className="absolute left-[18px] right-4 top-4 flex items-start justify-between">
                      <span className="font-display text-base font-extrabold">
                        Bombinhas<span className="text-gold">+</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green/90 px-2.5 py-0.5 text-[0.58rem] font-bold tracking-wider">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#86dca5]" />
                        ATIVO
                      </span>
                    </div>
                    <span className="absolute left-[18px] top-[72px] h-[27px] w-[38px] rounded-md" style={{ background: 'linear-gradient(135deg,#f7cf6a,#d99e0a)' }} />
                    <div className="absolute left-[18px] top-[110px] font-display text-[1.02rem] tracking-[0.13em]">{c.number}</div>
                    <div className="absolute bottom-[15px] left-[18px] right-[18px] flex items-end justify-between">
                      <div>
                        <div className="text-[0.82rem] font-bold">{c.holder}</div>
                        <div className="text-[0.56rem] tracking-widest text-white/55">ASSINANTE · 2026</div>
                      </div>
                      <div className="font-display text-[1.3rem] font-extrabold" style={{ color: c.accent }}>
                        99
                      </div>
                    </div>
                  </div>
                )
              }
              // back face — QR + validity + status (on-brand: discount card, not a payment card)
              const cells = qrCells(c.number)
              return (
                <div
                  key={L}
                  className="absolute inset-0 overflow-hidden rounded-2xl text-white"
                  style={{
                    background: 'linear-gradient(160deg,#0e2350,#081a3d)',
                    border: '1px solid rgba(255,255,255,.12)',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,.15)',
                    transform: `translateZ(${z}px) rotateX(180deg)`,
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <div className="absolute left-0 right-0 top-[18px] h-[30px]" style={{ background: 'rgba(0,0,0,.82)' }} />
                  <div className="absolute right-[18px] top-[62px] grid h-[78px] w-[78px] grid-cols-7 grid-rows-7 gap-[2px] rounded-md bg-white p-1.5">
                    {cells.map((on, k) => (
                      <span key={k} className="rounded-[1px]" style={{ background: on ? '#0c2350' : 'transparent' }} />
                    ))}
                  </div>
                  <div className="absolute bottom-4 left-[18px]">
                    <div className="font-mono text-[0.76rem] tracking-[0.12em]">{c.number}</div>
                    <div className="mt-1 text-[0.6rem] text-white/65">{c.holder} · VÁLIDO ATÉ 12/2026</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green/90 px-2.5 py-0.5 text-[0.56rem] font-bold tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#86dca5]" />
                      VERIFICADO POR CPF / DNI
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
