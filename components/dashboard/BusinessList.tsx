import React, { CSSProperties } from "react";
import { decode } from "html-entities";

import { BaseBusiness } from "common/Schema";
import VirtualList from "components/common/list/VirtualList";
import VirtualListItem from "components/common/list/VirtualListItem";
import Stack from "components/common/Stack";
import styles from "components/dashboard/Business.module.css";

import type { FC, ReactElement } from "react";

export interface BusinessListProps {
  onBusinessClick: (id: number) => void;
  businesses: Array<BaseBusiness>;
  index: number;
  height: number;
  width: number;
  style?: CSSProperties;
}

const BusinessList: FC<BusinessListProps> = (props) => {
  const businessRowRenderer = ({
    index,
    key,
    style,
  }: {
    index: number;
    key: string;
    style: CSSProperties;
  }): ReactElement<HTMLDivElement> => {
    return (
      <div key={key} style={style}>
        <VirtualListItem
          active={props.index === index}
          onClick={(): void => {
            props.onBusinessClick(index);
          }}
          style={{ height: 49 }}
        >
          {decode(props.businesses[index].name)}
        </VirtualListItem>
      </div>
    );
  };

  return (
    <Stack direction="column" rowAlign="flex-start" style={props.style}>
      <h1 className={styles.label}>Business</h1>
      <VirtualList
        width={props.width}
        height={props.height}
        rowHeight={48}
        rowRenderer={businessRowRenderer}
        rowCount={props.businesses.length}
      />
    </Stack>
  );
};

export default BusinessList;
