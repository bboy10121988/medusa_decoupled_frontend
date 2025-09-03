"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"
import { useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  if (!images?.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 主圖顯示區 */}
      <div className="w-full overflow-hidden">
        <div className="relative aspect-[29/34] w-full bg-ui-bg-subtle">
          <Image
            key={images[selectedImageIndex].id}
            src={images[selectedImageIndex].url}
            priority={true}
            className="w-full h-full object-cover"
            alt={`Product image ${selectedImageIndex + 1}`}
            fill
            sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
            style={{ objectFit: "cover" }}
          />
          
          {images.length > 1 && (
            <>
              {/* 左箭頭 */}
              <button 
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-700 transition-all z-10 bg-white/60 p-1 rounded-full"
                aria-label="Previous image"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              {/* 右箭頭 */}
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-700 transition-all z-10 bg-white/60 p-1 rounded-full"
                aria-label="Next image"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* 圖片計數器 */}
              <div className="absolute bottom-3 right-3 bg-white/60 px-2 py-1 rounded text-xs font-medium">
                {selectedImageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* 縮圖列表 */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={`thumb-${image.id || `index-${index}`}`}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative w-20 h-24 flex-shrink-0 border-2 transition-all ${
                selectedImageIndex === index ? "border-black" : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
