import { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";

import { Product } from "common/Schema";
import ProductImage from "components/common/product-image/ProductImage";
import Stack, { StackAlignment } from "components/common/Stack";
import styles from "components/search/ProductShowcase.module.css";

import type { FC } from "react";

type SortFilter =
  | "Alphabetical: A-Z"
  | "Alphabetical: Z-A"
  | "Price: High to Low"
  | "Price: Low to High"
  | "Relevancy";

export interface ProductShowcaseProps extends React.HTMLProps<HTMLDivElement> {
  hits: Array<Product>;
  numEagerLoad: number;
  onToggleWishList: (objectId: string, value: boolean) => void;
  align?: StackAlignment;
  loggedIn?: boolean;
  query?: string;
}

const allSortFilters: Array<SortFilter> = [
  "Relevancy",
  "Price: Low to High",
  "Price: High to Low",
  "Alphabetical: A-Z",
  "Alphabetical: Z-A",
];

const ProductShowcase: FC<ProductShowcaseProps> = ({
  hits,
  numEagerLoad,
  onToggleWishList,
  align,
  loggedIn,
  query,
  style,
}) => {
  const [sortFilter, setSortFilter] = useState<SortFilter>("Relevancy");

  const sortedHits = hits.map((a) => ({ ...a }));
  if (sortFilter === "Price: Low to High") {
    sortedHits.sort((a, b) => a.priceRange[0] - b.priceRange[0]);
  } else if (sortFilter === "Price: High to Low") {
    sortedHits.sort((a, b) => b.priceRange[1] - a.priceRange[1]);
  } else if (sortFilter === "Alphabetical: A-Z") {
    sortedHits.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortFilter === "Alphabetical: Z-A") {
    sortedHits.sort((a, b) => b.name.localeCompare(a.name));
  }

  return (
    <Stack direction="column" rowAlign={align ?? "flex-start"} style={style}>
      {(query ?? "") && (
        <Stack
          direction="row"
          columnAlign="flex-start"
          rowAlign="center"
          priority={[0, 0]}
          wrap="wrap"
        >
          <h4 style={{ paddingRight: 24 }}>
            Results for "{decodeURIComponent(query ?? "")}"
          </h4>
          <Dropdown style={{ marginBottom: ".5rem", lineHeight: 1.2 }}>
            <Dropdown.Toggle
              className={styles["sort-filter"]}
              variant="primary"
            >
              {`Sort by: ${sortFilter}`}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {allSortFilters
                .filter((value) => value !== sortFilter)
                .map((value) => (
                  <Dropdown.Item
                    key={value}
                    onClick={(): void => {
                      setSortFilter(value);
                    }}
                  >
                    {value}
                  </Dropdown.Item>
                ))}
            </Dropdown.Menu>
          </Dropdown>
        </Stack>
      )}
      <Stack
        direction="row"
        columnAlign={align ?? "flex-start"}
        wrap="wrap"
        spacing={12}
      >
        {sortedHits.map((hit, index) => (
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
