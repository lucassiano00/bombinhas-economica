import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Bombinhas+ Econômica <noreply@bombinhaseconomica.com.br>'

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')
}

export async function sendRegistrationConfirmed({
  to,
  name,
  locale,
}: {
  to: string
  name: string
  locale: 'pt' | 'es'
}) {
  void locale
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Cadastro recebido — Bombinhas+ Econômica',
    text: `Olá, ${name}!\n\nRecebemos seu cadastro no Bombinhas+ Econômica. Para ativar seu cartão, conclua o pagamento de R$ 99,00 (anual) no checkout do Mercado Pago.\n\nAssim que o pagamento for aprovado, seu cartão digital é ativado automaticamente e você recebe um aviso por email.\n\nEquipe Bombinhas+ Econômica`,
  })
}

export async function sendCardActivated({
  to,
  name,
  locale,
}: {
  to: string
  name: string
  locale: 'pt' | 'es'
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Seu cartão está ativo — Bombinhas+ Econômica!',
    text: `Olá, ${name}!\n\nSeu cartão Bombinhas+ Econômica está ativo!\n\nAcesse: ${appUrl()}/${locale}/cliente/cartao\n\nBom proveito em Bombinhas!\nEquipe Bombinhas+ Econômica`,
  })
}
