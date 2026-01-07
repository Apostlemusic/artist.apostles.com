"use client"
import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { artistApi } from "@/lib/api/artist"
import type { ForgotPasswordData } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit } = useForm<ForgotPasswordData>()

  const onSubmit = async (data: ForgotPasswordData) => {
    setLoading(true)
    try {
      const res = await artistApi.forgotPassword(data)
      toast({ title: "Email sent", description: res.message || "Check your inbox for reset steps." })
    } catch (e) {
      toast({ title: "Error", description: "Request failed", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Forgot password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="artist@example.com" {...register("email", { required: true })} />
          </div>
          <Button type="submit" className="w-full bg-primary" disabled={loading}>
            {loading ? "Submitting..." : "Send reset link"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Remembered? <Link className="text-primary" href="/auth/login">Log in</Link>
        </p>
      </CardContent>
    </Card>
  )
}
