import React from "react";
import { useRouter } from "next/router";

import Stack from "components/common/Stack";
import SearchBar from "components/search/SearchBar";
import LocalityLogo from "components/common/images/LocalityLogo";

import type { FC } from "react";

export interface SearchProps {
  width: number;
}

const Search: FC<SearchProps> = ({ width }) => {
  const router = useRouter();

  const onEnter = (query: string): void => {
    void router.push({
      pathname: "/search",
      query: { q: encodeURIComponent(query) },
    });
  };

  return (
    <Stack direction="row" columnAlign="center">
      <Stack direction="column" rowAlign="center">
        <LocalityLogo width={280} style={{ padding: "12px 24px 24px 24px" }} />
        <SearchBar autoFocus width={Math.min(width, 584)} onEnter={onEnter} />
      </Stack>
    </Stack>
  );
};

export default Search;
