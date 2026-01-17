"use client"

import { useEffect, useRef, useState } from "react"
import type { Song } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Play, Pause, Eye, EyeOff, Trash2, Edit } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface SongItemProps {
  song: Song
  onToggleHide: (id: string, currentlyHidden: boolean) => void
  onDelete: (id: string) => void
  onEdit: (song: Song) => void
}

export function SongItem({ song, onToggleHide, onDelete, onEdit }: SongItemProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const handleEnded = () => setIsPlaying(false)
    audio.addEventListener("ended", handleEnded)
    return () => audio.removeEventListener("ended", handleEnded)
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors group">
      <div className="relative size-12 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
        <img src={song.trackImg || "/placeholder-music.jpg"} alt={song.title} className="w-full h-full object-cover" />
        <button
          type="button"
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={togglePlay}
          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          disabled={!song.trackUrl}
        >
          {isPlaying ? <Pause className="size-5 text-white" /> : <Play className="size-5 text-white fill-white" />}
        </button>
      </div>
      <audio ref={audioRef} src={song.trackUrl || undefined} preload="none" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold truncate">{song.title}</h4>
          {song.hidden && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] uppercase tracking-wider">
              Hidden
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{song.author}</p>
      </div>
      <div className="hidden md:flex flex-col items-end px-4">
        <div className="text-xs font-medium text-foreground">{song.likes.length} likes</div>
        <div className="text-[10px] text-muted-foreground uppercase">{song.genre[0]}</div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 rounded-full">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => onEdit(song)}>
            <Edit className="size-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onToggleHide(song._id, song.hidden)}>
            {song.hidden ? (
              <>
                <Eye className="size-4 mr-2" />
                Unhide
              </>
            ) : (
              <>
                <EyeOff className="size-4 mr-2" />
                Hide
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            onClick={() => onDelete(song._id)}
          >
            <Trash2 className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
