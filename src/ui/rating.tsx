"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "../lib/utils"

type RatingProps = {
  max?: number
  value?: number
  precision?: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: number
  className?: string
}

export const Rating = ({
  max = 5,
  value = 0,
  precision = 1,
  onChange,
  readOnly = false,
  size = 24,
  className,
}: RatingProps) => {
  const [hovered, setHovered] = useState<number | null>(null)

  const getFill = (index: number) => {
    const current = hovered ?? value ?? 0
    const diff = current - index
    if (diff >= 1) return 1
    if (diff >= 0.5 && precision <= 0.5) return 0.5
    return 0
  }

  const handleClick = (index: number, part: number) => {
    if (!readOnly && onChange) {
      const rating = (index + part) * precision
      onChange(Number(rating.toFixed(2)))
    }
  }

  const renderStar = (index: number) => {
    const fill = getFill(index)
    return (
      <div key={index} className="relative">
        <Star
          size={size}
          className={cn(
            "cursor-pointer transition-colors",
            fill >= 1 ? "fill-yellow-400 text-yellow-400" :
            fill >= 0.5 ? "fill-yellow-300 text-yellow-300" :
            "text-gray-300",
            readOnly && "cursor-default"
          )}
          onMouseEnter={() => !readOnly && setHovered((index + 1) * precision)}
          onMouseLeave={() => !readOnly && setHovered(null)}
          onClick={() => handleClick(index, 1)}
        />
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: Math.floor(max / precision) }).map((_, i) =>
        renderStar(i)
      )}
    </div>
  )
}
