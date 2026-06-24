import { NextResponse } from 'next/server'
import { applyPaymentNotification } from '@/lib/actions/activate-payment'
import { isValidMpSignature } from '@/lib/mp-webhook'

export async function POST(req: Request) {
  const url = new URL(req.url)
  let dataId = url.searchParams.get('data.id') ?? ''
  let type = url.searchParams.get('type') ?? ''

  // MP may also send the data in the JSON body.
  try {
    const body = await req.json()
    type = type || body?.type || body?.action?.split('.')?.[0] || ''
    dataId = dataId || body?.data?.id?.toString() || ''
  } catch {
    // no/invalid body — rely on query params
  }

  if (type !== 'payment' || !dataId) {
    return NextResponse.json({ received: true }, { status: 200 })
  }
  if (!isValidMpSignature(req, dataId)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  await applyPaymentNotification(dataId)
  // Always 200 so MP stops retrying a handled notification.
  return NextResponse.json({ received: true }, { status: 200 })
}
