"use client"

import React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { copyImageToClipboard, getImageFromClipboard, downloadImage } from "@/lib/utils/clipboard"
import { Copy, Trash2, Upload, Download, RefreshCw } from "lucide-react"
import Image from "next/image"

interface ImageClipboardProps {
  roomCode: string
  imageUrl: string | null
  onImageUpdate: (imageUrl: string | null) => void
}

export function ImageClipboard({ roomCode, imageUrl, onImageUpdate }: ImageClipboardProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)

  const uploadImage = useCallback(async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `${roomCode}/${fileName}`

      const { error } = await supabase.storage.from("room-images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from("room-images").getPublicUrl(filePath)

      // Update room with new image URL
      const { error: updateError } = await supabase
        .from("rooms")
        .update({
          image_url: publicUrl,
          last_updated: new Date().toISOString(),
        })
        .eq("code", roomCode)

      if (updateError) {
        console.error("Failed to update room:", updateError)
        toast.error("Upload failed", {
          description: "Failed to update room. Please try again.",
        })
        return
      }

      // Immediately update local state for instant display
      onImageUpdate(publicUrl)
      
      toast.success("Image pasted", {
        description: "Image has been shared to the room",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Upload failed", {
        description: "Failed to upload image. Please try again.",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [roomCode, onImageUpdate])

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      e.preventDefault()
      const image = await getImageFromClipboard()
      if (image) {
        await uploadImage(image)
      }
    },
    [uploadImage],
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      const imageFile = files.find((file) => file.type.startsWith("image/"))

      if (imageFile) {
        await uploadImage(imageFile)
      }
    },
    [uploadImage],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleCopyImage = async () => {
    if (!imageUrl) return

    const success = await copyImageToClipboard(imageUrl)
    if (success) {
      // Check if we actually copied the image or just the URL
      try {
        const clipboardItems = await navigator.clipboard.read()
        const hasImage = clipboardItems.some((item) => item.types.some((type) => type.startsWith("image/")))

        if (hasImage) {
          toast.success("Image copied", {
            description: "Image has been copied to your clipboard",
          })
        } else {
          toast.success("Image URL copied", {
            description: "Image URL copied to clipboard. You can also download the image.",
            action: {
              label: "Download",
              onClick: () => downloadImage(imageUrl, `cliproom-image-${Date.now()}.png`),
            },
          })
        }
      } catch {
        toast.success("Image URL copied", {
          description: "Image URL copied to clipboard",
        })
      }
    } else {
      toast.error("Copy failed", {
        description: "Unable to copy image. Try downloading instead.",
        action: {
          label: "Download",
          onClick: () => downloadImage(imageUrl, `cliproom-image-${Date.now()}.png`),
        },
      })
    }
  }

  const handleClearImage = async () => {
    if (!imageUrl) return

    try {
      // Extract file path from URL - handle different URL formats
      let filePath = ""
      if (imageUrl.includes("/storage/v1/object/public/")) {
        // Supabase storage URL format
        const urlParts = imageUrl.split("/storage/v1/object/public/")
        if (urlParts.length > 1) {
          filePath = urlParts[1]
        }
      } else {
        // Fallback to original method
        const urlParts = imageUrl.split("/")
        const fileName = urlParts[urlParts.length - 1]
        filePath = `${roomCode}/${fileName}`
      }

      console.log("Attempting to delete file path:", filePath)

      // Delete from storage
      const { error: storageError } = await supabase.storage.from("room-images").remove([filePath])
      
      if (storageError) {
        console.error("Failed to delete from storage:", storageError)
        // Continue anyway - the file might not exist or be accessible
      }

      // Update room
      const { error: updateError } = await supabase
        .from("rooms")
        .update({
          image_url: null,
          last_updated: new Date().toISOString(),
        })
        .eq("code", roomCode)

      if (updateError) {
        console.error("Failed to update room:", updateError)
        toast.error("Clear failed", {
          description: "Failed to update room. Please try again.",
        })
        return
      }

      onImageUpdate(null)
      toast.success("Image cleared", {
        description: "Image has been removed from the room",
      })
    } catch (error) {
      console.error("Clear image error:", error)
      toast.error("Clear failed", {
        description: "Failed to clear image. Please try again.",
      })
    }
  }

  const handleRefresh = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("image_url")
        .eq("code", roomCode)
        .single()

      if (error) {
        toast.error("Failed to refresh", {
          description: "Could not fetch latest image",
        })
        return
      }

      onImageUpdate(data.image_url)
      toast.success("Image refreshed", {
        description: "Latest image has been loaded",
      })
    } catch {
      toast.error("Refresh failed", {
        description: "Please try again",
      })
    }
  }

  // Add paste event listener
  React.useEffect(() => {
    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [handlePaste])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Image Clipboard</h2>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card
        className={`p-6 border-2 border-dashed transition-colors ${
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 animate-pulse" />
              <p>Uploading image...</p>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        ) : imageUrl ? (
          <div className="space-y-4">
            <div className="relative max-w-sm mx-auto">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt="Shared image"
                width={400}
                height={300}
                className="rounded-lg shadow-md object-contain max-h-64 w-full"
                onError={(e) => {
                  console.error("Image failed to load:", imageUrl)
                  // Fallback to a placeholder or error state
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg"
                }}
              />
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleCopyImage} variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Copy Image
              </Button>
              <Button onClick={() => downloadImage(imageUrl!, `cliproom-image-${Date.now()}.png`)} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleClearImage} variant="outline">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop an image or press Ctrl+V to paste</p>
            <p className="text-sm text-muted-foreground">
              Images will be shared instantly across all devices in this room
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
