import { NextResponse } from 'next/server'

type Slide = {
  heading: string
  subheading?: string
  desktopImage?: string
  desktopImageAlt?: string
  mobileImage?: string
  mobileImageAlt?: string
  buttonText?: string
  buttonLink?: string
}

type Settings = {
  autoplay?: boolean
  autoplaySpeed?: number
  showArrows?: boolean
  showDots?: boolean
}

type Payload = {
  slides?: Slide[]
  settings?: Settings
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload
    const slides = Array.isArray(body.slides) ? body.slides : []
    const settings = body.settings || {}

    const current = slides[0] || ({ heading: '', subheading: '', desktopImage: '', mobileImage: '' } as Slide)

    const escapeHtml = (str: string = '') =>
      String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

    // 優先使用桌面版圖片，如果沒有則使用預設背景
    const bgStyle = current.desktopImage
      ? `background-image:url(${escapeHtml(current.desktopImage)});`
      : 'background:linear-gradient(135deg,#3b5bdb 0%,#4263eb 50%,#7048e8 100%);'

    const styles = `
      .gjs-home-hero {position:relative;width:100%;min-height:420px;display:flex;align-items:stretch;justify-content:center;overflow:hidden;border-radius:18px;color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.12);} 
      .gjs-home-hero .module-status {position:absolute;top:16px;left:16px;z-index:3;background:rgba(0,0,0,0.35);padding:6px 12px;border-radius:999px;font-size:11px;letter-spacing:.08em;text-transform:uppercase} 
      .gjs-hero-background {position:absolute;inset:0;background-size:cover;background-position:center;filter:brightness(.85) saturate(1.05);transform:scale(1.01);} 
      .gjs-hero-overlay {position:absolute;inset:0;background:linear-gradient(135deg, rgba(15,23,42,.20), rgba(15,23,42,.45));z-index:1} 
      .gjs-hero-content {position:relative;z-index:2;width:100%;max-width:920px;padding:64px 48px;display:flex;flex-direction:column;gap:16px;align-items:center;justify-content:center;text-align:center} 
      .gjs-hero-eyebrow {display:inline-block;text-transform:uppercase;font-size:12px;letter-spacing:.28em;opacity:.72} 
      .gjs-hero-title {font-size:clamp(36px,6vw,72px);font-weight:600;letter-spacing:-.015em;text-shadow:0 18px 42px rgba(15,23,42,.35);margin:0} 
      .gjs-hero-subtitle {font-size:clamp(16px,2vw,22px);font-weight:300;letter-spacing:.02em;max-width:640px;opacity:.92;margin:0} 
      .gjs-hero-button {display:inline-flex;align-items:center;justify-content:center;padding:14px 32px;border-radius:999px;background:linear-gradient(135deg,#ffd43b,#f76707);color:#1f2a44;font-weight:600;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;box-shadow:0 12px 22px rgba(247,103,7,.35)} 
      .gjs-hero-dots {display:flex;gap:8px;position:absolute;bottom:24px;left:50%;transform:translateX(-50%);z-index:2} 
      .gjs-hero-dot {width:10px;height:10px;border-radius:999px;background:rgba(255,255,255,.35)} 
      .gjs-hero-dot:nth-child(1){background:rgba(255,255,255,.85)} .gjs-hero-dot:nth-child(2){background:rgba(255,255,255,.55)} .gjs-hero-dot:nth-child(3){background:rgba(255,255,255,.25)}
    `

    const html = `
      <style>${styles}</style>
      <div class="gjs-home-hero">
        <div class="module-status">預覽</div>
        <div class="gjs-hero-background" style="${bgStyle}"></div>
        <div class="gjs-hero-overlay"></div>
        <div class="gjs-hero-content">
          <span class="gjs-hero-eyebrow">主橫幅</span>
          <h2 class="gjs-hero-title">${escapeHtml(current.heading || '')}</h2>
          ${current.subheading ? `<p class="gjs-hero-subtitle">${escapeHtml(current.subheading)}</p>` : ''}
          ${current.buttonText && current.buttonLink ? `<a class="gjs-hero-button" href="${escapeHtml(current.buttonLink)}" target="_blank">${escapeHtml(current.buttonText)}</a>` : ''}
        </div>
        ${settings.showDots !== false ? `
        <div class="gjs-hero-dots">
          <span class="gjs-hero-dot"></span>
          <span class="gjs-hero-dot"></span>
          <span class="gjs-hero-dot"></span>
        </div>` : ''}
      </div>
    `

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    return new NextResponse('Invalid payload', { status: 400 })
  }
}
