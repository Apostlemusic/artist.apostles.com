import { NextResponse } from "next/server"
import { db } from "@/lib/server/mock-db"

function json(body: any, init?: ResponseInit) {
  return NextResponse.json(body, init)
}

export async function GET(request: Request, { params }: { params: { slug: string[] } }) {
  const slug = params.slug || []

  if (slug[0] === "categories" && !slug[1]) {
    return json({ success: true, categories: db.categories })
  }

  if (slug[0] === "categories" && slug[1]) {
    const category = db.categories.find((c) => c.slug === slug[1])
    if (!category) return json({ success: false, message: "Category not found" }, { status: 404 })
    return json({ success: true, category })
  }

  if (slug[0] === "genres" && !slug[1]) {
    return json({ success: true, genres: db.genres })
  }

  if (slug[0] === "genres" && slug[1]) {
    const genre = db.genres.find((g) => g.slug === slug[1])
    if (!genre) return json({ success: false, message: "Genre not found" }, { status: 404 })
    return json({ success: true, genre })
  }

  if (slug[0] === "songs" && !slug[1]) {
    return json({ success: true, songs: db.songs })
  }

  if (slug[0] === "songs" && slug[1] && slug[1] !== "track" && slug[1] !== "search" && slug[1] !== "category") {
    const song = db.songs.find((s) => s._id === slug[1])
    if (!song) return json({ success: false, message: "Song not found" }, { status: 404 })
    return json({ success: true, song })
  }

  if (slug[0] === "songs" && slug[1] === "track" && slug[2]) {
    const song = db.songs.find((s) => s.trackId === slug[2])
    if (!song) return json({ success: false, message: "Song not found" }, { status: 404 })
    return json({ success: true, song })
  }

  if (slug[0] === "songs" && slug[1] === "search" && slug[2]) {
    const query = decodeURIComponent(slug[2]).toLowerCase()
    const songs = db.songs.filter((s) => {
      const text = `${s.title} ${s.author} ${s.description ?? ""}`.toLowerCase()
      return text.includes(query)
    })
    return json({ success: true, songs })
  }

  if (slug[0] === "songs" && slug[1] === "category" && slug[2]) {
    const category = decodeURIComponent(slug[2])
    const songs = db.songs.filter((s) => s.category?.includes(category))
    return json({ success: true, songs })
  }

  if (slug[0] === "playlists" && !slug[1]) {
    return json({ success: true, playlists: [] })
  }

  if (slug[0] === "playlists" && slug[1]) {
    return json({ success: true, playlist: null })
  }

  if (slug[0] === "discover") {
    return json({ success: true, categories: db.categories, genres: db.genres, songs: db.songs })
  }

  return json({ success: false, message: "Not found" }, { status: 404 })
}
