import ip from "ip";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { GetRpcClient, PostRpcClient } from "components/common/RpcClient";
import SearchResultsDesktop from "components/search/SearchResultsDesktop";
import SearchResultsMobile from "components/search/SearchResultsMobile";
import RootLayout from "components/common/RootLayout";
import { useMediaQuery, useWindowSize } from "lib/common";

import type { FC } from "react";
import type { GetServerSideProps } from "next";
import type { Session } from "next-auth";
import type { SearchResponse } from "common/Schema";

function onToggleWishList(objectId: string, value: boolean): void {
  if (value) {
    void PostRpcClient.getInstance().call("AddToWishList", {
      id: objectId,
    });
  } else {
    void PostRpcClient.getInstance().call("DeleteFromWishList", {
      id: objectId,
    });
  }
}

async function fetcher(
  url: string,
  ip: string,
  cookie?: string
): Promise<SearchResponse> {
  return GetRpcClient.getInstance().call("Search", url, {
    cookie,
    //"x-forwarded-for": ip,
  });
}

class UserInput {
  public query: string;
  public page: number;
  public business: Set<string>;
  public departments: Set<string>;

  public constructor(
    query: string,
    page = 0,
    business: Set<string> = new Set<string>(),
    departments: Set<string> = new Set<string>()
  ) {
    this.query = query;
    this.page = page;
    this.business = business;
    this.departments = departments;
  }

  public clone(): UserInput {
    return new UserInput(
      this.query,
      this.page,
      this.business,
      this.departments
    );
  }

  public toString(): string {
    let params = `q=${encodeURIComponent(this.query)}`;
    if (this.page > 0) {
      params += `&pg=${this.page}`;
    }
    const businessFilters = Array.from(this.business).map(
      (name) => `business:"${name}"`
    );
    const departmentsFilters = Array.from(this.departments).map(
      (name) => `departments:"${name}"`
    );
    const filters = [...businessFilters, ...departmentsFilters].join(" OR ");
    if (filters.length > 0) {
      params += `&filters=${encodeURIComponent(filters)}`;
    }
    return params;
  }
}

export interface SearchProps {
  ip: string;
  query: string;
  session: Session | null;
  results: SearchResponse;
  cookie?: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const cookie = context.req.headers.cookie;
  const forwarded = (context.req.headers["x-forwarded-for"] ?? "") as string;
  const ip = forwarded.split(/,\s*/)[0];
  const query = decodeURIComponent((context.query["q"] ?? "") as string);
  const results = await fetcher(
    `/api/search?q=${encodeURIComponent(query)}`,
    ip,
    cookie
  );

  return {
    props: {
      query,
      results,
    },
  };
};

const Search: FC<SearchProps> = ({ query, results, session }) => {
  const ipAddress = ip.address();
  const [data, setData] = useState(results);
  const [showAllBusinesses, setShowAllBusinesses] = useState(false);
  const [showAllDepartments, setShowAllDepartments] = useState(false);
  const [userInput, setUserInput] = useState(new UserInput(query));
  const router = useRouter();
  const size = useWindowSize();

  const onReset = (): void => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    userInput.query = urlParams.get("q") ?? "";
    userInput.page = 0;
    userInput.business = new Set<string>();
    userInput.departments = new Set<string>();
    setUserInput(userInput.clone());

    fetcher(`/api/search?${userInput.toString()}`, ipAddress)
      .then((newData) => {
        data.facets = newData.facets;
        data.hits = newData.hits;
        data.nbHits = newData.nbHits;
        setData(newData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const isNarrow = useMediaQuery(64, "width");
  const loggedIn = !(!session || !session.user);

  const onUserInputChange = (): void => {
    setUserInput(userInput.clone());
    fetcher(`/api/search?${userInput.toString()}`, ipAddress)
      .then(({ hits, nbHits }) => {
        setData({ facets: data.facets, hits, nbHits });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const createOnFacetClick = (name: "business" | "departments") => {
    return (value: string): void => {
      userInput.page = 0;
      if (userInput[name].has(value)) {
        userInput[name].delete(value);
      } else {
        userInput[name].add(value);
      }
      onUserInputChange();
    };
  };

  const onPageClick = (value: number): void => {
    userInput.page = value;
    onUserInputChange();
  };

  const onEnter = async (query: string): Promise<void> => {
    userInput.query = query;
    userInput.page = 0;
    userInput.business = new Set<string>();
    userInput.departments = new Set<string>();
    setUserInput(userInput.clone());
    fetcher(`/api/search?${userInput.toString()}`, ipAddress)
      .then((newData) => {
        data.facets = newData.facets;
        data.hits = newData.hits;
        data.nbHits = newData.nbHits;
        setData(newData);
        setShowAllBusinesses(false);
        setShowAllDepartments(false);
      })
      .catch((err) => {
        console.log(err);
      });

    void router.push(
      { pathname: "/search", query: { q: encodeURIComponent(query) } },
      undefined,
      {
        shallow: true,
      }
    );
  };

  // HACK: this function only runs on
  // the client side, so we need to update
  // the query value using the url
  const onBottom = (): void => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const query = decodeURIComponent(urlParams.get("q") ?? "");
    if (userInput.query !== query) {
      userInput.query = query;
      userInput.page = 0;
    }

    userInput.page += 1;
    fetcher(`/api/search?${userInput.toString()}`, ipAddress)
      .then((nextPageData) => {
        if (userInput.page === 1) {
          userInput.page = 0;
          fetcher(`/api/search?${userInput.toString()}`, ipAddress)
            .then((firstPageData) => {
              data.facets = firstPageData.facets;
              data.hits = [...firstPageData.hits, ...nextPageData.hits];
              data.nbHits = firstPageData.nbHits;
              userInput.page = 1;
              setData({ ...data });
              setUserInput(userInput.clone());
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          data.hits = [...data.hits, ...nextPageData.hits];
          setData({ ...data });
          setUserInput(userInput.clone());
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onToggleShowAllBusinesses = (): void => {
    setShowAllBusinesses(!showAllBusinesses);
  };

  const onToggleShowAllDepartments = (): void => {
    setShowAllDepartments(!showAllDepartments);
  };

  const business = new Map<string, number>();
  for (const name in data.facets.business) {
    business.set(name, data.facets.business[name]);
  }
  const departments = new Map<string, number>();
  for (const name in data.facets.departments) {
    departments.set(name, data.facets.departments[name]);
  }

  useEffect(() => {
    window.addEventListener("popstate", onReset);
    return (): void => {
      window.removeEventListener("popstate", onReset);
    };
  }, []);

  useEffect(() => {
    onReset();
  }, [isNarrow]);

  useEffect(() => {
    if (!isNarrow) {
      window.scroll(0, 0);
    }
  }, [data]);

  if (typeof size.width !== "number") {
    return <RootLayout session={session} />;
  }

  return (
    <RootLayout session={session}>
      {isNarrow ? (
        <SearchResultsMobile
          loggedIn={loggedIn}
          query={userInput.query}
          searchResults={{
            hits: data.hits,
            nbHits: data.nbHits,
            facets: {
              business,
              departments,
            },
          }}
          onBottom={onBottom}
          onEnter={onEnter}
          onToggleWishList={onToggleWishList}
        />
      ) : (
        <SearchResultsDesktop
          loggedIn={loggedIn}
          showAllBusinesses={showAllBusinesses}
          showAllDepartments={showAllDepartments}
          query={userInput.query}
          searchResults={{
            hits: data.hits,
            nbHits: data.nbHits,
            facets: {
              business,
              departments,
            },
          }}
          userInput={userInput}
          width={size.width}
          onUserInputChange={{
            business: createOnFacetClick("business"),
            departments: createOnFacetClick("departments"),
            page: onPageClick,
          }}
          onEnter={onEnter}
          onToggleWishList={onToggleWishList}
          onToggleShowAllBusinesses={onToggleShowAllBusinesses}
          onToggleShowAllDepartments={onToggleShowAllDepartments}
        />
      )}
    </RootLayout>
  );
};

export default Search;
