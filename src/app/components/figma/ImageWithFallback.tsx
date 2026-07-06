import { useState } from "react"

export default function ImageWithFallback({ src, alt }: any) {
  const [error, setError] = useState(false)

  return (
    <img
      src={error ? "/placeholder.png" : src}
      alt={alt}
      onError={() => setError(true)}
    />
  )
}