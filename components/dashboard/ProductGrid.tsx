import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import { Grid } from "react-virtualized";
import { CSSProperties, ReactNode } from "react";
import { decode } from "html-entities";

import { BaseProduct } from "common/Schema";
import DescriptionImage from "components/common/description-image/DescriptionImage";
import Stack from "components/common/Stack";
import styles from "components/dashboard/ProductGrid.module.css";

import type { ChangeEvent } from "react";
import type { GridCellProps } from "react-virtualized";

export interface FuseBaseProduct extends BaseProduct {
  index: number;
}

export interface ProductGridProps {
  filter: string;
  products: Array<FuseBaseProduct>;
  label: ReactNode;
  index: number;
  height: number;
  width: number;
  style?: CSSProperties;
  onFilterChange: (value: ChangeEvent<HTMLInputElement>) => void;
  onFilterClear: () => void;
  onProductClick: (id: number) => void;
}

export default function ProductGrid(props: ProductGridProps) {
  const productRenderer = ({
    columnIndex,
    key,
    rowIndex,
    style,
  }: GridCellProps) => {
    const index = rowIndex * 3 + columnIndex;
    if (index >= props.products.length) {
      return <div key={key} style={style} />;
    }

    let name = decode(props.products[index].name);
    if (name.length > 20) {
      name = `${name.substr(0, 18)}...`;
    }

    return (
      <div
        key={key}
        style={{
          ...style,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <DescriptionImage
          direction="column"
          src={props.products[index].preview.replace(
            "/upload",
            "/upload/w_128"
          )}
          loading={index >= 12 ? "lazy" : "eager"}
          spacing={12}
          columnAlign="center"
          rowAlign="center"
          style={{
            height: props.width / 3 - 8,
            width: props.width / 3 - 8,
            cursor: "pointer",
          }}
          height={props.width / 3 - 8}
          width={props.width / 3 - 8}
          onClick={() => {
            props.onProductClick(props.products[index].index);
          }}
        >
          <div style={{ textAlign: "center", width: 175 }}>{name}</div>
        </DescriptionImage>
      </div>
    );
  };

  return (
    <Stack direction="column" rowAlign="flex-start" style={props.style}>
      {props.label}
      <Stack
        direction="row"
        rowAlign="center"
        priority={[0, 1]}
        spacing={12}
        style={{ marginBottom: 4, width: props.width }}
      >
        <span>Filter:</span>
        <InputGroup className={styles["input-group"]}>
          <FormControl
            aria-label="Product Filter"
            aria-describedby="Enter product filter here"
            onChange={props.onFilterChange}
            style={{ border: "none" }}
            type="text"
            value={props.filter}
          />
          {props.filter.length > 0 && (
            <InputGroup.Append>
              <Button
                className={styles["clear-button"]}
                onClick={props.onFilterClear}
              >
                ×
              </Button>
            </InputGroup.Append>
          )}
        </InputGroup>
      </Stack>
      <Grid
        cellRenderer={productRenderer}
        columnCount={3}
        columnWidth={props.width / 3 - 6}
        height={props.height}
        rowCount={Math.ceil(props.products.length / 3)}
        rowHeight={225}
        width={props.width}
        style={{ border: "1px solid #ced4da" }}
      />
    </Stack>
  );
}
