/**
 * Shown by Next.js Suspense while SessionRedirectPage awaits auth().
 * Renders for < 1 s in practice; uses brand tokens only.
 */
export default function RedirectLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-section px-4">
      {/* Brand lockup */}
      <div className="text-center">
        <p className="text-2xl font-extrabold tracking-tight text-navy">
          Bombinhas<span className="text-teal">+</span>
        </p>
        <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-gold">ECONÔMICA</p>
      </div>

      {/* Spinner — navy ring, no extra decoration */}
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-navy/20 border-t-navy"
        role="status"
        aria-label="Redirecionando"
      />
    </div>
  )
}
