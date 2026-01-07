import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// No-op middleware; left in place to satisfy Next.js runtime.
export default function middleware(_req: NextRequest) {
	return NextResponse.next()
}
