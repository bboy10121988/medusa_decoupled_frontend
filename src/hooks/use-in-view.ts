"use client"

import { useEffect, useState } from "react"

export const useIntersection = (
  element: React.RefObject<HTMLElement>,
  rootMargin: string = "0px"
) => {
  const [isVisible, setIsVisible] = useState<boolean>(true)

  useEffect(() => {
    if (!element.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { rootMargin }
    )

    element.current && observer.observe(element.current)

    return () => {
      element.current && observer.unobserve(element.current)
    }
  }, [element, rootMargin])

  return !isVisible
}
