"use client"
import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { artistApi } from "@/lib/api/artist"
import type { RegisterData } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit } = useForm<RegisterData>({
    defaultValues: { type: "artist" },
  })
  const router = useRouter()

  const onSubmit = async (data: RegisterData) => {
    setLoading(true)
    try {
      const res = await artistApi.register(data)
      // Save email to localStorage for verify-otp prefill
      try {
        window.localStorage.setItem("apostles_email", data.email)
      } catch {}
      toast({ title: "Registered", description: `Welcome ${data.name}!` })
      // Optionally route to verify-otp
      router.push("/auth/verify-otp")
    } catch (e) {
      toast({ title: "Error", description: "Registration failed", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Create your artist account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your name" {...register("name", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="artist@example.com" {...register("email", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" placeholder="••••••••" {...register("password", { required: true })} />
          </div>
          <div className="space-y-2 hidden">
            <Label htmlFor="type">Account Type</Label>
            <Input id="type" readOnly {...register("type")} />
          </div>
          <Button type="submit" className="w-full bg-primary mt-4" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Already have an account? <Link className="text-primary" href="/auth/login">Log in</Link>
        </p>
      </CardContent>
    </Card>
  )
}
