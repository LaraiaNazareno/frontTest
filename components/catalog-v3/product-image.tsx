"use client"

import Image from "next/image"
import { ImageOff } from "lucide-react"

import { cn } from "@/lib/utils"

type ProductImageProps = {
  src?: string | null
  alt: string
  className?: string
  imageClassName?: string
  fallbackLabel?: string
}

const isPlaceholderImage = (src?: string | null) => {
  if (!src) {
    return true
  }
  const normalized = src.toLowerCase()
  return (
    normalized.includes("placeholder") ||
    normalized.includes("via.placeholder.com") ||
    normalized.includes("placehold") ||
    normalized.includes("400x300")
  )
}

export function ProductImage({
  src,
  alt,
  className,
  imageClassName,
  fallbackLabel = "Sin imagen",
}: ProductImageProps) {
  const showImage = src && !isPlaceholderImage(src)
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {showImage ? (
        <Image src={src} alt={alt} fill className={cn("object-cover", imageClassName)} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted/30 text-muted-foreground">
          <ImageOff className="h-8 w-8" />
        </div>
      )}
    </div>
  )
}
