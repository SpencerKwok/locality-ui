import React from "react";
import { InputGroup, FormControl } from "react-bootstrap";

import Stack from "../../common/components/Stack/Stack";
import {
  SearchInputGroup,
  SearchClearButton,
  SearchSubmitButton,
} from "../../common/components/Search/Search";

export interface SearchBarProps extends React.HTMLProps<HTMLInputElement> {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEnter?: () => void;
  onReset?: () => void;
  value: string;
}

function SearchBar(props: SearchBarProps) {
  return (
    <Stack direction="row" spacing={1} style={{ ...props.style }}>
      <SearchInputGroup
        size="lg"
        width={props.width}
        style={{ border: "1px solid #ced4da" }}
      >
        <FormControl
          autoFocus
          aria-label="Large"
          aria-describedby="inputGroup-sizing-sm"
          onChange={props.onChange}
          onKeyPress={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter" && props.onEnter) {
              props.onEnter();
            }
          }}
          placeholder="I want..."
          style={{ border: "none" }}
          type="text"
          value={props.value}
        />
        {props.value.length > 0 && (
          <InputGroup.Append>
            <SearchClearButton className="close" onClick={props.onReset}>
              ×
            </SearchClearButton>
          </InputGroup.Append>
        )}
      </SearchInputGroup>
      <SearchSubmitButton variant="primary" onClick={props.onEnter}>
        Search
      </SearchSubmitButton>
    </Stack>
  );
}

export default SearchBar;
