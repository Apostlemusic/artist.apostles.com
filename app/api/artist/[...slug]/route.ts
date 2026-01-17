import { NextResponse } from "next/server"
import { db, auth } from "@/lib/server/mock-db"
import { getAuthEmail, normalizeArtistPayload } from "@/lib/server/api-helpers"
import type { UploadSongData, UploadAlbumData } from "@/lib/types"

function json(body: any, init?: ResponseInit) {
  return NextResponse.json(body, init)
}

function issueAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  response.cookies.set("apostolicaccesstoken", accessToken, { path: "/", httpOnly: true, sameSite: "lax" })
  response.cookies.set("apostolicrefreshtoken", refreshToken, { path: "/", httpOnly: true, sameSite: "lax" })
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function GET(request: Request, { params }: { params: { slug: string[] } }) {
  const slug = params.slug || []

  if (slug[0] === "dashboard" && slug[1] === "stats") {
    const email = getAuthEmail(request)
    const artist = email ? db.getArtistByEmail(email) : null
    const songs = db.songs
    const albums = db.albums
    const totals = {
      songs: songs.length,
      albums: albums.length,
      playlists: 0,
      hiddenSongs: songs.filter((s) => s.hidden).length,
      hiddenAlbums: albums.filter((a) => a.hidden).length,
      songLikes: songs.reduce((sum, s) => sum + (s.likes?.length || 0), 0),
      albumLikes: albums.reduce((sum, a) => sum + (a.likes?.length || 0), 0),
      followers: artist?.followers?.length ?? 0,
      profileLikes: artist?.likes?.length ?? 0,
    }

    const categoryCounts = new Map<string, number>()
    const genreCounts = new Map<string, number>()
    for (const song of songs) {
      for (const cat of song.category ?? []) {
        categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1)
      }
      for (const gen of song.genre ?? []) {
        genreCounts.set(gen, (genreCounts.get(gen) || 0) + 1)
      }
    }

    const topCategories = Array.from(categoryCounts.entries()).map(([slug, count]) => ({ slug, count }))
    const topGenres = Array.from(genreCounts.entries()).map(([slug, count]) => ({ slug, count }))

    return json({ success: true, stats: { totals, topCategories, topGenres } })
  }

  if (slug[0] === "profile" && slug[1] === "me") {
    const email = getAuthEmail(request)
    if (!email) return json({ success: false, message: "Unauthorized" }, { status: 401 })
    const artist = db.getArtistByEmail(email)
    if (!artist) return json({ success: false, message: "Artist not found" }, { status: 404 })
    return json({ success: true, artist: normalizeArtistPayload(artist) })
  }

  if (slug[0] === "song" && slug[1] === "my") {
    const email = getAuthEmail(request)
    const artist = email ? db.getArtistByEmail(email) : null
    const author = artist?.name
    const songs = author ? db.songs.filter((s) => s.author === author) : db.songs
    return json({ success: true, songs })
  }

  if (slug[0] === "album" && slug[1] === "my") {
    const email = getAuthEmail(request)
    const artist = email ? db.getArtistByEmail(email) : null
    const author = artist?.name
    const albums = author ? db.albums.filter((a) => a.author === author) : db.albums
    return json({ success: true, albums })
  }

  if (slug[0] === "getAllArtists") {
    const artists = db.getAllArtists().map(normalizeArtistPayload)
    return json({ success: true, artists })
  }

  if (slug[0] === "getArtistById" && slug[1]) {
    const artist = db.getArtistById(slug[1])
    if (!artist) return json({ success: false, message: "Artist not found" }, { status: 404 })
    return json({ success: true, artist: normalizeArtistPayload(artist) })
  }

  if (slug[0] === "getArtistByName" && slug[1]) {
    const name = decodeURIComponent(slug[1])
    const artist = db.getArtistByName(name)
    if (!artist) return json({ success: false, message: "Artist not found" }, { status: 404 })
    return json({ success: true, artist: normalizeArtistPayload(artist) })
  }

  if (slug[0] === "isVerified") {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email") || ""
    const artist = db.getArtistByEmail(email)
    return json({ success: true, verified: !!artist?.verified })
  }

  return json({ success: false, message: "Not found" }, { status: 404 })
}

export async function POST(request: Request, { params }: { params: { slug: string[] } }) {
  const slug = params.slug || []
  const body = await request.json().catch(() => ({}))

  if (slug[0] === "register") {
    const { email, password, name, type } = body
    if (!email || !password || !name) return json({ success: false, message: "Missing fields" }, { status: 400 })
    if (db.getArtistByEmail(email)) return json({ success: false, message: "Artist already exists" }, { status: 409 })
    const artist = db.createArtist({ email, password, name, type })
    const otp = generateOtp()
    db.setOtp(email, otp)
    return json({ success: true, message: "Registered", artist: normalizeArtistPayload(artist), otp })
  }

  if (slug[0] === "login") {
    const { email, password } = body
    const artist = db.getArtistByEmail(email)
    if (!artist || artist.password !== password) return json({ success: false, message: "Invalid credentials" }, { status: 401 })
    const { accessToken, refreshToken } = auth.issueTokens(artist.email)
    const response = json({ success: true, message: "Logged in", artist: normalizeArtistPayload(artist), accessToken, refreshToken })
    issueAuthCookies(response, accessToken, refreshToken)
    return response
  }

  if (slug[0] === "verifyOtp") {
    const { email, otp } = body
    const ok = db.verifyOtp(email, otp)
    if (!ok) return json({ success: false, message: "Invalid OTP" }, { status: 400 })
    const artist = db.getArtistByEmail(email)
    if (!artist) return json({ success: false, message: "Artist not found" }, { status: 404 })
    const { accessToken, refreshToken } = auth.issueTokens(artist.email)
    const response = json({ success: true, message: "OTP verified", artist: normalizeArtistPayload(artist), accessToken, refreshToken })
    issueAuthCookies(response, accessToken, refreshToken)
    return response
  }

  if (slug[0] === "resendOtp") {
    const { email } = body
    const artist = db.getArtistByEmail(email)
    if (!artist) return json({ success: false, message: "Artist not found" }, { status: 404 })
    const otp = generateOtp()
    db.setOtp(email, otp)
    return json({ success: true, message: "OTP sent", otp })
  }

  if (slug[0] === "forgotPassword") {
    const { email } = body
    const artist = db.getArtistByEmail(email)
    if (!artist) return json({ success: false, message: "Artist not found" }, { status: 404 })
    const otp = generateOtp()
    db.setOtp(email, otp)
    return json({ success: true, message: "Reset OTP sent", otp })
  }

  if (slug[0] === "resetPassword") {
    const { email, otp, newPassword } = body
    const ok = db.verifyOtp(email, otp)
    if (!ok) return json({ success: false, message: "Invalid OTP" }, { status: 400 })
    db.setPassword(email, newPassword)
    return json({ success: true, message: "Password reset" })
  }

  if (slug[0] === "followArtist") {
    const { artistId, userId } = body
    const artist = db.followArtist(artistId, userId)
    if (!artist) return json({ success: false, message: "Artist not found" }, { status: 404 })
    return json({ success: true, artist: normalizeArtistPayload(artist) })
  }

  if (slug[0] === "likeArtist") {
    const { artistId, userId } = body
    const artist = db.likeArtist(artistId, userId)
    if (!artist) return json({ success: false, message: "Artist not found" }, { status: 404 })
    return json({ success: true, artist: normalizeArtistPayload(artist) })
  }

  if (slug[0] === "deleteArtist") {
    const { artistId } = body
    const deleted = db.deleteArtist(artistId)
    if (!deleted) return json({ success: false, message: "Artist not found" }, { status: 404 })
    return json({ success: true, message: "Artist deleted" })
  }

  if (slug[0] === "profile" && slug[1] === "edit") {
    const email = getAuthEmail(request)
    if (!email) return json({ success: false, message: "Unauthorized" }, { status: 401 })
    const updated = db.updateProfile(email, body)
    if (!updated) return json({ success: false, message: "Artist not found" }, { status: 404 })
    return json({ success: true, artist: normalizeArtistPayload(updated) })
  }

  if (slug[0] === "song" && slug[1] === "upload") {
    const payload = body as UploadSongData
    const song = db.addSong(payload)
    return json({ success: true, song })
  }

  if (slug[0] === "song" && slug[1] === "edit") {
    const { songId, ...partial } = body
    const song = db.editSong(songId, partial)
    if (!song) return json({ success: false, message: "Song not found" }, { status: 404 })
    return json({ success: true, song })
  }

  if (slug[0] === "song" && slug[1] === "remove") {
    const { songId } = body
    const removed = db.removeSong(songId)
    if (!removed) return json({ success: false, message: "Song not found" }, { status: 404 })
    return json({ success: true, message: "Song removed" })
  }

  if (slug[0] === "song" && slug[1] === "hide") {
    const { songId } = body
    const song = db.editSong(songId, { hidden: true })
    if (!song) return json({ success: false, message: "Song not found" }, { status: 404 })
    return json({ success: true, song })
  }

  if (slug[0] === "song" && slug[1] === "unhide") {
    const { songId } = body
    const song = db.editSong(songId, { hidden: false })
    if (!song) return json({ success: false, message: "Song not found" }, { status: 404 })
    return json({ success: true, song })
  }

  if (slug[0] === "album" && slug[1] === "upload") {
    const payload = body as UploadAlbumData & { title?: string; songs?: string[] }
    const albumData: UploadAlbumData = {
      name: payload.name || payload.title || "Untitled Album",
      coverImg: payload.coverImg || "",
      description: payload.description,
      category: payload.category || [],
      genre: payload.genre || [],
      tracksId: payload.tracksId || payload.songs || [],
      author: payload.author,
    }
    const album = db.addAlbum(albumData)
    return json({ success: true, album })
  }

  if (slug[0] === "album" && slug[1] === "edit") {
    const { albumId, title, ...rest } = body
    const partial: any = { ...rest }
    if (title) partial.name = title
    const album = db.editAlbum(albumId, partial)
    if (!album) return json({ success: false, message: "Album not found" }, { status: 404 })
    return json({ success: true, album })
  }

  if (slug[0] === "album" && slug[1] === "remove") {
    const { albumId } = body
    const removed = db.removeAlbum(albumId)
    if (!removed) return json({ success: false, message: "Album not found" }, { status: 404 })
    return json({ success: true, message: "Album removed" })
  }

  if (slug[0] === "album" && slug[1] === "hide") {
    const { albumId } = body
    const album = db.editAlbum(albumId, { hidden: true })
    if (!album) return json({ success: false, message: "Album not found" }, { status: 404 })
    return json({ success: true, album })
  }

  if (slug[0] === "album" && slug[1] === "unhide") {
    const { albumId } = body
    const album = db.editAlbum(albumId, { hidden: false })
    if (!album) return json({ success: false, message: "Album not found" }, { status: 404 })
    return json({ success: true, album })
  }

  if (slug[0] === "album" && slug[1] === "song" && slug[2] === "upload") {
    const { albumId, title, author, trackUrl, trackImg } = body
    const album = db.albums.find((a) => a._id === albumId)
    if (!album) return json({ success: false, message: "Album not found" }, { status: 404 })
    const song = db.addSong({
      title: title || "Untitled",
      author: author || "",
      trackUrl: trackUrl || "",
      trackImg: trackImg || "",
      category: [],
      genre: [],
      trackId: `TRK-${Math.floor(Math.random() * 10000)}`,
    })
    const updated = db.editAlbum(albumId, { tracksId: [...(album.tracksId || []), song._id] })
    return json({ success: true, album: updated, song })
  }

  return json({ success: false, message: "Not found" }, { status: 404 })
}
