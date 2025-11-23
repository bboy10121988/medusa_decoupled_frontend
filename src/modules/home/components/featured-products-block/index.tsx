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

  const featuredCollections = collections.filter(
    (collection) => collection.id === collectionId
  );

  if (featuredCollections.length === 0) {
    return null;
  }

  return <FeaturedProducts collections={featuredCollections} region={region} paddingX={paddingX} />;
};

export default FeaturedProductsBlock;
