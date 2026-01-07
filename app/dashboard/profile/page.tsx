"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Camera, Save, Loader2, User, Mail, Globe, Info } from "lucide-react"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [artist, setArtist] = useState<Artist | null>(null)
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
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your public presence and account details.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-8">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="bg-secondary/50 p-1 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="social">Social Links</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Public Profile</CardTitle>
                  <CardDescription>This information will be visible to everyone on Apostles.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <Avatar className="size-24 border-2 border-primary/20">
                          <AvatarImage src={artist?.profileImg || "/placeholder-user.jpg"} />
                          <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                            {(artist?.name || "Artist").split(" ").map((p) => p[0]).slice(0,2).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute -bottom-1 -right-1 size-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Camera className="size-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-base">Profile Photo</h3>
                        <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 2MB.</p>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" className="h-8 text-xs border-border/50 bg-transparent">
                            Change
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="about">Short Bio</Label>
                        <Input id="about" {...register("about")} placeholder="A brief catchphrase..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">About You</Label>
                        <Textarea
                          id="description"
                          {...register("description")}
                          placeholder="Tell your story to your fans..."
                          className="min-h-30 resize-none"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 px-6 py-4 border-t border-border/50">
                    <Button type="submit" disabled={loading || !isDirty} className="ml-auto bg-primary">
                      {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
                      Save Changes
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                  <CardDescription>How Apostles can reach you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Mail className="size-3" /> Email Address
                      </Label>
                      <p className="text-sm font-medium">{artist?.email ?? ""}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <User className="size-3" /> User Type
                      </Label>
                      <p className="text-sm font-medium capitalize">{artist?.type ?? ""}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Audience & Engagement</CardTitle>
                  <CardDescription>Your fanbase and interactions.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Followers</Label>
                    <p className="text-sm font-bold">{(artist?.followers?.length ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Likes</Label>
                    <p className="text-sm font-bold">{(artist?.likes?.length ?? 0).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Social Media Profiles</CardTitle>
                  <CardDescription>Add links to your other platforms.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
                <CardFooter className="border-t border-border/50">
                  <Button className="ml-auto bg-primary">Update Socials</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-full md:w-80 space-y-6">
          <Card className="border-border/50 shadow-sm bg-primary/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Info className="size-16 rotate-12" />
            </div>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary animate-pulse" />
                Verified Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-primary/80 leading-relaxed">
                Your account is currently verified. This means you have access to exclusive artist features and your
                profile shows the blue badge.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Account Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start text-xs h-9 border-border/50 bg-transparent">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs h-9 border-border/50 bg-transparent">
                Two-Factor Auth
              </Button>
            </CardContent>
            <CardFooter className="border-t border-border/50">{/* Additional footer content if needed */}</CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
