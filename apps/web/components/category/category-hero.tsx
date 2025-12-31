"use client"

import { useState } from "react"
import Image from "next/image"

interface CategoryHeroProps {
  name: string
  subheading: string
  image: string
}

export function CategoryHero({ name, subheading, image }: CategoryHeroProps) {
  const [imgSrc, setImgSrc] = useState(image)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc("/logo.svg")
    }
  }

  return (
    <section className="relative h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden bg-gray-200">
      <Image
        src={imgSrc}
        alt=""
        fill
        className={hasError ? "grayscale opacity-50 object-contain" : "object-cover"}
        sizes="100vw"
        priority
        quality={85}
        onError={handleError}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />

      <div className="relative z-10 container mx-auto px-4 md:px-8 text-white">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-balance">{name}</h1>
        <p className="text-base md:text-lg lg:text-xl max-w-3xl opacity-95 leading-relaxed">{subheading}</p>
      </div>
    </section>
  )
}
