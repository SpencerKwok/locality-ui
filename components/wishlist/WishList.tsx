import ProductImage from "components/common/product-image/ProductImage";
import { Product } from "common/Schema";
import Stack from "components/common/Stack";

import type { FC, ReactElement } from "react";
import type { ProductImageProps } from "components/common/product-image/ProductImage";

export interface WishListProps {
  products: Array<Product>;
  onToggleWishList: (id: string, value: boolean) => void;
}

const WishList: FC<WishListProps> = ({ products, onToggleWishList }) => {
  return (
    <Stack
      direction="column"
      rowAlign="flex-start"
      style={{ padding: "12px 0px 0px 12px" }}
    >
      <h1>My Wish List</h1>
      <Stack direction="row" columnAlign="flex-start" wrap="wrap" spacing={12}>
        {products.map((product): ReactElement<ProductImageProps> => {
          return (
            <ProductImage
              alwaysHover
              initialWishList
              loggedIn
              key={product.objectId}
              business={product.business}
              link={product.link}
              name={product.name}
              objectId={product.objectId}
              onToggleWishList={onToggleWishList}
              priceRange={product.priceRange}
              variantImages={product.variantImages}
              variantIndex={product.variantIndex}
              style={{
                maxWidth: 175,
                marginBottom: 12,
              }}
            />
          );
        })}
      </Stack>
    </Stack>
  );
};

export default WishList;
