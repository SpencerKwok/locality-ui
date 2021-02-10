import React, { useEffect, useState } from "react";

import SearchBar from "./SearchBar";
import SearchDAO from "./SearchDAO";
import SearchResults, { Product } from "./SearchResults";
import Stack from "../Stack/Stack";
import Window from "../../utils/window";
import { useHistory } from "react-router-dom";

export interface SearchProps extends React.HTMLProps<HTMLDivElement> {
  query?: string;
}

function Search(props: SearchProps) {
  const windowSize = Window();
  const history = useHistory();
  const [query, setQuery] = useState(props.query || "");
  const [hits, setHits] = useState<Array<Product>>([
    /*
    {
      company: "Cantiq Living",
      img: "/products/cantiq-living/jacquie-sling-bag.webp",
      link: "",
      price: 90,
      product: "Jacquie Sling Bag",
    },
    */
  ]);

  useEffect(() => {
    if (props.query) {
      SearchDAO.getInstance()
        .search({ query: props.query })
        .then(({ hits }) => {
          setHits(hits);
        });
    }
  }, [props.query]);

  const searchBarOnChange = (e: React.FormEvent<HTMLInputElement>) => {
    setQuery((e.target as HTMLInputElement).value);
  };

  const searchBarOnEnter = () => {
    if (query === "" || props.query === query) {
      return;
    }
    history.push("/search?q=" + query);
  };

  return (
    <Stack direction="horizontal" columnAlign="center" style={props.style}>
      <Stack direction="vertical" rowAlign="center">
        <SearchBar
          onChange={searchBarOnChange}
          onEnter={searchBarOnEnter}
          width={Math.max(windowSize.width * 0.3, 225)}
          value={query}
          autoFocus
        />
        <SearchResults hits={hits} style={{ marginTop: "12px" }} />
      </Stack>
    </Stack>
  );
}

export default Search;
