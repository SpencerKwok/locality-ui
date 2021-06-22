import { List, ListProps } from "react-virtualized";
import styles from "components/common/list/VirtualList.module.css";

import type { FC } from "react";

export type VirtualListProps = ListProps;

const VirtualList: FC<VirtualListProps> = ({ className, ...rest }) => {
  return (
    <List {...rest} className={`${styles["virtual-list"]} ${className}`} />
  );
};

export default VirtualList;
