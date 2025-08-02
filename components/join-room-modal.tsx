"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { LogIn } from "lucide-react"

interface JoinRoomModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JoinRoomModal({ open, onOpenChange }: JoinRoomModalProps) {
  const [roomCode, setRoomCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (roomCode.length !== 6) {
      toast.error("Invalid room code", {
        description: "Room code must be 6 characters long",
      })
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("rooms").select("code").eq("code", roomCode.toUpperCase()).single()

      if (error || !data) {
        toast.error("Room not found", {
          description: "Please check the room code and try again",
        })
        return
      }

      onOpenChange(false)
      router.push(`/room/${roomCode.toUpperCase()}`)
    } catch {
      toast.error("Error", {
        description: "Failed to join room. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Room</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomCode">Room Code</Label>
            <Input
              id="roomCode"
              placeholder="Enter 6-character code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="text-center text-lg font-mono tracking-wider"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || roomCode.length !== 6}>
            <LogIn className="w-4 h-4 mr-2" />
            {isLoading ? "Joining..." : "Join Room"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
