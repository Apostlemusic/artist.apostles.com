'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  children: React.ReactNode
}

/**
 * Client-side auth guard using localStorage.
 * Expects localStorage item `apostles_auth` with shape: { exp: number, [optional fields] }
 * If missing or expired (older than 6 days), redirects to /auth/login.
 */
export function RequireAuth({ children }: Props) {
  const router = useRouter()
  const [allowed, setAllowed] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('apostles_auth') : null
      if (!raw) {
        setAllowed(false)
        return
      }
      const parsed = JSON.parse(raw) as { exp?: number }
      const exp = parsed?.exp ?? 0
      const now = Date.now()
      if (!exp || now > exp) {
        // Expired -> clean up and block
        window.localStorage.removeItem('apostles_auth')
        setAllowed(false)
        return
      }
      setAllowed(true)
    } catch {
      // Corrupt value -> remove and block
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('apostles_auth')
      }
      setAllowed(false)
    }
  }, [])

  React.useEffect(() => {
    if (allowed === false) {
      const next = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/dashboard'
      router.replace(`/auth/login?next=${encodeURIComponent(next)}`)
    }
  }, [allowed, router])

  if (allowed === null) {
    // Initial mount or checking -> show nothing to avoid flicker
    return null
  }

  if (allowed === false) {
    return null
  }

  return <>{children}</>
}
