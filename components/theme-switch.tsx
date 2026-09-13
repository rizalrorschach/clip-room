"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"

export function ThemeSwitch({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`flex items-center gap-2 p-1 ${className ?? ""}`}>
        <Sun className="h-4 w-4 text-muted-foreground opacity-50" />
        <div className="h-[1.15rem] w-8 rounded-full bg-input" />
        <Moon className="h-4 w-4 text-muted-foreground opacity-50" />
      </div>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-border/50 bg-card/60 px-2.5 py-1.5 backdrop-blur-sm shadow-xs ${
        className ?? ""
      }`}
    >
      <Sun
        className={`h-4 w-4 transition-colors ${
          !isDark ? "text-amber-500 font-medium" : "text-muted-foreground/60"
        }`}
      />
      <Switch
        id="theme-switch"
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark/light mode"
        className="cursor-pointer"
      />
      <Moon
        className={`h-4 w-4 transition-colors ${
          isDark ? "text-indigo-400 font-medium" : "text-muted-foreground/60"
        }`}
      />
    </div>
  )
}
