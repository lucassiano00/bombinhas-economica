import crypto from 'crypto'

// Validates Mercado Pago's x-signature HMAC.
// Manifest: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
export function isValidMpSignature(req: Request, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return false
  const sig = req.headers.get('x-signature')
  const requestId = req.headers.get('x-request-id') ?? ''
  if (!sig) return false
  const parts = Object.fromEntries(
    sig.split(',').map((kv) => {
      const idx = kv.indexOf('=')
      return [kv.slice(0, idx).trim(), kv.slice(idx + 1).trim()]
    })
  )
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  const hmacBuf = Buffer.from(crypto.createHmac('sha256', secret).update(manifest).digest('hex'))
  const v1Buf = Buffer.from(v1)
  if (hmacBuf.length !== v1Buf.length) return false  // guard: timingSafeEqual throws on length mismatch
  return crypto.timingSafeEqual(hmacBuf, v1Buf)
}
