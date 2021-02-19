import React from "react";
import styled from "styled-components";

import Stack from "../Stack/Stack";

export interface ProductImageProps extends React.HTMLProps<HTMLElement> {
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

const StyledPicture = styled.picture`
  align-items: center;
  display: flex;
  height: 225px;
  justify-content: center;
  overflow: hidden;
`;

function ProductImage(props: ProductImageProps) {
  return (
    <Stack direction="column" rowAlign="flex-start" style={props.style}>
      <StyledPicture>
        <source srcSet={props.src} type="image/webp" />
        <img src={props.src.replace(".webp", ".jpg")} alt={props.name} />
      </StyledPicture>
      <StyledH6>{props.company}</StyledH6>
      <StyledH4>{props.name}</StyledH4>
      <StyledH5>${props.price.toFixed(2)} CAD</StyledH5>
    </Stack>
  );
}

export default ProductImage;