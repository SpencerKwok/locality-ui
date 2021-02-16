import React from "react";

import Stack, { StackDirection } from "../Stack/Stack";
import Image, { ImageProps } from "./Image";

export interface ImageContainerProps extends ImageProps {
  description: string;
  direction: StackDirection;
  spacing: number;
}

function ImageContainer(props: ImageContainerProps) {
  return (
    <Stack direction={props.direction} spacing={props.spacing}>
      <Image {...props} />
      <p>{props.description}</p>
    </Stack>
  );
}

export default ImageContainer;
