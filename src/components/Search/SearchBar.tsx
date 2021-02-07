import React from "react";
import styled from "styled-components";

import Stack from "../Stack/Stack";

export interface SearchBarProps extends React.HTMLProps<HTMLInputElement> {
  onEnter?: () => void;
}

const StyledInput = styled.input`
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-top: -40px;
  padding: 10px;
  width: ${({ width }) => width}px;
`;

const StyledButton = styled.button`
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-top: -40px;
  padding: 10px;
  @supports (-moz-appearance: none) {
    padding: 9px;
    margin-top: -41px;
  }
`;

function SearchBar(props: SearchBarProps) {
  return (
    <Stack direction="horizontal">
      <StyledInput
        autoFocus
        onChange={props.onChange}
        onKeyPress={(event) => {
          if (event.key === "Enter" && props.onEnter) {
            props.onEnter();
          }
        }}
        placeholder="I want..."
        type="text"
        value={props.value}
        width={props.width}
      />
      <StyledButton onClick={props.onEnter}>Enter</StyledButton>
    </Stack>
  );
}

export default SearchBar;
