"use client"
import { useEffect, useState } from "react"
import { Music, Users, Heart, Disc, ListMusic, Eye, EyeOff, ArrowUpRight } from "lucide-react"

import { StatsCard } from "@/components/dashboard/stats-card"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { artistApi } from "@/lib/api/artist"
import type { ArtistStats } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardPage() {
  const [stats, setStats] = useState<ArtistStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await artistApi.getStats()
        if (data.success) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your music today.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
            Download Report
          </Button> */}
          {/* <Button size="sm" className="bg-primary hover:bg-primary/90">
            Upload New Track
          </Button> */}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Songs" value={totals.songs} icon={Music} description="Published tracks" />
        <StatsCard title="Active Albums" value={totals.albums} icon={Disc} description="Released studio albums" />
        <StatsCard title="Followers" value={totals.followers.toLocaleString()} icon={Users} description="Profile followers" />
        <StatsCard title="Playlists" value={totals.playlists} icon={ListMusic} description="Playlist inclusions" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Hidden Songs" value={totals.hiddenSongs} icon={EyeOff} description="Tracks hidden" />
        <StatsCard title="Hidden Albums" value={totals.hiddenAlbums} icon={Eye} description="Albums hidden" />
        <StatsCard title="Song Likes" value={totals.songLikes.toLocaleString()} icon={Heart} description="Total track favorites" />
        <StatsCard title="Album Likes" value={totals.albumLikes.toLocaleString()} icon={Disc} description="Total album favorites" />
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
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Profile Likes</p>
                  <p className="text-lg font-bold">{totals.profileLikes}</p>
                </div>
                <div className="size-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <Heart className="size-5" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Playlists Inclusion</p>
                  <p className="text-lg font-bold">{totals.playlists}</p>
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
