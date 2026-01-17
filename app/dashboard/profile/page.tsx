"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Camera, Save, Loader2, Mail, Globe } from "lucide-react"

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

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [artist, setArtist] = useState<Artist | null>(null)
  const [isEditing, setIsEditing] = useState(false)
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

  useEffect(() => {
    artistService
      .getProfileMe()
      .then((payload: any) => {
        const data: Artist = payload?.artist ?? payload
        setArtist(data)
        // Pre-fill form with fetched values
        const about = data.about ?? ""
        const description = data.description ?? ""
        const profileImg = data.profileImg ?? ""
        // @ts-ignore - using RHF reset via closure
        reset({ about, description, profileImg })
      })
      .catch(() => {})
  }, [])

  const onSubmit = async (data: EditProfileData) => {
    setLoading(true)
    try {
      await artistApi.editProfile(data)
      toast({ title: "Profile Updated", description: "Your changes have been saved successfully." })
      setIsEditing(false)
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" })
    } finally {
      setLoading(false)
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
                      <AvatarImage src={artist?.profileImg || "/placeholder-user.jpg"} />
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
                      >
                        <Camera className="size-4" />
                      </Button>
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

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                          <Input id="website" placeholder="https://yourwebsite.com" className="pl-9" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input id="instagram" placeholder="@username" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter / X</Label>
                        <Input id="twitter" placeholder="@username" />
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

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Website</Label>
                        <p className="text-sm text-foreground/90">https://yourwebsite.com</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Instagram</Label>
                        <p className="text-sm text-foreground/90">@username</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Twitter / X</Label>
                        <p className="text-sm text-foreground/90">@username</p>
                      </div>
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
              <Button variant="outline" className="w-full justify-start text-sm h-10 border-border/50 bg-transparent">
                Change Password
              </Button>
              <Button variant="destructive" className="w-full justify-start text-sm h-10">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
