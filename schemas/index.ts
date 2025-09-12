
import post from './post'
import author from './author'
import category from './category'
import header from './header'
import homePage from './homePage'
import pages from './pages'
import footer from './footer'
import returnPolicy from './returnPolicy'
import grapesJSPageV2 from './grapesJSPageV2'
// import seoMeta from './seoMeta' // No longer needed - SEO fields are now flattened

// Block schemas
import mainBanner from './blocks/mainBanner'
import imageTextBlock from './blocks/imageTextBlock'
import featuredProducts from './blocks/featuredProducts'
import blogSection from './blocks/blogSection'
import youtubeSection from './blocks/youtubeSection'
import contentSection from './blocks/contentSection'
import serviceCardSection from './blocks/serviceCardSection'


export const schemaTypes = [
  // Documents
  homePage,
  pages,
  grapesJSPageV2,
  post,
  author,
  category,
  header,
  footer,
  returnPolicy,

  // Objects
  // seoMeta, // No longer needed - SEO fields are now flattened

  // Blocks
  mainBanner,
  imageTextBlock,
  featuredProducts,
  blogSection,
  youtubeSection,
  contentSection,
  serviceCardSection,

]
