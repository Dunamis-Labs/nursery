"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ZoomIn } from "lucide-react"

interface ProductImageGalleryProps {
  images: string[]
  name: string
}

export function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

  // Get current image with fallback
  const currentImage = images[selectedImage] || "/placeholder.svg"
  const [mainImageSrc, setMainImageSrc] = useState(currentImage)

  // Reset main image when selected image changes
  useEffect(() => {
    setMainImageSrc(images[selectedImage] || "/placeholder.svg")
    setImageErrors(prev => {
      const newErrors = { ...prev }
      // Reset error for newly selected image
      delete newErrors[selectedImage]
      return newErrors
    })
  }, [selectedImage, images])

  const handleMainImageError = () => {
    if (!imageErrors[selectedImage]) {
      setImageErrors(prev => ({ ...prev, [selectedImage]: true }))
      setMainImageSrc("/placeholder.svg")
    }
  }

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
            src={mainImageSrc}
            alt={`${name} - View ${selectedImage + 1}`}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isZoomed ? "scale-125" : "scale-100"
            }`}
            onError={handleMainImageError}
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
          <ThumbnailImage
            key={index}
            image={image || "/placeholder.svg"}
            name={name}
            index={index}
            isSelected={selectedImage === index}
            onClick={() => setSelectedImage(index)}
            hasError={imageErrors[index] || false}
            onError={() => {
              if (!imageErrors[index]) {
                setImageErrors(prev => ({ ...prev, [index]: true }))
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Separate component for thumbnail with error handling
function ThumbnailImage({
  image,
  name,
  index,
  isSelected,
  onClick,
  hasError,
  onError,
}: {
  image: string
  name: string
  index: number
  isSelected: boolean
  onClick: () => void
  hasError: boolean
  onError: () => void
}) {
  const [imgSrc, setImgSrc] = useState(image)

  useEffect(() => {
    if (!hasError) {
      setImgSrc(image)
    } else {
      setImgSrc("/placeholder.svg")
    }
  }, [image, hasError])

  const handleError = () => {
    if (!hasError) {
      onError()
      setImgSrc("/placeholder.svg")
    }
  }

  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all border-2 ${
        isSelected ? "border-[#87a96b] shadow-md" : "border-border hover:border-[#87a96b]/50"
      }`}
      onClick={onClick}
    >
      <div className="aspect-square bg-muted">
        <img
          src={imgSrc}
          alt={`${name} thumbnail ${index + 1}`}
          className="w-full h-full object-cover"
          onError={handleError}
        />
      </div>
    </Card>
  )
}
