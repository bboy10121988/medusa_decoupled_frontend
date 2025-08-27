import { PortableText } from '@portabletext/react'
import Image from 'next/image'

const myPortableTextComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?.url) return null;
      
      return (
        <Image
          src={value.asset.url}
          alt={value.alt || "Blog image"}
          width={800}
          height={600}
          className="w-full h-auto rounded-lg my-4"
          unoptimized
        />
      );
    },
  },
  marks: {
    link: ({ children, value }: any) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
      return (
        <a href={value.href} rel={rel} className="text-blue-600 hover:underline">
          {children}
        </a>
      );
    },
  },
  block: {
    h1: ({ children }: any) => <h1 className="text-3xl font-bold mb-4">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl font-bold mb-3">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-bold mb-2">{children}</h3>,
    h4: ({ children }: any) => <h4 className="text-lg font-bold mb-2">{children}</h4>,
    normal: ({ children }: any) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
    number: ({ children }: any) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => <li className="text-gray-700">{children}</li>,
    number: ({ children }: any) => <li className="text-gray-700">{children}</li>,
  },
}

interface SanityContentProps {
  content: any; // PortableText 內容
  blocks?: any; // 向後兼容
}

export default function SanityContent({ content, blocks }: SanityContentProps) {
  // 向後兼容：如果傳入 blocks，使用它；否則使用 content
  const contentToRender = blocks || content;
  
  if (!contentToRender) {
    return null;
  }

  return <PortableText value={contentToRender} components={myPortableTextComponents} />;
}
