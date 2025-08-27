
import post from './post'
import author from './author'
import category from './category'
import header from './header'
import homePage from './homePage'
import pages from './pages'
import footer from './footer'
import returnPolicy from './returnPolicy'
import seoMeta from './seoMeta'

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
  post,
  author,
  category,
  header,
  footer,
  returnPolicy,

  // Objects
  seoMeta,

  // Blocks
  mainBanner,
  imageTextBlock,
  featuredProducts,
  blogSection,
  youtubeSection,
  contentSection,
  serviceCardSection,

]
