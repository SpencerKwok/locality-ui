import { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/client";
import { useRouter } from "next/router";

import { GetRpcClient, PostRpcClient } from "../../components/common/RpcClient";
import { EmptySearchResponse } from "../../components/common/Schema";
import SearchResultsDesktop from "../../components/search/SearchResultsDesktop";
import SearchResultsMobile from "../../components/search/SearchResultsMobile";
import RootLayout from "../../components/common/RootLayout";
import { useMediaQuery } from "../../lib/common";

interface SearchProps {
  ip: string;
  cookie?: string;
}

function onToggleWishList(objectId: string, value: boolean, cookie?: string) {
  if (value) {
    return PostRpcClient.getInstance().call(
      "AddToWishList",
      { id: objectId },
      cookie
    );
  }
  return PostRpcClient.getInstance().call(
    "DeleteFromWishList",
    { id: objectId },
    cookie
  );
}

function fetcher(url: string, cookie?: string) {
  return GetRpcClient.getInstance().call("Search", url, cookie);
}

class UserInput {
  public ip: string;
  public query: string;
  public page: number;
  public company: Set<string>;
  public departments: Set<string>;

  constructor(
    ip: string,
    query: string,
    page: number = 0,
    company: Set<string> = new Set<string>(),
    departments: Set<string> = new Set<string>()
  ) {
    this.ip = ip;
    this.query = query;
    this.page = page;
    this.company = company;
    this.departments = departments;
  }

  clone() {
    return new UserInput(
      this.ip,
      this.query,
      this.page,
      this.company,
      this.departments
    );
  }

  toString() {
    let params = `q=${this.query}`;
    if (this.page > 0) {
      params += `&pg=${this.page}`;
    }
    if (this.ip !== "") {
      params += `&ip=${this.ip}`;
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
  const cookie = context.req.headers.cookie;
  const forwarded = (context.req.headers["x-forwarded-for"] || "") as string;
  const ip = forwarded.split(/,\s*/)[0];

  return {
    props: {
      cookie,
      ip,
    },
  };
};

export default function Home({ cookie, ip }: SearchProps) {
  const [data, setData] = useState(EmptySearchResponse);
  const [refresh, setRefresh] = useState(false);
  const [userInput, setUserInput] = useState(new UserInput(ip, ""));
  const [session] = useSession();
  const router = useRouter();

  if (typeof window !== "undefined") {
    useEffect(() => {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const query = urlParams.get("q") || "";
      if (userInput.query !== query) {
        userInput.query = urlParams.get("q") || "";
        userInput.page = 0;
        userInput.company = new Set<string>();
        userInput.departments = new Set<string>();
        setUserInput(userInput.clone());
        fetcher(`/api/search?${userInput.toString()}`, cookie)
          .then((newData) => {
            setData(newData);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }, [window.location.search, refresh]);
  }

  const onUserInputChange = () => {
    setUserInput(userInput.clone());
    fetcher(`/api/search?${userInput.toString()}`, cookie)
      .then(({ hits, nbHits }) => {
        setData({ facets: data.facets, hits, nbHits });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const createOnFacetClick = (name: "company" | "departments") => {
    return (value: string) => {
      if (typeof window === "undefined") {
        return;
      }

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
    if (typeof window === "undefined") {
      return;
    }

    userInput.page = value;
    onUserInputChange();
  };

  const onEnter = async (query: string) => {
    if (typeof window === "undefined") {
      return;
    }

    router.push({ pathname: "/search", query: { q: query } });
    setRefresh(!refresh);
  };

  const onBottom = () => {
    if (typeof window === "undefined") {
      return;
    }

    // HACK: for some reason the query value
    // on the client side doesn't change when
    // the route changes, so we reset it here
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const query = urlParams.get("q") || "";
    if (userInput.query !== query) {
      userInput.query = query;
      userInput.page = 0;
    }

    userInput.page += 1;
    fetcher(`/api/search?${userInput.toString()}`, cookie)
      .then((nextPageData) => {
        if (userInput.page === 1) {
          userInput.page = 0;
          fetcher(`/api/search?q=${userInput.toString()}`, cookie)
            .then((firstPageData) => {
              data.hits = [...firstPageData.hits, ...nextPageData.hits];
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

  const onReset = () => {
    setRefresh(!refresh);
  };

  const company = new Map<string, number>();
  for (const name in data.facets.company) {
    company.set(name, data.facets.company[name]);
  }
  const departments = new Map<string, number>();
  for (const name in data.facets.departments) {
    departments.set(name, data.facets.departments[name]);
  }

  const isNarrow = useMediaQuery(42, "width", onReset);
  const loggedIn = !(!session || !session.user);
  return (
    <RootLayout>
      {isNarrow ? (
        <SearchResultsMobile
          loggedIn={loggedIn}
          query={userInput.query}
          searchResults={{
            hits: data.hits,
            nbHits: data.nbHits,
            facets: {
              company,
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
          query={userInput.query}
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
          onToggleWishList={onToggleWishList}
        />
      )}
    </RootLayout>
  );
}
