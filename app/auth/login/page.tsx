"use client"
import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { useRouter, useSearchParams } from "next/navigation"
import { artistApi } from "@/lib/api/artist"
import type { LoginData } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit } = useForm<LoginData>()
  const searchParams = useSearchParams()

  const onSubmit = async (data: LoginData) => {
    setLoading(true)
    try {
      const res = await artistApi.login(data)
      // Persist auth in localStorage with 6-day expiry
      try {
        const sixDaysMs = 6 * 24 * 60 * 60 * 1000
        const payload = { exp: Date.now() + sixDaysMs, email: data.email }
        window.localStorage.setItem("apostles_auth", JSON.stringify(payload))
        // Store artist id and name if present in response
        const artistId = (res?.artist && (res.artist.id || res.artist._id)) || undefined
        const artistName = (res?.artist && res.artist.name) || undefined
        if (artistId) window.localStorage.setItem("apostles_artist_id", String(artistId))
        if (artistName) window.localStorage.setItem("apostles_artist_name", String(artistName))
      } catch {}
  toast({ title: "Logged in", description: "Welcome back!" })
  const next = searchParams?.get("next")
  router.replace(next || "/dashboard")
    } catch (e) {
      toast({ title: "Error", description: "Login failed", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Log in to your account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="artist@example.com" {...register("email", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" placeholder="••••••••" {...register("password", { required: true })} />
          </div>
          <Button type="submit" className="w-full bg-primary" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>
        <div className="mt-4 text-xs text-muted-foreground flex justify-between">
          <Link className="text-primary" href="/auth/register">Create account</Link>
          <Link className="text-primary" href="/auth/forgot-password">Forgot password?</Link>
        </div>
      </CardContent>
    </Card>
  )
}
