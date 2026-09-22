const money = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
})

const compactMoney = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const clock = new Intl.DateTimeFormat('tr-TR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

const dateTime = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatMoney = (v: number | null | undefined) =>
  typeof v === 'number' && Number.isFinite(v) ? money.format(v) : '—'

export const formatMoneyCompact = (v: number | null | undefined) =>
  typeof v === 'number' && Number.isFinite(v) ? compactMoney.format(v) : '—'

export const formatClock = (iso: string | null | undefined) =>
  iso ? clock.format(new Date(iso)) : '—'

export const formatDateTime = (iso: string | null | undefined) =>
  iso ? dateTime.format(new Date(iso)) : '—'

/** "2s 14dk" — remaining time, or null once the deadline has passed. */
export function formatRemaining(ms: number): string | null {
  if (!Number.isFinite(ms) || ms <= 0) return null
  const s = Math.floor(ms / 1000)
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60

  if (d > 0) return `${d}g ${h}s`
  if (h > 0) return `${h}s ${String(m).padStart(2, '0')}dk`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

/** Short, stable id fragment for display: "a4f1…9c2b" */
export const shortId = (id: string) =>
  id.length <= 12 ? id : `${id.slice(0, 6)}…${id.slice(-4)}`

/** Deterministic pastel hue from a name, for avatar chips. */
export function hueFromString(value: string): number {
  let h = 0
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) % 360
  return h
}

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?'
