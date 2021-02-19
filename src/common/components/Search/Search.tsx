import styled from "styled-components";
import { Button, InputGroup } from "react-bootstrap";

export const SearchInputGroup = styled(InputGroup)`
  input:focus {
    box-shadow: none;
  }
  &:focus-within {
    border: 1px solid #449ed7 !important;
  }
  border-radius: 0.3rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  width: ${({ width }) => (typeof width === "number" ? `${width}px` : width)};
`;

export const SearchSubmitButton = styled(Button)`
  background-color: #449ed7;
  border-color: #449ed7;
  height: 49.9px;
  padding: 11px;

  &:link,
  &:visited,
  &:focus {
    background-color: #449ed7 !important;
    border-color: #449ed7 !important;
  }

  &:hover,
  &:active {
    background-color: #3880ae !important;
    border-color: #3880ae !important;
  }
`;

export const SearchClearButton = styled.button`
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
