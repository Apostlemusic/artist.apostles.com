export type AuthPayload = {
  exp: number
  email?: string
  artistId?: string
  name?: string
}

export function getAuth(): AuthPayload | null {
  try {
    const raw = window.localStorage.getItem("apostles_auth")
    if (!raw) return null
    const parsed: AuthPayload = JSON.parse(raw)
    const id = window.localStorage.getItem("apostles_artist_id") || undefined
    const name = window.localStorage.getItem("apostles_artist_name") || undefined
    const payload: AuthPayload = { ...parsed, artistId: id, name }
    if (!payload.exp || Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export function logout(redirectTo: string = "/auth/login") {
  try {
    window.localStorage.removeItem("apostles_auth")
    window.localStorage.removeItem("apostles_email")
    window.localStorage.removeItem("apostles_artist_id")
    window.localStorage.removeItem("apostles_artist_name")
    window.localStorage.removeItem("apostles_access_token")
    window.localStorage.removeItem("apostles_refresh_token")
  } catch {}
  window.location.href = redirectTo
}
