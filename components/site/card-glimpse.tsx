/**
 * Cartão digital compacto do hero — versão mobile do CardReel (que é desktop-only).
 * CSS puro: flutuação lenta + varredura de brilho, sem RAF nem JS. O celular —
 * onde está o público primário — finalmente vê o produto que está comprando.
 */
export function CardGlimpse() {
  return (
    <div aria-hidden className="card-float relative mx-auto mt-10 w-[300px] max-w-full lg:hidden">
      <div
        className="relative h-[188px] overflow-hidden rounded-2xl text-white shadow-xl"
        style={{
          background: 'linear-gradient(150deg,#143063,#0a1c44 72%)',
          border: '1px solid rgba(255,255,255,.12)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,.15), 0 24px 48px -18px rgba(8,26,61,.55)',
        }}
      >
        {/* glow dourado no canto — mesmo tratamento do CardReel */}
        <span
          className="pointer-events-none absolute"
          style={{
            top: '-40%',
            right: '-15%',
            width: '62%',
            height: '170%',
            background: 'radial-gradient(closest-side, #f5b50a33, transparent)',
          }}
        />
        {/* varredura de brilho */}
        <span
          className="card-shine pointer-events-none absolute inset-y-0 left-0 w-1/3"
          style={{
            background:
              'linear-gradient(105deg, transparent, rgba(255,255,255,.14) 45%, rgba(255,255,255,.24) 50%, rgba(255,255,255,.14) 55%, transparent)',
          }}
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
        <span
          className="absolute left-[18px] top-[72px] h-[27px] w-[38px] rounded-md"
          style={{ background: 'linear-gradient(135deg,#f7cf6a,#d99e0a)' }}
        />
        <div className="absolute left-[18px] top-[110px] font-display text-[1.02rem] tracking-[0.13em]">
          5212 0099 2026 0001
        </div>
        <div className="absolute bottom-[15px] left-[18px] right-[18px] flex items-end justify-between">
          <div>
            <div className="text-[0.82rem] font-bold">SEU NOME AQUI</div>
            <div className="text-[0.56rem] tracking-widest text-white/55">ASSINANTE · 2026</div>
          </div>
          <div className="font-display text-[1.3rem] font-extrabold text-gold">99</div>
        </div>
      </div>
    </div>
  )
}
