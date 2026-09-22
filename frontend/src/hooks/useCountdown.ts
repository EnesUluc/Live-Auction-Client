import { useEffect, useState } from 'react'
import { formatRemaining } from '../lib/format'

/** Ticks once a second and returns the humanised remaining time (null once expired). */
export function useCountdown(endTime: string | null | undefined) {
  const target = endTime ? new Date(endTime).getTime() : null
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!target) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])

  if (!target || Number.isNaN(target)) return { label: null, expired: false, msLeft: 0 }

  const msLeft = target - now
  return { label: formatRemaining(msLeft), expired: msLeft <= 0, msLeft }
}
