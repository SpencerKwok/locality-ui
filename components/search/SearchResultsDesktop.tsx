import dynamic from "next/dynamic";
import Link from "next/link";

import FacetList from "./FacetList";
import ProductShowcase from "./ProductShowcase";
import SearchBar from "./SearchBar";
import Stack from "components/common/Stack";

import LocalityLogo from "components/common/images/LocalityLogo";
import { useWindowSize } from "lib/common";

import type { Ellipsis } from "react-bootstrap/PageItem";
import type { FC } from "react";
import type { Product } from "common/Schema";

const Pagination = dynamic(async () => import("react-bootstrap/Pagination"));
const PaginationItem = dynamic(async () => import("react-bootstrap/PageItem"));
const PaginationEllipsis = dynamic(async () =>
  import("react-bootstrap/PageItem").then((module) => module.Ellipsis)
) as typeof Ellipsis;

export type UserInputChange = {
  page: (value: number) => void;
  business: (value: string) => void;
  departments: (value: string) => void;
};

export interface UserInput {
  page: number;
  business: Set<string>;
  departments: Set<string>;
}

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
  showAllBusinesses: boolean;
  showAllDepartments: boolean;
  query: string;
  searchResults: SearchResults;
  userInput: UserInput;
  onUserInputChange: UserInputChange;
  onEnter: (query: string) => void;
  onToggleWishList: (objectId: string, value: boolean) => void;
  onToggleShowAllBusinesses: () => void;
  onToggleShowAllDepartments: () => void;
}

const Search: FC<SearchProps> = ({
  loggedIn,
  showAllBusinesses,
  showAllDepartments,
  query,
  searchResults,
  userInput,
  onUserInputChange,
  onEnter,
  onToggleWishList,
  onToggleShowAllBusinesses,
  onToggleShowAllDepartments,
}) => {
  const size = useWindowSize();

  if (typeof size.width !== "number") {
    return null;
  }

  const PaginationDisplay = (): JSX.Element => {
    return (
      <Pagination>
        {((): Array<JSX.Element> => {
          const numPages = Math.ceil(searchResults.nbHits / 24);
          if (numPages < 12) {
            return Array.from(Array(numPages).keys()).map((index) => (
              <PaginationItem
                active={userInput.page === index}
                key={index}
                onClick={(): void => {
                  onUserInputChange.page(index);
                }}
              >
                {index + 1}
              </PaginationItem>
            ));
          }

          const pages = Array<JSX.Element>();
          if (userInput.page <= 6) {
            const maxPageBeforeEllipsis = userInput.page === 6 ? 11 : 10;
            for (let index = 0; index < maxPageBeforeEllipsis; ++index) {
              pages.push(
                <PaginationItem
                  active={userInput.page === index}
                  key={index}
                  onClick={(): void => {
                    onUserInputChange.page(index);
                  }}
                >
                  {index + 1}
                </PaginationItem>
              );
            }
            pages.push(<PaginationEllipsis key="ellipsis_1" />);
            pages.push(
              <PaginationItem
                active={userInput.page === numPages - 1}
                key={numPages - 1}
                onClick={(): void => {
                  onUserInputChange.page(numPages - 1);
                }}
              >
                {numPages}
              </PaginationItem>
            );
          } else if (userInput.page <= numPages - 8) {
            pages.push(
              <PaginationItem
                active={userInput.page === 0}
                key={0}
                onClick={(): void => {
                  onUserInputChange.page(0);
                }}
              >
                1
              </PaginationItem>
            );
            pages.push(<PaginationEllipsis key="ellipsis_1" />);
            for (
              let index = userInput.page - 5;
              index <= userInput.page + 5;
              ++index
            ) {
              pages.push(
                <PaginationItem
                  active={userInput.page === index}
                  key={index}
                  onClick={(): void => {
                    onUserInputChange.page(index);
                  }}
                >
                  {index + 1}
                </PaginationItem>
              );
            }
            pages.push(<PaginationEllipsis key="ellipsis_2" />);
            pages.push(
              <PaginationItem
                active={userInput.page === numPages - 1}
                key={numPages - 1}
                onClick={(): void => {
                  onUserInputChange.page(numPages - 1);
                }}
              >
                {numPages}
              </PaginationItem>
            );
          } else {
            pages.push(
              <PaginationItem
                active={userInput.page === 0}
                key={0}
                onClick={(): void => {
                  onUserInputChange.page(0);
                }}
              >
                1
              </PaginationItem>
            );
            pages.push(<PaginationEllipsis key="ellipsis_1" />);
            const minPageBeforeEllipsis =
              userInput.page === numPages - 7 ? numPages - 11 : numPages - 10;
            for (let index = minPageBeforeEllipsis; index < numPages; ++index) {
              pages.push(
                <PaginationItem
                  active={userInput.page === index}
                  key={index}
                  onClick={(): void => {
                    onUserInputChange.page(index);
                  }}
                >
                  {index + 1}
                </PaginationItem>
              );
            }
          }

          return pages;
        })()}
      </Pagination>
    );
  };

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
      <Stack direction="column" rowAlign="flex-start">
        <Stack
          direction="row"
          columnAlign="flex-start"
          style={{ marginLeft: 14 }}
        >
          <Stack direction="column" rowAlign="flex-start" spacing={12}>
            <FacetList
              name="Departments"
              showAll={showAllDepartments}
              facets={searchResults.facets.departments}
              selectedFacets={userInput.departments}
              onFacetClick={(value): void => {
                onUserInputChange.departments(value);
              }}
              toggleShowAll={onToggleShowAllDepartments}
            />
            <FacetList
              name="Businesses"
              showAll={showAllBusinesses}
              facets={searchResults.facets.business}
              selectedFacets={userInput.business}
              onFacetClick={(value): void => {
                onUserInputChange.business(value);
              }}
              toggleShowAll={onToggleShowAllBusinesses}
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
      <Stack direction="row" columnAlign="center" style={{ width: size.width }}>
        <Pagination>
          <PaginationDisplay />
        </Pagination>
      </Stack>
    </Stack>
  );
};

export default Search;
