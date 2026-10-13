import { Resend } from 'resend'
import { PLANS, formatPrice, type PlanId } from '@/lib/plans'

const resend = new Resend(process.env.RESEND_API_KEY)
// Remetente por ambiente: o dominio bombinhaseconomica.com.br NAO esta registrado
// (NXDOMAIN em 20/08/2026), entao o Resend nao consegue verifica-lo e recusa o envio.
// Trocar por um remetente valido e questao de env, nao de deploy.
const FROM = process.env.EMAIL_FROM ?? 'Bombinhas+ Econômica <noreply@bombinhaseconomica.com.br>'

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')
}

export async function sendRegistrationConfirmed({
  to,
  name,
  locale,
  plan,
}: {
  to: string
  name: string
  locale: 'pt' | 'es'
  plan: PlanId
}) {
  // O valor vem do plano — hardcodar preço aqui já mandou "R$ 99,00" pra quem
  // ia pagar outro valor.
  void locale
  const price = formatPrice(plan)
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Cadastro recebido — Bombinhas+ Econômica',
    text: `Olá, ${name}!\n\nRecebemos seu cadastro no Bombinhas+ Econômica. Para ativar seu cartão, conclua o pagamento de ${price} (plano ${PLANS[plan].pt}, anual) no checkout do Mercado Pago.\n\nAssim que o pagamento for aprovado, seu cartão digital é ativado automaticamente e você recebe um aviso por email.\n\nEquipe Bombinhas+ Econômica`,
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
