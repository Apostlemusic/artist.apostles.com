import apiClient from "@/lib/api-client"
import type {
  EditProfileData,
  RegisterData,
  LoginData,
  VerifyOtpData,
  ResetPasswordData,
  ResendOtpData,
  ForgotPasswordData,
} from "@/lib/types"

export const artistApi = {
  // Dashboard
  async getStats(): Promise<any> {
    const res = await apiClient.get("/api/artist/dashboard/stats", {withCredentials: true})
    return res.data
  },

  // Profile
  async getProfileMe(): Promise<any> {
    const res = await apiClient.get("/api/artist/profile/me")
    return res.data
  },
  async getArtistById(artistId: string): Promise<any> {
    const res = await apiClient.get(`/api/artist/getArtistById/${artistId}`)
    return res.data
  },
  async getArtistByName(name: string): Promise<any> {
    const res = await apiClient.get(`/api/artist/getArtistByName/${encodeURIComponent(name)}`)
    return res.data
  },
  async getAllArtists(): Promise<any> {
    const res = await apiClient.get("/api/artist/getAllArtists")
    return res.data
  },
  async editProfile(data: EditProfileData): Promise<any> {
    const res = await apiClient.post("/api/artist/profile/edit", data)
    return res.data
  },

  // Auth
  async register(data: RegisterData): Promise<any> {
    const res = await apiClient.post("/api/artist/register", data)
    return res.data
  },
  async login(data: LoginData): Promise<any> {
    const res = await apiClient.post("/api/artist/login", data)
    return res.data
  },
  async verifyOtp(data: VerifyOtpData): Promise<any> {
    const res = await apiClient.post("/api/artist/verifyOtp", data)
    return res.data
  },
  async resendOtp(data: ResendOtpData): Promise<any> {
    const res = await apiClient.post("/api/artist/resendOtp", data)
    return res.data
  },
  async forgotPassword(data: ForgotPasswordData): Promise<any> {
    const res = await apiClient.post("/api/artist/forgotPassword", data)
    return res.data
  },
  async resetPassword(data: ResetPasswordData): Promise<any> {
    const res = await apiClient.post("/api/artist/resetPassword", data)
    return res.data
  },
  async isVerified(email: string): Promise<any> {
    const res = await apiClient.get(`/api/artist/isVerified`, { params: { email } })
    return res.data
  },
  async followArtist(artistId: string, userId: string): Promise<any> {
    const res = await apiClient.post("/api/artist/followArtist", { artistId, userId })
    return res.data
  },
  async likeArtist(artistId: string, userId: string): Promise<any> {
    const res = await apiClient.post("/api/artist/likeArtist", { artistId, userId })
    return res.data
  },
  async deleteArtist(artistId: string): Promise<any> {
    const res = await apiClient.post("/api/artist/deleteArtist", { artistId })
    return res.data
  },
}
