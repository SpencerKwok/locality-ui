import { useEffect } from "react";
import { Product } from "common/Schema";
import ProductImage from "components/common/product-image/ProductImage";
import Stack, { StackAlignment } from "components/common/Stack";

import type { FC } from "react";
import type { ProductImageProps } from "components/common/product-image/ProductImage";

export interface ProductShowcaseProps extends React.HTMLProps<HTMLDivElement> {
  hits: Array<Product>;
  numEagerLoad: number;
  uniqueHits: Set<string>;
  onToggleWishList: (objectId: string, value: boolean) => void;
  onProductClick: (objectId: string) => void;
  onProductView: (objectId: string, offsetTop: number) => void;
  align?: StackAlignment;
  loggedIn?: boolean;
  query?: string;
}

const ProductShowcase: FC<ProductShowcaseProps> = ({
  hits,
  numEagerLoad,
  onToggleWishList,
  onProductClick,
  onProductView,
  align,
  loggedIn,
  uniqueHits,
  style,
}) => {
  const hitImages = hits.map((hit, index) => (
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
      onProductClick={onProductClick}
      priceRange={hit.priceRange}
      variantImages={hit.variantImages}
      variantIndex={hit.variantIndex}
      style={{
        maxWidth: 175,
        marginBottom: 12,
        marginRight: index === hits.length - 1 ? 12 : 0,
      }}
    />
  ));

  const updateUniqueHits = (): void => {
    hitImages.forEach((value: { props: ProductImageProps }) => {
      const { props } = value;
      const { objectId } = props;

      if (uniqueHits.has(objectId)) {
        return;
      }

      const elem = document.getElementById(objectId);
      if (!elem) {
        return;
      }

      const height =
        window.innerHeight || document.documentElement.clientHeight;
      const width = window.innerWidth || document.documentElement.clientWidth;
      const box = elem.getBoundingClientRect();
      if (
        box.top >= 0 &&
        box.left >= 0 &&
        box.right <= width &&
        box.bottom <= height
      ) {
        uniqueHits.add(objectId);
        onProductView(objectId, elem.offsetTop);
      }
    });
  };

  useEffect(() => {
    window.addEventListener("load", updateUniqueHits);
    window.addEventListener("scroll", updateUniqueHits);
    window.addEventListener("resize", updateUniqueHits);
    return (): void => {
      window.removeEventListener("load", updateUniqueHits);
      window.removeEventListener("scroll", updateUniqueHits);
      window.removeEventListener("resize", updateUniqueHits);
    };
  }, [hits, uniqueHits]);

  return (
    <Stack direction="column" rowAlign={align ?? "flex-start"} style={style}>
      <Stack
        direction="row"
        columnAlign={align ?? "flex-start"}
        wrap="wrap"
        spacing={12}
      >
        {hitImages.map((hit) => hit)}
      </Stack>
    </Stack>
  );
};

export default ProductShowcase;
