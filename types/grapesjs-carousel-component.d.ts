// Type definitions for grapesjs-carousel-component
declare module 'grapesjs-carousel-component' {
  import { Plugin } from 'grapesjs';
  
  interface CarouselOptions {
    // Carousel 插件配置選項
    blockName?: string;
    blockCategory?: string;
    blockLabel?: string;
    // Splide.js 相關配置
    splideOptions?: {
      type?: string;
      perPage?: number;
      autoplay?: boolean;
      interval?: number;
    };
  }
  
  const plugin: Plugin<CarouselOptions>;
  export default plugin;
}