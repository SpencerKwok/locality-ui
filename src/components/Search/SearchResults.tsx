import React from "react";

import ProductImage from "../../common/components/Image/ProductImage";
import Stack from "../../common/components/Stack/Stack";
import { Product } from "../../common/rpc/Schema";

export interface SearchResultsProps extends React.HTMLProps<HTMLDivElement> {
  hits: Array<Product>;
  query: string;
}

function SearchResults(props: SearchResultsProps) {
  return (
    <Stack direction="column" rowAlign="flex-start" style={props.style}>
      <h4>Results for "{props.query}"</h4>
      <Stack direction="row" columnAlign="flex-start" wrap="wrap" spacing={12}>
        {props.hits.map((hit) => {
          return (
            <a
              href={hit.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "black" }}
            >
              <ProductImage
                company={hit.company}
                name={hit.name}
                price={hit.price}
                src={hit.image}
                style={{ maxWidth: 175 }}
              />
            </a>
          );
        })}
      </Stack>
    </Stack>
  );
}

export default SearchResults;
