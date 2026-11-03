// ============================================================
// NETIZENCITY - Formatting Utilities
// ============================================================

export function formatCoins(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  } catch {
    return dateString
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffSeconds < 60) return 'Baru saja'
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} menit lalu`
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} jam lalu`
    return `${Math.floor(diffSeconds / 86400)} hari lalu`
  } catch {
    return dateString
  }
}
