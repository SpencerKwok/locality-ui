import React, { useState } from "react";
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
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [lowResLoaded, setLowResLoaded] = useState(false);

  return (
    <Stack direction="column" rowAlign="flex-start" style={props.style}>
      <span>
        <StyledPicture
          {...((!lowResLoaded || highResLoaded) && {
            style: { display: "none" },
          })}
        >
          <source
            srcSet={props.src.replace("upload/", "upload/w_24/")}
            type="image/webp"
          />
          <img
            alt={props.name}
            loading={"eager"}
            onLoad={() => setLowResLoaded(true)}
            src={props.src.replace(".webp", ".jpg")}
            style={{ filter: "blur(1px)" }}
            width={175}
          />
        </StyledPicture>
        <StyledPicture {...(!highResLoaded && { style: { display: "none" } })}>
          <source
            srcSet={props.src.replace("upload/", "upload/w_400/")}
            type="image/webp"
          />
          <img
            alt={props.name}
            src={props.src.replace(".webp", ".jpg")}
            onLoad={() => setHighResLoaded(true)}
            width={props.width}
          />
        </StyledPicture>
      </span>
      <StyledH4>{props.name}</StyledH4>
    </Stack>
  );
}

export default CompanyImage;
