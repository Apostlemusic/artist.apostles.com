"use client"
import { useState } from "react"
import { Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function GenresPage() {
  const [search, setSearch] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Genres</h1>
          <p className="text-muted-foreground mt-1">Create and manage genres for your content.</p>
        </div>
        <Button className="bg-primary">
          <Plus className="size-4 mr-2" /> New Genre
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <Input
          placeholder="Search genres..."
          className="h-10 border-border/50 focus-visible:ring-primary max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Your Genres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No genres yet. Use the New Genre button to create one.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
