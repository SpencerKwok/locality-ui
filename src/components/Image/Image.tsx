import React from "react";
import styled from "styled-components";

import Stack from "../Stack/Stack";

export interface ImageProps extends React.HTMLProps<HTMLDivElement> {
  company: string;
  name: string;
  price: number;
  src: string;
}

const StyledH4 = styled.h4`
  font-size: 120%;
  margin: 0px;
`;
const StyledH5 = styled.h5`
  font-size: 100%;
  margin: 0px;
`;
const StyledH6 = styled.h6`
  font-size: 80%;
  margin: 4px 0px 0px 0px;
`;

function Image(props: ImageProps) {
  return (
    <div {...props}>
      <Stack direction="vertical" rowAlign="flex-start">
        <img src={props.src} alt={props.name} />
        <StyledH6>{props.company}</StyledH6>
        <StyledH4>{props.name}</StyledH4>
        <StyledH5>${props.price} CAD</StyledH5>
      </Stack>
    </div>
  );
}

export default Image;
