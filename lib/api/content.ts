import apiClient from "@/lib/api-client"

export type { UploadSongData } from "@/lib/types"

export const contentApi = {
  async getMySongs(): Promise<any> {
    const res = await apiClient.get("/api/artist/song/my")
    return res.data
  },
  async uploadSong(data: import("@/lib/types").UploadSongData): Promise<any> {
    const res = await apiClient.post("/api/artist/song/upload", data)
    return res.data
  },
  async hideSong(songId: string): Promise<any> {
    const res = await apiClient.post("/api/artist/song/hide", { songId })
    return res.data
  },
  async unhideSong(songId: string): Promise<any> {
    const res = await apiClient.post("/api/artist/song/unhide", { songId })
    return res.data
  },
  async removeSong(songId: string): Promise<any> {
    const res = await apiClient.post("/api/artist/song/remove", { songId })
    return res.data
  },
  async getAllCategories(): Promise<any> {
    const res = await apiClient.get("/api/content/categories")
    return res.data
  },
  async getAllGenres(): Promise<any> {
    const res = await apiClient.get("/api/content/genres")
    return res.data
  },
}
