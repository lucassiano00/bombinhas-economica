import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/actions/verify-status', () => ({ verifyStatus: vi.fn() }))

import { StatusCheckForm } from '@/components/forms/status-check-form'
import { verifyStatus } from '@/lib/actions/verify-status'

beforeEach(() => vi.clearAllMocks())

describe('StatusCheckForm', () => {
  it('shows a friendly error (not a silent failure) when the action throws', async () => {
    vi.mocked(verifyStatus).mockRejectedValue(new Error('Failed query'))
    render(<StatusCheckForm locale="pt" />)

    await userEvent.type(screen.getByLabelText(/cpf ou dni/i), '12345678900')
    await userEvent.click(screen.getByRole('button', { name: /verificar status/i }))

    await waitFor(() =>
      expect(screen.getByText(/tente novamente em instantes/i)).toBeInTheDocument()
    )
    // botão volta a ficar clicável (loading resetou)
    expect(screen.getByRole('button', { name: /verificar status/i })).not.toBeDisabled()
  })

  it('renders the status result on success', async () => {
    vi.mocked(verifyStatus).mockResolvedValue('active')
    render(<StatusCheckForm locale="pt" />)

    await userEvent.type(screen.getByLabelText(/cpf ou dni/i), '12345678900')
    await userEvent.click(screen.getByRole('button', { name: /verificar status/i }))

    await waitFor(() => expect(screen.getByText(/status do seu cartão/i)).toBeInTheDocument())
  })
})
