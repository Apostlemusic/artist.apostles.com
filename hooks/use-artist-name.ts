import { useEffect, useState } from "react"
import { getAuth } from "@/lib/auth"
import { artistService } from "@/services/artist-service"

export function useArtistName() {
  const [artistName, setArtistName] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const auth = getAuth()
    const fallbackName = auth?.name || ""

    artistService
      .getProfileMe()
      .then((data: any) => {
        // Expected shape: { success: true, artist: { name: string, email: string, ... } }
        const fetchedName = (data?.artist?.name || data?.name || fallbackName) as string
        setArtistName(fetchedName)
      })
      .catch(() => {
        setArtistName(fallbackName)
      })
      .finally(() => setLoading(false))
  }, [])

  return { artistName, loading }
}
