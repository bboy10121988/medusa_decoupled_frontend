"use client"

import { useState, useEffect, useCallback, memo, useRef } from "react"
import type { YoutubeSection } from "@lib/types/page-sections"

const STORAGE_KEY = 'youtube-timestamp'

const YouTubeSection = memo(({ heading, description, videoUrl, fullWidth = true }: YoutubeSection) => {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [timestamp, setTimestamp] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // 從 URL 提取 YouTube 影片 ID
  const getYouTubeId = useCallback((url: string) => {
    try {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
      const match = url.match(regExp)
      return (match && match[7].length === 11) ? match[7] : null
    } catch (err) {
      console.error('解析 YouTube URL 時發生錯誤:', err)
      setError('無效的 YouTube 網址')
      return null
    }
  }, [])

  // 處理 YouTube iframe 的訊息
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      if (event.origin !== "https://www.youtube.com") return
      
      const data = JSON.parse(event.data)
      if (data.event === "onStateChange" && data.info === 2) { // 2 = 暫停
        localStorage.setItem(STORAGE_KEY, Math.floor(data.time).toString())
      }
    } catch (err) {
      console.error('處理 YouTube 訊息時發生錯誤:', err)
    }
  }, [])

  useEffect(() => {
    try {
      // 從本地儲存讀取上次的播放時間
      const savedTime = localStorage.getItem(STORAGE_KEY)
      if (savedTime) {
        const parsedTime = parseInt(savedTime)
        if (!isNaN(parsedTime)) {
          setTimestamp(parsedTime)
        }
      }
    } catch (err) {
      console.error('讀取播放時間時發生錯誤:', err)
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  useEffect(() => {
    if (videoUrl) {
      const id = getYouTubeId(videoUrl)
      setVideoId(id)
    }
  }, [videoUrl, getYouTubeId])

  // 防止不必要的重新渲染觸發重新播放
  const iframeSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=0&playsinline=1&rel=0&modestbranding=1&start=${timestamp}&enablejsapi=1`

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        {error}
      </div>
    )
  }

  if (!videoId) {
    return null
  }

  return (
    <section className={`w-full ${fullWidth ? "" : "container mx-auto px-4"}`}>
      <div className="max-w-screen-2xl mx-auto">
        {heading && (
          <h2 className="h1 text-center mb-6">{heading}</h2>
        )}
        <div className="relative overflow-hidden pb-[56.25%]">
          <iframe
            ref={iframeRef}
            key={videoId} // 確保 videoId 改變時才重新創建 iframe
            className="absolute top-0 left-0 w-full h-full"
            src={iframeSrc}
            title={heading || "YouTube video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
            allowFullScreen
          />
        </div>
        {description && (
          <p className="text-body-large text-center mt-4">{description}</p>
        )}
      </div>
    </section>
  )
}, (prevProps, nextProps) => {
  // 只有當這些屬性改變時才重新渲染
  return (
    prevProps.videoUrl === nextProps.videoUrl &&
    prevProps.heading === nextProps.heading &&
    prevProps.description === nextProps.description &&
    prevProps.fullWidth === nextProps.fullWidth
  )
})

YouTubeSection.displayName = 'YouTubeSection'

export default YouTubeSection