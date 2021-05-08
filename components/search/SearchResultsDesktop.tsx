import React, { Fragment } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

import FacetList from "./FacetList";
import ProductShowcase from "./ProductShowcase";
import SearchBar from "./SearchBar";
import Stack from "../common/Stack";
import { Product } from "../common/Schema";
import LocalityLogo from "../common/images/LocalityLogo";
import { useWindowSize } from "../../lib/common";

const Pagination = dynamic(() => import("react-bootstrap/Pagination"));
const PaginationItem = dynamic(() => import("react-bootstrap/PageItem"));

export type UserInputChange = {
  page: (value: number) => void;
  company: (value: string) => void;
  departments: (value: string) => void;
};

export interface UserInput {
  page: number;
  company: Set<string>;
  departments: Set<string>;
}

export interface SearchResults {
  facets: {
    company: Map<string, number>;
    departments: Map<string, number>;
  };
  hits: Array<Product>;
  nbHits: number;
}

export interface SearchProps {
  loggedIn: boolean;
  query: string;
  searchResults: SearchResults;
  userInput: UserInput;
  onUserInputChange: UserInputChange;
  onEnter: (query: string) => void;
  onToggleWishList: (objectId: string, value: boolean) => void;
}

export default function Search({
  loggedIn,
  query,
  searchResults,
  userInput,
  onUserInputChange,
  onEnter,
  onToggleWishList,
}: SearchProps) {
  const size = useWindowSize();
  if (!size.width) {
    return null;
  }

  return (
    <Stack direction="column" rowAlign="flex-start">
      <Stack direction="row" columnAlign="flex-start" rowAlign="center">
        <Link href="/">
          <div>
            <LocalityLogo
              width={200}
              style={{
                marginTop: 6,
                padding: "16px 16px 16px 16px",
                cursor: "pointer",
              }}
            />
          </div>
        </Link>
        <SearchBar
          autoFocus
          defaultQuery={query}
          width={400}
          onEnter={onEnter}
        />
      </Stack>
      {searchResults.hits.length > 0 && (
        <Fragment>
          <Stack direction="column" rowAlign="flex-start">
            <Stack
              direction="row"
              columnAlign="flex-start"
              style={{ marginLeft: 14 }}
            >
              <Stack direction="column" rowAlign="flex-start" spacing={12}>
                <FacetList
                  name="Departments"
                  facets={searchResults.facets.departments}
                  selectedFacets={userInput.departments}
                  onFacetClick={(value) => {
                    onUserInputChange.departments(value);
                  }}
                />
                <FacetList
                  name="Companies"
                  facets={searchResults.facets.company}
                  selectedFacets={userInput.company}
                  onFacetClick={(value) => {
                    onUserInputChange.company(value);
                  }}
                />
              </Stack>
              <Stack direction="column" rowAlign="center">
                <ProductShowcase
                  loggedIn={loggedIn}
                  hits={searchResults.hits}
                  numEagerLoad={12}
                  query={query}
                  onToggleWishList={onToggleWishList}
                />
              </Stack>
            </Stack>
          </Stack>

          <Stack
            direction="row"
            columnAlign="center"
            style={{ width: size.width }}
          >
            <Pagination>
              {Array.from(
                Array(Math.ceil(searchResults.nbHits / 24)).keys()
              ).map((index) => (
                <PaginationItem
                  active={userInput.page === index}
                  key={index}
                  onClick={() => {
                    onUserInputChange.page(index);
                  }}
                >
                  {index + 1}
                </PaginationItem>
              ))}
            </Pagination>
          </Stack>
        </Fragment>
      )}
    </Stack>
  );
}
