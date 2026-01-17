"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { artistApi } from "@/lib/api/artist"
import type { VerifyOtpData } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function VerifyOtpPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit } = useForm<{ otp: string }>()
  const [savedEmail, setSavedEmail] = useState<string | null>(null)
  const router = useRouter()

  // Read saved email from localStorage
  useEffect(() => {
    try {
      const email = typeof window !== "undefined" ? window.localStorage.getItem("apostles_email") : null
      setSavedEmail(email)
    } catch {
      setSavedEmail(null)
    }
  }, [])

  const onSubmit = async (data: { otp: string }) => {
    setLoading(true)
    try {
      const email = savedEmail || ""
      if (!email) {
        toast({ title: "Missing email", description: "No saved email found. Please register or log in first.", variant: "destructive" })
        return
      }
      const res = await artistApi.verifyOtp({ email, otp: data.otp } as VerifyOtpData)
      try {
        const sixDaysMs = 6 * 24 * 60 * 60 * 1000
        const payload = { exp: Date.now() + sixDaysMs, email }
        window.localStorage.setItem("apostles_auth", JSON.stringify(payload))
        if (res?.accessToken) window.localStorage.setItem("apostles_access_token", String(res.accessToken))
        if (res?.refreshToken) window.localStorage.setItem("apostles_refresh_token", String(res.refreshToken))
        const artistId = (res?.artist && (res.artist.id || res.artist._id)) || undefined
        const artistName = (res?.artist && res.artist.name) || undefined
        if (artistId) window.localStorage.setItem("apostles_artist_id", String(artistId))
        if (artistName) window.localStorage.setItem("apostles_artist_name", String(artistName))
      } catch {}
      toast({ title: "Verified", description: res.message || "OTP verified" })
      router.push("/dashboard")
    } catch (e) {
      toast({ title: "Error", description: "Verification failed", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const onResend = async (email: string) => {
    setLoading(true)
    try {
      const res = await artistApi.resendOtp({ email })
      toast({ title: "OTP Sent", description: res.otp ? `New OTP: ${res.otp}` : "New OTP sent" })
    } catch (e) {
      toast({ title: "Error", description: "Resend failed", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full h-full md:w-1/2 lg:w-1/3 border-0 shadow-none rounded-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-xl">Verify your account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* <div className="space-y-2">
            <Label>Email</Label>
            <div className="text-sm text-muted-foreground">
              {savedEmail || "No saved email"}
            </div>
          </div> */}
          <div className="space-y-2">
            <Label htmlFor="otp">OTP</Label>
            <Input id="otp" placeholder="1234" {...register("otp", { required: true })} />
          </div>
          <Button type="submit" className="w-full bg-primary" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </form>
        <div className="mt-4 flex items-center justify-between text-xs">
          <Link className="text-primary" href="/auth/login">Back to login</Link>
          <Button variant="ghost" size="sm" onClick={() => {
            const email = savedEmail || ""
            if (email) onResend(email)
          }}>Resend OTP</Button>
        </div>
      </CardContent>
    </Card>
  )
}
