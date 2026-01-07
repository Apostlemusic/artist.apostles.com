"use client"
import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { artistApi } from "@/lib/api/artist"
import type { ResetPasswordData } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"

export default function ResetPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit } = useForm<ResetPasswordData>()

  const onSubmit = async (data: ResetPasswordData) => {
    setLoading(true)
    try {
      const res = await artistApi.resetPassword(data)
      toast({ title: "Password reset", description: res.message || "You can now log in." })
      router.push("/auth/login")
    } catch (e) {
      toast({ title: "Error", description: "Reset failed", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Reset your password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="artist@example.com" {...register("email", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="otp">OTP</Label>
            <Input id="otp" placeholder="1234" {...register("otp", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <PasswordInput id="newPassword" placeholder="••••••••" {...register("newPassword", { required: true })} />
          </div>
          <Button type="submit" className="w-full bg-primary" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          <Link className="text-primary" href="/auth/login">Back to login</Link>
        </p>
      </CardContent>
    </Card>
  )
}
