import React, { useEffect } from "react";
import Link from "next/link";

import ProductShowcase from "./ProductShowcase";
import SearchBar from "./SearchBar";
import Stack from "components/common/Stack";
import { Product } from "common/Schema";
import LocalityLogo from "components/common/images/LocalityLogo";
import ThemeContext from "components/common/Theme";

import type { FC } from "react";

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
  uniqueHits: Set<string>;
  onEnter: (query: string) => void;
  onProductClick: (objectId: string) => void;
  onProductView: (objectId: string, offsetTop: number) => void;
  onBottom: () => void;
  onToggleWishList: (objectId: string, value: boolean) => void;
}

const Search: FC<SearchProps> = ({
  loggedIn,
  query,
  searchResults,
  uniqueHits,
  onEnter,
  onProductClick,
  onProductView,
  onBottom,
  onToggleWishList,
}) => {
  let atBottom = false;

  const resizeObserver = new ResizeObserver(() => {
    atBottom = false;
  });

  const onScroll = (): void => {
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
    return (): void => {
      resizeObserver.unobserve(document.body);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <ThemeContext.Consumer>
      {(): JSX.Element => (
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
          <SearchBar
            autoFocus
            defaultQuery={query}
            width={280}
            onEnter={onEnter}
          />
          <ProductShowcase
            loggedIn={loggedIn}
            align="center"
            hits={searchResults.hits}
            numEagerLoad={6}
            uniqueHits={uniqueHits}
            onToggleWishList={onToggleWishList}
            onProductClick={onProductClick}
            onProductView={onProductView}
            style={{ marginRight: -12 }}
          />
        </Stack>
      )}
    </ThemeContext.Consumer>
  );
};

export default Search;
