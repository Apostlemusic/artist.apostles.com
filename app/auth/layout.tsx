import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "../../components/ui/theme-toggle"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Auth redirects are handled in middleware.ts

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/placeholder-logo.svg" alt="Apostles" width={24} height={24} className="dark:opacity-90" />
            <span className="text-sm font-semibold">Apostles</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/auth/login" className="text-xs text-muted-foreground hover:text-foreground">Login</Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/auth/register" className="text-xs text-muted-foreground hover:text-foreground">Register</Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md p-4">
        {children}
      </main>
    </div>
  )
}
