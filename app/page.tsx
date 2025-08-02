"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { JoinRoomModal } from "@/components/join-room-modal"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { generateRoomCode } from "@/lib/utils/room-generator"
import { Plus, LogIn } from "lucide-react"

export default function HomePage() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const handleCreateRoom = async () => {
    setIsCreating(true)
    try {
      const roomCode = generateRoomCode()

      const { error } = await supabase.from("rooms").insert({
        code: roomCode,
        text_content: null,
        image_url: null,
        last_updated: new Date().toISOString(),
      })

      if (error) throw error

      toast.success("Room created", {
        description: `Room code: ${roomCode}`,
      })

      router.push(`/room/${roomCode}`)
    } catch (error) {
      console.error("Failed to create room:", error)
      toast.error("Failed to create room", {
        description: "Please try again",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">ClipRoom</h1>
          <p className="text-lg text-muted-foreground">
            Paste and share text or images across your devices — instantly
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-card/50 border-2">
          <CardHeader className="text-center">
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Create a new room or join an existing one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleCreateRoom} className="w-full h-12 text-lg" disabled={isCreating}>
              <Plus className="w-5 h-5 mr-2" />
              {isCreating ? "Creating..." : "Create Room"}
            </Button>

            <Button onClick={() => setIsJoinModalOpen(true)} variant="outline" className="w-full h-12 text-lg">
              <LogIn className="w-5 h-5 mr-2" />
              Join Room
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">Powered by Supabase realtime</p>
      </div>

      <JoinRoomModal open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen} />
    </div>
  )
}
