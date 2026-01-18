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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "visible" | "hidden">("all")
  const [editOpen, setEditOpen] = useState(false)
  const [editSong, setEditSong] = useState<Song | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editLyrics, setEditLyrics] = useState("")
  const { toast } = useToast()

  const fetchSongs = async () => {
    try {
      const data = await contentApi.getMySongs()
      if (data.success) {
        setSongs(data.songs)
        toast({ title: "Loaded", description: "Songs list updated." })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load songs.", variant: "destructive" })
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

  const handleEdit = (song: Song) => {
    setEditSong(song)
    setEditTitle(song.title || "")
    setEditDescription(song.description || "")
    setEditLyrics(song.lyrics || "")
    setEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editSong) return
    try {
      await contentApi.editSong(editSong._id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        lyrics: editLyrics.trim(),
      })
      toast({ title: "Updated", description: "Song details updated." })
      setEditOpen(false)
      setEditSong(null)
      fetchSongs()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update song.", variant: "destructive" })
    }
  }

  const filteredSongs = songs
    .filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => {
      if (visibilityFilter === "all") return true
      if (visibilityFilter === "hidden") return s.hidden
      return !s.hidden
    })

  const totalSongs = songs.length
  const hiddenSongs = songs.filter((s) => s.hidden).length
  const visibleSongs = totalSongs - hiddenSongs

  return (
    <div className="space-y-6">
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit song</DialogTitle>
            <DialogDescription>Update the track details and save changes.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Song title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Short description"
                className="min-h-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lyrics">Lyrics</Label>
              <Textarea
                id="edit-lyrics"
                value={editLyrics}
                onChange={(e) => setEditLyrics(e.target.value)}
                placeholder="Paste lyrics here"
                className="min-h-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editTitle.trim()}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Catalog</p>
          <h1 className="text-3xl font-semibold tracking-tight">Songs</h1>
          <p className="text-muted-foreground">Manage uploads, visibility, and performance.</p>
        </div>
        <UploadSongDialog onSongUploaded={fetchSongs} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Total songs</p>
            <p className="text-2xl font-semibold">{totalSongs}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Visible</p>
            <p className="text-2xl font-semibold">{visibleSongs}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Hidden</p>
            <p className="text-2xl font-semibold">{hiddenSongs}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search songs..."
            className="pl-9 h-10 border-border/50 focus-visible:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={visibilityFilter} onValueChange={(v) => setVisibilityFilter(v as any)}>
          <SelectTrigger className="w-full md:w-44 border-border/50">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All songs</SelectItem>
            <SelectItem value="visible">Visible</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>
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
                  onEdit={handleEdit}
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
