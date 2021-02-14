import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { geolocated, GeolocatedProps } from "react-geolocated";
import PublicIp from "public-ip";
import XSS from "xss";

import SearchBar from "./SearchBar";
import SearchDAO from "./SearchDAO";
import SearchResults from "./SearchResults";
import Stack from "../Stack/Stack";
import Window from "../../utils/window";
import { Product } from "../../common/rpc/Schema";

interface Location {
  ip?: string;
  latitude?: number;
  longitude?: number;
}

const location: Location = {};

export interface SearchProps extends GeolocatedProps {
  query?: string;
}

function Search(props: SearchProps) {
  const windowSize = Window();
  const history = useHistory();
  const [query, setQuery] = useState(props.query || "");
  const [hits, setHits] = useState<Array<Product>>([]);

  useEffect(() => {
    (async () => {
      if (!props.query) {
        return;
      }
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

  return (
    <Stack
      direction="horizontal"
      columnAlign="center"
      style={{ marginTop: "-24px" }}
    >
      <Stack direction="vertical" rowAlign="center">
        <SearchBar
          onChange={searchBarOnChange}
          onEnter={searchBarOnEnter}
          width={Math.max(windowSize.width * 0.3, 225)}
          value={query}
          autoFocus
        />
        <SearchResults hits={hits} style={{ marginTop: "12px" }} />
      </Stack>
    </Stack>
  );
}

export default geolocated({
  positionOptions: {
    enableHighAccuracy: false,
  },
})(Search);
