import React from "react";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";

import Stack from "../../common/components/Stack/Stack";
import LocalitySearch from "../../common/components/Search";

export interface SearchBarProps extends React.HTMLProps<HTMLInputElement> {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEnter?: () => void;
  onReset?: () => void;
  value: string;
  width: number | string;
}

function SearchBar(props: SearchBarProps) {
  return (
    <Stack direction="row" spacing={1} style={{ ...props.style }}>
      <LocalitySearch.InputGroup
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
          placeholder="Search for products"
          style={{ border: "none" }}
          type="text"
          value={props.value}
        />
        {props.value.length > 0 && (
          <InputGroup.Append>
            <LocalitySearch.ClearButton
              className="close"
              onClick={props.onReset}
            >
              ×
            </LocalitySearch.ClearButton>
          </InputGroup.Append>
        )}
      </LocalitySearch.InputGroup>
      <LocalitySearch.SubmitButton variant="primary" onClick={props.onEnter}>
        Search
      </LocalitySearch.SubmitButton>
    </Stack>
  );
}

export default SearchBar;
