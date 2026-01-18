"use client"

import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { Camera, Save, Loader2, Mail, KeyRound, Trash2 } from "lucide-react"

import { artistApi } from "@/lib/api/artist"
import type { EditProfileData } from "@/lib/types"
import { artistService } from "@/services/artist-service"
import type { Artist } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { PasswordInput } from "@/components/ui/password-input"
import { logout } from "@/lib/auth"

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [artist, setArtist] = useState<Artist | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetOtp, setResetOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<EditProfileData>({
    defaultValues: {
      about: "",
      description: "",
      profileImg: "",
    },
  })

  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    artistService
      .getProfileMe()
      .then((payload: any) => {
        const data: Artist = payload?.artist ?? payload
        setArtist(data)
        // Pre-fill form with fetched values
        const name = data.name ?? ""
        const about = data.about ?? ""
        const description = data.description ?? ""
        const profileImg = data.profileImg ?? ""
        // @ts-ignore - using RHF reset via closure
        reset({ name, about, description, profileImg })
        if (data.email) setResetEmail(data.email)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!avatarFile) return
    const url = URL.createObjectURL(avatarFile)
    setAvatarPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [avatarFile])

  const onSubmit = async (data: EditProfileData) => {
    setLoading(true)
    try {
      let profileImgUrl = data.profileImg
      if (avatarFile) {
        profileImgUrl = await uploadAvatar(avatarFile)
        if (!profileImgUrl) {
          toast({ title: "Upload failed", description: "Avatar upload did not return a URL.", variant: "destructive" })
          setLoading(false)
          return
        }
      }
      const payload: EditProfileData = {
        ...data,
        profileImg: profileImgUrl,
      }
      await artistApi.editProfile(payload)
      toast({ title: "Profile Updated", description: "Your changes have been saved successfully." })
      setIsEditing(false)
      setArtist((prev) => ({ ...(prev ?? {}), ...payload }))
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const uploadAvatar = async (file?: File) => {
    if (!file) return ""
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    if (!cloudName || !uploadPreset) {
      toast({
        title: "Cloudinary not configured",
        description: "Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
        variant: "destructive",
      })
      return ""
    }

    try {
      setUploadingAvatar(true)
      setUploadProgress(0)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", uploadPreset)
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
      const res = await import("axios").then(({ default: axios }) =>
        axios.post(url, formData, {
          onUploadProgress: (evt) => {
            if (!evt.total) return
            const pct = Math.round((evt.loaded / evt.total) * 100)
            setUploadProgress(pct)
          },
        })
      )
      const secureUrl = res?.data?.secure_url || res?.data?.url || ""
      if (secureUrl) {
        toast({ title: "Avatar uploaded", description: "Profile image updated." })
        return secureUrl
      }
      toast({ title: "Upload failed", description: "No URL returned from Cloudinary.", variant: "destructive" })
      return ""
    } catch {
      toast({ title: "Upload failed", description: "Could not upload avatar.", variant: "destructive" })
      return ""
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleRequestOtp = async () => {
    if (!resetEmail) {
      toast({ title: "Email required", description: "Enter your account email.", variant: "destructive" })
      return
    }
    try {
      const res = await artistApi.forgotPassword({ email: resetEmail })
      toast({ title: "OTP sent", description: res?.otp ? `OTP: ${res.otp}` : "Check your email for the OTP." })
    } catch {
      toast({ title: "Error", description: "Failed to send OTP.", variant: "destructive" })
    }
  }

  const handleResetPassword = async () => {
    if (!resetEmail || !resetOtp || !newPassword) {
      toast({ title: "Missing fields", description: "Fill in email, OTP, and new password.", variant: "destructive" })
      return
    }
    setPasswordLoading(true)
    try {
      await artistApi.resetPassword({ email: resetEmail, otp: resetOtp, newPassword })
      toast({ title: "Password updated", description: "Your password has been changed." })
      setPasswordOpen(false)
      setResetOtp("")
      setNewPassword("")
    } catch {
      toast({ title: "Error", description: "Failed to update password.", variant: "destructive" })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const artistId = artist?.id || artist?._id
    if (!artistId) {
      toast({ title: "Error", description: "Missing artist id.", variant: "destructive" })
      return
    }
    try {
      await artistApi.deleteArtist(artistId)
      toast({ title: "Account deleted", description: "Your account has been removed." })
      logout("/auth/register")
    } catch {
      toast({ title: "Error", description: "Failed to delete account.", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Profile</p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Artist Profile</h1>
        <p className="text-muted-foreground max-w-2xl">
          Manage your artist details in a clean, focused workspace.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Artist Information</CardTitle>
              <CardDescription>Update your avatar, tagline, story, and public details.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="relative group">
                    <Avatar className="size-24 border-2 border-primary/20">
                      <AvatarImage src={avatarPreview || artist?.profileImg || "/placeholder-user.jpg"} />
                      <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                        {(artist?.name || "Artist").split(" ").map((p) => p[0]).slice(0,2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-primary text-primary-foreground text-[10px] px-2 py-0.5 shadow">
                      Verified
                    </div>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute -bottom-1 -left-1 size-8 rounded-full shadow-md"
                        disabled={uploadingAvatar}
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Camera className="size-4" />
                      </Button>
                    )}
                    {isEditing && (
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={avatarInputRef}
                        onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base">{artist?.name || "Artist"}</h3>
                    <p className="text-xs text-muted-foreground">{artist?.email || "artist@apostles.com"}</p>
                    {!isEditing && (
                      <p className="text-sm text-muted-foreground">{artist?.about || "Artist tagline goes here."}</p>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Artist name</Label>
                        <Input id="name" {...register("name")} placeholder="Artist name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="about">Artist tagline</Label>
                        <Input id="about" {...register("about")} placeholder="A short statement fans remember" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Artist story</Label>
                        <Textarea
                          id="description"
                          {...register("description")}
                          placeholder="Share the journey behind your music"
                          className="min-h-30 resize-none"
                        />
                      </div>
                    </div>

                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Artist story</Label>
                      <p className="text-sm text-foreground/90">
                        {artist?.description || "Share your story to connect with your audience."}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
              {isEditing && (
                <CardFooter className="bg-muted/30 px-6 py-4 border-t border-border/50">
                  <Button type="submit" disabled={loading || !isDirty} className="ml-auto bg-primary">
                    {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
                    Save updates
                  </Button>
                </CardFooter>
              )}
            </form>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Account Actions</CardTitle>
              <CardDescription>Security and profile controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-sm h-10 border-border/50 bg-transparent"
                onClick={() => setIsEditing((prev) => !prev)}
              >
                {isEditing ? "Cancel Editing" : "Edit Profile"}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-sm h-10 border-border/50 bg-transparent"
                onClick={() => setPasswordOpen(true)}
              >
                <KeyRound className="mr-2 size-4" />
                Change Password
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full justify-start text-sm h-10">
                    <Trash2 className="mr-2 size-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action is permanent and will remove your artist account and content.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>Request an OTP and set a new password.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="artist@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-otp">OTP</Label>
              <Input
                id="reset-otp"
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value)}
                placeholder="123456"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-pass">New password</Label>
              <PasswordInput
                id="reset-pass"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button variant="outline" onClick={handleRequestOtp}>
              Request OTP
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={passwordLoading}>
              {passwordLoading ? "Saving..." : "Save password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
