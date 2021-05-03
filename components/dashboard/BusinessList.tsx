import React, { CSSProperties } from "react";
import { decode } from "html-entities";

import { BaseBusiness } from "../common/Schema";
import VirtualList from "../common/list/VirtualList";
import VirtualListItem from "../common/list/VirtualListItem";
import Stack from "../common/Stack";
import styles from "./Business.module.css";

export interface BusinessListProps extends React.HTMLProps<HTMLDivElement> {
  onBusinessClick: (id: number) => void;
  businesses: Array<BaseBusiness>;
  index: number;
  height: number;
  width: number;
}

export default function BusinessList(props: BusinessListProps) {
  const businessRowRenderer = ({
    index,
    key,
    style,
  }: {
    index: number;
    key: string;
    style: CSSProperties;
  }) => {
    return (
      <div key={key} style={style}>
        <VirtualListItem
          active={props.index === index}
          onClick={() => {
            props.onBusinessClick(index);
          }}
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
}