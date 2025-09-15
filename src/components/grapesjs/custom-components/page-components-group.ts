/**
 * Page Components Group
 * 管理所有從 page.tsx 遷移到 GrapesJS 的組件
 */

import PageHeroSection from './page-hero-section';
import PageServiceCards from './page-service-cards';

// 頁面組件介面
export interface PageComponent {
  name: string;
  displayName: string;
  register: (editor: any) => void;
  description: string;
  category: 'page-sections' | 'content' | 'layout' | 'media';
  originalPath: string;
  dataSource: 'sanity' | 'static' | 'api' | 'none';
}

// 所有頁面組件
export const pageComponents: PageComponent[] = [
  {
    name: 'page-hero-section',
    displayName: 'Hero Section',
    register: PageHeroSection,
    description: '主要橫幅區塊 - 包含標題、描述、CTA 按鈕和背景圖片',
    category: 'page-sections',
    originalPath: 'src/app/(main)/page.tsx > HeroSection',
    dataSource: 'sanity'
  },
  {
    name: 'page-service-cards',
    displayName: 'Service Cards',
    register: PageServiceCards,
    description: '服務卡片區塊 - 展示服務項目，包含圖標、標題、描述和連結',
    category: 'page-sections',
    originalPath: 'src/app/(main)/page.tsx > ServiceCardsSection',
    dataSource: 'static'
  }
  // 未來將添加的組件:
  // {
  //   name: 'page-image-text-block',
  //   displayName: 'Image Text Block',
  //   register: PageImageTextBlock,
  //   description: '圖文並茂區塊 - 圖片與文字內容的組合展示',
  //   category: 'page-sections',
  //   originalPath: 'src/app/(main)/page.tsx > ImageTextBlock',
  //   dataSource: 'sanity'
  // },
  // {
  //   name: 'page-featured-products',
  //   displayName: 'Featured Products',
  //   register: PageFeaturedProducts,
  //   description: '精選商品區塊 - 展示推薦商品',
  //   category: 'page-sections',
  //   originalPath: 'src/app/(main)/page.tsx > FeaturedProducts',
  //   dataSource: 'api'
  // },
  // {
  //   name: 'page-blog-posts',
  //   displayName: 'Blog Posts',
  //   register: PageBlogPosts,
  //   description: '部落格文章區塊 - 展示最新文章',
  //   category: 'page-sections',
  //   originalPath: 'src/app/(main)/page.tsx > BlogPosts',
  //   dataSource: 'sanity'
  // },
  // {
  //   name: 'page-youtube-section',
  //   displayName: 'YouTube Section',
  //   register: PageYoutubeSection,
  //   description: 'YouTube 影片區塊 - 嵌入 YouTube 影片',
  //   category: 'media',
  //   originalPath: 'src/app/(main)/page.tsx > YoutubeSection',
  //   dataSource: 'sanity'
  // },
  // {
  //   name: 'page-content-section',
  //   displayName: 'Content Section',
  //   register: PageContentSection,
  //   description: '內容區塊 - 自定義內容展示',
  //   category: 'content',
  //   originalPath: 'src/app/(main)/page.tsx > ContentSection',
  //   dataSource: 'sanity'
  // }
];

/**
 * 註冊所有 Page 組件到 GrapesJS
 * @param editor GrapesJS 編輯器實例
 */
export const registerPageComponents = (editor: any) => {
  console.log('📄 註冊 Page 組件群組...');
  
  // 創建 Page Sections 區塊分類
  const blockManager = editor.BlockManager;
  
  // 檢查是否已存在 page-sections 分類
  const existingCategory = blockManager.getCategories().find((cat: any) => cat.id === 'page-sections');
  if (!existingCategory) {
    blockManager.add('page-sections-category', {
      label: '頁面區塊',
      category: 'page-sections',
      open: true
    });
  }
  
  pageComponents.forEach((component) => {
    try {
      component.register(editor);
      console.log(`✅ 已註冊 Page 組件: ${component.name}`);
    } catch (error) {
      console.error(`❌ 註冊 Page 組件失敗 ${component.name}:`, error);
    }
  });
  
  console.log(`🎯 共註冊了 ${pageComponents.length} 個 Page 組件`);
};

/**
 * 取得 Page 組件清單
 */
export const getPageComponentsList = () => {
  return pageComponents.map(component => ({
    name: component.name,
    description: component.description || 'No description provided',
    category: component.category,
    originalPath: component.originalPath,
    dataSource: component.dataSource
  }));
};

/**
 * 檢查 Page 組件是否已註冊
 */
export const isPageComponentRegistered = (componentName: string): boolean => {
  return pageComponents.some(component => component.name === componentName);
};

/**
 * 根據資料來源篩選 Page 組件
 */
export const getPageComponentsByDataSource = (dataSource: string) => {
  return pageComponents.filter(component => component.dataSource === dataSource);
};

export default registerPageComponents;