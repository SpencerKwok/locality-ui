import React from "react";

import Stack, { StackDirection, StackAlignment } from "../Stack/Stack";

export interface DescriptionImageProps extends React.HTMLProps<HTMLElement> {
  direction: StackDirection;
  src: string;
  spacing?: number;
  rowAlign?: StackAlignment;
  columnAlign?: StackAlignment;
}

function DescriptionImage(props: DescriptionImageProps) {
  return (
    <Stack
      direction={props.direction}
      spacing={props.spacing}
      rowAlign={props.rowAlign}
      columnAlign={props.columnAlign}
      style={props.style}
    >
      <picture style={{ margin: 0 }}>
        <source srcSet={props.src} type="image/webp" />
        <img
          src={props.src.replace(".webp", ".jpg")}
          alt={props.alt}
          width={props.width}
        />
      </picture>
      <Stack direction="column">{props.children}</Stack>
    </Stack>
  );
}

export default DescriptionImage;
