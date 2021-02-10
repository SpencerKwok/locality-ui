import React from "react";
import styled from "styled-components";

import Stack from "../Stack/Stack";
import { Button, InputGroup, FormControl } from "react-bootstrap";

export interface SearchBarProps extends React.HTMLProps<HTMLInputElement> {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEnter?: () => void;
}

const StyledInputGroup = styled(InputGroup)`
  input:focus {
    box-shadow: none;
  }
  width: ${({ width }) => width}px;
`;

const StyledButton = styled(Button)`
  padding: 11px;
  background-color: #449ed7;
  border-color: #449ed7;
  :hover {
    background-color: #3880ae;
    border-color: #3880ae;
  }
`;

function SearchBar(props: SearchBarProps) {
  return (
    <Stack
      direction="horizontal"
      spacing={1}
      style={{ marginLeft: (props.width as number) * 0.07 }}
    >
      <StyledInputGroup size="lg" width={props.width}>
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
          type="text"
        />
      </StyledInputGroup>
      <StyledButton variant="primary" onClick={props.onEnter}>
        Search
      </StyledButton>
    </Stack>
  );
}

export default SearchBar;
