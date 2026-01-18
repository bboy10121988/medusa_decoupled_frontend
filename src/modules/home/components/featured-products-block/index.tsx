import React from "react";
import FeaturedProducts from "../featured-products";
import { HttpTypes } from "@medusajs/types";
import { getTranslation } from "@lib/translations";

type FeaturedProductsBlockProps = {
  collectionId: string;
  collections: HttpTypes.StoreCollection[];
  region: HttpTypes.StoreRegion;
  paddingX?: number;
  countryCode: string;
};

const FeaturedProductsBlock: React.FC<FeaturedProductsBlockProps> = ({
  collectionId,
  collections,
  region,
  paddingX,
  countryCode,
}) => {
  const t = getTranslation(countryCode);
  const featuredTitle = (t as any).featured?.title || '精選商品';

  // console.log("FeaturedProductsBlock - collectionId:", collectionId);
  // console.log("FeaturedProductsBlock - collections:", collections);

  let targetCollection = collections.find((c) => c.id === collectionId);

  if (!targetCollection) {
    targetCollection = collections.find((c) =>
      c.handle === 'featured' ||
      c.handle === 'featuerd' ||
      c.title === featuredTitle ||
      c.title === '精選商品'
    );
  }

  if (!targetCollection) {
    return null;
  }

  return <FeaturedProducts collections={[targetCollection]} region={region} paddingX={paddingX} countryCode={countryCode} />;
};

export default FeaturedProductsBlock;
