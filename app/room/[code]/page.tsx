"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TextClipboard } from "@/components/text-clipboard"
import { ImageClipboard } from "@/components/image-clipboard"
import { toast } from "sonner"
import { supabase, type Room } from "@/lib/supabase"
import { copyTextToClipboard } from "@/lib/utils/clipboard"
import { Copy, ArrowLeft } from "lucide-react"

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = params.code as string

  const [room, setRoom] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  useEffect(() => {
    if (!roomCode) return

    const fetchRoom = async () => {
      try {
        const { data, error } = await supabase.from("rooms").select("*").eq("code", roomCode.toUpperCase()).single()

        if (error || !data) {
          setError("Room not found")
          return
        }

        setRoom(data)
      } catch {
        setError("Failed to load room")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoom()

    // Set up real-time subscription with better error handling
    const channel = supabase
      .channel(`room-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `code=eq.${roomCode.toUpperCase()}`,
        },
        (payload: { new: Room }) => {
          console.log("Real-time update received:", payload)
          setRoom(payload.new as Room)
          setLastUpdate(new Date().toLocaleTimeString())
        },
      )
      .on("presence", { event: "sync" }, () => {
        console.log("Presence sync")
      })
      .on("presence", { event: "join" }, ({ key, newPresences }: { key: string; newPresences: unknown[] }) => {
        console.log("Presence join:", key, newPresences)
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }: { key: string; leftPresences: unknown[] }) => {
        console.log("Presence leave:", key, leftPresences)
      })

    // Subscribe to the channel
    const subscribeToChannel = async () => {
      try {
        const status = await channel.subscribe()
        console.log("Subscription status:", status)
      } catch (error) {
        console.error("Subscription error:", error)
      }
    }

    subscribeToChannel()

    return () => {
      console.log("Cleaning up subscription")
      channel.unsubscribe()
    }
  }, [roomCode])

  const handleCopyRoomCode = async () => {
    const success = await copyTextToClipboard(roomCode.toUpperCase())
    if (success) {
      toast.success("Room code copied", {
        description: "Share this code with your other devices",
      })
    }
  }

  const handleTextUpdate = (text: string | null) => {
    // Let the real-time subscription handle the update
    console.log("Text update triggered:", text)
  }

  const handleImageUpdate = (imageUrl: string | null) => {
    // Immediately update local state for instant display
    if (room) {
      setRoom({ ...room, image_url: imageUrl, last_updated: new Date().toISOString() })
    }
    console.log("Image update triggered:", imageUrl)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading room...</p>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Room Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">The room code &quot;{roomCode}&quot; doesn&apos;t exist or has expired.</p>
            <Button onClick={() => router.push("/")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="backdrop-blur-sm bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Room: {roomCode.toUpperCase()}</CardTitle>
                <p className="text-muted-foreground">Share this code with your other devices</p>
                {lastUpdate && (
                  <p className="text-xs text-green-600 mt-1">
                    Last update: {lastUpdate} (real-time)
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => router.push("/")} variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button onClick={handleCopyRoomCode} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Text Clipboard */}
          <Card className="backdrop-blur-sm bg-card/50">
            <CardContent className="p-6">
              <TextClipboard
                roomCode={roomCode.toUpperCase()}
                textContent={room.text_content}
                onTextUpdate={handleTextUpdate}
                lastUpdated={room.last_updated}
              />
            </CardContent>
          </Card>

          {/* Image Clipboard */}
          <Card className="backdrop-blur-sm bg-card/50">
            <CardContent className="p-6">
              <ImageClipboard
                roomCode={roomCode.toUpperCase()}
                imageUrl={room.image_url}
                onImageUpdate={handleImageUpdate}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
