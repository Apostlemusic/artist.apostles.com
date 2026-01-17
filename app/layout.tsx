import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ConditionalAuth } from "@/components/auth/conditional-auth"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Apostles | Artist Dashboard",
  description: "The ultimate platform for modern artists",
  generator: "v0.app",
  icons: {
    icon: "/Apostle-Logo-sm.png",
    apple: "/Apostle-Logo-sm.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ConditionalAuth>{children}</ConditionalAuth>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
