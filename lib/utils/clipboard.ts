export async function copyTextToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error("Failed to copy text: ", err)
      return false
    }
  }
  
  export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
    try {
      // Check if Clipboard API is supported
      if (!navigator.clipboard || !navigator.clipboard.write) {
        // Fallback: try to copy the image URL as text
        await navigator.clipboard.writeText(imageUrl)
        return true
      }
  
      // Fetch the image and convert to blob
      const response = await fetch(imageUrl, {
        mode: "cors",
        credentials: "omit",
      })
  
      if (!response.ok) {
        throw new Error("Failed to fetch image")
      }
  
      const blob = await response.blob()
  
      // Check if the blob type is supported
      if (!blob.type.startsWith("image/")) {
        throw new Error("Invalid image type")
      }
  
      // Try to copy as image
      const clipboardItem = new ClipboardItem({
        [blob.type]: blob,
      })
  
      await navigator.clipboard.write([clipboardItem])
      return true
    } catch (err) {
      console.error("Failed to copy image: ", err)
  
      // Final fallback: copy image URL as text
      try {
        await navigator.clipboard.writeText(imageUrl)
        return true
      } catch (textErr) {
        console.error("Failed to copy image URL as text: ", textErr)
        return false
      }
    }
  }
  
  // Add a new function to download image as fallback
  export function downloadImage(imageUrl: string, filename = "clipboard-image.png"): void {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = filename
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  export async function getImageFromClipboard(): Promise<File | null> {
    try {
      const clipboardItems = await navigator.clipboard.read()
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith("image/")) {
            const blob = await clipboardItem.getType(type)
            return new File([blob], "pasted-image.png", { type })
          }
        }
      }
      return null
    } catch (err) {
      console.error("Failed to read from clipboard: ", err)
      return null
    }
  }
  