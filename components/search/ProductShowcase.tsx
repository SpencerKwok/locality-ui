import { Product } from "common/Schema";
import ProductImage from "components/common/product-image/ProductImage";
import Stack, { StackAlignment } from "components/common/Stack";

import type { FC } from "react";

export interface ProductShowcaseProps extends React.HTMLProps<HTMLDivElement> {
  hits: Array<Product>;
  numEagerLoad: number;
  onToggleWishList: (objectId: string, value: boolean) => void;
  align?: StackAlignment;
  loggedIn?: boolean;
  query?: string;
}

const ProductShowcase: FC<ProductShowcaseProps> = ({
  hits,
  numEagerLoad,
  onToggleWishList,
  align,
  loggedIn,
  style,
}) => {
  return (
    <Stack direction="column" rowAlign={align ?? "flex-start"} style={style}>
      <Stack
        direction="row"
        columnAlign={align ?? "flex-start"}
        wrap="wrap"
        spacing={12}
      >
        {hits.map((hit, index) => (
          <ProductImage
            business={hit.business}
            initialWishList={hit.wishlist}
            key={hit.objectId}
            link={hit.link}
            loggedIn={loggedIn}
            loading={index < numEagerLoad ? "eager" : "lazy"}
            name={hit.name}
            objectId={hit.objectId}
            onToggleWishList={onToggleWishList}
            priceRange={hit.priceRange}
            variantImages={hit.variantImages}
            variantIndex={hit.variantIndex}
            style={{
              maxWidth: 175,
              marginBottom: 12,
              marginRight: index === hits.length - 1 ? 12 : 0,
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export default ProductShowcase;
