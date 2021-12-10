import FacetList from "./FacetList";
import ProductShowcase from "./ProductShowcase";
import SearchBar from "./SearchBar";
import Stack from "components/common/Stack";
import ThemeContext from "components/common/Theme";
import { useWindowSize } from "lib/common";
import styles from "./SearchResultsDesktop.module.css";

import type { FC } from "react";
import type { Product } from "common/Schema";

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
  width: number;
  uniqueHits: Set<string>;
  onEnter: (query: string) => void;
  onProductClick: (objectId: string) => void;
  onProductView: (objectId: string, offsetTop: number) => void;
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
  width,
  uniqueHits,
  onEnter,
  onProductClick,
  onProductView,
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
      <ul className={styles.pagination}>
        {((): Array<JSX.Element> => {
          const numPages = Math.ceil(searchResults.nbHits / 24);
          if (numPages < 12) {
            return Array.from(Array(numPages).keys()).map((index) => (
              <li
                key={index}
                onClick={(): void => {
                  onUserInputChange.page(index);
                }}
              >
                <span
                  className={
                    styles[
                      `page-link${userInput.page === index ? "-active" : ""}`
                    ]
                  }
                >
                  {index + 1}
                </span>
              </li>
            ));
          }

          const pages = Array<JSX.Element>();
          if (userInput.page <= 6) {
            const maxPageBeforeEllipsis = userInput.page === 6 ? 11 : 10;
            for (let index = 0; index < maxPageBeforeEllipsis; ++index) {
              pages.push(
                <li
                  key={index}
                  onClick={(): void => {
                    onUserInputChange.page(index);
                  }}
                >
                  <span
                    className={
                      styles[
                        `page-link${userInput.page === index ? "-active" : ""}`
                      ]
                    }
                  >
                    {index + 1}
                  </span>
                </li>
              );
            }
            pages.push(
              <li>
                <span className={styles["page-link"]}>...</span>
              </li>
            );
            pages.push(
              <li
                key={numPages - 1}
                onClick={(): void => {
                  onUserInputChange.page(numPages - 1);
                }}
              >
                <span className={styles["page-link"]}>{numPages}</span>
              </li>
            );
          } else if (userInput.page <= numPages - 8) {
            pages.push(
              <li
                key={0}
                onClick={(): void => {
                  onUserInputChange.page(0);
                }}
              >
                <span className={styles["page-link"]}>1</span>
              </li>
            );
            pages.push(
              <li>
                <span className={styles["page-link"]}>...</span>
              </li>
            );
            for (
              let index = userInput.page - 5;
              index <= userInput.page + 5;
              ++index
            ) {
              pages.push(
                <li
                  key={index}
                  onClick={(): void => {
                    onUserInputChange.page(index);
                  }}
                >
                  <span
                    className={
                      styles[
                        `page-link${userInput.page === index ? "-active" : ""}`
                      ]
                    }
                  >
                    {index + 1}
                  </span>
                </li>
              );
            }
            pages.push(
              <li>
                <span className={styles["page-link"]}>...</span>
              </li>
            );
            pages.push(
              <li
                key={numPages - 1}
                onClick={(): void => {
                  onUserInputChange.page(numPages - 1);
                }}
              >
                <span className={styles["page-link"]}>{numPages}</span>
              </li>
            );
          } else {
            pages.push(
              <li
                key={0}
                onClick={(): void => {
                  onUserInputChange.page(0);
                }}
              >
                <span className={styles["page-link"]}>1</span>
              </li>
            );
            pages.push(
              <li>
                <span className={styles["page-link"]}>...</span>
              </li>
            );
            const minPageBeforeEllipsis =
              userInput.page === numPages - 7 ? numPages - 11 : numPages - 10;
            for (let index = minPageBeforeEllipsis; index < numPages; ++index) {
              pages.push(
                <li
                  key={index}
                  onClick={(): void => {
                    onUserInputChange.page(index);
                  }}
                >
                  <span
                    className={
                      styles[
                        `page-link${userInput.page === index ? "-active" : ""}`
                      ]
                    }
                  >
                    {index + 1}
                  </span>
                </li>
              );
            }
          }
          return pages;
        })()}
      </ul>
    );
  };

  return (
    <ThemeContext.Consumer>
      {({ color }): JSX.Element => (
        <Stack direction="column" rowAlign="center">
          <section
            style={{
              color: color.text.dark,
              marginTop: 38,
            }}
          >
            <Stack direction="column">
              <Stack direction="column" spacing={60}>
                <Stack direction="column" rowAlign="center" spacing={40}>
                  <h1 style={{ textAlign: "center" }}>
                    Online marketpace for high quality local goods
                  </h1>
                  <h2 style={{ textAlign: "center" }}>
                    <b>Explore</b> local offerings, <b>Support</b> local
                    businesses
                  </h2>
                  <SearchBar
                    autoFocus
                    defaultQuery={query}
                    width={width * 0.8}
                    onEnter={onEnter}
                  />
                </Stack>
                <Stack
                  direction="row"
                  columnAlign="center"
                  style={{ padding: "0px 48px" }}
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
                      uniqueHits={uniqueHits}
                      onToggleWishList={onToggleWishList}
                      onProductClick={onProductClick}
                      onProductView={onProductView}
                    />
                  </Stack>
                </Stack>
              </Stack>
              <Stack direction="row" columnAlign="center">
                <PaginationDisplay />
              </Stack>
            </Stack>
          </section>
        </Stack>
      )}
    </ThemeContext.Consumer>
  );
};

export default Search;
