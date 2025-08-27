// filepath: /Users/raychou/medusa_0525/frontend/src/app/api/blogs/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@lib/sanity/utils'

export const maxDuration = 10 // 設置函數的最大執行時間為10秒

// 檢查字符串是否包含中文字符
function isChinese(str: string): boolean {
  return /[\u4e00-\u9fa5]/.test(str);
}

// 計算字符串相關性（用於排序結果）
function calculateRelevance(text: string, query: string): number {
  if (!text || !query) return 0;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // 完全匹配得分最高
  if (lowerText === lowerQuery) return 100;
  
  // 包含整個查詢得分次之
  if (lowerText.includes(lowerQuery)) return 80;
  
  // 計算有多少查詢字符出現在文本中
  const queryChars = Array.from(lowerQuery);
  let matchCount = 0;
  
  for (const char of queryChars) {
    if (lowerText.includes(char)) {
      matchCount++;
    }
  }
  
  // 返回匹配百分比
  return (matchCount / queryChars.length) * 60;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  
  if (!query || query.length < 1) {
    // 如果沒有搜尋詞，返回最新文章
    const recentPosts = await fetchRecentPosts()
    return NextResponse.json({ posts: recentPosts })
  }

  try {
    const client = getClient()
    
    // 首先使用原始搜尋詞進行查詢
    // 使用 Sanity 的 GROQ 查詢語言搜尋文章
    let posts = await client.fetch(`
      *[_type == "post" && (
        title match "*${query}*" || 
        pt::text(body) match "*${query}*" ||
        count(categories[]->title[@ match "*${query}*"]) > 0
      )] | order(publishedAt desc) [0...10] {
        _id,
        title,
        "slug": slug.current,
        "image": mainImage.asset->url,
        publishedAt,
        "excerpt": pt::text(excerpt),
        "bodyText": pt::text(body),
        "categories": categories[]->title
      }
    `)

    console.log(`找到 ${posts.length} 篇文章匹配查詢: "${query}"`);
    
    // 對搜尋結果進行二次過濾，確保真正匹配關鍵字
    if (posts.length > 0) {
      const filteredPosts = posts.filter((post: any) => {
        const title = (post.title || '').toLowerCase();
        const bodyText = (post.bodyText || '').toLowerCase();
        const categories = (post.categories || []).join(' ').toLowerCase();
        const lowerQuery = query.toLowerCase();
        
        // 檢查是否真的包含關鍵字
        return title.includes(lowerQuery) || 
               bodyText.includes(lowerQuery) || 
               categories.includes(lowerQuery);
      });
      
      console.log(`二次過濾後剩餘 ${filteredPosts.length} 篇文章`);
      posts = filteredPosts;
    }
    
    // 如果沒有找到結果，而且是中文搜尋詞，嘗試按字符拆分搜尋
    if (posts.length === 0 && isChinese(query)) {
      console.log('沒有找到匹配的中文文章，嘗試拆分搜尋');
      
      // 將中文查詢拆分為單個字符
      const characters = Array.from(query);
      
      // 構建更寬鬆的搜尋條件
      let searchConditions = characters
        .filter(char => isChinese(char))
        .map(char => `title match "*${char}*" || pt::text(body) match "*${char}*"`)
        .join(' || ');
      
      if (searchConditions) {
        // 使用拆分的字符進行搜尋
        let splitResults = await client.fetch(`
          *[_type == "post" && (${searchConditions})] | order(publishedAt desc) [0...10] {
            _id,
            title,
            "slug": slug.current,
            "image": mainImage.asset->url,
            publishedAt,
            "excerpt": pt::text(excerpt),
            "bodyText": pt::text(body),
            "categories": categories[]->title
          }
        `);
        
        // 對拆分搜尋結果也進行過濾
        splitResults = splitResults.filter((post: any) => {
          const title = (post.title || '').toLowerCase();
          const bodyText = (post.bodyText || '').toLowerCase();
          const categories = (post.categories || []).join(' ').toLowerCase();
          
          // 檢查是否包含查詢中的任一字符
          return characters.some(char => 
            title.includes(char.toLowerCase()) || 
            bodyText.includes(char.toLowerCase()) ||
            categories.includes(char.toLowerCase())
          );
        });
        
        // 根據標題與原始查詢的相關性對結果進行排序
        splitResults.sort((a: any, b: any) => {
          const aRelevance = calculateRelevance(a.title, query) + calculateRelevance(a.bodyText || '', query) * 0.5;
          const bRelevance = calculateRelevance(b.title, query) + calculateRelevance(b.bodyText || '', query) * 0.5;
          return bRelevance - aRelevance;
        });
        
        posts = splitResults;
        console.log(`拆分搜尋找到 ${posts.length} 篇文章`);
      }
    }

    // 將 Sanity _id 映射到 id 屬性，確保與前端元件期望的格式一致
    const formattedPosts = posts.map((post: any) => {
      // 從內文中提取匹配關鍵字的片段作為搜尋結果摘要
      let searchSnippet = '';
      const bodyText = post.bodyText || '';
      const excerpt = post.excerpt || '';
      
      // 優先使用摘要
      if (excerpt) {
        searchSnippet = excerpt;
      } 
      // 如果沒有摘要但有內文，從內文提取片段
      else if (bodyText) {
        // 嘗試找出包含關鍵字的片段
        const lowerBodyText = bodyText.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const keywordIndex = lowerBodyText.indexOf(lowerQuery);
        
        if (keywordIndex >= 0) {
          // 提取關鍵字前後的文字（前50個字符，後100個字符）
          const startIndex = Math.max(0, keywordIndex - 50);
          const endIndex = Math.min(bodyText.length, keywordIndex + lowerQuery.length + 100);
          searchSnippet = bodyText.slice(startIndex, endIndex);
          
          // 如果不是從頭開始，則加上省略號
          if (startIndex > 0) {
            searchSnippet = '...' + searchSnippet;
          }
          
          // 如果不是到結尾結束，則加上省略號
          if (endIndex < bodyText.length) {
            searchSnippet = searchSnippet + '...';
          }
        } else {
          // 如果在內文中找不到精確匹配，則使用前150個字符
          searchSnippet = bodyText.slice(0, 150) + (bodyText.length > 150 ? '...' : '');
        }
      }
      
      return {
        id: post._id,
        title: post.title,
        slug: post.slug,
        image: post.image,
        publishedAt: post.publishedAt,
        excerpt: searchSnippet,  // 提供優化後的摘要
        bodyText: post.bodyText,  // 加入 bodyText 以便前端可以靈活使用
        categories: post.categories || []  // 提供分類標籤
      };
    })

    // 如果沒有找到匹配的文章，則獲取最新文章
    if (formattedPosts.length === 0) {
      console.log('沒有找到匹配的文章，獲取最新文章')
      const recentPosts = await fetchRecentPosts()
      return NextResponse.json({ posts: recentPosts })
    }

    return NextResponse.json({ posts: formattedPosts })
  } catch (error) {
    console.error('搜尋部落格文章時出錯:', error)
    // 發生錯誤時，返回最新文章
    const recentPosts = await fetchRecentPosts()
    return NextResponse.json({
      message: '搜尋部落格文章時出錯，顯示最新文章',
      posts: recentPosts
    })
  }
}

// 獲取最新文章（當沒有匹配關鍵字時使用）
async function fetchRecentPosts() {
  try {
    const client = getClient()
    
    // 查詢最新發布的2篇文章（當無匹配關鍵字時顯示）
    const recentPosts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) [0...2] {
        _id,
        title,
        "slug": slug.current,
        "image": mainImage.asset->url,
        publishedAt,
        "excerpt": pt::text(excerpt),
        "bodyText": pt::text(body),
        "categories": categories[]->title
      }
    `)

    // 格式化文章數據
    return recentPosts.map((post: any) => ({
      id: post._id,
      title: post.title,
      slug: post.slug,
      image: post.image,
      publishedAt: post.publishedAt,
      excerpt: post.excerpt || (post.bodyText ? post.bodyText.substring(0, 150) + '...' : '這篇文章沒有摘要...'),
      bodyText: post.bodyText,
      categories: post.categories || []
    }))
  } catch (error) {
    console.error('獲取最新文章時出錯:', error)
    return [] // 發生錯誤時返回空數組
  }
}
