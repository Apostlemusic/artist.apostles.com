import type { Song, UploadSongData, EditProfileData, Album, UploadAlbumData, Category, Genre } from "@/lib/types"

export type ArtistUser = {
  id: string
  _id: string
  email: string
  password: string
  name: string
  type: "artist" | string
  verified: boolean
  otp?: string
  profile?: EditProfileData
  about?: string
  description?: string
  profileImg?: string
  followers: string[]
  likes: string[]
}

// In-memory mock database (for demo/dev only)
const users = new Map<string, ArtistUser>()
const songs: Song[] = []
const albums: Album[] = []

const categories: Category[] = [
  { slug: "gospel", name: "Gospel" },
  { slug: "worship", name: "Worship" },
  { slug: "praise", name: "Praise" },
  { slug: "instrumental", name: "Instrumental" },
]

const genres: Genre[] = [
  { slug: "contemporary", name: "Contemporary" },
  { slug: "traditional", name: "Traditional" },
  { slug: "afrobeats", name: "Afrobeats" },
  { slug: "choir", name: "Choir" },
]

function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

function token(prefix = "tok"): string {
  return `${prefix}_${Math.random().toString(36).slice(2)}.${Math.random().toString(36).slice(2)}`
}

export const db = {
  users,
  songs,
  albums,
  categories,
  genres,
  createArtist({ email, password, name, type = "artist" }: { email: string; password: string; name: string; type?: string }): ArtistUser {
    const id = uid("artist")
    const user: ArtistUser = {
      id,
      _id: id,
      email,
      password,
      name,
      type,
      verified: false,
      profile: { about: "", description: "", profileImg: "" },
      about: "",
      description: "",
      profileImg: "",
      followers: [],
      likes: [],
    }
    users.set(email, user)
    return user
  },
  getArtistByEmail(email: string) {
    return users.get(email)
  },
  getAllArtists() {
    return Array.from(users.values())
  },
  getArtistById(artistId: string) {
    return Array.from(users.values()).find((u) => u.id === artistId || u._id === artistId)
  },
  getArtistByName(name: string) {
    const normalized = name.toLowerCase()
    return Array.from(users.values()).find((u) => u.name.toLowerCase() === normalized)
  },
  setOtp(email: string, otp: string) {
    const u = users.get(email)
    if (u) { u.otp = otp }
    return u
  },
  verifyOtp(email: string, otp: string) {
    const u = users.get(email)
    if (u && u.otp === otp) { u.verified = true; u.otp = undefined; return true }
    return false
  },
  setPassword(email: string, password: string) {
    const u = users.get(email)
    if (u) { u.password = password; return true }
    return false
  },
  updateProfile(email: string, profile: EditProfileData) {
    const u = users.get(email)
    if (u) {
      if (profile.name !== undefined) u.name = profile.name
      if (profile.type !== undefined) u.type = profile.type
      u.profile = profile
      u.about = profile.about
      u.description = profile.description
      u.profileImg = profile.profileImg
      return u
    }
    return undefined
  },
  followArtist(artistId: string, userId: string) {
    const artist = db.getArtistById(artistId)
    if (!artist) return undefined
    if (!artist.followers.includes(userId)) {
      artist.followers.push(userId)
    }
    return artist
  },
  likeArtist(artistId: string, userId: string) {
    const artist = db.getArtistById(artistId)
    if (!artist) return undefined
    if (!artist.likes.includes(userId)) {
      artist.likes.push(userId)
    }
    return artist
  },
  deleteArtist(artistId: string) {
    const artist = db.getArtistById(artistId)
    if (!artist) return false
    users.delete(artist.email)
    return true
  },
  // Songs
  addSong(data: UploadSongData): Song {
    const s: Song = {
      _id: uid("song"),
      title: data.title,
      author: data.author,
      trackUrl: data.trackUrl,
      trackImg: data.trackImg,
      description: data.description,
      lyrics: data.lyrics,
      category: data.category,
      genre: data.genre,
      trackId: data.trackId,
      likes: [],
      hidden: false,
    }
    songs.unshift(s)
    return s
  },
  editSong(id: string, partial: Partial<Song>) {
    const s = songs.find((x) => x._id === id)
    if (!s) return undefined
    Object.assign(s, partial)
    return s
  },
  removeSong(id: string) {
    const idx = songs.findIndex((x) => x._id === id)
    if (idx >= 0) { songs.splice(idx, 1); return true }
    return false
  },
  // Albums
  addAlbum(data: UploadAlbumData): Album {
    const album: Album = {
      _id: uid("album"),
      name: data.name,
      coverImg: data.coverImg,
      description: data.description,
      category: data.category,
      genre: data.genre,
      tracksId: data.tracksId ?? [],
      hidden: false,
      likes: [],
      author: data.author,
    }
    albums.unshift(album)
    return album
  },
  editAlbum(id: string, partial: Partial<Album>) {
    const album = albums.find((x) => x._id === id)
    if (!album) return undefined
    Object.assign(album, partial)
    return album
  },
  removeAlbum(id: string) {
    const idx = albums.findIndex((x) => x._id === id)
    if (idx >= 0) { albums.splice(idx, 1); return true }
    return false
  },
}

export const auth = {
  accessSessions: new Map<string, string>(),
  refreshSessions: new Map<string, string>(),
  issueTokens(email: string) {
    const accessToken = token("access")
    const refreshToken = token("refresh")
    auth.accessSessions.set(accessToken, email)
    auth.refreshSessions.set(refreshToken, email)
    return { accessToken, refreshToken }
  },
  getEmailForToken(tokenValue?: string | null) {
    if (!tokenValue) return null
    return auth.accessSessions.get(tokenValue) || auth.refreshSessions.get(tokenValue) || null
  },
}
