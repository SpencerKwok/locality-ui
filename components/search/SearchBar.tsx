import React, { useState } from "react";

import MagnifyingGlass from "components/common/images/MagnifyingGlass";
import Stack from "components/common/Stack";
import styles from "components/search/SearchBar.module.css";

import type { FC } from "react";

export interface SearchBarProps extends React.HTMLProps<HTMLDivElement> {
  defaultQuery?: string;
  width: number;
  onEnter: (query: string) => void;
}

const SearchBar: FC<SearchBarProps> = ({ defaultQuery, width, onEnter }) => {
  const [initialQuery, setInitialQuery] = useState(defaultQuery ?? "");
  const [query, setQuery] = useState(defaultQuery ?? "");

  if (typeof defaultQuery === "string" && defaultQuery !== initialQuery) {
    setInitialQuery(defaultQuery);
    setQuery(defaultQuery);
  }

  return (
    <Stack direction="row" className={styles.search}>
      <input
        className={styles["search-input"]}
        placeholder="Search for local products or businesses"
        onChange={(e): void => {
          setQuery(e.target.value);
        }}
        onKeyPress={(e): void => {
          e.key === "Enter" && onEnter(query);
        }}
        value={query}
        style={{ width: 937, maxWidth: width }}
      />
      <MagnifyingGlass
        height={40}
        width={40}
        style={{ cursor: "pointer", marginTop: -1, marginRight: -1 }}
        onClick={(): void => {
          onEnter(query);
        }}
      />
    </Stack>
  );
};

export default SearchBar;
