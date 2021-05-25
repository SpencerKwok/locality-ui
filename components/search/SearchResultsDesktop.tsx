import dynamic from "next/dynamic";
import Link from "next/link";

import FacetList from "./FacetList";
import ProductShowcase from "./ProductShowcase";
import SearchBar from "./SearchBar";
import Stack from "../common/Stack";

import LocalityLogo from "../common/images/LocalityLogo";
import { useWindowSize } from "../../lib/common";

import type { Ellipsis } from "react-bootstrap/PageItem";
import type { Product } from "../common/Schema";

const Pagination = dynamic(() => import("react-bootstrap/Pagination"));
const PaginationItem = dynamic(() => import("react-bootstrap/PageItem"));
const PaginationEllipsis = dynamic(() =>
  import("react-bootstrap/PageItem").then((module) => module.Ellipsis)
) as typeof Ellipsis;

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

  const PaginationDisplay = () => {
    return (
      <Pagination>
        {(() => {
          const numPages = Math.ceil(searchResults.nbHits / 24);
          if (numPages < 12) {
            return Array.from(Array(numPages).keys()).map((index) => (
              <PaginationItem
                active={userInput.page === index}
                key={index}
                onClick={() => {
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
                  onClick={() => {
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
                onClick={() => {
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
                onClick={() => {
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
                  onClick={() => {
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
                onClick={() => {
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
                onClick={() => {
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
                  onClick={() => {
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
              facets={searchResults.facets.departments}
              selectedFacets={userInput.departments}
              onFacetClick={(value) => {
                onUserInputChange.departments(value);
              }}
            />
            <FacetList
              name="Businesses"
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
      <Stack direction="row" columnAlign="center" style={{ width: size.width }}>
        <Pagination>
          <PaginationDisplay />
        </Pagination>
      </Stack>
    </Stack>
  );
}
