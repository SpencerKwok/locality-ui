import styled from "styled-components";

export interface SearchClearButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

// TODO: Use theme
const SearchClearButton = styled.button`
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

export default SearchClearButton;
