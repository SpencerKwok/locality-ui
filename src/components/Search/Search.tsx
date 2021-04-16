import React, { useEffect, useState } from "react";
import { geolocated, GeolocatedProps } from "react-geolocated";
import Pagination from "react-bootstrap/Pagination";
import { useHistory } from "react-router-dom";
import PublicIp from "public-ip";

import CompanyList from "./Company/List";
import CompanyShowcase from "./Company/Showcase";
import DepartmentsList from "./Departments/List";
import SearchBar from "./SearchBar";
import SearchDAO from "./SearchDAO";
import SearchResults from "./SearchResults";
import Stack from "../../common/components/Stack/Stack";
import { Product } from "../../common/rpc/Schema";
import { ReactComponent as LocalityLogo } from "./locality-logo.svg";

interface Location {
  ip?: string;
  latitude?: number;
  longitude?: number;
}

interface SearchResults {
  facets: {
    company: Map<string, number>;
    departments: Map<string, number>;
  };
  hits: Array<Product>;
  nbHits: number;
}

interface UserInput {
  page: number;
  company: Set<string>;
  departments: Set<string>;
}

const location: Location = {};

export interface SearchProps extends GeolocatedProps {
  query?: string;
  height: number;
  width: number;
}

export function Search(props: SearchProps) {
  const [query, setQuery] = useState(decodeURIComponent(props.query || ""));
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults>({
    facets: {
      company: new Map<string, number>(),
      departments: new Map<string, number>(),
    },
    hits: [],
    nbHits: 0,
  });
  const [userInput, setUserInput] = useState<UserInput>({
    page: 0,
    company: new Set(),
    departments: new Set(),
  });

  const history = useHistory();
  useEffect(() => {
    (async () => {
      if (!props.query) {
        return;
      }

      window.scrollTo(0, 0);
      setSearching(true);

      if (!location.ip) {
        location.ip = await PublicIp.v4();
      }

      if (props.coords) {
        location.latitude = props.coords.latitude;
        location.longitude = props.coords.longitude;
      }

      const companyFilters = [...userInput.company].map(
        (name) => `company:"${name}"`
      );
      const departmentsFilters = [...userInput.departments].map(
        (name) => `departments:"${name}"`
      );
      const filters = [...companyFilters, ...departmentsFilters].join(" OR ");

      await SearchDAO.getInstance()
        .search({
          query: props.query,
          ...location,
          page: userInput.page,
          filters,
        })
        .then((results) => {
          if (userInput.company.size > 0 || userInput.departments.size > 0) {
            setSearchResults({
              hits: results.hits,
              nbHits: results.nbHits,
              facets: searchResults.facets,
            });
          } else {
            const company = new Map<string, number>();
            for (const name in results.facets.company) {
              company.set(name, results.facets.company[name]);
            }
            const departments = new Map<string, number>();
            for (const name in results.facets.departments) {
              departments.set(name, results.facets.departments[name]);
            }
            setSearchResults({
              hits: results.hits,
              nbHits: results.nbHits,
              facets: {
                company,
                departments,
              },
            });
          }
        })
        .catch((err) => console.log(err));
    })();
  }, [props.query, props.coords, userInput]);

  const searchBarOnChange = (e: React.FormEvent<HTMLInputElement>) => {
    setQuery((e.target as HTMLInputElement).value);
  };

  const searchBarOnEnter = () => {
    if (query === "" || props.query === query) {
      return;
    }

    setUserInput({ page: 0, company: new Set(), departments: new Set() });
    history.push(`/search?q=${encodeURIComponent(query)}`);
  };

  if (searching) {
    if (props.width <= 800) {
      return (
        <Stack direction="column" rowAlign="flex-start">
          <header
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              width: props.width,
              maxWidth: 300,
              overflow: "hidden",
              marginLeft: -64,
            }}
          >
            <LocalityLogo />
          </header>
          <SearchBar
            onChange={searchBarOnChange}
            onEnter={searchBarOnEnter}
            onReset={() => setQuery("")}
            width={Math.max(props.width * 0.3, 200)}
            value={query}
            style={{ marginLeft: 24, marginTop: -16, marginBottom: 16 }}
            autoFocus
          />
          {searchResults.hits.length > 0 && (
            <SearchResults
              hits={searchResults.hits}
              query={props.query || ""}
              style={{ marginLeft: 24, marginTop: -8 }}
            />
          )}
          <Stack
            direction="row"
            columnAlign="center"
            style={{ width: props.width }}
          >
            <Pagination size="lg">
              {[...Array(Math.ceil(searchResults.nbHits / 24)).keys()].map(
                (index) => (
                  <Pagination.Item
                    active={
                      userInput.page === index ||
                      (userInput.page < 0 && index === 0)
                    }
                    onClick={() => setUserInput({ ...userInput, page: index })}
                  >
                    {index + 1}
                  </Pagination.Item>
                )
              )}
            </Pagination>
          </Stack>
        </Stack>
      );
    } else {
      return (
        <Stack direction="column" rowAlign="flex-start">
          <Stack
            direction="row"
            columnAlign="flex-start"
            rowAlign="center"
            spacing={-96}
          >
            <header
              onClick={() => {
                window.location.href = "/";
              }}
              style={{
                width: props.width,
                maxWidth: 300,
                overflow: "hidden",
                marginLeft: -64,
              }}
            >
              <LocalityLogo />
            </header>
            <SearchBar
              onChange={searchBarOnChange}
              onEnter={searchBarOnEnter}
              onReset={() => setQuery("")}
              width={Math.max(props.width * 0.3, 200)}
              value={query}
              style={{ marginTop: -4, marginLeft: 24 }}
              autoFocus
            />
          </Stack>
          {searchResults.hits.length > 0 && (
            <Stack direction="column" rowAlign="flex-start">
              <Stack
                direction="row"
                columnAlign="flex-start"
                style={{ marginTop: -8, marginLeft: 24 }}
              >
                <Stack direction="column" spacing={12}>
                  <DepartmentsList
                    hits={searchResults.hits}
                    departments={searchResults.facets.departments}
                    selectedDepartments={userInput.departments}
                    onDepartmentClick={async (name) => {
                      if (userInput.departments.has(name)) {
                        userInput.departments.delete(name);
                      } else {
                        userInput.departments.add(name);
                      }
                      setUserInput({ ...userInput });
                    }}
                  />
                  <CompanyList
                    hits={searchResults.hits}
                    companies={searchResults.facets.company}
                    selectedCompanies={userInput.company}
                    onCompanyClick={async (name) => {
                      if (userInput.company.has(name)) {
                        userInput.company.delete(name);
                      } else {
                        userInput.company.add(name);
                      }
                      setUserInput({ ...userInput });
                    }}
                  />
                </Stack>
                <SearchResults
                  hits={searchResults.hits}
                  query={props.query || ""}
                  style={{ marginLeft: 12, paddingRight: 12 }}
                />
              </Stack>
              <Stack
                direction="row"
                columnAlign="center"
                style={{ width: props.width }}
              >
                <Pagination size="lg">
                  {[...Array(Math.ceil(searchResults.nbHits / 24)).keys()].map(
                    (index) => (
                      <Pagination.Item
                        active={
                          userInput.page === index ||
                          (userInput.page < 0 && index === 0)
                        }
                        onClick={() =>
                          setUserInput({ ...userInput, page: index })
                        }
                      >
                        {index + 1}
                      </Pagination.Item>
                    )
                  )}
                </Pagination>
              </Stack>
            </Stack>
          )}
        </Stack>
      );
    }
  }

  return (
    <Stack direction="row" columnAlign="center" style={{ marginTop: -24 }}>
      <Stack direction="column" rowAlign="center">
        <header
          style={{
            width: props.width,
            maxWidth: 500,
            overflow: "hidden",
          }}
        >
          <LocalityLogo />
        </header>
        <SearchBar
          onChange={searchBarOnChange}
          onEnter={searchBarOnEnter}
          onReset={() => setQuery("")}
          style={{ marginTop: -36 }}
          width={Math.max(props.width * 0.3, 225)}
          value={query}
          autoFocus
        />
        <div style={{ marginTop: 24, width: props.width * 0.8 }}>
          <CompanyShowcase />
        </div>
      </Stack>
    </Stack>
  );
}

export const GeolocationSearch = geolocated({
  positionOptions: {
    enableHighAccuracy: false,
  },
})(Search);
