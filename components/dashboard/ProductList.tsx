import { CSSProperties, ReactNode } from "react";
import { decode } from "html-entities";

import { BaseProduct } from "../common/Schema";
import DescriptionImage from "../common/description-image/DescriptionImage";
import Stack from "../common/Stack";
import VirtualList from "../common/list/VirtualList";
import VirtualListItem from "../common/list/VirtualListItem";

export interface ProductListProps {
  onProductClick: (id: number) => void;
  products: Array<BaseProduct>;
  label: ReactNode;
  index: number;
  height: number;
  width: number;
  style?: CSSProperties;
}

export default function ProductList(props: ProductListProps) {
  const productRowRenderer = ({
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
            props.onProductClick(index);
          }}
          style={{ height: 93, padding: "0px 0px 0px 12px" }}
        >
          <DescriptionImage
            direction="row"
            src={props.products[index].image.replace(
              "/upload",
              "/upload/w_128"
            )}
            loading={index >= 5 ? "lazy" : "eager"}
            spacing={12}
            columnAlign="flex-start"
            rowAlign="center"
            style={{ height: 92 }}
            width={48}
          >
            {decode(props.products[index].name)}
          </DescriptionImage>
        </VirtualListItem>
      </div>
    );
  };

  return (
    <Stack direction="column" rowAlign="flex-start" style={props.style}>
      {props.label}
      <VirtualList
        width={props.width}
        height={props.height}
        rowHeight={92}
        rowRenderer={productRowRenderer}
        rowCount={props.products.length}
      />
    </Stack>
  );
}
