"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "./button"
import { X } from "lucide-react"
import Image from "next/image"
import { cn } from "../lib/utils"

interface ImageUploadProps {
  value: string[]
  onChange: (images: string[]) => void
  maxFiles?: number
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  maxFiles = 4,
}) => {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Replace this with your actual upload logic (e.g., UploadThing, Cloudinary)
      const uploaded = await Promise.all(
        acceptedFiles.map(async (file) => {
          const url = URL.createObjectURL(file) // temporary preview (replace with uploaded URL)
          return url
        })
      )
      const newImages = [...value, ...uploaded].slice(0, maxFiles)
      onChange(newImages)
    },
    [onChange, value, maxFiles]
  )

  const removeImage = (url: string) => {
    onChange(value.filter((img) => img !== url))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
    maxFiles,
  })

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "border border-dashed rounded-lg p-4 text-center cursor-pointer transition-all",
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        )}
      >
        <input {...getInputProps()} />
        <p className="text-sm text-gray-500">
          Drag & drop images here, or click to select
        </p>
        <p className="text-xs text-muted-foreground">
          You can upload up to {maxFiles} images
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {value.map((img, idx) => (
          <div
            key={idx}
            className="relative w-full aspect-square rounded-md overflow-hidden border"
          >
            <Image
              src={img}
              alt={`uploaded-${idx}`}
              fill
              className="object-cover"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 z-10 bg-white/80 hover:bg-white"
              onClick={() => removeImage(img)}
            >
              <X className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
