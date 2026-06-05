import { Resend } from 'resend'

type EmailClient = Pick<InstanceType<typeof Resend>, 'emails'>

let _client: EmailClient | undefined

function getClient(): EmailClient {
  if (!_client) {
    _client = (Resend as unknown as (key: string) => EmailClient)(
      process.env.RESEND_API_KEY ?? ''
    )
  }
  return _client
}

export async function sendRegistrationConfirmed({
  to,
  name,
  paymentMethod,
}: {
  to: string
  name: string
  paymentMethod: 'pix' | 'western_union'
}) {
  const pixInstructions = `Chave PIX (CNPJ): ${process.env.NEXT_PUBLIC_PIX_KEY}\nValor: R$ 49,90`
  const wuInstructions = `Western Union\nBeneficiário: ${process.env.NEXT_PUBLIC_WU_BENEFICIARY}\nValor equivalente a R$ 49,90`

  await getClient().emails.send({
    from: 'Economize SC <noreply@economizesc.com.br>',
    to,
    subject: 'Cadastro recebido — Economize SC',
    text: `Olá, ${name}!\n\nSeu cadastro foi recebido. Para ativar seu cartão, realize o pagamento:\n\n${paymentMethod === 'pix' ? pixInstructions : wuInstructions}\n\nAssim que confirmarmos o pagamento, você receberá seu cartão digital.\n\nEquipe Economize SC`,
  })
}

export async function sendCardActivated({
  to,
  name,
}: {
  to: string
  name: string
}) {
  await getClient().emails.send({
    from: 'Economize SC <noreply@economizesc.com.br>',
    to,
    subject: 'Seu cartão está ativo — Economize SC!',
    text: `Olá, ${name}!\n\nSeu cartão Economize SC está ativo!\n\nAcesse: ${process.env.NEXT_PUBLIC_APP_URL}/cliente/cartao\n\nBoa temporada!\nEquipe Economize SC`,
  })
}
