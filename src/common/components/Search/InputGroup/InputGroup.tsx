import styled from "styled-components";
import InputGroup, { InputGroupProps } from "react-bootstrap/InputGroup";

export interface SearchInputGroupProps extends InputGroupProps {
  width?: number | string;
  style?: React.CSSProperties;
}

// TODO: Use theme
const SearchInputGroup = styled(InputGroup)`
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

export default SearchInputGroup;
