"use client"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Plus, ImageIcon, Loader2, Disc } from "lucide-react"

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
import type { UploadAlbumData, Category, Genre } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { contentApi } from "@/lib/api/content"
import { useArtistName } from "@/hooks/use-artist-name"

export function UploadAlbumDialog({ onAlbumUploaded }: { onAlbumUploaded: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
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
    loadTaxonomies()
  }, [toast, selectedCategory, selectedGenre])

  // Artist name is now sourced from a reusable hook and rendered read-only

  const onSubmit = async (data: UploadAlbumData) => {
    setLoading(true)
    try {
      const payload: UploadAlbumData = {
        ...data,
        category: selectedCategory ? [selectedCategory] : [],
        genre: selectedGenre ? [selectedGenre] : [],
        author: artistName || data.author || "",
      }
      await albumsApi.uploadAlbum(payload)
      toast({ title: "Success", description: "Album uploaded successfully!" })
      setOpen(false)
      reset()
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
  <DialogContent className="sm:max-w-125 border-border/50">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Upload New Album</DialogTitle>
            <DialogDescription>Add a new album to your Apostles profile.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
            <div className="grid grid-cols-2 gap-4">
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
              <Textarea id="description" {...register("description")} placeholder="Describe the album..." />
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
