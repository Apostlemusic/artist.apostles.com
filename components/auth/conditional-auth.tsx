'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  children: React.ReactNode
}

/**
 * Conditionally enforces auth (via localStorage `apostles_auth`) for protected routes
 * like `/dashboard`. Non-protected routes render normally.
 */
export function ConditionalAuth({ children }: Props) {
  const router = useRouter()
  const [allowed, setAllowed] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const path = window.location.pathname
    const needsAuth = path.startsWith('/dashboard')

    if (!needsAuth) {
      setAllowed(true)
      return
    }

    try {
      const raw = window.localStorage.getItem('apostles_auth')
      if (!raw) {
        setAllowed(false)
        return
      }
      const parsed = JSON.parse(raw) as { exp?: number }
      const exp = parsed?.exp ?? 0
      if (!exp || Date.now() > exp) {
        window.localStorage.removeItem('apostles_auth')
        setAllowed(false)
        return
      }
      setAllowed(true)
    } catch {
      window.localStorage.removeItem('apostles_auth')
      setAllowed(false)
    }
  }, [])

  React.useEffect(() => {
    if (allowed === false && typeof window !== 'undefined') {
      const next = window.location.pathname + window.location.search
      router.replace(`/auth/login?next=${encodeURIComponent(next)}`)
    }
  }, [allowed, router])

  if (allowed === null) return null
  if (allowed === false) return null
  return <>{children}</>
}
