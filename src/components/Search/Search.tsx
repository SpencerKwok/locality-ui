import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { geolocated, GeolocatedProps } from "react-geolocated";
import PublicIp from "public-ip";
import XSS from "xss";

import Businesses from "./Businesses";
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
  const [query, setQuery] = useState(props.query || "");
  const [hits, setHits] = useState<Array<Product>>([]);
  const [searching, setSearching] = useState(false);
  const [businessFilter, setBusinessFilter] = useState("");

  useEffect(() => {
    (async () => {
      if (!props.query) {
        return;
      }

      setSearching(true);
      setBusinessFilter("");

      if (!location.ip) {
        location.ip = await PublicIp.v4();
      }
      if (props.coords) {
        location.latitude = props.coords.latitude;
        location.longitude = props.coords.longitude;
      }
      await SearchDAO.getInstance()
        .search({ query: XSS(props.query), ...location })
        .then(({ hits }) => {
          setHits(hits);
        })
        .catch((err) => console.log(err));
    })();
  }, [props.query, props.coords]);

  const searchBarOnChange = (e: React.FormEvent<HTMLInputElement>) => {
    setQuery((e.target as HTMLInputElement).value);
  };

  const searchBarOnEnter = () => {
    if (query === "" || props.query === query) {
      return;
    }
    history.push("/search?q=" + query);
  };

  if (searching) {
    if (props.width <= 460) {
      return (
        <Stack direction="column" rowAlign="flex-start">
          <div
            onClick={() => history.push("/")}
            style={{
              width: props.width,
              maxWidth: 300,
              overflow: "hidden",
              marginLeft: -64,
            }}
          >
            <LocalityLogo />
          </div>
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
              query={query}
              style={{ marginLeft: 24, marginTop: -8 }}
            />
          )}
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
            <div
              onClick={() => history.push("/")}
              style={{
                width: props.width,
                maxWidth: 300,
                overflow: "hidden",
                marginLeft: -64,
              }}
            >
              <LocalityLogo />
            </div>
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
            <Stack
              direction="row"
              columnAlign="flex-start"
              style={{ marginTop: -8 }}
            >
              <Businesses
                onBusinessClick={(name) => {
                  setBusinessFilter(name);
                }}
                currentBusiness={businessFilter}
                hits={hits}
                style={{ marginLeft: 24 }}
              />
              <SearchResults
                hits={
                  businessFilter === ""
                    ? hits
                    : hits.filter((value) => value.company === businessFilter)
                }
                query={query}
                style={{ marginLeft: 12 }}
              />
            </Stack>
          )}
        </Stack>
      );
    }
  }

  return (
    <Stack direction="row" columnAlign="center" style={{ marginTop: -24 }}>
      <Stack direction="column" rowAlign="center">
        <div
          style={{
            width: props.width,
            maxWidth: 500,
            overflow: "hidden",
          }}
        >
          <LocalityLogo />
        </div>
        <SearchBar
          onChange={searchBarOnChange}
          onEnter={searchBarOnEnter}
          onReset={() => setQuery("")}
          style={{ marginTop: -36 }}
          width={Math.max(props.width * 0.3, 225)}
          value={query}
          autoFocus
        />
      </Stack>
    </Stack>
  );
}

export const GeolocationSearch = geolocated({
  positionOptions: {
    enableHighAccuracy: false,
  },
})(Search);
