import React from "react";

import ProductImage from "../../common/components/Image/ProductImage";
import Stack from "../../common/components/Stack/Stack";
import { Product } from "../../common/rpc/Schema";

export interface SearchResultsProps extends React.HTMLProps<HTMLDivElement> {
  hits: Array<Product>;
  width: number;
}

function SearchResults(props: SearchResultsProps) {
  const itemsPerRow = Math.min(
    Math.floor(props.width / 175),
    props.hits.length
  );
  const rows = [...Array(Math.ceil(props.hits.length / itemsPerRow)).keys()];

  return (
    <Stack
      direction="row"
      columnAlign="center"
      style={{ width: props.width, ...props.style }}
    >
      <Stack direction="column" rowAlign="center">
        {rows.map((value) => {
          return (
            <Stack direction="row" columnAlign="flex-start" spacing={10}>
              {(() => {
                const hits = props.hits.slice(
                  value * itemsPerRow,
                  value * itemsPerRow + itemsPerRow
                );
                const images = hits.map((hit) => {
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
                });
                for (let index = hits.length; index < itemsPerRow; ++index) {
                  images.push(<div style={{ width: 175 }}></div>);
                }
                return images;
              })()}
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}

export default SearchResults;
