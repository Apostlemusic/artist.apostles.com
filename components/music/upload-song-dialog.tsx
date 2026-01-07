"use client"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import axios from "axios"
import { Plus, Music, ImageIcon, Loader2 } from "lucide-react"

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
import { contentApi } from "../../lib/api/content"
import type { UploadSongData } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category, Genre } from "@/lib/types"
import { useArtistName } from "@/hooks/use-artist-name"

export function UploadSongDialog({ onSongUploaded }: { onSongUploaded: () => void }) {
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
    setValue,
    formState: { errors },
  } = useForm<UploadSongData>({
    defaultValues: {
      category: [],
      genre: [],
      trackId: `TRK-${Math.floor(Math.random() * 10000)}`,
    },
  })

  useEffect(() => {
    const loadTaxonomies = async () => {
      try {
        const cats = await contentApi.getAllCategories()
        const gens = await contentApi.getAllGenres()
        // cats.categories, gens.genres expected; fallback to raw arrays
        const catList: Category[] = cats.categories ?? cats
        const genList: Genre[] = gens.genres ?? gens
        setCategories(catList)
        setGenres(genList)
        if (catList.length && !selectedCategory) setSelectedCategory(catList[0].slug)
        if (genList.length && !selectedGenre) setSelectedGenre(genList[0].slug)
      } catch (e) {
        // Surface via toast but keep dialog usable
        toast({ title: "Warning", description: "Failed to load categories or genres.", variant: "default" })
      }
    }
    loadTaxonomies()
  }, [toast, selectedCategory, selectedGenre])

  // Artist name is now sourced from a reusable hook and rendered read-only

  const onSubmit = async (data: UploadSongData) => {
    setLoading(true)
    try {
      const payload: UploadSongData = {
        ...data,
        category: selectedCategory ? [selectedCategory] : [],
        genre: selectedGenre ? [selectedGenre] : [],
        author: artistName || data.author || "",
      }
      await contentApi.uploadSong(payload)
      toast({ title: "Success", description: "Song uploaded successfully!" })
      setOpen(false)
      reset()
      onSongUploaded()
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload song.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="size-4 mr-2" />
          Upload Song
        </Button>
      </DialogTrigger>
  <DialogContent className="sm:max-w-125 border-border/50">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Upload New Song</DialogTitle>
            <DialogDescription>Add a new track to your Apostles profile.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register("title", { required: true })} placeholder="Song Title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Artist Name</Label>
                {/* Visible display only; actual value sent via hidden registered input below */}
                <Input id="author" placeholder="Artist Name" value={artistName} disabled />
                <input type="hidden" {...register("author")} value={artistName} />
              </div>
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
            <AudioUpload
              onUploaded={(url) => {
                setValue("trackUrl", url, { shouldValidate: true })
                toast({ title: "Audio uploaded", description: "Cloudinary URL attached." })
              }}
              registerField={register("trackUrl")}
            />
            <ImageUpload
              onUploaded={(url) => {
                setValue("trackImg", url, { shouldValidate: true })
                toast({ title: "Cover uploaded", description: "Cloudinary URL attached." })
              }}
              registerField={register("trackImg")}
            />
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} placeholder="Tell us about this track..." />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary">
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Upload Track"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AudioUpload({ onUploaded, registerField }: { onUploaded: (url: string) => void; registerField: any }) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [trackUrl, setTrackUrl] = useState("")

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    if (!cloudName || !uploadPreset) {
      alert("Cloudinary not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.")
      return
    }

    try {
      setIsUploading(true)
      setProgress(0)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", uploadPreset)
      // Use video resource type for audio files in Cloudinary
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
      const res = await axios.post(url, formData, {
        onUploadProgress: (evt) => {
          if (!evt.total) return
          const pct = Math.round((evt.loaded / evt.total) * 100)
          setProgress(pct)
        },
      })
      const secureUrl = res?.data?.secure_url || res?.data?.url || ""
      setTrackUrl(secureUrl)
      onUploaded(secureUrl)
    } catch (err) {
      console.error("Failed to upload audio to Cloudinary", err)
      alert("Failed to upload audio. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="trackFile">Audio File</Label>
      <Input id="trackFile" type="file" accept="audio/*" onChange={handleFileChange} />
  {/* Hidden field bound to RHF so this value is included in form submission */}
  <input type="hidden" {...registerField} value={trackUrl} />
      {isUploading && (
        <div className="h-2 w-full rounded bg-secondary overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      )}
      {trackUrl && (
        <div className="text-xs text-muted-foreground">
          Uploaded URL: <span className="text-foreground break-all">{trackUrl}</span>
        </div>
      )}
    </div>
  )
}

function ImageUpload({ onUploaded, registerField }: { onUploaded: (url: string) => void; registerField: any }) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [imageUrl, setImageUrl] = useState("")

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    if (!cloudName || !uploadPreset) {
      alert("Cloudinary not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.")
      return
    }

    try {
      setIsUploading(true)
      setProgress(0)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", uploadPreset)
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
      const res = await axios.post(url, formData, {
        onUploadProgress: (evt) => {
          if (!evt.total) return
          const pct = Math.round((evt.loaded / evt.total) * 100)
          setProgress(pct)
        },
      })
      const secureUrl = res?.data?.secure_url || res?.data?.url || ""
      setImageUrl(secureUrl)
      onUploaded(secureUrl)
    } catch (err) {
      console.error("Failed to upload image to Cloudinary", err)
      alert("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="coverFile">Cover Image</Label>
      <Input id="coverFile" type="file" accept="image/*" onChange={handleFileChange} />
      {/* Hidden field bound to RHF so this value is included in form submission */}
      <input type="hidden" {...registerField} value={imageUrl} />
      {isUploading && (
        <div className="h-2 w-full rounded bg-secondary overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      )}
      {imageUrl && (
        <div className="flex items-center gap-3">
          <ImageIcon className="size-4 text-muted-foreground" />
          <img src={imageUrl} alt="Cover preview" className="h-12 w-12 rounded object-cover border border-border/50" />
        </div>
      )}
    </div>
  )
}
