import ListGroupItem, {
  ListGroupItemProps,
} from "react-bootstrap/ListGroupItem";
import styled from "styled-components";
import styles from "./VirtualList.module.css";

export interface VirtualListItemProps extends ListGroupItemProps {}

function VirtualListItem({ className, ...rest }: VirtualListItemProps) {
  return (
    <ListGroupItem
      {...rest}
      className={`${styles["virtual-list-item"]} ${className}`}
    />
  );
}

export default styled(VirtualListItem)`
  ${({ active }) =>
    active &&
    "background-color: #449ed7 !important; border-color: #449ed7 !important"}
`;
