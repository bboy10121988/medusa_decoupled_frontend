"use client"

import { PortableText } from '@portabletext/react'
import type { PortableTextReactComponents } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'

interface ContentSectionProps {
  heading?: string
  content: PortableTextBlock[]
}

// 定義用於 PortableText 渲染的組件
const components: Partial<PortableTextReactComponents> = {
  block: {
    h1: ({children}) => (
      <h1 className="h1 mb-4">{children}</h1>
    ),
    h2: ({children}) => (
      <h2 className="h2 mb-3">{children}</h2>
    ),
    h3: ({children}) => (
      <h3 className="h3 mb-2">{children}</h3>
    ),
    normal: ({children}) => (
      <p className="text-content mb-4">{children}</p>
    ),
    blockquote: ({children}) => (
      <blockquote className="text-content border-l-4 border-gray-300 pl-4 italic my-4">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({children}) => (
      <ul className="text-content list-disc list-inside mb-4 space-y-2">{children}</ul>
    ),
    number: ({children}) => (
      <ol className="text-content list-decimal list-inside mb-4 space-y-2">{children}</ol>
    ),
  },
  marks: {
    strong: ({children}) => (
      <strong className="text-content font-semibold">{children}</strong>
    ),
    em: ({children}) => (
      <em className="text-content italic">{children}</em>
    ),
    link: ({children, value}) => {
      const rel = !value?.href?.startsWith('/') ? 'noreferrer noopener' : undefined
      return (
        <a 
          href={value?.href}
          rel={rel}
          className="text-content text-blue-600 hover:underline"
        >
          {children}
        </a>
      )
    },
  },
}

const ContentSection = ({ heading, content }: ContentSectionProps) => {
  return (
    <div className={heading ? "py-8 md:py-12" : "py-6"}>
      <div className="content-container">
        {heading && <h2 className="h1 mb-6">{heading}</h2>}
        <div className="text-content">
          <PortableText value={content} components={components} />
        </div>
      </div>
    </div>
  )
}

export default ContentSection
