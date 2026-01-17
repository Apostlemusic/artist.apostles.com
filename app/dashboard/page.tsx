"use client"
import { useEffect, useState } from "react"
import { Music, Users, Heart, Disc, ListMusic, Eye, EyeOff, ArrowUpRight } from "lucide-react"

import { StatsCard } from "@/components/dashboard/stats-card"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { artistApi } from "@/lib/api/artist"
import type { Artist, ArtistStats } from "@/lib/types"
import { useArtistName } from "@/hooks/use-artist-name"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardPage() {
  const [stats, setStats] = useState<ArtistStats | null>(null)
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)
  const { artistName } = useArtistName()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await artistApi.getStats()
        if (statsRes?.success) {
          setStats(statsRes.stats)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  useEffect(() => {
    if (!artistName) return
    artistApi
      .getArtistByName(artistName)
      .then((res) => {
        if (res?.success) setArtist(res.artist)
      })
      .catch(() => {})
  }, [artistName])

  if (loading) {
    return <div className="flex items-center justify-center h-[50vh]">Loading dashboard...</div>
  }

  const totals = stats?.totals || {
    songs: 0,
    albums: 0,
    playlists: 0,
    hiddenSongs: 0,
    hiddenAlbums: 0,
    songLikes: 0,
    albumLikes: 0,
    followers: 0,
    profileLikes: 0,
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">Artist Overview</h1>
          <p className="text-muted-foreground">Monitor performance, engagement, and growth in one place.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="bg-transparent border-border/60">
            View reports
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            Upload new track
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="size-12 border border-border/50">
              <AvatarImage src={artist?.profileImg || "/placeholder-user.jpg"} />
              <AvatarFallback className="bg-primary/5 text-primary text-sm font-bold">
                {(artist?.name || "Artist")
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{artist?.name || "Your Artist Profile"}</CardTitle>
              <CardDescription className="truncate">{artist?.email || "Complete your profile to reach more fans."}</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="ml-auto bg-transparent border-border/60">
              Edit profile
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border/40 p-4">
              <p className="text-xs text-muted-foreground">Followers</p>
              <p className="text-2xl font-semibold mt-1">{totals.followers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Total audience</p>
            </div>
            <div className="rounded-lg border border-border/40 p-4">
              <p className="text-xs text-muted-foreground">Profile Likes</p>
              <p className="text-2xl font-semibold mt-1">{totals.profileLikes.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Engagement score</p>
            </div>
            <div className="rounded-lg border border-border/40 p-4">
              <p className="text-xs text-muted-foreground">Playlists</p>
              <p className="text-2xl font-semibold mt-1">{totals.playlists.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Inclusion count</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Highlights</CardTitle>
            <CardDescription>Key activity across your catalog.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Music className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Total songs</p>
                  <p className="text-xs text-muted-foreground">Published tracks</p>
                </div>
              </div>
              <p className="text-lg font-semibold">{totals.songs}</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Disc className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Albums</p>
                  <p className="text-xs text-muted-foreground">Studio releases</p>
                </div>
              </div>
              <p className="text-lg font-semibold">{totals.albums}</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Heart className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Song likes</p>
                  <p className="text-xs text-muted-foreground">Track favorites</p>
                </div>
              </div>
              <p className="text-lg font-semibold">{totals.songLikes.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Hidden Songs" value={totals.hiddenSongs} icon={EyeOff} description="Tracks hidden" />
        <StatsCard title="Hidden Albums" value={totals.hiddenAlbums} icon={Eye} description="Albums hidden" />
        <StatsCard title="Album Likes" value={totals.albumLikes.toLocaleString()} icon={Disc} description="Total album favorites" />
        <StatsCard title="Followers" value={totals.followers.toLocaleString()} icon={Users} description="Profile followers" />
      </div>

      {/* <div className="grid gap-6 lg:grid-cols-6">
        <AnalyticsChart />

        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Followers</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                View All
              </Button>
            </div>
            <CardDescription>Your newest fans on Apostles.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Avatar className="size-9 border border-border/50">
                    <AvatarImage src={`/placeholder-user.jpg`} />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">U{i}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">User {i}</p>
                    <p className="text-xs text-muted-foreground truncate">Followed 2 hours ago</p>
                  </div>
                  <Button variant="ghost" size="icon" className="size-8 rounded-full">
                    <ArrowUpRight className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div> */}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Genres</CardTitle>
            <ListMusic className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              {stats?.topGenres.slice(0, 3).map((genre) => (
                <div key={genre.slug} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium capitalize">{genre.slug}</span>
                    <span className="text-muted-foreground">{genre.count} tracks</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${totals.songs ? (genre.count / totals.songs) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Categories</CardTitle>
            <ListMusic className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              {stats?.topCategories.slice(0, 3).map((cat) => (
                <div key={cat.slug} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium capitalize">{cat.slug}</span>
                    <span className="text-muted-foreground">{cat.count} tracks</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${totals.songs ? (cat.count / totals.songs) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profile Performance</CardTitle>
          <Eye className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Profile Likes</p>
                <p className="text-lg font-semibold">{totals.profileLikes.toLocaleString()}</p>
              </div>
              <div className="size-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                <Heart className="size-5" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Playlists Inclusion</p>
                <p className="text-lg font-semibold">{totals.playlists.toLocaleString()}</p>
              </div>
              <div className="size-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                <ListMusic className="size-5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
