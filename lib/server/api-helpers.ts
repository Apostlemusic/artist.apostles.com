import { auth } from "@/lib/server/mock-db"

function getCookieValue(cookieHeader: string, name: string): string | null {
  if (!cookieHeader) return null
  const parts = cookieHeader.split(";")
  for (const part of parts) {
    const [key, ...rest] = part.trim().split("=")
    if (key === name) return decodeURIComponent(rest.join("="))
  }
  return null
}

export function getAuthEmail(request: Request): string | null {
  const authHeader = request.headers.get("authorization")
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  const cookieHeader = request.headers.get("cookie") || ""
  const cookieToken = getCookieValue(cookieHeader, "apostolicaccesstoken")
  const token = bearerToken || cookieToken
  return auth.getEmailForToken(token)
}

export function normalizeArtistPayload(artist: any) {
  if (!artist) return null
  return {
    id: artist.id,
    _id: artist._id,
    name: artist.name,
    email: artist.email,
    type: artist.type,
    verified: artist.verified,
    profileImg: artist.profileImg ?? artist.profile?.profileImg ?? "",
    about: artist.about ?? artist.profile?.about ?? "",
    description: artist.description ?? artist.profile?.description ?? "",
    followers: artist.followers ?? [],
    likes: artist.likes ?? [],
  }
}
