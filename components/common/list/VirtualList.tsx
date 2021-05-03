import { List, ListProps } from "react-virtualized";
import styles from "./VirtualList.module.css";

export interface VirtualListProps extends ListProps {}

export default function VirtualLista({ className, ...rest }: VirtualListProps) {
  return (
    <List {...rest} className={`${styles["virtual-list"]} ${className}`} />
  );
}
