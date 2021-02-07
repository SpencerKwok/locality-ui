import React from "react";
import styled from "styled-components";

import Stack from "../Stack/Stack";

export interface SearchBarProps extends React.HTMLProps<HTMLInputElement> {
  onEnter?: () => void;
}

function SearchBar(props: SearchBarProps) {
  const StyledInput = styled.input`
    display: block;
    margin-left: auto;
    margin-right: auto;
    margin-top: -2em;
    padding: 1em;
    width: ${props.width}px;
  `;

  const StyledButton = styled.button`
    display: block;
    margin-left: auto;
    margin-right: auto;
    margin-top: -2.06em;
    padding: 0.94em;
  `;

  return (
    <Stack direction="horizontal">
      <StyledInput
        onChange={props.onChange}
        onKeyPress={(event) => {
          if (event.key === "Enter" && props.onEnter) {
            props.onEnter();
          }
        }}
        value={props.value}
        type="text"
        placeholder="I want..."
        autoFocus
      />
      <StyledButton onClick={props.onEnter}>Enter</StyledButton>
    </Stack>
  );
}

export default SearchBar;
