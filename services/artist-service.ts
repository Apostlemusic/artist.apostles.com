import apiClient from "@/lib/api-client"

export const artistService = {
  // Auth
  login: (data: any) => apiClient.post("/api/artist/login", data),
  register: (data: any) => apiClient.post("/api/artist/register", data),

  // Dashboard
  getStats: () => apiClient.get("/api/artist/dashboard/stats"),

  // Profile
  getProfile: (id: string) => apiClient.get(`/api/artist/getArtistById/${id}`).then((res) => res.data),
  getProfileMe: () => apiClient.get("/api/artist/profile/me").then((res) => res.data),
  updateProfile: (data: any) => apiClient.post("/api/artist/profile/edit", data),

  // Songs
  getMySongs: () => apiClient.get("/api/artist/song/my"),
  uploadSong: (data: any) => apiClient.post("/api/artist/song/upload", data),
  editSong: (data: any) => apiClient.post("/api/artist/song/edit", data),
  hideSong: (songId: string) => apiClient.post("/api/artist/song/hide", { songId }),
  unhideSong: (songId: string) => apiClient.post("/api/artist/song/unhide", { songId }),
  removeSong: (songId: string) => apiClient.post("/api/artist/song/remove", { songId }),

  // Albums
  getMyAlbums: () => apiClient.get("/api/artist/album/my"),
  uploadAlbum: (data: any) => apiClient.post("/api/artist/album/upload", data),
  editAlbum: (data: any) => apiClient.post("/api/artist/album/edit", data),
  hideAlbum: (albumId: string) => apiClient.post("/api/artist/album/hide", { albumId }),
  unhideAlbum: (albumId: string) => apiClient.post("/api/artist/album/unhide", { albumId }),
  removeAlbum: (albumId: string) => apiClient.post("/api/artist/album/remove", { albumId }),
}
