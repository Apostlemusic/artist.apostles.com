"use client"
import { useEffect, useState } from "react"
import { Search, Music2, Filter } from "lucide-react"

import { contentApi } from "@/lib/api/content"
import type { Song } from "@/lib/types"
import { SongItem } from "@/components/music/song-item"
import { UploadSongDialog } from "@/components/music/upload-song-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const { toast } = useToast()

  const fetchSongs = async () => {
    try {
      const data = await contentApi.getMySongs()
      if (data.success) {
        setSongs(data.songs)
      }
    } catch (error) {
      console.error("Failed to fetch songs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSongs()
  }, [])

  const handleToggleHide = async (id: string, currentlyHidden: boolean) => {
    try {
      if (currentlyHidden) {
        await contentApi.unhideSong(id)
      } else {
        await contentApi.hideSong(id)
      }
      toast({ title: "Updated", description: `Song ${currentlyHidden ? "unhidden" : "hidden"} successfully.` })
      fetchSongs()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update song status.", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this song?")) return
    try {
      await contentApi.removeSong(id)
      toast({ title: "Deleted", description: "Song removed successfully." })
      fetchSongs()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete song.", variant: "destructive" })
    }
  }

  const filteredSongs = songs.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Songs</h1>
          <p className="text-muted-foreground mt-1">Manage your uploaded tracks and performance.</p>
        </div>
        <UploadSongDialog onSongUploaded={fetchSongs} />
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search songs..."
            className="pl-9 h-10 border-border/50 focus-visible:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10 border-border/50 bg-transparent">
          <Filter className="size-4" />
        </Button>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading your songs...</div>
          ) : filteredSongs.length > 0 ? (
            <div className="divide-y divide-border/50">
              {filteredSongs.map((song) => (
                <SongItem
                  key={song._id}
                  song={song}
                  onToggleHide={handleToggleHide}
                  onDelete={handleDelete}
                  onEdit={() => {}} // TODO: Implement edit
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Music2 className="size-8" />
              </div>
              <h3 className="text-lg font-semibold">No songs found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                You haven't uploaded any songs yet or no matches for your search.
              </p>
              <Button variant="link" className="text-primary mt-2" onClick={() => setSearch("")}>
                Clear search
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
