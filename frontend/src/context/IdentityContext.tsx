import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * PlaceBid takes a free-form user_id, so identity is a locally chosen display
 * name. Kept in one place so every bid in the session is attributable.
 */
const KEY = 'auction.identity.v1'

interface IdentityValue {
  userId: string
  setUserId: (value: string) => void
  isSet: boolean
}

const IdentityContext = createContext<IdentityValue | null>(null)

function readStored(): string {
  try {
    return localStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState<string>(readStored)

  const setUserId = useCallback((value: string) => {
    const next = value.trim()
    setUserIdState(next)
    try {
      if (next) localStorage.setItem(KEY, next)
      else localStorage.removeItem(KEY)
    } catch {
      // non-persistent session is still perfectly usable
    }
  }, [])

  const value = useMemo(
    () => ({ userId, setUserId, isSet: userId.length > 0 }),
    [userId, setUserId],
  )

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>
}

export function useIdentity(): IdentityValue {
  const ctx = useContext(IdentityContext)
  if (!ctx) throw new Error('useIdentity must be used inside <IdentityProvider>')
  return ctx
}
