import styled from "styled-components";
import styles from "components/common/list/VirtualList.module.css";

import type { FC } from "react";

export interface VirtualListItemProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onSelect"> {
  action?: boolean;
  active?: boolean;
  disabled?: boolean;
  eventKey?: number | string;
  href?: string;
  onClick?: React.MouseEventHandler;
}

const VirtualListItem: FC<VirtualListItemProps> = ({
  className,
  style,
  ...rest
}) => {
  return (
    <div
      {...rest}
      className={`${styles["virtual-list-item"]} ${className}`}
      style={style}
    />
  );
};

export default styled(VirtualListItem)`
  ${({ active }): string => {
    if (active === true) {
      return "background-color: #112378; color: #ffffff;";
    }
    return "";
  }}
`;
