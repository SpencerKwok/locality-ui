import { ListGroup } from "react-bootstrap";
import { List } from "react-virtualized";
import styled from "styled-components";

export const VirtualList = styled(List)`
  border: none;
  outline: none;
`;

export const ListGroupItem = styled(ListGroup.Item)`
  ${({ active }) =>
    active &&
    "background-color: #3880ae !important; border-color: #3880ae !important"}
  &:hover {
    background-color: #449ed7;
    color: #ffffff;
  }
`;