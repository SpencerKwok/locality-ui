import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

import SearchBar from "./SearchBar";
import Stack from "../common/Stack";
import { Product } from "../common/Schema";
import LocalityLogo from "../common/images/LocalityLogo";

const ProductShowcase = dynamic(() => import("./ProductShowcase"));

export interface SearchResults {
  facets: {
    company: Map<string, number>;
    departments: Map<string, number>;
  };
  hits: Array<Product>;
  nbHits: number;
}

export interface SearchProps {
  defaultQuery: string;
  searchResults: SearchResults;
  onEnter: (query: string) => void;
  onBottom: () => void;
}

export default function Search({
  defaultQuery,
  searchResults,
  onEnter,
  onBottom,
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
      <SearchBar
        autoFocus
        defaultQuery={defaultQuery}
        width={280}
        onEnter={onEnter}
      />
      <ProductShowcase
        align="center"
        hits={searchResults.hits}
        style={{ marginRight: -12 }}
      />
    </Stack>
  );
}
