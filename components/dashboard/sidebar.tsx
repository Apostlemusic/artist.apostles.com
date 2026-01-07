"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { LayoutDashboard, Music, User, Users, Settings, Moon, Sun, LogOut } from "lucide-react"
import { useTheme } from "next-themes"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import  {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { artistService } from "@/services/artist-service"
import type { Artist } from "@/lib/types"
import { logout, getAuth } from "@/lib/auth"

const navItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Artist Content",
    icon: Music,
    href: "/dashboard/music/songs",
    items: [
      { title: "Songs", href: "/dashboard/music/songs" },
      { title: "Albums", href: "/dashboard/music/albums" },
    ],
  },
  // {
  //   title: "Social",
  //   icon: Users,
  //   href: "/dashboard/social",
  // },
  // {
  //   title: "Profile",
  //   icon: User,
  //   href: "/dashboard/profile",
  // },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const [artist, setArtist] = useState<Artist | null>(null)

  useEffect(() => {
    const auth = getAuth()
    const name = auth?.name
    if (name && !artist?.name) {
      setArtist((prev) => ({ ...(prev ?? {} as any), name }))
    }
    artistService
      .getProfileMe()
      .then((data: any) => {
        const me: Artist = data?.artist ?? data
        setArtist(me)
      })
      .catch(() => {})
  }, [])

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="h-16 flex items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary text-xl tracking-tight">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">A</div>
          <span className="group-data-[collapsible=icon]:hidden">Apostles</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className={cn(
                      "h-10 px-4 rounded-md transition-colors",
                      pathname === item.href
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4 mr-3" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.items && (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === subItem.href}
                            className={cn(
                              "h-9 px-4 rounded-md transition-colors",
                              pathname === subItem.href
                                ? "text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <Link href={subItem.href}>{subItem.title}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Toggle Theme"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-10 px-4 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Sun className="size-4 mr-3 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute size-4 mr-3 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span>Toggle Theme</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-12 px-2 hover:bg-accent/50 rounded-lg">
              <Avatar className="size-8 rounded-md mr-3">
                {/* <AvatarImage src={artist?.profileImg || "/placeholder-user.jpg"} /> */}
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {(artist?.name || "Artist").split(" ").map((p) => p[0]).slice(0,2).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold truncate w-full">{artist?.name || "Artist"}</span>
                <span className="text-xs text-muted-foreground truncate w-full">{artist?.email || ""}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 size-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => logout("/auth/login")}
            >
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
