import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { GetRpcClient } from "../../components/common/RpcClient";
import { SearchResponse } from "../../components/common/Schema";
import SearchResultsDesktop from "../../components/search/SearchResultsDesktop";
import SearchResultsMobile from "../../components/search/SearchResultsMobile";
import RootLayout from "../../components/root-layout/RootLayout";
import { useMediaQuery } from "../../lib/common";

interface SearchProps {
  defaultQuery: string;
  searchResponse: SearchResponse;
}

function fetcher(url: string) {
  return GetRpcClient.getInstance().call("Search", url);
}

class UserInput {
  public query: string;
  public page: number;
  public company: Set<string>;
  public departments: Set<string>;

  constructor(query: string) {
    this.query = query;
    this.page = 0;
    this.company = new Set<string>();
    this.departments = new Set<string>();
  }

  toString() {
    let params = `q=${this.query}`;
    if (this.page > 0) {
      params += `&pg=${this.page}`;
    }
    const companyFilters = Array.from(this.company).map(
      (name) => `company:"${name}"`
    );
    const departmentsFilters = Array.from(this.departments).map(
      (name) => `departments:"${name}"`
    );
    const filters = [...companyFilters, ...departmentsFilters].join(" OR ");
    if (filters.length > 0) {
      params += `&filters=${encodeURIComponent(filters)}`;
    }
    return params;
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const defaultQuery = context.query["q"] || "";
  const searchResponse = await fetcher(`/api/search?q=${defaultQuery}`);
  return {
    props: {
      defaultQuery,
      searchResponse,
    },
  };
};

function Home({ defaultQuery, searchResponse }: SearchProps) {
  const router = useRouter();
  const [data, setData] = useState(searchResponse);
  const [userInput, setUserInput] = useState(new UserInput(defaultQuery));

  const onUserInputChange = () => {
    setUserInput(userInput);
    fetcher(`/api/search?${userInput.toString()}`)
      .then(({ hits, nbHits }) => {
        data.hits = hits;
        data.nbHits = nbHits;
        setData({ ...data });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const createOnFacetClick = (name: "company" | "departments") => {
    return (value: string) => {
      userInput.page = 0;
      if (userInput[name].has(value)) {
        userInput[name].delete(value);
      } else {
        userInput[name].add(value);
      }
      onUserInputChange();
    };
  };

  const onPageClick = (value: number) => {
    userInput.page = value;
    onUserInputChange();
  };

  const onEnter = async (query: string) => {
    router.push({ pathname: "/search", query: { q: query } });
  };

  const onBottom = () => {
    userInput.page += 1;
    fetcher(`/api/search?${userInput.toString()}`)
      .then(async (nextPageData) => {
        if (userInput.page === 1) {
          await fetcher(`/api/search?q=${userInput.query}`)
            .then((firstPageData) => {
              data.hits = [...firstPageData.hits, ...nextPageData.hits];
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          data.hits = [...data.hits, ...nextPageData.hits];
        }
        setData({ ...data });
        setUserInput(userInput);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onReset = () => {
    userInput.query = defaultQuery;
    userInput.page = 0;
    userInput.company = new Set<string>();
    userInput.departments = new Set<string>();

    data.facets = searchResponse.facets;
    data.hits = searchResponse.hits;
    data.nbHits = searchResponse.nbHits;

    setData(searchResponse);
    setUserInput(new UserInput(defaultQuery));
  };

  if (userInput.query !== defaultQuery) {
    onReset();
  }

  const company = new Map<string, number>();
  for (const name in data.facets.company) {
    company.set(name, data.facets.company[name]);
  }
  const departments = new Map<string, number>();
  for (const name in data.facets.departments) {
    departments.set(name, data.facets.departments[name]);
  }

  const isNarrow = useMediaQuery(42, "width");
  return (
    <RootLayout>
      {isNarrow ? (
        <SearchResultsMobile
          defaultQuery={userInput.query}
          searchResults={{
            hits: data.hits,
            nbHits: data.nbHits,
            facets: {
              company,
              departments,
            },
          }}
          onEnter={onEnter}
          onBottom={onBottom}
        />
      ) : (
        <SearchResultsDesktop
          defaultQuery={userInput.query}
          searchResults={{
            hits: data.hits,
            nbHits: data.nbHits,
            facets: {
              company,
              departments,
            },
          }}
          userInput={userInput}
          onUserInputChange={{
            company: createOnFacetClick("company"),
            departments: createOnFacetClick("departments"),
            page: onPageClick,
          }}
          onEnter={onEnter}
        />
      )}
    </RootLayout>
  );
}

export default React.memo(Home, () => false);
