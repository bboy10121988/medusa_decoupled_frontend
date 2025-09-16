/**
 * Medusa 類型適配器
 * 解決本地類型與官方 @medusajs/types 的兼容性問題
 */

import type { LocalHttpTypes } from './medusa-local'

// 適配後的 StoreCountry - 將 num_code 轉換為 string
export interface AdaptedStoreCountry extends Omit<LocalHttpTypes.StoreCountry, 'num_code'> {
  num_code: string; // 官方期望 string 類型
}

// 適配後的 StoreRegion - 使用適配的 StoreCountry
export interface AdaptedStoreRegion extends Omit<LocalHttpTypes.StoreRegion, 'countries'> {
  countries?: AdaptedStoreCountry[];
}

// 適配後的 StoreCollection - metadata 可為 null
export interface AdaptedStoreCollection extends Omit<LocalHttpTypes.StoreCollection, 'metadata'> {
  metadata: Record<string, unknown> | null;
}

// 適配後的 StoreProduct - 使用適配的 StoreCollection
export interface AdaptedStoreProduct extends Omit<LocalHttpTypes.StoreProduct, 'collection' | 'metadata'> {
  collection?: AdaptedStoreCollection | null; // 支援 null
  metadata: Record<string, unknown> | null;
}

// 類型轉換工具函數
export const typeAdapters = {
  // StoreCountry 適配器
  adaptStoreCountry(country: LocalHttpTypes.StoreCountry): AdaptedStoreCountry {
    return {
      ...country,
      num_code: country.num_code.toString() // number → string
    };
  },

  // StoreRegion 適配器
  adaptStoreRegion(region: LocalHttpTypes.StoreRegion): AdaptedStoreRegion {
    return {
      ...region,
      countries: region.countries?.map(this.adaptStoreCountry)
    };
  },

  // StoreCollection 適配器
  adaptStoreCollection(collection: LocalHttpTypes.StoreCollection): AdaptedStoreCollection {
    return {
      ...collection,
      metadata: collection.metadata || null // undefined → null
    };
  },

  // StoreProduct 適配器
  adaptStoreProduct(product: LocalHttpTypes.StoreProduct): AdaptedStoreProduct {
    return {
      ...product,
      collection: product.collection ? this.adaptStoreCollection(product.collection) : null,
      metadata: product.metadata || null
    };
  },

  // 批量適配器
  adaptStoreRegions(regions: LocalHttpTypes.StoreRegion[]): AdaptedStoreRegion[] {
    return regions.map(this.adaptStoreRegion.bind(this));
  },

  adaptStoreProducts(products: LocalHttpTypes.StoreProduct[]): AdaptedStoreProduct[] {
    return products.map(this.adaptStoreProduct.bind(this));
  },

  adaptStoreCollections(collections: LocalHttpTypes.StoreCollection[]): AdaptedStoreCollection[] {
    return collections.map(this.adaptStoreCollection.bind(this));
  }
};

// 重新導出適配後的類型，供元件使用
export type {
  AdaptedStoreCountry as StoreCountry,
  AdaptedStoreRegion as StoreRegion, 
  AdaptedStoreCollection as StoreCollection,
  AdaptedStoreProduct as StoreProduct
};
