// Shared application types

export type ArtistStats = {
  totals: {
    songs: number
    albums: number
    followers: number
    songLikes: number
    albumLikes: number
    profileLikes: number
    playlists: number
    hiddenSongs: number
    hiddenAlbums: number
  }
  topCategories: Array<{ slug: string; count: number }>
  topGenres: Array<{ slug: string; count: number }>
}

export type Song = {
  _id: string
  title: string
  author: string
  trackUrl?: string
  trackImg?: string
  description?: string
  likes: string[]
  genre: string[]
  hidden: boolean
  category?: string[]
  trackId?: string
}

// Albums
export type Album = {
  _id: string
  name: string
  coverImg?: string
  description?: string
  genre: string[]
  category?: string[]
  hidden: boolean
  tracksId?: string[]
  likes?: string[]
}

export type UploadAlbumData = {
  name: string
  coverImg: string
  description?: string
  category: string[]
  genre: string[]
  tracksId: string[]
  author?: string
}

// Taxonomies
export type Category = {
  slug: string
  name: string
}

export type Genre = {
  slug: string
  name: string
}

export type UploadSongData = {
  title: string
  author: string
  trackUrl: string
  trackImg: string
  description?: string
  category: string[]
  genre: string[]
  trackId: string
}

export type EditProfileData = {
  about: string
  description: string
  profileImg: string
}

// Auth payloads
export type RegisterData = {
  email: string
  password: string
  name: string
  type?: string
}

export type LoginData = {
  email: string
  password: string
}

export type VerifyOtpData = {
  email: string
  otp: string
}

export type ResendOtpData = {
  email: string
}

export type ForgotPasswordData = {
  email: string
}

export type ResetPasswordData = {
  email: string
  otp: string
  newPassword: string
}

// Artist entity (minimal)
export type Artist = {
  id?: string
  _id?: string
  name?: string
  email?: string
  type?: string
  profileImg?: string
  about?: string
  description?: string
  followers?: string[]
  likes?: string[]
}
