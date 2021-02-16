import React from "react";
import styled from "styled-components";

import Stack from "../Stack/Stack";
import { Button, InputGroup, FormControl } from "react-bootstrap";

export interface SearchBarProps extends React.HTMLProps<HTMLInputElement> {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEnter?: () => void;
  onReset?: () => void;
  value: string;
}

const StyledInputGroup = styled(InputGroup)`
  input:focus {
    box-shadow: none;
  }
  &:focus-within {
    border: 1px solid #449ed7 !important;
  }
  border-radius: 0.3rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  width: ${({ width }) => width}px;
`;

const StyledSearchButton = styled(Button)`
  padding: 11px;
  background-color: #449ed7;
  border-color: #449ed7;
  &:link {
    background-color: #449ed7 !important;
    border-color: #449ed7 !important;
  }
  &:visited {
    background-color: #449ed7 !important;
    border-color: #449ed7 !important;
  }
  &:focus {
    background-color: #449ed7 !important;
    border-color: #449ed7 !important;
  }
  &:hover {
    background-color: #3880ae !important;
    border-color: #3880ae !important;
  }
  &:active {
    background-color: #3880ae !important;
    border-color: #3880ae !important;
  }
`;

const StyledClearButton = styled.button`
  background-color: #ffffff;
  border: none !important;
  border-radius: 0.3rem;
  color: #6c757d;
  font-size: 32px;
  margin-bottom: 4px;
  outline: none;
  width: 32px;

  &:link,
  &:visited,
  &:focus,
  &:hover,
  &:active {
    color: #449ed7;
  }
`;

function SearchBar(props: SearchBarProps) {
  return (
    <Stack
      direction="horizontal"
      spacing={1}
      style={{ marginLeft: (props.width as number) * 0.07 }}
    >
      <StyledInputGroup
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
            <StyledClearButton className="close" onClick={props.onReset}>
              ×
            </StyledClearButton>
          </InputGroup.Append>
        )}
      </StyledInputGroup>
      <StyledSearchButton variant="primary" onClick={props.onEnter}>
        Search
      </StyledSearchButton>
    </Stack>
  );
}

export default SearchBar;
