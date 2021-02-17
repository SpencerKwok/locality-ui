import React from "react";

import Stack, { StackDirection } from "../Stack/Stack";

export interface ImageContainerProps extends React.HTMLProps<HTMLElement> {
  direction: StackDirection;
  src: string;
  spacing?: number;
}

function ImageContainer(props: ImageContainerProps) {
  return (
    <Stack
      direction={props.direction}
      spacing={props.spacing}
      rowAlign="center"
      columnAlign="center"
    >
      <picture style={{ margin: 0 }}>
        <source srcSet={props.src} type="image/webp" />
        <img
          src={props.src.replace(".webp", ".jpg")}
          alt={props.name}
          width={props.width}
        />
      </picture>
      <Stack direction="column">{props.children}</Stack>
    </Stack>
  );
}

export default ImageContainer;
