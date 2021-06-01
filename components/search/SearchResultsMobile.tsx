import React, { useEffect } from "react";
import Link from "next/link";

import ProductShowcase from "./ProductShowcase";
import SearchBar from "./SearchBar";
import Stack from "../common/Stack";
import { Product } from "../common/Schema";
import LocalityLogo from "../common/images/LocalityLogo";

export interface SearchResults {
  facets: {
    business: Map<string, number>;
    departments: Map<string, number>;
  };
  hits: Array<Product>;
  nbHits: number;
}

export interface SearchProps {
  loggedIn: boolean;
  query: string;
  searchResults: SearchResults;
  onEnter: (query: string) => void;
  onBottom: () => void;
  onToggleWishList: (objectId: string, value: boolean) => void;
}

export default function Search({
  loggedIn,
  query,
  searchResults,
  onEnter,
  onBottom,
  onToggleWishList,
}: SearchProps) {
  let atBottom = false;

  const resizeObserver = new ResizeObserver(() => {
    atBottom = false;
  });

  const onScroll = () => {
    const pixelsAboveBottom =
      document.body.offsetHeight - window.innerHeight - window.pageYOffset;
    if (!atBottom && pixelsAboveBottom <= 800) {
      atBottom = true;
      onBottom();
    }
  };

  useEffect(() => {
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", onScroll);
    return () => {
      resizeObserver.unobserve(document.body);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <Stack direction="column" rowAlign="center" spacing={12}>
      <Link href="/">
        <div>
          <LocalityLogo
            width={200}
            style={{
              padding: "16px 16px 16px 16px",
              cursor: "pointer",
            }}
          />
        </div>
      </Link>
      <SearchBar autoFocus defaultQuery={query} width={280} onEnter={onEnter} />
      <ProductShowcase
        loggedIn={loggedIn}
        align="center"
        hits={searchResults.hits}
        numEagerLoad={6}
        onToggleWishList={onToggleWishList}
        style={{ marginRight: -12 }}
      />
    </Stack>
  );
}
