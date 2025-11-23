import React from "react";
import FeaturedProducts from "../featured-products";
import { HttpTypes } from "@medusajs/types";

type FeaturedProductsBlockProps = {
  collectionId: string;
  collections: HttpTypes.StoreCollection[];
  region: HttpTypes.StoreRegion;
  paddingX?: number;
};

const FeaturedProductsBlock: React.FC<FeaturedProductsBlockProps> = ({
  collectionId,
  collections,
  region,
  paddingX,
}) => {
  // console.log("FeaturedProductsBlock - collectionId:", collectionId);
  // console.log("FeaturedProductsBlock - collections:", collections);

  let targetCollection = collections.find((c) => c.id === collectionId);

  if (!targetCollection) {
      targetCollection = collections.find((c) => 
        c.handle === 'featured' || 
        c.handle === 'featuerd' || 
        c.title === '精選商品'
      );
  }

  if (!targetCollection) {
    return null;
  }

  return <FeaturedProducts collections={[targetCollection]} region={region} paddingX={paddingX} />;
};

export default FeaturedProductsBlock;
