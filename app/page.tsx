'use client'

import * as React from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'

export default function IndexRedirect() {
  const router = useRouter()

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('apostles_auth') : null
      if (!raw) {
        router.replace('/auth/login')
        return
      }
      const parsed = JSON.parse(raw) as { exp?: number }
      const exp = parsed?.exp ?? 0
      if (!exp || Date.now() > exp) {
        window.localStorage.removeItem('apostles_auth')
        router.replace('/auth/login')
        return
      }
      router.replace('/dashboard')
    } catch {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('apostles_auth')
      }
      router.replace('/auth/login')
    }
  }, [router])

  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner className="size-4" />
        Redirecting...
      </div>
    </div>
  )
}
