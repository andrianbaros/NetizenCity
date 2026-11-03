// ============================================================
// NETIZENCITY - KTN (Kartu Tanda Netizen) Generator
// Format: KTN-YYYYMMDD-XXXXX
// ============================================================

export function generateKTNNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const dateStr = `${year}${month}${day}`

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let randomPart = ''
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return `KTN-${dateStr}-${randomPart}`
}
