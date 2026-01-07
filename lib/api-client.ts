import axios from "axios"

// Use same-origin by default so the frontend hits Next.js API routes
const baseURL = process.env.NEXT_PUBLIC_API_URL || ""

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

// Request interceptor for adding tokens if needed
apiClient.interceptors.request.use(
  (config) => {
    // In a real app, you might get the token from a secure store or cookie
    // The postman docs mention cookies like apostolicaccesstoken
    return config
  },
  (error) => Promise.reject(error),
)

export default apiClient
