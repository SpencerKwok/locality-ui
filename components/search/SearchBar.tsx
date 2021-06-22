import React, { useState } from "react";
import { Button, InputGroup, FormControl } from "react-bootstrap";

import Stack from "components/common/Stack";
import styles from "components/search/SearchBar.module.css";

import type { FC } from "react";

export interface SearchBarProps extends React.HTMLProps<HTMLDivElement> {
  defaultQuery?: string;
  width: number;
  onEnter: (query: string) => void;
}

const SearchBar: FC<SearchBarProps> = ({
  defaultQuery,
  style,
  width,
  onEnter,
}) => {
  const [initialQuery, setInitialQuery] = useState(defaultQuery ?? "");
  const [query, setQuery] = useState(defaultQuery ?? "");

  if (typeof defaultQuery === "string" && defaultQuery !== initialQuery) {
    setInitialQuery(defaultQuery);
    setQuery(defaultQuery);
  }

  const onClear = (): void => {
    setQuery("");
  };
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setQuery((event.target as HTMLInputElement).value);
  };
  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      onEnter(query);
    }
  };

  return (
    <Stack direction="row" spacing={1} style={style}>
      <InputGroup className={styles["input-group"]} style={{ width: width }}>
        <FormControl
          autoFocus
          aria-label="Search Bar"
          aria-describedby="Enter search query here"
          onChange={onChange}
          onKeyPress={onKeyPress}
          placeholder="Search for products"
          style={{ border: "none" }}
          type="text"
          value={decodeURIComponent(query)}
        />
        {query.length > 0 && (
          <InputGroup.Append>
            <Button className={styles["clear-button"]} onClick={onClear}>
              ×
            </Button>
          </InputGroup.Append>
        )}
      </InputGroup>
      <Button
        className={styles["submit-button"]}
        onClick={(): void => {
          onEnter(query);
        }}
      >
        Search
      </Button>
    </Stack>
  );
};

export default SearchBar;
