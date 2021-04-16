import styled from "styled-components";
import Button, { ButtonProps } from "react-bootstrap/Button";

export interface SearchSubmitButtonProps extends ButtonProps {}

// TODO: Use theme
const SearchSubmitButton = styled(Button)`
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

export default SearchSubmitButton;
