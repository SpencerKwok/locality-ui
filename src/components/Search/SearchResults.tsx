import React from "react";

import Image from "../Image/Image";
import Stack from "../Stack/Stack";
import Window from "../../utils/window";

export interface Product {
  company: string;
  img: string;
  price: number;
  product: string;
}

export interface SearchResultsProps extends React.HTMLProps<HTMLDivElement> {
  hits: Array<Product>;
}

function SearchResults(props: SearchResultsProps) {
  const windowSize = Window();

  return (
    <div style={{ width: windowSize.width * 0.9 }}>
      <Stack direction="horizontal" wrap="wrap" spacing={10}>
        {props.hits.map((hit) => {
          return (
            <Image
              company={hit.company}
              name={hit.product}
              price={hit.price}
              src={hit.img}
              width={175}
            />
          );
        })}
      </Stack>
    </div>
  );
}

export default SearchResults;
