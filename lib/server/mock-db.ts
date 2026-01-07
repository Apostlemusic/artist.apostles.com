import type { Song, UploadSongData, EditProfileData } from "@/lib/types"

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
}

// In-memory mock database (for demo/dev only)
const users = new Map<string, ArtistUser>()
const songs: Song[] = []

function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

function token(prefix = "tok"): string {
  return `${prefix}_${Math.random().toString(36).slice(2)}.${Math.random().toString(36).slice(2)}`
}

export const db = {
  users,
  songs,
  createArtist({ email, password, name, type = "artist" }: { email: string; password: string; name: string; type?: string }): ArtistUser {
    const id = uid("artist")
    const user: ArtistUser = { id, _id: id, email, password, name, type, verified: true, profile: { about: "", description: "", profileImg: "" } }
    users.set(email, user)
    return user
  },
  getArtistByEmail(email: string) {
    return users.get(email)
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
    if (u) { u.profile = profile; return u }
    return undefined
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
}

export const auth = {
  issueTokens() {
    const accessToken = token("access")
    const refreshToken = token("refresh")
    return { accessToken, refreshToken }
  },
}
