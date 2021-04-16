import React from "react";
import styled from "styled-components";

import Stack from "../Stack/Stack";

export interface CompanyImageProps extends React.HTMLProps<HTMLElement> {
  name: string;
  src: string;
}

const StyledH4 = styled.h4`
  font-size: 16px;
  margin: 0px;
`;

const StyledPicture = styled.picture`
  align-items: center;
  display: flex;
  height: 175px;
  justify-content: center;
  overflow: hidden;
`;

function CompanyImage(props: CompanyImageProps) {
  return (
    <Stack direction="column" rowAlign="flex-start" style={props.style}>
      <span>
        <StyledPicture>
          <img alt={props.name} src={props.src} width={props.width} />
        </StyledPicture>
      </span>
      <StyledH4>{props.name}</StyledH4>
    </Stack>
  );
}

export default CompanyImage;
