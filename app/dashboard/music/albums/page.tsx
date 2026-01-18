"use client"
import { useEffect, useState } from "react"
import { Search, Disc, Filter } from "lucide-react"

import { albumsApi } from "@/lib/api/albums"
import type { Album } from "@/lib/types"
import { UploadAlbumDialog } from "@/components/music/upload-album-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "visible" | "hidden">("all")
  const [editOpen, setEditOpen] = useState(false)
  const [editAlbum, setEditAlbum] = useState<Album | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editCoverImg, setEditCoverImg] = useState("")
  const { toast } = useToast()

  const fetchAlbums = async () => {
    try {
      const data = await albumsApi.getMyAlbums()
      if (data.success) {
        setAlbums(data.albums)
        toast({ title: "Loaded", description: "Albums list updated." })
      } else if (Array.isArray(data)) {
        // Fallback in case API returns a raw array
        setAlbums(data as Album[])
        toast({ title: "Loaded", description: "Albums list updated." })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load albums.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlbums()
  }, [])

  const handleToggleHide = async (id: string, currentlyHidden: boolean) => {
    try {
      if (currentlyHidden) {
        await albumsApi.unhideAlbum(id)
      } else {
        await albumsApi.hideAlbum(id)
      }
      toast({ title: "Updated", description: `Album ${currentlyHidden ? "unhidden" : "hidden"} successfully.` })
      fetchAlbums()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update album status.", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this album?")) return
    try {
      await albumsApi.removeAlbum(id)
      toast({ title: "Deleted", description: "Album removed successfully." })
      fetchAlbums()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete album.", variant: "destructive" })
    }
  }

  const handleEdit = (album: Album) => {
    setEditAlbum(album)
    setEditName(album.name || "")
    setEditDescription(album.description || "")
    setEditCoverImg(album.coverImg || "")
    setEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editAlbum) return
    try {
      await albumsApi.editAlbum({
        albumId: editAlbum._id,
        title: editName.trim(),
        description: editDescription.trim(),
        coverImg: editCoverImg.trim(),
      })
      toast({ title: "Updated", description: "Album details updated." })
      setEditOpen(false)
      setEditAlbum(null)
      fetchAlbums()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update album.", variant: "destructive" })
    }
  }

  const filteredAlbums = albums
    .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    .filter((a) => {
      if (visibilityFilter === "all") return true
      if (visibilityFilter === "hidden") return a.hidden
      return !a.hidden
    })

  const totalAlbums = albums.length
  const hiddenAlbums = albums.filter((a) => a.hidden).length
  const visibleAlbums = totalAlbums - hiddenAlbums

  return (
    <div className="space-y-6">
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit album</DialogTitle>
            <DialogDescription>Update the album details and save changes.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Album name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Album name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cover">Cover image URL</Label>
              <Input
                id="edit-cover"
                value={editCoverImg}
                onChange={(e) => setEditCoverImg(e.target.value)}
                placeholder="https://..."
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
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim()}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Catalog</p>
          <h1 className="text-3xl font-semibold tracking-tight">Albums</h1>
          <p className="text-muted-foreground">Track releases, visibility, and performance.</p>
        </div>
        <UploadAlbumDialog onAlbumUploaded={fetchAlbums} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Total albums</p>
            <p className="text-2xl font-semibold">{totalAlbums}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Visible</p>
            <p className="text-2xl font-semibold">{visibleAlbums}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Hidden</p>
            <p className="text-2xl font-semibold">{hiddenAlbums}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search albums..."
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
            <SelectItem value="all">All albums</SelectItem>
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
            <div className="p-8 text-center text-muted-foreground">Loading your albums...</div>
          ) : filteredAlbums.length > 0 ? (
            <div className="divide-y divide-border/50">
              {filteredAlbums.map((album) => (
                <div key={album._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors group">
                  <div className="relative size-12 rounded-lg overflow-hidden shrink-0 bg-secondary">
                    <img src={album.coverImg || "/placeholder.jpg"} alt={album.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Disc className="size-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold truncate">{album.name}</h4>
                      {album.hidden && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] uppercase tracking-wider">
                          Hidden
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{album.description}</p>
                  </div>
                  <div className="hidden md:flex flex-col items-end px-4">
                    <div className="text-xs font-medium text-foreground">{album.tracksId?.length || 0} tracks</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{album.genre?.[0]}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleHide(album._id, album.hidden)}
                      className="rounded-full"
                    >
                      {album.hidden ? "Unhide" : "Hide"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(album)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(album._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Disc className="size-8" />
              </div>
              <h3 className="text-lg font-semibold">No albums found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                You haven't uploaded any albums yet or no matches for your search.
              </p>
              <Button variant="link" className="text-primary mt-2" onClick={() => setSearch("")}>Clear search</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
