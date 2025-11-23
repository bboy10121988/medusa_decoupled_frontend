"use client"

import { useState, useEffect, useCallback, memo, useRef } from "react"
import type { YoutubeSection } from "@lib/types/page-sections"

const STORAGE_KEY = 'youtube-timestamp'

const YouTubeSection = memo(({ 
  heading, 
  description, 
  videoUrl, 
  videoMode = 'youtube',
  youtubeSettings, 
  uploadSettings,
  videoSettings, // 向後兼容
  fullWidth = true,
  paddingX
}: YoutubeSection) => {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isShorts, setIsShorts] = useState<boolean>(false)
  const [timestamp, setTimestamp] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(true) // 預設自動播放
  const [isMobile, setIsMobile] = useState<boolean | null>(null) // null 表示尚未初始化
  // iframe 和 video 元素引用
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // 立即 log 接收到的 props
  // console.log('🚀 YouTubeSection Component Mounted with props:', {
    // heading,
    // description,
    // videoUrl,
    // videoMode,
    // youtubeSettings,
    // uploadSettings,
    // videoSettings,
    // fullWidth
  // });  // 從 URL 提取 YouTube 影片 ID
    // 判斷是否為上傳檔案模式
  const isUploadMode = videoMode === 'upload'
  
  const extractVideoId = (url: string): { videoId: string | null; isShorts: boolean } => {
    if (!url) return { videoId: null, isShorts: false };
    
    // console.log('🔄 Processing video URL:', url, {
      // isMobile,
      // videoSettings,
      // timestamp: new Date().toLocaleTimeString()
    // });

    // Check if it's a YouTube Shorts URL
    const shortsPattern = /(?:youtube\.com\/shorts\/)([^&\n?#]+)/;
    const shortsMatch = url.match(shortsPattern);
    if (shortsMatch) {
      // console.log('🎬 YouTube Shorts detected, video ID:', shortsMatch[1]);
      return { videoId: shortsMatch[1], isShorts: true };
    }

    // Standard YouTube URLs
    const standardPatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    ];

    for (const pattern of standardPatterns) {
      const match = url.match(pattern);
      if (match) {
        // console.log('✅ Standard YouTube video, ID:', match[1]);
        return { videoId: match[1], isShorts: false };
      }
    }

    // console.log('❌ Could not extract video ID from URL:', url);
    return { videoId: null, isShorts: false };
  };

  // 處理 YouTube iframe 的訊息
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      if (event.origin !== "https://www.youtube.com") return
      
      const data = JSON.parse(event.data)
      if (data.event === "onStateChange" && data.info === 2) { // 2 = 暫停
        localStorage.setItem(STORAGE_KEY, Math.floor(data.time).toString())
      }
    } catch (err) {
      // console.error('處理 YouTube 訊息時發生錯誤:', err)
    }
  }, [])

  // 響應式檢測 - 確保只在客戶端執行
  useEffect(() => {
    const checkIsMobile = () => {
      if (typeof window === 'undefined') return
      
      const mobile = window.innerWidth < 768
      const changed = mobile !== isMobile
      
      // console.log('📱 Device detection:', {
        // windowWidth: window.innerWidth,
        // wasMobile: isMobile,
        // nowMobile: mobile,
        // changed,
        // userAgent: navigator.userAgent,
        // timestamp: new Date().toLocaleTimeString()
      // })
      
      if (changed || isMobile === null) {
        setIsMobile(mobile)
      }
    }
    
    // 初始檢查
    checkIsMobile()
    
    // 監聽視窗大小變化
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [isMobile])

  // 獲取當前應該使用的影片 URL
  const getCurrentVideoUrl = useCallback(() => {
    // 等待 isMobile 狀態初始化完成
    if (isMobile === null) {
      // console.log('⏳ Waiting for mobile detection to initialize...')
      return null
    }
    
    // console.log('🔍 Raw props received:', {
      // videoMode,
      // videoUrl,
      // youtubeSettings,
      // uploadSettings,
      // videoSettings,
      // propsKeys: Object.keys({ videoMode, videoUrl, youtubeSettings, uploadSettings, videoSettings })
    // })

    // 處理上傳模式
    if (videoMode === 'upload' && uploadSettings) {
      // console.log('📁 Upload mode detected, processing video files...')
      
      if (uploadSettings.useSameVideo && uploadSettings.desktopVideo?.asset?.url) {
        // console.log('🔄 Using same uploaded video for all devices:', uploadSettings.desktopVideo.asset.url)
        return uploadSettings.desktopVideo.asset.url
      }

      // 檢查是否有有效的檔案 URL
      if (isMobile && !uploadSettings.mobileVideo?.asset?.url) {
        // console.warn('⚠️ Mobile device detected but no mobile video file, falling back to desktop')
        return uploadSettings.desktopVideo?.asset?.url || null
      }
      
      if (!isMobile && !uploadSettings.desktopVideo?.asset?.url) {
        // console.warn('⚠️ Desktop device detected but no desktop video file, falling back to mobile')
        return uploadSettings.mobileVideo?.asset?.url || null
      }

      const selectedVideoUrl = isMobile 
        ? uploadSettings.mobileVideo?.asset?.url 
        : uploadSettings.desktopVideo?.asset?.url
      
      // console.log(`🎬 FINAL SELECTION - ${isMobile ? 'MOBILE 📱' : 'DESKTOP 🖥️'} uploaded video:`, selectedVideoUrl)
      return selectedVideoUrl || null
    }

    // 處理 YouTube 模式（默認）
    const activeYoutubeSettings = youtubeSettings || videoSettings // 向後兼容
    
    if (activeYoutubeSettings) {
      const { desktopVideoUrl, mobileVideoUrl, useSameVideo } = activeYoutubeSettings
      
      // console.log('� YouTube mode, VideoSettings breakdown:', {
        // hasDesktopUrl: !!desktopVideoUrl,
        // hasMobileUrl: !!mobileVideoUrl,
        // desktopVideoUrl,
        // mobileVideoUrl,
        // useSameVideo,
        // isMobile,
        // windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'SSR'
      // })
      
      if (useSameVideo) {
        // console.log('🔄 Using same YouTube video for all devices:', desktopVideoUrl)
        return desktopVideoUrl
      }
      
      // 檢查是否有有效的 URL
      if (isMobile && !mobileVideoUrl) {
        // console.warn('⚠️ Mobile device detected but no mobileVideoUrl provided, falling back to desktop')
        return desktopVideoUrl
      }
      
      if (!isMobile && !desktopVideoUrl) {
        // console.warn('⚠️ Desktop device detected but no desktopVideoUrl provided, falling back to mobile')
        return mobileVideoUrl
      }
      
      const selectedUrl = isMobile ? mobileVideoUrl : desktopVideoUrl
      // console.log(`🎬 FINAL SELECTION - ${isMobile ? 'MOBILE 📱' : 'DESKTOP 🖥️'} YouTube URL:`, selectedUrl)
      return selectedUrl
    }
    
    // 向後兼容：使用舊的 videoUrl
    // console.log('🔙 Using fallback videoUrl (no settings):', videoUrl)
    return videoUrl
  }, [videoMode, youtubeSettings, uploadSettings, videoSettings, videoUrl, isMobile])

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
      // console.error('讀取播放時間時發生錯誤:', err)
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  useEffect(() => {
    const currentVideoUrl = getCurrentVideoUrl()
    // console.log('🔄 Processing video URL:', currentVideoUrl, {
      // isMobile,
      // videoMode,
      // isUploadMode,
      // timestamp: new Date().toLocaleTimeString()
    // })
    
    // 先清空狀態以強制重新載入
    setVideoId(null)
    setIsShorts(false)
    setError(null)
    
    if (currentVideoUrl) {
      if (isUploadMode) {
        // 上傳模式：直接使用檔案 URL
        // console.log('✅ Upload mode - using video file URL:', currentVideoUrl)
        setVideoId(currentVideoUrl) // 對於上傳模式，我們直接儲存 URL
        
        // 檢查是否為垂直視頻（基於設定或檔案名稱）
        const isVertical = Boolean(isMobile && uploadSettings?.mobileVideo?.asset?.url === currentVideoUrl)
        setIsShorts(isVertical)
      } else {
        // YouTube 模式：提取 video ID
        const { videoId: id, isShorts: shorts } = extractVideoId(currentVideoUrl)
        // console.log('✅ YouTube mode - Extracted video ID:', id, 'isShorts:', shorts, 'from URL:', currentVideoUrl)
        setVideoId(id)
        setIsShorts(shorts)
        if (!id) {
          setError('無法從 URL 提取有效的 YouTube 影片 ID')
        }
      }
    } else if (isMobile !== null) {
      // 只有在 isMobile 初始化完成後才顯示錯誤
      // console.log('❌ No video URL available after initialization')
      setError('沒有可用的影片 URL')
    }
  }, [getCurrentVideoUrl, extractVideoId, isMobile, videoMode, isUploadMode, uploadSettings])

  // 生成影片源 URL
  const getVideoSrc = () => {
    if (isUploadMode) {
      // 上傳模式：返回當前處理過的影片 URL（儲存在 videoId 中）
      return videoId
    } else {
      // YouTube 模式：使用 YouTube 內建參數來隱藏品牌元素
      // controls=0: 完全隱藏控制項
      // showinfo=0: 隱藏影片資訊  
      // fs=0: 禁用全螢幕按鈕
      // disablekb=1: 禁用鍵盤控制
      // iv_load_policy=3: 隱藏註解
      // cc_load_policy=0: 隱藏字幕
      // modestbranding=1: 移除 YouTube 標誌
      // rel=0: 不顯示相關影片
      // autohide=1: 自動隱藏控制項
      // wmode=transparent: 透明背景
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&fs=0&playsinline=1&rel=0&modestbranding=1&disablekb=1&iv_load_policy=3&cc_load_policy=0&autohide=1&wmode=transparent&start=${timestamp}&enablejsapi=1`
    }
  }

  const videoSrc = getVideoSrc()

  // 除錯資訊
  // console.log('🎬 Video Section render state:', {
    // error,
    // videoId,
    // videoUrl,
    // videoMode,
    // isUploadMode,
    // youtubeSettings,
    // uploadSettings,
    // videoSettings,
    // isMobile,
    // isShorts,
    // videoSrc,
    // isInitialized: isMobile !== null,
    // renderMode: isUploadMode ? 'VIDEO_ELEMENT' : 'YOUTUBE_IFRAME',
    // willRenderVideo: Boolean(isUploadMode && videoId),
    // willRenderIframe: Boolean(!isUploadMode && videoId)
  // })

  // 初始化中
  if (isMobile === null) {
    return (
      <div className="p-4 text-gray-500 text-center">
        <p>正在初始化響應式影片設定...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        <p>{error}</p>
        <p className="text-sm mt-2">Debug: {JSON.stringify({ videoUrl, videoSettings, isMobile, windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'SSR' })}</p>
      </div>
    )
  }

  if (!videoId) {
    return (
      <div className="p-4 text-gray-500 text-center">
        <p>載入影片中...</p>
        <p className="text-sm mt-2">Debug: {JSON.stringify({ videoUrl, videoSettings, isMobile, windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'SSR' })}</p>
      </div>
    )
  }

  const paddingStyle = paddingX ? {
    paddingLeft: `${paddingX / 2}%`,
    paddingRight: `${paddingX / 2}%`
  } : {}

  return (
    <section className={`w-full ${fullWidth ? "" : "container mx-auto px-4"} m-0 p-0`} style={paddingStyle}>
      <div className="max-w-none w-full m-0 p-0">
        {heading && (
          <h2 className="h1 text-center mb-6">{heading}</h2>
        )}
        {/* YouTube Shorts 使用垂直全寬樣式，標準 YouTube 使用 16:9 */}
        <div 
          className={`group relative overflow-hidden m-0 p-0 border-0 outline-0 ${
            isShorts 
              ? "pb-[177.78%] w-full md:max-w-sm md:mx-auto" // 9:16 比例，手機全寬，桌面居中
              : "pb-[56.25%]" // 16:9 比例，標準 YouTube
          }`}
          style={{ lineHeight: 0, fontSize: 0, display: 'block' }}
        >
          {isUploadMode ? (
            // 上傳模式：使用 HTML5 video 元素
            <video
              ref={videoRef}
              key={`video-${videoId}-${isMobile}-${isShorts}`}
              className="absolute top-0 left-0 w-full h-full border-0 outline-0 object-cover block"
              src={videoSrc || undefined}
              autoPlay={isUploadMode ? uploadSettings?.autoplay : youtubeSettings?.autoplay}
              loop={isUploadMode ? uploadSettings?.loop : youtubeSettings?.loop}
              muted={(isUploadMode ? uploadSettings?.muted : youtubeSettings?.muted) !== false} // 預設靜音
              controls={isUploadMode ? uploadSettings?.showControls : youtubeSettings?.showControls}
              playsInline
              preload="metadata"
              style={{
                display: 'block',
                margin: 0,
                padding: 0,
                border: 'none',
                outline: 'none',
                verticalAlign: 'top'
              }}
              onPlay={() => {
                // console.log('🎬 Video started playing')
                setIsPlaying(true)
              }}
              onPause={() => {
                // console.log('⏸️ Video paused')
                setIsPlaying(false)
              }}
              // onLoadStart={() => console.log('📂 Video file loading started')}
              // onLoadedData={() => console.log('✅ Video file loaded successfully')}
              // onError={(e) => console.error('❌ Video error:', e)}
            />
          ) : (
            // YouTube 模式：使用 iframe
            <iframe
              ref={iframeRef}
              key={`iframe-${videoId}-${isMobile}-${isShorts}`} // 當 videoId、isMobile 或 isShorts 改變時重新創建 iframe
              className="absolute top-0 left-0 w-full h-full border-0 outline-0 block"
              src={videoSrc || undefined}
              title={heading || (isShorts ? "YouTube Shorts" : "YouTube video")}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen={false}
              style={{
                display: 'block',
                margin: 0,
                padding: 0,
                border: 'none',
                outline: 'none',
                verticalAlign: 'top'
              }}
            />
          )}
        </div>
        {description && (
          <p className="text-body-large text-center mt-4">{description}</p>
        )}
      </div>
    </section>
  )
}, (prevProps, nextProps) => {
  // 只有當這些屬性改變時才重新渲染
  const videoSettingsEqual = JSON.stringify(prevProps.videoSettings) === JSON.stringify(nextProps.videoSettings)
  
  return (
    prevProps.videoUrl === nextProps.videoUrl &&
    prevProps.heading === nextProps.heading &&
    prevProps.description === nextProps.description &&
    prevProps.fullWidth === nextProps.fullWidth &&
    prevProps.paddingX === nextProps.paddingX &&
    videoSettingsEqual
  )
})

YouTubeSection.displayName = 'YouTubeSection'

export default YouTubeSection