import React from "react";

import Image from "../Image/Image";
import Stack from "../Stack/Stack";
import Window from "../../utils/window";

export interface Product {
  company: string;
  img: string;
  link: string;
  price: number;
  product: string;
}

export interface SearchResultsProps extends React.HTMLProps<HTMLDivElement> {
  hits: Array<Product>;
}

function SearchResults(props: SearchResultsProps) {
  const windowSize = Window();

  return (
    <div style={{ width: windowSize.width * 0.9, ...props.style }}>
      <Stack direction="horizontal" wrap="wrap" spacing={10}>
        {props.hits.map((hit) => {
          return (
            <a
              href={hit.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", color: "black" }}
            >
              <Image
                company={hit.company}
                name={hit.product}
                price={hit.price}
                src={hit.img}
                width={175}
              />
            </a>
          );
        })}
      </Stack>
    </div>
  );
}

export default SearchResults;
