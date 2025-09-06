import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'

interface SanityContentProps {
  content?: PortableTextBlock[] | null
}

const components = {
  block: {
    h1: ({children}: {children: React.ReactNode}) => (
      <h1 className="h1 mt-8 mb-4">{children}</h1>
    ),
    h2: ({children}: {children: React.ReactNode}) => (
      <h2 className="h2 mt-6 mb-3">{children}</h2>
    ),
    h3: ({children}: {children: React.ReactNode}) => (
      <h3 className="h3 mt-4 mb-2">{children}</h3>
    ),
    normal: ({children}: {children: React.ReactNode}) => (
      <p className="text-content mb-4">{children}</p>
    ),
    blockquote: ({children}: {children: React.ReactNode}) => (
      <blockquote className="text-content border-l-4 border-gray-300 pl-4 italic my-4">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: (props: any) => {
      const { children, value } = props
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
    strong: ({children}: {children: React.ReactNode}) => (
      <strong className="text-content font-semibold">{children}</strong>
    ),
    em: ({children}: {children: React.ReactNode}) => (
      <em className="text-content italic">{children}</em>
    ),
  },
  list: {
    bullet: ({children}: {children: React.ReactNode}) => (
      <ul className="text-content list-disc list-inside mb-4 space-y-2">{children}</ul>
    ),
    number: ({children}: {children: React.ReactNode}) => (
      <ol className="text-content list-decimal list-inside mb-4 space-y-2">{children}</ol>
    ),
  },
}

export default function SanityContent({ content }: SanityContentProps) {
  if (!content || content.length === 0) {
    return <div className="text-gray-500 italic">無內容可顯示</div>
  }

  return (
    <PortableText
      value={content}
      components={components as any}
    />
  )
}
