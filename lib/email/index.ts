// lib/email/index.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendRegistrationConfirmed({
  to,
  name,
}: {
  to: string
  name: string
}) {
  await resend.emails.send({
    from: 'Economize SC <noreply@economizesc.com.br>',
    to,
    subject: 'Cadastro recebido — Economize SC',
    text: `Olá, ${name}!\n\nSeu cadastro foi recebido. Para ativar seu cartão, realize o pagamento de R$ 49,90 via nosso site.\n\nAssim que confirmarmos o pagamento, você receberá seu cartão digital.\n\nEquipe Economize SC`,
  })
}

export async function sendCardActivated({
  to,
  name,
}: {
  to: string
  name: string
}) {
  await resend.emails.send({
    from: 'Economize SC <noreply@economizesc.com.br>',
    to,
    subject: 'Seu cartão está ativo — Economize SC!',
    text: `Olá, ${name}!\n\nSeu cartão Economize SC está ativo!\n\nAcesse: ${process.env.NEXT_PUBLIC_APP_URL}/cliente/cartao\n\nBoa temporada!\nEquipe Economize SC`,
  })
}
