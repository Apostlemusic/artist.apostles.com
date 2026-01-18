"use client"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import axios from "axios"
import { Plus, ImageIcon, Loader2, Disc, Music2, Trash2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { albumsApi } from "@/lib/api/albums"
import type { UploadAlbumData, Category, Genre, Song } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { contentApi } from "@/lib/api/content"
import { useArtistName } from "@/hooks/use-artist-name"
import { Checkbox } from "@/components/ui/checkbox"

export function UploadAlbumDialog({ onAlbumUploaded }: { onAlbumUploaded: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [selectedTracks, setSelectedTracks] = useState<string[]>([])
  const [newSongs, setNewSongs] = useState<
    Array<{
      id: string
      title: string
      trackUrl: string
      trackImg: string
      audioUploading?: boolean
      audioProgress?: number
      imageUploading?: boolean
      imageProgress?: number
    }>
  >([])
    const uploadAudioForSong = async (songId: string, file?: File) => {
      if (!file) return
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      if (!cloudName || !uploadPreset) {
        toast({
          title: "Cloudinary not configured",
          description: "Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
          variant: "destructive",
        })
        return
      }

      try {
        setNewSongs((prev) =>
          prev.map((s) =>
            s.id === songId ? { ...s, audioUploading: true, audioProgress: 0 } : s
          )
        )
        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", uploadPreset)
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
        const res = await axios.post(url, formData, {
          onUploadProgress: (evt) => {
            if (!evt.total) return
            const pct = Math.round((evt.loaded / evt.total) * 100)
            setNewSongs((prev) =>
              prev.map((s) => (s.id === songId ? { ...s, audioProgress: pct } : s))
            )
          },
        })
        const secureUrl = res?.data?.secure_url || res?.data?.url || ""
        setNewSongs((prev) =>
          prev.map((s) =>
            s.id === songId ? { ...s, trackUrl: secureUrl, audioUploading: false } : s
          )
        )
        if (secureUrl) {
          toast({ title: "Audio uploaded", description: "Audio URL attached." })
        }
      } catch (err) {
        setNewSongs((prev) =>
          prev.map((s) =>
            s.id === songId ? { ...s, audioUploading: false, audioProgress: 0 } : s
          )
        )
        toast({ title: "Upload failed", description: "Could not upload audio file.", variant: "destructive" })
      }
    }

    const uploadImageForSong = async (songId: string, file?: File) => {
      if (!file) return
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      if (!cloudName || !uploadPreset) {
        toast({
          title: "Cloudinary not configured",
          description: "Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
          variant: "destructive",
        })
        return
      }

      try {
        setNewSongs((prev) =>
          prev.map((s) =>
            s.id === songId ? { ...s, imageUploading: true, imageProgress: 0 } : s
          )
        )
        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", uploadPreset)
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
        const res = await axios.post(url, formData, {
          onUploadProgress: (evt) => {
            if (!evt.total) return
            const pct = Math.round((evt.loaded / evt.total) * 100)
            setNewSongs((prev) =>
              prev.map((s) => (s.id === songId ? { ...s, imageProgress: pct } : s))
            )
          },
        })
        const secureUrl = res?.data?.secure_url || res?.data?.url || ""
        setNewSongs((prev) =>
          prev.map((s) =>
            s.id === songId ? { ...s, trackImg: secureUrl, imageUploading: false } : s
          )
        )
        if (secureUrl) {
          toast({ title: "Cover uploaded", description: "Cover URL attached." })
        }
      } catch (err) {
        setNewSongs((prev) =>
          prev.map((s) =>
            s.id === songId ? { ...s, imageUploading: false, imageProgress: 0 } : s
          )
        )
        toast({ title: "Upload failed", description: "Could not upload cover image.", variant: "destructive" })
      }
    }
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedGenre, setSelectedGenre] = useState<string>("")
  const { artistName } = useArtistName()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadAlbumData>({
    defaultValues: {
      category: [],
      genre: [],
      tracksId: [],
    },
  })

  useEffect(() => {
    const loadTaxonomies = async () => {
      try {
        const cats = await contentApi.getAllCategories()
        const gens = await contentApi.getAllGenres()
        const catList: Category[] = cats.categories ?? cats
        const genList: Genre[] = gens.genres ?? gens
        setCategories(catList)
        setGenres(genList)
        if (catList.length && !selectedCategory) setSelectedCategory(catList[0].slug)
        if (genList.length && !selectedGenre) setSelectedGenre(genList[0].slug)
      } catch (e) {
        toast({ title: "Warning", description: "Failed to load categories or genres.", variant: "default" })
      }
    }
    const loadSongs = async () => {
      try {
        const res = await contentApi.getMySongs()
        const list: Song[] = res?.songs ?? []
        setSongs(list)
        if (list.length) {
          toast({ title: "Loaded", description: "Songs available for album selection." })
        }
      } catch {
        setSongs([])
        toast({ title: "Error", description: "Failed to load songs for album selection.", variant: "destructive" })
      }
    }
    loadTaxonomies()
    loadSongs()
  }, [toast, selectedCategory, selectedGenre])

  // Artist name is now sourced from a reusable hook and rendered read-only

  const onSubmit = async (data: UploadAlbumData) => {
    setLoading(true)
    try {
      const songsPayload = newSongs
        .filter((song) => song.title && song.trackUrl && song.trackImg)
        .map((song) => ({
          title: song.title,
          author: artistName || data.author || "",
          trackUrl: song.trackUrl,
          trackImg: song.trackImg,
          category: selectedCategory ? [selectedCategory] : [],
          genre: selectedGenre ? [selectedGenre] : [],
        }))

      if (songsPayload.length === 0 && selectedTracks.length === 0) {
        toast({
          title: "Add songs",
          description: "Include at least one song (select existing or add new).",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const payload: UploadAlbumData = {
        ...data,
        category: selectedCategory ? [selectedCategory] : [],
        genre: selectedGenre ? [selectedGenre] : [],
        author: artistName || data.author || "",
        tracksId: selectedTracks,
        songs: songsPayload.length ? songsPayload : undefined,
      }
      const albumRes = await albumsApi.uploadAlbum(payload)
      toast({ title: "Success", description: "Album uploaded successfully!" })
      setOpen(false)
      reset()
      setSelectedTracks([])
      setNewSongs([])
      onAlbumUploaded()
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload album.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="size-4 mr-2" />
          Upload Album
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl border-border/50 max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Upload New Album</DialogTitle>
            <DialogDescription>Add a new album to your Apostles profile.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Album Name</Label>
                <Input id="name" {...register("name", { required: true })} placeholder="Debut Album" />
                {errors.name && <p className="text-xs text-destructive">Album name is required</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Artist Name</Label>
                {/* Visible display only; actual value sent via hidden registered input below */}
                <Input id="author" placeholder="Artist Name" value={artistName} disabled />
                <input type="hidden" {...register("author")} value={artistName} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={categories.length ? "Select category" : "Loading..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Genre</Label>
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={genres.length ? "Select genre" : "Loading..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((g) => (
                      <SelectItem key={g.slug} value={g.slug}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverImg">Cover Image URL</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input id="coverImg" {...register("coverImg", { required: true })} className="pl-9" placeholder="https://..." />
              </div>
              {errors.coverImg && <p className="text-xs text-destructive">Cover image is required</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} placeholder="Describe the album..." className="min-h-28" />
            </div>

            <div className="space-y-3 rounded-xl border border-border/50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Music2 className="size-4" />
                Add songs to this album
              </div>
              {songs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No songs available yet. Upload songs first.</p>
              ) : (
                <div className="grid gap-3 max-h-52 overflow-auto pr-2">
                  {songs.map((song) => {
                    const trackValue = song.trackId || song._id
                    return (
                      <label key={song._id} className="flex items-center gap-3 rounded-lg border border-border/40 px-3 py-2">
                        <Checkbox
                          checked={selectedTracks.includes(trackValue)}
                          onCheckedChange={(checked) => {
                            setSelectedTracks((prev) =>
                              checked ? [...prev, trackValue] : prev.filter((id) => id !== trackValue)
                            )
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{song.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{song.author}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-xl border border-border/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Disc className="size-4" />
                  Add new songs now
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 border-border/50 bg-transparent"
                  onClick={() =>
                    setNewSongs((prev) => [
                      ...prev,
                      { id: `${Date.now()}-${prev.length}`, title: "", trackUrl: "", trackImg: "" },
                    ])
                  }
                >
                  Add song
                </Button>
              </div>
              {newSongs.length === 0 ? (
                <p className="text-xs text-muted-foreground">Create new tracks and attach them to this album.</p>
              ) : (
                <div className="grid gap-4">
                  {newSongs.map((song, index) => (
                    <div key={song.id} className="grid gap-3 rounded-lg border border-border/40 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">Track {index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => setNewSongs((prev) => prev.filter((s) => s.id !== song.id))}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={song.title}
                            onChange={(e) =>
                              setNewSongs((prev) =>
                                prev.map((s) => (s.id === song.id ? { ...s, title: e.target.value } : s))
                              )
                            }
                            placeholder="Song title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Audio file</Label>
                          <Input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => uploadAudioForSong(song.id, e.target.files?.[0])}
                          />
                          {song.audioUploading && (
                            <div className="h-2 w-full rounded bg-secondary overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${song.audioProgress ?? 0}%` }} />
                            </div>
                          )}
                          {song.trackUrl && (
                            <p className="text-xs text-muted-foreground break-all">{song.trackUrl}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Cover image</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => uploadImageForSong(song.id, e.target.files?.[0])}
                        />
                        {song.imageUploading && (
                          <div className="h-2 w-full rounded bg-secondary overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${song.imageProgress ?? 0}%` }} />
                          </div>
                        )}
                        {song.trackImg && (
                          <div className="flex items-center gap-3">
                            <ImageIcon className="size-4 text-muted-foreground" />
                            <img src={song.trackImg} alt="Cover preview" className="h-12 w-12 rounded object-cover border border-border/50" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary">
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Upload Album"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
