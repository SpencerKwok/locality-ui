import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { geolocated, GeolocatedProps } from "react-geolocated";
import { Pagination } from "react-bootstrap";
import PublicIp from "public-ip";
import XSS from "xss";

import CompanyList from "./Company/List";
import CompanyShowcase from "./Company/Showcase";
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

const location: Location = {};

export interface SearchProps extends GeolocatedProps {
  query?: string;
  width: number;
}

export function Search(props: SearchProps) {
  const history = useHistory();
  const [page, setPage] = useState(0);
  const [nbHits, setNbHits] = useState(0);
  const [hits, setHits] = useState<Array<Product>>([]);
  const [query, setQuery] = useState(props.query || "");
  const [searching, setSearching] = useState(false);
  const [companyFilter, setCompanyFilter] = useState("");

  useEffect(() => {
    (async () => {
      if (!props.query) {
        return;
      }

      window.scrollTo(0, 0);
      setSearching(true);
      setCompanyFilter("");

      if (!location.ip) {
        location.ip = await PublicIp.v4();
      }

      if (props.coords) {
        location.latitude = props.coords.latitude;
        location.longitude = props.coords.longitude;
      }

      await SearchDAO.getInstance()
        .search({ query: XSS(props.query), ...location, page })
        .then(({ hits, nbHits }) => {
          setHits(hits);
          setNbHits(nbHits);
        })
        .catch((err) => console.log(err));
    })();
  }, [props.query, props.coords, page]);

  const searchBarOnChange = (e: React.FormEvent<HTMLInputElement>) => {
    setQuery((e.target as HTMLInputElement).value);
  };

  const searchBarOnEnter = () => {
    if (query === "" || props.query === query) {
      return;
    }
    setPage(0);
    history.push("/search?q=" + query);
  };

  if (searching) {
    if (props.width <= 460) {
      return (
        <Stack direction="column" rowAlign="flex-start">
          <header
            onClick={() => history.push("/")}
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
          {hits.length > 0 && (
            <SearchResults
              hits={hits}
              query={props.query || ""}
              style={{ marginLeft: 24, marginTop: -8 }}
            />
          )}
          <Stack direction="row" columnAlign="center" width={props.width}>
            <Pagination size="lg">
              {[...Array(Math.ceil(nbHits / 24)).keys()].map((index) => (
                <Pagination.Item
                  active={page === index || (page < 0 && index === 0)}
                  onClick={() => setPage(index)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
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
              onClick={() => history.push("/")}
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
          {hits.length > 0 && (
            <Stack direction="column" rowAlign="flex-start">
              <Stack
                direction="row"
                columnAlign="flex-start"
                style={{ marginTop: -8 }}
              >
                <CompanyList
                  onCompanyClick={(name) => {
                    setCompanyFilter(name);
                  }}
                  currentCompany={companyFilter}
                  hits={hits}
                  style={{ marginLeft: 24 }}
                />
                <SearchResults
                  hits={
                    companyFilter === ""
                      ? hits
                      : hits.filter((value) => value.company === companyFilter)
                  }
                  query={props.query || ""}
                  style={{ marginLeft: 12, paddingRight: 12 }}
                />
              </Stack>
              <Stack direction="row" columnAlign="center" width={props.width}>
                <Pagination size="lg">
                  {[...Array(Math.ceil(nbHits / 24)).keys()].map((index) => (
                    <Pagination.Item
                      active={page === index || (page < 0 && index === 0)}
                      onClick={() => setPage(index)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
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
