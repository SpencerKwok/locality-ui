import React from "react";

import Stack from "../Stack/Stack";

export interface ImageProps extends React.HTMLProps<HTMLDivElement> {
  company: string;
  name: string;
  price: number;
  src: string;
}

function Image(props: ImageProps) {
  return (
    <Stack direction="vertical">
      <img src={props.src} alt={props.name} width={props.width} />
      <h6 style={{ margin: 0 }}>{props.company}</h6>
      <h3 style={{ margin: 0 }}>{props.name}</h3>
      <h4 style={{ margin: 0 }}>${props.price} CAD</h4>
    </Stack>
  );
}

export default Image;
