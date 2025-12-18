"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ZoomIn } from "lucide-react"

interface ProductImageGalleryProps {
  images: string[]
  name: string
}

export function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <Card className="overflow-hidden border-border">
        <div
          className="relative aspect-square bg-muted cursor-zoom-in group"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
        >
          <img
            src={images[selectedImage] || "/placeholder.svg"}
            alt={`${name} - View ${selectedImage + 1}`}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isZoomed ? "scale-125" : "scale-100"
            }`}
          />
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 backdrop-blur rounded-full p-2">
              <ZoomIn className="h-5 w-5 text-foreground" />
            </div>
          </div>
        </div>
      </Card>

      {/* Thumbnail Strip */}
      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <Card
            key={index}
            className={`overflow-hidden cursor-pointer transition-all border-2 ${
              selectedImage === index ? "border-[#87a96b] shadow-md" : "border-border hover:border-[#87a96b]/50"
            }`}
            onClick={() => setSelectedImage(index)}
          >
            <div className="aspect-square bg-muted">
              <img
                src={image || "/placeholder.svg"}
                alt={`${name} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
