import React, { useState } from "react";
import styled from "styled-components";
import { Dropdown } from "react-bootstrap";

import ProductImage from "../../common/components/Image/ProductImage/ProductImage";
import Stack from "../../common/components/Stack/Stack";
import { Product } from "../../common/rpc/Schema";

type SortFilter =
  | "Relevancy"
  | "Price: Low to High"
  | "Price: High to Low"
  | "Alphabetical: A-Z"
  | "Alphabetical: Z-A";

export interface SearchResultsProps extends React.HTMLProps<HTMLDivElement> {
  hits: Array<Product>;
  query: string;
}

const allSortFilters: Array<SortFilter> = [
  "Relevancy",
  "Price: Low to High",
  "Price: High to Low",
  "Alphabetical: A-Z",
  "Alphabetical: Z-A",
];

const SortFilter = styled(Dropdown.Toggle)`
  padding: 6px 12px 6px 12px;
  background-color: #449ed7 !important;
  border-color: #449ed7 !important;
  &:hover {
    background-color: #3880ae !important;
    border-color: #3880ae !important;
  }
  &:active {
    background-color: #3880ae !important;
    border-color: #3880ae !important;
  }
`;

function SearchResults(props: SearchResultsProps) {
  const [sortFilter, setSortFilter] = useState<SortFilter>("Relevancy");

  const hits = props.hits.map((a) => ({ ...a }));
  if (sortFilter === "Price: Low to High") {
    hits.sort((a, b) => a.price - b.price);
  } else if (sortFilter === "Price: High to Low") {
    hits.sort((a, b) => b.price - a.price);
  } else if (sortFilter === "Alphabetical: A-Z") {
    hits.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortFilter === "Alphabetical: Z-A") {
    hits.sort((a, b) => b.name.localeCompare(a.name));
  }

  return (
    <Stack direction="column" rowAlign="flex-start" style={props.style}>
      <Stack
        direction="row"
        columnAlign="flex-start"
        rowAlign="center"
        priority={[0, 0]}
        wrap="wrap"
      >
        <h4 style={{ paddingRight: 24 }}>Results for "{props.query}"</h4>
        <Dropdown style={{ marginBottom: ".5rem", lineHeight: 1.2 }}>
          <SortFilter
            variant="primary"
            id="dropdown-basic"
            style={{ padding: "6px 12px 6px 12px" }}
          >
            {`Sort by: ${sortFilter}`}
          </SortFilter>
          <Dropdown.Menu>
            {allSortFilters
              .filter((value) => value !== sortFilter)
              .map((value) => (
                <Dropdown.Item onClick={() => setSortFilter(value)}>
                  {value}
                </Dropdown.Item>
              ))}
          </Dropdown.Menu>
        </Dropdown>
      </Stack>
      <Stack direction="row" columnAlign="flex-start" wrap="wrap" spacing={12}>
        {hits.map((hit) => {
          return (
            <ProductImage
              company={hit.company}
              link={hit.link}
              name={hit.name}
              objectId={hit.objectID}
              priceRange={hit.priceRange}
              src={hit.image}
              style={{ maxWidth: 175, marginBottom: 12 }}
              wishlist={hit.wishlist}
            />
          );
        })}
      </Stack>
    </Stack>
  );
}

export default SearchResults;
