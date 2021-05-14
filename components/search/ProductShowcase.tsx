import { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";

import { Product } from "../common/Schema";
import ProductImage from "../common/product-image/ProductImage";
import Stack, { StackAlignment } from "../common/Stack";
import styles from "./ProductShowcase.module.css";

type SortFilter =
  | "Relevancy"
  | "Price: Low to High"
  | "Price: High to Low"
  | "Alphabetical: A-Z"
  | "Alphabetical: Z-A";

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

export default function ProductShowcase({
  hits,
  numEagerLoad,
  onToggleWishList,
  align,
  loggedIn,
  query,
  style,
}: ProductShowcaseProps) {
  const [sortFilter, setSortFilter] = useState<SortFilter>("Relevancy");

  const sortedHits = hits.map((a) => ({ ...a }));
  if (sortFilter === "Price: Low to High") {
    sortedHits.sort((a, b) => a.price - b.price);
  } else if (sortFilter === "Price: High to Low") {
    sortedHits.sort((a, b) => b.price - a.price);
  } else if (sortFilter === "Alphabetical: A-Z") {
    sortedHits.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortFilter === "Alphabetical: Z-A") {
    sortedHits.sort((a, b) => b.name.localeCompare(a.name));
  }

  return (
    <Stack direction="column" rowAlign={align || "flex-start"} style={style}>
      {query && (
        <Stack
          direction="row"
          columnAlign="flex-start"
          rowAlign="center"
          priority={[0, 0]}
          wrap="wrap"
        >
          <h4 style={{ paddingRight: 24 }}>Results for "{query}"</h4>
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
                    onClick={() => setSortFilter(value)}
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
        columnAlign={align || "flex-start"}
        wrap="wrap"
        spacing={12}
      >
        {hits.map((hit, index) => (
          <ProductImage
            loggedIn={loggedIn}
            initialWishList={hit.wishlist}
            loading={index < numEagerLoad ? "eager" : "lazy"}
            key={hit.objectId}
            company={hit.company}
            link={hit.link}
            name={hit.name}
            objectId={hit.objectId}
            onToggleWishList={onToggleWishList}
            priceRange={hit.priceRange}
            src={hit.image}
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
}
