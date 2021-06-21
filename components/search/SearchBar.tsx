import React, { useState } from "react";
import { Button, InputGroup, FormControl } from "react-bootstrap";

import Stack from "components/common/Stack";
import styles from "components/search/SearchBar.module.css";

export interface SearchBarProps extends React.HTMLProps<HTMLDivElement> {
  defaultQuery?: string;
  width: number;
  onEnter: (query: string) => void;
}

export default function SearchBar({
  defaultQuery,
  style,
  width,
  onEnter,
}: SearchBarProps) {
  const [initialQuery, setInitialQuery] = useState(defaultQuery || "");
  const [query, setQuery] = useState(defaultQuery || "");

  if (defaultQuery && defaultQuery !== initialQuery) {
    setInitialQuery(defaultQuery || "");
    setQuery(defaultQuery || "");
  }

  const onClear = () => {
    setQuery("");
  };
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery((event.target as HTMLInputElement).value);
  };
  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
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
        onClick={() => {
          onEnter(query);
        }}
      >
        Search
      </Button>
    </Stack>
  );
}
