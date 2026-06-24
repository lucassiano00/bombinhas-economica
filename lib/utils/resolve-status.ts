type StatusResult = 'active' | 'inactive' | 'not_found'

export function resolveStatus(
  client: { status: string } | null,
  parentClient: { status: string } | null
): StatusResult {
  const status = client?.status ?? parentClient?.status
  if (!status) return 'not_found'
  return status === 'active' ? 'active' : 'inactive'
}
