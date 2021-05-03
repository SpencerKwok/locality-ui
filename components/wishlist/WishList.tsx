import ProductImage from "../common/product-image/ProductImage";
import { Product } from "../common/Schema";
import Stack from "../common/Stack";

export interface WishListProps {
  products: Array<Product>;
  onToggleWishList: (id: string, value: boolean) => void;
}

export default function WishList({
  products,
  onToggleWishList,
}: WishListProps) {
  return (
    <Stack
      direction="column"
      rowAlign="flex-start"
      style={{ padding: "12px 0px 0px 12px" }}
    >
      <h1>My Wish List</h1>
      <Stack direction="row" columnAlign="flex-start" wrap="wrap" spacing={12}>
        {products.map((product) => {
          return (
            <ProductImage
              alwaysHover
              initialWishList
              loggedIn
              key={product.objectId}
              company={product.company}
              link={product.link}
              name={product.name}
              objectId={product.objectId}
              onToggleWishList={onToggleWishList}
              priceRange={product.priceRange}
              src={product.image}
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
}
