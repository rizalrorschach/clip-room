"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { copyTextToClipboard } from "@/lib/utils/clipboard"
import { Copy, Trash2, RefreshCw } from "lucide-react"

interface TextClipboardProps {
  roomCode: string
  textContent: string | null
  onTextUpdate: (text: string | null) => void
  lastUpdated: string | null
}

export function TextClipboard({ roomCode, textContent, onTextUpdate, lastUpdated }: TextClipboardProps) {
  const [text, setText] = useState(textContent || "")
  const [isUpdating, setIsUpdating] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    setText(textContent || "")
  }, [textContent])

  const updateText = async (newText: string) => {
    if (isUpdating) return

    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from("rooms")
        .update({
          text_content: newText || null,
          last_updated: new Date().toISOString(),
        })
        .eq("code", roomCode)

      if (error) {
        console.error("Failed to update text:", error)
        toast.error("Failed to update text", {
          description: "Please try again",
        })
      }
    } catch (error) {
      console.error("Failed to update text:", error)
      toast.error("Failed to update text", {
        description: "Please try again",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)

    // Debounce updates
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      updateText(newText)
    }, 500)
  }

  const handleCopyText = async () => {
    if (!text.trim()) return

    const success = await copyTextToClipboard(text)
    if (success) {
      toast.success("Text copied", {
        description: "Text has been copied to your clipboard",
      })
    } else {
      toast.error("Copy failed", {
        description: "Failed to copy text to clipboard",
      })
    }
  }

  const handleClearText = async () => {
    setText("")
    await updateText("")
    onTextUpdate(null)
    toast.success("Text cleared", {
      description: "Text has been cleared from the room",
    })
  }

  const handleRefresh = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("text_content")
        .eq("code", roomCode)
        .single()

      if (error) {
        toast.error("Failed to refresh", {
          description: "Could not fetch latest text content",
        })
        return
      }

      setText(data.text_content || "")
      toast.success("Text refreshed", {
        description: "Latest content has been loaded",
      })
    } catch {
      toast.error("Refresh failed", {
        description: "Please try again",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Text Clipboard</h2>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">Last updated: {new Date(lastUpdated).toLocaleTimeString()}</p>
          )}
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Type or paste text here to share across devices..."
        className="min-h-32 resize-y"
        disabled={isUpdating}
      />

      <div className="flex gap-2">
        <Button onClick={handleCopyText} disabled={!text.trim()} variant="outline">
          <Copy className="w-4 h-4 mr-2" />
          Copy Text
        </Button>
        <Button onClick={handleClearText} disabled={!text.trim()} variant="outline">
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Text
        </Button>
      </div>
    </div>
  )
}
