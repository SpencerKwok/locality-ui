import ListGroupItem, {
  ListGroupItemProps,
} from "react-bootstrap/ListGroupItem";
import styled from "styled-components";
import styles from "components/common/list/VirtualList.module.css";

import type { FC } from "react";

export type VirtualListItemProps = ListGroupItemProps;

const VirtualListItem: FC<VirtualListItemProps> = ({
  className,
  style,
  ...rest
}) => {
  return (
    <ListGroupItem
      {...rest}
      className={`${styles["virtual-list-item"]} ${className}`}
      style={style}
    />
  );
};

export default styled(VirtualListItem)`
  ${({ active }): string => {
    if (active === true) {
      return "background-color: #449ed7 !important; border-color: #449ed7 !important";
    }
    return "";
  }}
`;
