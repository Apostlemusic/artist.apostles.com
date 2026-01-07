import apiClient from "@/lib/api-client"
import type { UploadAlbumData } from "@/lib/types"

export const albumsApi = {
  async getMyAlbums(): Promise<any> {
    const res = await apiClient.get("/api/artist/album/my")
    return res.data
  },
  async uploadAlbum(data: UploadAlbumData): Promise<any> {
    const res = await apiClient.post("/api/artist/album/upload", data)
    return res.data
  },
  async hideAlbum(albumId: string): Promise<any> {
    const res = await apiClient.post("/api/artist/album/hide", { albumId })
    return res.data
  },
  async unhideAlbum(albumId: string): Promise<any> {
    const res = await apiClient.post("/api/artist/album/unhide", { albumId })
    return res.data
  },
  async removeAlbum(albumId: string): Promise<any> {
    const res = await apiClient.post("/api/artist/album/remove", { albumId })
    return res.data
  },
}
