"use client"

import { useEffect, useState } from "react"
import { Users, Heart, Share2, Award, ExternalLink } from "lucide-react"

import { artistApi } from "@/lib/api/artist"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function SocialPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await artistApi.getStats()
        if (data.success) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error("Failed to fetch social stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="p-8">Loading social insights...</div>

  const totals = stats?.totals || { followers: 0, profileLikes: 0, songLikes: 0 }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Social Insights</h1>
        <p className="text-muted-foreground mt-1">Track your engagement and connect with your audience.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/50 shadow-sm overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Followers
              <Users className="size-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totals.followers.toLocaleString()}</div>
            <p className="text-xs text-emerald-500 font-medium mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Profile Likes
              <Heart className="size-4 text-rose-500 opacity-50 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totals.profileLikes.toLocaleString()}</div>
            <p className="text-xs text-emerald-500 font-medium mt-1">+5% from last month</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total Engagement
              <Share2 className="size-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(totals.songLikes + totals.profileLikes).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Combined profile & track likes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Top Fans</CardTitle>
            <CardDescription>Fans who interact most with your music.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="size-10 border border-border/50 shadow-sm">
                      <AvatarImage src={`/placeholder-user.jpg`} />
                      <AvatarFallback className="bg-primary/5 text-primary text-sm font-bold">F{i}</AvatarFallback>
                    </Avatar>
                    {i === 1 && (
                      <div className="absolute -top-1 -right-1 size-4 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-background">
                        <Award className="size-2 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">Fan Name {i}</p>
                    <p className="text-xs text-muted-foreground truncate">{100 - i * 5} interactions</p>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px]">
                    TOP FAN
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Engagement</CardTitle>
            <CardDescription>Direct actions taken on your profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="size-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    {i % 2 === 0 ? (
                      <Heart className="size-4 text-rose-500" />
                    ) : (
                      <Users className="size-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm leading-tight">
                      <span className="font-semibold">User {i}</span>{" "}
                      {i % 2 === 0 ? "liked your profile" : "started following you"}
                    </p>
                    <p className="text-xs text-muted-foreground">{i * 15} minutes ago</p>
                  </div>
                  <Button variant="ghost" size="icon" className="size-8">
                    <ExternalLink className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
